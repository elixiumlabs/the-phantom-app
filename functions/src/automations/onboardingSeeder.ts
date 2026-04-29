import * as admin from 'firebase-admin'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { z } from 'zod'
import { ANTHROPIC_API_KEY, generateJSON } from '../lib/anthropic'
import { gate, validate, enforceFreeLimit } from '../lib/guards'
import { logActivity } from '../lib/activity'

const Input = z.object({
  what_building: z.string().min(3).max(500),
  user_type: z.enum(['solo_founder', 'creator', 'coach_consultant', 'agency', 'other']),
  built_in_public: z.enum(['yes', 'no', 'currently']),
  history_note: z.string().max(1000).optional(),
})

interface RefinedSeed {
  refined_problem: string
  suggested_name: string
}

/**
 * Run after the 3-step onboarding modal. Refines the user's seed sentence
 * into a Phantom-format problem statement, then creates their first project
 * with that problem pre-filled in Phase 01.
 */
export const completeOnboarding = onCall(
  { secrets: [ANTHROPIC_API_KEY], region: 'us-central1' },
  async (req): Promise<{ project_id: string }> => {
    const uid = await gate(req)
    const input = validate(Input, req.data)

    const db = admin.firestore()
    const userRef = db.doc(`users/${uid}`)
    const userSnap = await userRef.get()
    if (!userSnap.exists) throw new HttpsError('failed-precondition', 'User doc not found')
    if (userSnap.data()?.onboarding_completed) {
      throw new HttpsError('failed-precondition', 'Onboarding already completed')
    }

    const activeSnap = await db
      .collection('projects')
      .where('user_id', '==', uid)
      .where('status', '==', 'active')
      .count()
      .get()
    await enforceFreeLimit(uid, 'active_projects', activeSnap.data().count)

    const seed = await generateJSON<RefinedSeed>({
      user: `A new user just finished Phantom onboarding. Refine their seed into a starting point for Phase 01.

What they're building: """${input.what_building}"""
They identify as: ${input.user_type}
Have they built in public before? ${input.built_in_public}${input.history_note ? `\nNote: ${input.history_note}` : ''}

Return JSON: { "refined_problem": string, "suggested_name": string }
- refined_problem: A first-pass problem statement in Phantom format ("I help [X] who is experiencing [Y] to achieve [Z] without [W]"). It does not need to be perfect — it needs to be specific enough that the user can react to it and tighten it. Use their words where possible.
- suggested_name: A short functional working name for the test (not a final brand). 1-3 words.`,
      maxTokens: 600,
      temperature: 0.6,
    })

    const now = admin.firestore.FieldValue.serverTimestamp()
    const projectRef = db.collection('projects').doc()
    const batch = db.batch()

    batch.set(projectRef, {
      user_id: uid,
      name: seed.suggested_name || input.what_building.slice(0, 60),
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
      problem_statement: seed.refined_problem,
      unfair_advantages: [],
      working_name: seed.suggested_name,
      positioning_statement: '',
      voice_adjectives: [],
      checklist: {
        problem_written: !!seed.refined_problem,
        advantages_mapped: false,
        positioning_written: false,
        voice_defined: false,
      },
      updated_at: now,
    })

    batch.set(projectRef.collection('silent_test').doc('main'), {
      offer_name: '',
      offer_includes: [],
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

    batch.set(
      userRef,
      {
        onboarding_completed: true,
        onboarding_meta: {
          user_type: input.user_type,
          built_in_public: input.built_in_public,
        },
        updated_at: now,
      },
      { merge: true },
    )

    await batch.commit()
    await logActivity({
      user_id: uid,
      project_id: projectRef.id,
      action: 'project_created',
      metadata: { source: 'onboarding' },
    })

    return { project_id: projectRef.id }
  },
)
