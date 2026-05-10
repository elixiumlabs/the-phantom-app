import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { gate, enforceFreeLimit } from '../_lib/guards'
import { logActivity } from '../_lib/activity'
import { adminClient } from '../_lib/supabase'
import { handleError } from '../_lib/respond'
import { apiError } from '../_lib/auth'

const Input = z.object({
  name: z.string().min(1).max(120),
  initial_problem: z.string().max(500).optional(),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const uid = await gate(req)
    const parsed = Input.safeParse(req.body)
    if (!parsed.success) throw apiError(400, parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '))
    const { name, initial_problem } = parsed.data

    const db = adminClient()
    const { count } = await db
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', uid)
      .eq('status', 'active')
    await enforceFreeLimit(uid, 'active_projects', count ?? 0)

    const now = new Date().toISOString()
    const { data: project, error: projError } = await db
      .from('projects')
      .insert({
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
      .select('id')
      .single()

    if (projError || !project) throw apiError(500, 'Failed to create project')
    const projectId = project.id

    await Promise.all([
      db.from('ghost_identity').insert({
        project_id: projectId,
        problem_statement: initial_problem ?? '',
        unfair_advantages: [],
        working_name: '',
        positioning_statement: '',
        voice_adjectives: [],
        checklist_problem_written: false,
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
    ])

    await logActivity({ user_id: uid, project_id: projectId, action: 'project_created', metadata: { name } })
    res.status(200).json({ project_id: projectId })
  } catch (err) {
    handleError(res, err)
  }
}
