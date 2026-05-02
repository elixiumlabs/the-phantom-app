import * as admin from 'firebase-admin'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { z } from 'zod'
import { GEMINI_API_KEY, generateJSON } from '../lib/ai'
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
  { 
    secrets: [GEMINI_API_KEY], 
    region: 'us-central1',
    cors: [
      /localhost:\d+$/,
      'https://the-phantom-app-io.web.app',
      'https://the-phantom-app-io.firebaseapp.com',
      'https://the-phantom-app.vercel.app'
    ]
  },
  async (req): Promise<{ project_id: string }> => {
    try {
      const uid = await gate(req)
      const input = validate(Input, req.data)

    const db = admin.firestore()
    const userRef = db.doc(`users/${uid}`)
    const userSnap = await userRef.get()
    if (!userSnap.exists) {
      // Self-heal: bootstrapUser onCreate trigger may not have run for accounts
      // created before it was deployed. Create the doc inline so onboarding can proceed.
      const authUser = await admin.auth().getUser(uid).catch(() => null)
      const nowTs = admin.firestore.FieldValue.serverTimestamp()
      await userRef.set({
        email: authUser?.email ?? null,
        full_name: authUser?.displayName ?? null,
        avatar_url: authUser?.photoURL ?? null,
        plan: 'free',
        onboarding_completed: false,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        provider: authUser?.providerData[0]?.providerId ?? 'password',
        created_at: nowTs,
        updated_at: nowTs,
      })
    } else if (userSnap.data()?.onboarding_completed) {
      throw new HttpsError('failed-precondition', 'Onboarding already completed')
    }

    // Recover from a prior partial run: if a project already exists for this
    // user but the user doc never got flipped to onboarding_completed, finish
    // the handshake by flipping the flag and returning the existing project.
    const existingActive = await db
      .collection('projects')
      .where('user_id', '==', uid)
      .where('status', '==', 'active')
      .limit(1)
      .get()
    if (!existingActive.empty) {
      const existingId = existingActive.docs[0].id
      await userRef.set(
        {
          onboarding_completed: true,
          onboarding_meta: {
            user_type: input.user_type,
            built_in_public: input.built_in_public,
          },
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      )
      return { project_id: existingId }
    }

    await enforceFreeLimit(uid, 'active_projects', 0)

    let seed: RefinedSeed
    try {
      seed = await generateJSON<RefinedSeed>({
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
    } catch (err) {
      seed = {
        refined_problem: input.what_building,
        suggested_name: input.what_building.slice(0, 40).split(' ').slice(0, 3).join(' '),
      }
    }

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
    try {
      await logActivity({
        user_id: uid,
        project_id: projectRef.id,
        action: 'project_created',
        metadata: { source: 'onboarding' },
      })
    } catch {
      // Non-critical: activity logging failed
    }

    return { project_id: projectRef.id }
    } catch (err) {
      console.error('completeOnboarding error:', err)
      if (err instanceof HttpsError) throw err
      throw new HttpsError('internal', err instanceof Error ? err.message : 'Failed to complete onboarding')
    }
  },
)

/**
 * Mark onboarding complete without creating a project. Used by the "Skip"
 * button so the user can land on the dashboard and create a project on
 * their own terms.
 */
export const skipOnboarding = onCall(
  { 
    region: 'us-central1',
    cors: [
      /localhost:\d+$/,
      'https://the-phantom-app-io.web.app',
      'https://the-phantom-app-io.firebaseapp.com',
      'https://the-phantom-app.vercel.app'
    ]
  },
  async (req): Promise<{ ok: true }> => {
    const uid = await gate(req)
    const db = admin.firestore()
    const userRef = db.doc(`users/${uid}`)
    const now = admin.firestore.FieldValue.serverTimestamp()
    await userRef.set(
      {
        onboarding_completed: true,
        onboarding_skipped: true,
        updated_at: now,
      },
      { merge: true },
    )
    return { ok: true }
  },
)
