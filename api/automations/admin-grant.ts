import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { requireAuth } from '../_lib/auth'
import { adminClient } from '../_lib/supabase'
import { handleError } from '../_lib/respond'
import { apiError } from '../_lib/auth'

// Supabase user IDs of admins
const ADMIN_EMAILS = new Set(['brandsbyempress@gmail.com'])

const Input = z.object({
  uid: z.string().min(1).optional(),
  plan: z.enum(['phantom', 'phantom_pro']).default('phantom_pro'),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const callerUid = await requireAuth(req)
    const db = adminClient()
    const { data: caller } = await db.from('users').select('email, is_admin').eq('id', callerUid).single()
    if (!caller?.is_admin && !ADMIN_EMAILS.has(caller?.email ?? '')) {
      throw apiError(403, 'Admin only')
    }

    const parsed = Input.safeParse(req.body ?? {})
    if (!parsed.success) throw apiError(400, parsed.error.issues[0].message)
    const { uid: targetUid, plan } = parsed.data
    const finalTarget = targetUid ?? callerUid

    await db.from('users').update({
      plan,
      is_admin: true,
      lifetime: true,
      subscription_status: 'lifetime',
      updated_at: new Date().toISOString(),
    }).eq('id', finalTarget)

    res.status(200).json({ ok: true, uid: finalTarget, plan })
  } catch (err) {
    handleError(res, err)
  }
}
