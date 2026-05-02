import * as admin from 'firebase-admin'
import { onCall } from 'firebase-functions/v2/https'
import { z } from 'zod'
import { enforceFreeLimit, gate, validate } from '../lib/guards'
import { logActivity } from '../lib/activity'

const Input = z.object({
  name: z.string().min(1).max(120),
  initial_problem: z.string().max(500).optional(),
})

export interface CreateProjectResult {
  project_id: string
}

/**
 * Creates a project doc + the four phase subdocs in one batched write.
 * Free plan is capped at 1 active project (PRD §05).
 */
export const createProject = onCall({ 
  region: 'us-central1',
  cors: [
    /localhost:\d+$/,
    'https://the-phantom-app-io.web.app',
    'https://the-phantom-app-io.firebaseapp.com',
    'https://the-phantom-app.vercel.app'
  ]
}, async (req): Promise<CreateProjectResult> => {
  const uid = await gate(req)
  const { name, initial_problem } = validate(Input, req.data)

  const db = admin.firestore()
  const activeSnap = await db
    .collection('projects')
    .where('user_id', '==', uid)
    .where('status', '==', 'active')
    .count()
    .get()
  await enforceFreeLimit(uid, 'active_projects', activeSnap.data().count)

  const now = admin.firestore.FieldValue.serverTimestamp()
  const projectRef = db.collection('projects').doc()
  const batch = db.batch()

  batch.set(projectRef, {
    user_id: uid,
    name,
    status: 'active',
    current_phase: 1,
    phase_1_completed: false,
    phase_2_completed: false,
    phase_3_completed: false,
    phase_4_completed: false,
    ready_to_surface: false,
    created_at: now,
    updated_at: now,
  })

  batch.set(projectRef.collection('ghost_identity').doc('main'), {
    problem_statement: initial_problem ?? '',
    unfair_advantages: [],
    working_name: '',
    positioning_statement: '',
    voice_adjectives: [],
    checklist: {
      problem_written: false,
      advantages_mapped: false,
      positioning_written: false,
      voice_defined: false,
    },
    updated_at: now,
  })

  batch.set(projectRef.collection('silent_test').doc('main'), {
    offer_name: '',
    offer_type: null,
    offer_includes: [],
    offer_outcome: '',
    offer_price: null,
    offer_currency: 'USD',
    delivery_method: '',
    test_sample_size: null,
    target_conversion_rate: null,
    failed_test_criteria: '',
    test_locations: [],
    summary: { total: 0, response_rate: 0, conversion_rate: 0, top_objection: null },
    checklist: {
      offer_built: false,
      parameters_set: false,
      outreach_30: false,
      data_recorded: false,
      objections_documented: false,
    },
    updated_at: now,
  })

  batch.set(projectRef.collection('iteration_loop').doc('main'), {
    diagnosis: '',
    private_notes: '',
    checklist: {
      diagnosis_done: false,
      one_iteration: false,
      log_documented: false,
      converting_at_target: false,
      objections_reduced: false,
    },
    updated_at: now,
  })

  batch.set(projectRef.collection('lock_in').doc('main'), {
    buyer_problem_language: '',
    buyer_outcome_language: '',
    buyer_prior_attempts: '',
    generated_positioning: '',
    final_brand_name: '',
    visual_direction: null,
    final_voice_adjectives: [],
    not_for: '',
    checklist: {
      five_conversions: false,
      one_sentence_positioning: false,
      three_proof_pieces: false,
      objections_mapped: false,
      brand_from_data: false,
      not_for_defined: false,
    },
    updated_at: now,
  })

  await batch.commit()
  await logActivity({ user_id: uid, project_id: projectRef.id, action: 'project_created', metadata: { name } })

  return { project_id: projectRef.id }
})
