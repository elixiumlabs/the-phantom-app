import * as admin from 'firebase-admin'
import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { logActivity } from '../lib/activity'

/**
 * Auto-number iteration versions per project transactionally.
 * Also enforces the single-variable discipline by flagging multi-variable entries.
 */
export const numberIterationVersion = onDocumentCreated(
  { document: 'projects/{projectId}/iteration_versions/{versionId}', region: 'us-central1' },
  async (event) => {
    const projectId = event.params.projectId
    const versionId = event.params.versionId
    if (!event.data) return

    const data = event.data.data() as { single_variable?: boolean; version_number?: number; flags?: string[] }
    const projectRef = admin.firestore().doc(`projects/${projectId}`)
    const versionRef = projectRef.collection('iteration_versions').doc(versionId)

    await admin.firestore().runTransaction(async (tx) => {
      const counterRef = projectRef.collection('iteration_versions').doc('_counter')
      const counterSnap = await tx.get(counterRef)
      const next = ((counterSnap.data()?.value as number) ?? 0) + 1
      tx.set(counterRef, { value: next }, { merge: true })

      const flags: string[] = Array.isArray(data.flags) ? data.flags.slice() : []
      if (data.single_variable === false) flags.push('multi_variable_warning')

      tx.update(versionRef, {
        version_number: next,
        flags,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      })
    })

    const projectSnap = await projectRef.get()
    const uid = projectSnap.data()?.user_id
    if (uid) {
      await logActivity({
        user_id: uid,
        project_id: projectId,
        action: 'iteration_logged',
        metadata: { single_variable: data.single_variable !== false },
      })
    }
  },
)
