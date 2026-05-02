import * as admin from 'firebase-admin'
import { onCall } from 'firebase-functions/v2/https'
import { z } from 'zod'
import { gate, validate } from '../lib/guards'
import { loadOwnedProject } from '../lib/projectAccess'
import { logActivity } from '../lib/activity'

const Input = z.object({ project_id: z.string().min(1) })

const SUBCOLLECTIONS = ['ghost_identity', 'silent_test', 'iteration_loop', 'lock_in', 'outreach_log', 'iteration_versions', 'insights']

async function deleteCollection(ref: FirebaseFirestore.CollectionReference): Promise<void> {
  const batchSize = 200
  while (true) {
    const snap = await ref.limit(batchSize).get()
    if (snap.empty) return
    const batch = admin.firestore().batch()
    snap.docs.forEach((d) => batch.delete(d.ref))
    await batch.commit()
    if (snap.size < batchSize) return
  }
}

export const deleteProject = onCall({ 
  region: 'us-central1',
  cors: [
    /localhost:\d+$/,
    'https://the-phantom-app-io.web.app',
    'https://the-phantom-app-io.firebaseapp.com',
    'https://the-phantom-app.vercel.app'
  ]
}, async (req) => {
  const uid = await gate(req)
  const { project_id } = validate(Input, req.data)
  const { ref } = await loadOwnedProject(uid, project_id)

  for (const sub of SUBCOLLECTIONS) {
    await deleteCollection(ref.collection(sub))
  }

  // Delete proof_vault items + storage objects associated with this project.
  const vaultSnap = await admin.firestore().collection('proof_vault').where('project_id', '==', project_id).get()
  const vaultBatch = admin.firestore().batch()
  const storagePaths: string[] = []
  vaultSnap.docs.forEach((d) => {
    vaultBatch.delete(d.ref)
    const path = d.data().storage_path as string | undefined
    if (path) storagePaths.push(path)
  })
  if (!vaultSnap.empty) await vaultBatch.commit()
  await Promise.all(
    storagePaths.map((p) => admin.storage().bucket().file(p).delete().catch(() => undefined)),
  )

  await ref.delete()
  await logActivity({ user_id: uid, project_id, action: 'project_deleted' })

  return { ok: true }
})
