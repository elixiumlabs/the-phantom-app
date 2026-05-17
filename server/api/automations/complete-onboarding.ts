import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { gate, enforceFreeLimit } from '../_lib/guards'
import { logActivity } from '../_lib/activity'
import { generateJSON } from '../_lib/ai'
import { adminClient } from '../_lib/supabase'
import { handleError } from '../_lib/respond'
import { apiError } from '../_lib/auth'

const Input = z.object({
  what_building: z.string().min(3).max(500),
  user_type: z.enum(['solo_founder', 'creator', 'coach_consultant', 'agency', 'other']),
  built_in_public: z.enum(['yes', 'no', 'currently']),
  history_note: z.string().max(1000).optional(),
})

interface RefinedSeed { refined_problem: string; suggested_name: string }

const AI_SEED_TIMEOUT_MS = 8000

function fallbackSeed(whatBuilding: string): RefinedSeed {
  return {
    refined_problem: whatBuilding,
    suggested_name: whatBuilding.slice(0, 40).split(' ').slice(0, 3).join(' '),
  }
}

function onboardingMeta(input: z.infer<typeof Input>, seed?: RefinedSeed) {
  return {
    what_building: input.what_building,
    user_type: input.user_type,
    built_in_public: input.built_in_public,
    history_note: input.history_note ?? null,
    refined_problem: seed?.refined_problem ?? null,
    suggested_name: seed?.suggested_name ?? null,
  }
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
    }),
  ])
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const uid = await gate(req)
    const parsed = Input.safeParse(req.body)
    if (!parsed.success) throw apiError(400, parsed.error.issues[0].message)
    const input = parsed.data

    const db = adminClient()
    const { data: userRow } = await db.from('users').select('*').eq('id', uid).single()

    // Self-heal: ensure user row exists
    if (!userRow) {
      const { data: authUser } = await db.auth.admin.getUserById(uid)
      const now = new Date().toISOString()
      await db.from('users').insert({
        id: uid,
        email: authUser.user?.email ?? null,
        full_name: authUser.user?.user_metadata?.full_name ?? null,
        plan: 'free',
        onboarding_completed: false,
        created_at: now,
        updated_at: now,
      })
    }

    // Idempotency: if project already exists, return it
    const { data: existingProjects } = await db
      .from('projects')
      .select('id')
      .eq('user_id', uid)
      .eq('status', 'active')
      .limit(1)

    if (existingProjects?.length) {
      const existingId = existingProjects[0].id
      await db.from('users').update({
        onboarding_completed: true,
        onboarding_meta: onboardingMeta(input),
        updated_at: new Date().toISOString(),
      }).eq('id', uid)
      await db.from('onboarding_responses').upsert({
        user_id: uid,
        project_id: existingId,
        what_building: input.what_building,
        user_type: input.user_type,
        built_in_public: input.built_in_public,
        history_note: input.history_note ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      return res.status(200).json({ project_id: existingId })
    }

    await enforceFreeLimit(uid, 'active_projects', 0)

    let seed: RefinedSeed
    try {
      seed = await withTimeout(
        generateJSON<RefinedSeed>({
          user: `A new user just finished Phantom onboarding. Refine their seed into a starting point for Phase 01.

What they're building: """${input.what_building}"""
They identify as: ${input.user_type}
Have they built in public before? ${input.built_in_public}${input.history_note ? `\nNote: ${input.history_note}` : ''}

Return JSON: { "refined_problem": string, "suggested_name": string }
- refined_problem: A first-pass problem statement in Phantom format ("I help [X] who is experiencing [Y] to achieve [Z] without [W]"). Use their words where possible.
- suggested_name: A short functional working name for the test. 1-3 words.`,
          maxTokens: 600,
          temperature: 0.6,
        }),
        AI_SEED_TIMEOUT_MS,
      )
    } catch {
      seed = fallbackSeed(input.what_building)
    }

    const now = new Date().toISOString()
    const { data: project, error: projError } = await db
      .from('projects')
      .insert({
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
      .select('id')
      .single()

    if (projError || !project) throw apiError(500, 'Failed to create project')
    const projectId = project.id

    await Promise.all([
      db.from('ghost_identity').insert({
        project_id: projectId,
        problem_statement: seed.refined_problem,
        unfair_advantages: [],
        working_name: seed.suggested_name,
        positioning_statement: '',
        voice_adjectives: [],
        checklist_problem_written: !!seed.refined_problem,
        checklist_advantages_mapped: false,
        checklist_positioning_written: false,
        checklist_voice_defined: false,
        updated_at: now,
      }),
      db.from('silent_test').insert({
        project_id: projectId,
        offer_name: '',
        offer_includes: [],
        summary_total: 0,
        summary_response_rate: 0,
        summary_conversion_rate: 0,
        checklist_offer_built: false,
        checklist_parameters_set: false,
        checklist_outreach_30: false,
        checklist_data_recorded: false,
        checklist_objections_documented: false,
        updated_at: now,
      }),
      db.from('iteration_loop').insert({
        project_id: projectId,
        diagnosis: '',
        private_notes: '',
        checklist_diagnosis_done: false,
        checklist_one_iteration: false,
        checklist_log_documented: false,
        checklist_converting_at_target: false,
        checklist_objections_reduced: false,
        updated_at: now,
      }),
      db.from('lock_in').insert({
        project_id: projectId,
        buyer_problem_language: '',
        buyer_outcome_language: '',
        buyer_prior_attempts: '',
        generated_positioning: '',
        final_brand_name: '',
        final_voice_adjectives: [],
        not_for: '',
        checklist_five_conversions: false,
        checklist_one_sentence_positioning: false,
        checklist_three_proof_pieces: false,
        checklist_objections_mapped: false,
        checklist_brand_from_data: false,
        checklist_not_for_defined: false,
        updated_at: now,
      }),
      db.from('users').update({
        onboarding_completed: true,
        onboarding_meta: onboardingMeta(input, seed),
        updated_at: now,
      }).eq('id', uid),
      db.from('onboarding_responses').upsert({
        user_id: uid,
        project_id: projectId,
        what_building: input.what_building,
        user_type: input.user_type,
        built_in_public: input.built_in_public,
        history_note: input.history_note ?? null,
        refined_problem: seed.refined_problem,
        suggested_name: seed.suggested_name,
        created_at: now,
        updated_at: now,
      }, { onConflict: 'user_id' }),
    ])

    try {
      await logActivity({ user_id: uid, project_id: projectId, action: 'project_created', metadata: { source: 'onboarding' } })
    } catch { /* non-critical */ }

    res.status(200).json({ project_id: projectId })
  } catch (err) {
    handleError(res, err)
  }
}
