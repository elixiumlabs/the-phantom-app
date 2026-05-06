import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { adminClient } from '../_lib/supabase'
import { ProofType } from '../_lib/schemas'

/**
 * Called by the client after a successful signed upload to create the proof_vault row.
 * The client provides the metadata since Supabase Storage doesn't have an onFinalize trigger.
 */
const Input = z.object({
  user_id: z.string().min(1),
  project_id: z.string().min(1),
  proof_type: ProofType,
  title: z.string().max(160).optional(),
  storage_path: z.string().min(1),
  content_type: z.string().max(200).optional(),
  amount: z.number().nonnegative().optional(),
  source: z.string().max(160).optional(),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Verify the caller is the owner using their JWT
  const { requireAuth } = await import('../_lib/auth')
  let uid: string
  try {
    uid = await requireAuth(req)
  } catch {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const parsed = Input.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message })
  const input = parsed.data

  if (input.user_id !== uid) return res.status(403).json({ error: 'Forbidden' })

  const db = adminClient()

  // Get a public URL for the file
  const { data: urlData } = db.storage.from('proof-vault').getPublicUrl(input.storage_path)

  const { data, error } = await db.from('proof_vault').insert({
    user_id: uid,
    project_id: input.project_id,
    proof_type: input.proof_type,
    title: input.title ?? '',
    content: '',
    file_url: urlData.publicUrl,
    storage_path: input.storage_path,
    amount: input.amount ?? null,
    source: input.source ?? null,
    tags: [],
    content_type: input.content_type ?? null,
  }).select('id').single()

  if (error) return res.status(500).json({ error: 'Failed to create vault record' })

  res.status(200).json({ id: data.id })
}
