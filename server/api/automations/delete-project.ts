import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { gate, verifyProjectOwnership } from '../_lib/guards'
import { logActivity } from '../_lib/activity'
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

    // Delete proof vault items
    const { data: vaultItems } = await db
      .from('proof_vault')
      .select('id, storage_path')
      .eq('project_id', project_id)

    if (vaultItems?.length) {
      await db.from('proof_vault').delete().eq('project_id', project_id)
      // Storage files would be cleaned up via Supabase storage API if needed
    }

    // Delete phase tables (cascade via FK if set, otherwise manually)
    await Promise.all([
      db.from('ghost_identity').delete().eq('project_id', project_id),
      db.from('silent_test').delete().eq('project_id', project_id),
      db.from('iteration_loop').delete().eq('project_id', project_id),
      db.from('lock_in').delete().eq('project_id', project_id),
      db.from('outreach_log').delete().eq('project_id', project_id),
      db.from('iteration_versions').delete().eq('project_id', project_id),
      db.from('generations').delete().eq('project_id', project_id),
      db.from('insights').delete().eq('project_id', project_id),
      db.from('integrations').delete().eq('project_id', project_id),
    ])

    await db.from('projects').delete().eq('id', project_id)
    await logActivity({ user_id: uid, project_id, action: 'project_deleted' })

    res.status(200).json({ ok: true })
  } catch (err) {
    handleError(res, err)
  }
}
