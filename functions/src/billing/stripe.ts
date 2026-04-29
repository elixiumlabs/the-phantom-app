import * as admin from 'firebase-admin'
import { onCall, HttpsError, onRequest } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { logger } from 'firebase-functions/v2'
import { z } from 'zod'
import { gate, validate } from '../lib/guards'
import { logActivity } from '../lib/activity'

export const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY')
export const STRIPE_WEBHOOK_SECRET = defineSecret('STRIPE_WEBHOOK_SECRET')
export const APP_URL = defineSecret('APP_URL')

// Price tier mapping (config-driven price IDs to keep the codebase env-agnostic).
export const STRIPE_PRICE_TO_PLAN = defineSecret('STRIPE_PRICE_TO_PLAN')
// Format example: '{"price_phantom_monthly":"phantom","price_phantom_yearly":"phantom","price_pro_monthly":"phantom_pro","price_pro_yearly":"phantom_pro"}'

function getStripe(): import('stripe').Stripe {
  // Lazy import keeps cold start cheap when only generators run.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Stripe = require('stripe') as { default: new (k: string, o?: unknown) => import('stripe').Stripe }
  const ctor = (Stripe as unknown as { default?: typeof Stripe.default }).default ?? (Stripe as unknown as new (k: string, o?: unknown) => import('stripe').Stripe)
  return new ctor(STRIPE_SECRET_KEY.value(), { apiVersion: '2024-06-20' })
}

function priceToPlan(priceId: string): 'phantom' | 'phantom_pro' | null {
  try {
    const map = JSON.parse(STRIPE_PRICE_TO_PLAN.value() || '{}') as Record<string, string>
    const v = map[priceId]
    return v === 'phantom' || v === 'phantom_pro' ? v : null
  } catch {
    return null
  }
}

const CheckoutInput = z.object({
  price_id: z.string().min(1),
  // 'monthly' | 'annual' is implied by the price_id itself.
})

export const createCheckoutSession = onCall(
  { region: 'us-central1', secrets: [STRIPE_SECRET_KEY, APP_URL, STRIPE_PRICE_TO_PLAN] },
  async (req) => {
    const uid = await gate(req)
    const { price_id } = validate(CheckoutInput, req.data)
    if (!priceToPlan(price_id)) throw new HttpsError('invalid-argument', 'Unknown price_id')

    const userRef = admin.firestore().doc(`users/${uid}`)
    const user = (await userRef.get()).data() ?? {}
    const stripe = getStripe()
    const baseUrl = APP_URL.value() || 'https://phantom.app'

    let customerId = user.stripe_customer_id as string | undefined
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { uid },
      })
      customerId = customer.id
      await userRef.set({ stripe_customer_id: customerId }, { merge: true })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: price_id, quantity: 1 }],
      success_url: `${baseUrl}/dashboard?upgraded=1`,
      cancel_url: `${baseUrl}/account/upgrade?canceled=1`,
      allow_promotion_codes: true,
      metadata: { uid },
      subscription_data: { metadata: { uid } },
    })

    return { url: session.url }
  },
)

export const createBillingPortalSession = onCall(
  { region: 'us-central1', secrets: [STRIPE_SECRET_KEY, APP_URL] },
  async (req) => {
    const uid = await gate(req)
    const userSnap = await admin.firestore().doc(`users/${uid}`).get()
    const customerId = userSnap.data()?.stripe_customer_id as string | undefined
    if (!customerId) throw new HttpsError('failed-precondition', 'No Stripe customer on file')
    const stripe = getStripe()
    const baseUrl = APP_URL.value() || 'https://phantom.app'
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/dashboard/billing`,
    })
    return { url: session.url }
  },
)

/**
 * Stripe webhook (raw body, signature verified).
 * Syncs users/{uid}.plan + stripe_customer_id + stripe_subscription_id
 * across the lifecycle: checkout.session.completed, subscription.updated/deleted, invoice.payment_failed.
 */
export const stripeWebhook = onRequest(
  { region: 'us-central1', secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_TO_PLAN] },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('method not allowed')
      return
    }
    const stripe = getStripe()
    const sig = req.headers['stripe-signature']
    if (typeof sig !== 'string') {
      res.status(400).send('missing signature')
      return
    }
    let event
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, STRIPE_WEBHOOK_SECRET.value())
    } catch (err) {
      logger.warn('Stripe webhook signature failed', { error: (err as Error).message })
      res.status(400).send(`webhook error: ${(err as Error).message}`)
      return
    }

    const db = admin.firestore()

    async function syncFromSubscription(uid: string, sub: import('stripe').Stripe.Subscription) {
      const priceId = sub.items.data[0]?.price.id
      const targetPlan: 'free' | 'phantom' | 'phantom_pro' =
        sub.status === 'active' || sub.status === 'trialing'
          ? priceToPlan(priceId ?? '') ?? 'free'
          : 'free'
      await db.doc(`users/${uid}`).set(
        {
          plan: targetPlan,
          stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
          stripe_subscription_id: sub.id,
          subscription_status: sub.status,
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      )
      await logActivity({ user_id: uid, action: 'plan_changed', metadata: { plan: targetPlan, status: sub.status } })
    }

    async function uidFromCustomer(customerId: string): Promise<string | null> {
      const snap = await db.collection('users').where('stripe_customer_id', '==', customerId).limit(1).get()
      return snap.docs[0]?.id ?? null
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as import('stripe').Stripe.Checkout.Session
          const uid = (session.metadata?.uid as string | undefined) ?? null
          if (uid && session.subscription) {
            const sub = await stripe.subscriptions.retrieve(session.subscription as string)
            await syncFromSubscription(uid, sub)
          }
          break
        }
        case 'customer.subscription.updated':
        case 'customer.subscription.created': {
          const sub = event.data.object as import('stripe').Stripe.Subscription
          const uid = (sub.metadata?.uid as string | undefined) ?? (await uidFromCustomer(sub.customer as string))
          if (uid) await syncFromSubscription(uid, sub)
          break
        }
        case 'customer.subscription.deleted': {
          const sub = event.data.object as import('stripe').Stripe.Subscription
          const uid = (sub.metadata?.uid as string | undefined) ?? (await uidFromCustomer(sub.customer as string))
          if (uid) {
            await db.doc(`users/${uid}`).set(
              {
                plan: 'free',
                subscription_status: 'canceled',
                stripe_subscription_id: null,
                updated_at: admin.firestore.FieldValue.serverTimestamp(),
              },
              { merge: true },
            )
            await logActivity({ user_id: uid, action: 'plan_changed', metadata: { plan: 'free', status: 'canceled' } })
          }
          break
        }
        case 'invoice.payment_failed': {
          const invoice = event.data.object as import('stripe').Stripe.Invoice
          const uid = await uidFromCustomer(invoice.customer as string)
          if (uid) {
            await db.doc(`users/${uid}`).set(
              { subscription_status: 'past_due', updated_at: admin.firestore.FieldValue.serverTimestamp() },
              { merge: true },
            )
          }
          break
        }
        default:
          // Ignore other events.
          break
      }
      res.status(200).send('ok')
    } catch (err) {
      logger.error('Stripe webhook handler error', { type: event.type, error: (err as Error).message })
      res.status(500).send('handler error')
    }
  },
)
