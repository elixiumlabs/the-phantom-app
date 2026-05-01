import * as admin from 'firebase-admin'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { onObjectFinalized } from 'firebase-functions/v2/storage'
import { z } from 'zod'
import { gate, validate, enforceFreeLimit } from '../lib/guards'
import { ProofType } from '../lib/schemas'

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

/**
 * Issue a v4 signed upload URL after server-side checks:
 *  - file type allowlist
 *  - free-tier vault cap
 *  - project ownership
 *
 * Client uploads directly to Storage; the onFinalize trigger creates the
 * proof_vault doc once the bytes are in the bucket.
 */
export const requestProofUploadUrl = onCall({ 
  region: 'us-central1',
  cors: [/localhost:\d+$/, 'https://the-phantom-app-io.web.app', 'https://the-phantom-app-io.firebaseapp.com']
}, async (req) => {
  const uid = await gate(req)
  const input = validate(Input, req.data)
  if (!ALLOWED.test(input.content_type)) {
    throw new HttpsError('invalid-argument', `Unsupported content type: ${input.content_type}`)
  }

  const projectSnap = await admin.firestore().doc(`projects/${input.project_id}`).get()
  if (!projectSnap.exists || projectSnap.data()?.user_id !== uid) {
    throw new HttpsError('permission-denied', 'Project access denied')
  }

  const vaultCount = (
    await admin.firestore().collection('proof_vault').where('user_id', '==', uid).count().get()
  ).data().count
  await enforceFreeLimit(uid, 'vault_items', vaultCount)

  const itemId = admin.firestore().collection('_').doc().id
  const path = `users/${uid}/proof/${itemId}/${input.filename}`
  const file = admin.storage().bucket().file(path)
  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000,
    contentType: input.content_type,
    extensionHeaders: {
      'x-goog-meta-uid': uid,
      'x-goog-meta-project-id': input.project_id,
      'x-goog-meta-proof-type': input.proof_type,
      'x-goog-meta-title': input.title ?? '',
      'x-goog-meta-source': input.source ?? '',
      'x-goog-meta-amount': input.amount != null ? String(input.amount) : '',
    },
  })

  return { upload_url: url, storage_path: path, item_id: itemId }
})

/**
 * Storage onFinalize trigger: when a file lands under users/{uid}/proof/...,
 * create the corresponding proof_vault doc using metadata the client set
 * via the signed-URL extension headers.
 */
export const onProofFileFinalized = onObjectFinalized(
  { region: 'us-east1', bucket: undefined },
  async (event) => {
    const path = event.data.name
    if (!path?.startsWith('users/')) return
    if (!/^users\/[^/]+\/proof\/[^/]+\//.test(path)) return

    const meta = event.data.metadata ?? {}
    const uid = meta.uid as string | undefined
    const projectId = meta['project-id'] as string | undefined
    const proofType = meta['proof-type'] as string | undefined
    if (!uid || !projectId || !proofType) return

    await admin.firestore().collection('proof_vault').add({
      user_id: uid,
      project_id: projectId,
      proof_type: proofType,
      title: (meta.title as string) || '',
      content: '',
      file_url: `gs://${event.data.bucket}/${path}`,
      storage_path: path,
      amount: meta.amount ? Number(meta.amount) : null,
      source: (meta.source as string) || null,
      tags: [],
      content_type: event.data.contentType ?? null,
      size: event.data.size ?? null,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    })
  },
)
