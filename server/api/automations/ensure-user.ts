import type { VercelRequest, VercelResponse } from '@vercel/node'
import { gate, type Plan } from '../_lib/guards'
import { adminClient } from '../_lib/supabase'
import { handleError } from '../_lib/respond'
import { apiError } from '../_lib/auth'

const FOUNDER_EMAIL = 'brandsbyempress@gmail.com'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const uid = await gate(req)
    const db = adminClient()

    const { data: existing, error: existingError } = await db
      .from('users')
      .select('*')
      .eq('id', uid)
      .maybeSingle()

    if (existingError) throw apiError(500, existingError.message)
    if (existing) return res.status(200).json({ profile: existing })

    const { data: authUser, error: authError } = await db.auth.admin.getUserById(uid)
    if (authError || !authUser.user) throw apiError(404, 'Auth user not found')

    const email = authUser.user.email ?? ''
    const isFounder = email.toLowerCase() === FOUNDER_EMAIL
    const now = new Date().toISOString()

    const payload = {
      id: uid,
      email,
      full_name: authUser.user.user_metadata?.full_name ?? authUser.user.user_metadata?.name ?? null,
      avatar_url: authUser.user.user_metadata?.avatar_url ?? null,
      plan: (isFounder ? 'phantom_pro' : 'free') as Plan,
      is_admin: isFounder,
      lifetime: isFounder,
      subscription_status: isFounder ? 'lifetime' : null,
      onboarding_completed: false,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      created_at: authUser.user.created_at ?? now,
      updated_at: now,
    }

    const { data: created, error: createError } = await db
      .from('users')
      .upsert(payload, { onConflict: 'id' })
      .select('*')
      .single()

    if (createError || !created) throw apiError(500, createError?.message ?? 'Could not create user profile')
    res.status(200).json({ profile: created })
  } catch (err) {
    handleError(res, err)
  }
}
