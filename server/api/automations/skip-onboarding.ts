import type { VercelRequest, VercelResponse } from '@vercel/node'
import { gate } from '../_lib/guards'
import { adminClient } from '../_lib/supabase'
import { handleError } from '../_lib/respond'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const uid = await gate(req)
    const db = adminClient()
    await db.from('users').update({
      onboarding_completed: true,
      onboarding_skipped: true,
      updated_at: new Date().toISOString(),
    }).eq('id', uid)
    res.status(200).json({ ok: true })
  } catch (err) {
    handleError(res, err)
  }
}
