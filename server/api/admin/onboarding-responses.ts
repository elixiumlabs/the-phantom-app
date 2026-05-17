import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth } from '../_lib/auth'
import { adminClient } from '../_lib/supabase'
import { handleError } from '../_lib/respond'
import { apiError } from '../_lib/auth'

const ADMIN_EMAILS = new Set(['brandsbyempress@gmail.com'])

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const callerUid = await requireAuth(req)
    const db = adminClient()

    const { data: caller } = await db
      .from('users')
      .select('email, is_admin')
      .eq('id', callerUid)
      .single()

    if (!caller?.is_admin && !ADMIN_EMAILS.has(caller?.email ?? '')) {
      throw apiError(403, 'Admin only')
    }

    const { data, error } = await db
      .from('onboarding_responses')
      .select(`
        id,
        user_id,
        project_id,
        what_building,
        user_type,
        built_in_public,
        history_note,
        refined_problem,
        suggested_name,
        created_at,
        users (
          email,
          full_name,
          plan,
          onboarding_completed,
          created_at
        ),
        projects (
          name,
          status,
          current_phase
        )
      `)
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) throw apiError(500, error.message)

    res.status(200).json({ responses: data ?? [] })
  } catch (err) {
    handleError(res, err)
  }
}
