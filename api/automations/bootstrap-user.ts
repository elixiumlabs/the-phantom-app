import type { VercelRequest, VercelResponse } from '@vercel/node'

const FOUNDER_EMAIL = 'brandsbyempress@gmail.com'

/**
 * Called by a Supabase Auth webhook (post-signup) to create the users row.
 * Supabase Auth → Database webhook → POST /api/automations/bootstrap-user
 *
 * Set the webhook secret in Supabase dashboard and match SUPABASE_WEBHOOK_SECRET here.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const secret = req.headers['x-webhook-secret']
  if (secret !== process.env.SUPABASE_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const body = req.body as { record?: { id: string; email?: string; raw_user_meta_data?: Record<string, string>; created_at?: string } }
    const user = body.record
    if (!user?.id) return res.status(400).json({ error: 'Missing user record' })

    const { adminClient } = await import('../_lib/supabase')
    const db = adminClient()
    const isFounder = user.email?.toLowerCase() === FOUNDER_EMAIL
    const now = new Date().toISOString()

    await db.from('users').upsert({
      id: user.id,
      email: user.email ?? null,
      full_name: user.raw_user_meta_data?.full_name ?? null,
      avatar_url: user.raw_user_meta_data?.avatar_url ?? null,
      plan: isFounder ? 'phantom_pro' : 'free',
      is_admin: isFounder,
      lifetime: isFounder,
      subscription_status: isFounder ? 'lifetime' : null,
      onboarding_completed: false,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      created_at: user.created_at ?? now,
      updated_at: now,
    }, { onConflict: 'id', ignoreDuplicates: true })

    await db.from('activity_log').insert({
      user_id: user.id,
      project_id: null,
      action: 'user_created',
      metadata: { is_founder: isFounder },
    })

    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('bootstrap-user error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
