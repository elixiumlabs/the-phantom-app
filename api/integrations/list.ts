import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { gate, verifyProjectOwnership } from '../_lib/guards'
import { adminClient } from '../_lib/supabase'
import { handleError } from '../_lib/respond'
import { apiError } from '../_lib/auth'

const Input = z.object({ project_id: z.string().min(1) })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const uid = await gate(req)
    const parsed = Input.safeParse(req.body)
    if (!parsed.success) throw apiError(400, parsed.error.issues[0].message)
    const { project_id } = parsed.data

    await verifyProjectOwnership(uid, project_id)
    const db = adminClient()
    const { data } = await db
      .from('integrations')
      .select('platform, connected_at, status')
      .eq('project_id', project_id)

    res.status(200).json({
      integrations: (data ?? []).map(row => ({
        platform: row.platform,
        connected_at: row.connected_at ?? '',
        status: row.status ?? 'active',
      })),
    })
  } catch (err) {
    handleError(res, err)
  }
}
