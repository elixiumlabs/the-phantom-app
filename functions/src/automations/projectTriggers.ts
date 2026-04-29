import * as admin from 'firebase-admin'
import { onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { RESEND_API_KEY, sendMail } from '../lib/mailer'

const NEXT_PHASE_HINT: Record<number, string> = {
  1: 'Phase 02 unlocked. Build the minimum offer.',
  2: 'Phase 03 unlocked. Diagnose what the data is telling you.',
  3: 'Phase 04 unlocked. Lock in positioning from buyer language.',
  4: 'You have proof. Surface when ready.',
}

/**
 * Detect phase_N_completed flips on a project doc and send the per-phase email.
 */
export const phaseCompletedEmail = onDocumentUpdated(
  { document: 'projects/{projectId}', region: 'us-central1', secrets: [RESEND_API_KEY] },
  async (event) => {
    const before = event.data?.before.data()
    const after = event.data?.after.data()
    if (!before || !after) return

    let firedPhase: number | null = null
    for (const phase of [1, 2, 3, 4] as const) {
      if (before[`phase_${phase}_completed`] !== true && after[`phase_${phase}_completed`] === true) {
        firedPhase = phase
        break
      }
    }
    if (!firedPhase) return

    const uid = after.user_id as string
    const userSnap = await admin.firestore().doc(`users/${uid}`).get()
    const email = userSnap.data()?.email as string | undefined
    if (!email) return

    await sendMail(email, {
      template: 'phase_complete',
      data: { phase: firedPhase, next: NEXT_PHASE_HINT[firedPhase] },
    })
  },
)
