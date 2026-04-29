import * as admin from 'firebase-admin'
import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { logActivity } from '../lib/activity'
import { RESEND_API_KEY, sendMail } from '../lib/mailer'

const MILESTONES = new Set([5, 10, 25])

export const onProofVaultCreated = onDocumentCreated(
  { document: 'proof_vault/{itemId}', region: 'us-central1', secrets: [RESEND_API_KEY] },
  async (event) => {
    const data = event.data?.data()
    if (!data) return
    const uid = data.user_id as string
    const projectId = (data.project_id as string | undefined) ?? null

    await logActivity({
      user_id: uid,
      project_id: projectId,
      action: 'vault_added',
      metadata: { proof_type: data.proof_type ?? null },
    })

    const count = (
      await admin.firestore().collection('proof_vault').where('user_id', '==', uid).count().get()
    ).data().count

    if (MILESTONES.has(count)) {
      const userSnap = await admin.firestore().doc(`users/${uid}`).get()
      const email = userSnap.data()?.email as string | undefined
      if (email) await sendMail(email, { template: 'vault_milestone', data: { count } })
    }
  },
)
