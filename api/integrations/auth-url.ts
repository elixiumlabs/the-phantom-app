import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { gate, verifyProjectOwnership } from '../_lib/guards'
import { handleError } from '../_lib/respond'
import { apiError } from '../_lib/auth'

const Input = z.object({
  platform: z.enum(['typeform', 'stripe', 'calendly', 'gumroad']),
  project_id: z.string().min(1),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const uid = await gate(req)
    const parsed = Input.safeParse(req.body)
    if (!parsed.success) throw apiError(400, parsed.error.issues[0].message)
    const { platform, project_id } = parsed.data

    await verifyProjectOwnership(uid, project_id)

    const state = Buffer.from(JSON.stringify({ uid, project_id, platform, timestamp: Date.now() })).toString('base64url')
    const callbackBase = `${process.env.APP_URL ?? 'https://phantom.app'}/api/integrations/callback`

    let authUrl = ''
    switch (platform) {
      case 'typeform': {
        const clientId = process.env.TYPEFORM_CLIENT_ID
        if (!clientId) throw apiError(503, 'Typeform not configured')
        authUrl = `https://api.typeform.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackBase)}&scope=${encodeURIComponent('forms:read responses:read')}&state=${state}`
        break
      }
      case 'stripe': {
        const clientId = process.env.STRIPE_CLIENT_ID
        if (!clientId) throw apiError(503, 'Stripe Connect not configured')
        authUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${clientId}&scope=read_only&redirect_uri=${encodeURIComponent(callbackBase)}&state=${state}`
        break
      }
      case 'calendly': {
        const clientId = process.env.CALENDLY_CLIENT_ID
        if (!clientId) throw apiError(503, 'Calendly not configured')
        authUrl = `https://auth.calendly.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(callbackBase)}&state=${state}`
        break
      }
      case 'gumroad':
        throw apiError(501, 'Gumroad uses API key authentication. Use settings page.')
    }

    res.status(200).json({ auth_url: authUrl })
  } catch (err) {
    handleError(res, err)
  }
}
