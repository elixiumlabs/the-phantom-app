import type { VercelRequest, VercelResponse } from '@vercel/node'
import { gate } from '../_lib/guards'
import { adminClient } from '../_lib/supabase'
import { handleError } from '../_lib/respond'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const uid = await gate(req)
    const db = adminClient()
    const webhookKey = crypto.randomUUID().replace(/-/g, '')
    const origin = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://the-phantom-app.vercel.app'

    await db.from('users').update({
      webhook_key: webhookKey,
      webhook_key_generated_at: new Date().toISOString(),
    }).eq('id', uid)

    res.status(200).json({
      webhook_key: webhookKey,
      webhook_url: `${origin}/api/webhooks/proof`,
      message: 'Webhook key generated',
    })
  } catch (err) {
    handleError(res, err)
  }
}

