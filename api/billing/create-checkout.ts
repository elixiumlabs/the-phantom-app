import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { z } from 'zod'
import { gate } from '../_lib/guards'
import { adminClient } from '../_lib/supabase'
import { handleError } from '../_lib/respond'
import { apiError } from '../_lib/auth'

const Input = z.object({ price_id: z.string().min(1) })

function priceToPlan(priceId: string): 'phantom' | 'phantom_pro' | null {
  try {
    const map = JSON.parse(process.env.STRIPE_PRICE_TO_PLAN ?? '{}') as Record<string, string>
    const v = map[priceId]
    return v === 'phantom' || v === 'phantom_pro' ? v : null
  } catch {
    return null
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const uid = await gate(req)
    const parsed = Input.safeParse(req.body)
    if (!parsed.success) throw apiError(400, parsed.error.issues[0].message)
    const { price_id } = parsed.data
    if (!priceToPlan(price_id)) throw apiError(400, 'Unknown price_id')

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' })
    const db = adminClient()
    const { data: user } = await db.from('users').select('email, stripe_customer_id').eq('id', uid).single()
    const baseUrl = process.env.APP_URL || 'https://phantom.app'

    let customerId = user?.stripe_customer_id as string | undefined
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user?.email ?? undefined, metadata: { uid } })
      customerId = customer.id
      await db.from('users').update({ stripe_customer_id: customerId }).eq('id', uid)
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

    res.status(200).json({ url: session.url })
  } catch (err) {
    handleError(res, err)
  }
}
