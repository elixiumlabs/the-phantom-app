import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { logActivity } from '../_lib/activity'
import { adminClient } from '../_lib/supabase'

function priceToPlan(priceId: string): 'phantom' | 'phantom_pro' | null {
  try {
    const map = JSON.parse(process.env.STRIPE_PRICE_TO_PLAN ?? '{}') as Record<string, string>
    const v = map[priceId]
    return v === 'phantom' || v === 'phantom_pro' ? v : null
  } catch {
    return null
  }
}

export const config = { api: { bodyParser: false } }

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('method not allowed')

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })
  const sig = req.headers['stripe-signature']
  if (typeof sig !== 'string') return res.status(400).send('missing signature')

  const rawBody = await getRawBody(req)
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.warn('Stripe webhook signature failed', (err as Error).message)
    return res.status(400).send(`webhook error: ${(err as Error).message}`)
  }

  const db = adminClient()

  async function syncFromSubscription(uid: string, sub: Stripe.Subscription) {
    const priceId = sub.items.data[0]?.price.id
    const targetPlan: 'free' | 'phantom' | 'phantom_pro' =
      sub.status === 'active' || sub.status === 'trialing' ? priceToPlan(priceId ?? '') ?? 'free' : 'free'
    await db.from('users').update({
      plan: targetPlan,
      stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
      stripe_subscription_id: sub.id,
      subscription_status: sub.status,
      updated_at: new Date().toISOString(),
    }).eq('id', uid)
    await logActivity({ user_id: uid, action: 'plan_changed', metadata: { plan: targetPlan, status: sub.status } })
  }

  async function uidFromCustomer(customerId: string): Promise<string | null> {
    const { data } = await db.from('users').select('id').eq('stripe_customer_id', customerId).limit(1).single()
    return data?.id ?? null
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const uid = session.metadata?.uid ?? null
        if (uid && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string)
          await syncFromSubscription(uid, sub)
        }
        break
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const sub = event.data.object as Stripe.Subscription
        const uid = sub.metadata?.uid ?? (await uidFromCustomer(sub.customer as string))
        if (uid) await syncFromSubscription(uid, sub)
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const uid = sub.metadata?.uid ?? (await uidFromCustomer(sub.customer as string))
        if (uid) {
          await db.from('users').update({
            plan: 'free',
            subscription_status: 'canceled',
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          }).eq('id', uid)
          await logActivity({ user_id: uid, action: 'plan_changed', metadata: { plan: 'free', status: 'canceled' } })
        }
        break
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const uid = await uidFromCustomer(invoice.customer as string)
        if (uid) {
          await db.from('users').update({ subscription_status: 'past_due', updated_at: new Date().toISOString() }).eq('id', uid)
        }
        break
      }
    }
    res.status(200).send('ok')
  } catch (err) {
    console.error('Stripe webhook handler error', { type: event.type, error: (err as Error).message })
    res.status(500).send('handler error')
  }
}
