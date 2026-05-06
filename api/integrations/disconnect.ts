import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { gate, verifyProjectOwnership } from '../_lib/guards'
import { adminClient } from '../_lib/supabase'
import { handleError } from '../_lib/respond'
import { apiError } from '../_lib/auth'

const Input = z.object({
  platform: z.enum(['typeform', 'stripe', 'calendly', 'gumroad']),
  project_id: z.string().min(1),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const uid = await gate(req)
    const parsed = Input.safeParse(req.body)
    if (!parsed.success) throw apiError(400, parsed.error.issues[0].message)
    const { platform, project_id } = parsed.data

    await verifyProjectOwnership(uid, project_id)
    const db = adminClient()
    await db.from('integrations').delete().eq('project_id', project_id).eq('platform', platform)

    res.status(200).json({ success: true })
  } catch (err) {
    handleError(res, err)
  }
}
