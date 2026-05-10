import type { IncomingMessage } from 'http'
import { requireAuth, getUserPlan, requirePlan, apiError, type Plan } from './auth'
import { rateLimit } from './rateLimit'
import { FREE_LIMITS } from './schemas'
import { adminClient } from './supabase'

export type { Plan }
export { requirePlan }

export async function gate(req: IncomingMessage): Promise<string> {
  const uid = await requireAuth(req)
  await rateLimit(uid)
  return uid
}

export async function enforceFreeLimit(
  uid: string,
  key: keyof typeof FREE_LIMITS,
  current: number,
): Promise<void> {
  const plan = await getUserPlan(uid)
  if (plan !== 'free') return
  const limit = FREE_LIMITS[key]
  if (current >= limit) {
    throw apiError(403, `Free plan limit reached (${key}: ${limit}). Upgrade to PHANTOM for unlimited.`)
  }
}

export async function meterUsage(uid: string, key: string, dailyLimit: number): Promise<void> {
  const db = adminClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data, error } = await db
    .from('ai_usage')
    .select('id, count')
    .eq('user_id', uid)
    .eq('day', today)
    .eq('generator', key)
    .maybeSingle()

  if (error) throw apiError(500, 'Usage meter check failed')

  const current = data?.count ?? 0
  if (current >= dailyLimit) {
    throw apiError(429, `Daily limit reached for ${key} (${dailyLimit})`)
  }

  if (data) {
    await db.from('ai_usage').update({ count: current + 1 }).eq('id', data.id)
  } else {
    await db.from('ai_usage').insert({ user_id: uid, day: today, generator: key, count: 1 })
  }
}

export async function verifyProjectOwnership(uid: string, projectId: string): Promise<Record<string, unknown>> {
  const db = adminClient()
  const { data, error } = await db.from('projects').select('*').eq('id', projectId).single()
  if (error || !data) throw apiError(404, 'Project not found')
  if (data.user_id !== uid) throw apiError(403, 'Not your project')
  return data as Record<string, unknown>
}
