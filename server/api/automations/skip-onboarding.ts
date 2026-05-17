import type { VercelRequest, VercelResponse } from '@vercel/node'
import { gate } from '../_lib/guards'
import { adminClient } from '../_lib/supabase'
import { handleError } from '../_lib/respond'
import { apiError } from '../_lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const uid = await gate(req)
    const db = adminClient()
    const { error } = await db.from('users').update({
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    }).eq('id', uid)
    if (error) throw apiError(500, error.message)
    res.status(200).json({ ok: true })
  } catch (err) {
    handleError(res, err)
  }
}
