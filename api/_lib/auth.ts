import type { IncomingMessage } from 'http'
import { adminClient, type Plan } from './supabase'

export interface AuthContext {
  uid: string
  plan: Plan
}

function extractToken(req: IncomingMessage): string | null {
  const auth = (req as unknown as { headers: Record<string, string> }).headers['authorization'] ?? ''
  if (!auth.startsWith('Bearer ')) return null
  return auth.slice(7)
}

export async function requireAuth(req: IncomingMessage): Promise<string> {
  const token = extractToken(req)
  if (!token) throw apiError(401, 'Sign in required')
  const db = adminClient()
  const { data, error } = await db.auth.getUser(token)
  if (error || !data.user) throw apiError(401, 'Invalid or expired session')
  return data.user.id
}

export async function getUserPlan(uid: string): Promise<Plan> {
  const db = adminClient()
  const { data } = await db.from('users').select('plan').eq('id', uid).single()
  return (data?.plan as Plan) ?? 'free'
}

export async function requirePlan(uid: string, allowed: Plan[]): Promise<Plan> {
  const plan = await getUserPlan(uid)
  if (!allowed.includes(plan)) {
    throw apiError(403, `This requires ${allowed.join(' or ')}. Current plan: ${plan}`)
  }
  return plan
}

export function apiError(status: number, message: string): ApiError {
  const err = new Error(message) as ApiError
  err.status = status
  return err
}

export interface ApiError extends Error {
  status: number
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof Error && 'status' in err
}
