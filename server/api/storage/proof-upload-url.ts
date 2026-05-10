import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { gate, enforceFreeLimit, verifyProjectOwnership } from '../_lib/guards'
import { adminClient } from '../_lib/supabase'
import { handleError } from '../_lib/respond'
import { apiError } from '../_lib/auth'
import { ProofType } from '../_lib/schemas'

const Input = z.object({
  project_id: z.string().min(1),
  proof_type: ProofType,
  filename: z.string().min(1).max(200),
  content_type: z.string().min(1).max(200),
  title: z.string().max(160).optional(),
  amount: z.number().nonnegative().optional(),
  source: z.string().max(160).optional(),
})

const ALLOWED = /^(image\/.+|application\/pdf|text\/csv)$/

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const uid = await gate(req)
    const parsed = Input.safeParse(req.body)
    if (!parsed.success) throw apiError(400, parsed.error.issues[0].message)
    const input = parsed.data

    if (!ALLOWED.test(input.content_type)) throw apiError(400, `Unsupported content type: ${input.content_type}`)

    await verifyProjectOwnership(uid, input.project_id)

    const db = adminClient()
    const { count } = await db
      .from('proof_vault')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', uid)
    await enforceFreeLimit(uid, 'vault_items', count ?? 0)

    // Generate a unique item id for the storage path
    const itemId = crypto.randomUUID()
    const storagePath = `${uid}/proof/${itemId}/${input.filename}`

    // Create signed upload URL via Supabase Storage
    const { data: signedData, error: signedError } = await db.storage
      .from('proof-vault')
      .createSignedUploadUrl(storagePath)

    if (signedError || !signedData) throw apiError(500, 'Failed to create upload URL')

    res.status(200).json({
      upload_url: signedData.signedUrl,
      storage_path: storagePath,
      item_id: itemId,
      token: signedData.token,
    })
  } catch (err) {
    handleError(res, err)
  }
}
