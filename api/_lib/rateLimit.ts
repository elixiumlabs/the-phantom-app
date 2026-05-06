import { adminClient } from './supabase'
import { apiError } from './auth'

export async function rateLimit(uid: string, limit = 100, windowMs = 60_000): Promise<void> {
  const db = adminClient()
  const now = Date.now()

  const { data, error } = await db
    .from('rate_limits')
    .select('window_start, count')
    .eq('user_id', uid)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows, that's fine
    throw apiError(500, 'Rate limit check failed')
  }

  const windowStart = data?.window_start ? new Date(data.window_start).getTime() : 0
  const count = data?.count ?? 0

  if (now - windowStart < windowMs) {
    if (count >= limit) throw apiError(429, `Rate limit exceeded (${limit}/min). Slow down.`)
    await db
      .from('rate_limits')
      .upsert({ user_id: uid, window_start: data?.window_start, count: count + 1, updated_at: new Date().toISOString() })
  } else {
    await db
      .from('rate_limits')
      .upsert({ user_id: uid, window_start: new Date(now).toISOString(), count: 1, updated_at: new Date().toISOString() })
  }
}
