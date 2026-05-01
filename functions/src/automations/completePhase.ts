import * as admin from 'firebase-admin'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { z } from 'zod'
import { gate, validate } from '../lib/guards'
import { loadOwnedProject } from '../lib/projectAccess'
import { logActivity } from '../lib/activity'
import { PhaseNumber, PHASE_2_MIN_OUTREACH } from '../lib/schemas'

const Input = z.object({
  project_id: z.string().min(1),
  phase: PhaseNumber,
})

function allTrue(checklist: Record<string, unknown> | undefined): boolean {
  if (!checklist) return false
  const vals = Object.values(checklist)
  return vals.length > 0 && vals.every((v) => v === true)
}

/**
 * Server-side phase gate. Refuses to mark a phase complete unless every
 * PRD-mandated requirement is met. The UI checklist is advisory; this is law.
 */
export const completePhase = onCall({ 
  region: 'us-central1',
  cors: [/localhost:\d+$/, 'https://the-phantom-app-io.web.app', 'https://the-phantom-app-io.firebaseapp.com']
}, async (req) => {
  const uid = await gate(req)
  const { project_id, phase } = validate(Input, req.data)
  const { ref, data } = await loadOwnedProject(uid, project_id)

  if (data[`phase_${phase}_completed`]) {
    throw new HttpsError('already-exists', `Phase ${phase} already complete`)
  }
  if (phase > 1 && !data[`phase_${phase - 1}_completed`]) {
    throw new HttpsError('failed-precondition', `Complete phase ${phase - 1} first`)
  }

  if (phase === 1) {
    const giSnap = await ref.collection('ghost_identity').doc('main').get()
    const gi = giSnap.data()
    if (!gi?.problem_statement?.trim()) throw new HttpsError('failed-precondition', 'Problem statement required')
    if (!Array.isArray(gi.unfair_advantages) || gi.unfair_advantages.length < 3)
      throw new HttpsError('failed-precondition', 'At least 3 unfair advantages required')
    if (!gi.positioning_statement?.trim()) throw new HttpsError('failed-precondition', 'Positioning required')
    if (!Array.isArray(gi.voice_adjectives) || gi.voice_adjectives.length === 0)
      throw new HttpsError('failed-precondition', 'Voice adjectives required')
    if (!allTrue(gi.checklist)) throw new HttpsError('failed-precondition', 'All Phase 01 checklist items must be checked')
  }

  if (phase === 2) {
    const stSnap = await ref.collection('silent_test').doc('main').get()
    const st = stSnap.data()
    if (!st?.offer_name) throw new HttpsError('failed-precondition', 'Minimum offer required')
    if (!st.test_sample_size || !st.target_conversion_rate)
      throw new HttpsError('failed-precondition', 'Test parameters must be set before completing phase 2')
    const outreachCount = await ref.collection('outreach_log').count().get()
    if (outreachCount.data().count < PHASE_2_MIN_OUTREACH) {
      throw new HttpsError(
        'failed-precondition',
        `Phase 02 requires at least ${PHASE_2_MIN_OUTREACH} outreach attempts (current: ${outreachCount.data().count})`,
      )
    }
    if (!allTrue(st.checklist)) throw new HttpsError('failed-precondition', 'All Phase 02 checklist items must be checked')
  }

  if (phase === 3) {
    const itSnap = await ref.collection('iteration_loop').doc('main').get()
    const it = itSnap.data()
    if (!it?.diagnosis?.trim()) throw new HttpsError('failed-precondition', 'Diagnosis required')
    const versions = await ref.collection('iteration_versions').count().get()
    if (versions.data().count < 1) throw new HttpsError('failed-precondition', 'At least one iteration cycle required')
    if (!allTrue(it.checklist)) throw new HttpsError('failed-precondition', 'All Phase 03 checklist items must be checked')
  }

  if (phase === 4) {
    const liSnap = await ref.collection('lock_in').doc('main').get()
    const li = liSnap.data()
    if (!li?.generated_positioning?.trim()) throw new HttpsError('failed-precondition', 'Locked positioning required')
    if (!li.final_brand_name?.trim()) throw new HttpsError('failed-precondition', 'Final brand name required')
    if (!li.not_for?.trim()) throw new HttpsError('failed-precondition', '"Who this is NOT for" required')
    if (!allTrue(li.checklist)) throw new HttpsError('failed-precondition', 'All 6 lock-in items must be checked')
  }

  const now = admin.firestore.FieldValue.serverTimestamp()
  await ref.update({
    [`phase_${phase}_completed`]: true,
    current_phase: phase < 4 ? phase + 1 : 4,
    status: phase === 4 ? 'surfaced' : data.status,
    ready_to_surface: phase === 4 ? true : data.ready_to_surface ?? false,
    updated_at: now,
  })

  await logActivity({
    user_id: uid,
    project_id,
    action: 'phase_completed',
    metadata: { phase },
  })

  return { ok: true, phase }
})
