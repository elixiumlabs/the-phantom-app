import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { adminClient } from '../_lib/supabase'

const Input = z.object({
  webhook_key: z.string().min(16),
  project_id: z.string().optional(),
  proof_type: z.string().default('testimonial'),
  title: z.string().optional(),
  content: z.string().optional(),
  source: z.string().optional(),
  amount: z.number().optional(),
  date: z.string().optional(),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const parsed = Input.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message })

  const input = parsed.data
  const db = adminClient()
  const { data: user } = await db.from('users').select('id').eq('webhook_key', input.webhook_key).single()
  if (!user) return res.status(401).json({ error: 'Invalid webhook key' })

  let projectId = input.project_id
  if (!projectId) {
    const { data: project } = await db.from('projects').select('id').eq('user_id', user.id).eq('status', 'active').limit(1).single()
    projectId = project?.id
  }
  if (!projectId) return res.status(400).json({ error: 'No project_id provided and no active project found' })

  const { data, error } = await db.from('proof_vault').insert({
    user_id: user.id,
    project_id: projectId,
    proof_type: input.proof_type,
    title: input.title ?? input.source ?? 'Imported proof',
    content: input.content ?? '',
    source: input.source ?? null,
    amount: input.amount ?? null,
    date: input.date ?? null,
    tags: ['webhook'],
  }).select('id').single()

  if (error) return res.status(500).json({ error: 'Failed to save proof' })
  res.status(200).json({ ok: true, id: data.id })
}

