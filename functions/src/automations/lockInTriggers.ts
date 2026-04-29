import * as admin from 'firebase-admin'
import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import { logActivity } from '../lib/activity'
import { RESEND_API_KEY, sendMail } from '../lib/mailer'

/**
 * When all 6 lock-in checklist items become true, flip project.ready_to_surface
 * and fire the surface email exactly once.
 */
export const detectReadyToSurface = onDocumentWritten(
  { document: 'projects/{projectId}/lock_in/{docId}', region: 'us-central1', secrets: [RESEND_API_KEY] },
  async (event) => {
    const after = event.data?.after?.data() as { checklist?: Record<string, boolean> } | undefined
    if (!after?.checklist) return
    const allDone = Object.values(after.checklist).every((v) => v === true) && Object.keys(after.checklist).length >= 6
    if (!allDone) return

    const projectId = event.params.projectId
    const projectRef = admin.firestore().doc(`projects/${projectId}`)
    const projectSnap = await projectRef.get()
    const project = projectSnap.data()
    if (!project) return
    if (project.ready_to_surface === true) return // already fired

    await projectRef.update({
      ready_to_surface: true,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    })

    const uid = project.user_id as string
    const userSnap = await admin.firestore().doc(`users/${uid}`).get()
    const email = userSnap.data()?.email as string | undefined

    await logActivity({ user_id: uid, project_id: projectId, action: 'ready_to_surface' })
    if (email) await sendMail(email, { template: 'ready_to_surface', data: { project_name: project.name } })
  },
)
