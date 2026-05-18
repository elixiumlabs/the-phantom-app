import type { VercelRequest, VercelResponse } from '@vercel/node'
import { gate } from '../_lib/guards'
import { adminClient } from '../_lib/supabase'
import { handleError } from '../_lib/respond'
import { apiError } from '../_lib/auth'

function isMissingSchemaError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const maybe = error as { code?: string; message?: string }
  return maybe.code === 'PGRST205' || /Could not find the table/i.test(maybe.message ?? '')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const uid = await gate(req)
    const db = adminClient()
    const { error } = await db.from('users').update({
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    }).eq('id', uid)
    if (isMissingSchemaError(error)) {
      throw apiError(500, `${error.message} Run the SQL files in supabase/README.md against this Supabase project.`)
    }
    if (error) throw apiError(500, error.message)
    res.status(200).json({ ok: true })
  } catch (err) {
    handleError(res, err)
  }
}
