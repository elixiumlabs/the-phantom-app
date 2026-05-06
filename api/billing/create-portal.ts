import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { gate } from '../_lib/guards'
import { adminClient } from '../_lib/supabase'
import { handleError } from '../_lib/respond'
import { apiError } from '../_lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const uid = await gate(req)
    const db = adminClient()
    const { data: user } = await db.from('users').select('stripe_customer_id').eq('id', uid).single()
    const customerId = user?.stripe_customer_id as string | undefined
    if (!customerId) throw apiError(412, 'No Stripe customer on file')

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })
    const baseUrl = process.env.APP_URL || 'https://phantom.app'
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/dashboard/billing`,
    })

    res.status(200).json({ url: session.url })
  } catch (err) {
    handleError(res, err)
  }
}
