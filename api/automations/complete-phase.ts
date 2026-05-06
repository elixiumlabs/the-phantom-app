import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { gate, verifyProjectOwnership } from '../_lib/guards'
import { logActivity } from '../_lib/activity'
import { adminClient } from '../_lib/supabase'
import { handleError } from '../_lib/respond'
import { apiError } from '../_lib/auth'
import { PhaseNumber, PHASE_2_MIN_OUTREACH } from '../_lib/schemas'

const Input = z.object({
  project_id: z.string().min(1),
  phase: PhaseNumber,
})

function allTrue(obj: Record<string, unknown> | null | undefined): boolean {
  if (!obj) return false
  const vals = Object.values(obj)
  return vals.length > 0 && vals.every(v => v === true)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const uid = await gate(req)
    const parsed = Input.safeParse(req.body)
    if (!parsed.success) throw apiError(400, parsed.error.issues[0].message)
    const { project_id, phase } = parsed.data

    const projectData = await verifyProjectOwnership(uid, project_id)
    const db = adminClient()

    if (projectData[`phase_${phase}_completed`]) throw apiError(409, `Phase ${phase} already complete`)
    if (phase > 1 && !projectData[`phase_${phase - 1}_completed`]) {
      throw apiError(412, `Complete phase ${phase - 1} first`)
    }

    if (phase === 1) {
      const { data: gi } = await db.from('ghost_identity').select('*').eq('project_id', project_id).single()
      if (!gi?.problem_statement?.trim()) throw apiError(412, 'Problem statement required')
      if (!Array.isArray(gi.unfair_advantages) || gi.unfair_advantages.length < 3)
        throw apiError(412, 'At least 3 unfair advantages required')
      if (!gi.positioning_statement?.trim()) throw apiError(412, 'Positioning required')
      if (!Array.isArray(gi.voice_adjectives) || gi.voice_adjectives.length === 0)
        throw apiError(412, 'Voice adjectives required')
      const checklist = {
        problem_written: gi.checklist_problem_written,
        advantages_mapped: gi.checklist_advantages_mapped,
        positioning_written: gi.checklist_positioning_written,
        voice_defined: gi.checklist_voice_defined,
      }
      if (!allTrue(checklist)) throw apiError(412, 'All Phase 01 checklist items must be checked')
    }

    if (phase === 2) {
      const { data: st } = await db.from('silent_test').select('*').eq('project_id', project_id).single()
      if (!st?.offer_name) throw apiError(412, 'Minimum offer required')
      if (!st.test_sample_size || !st.target_conversion_rate)
        throw apiError(412, 'Test parameters must be set before completing phase 2')
      const { count } = await db
        .from('outreach_log')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', project_id)
      if ((count ?? 0) < PHASE_2_MIN_OUTREACH)
        throw apiError(412, `Phase 02 requires at least ${PHASE_2_MIN_OUTREACH} outreach attempts (current: ${count ?? 0})`)
      const checklist = {
        offer_built: st.checklist_offer_built,
        parameters_set: st.checklist_parameters_set,
        outreach_30: st.checklist_outreach_30,
        data_recorded: st.checklist_data_recorded,
        objections_documented: st.checklist_objections_documented,
      }
      if (!allTrue(checklist)) throw apiError(412, 'All Phase 02 checklist items must be checked')
    }

    if (phase === 3) {
      const { data: it } = await db.from('iteration_loop').select('*').eq('project_id', project_id).single()
      if (!it?.diagnosis?.trim()) throw apiError(412, 'Diagnosis required')
      const { count } = await db
        .from('iteration_versions')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', project_id)
      if ((count ?? 0) < 1) throw apiError(412, 'At least one iteration cycle required')
      const checklist = {
        diagnosis_done: it.checklist_diagnosis_done,
        one_iteration: it.checklist_one_iteration,
        log_documented: it.checklist_log_documented,
        converting_at_target: it.checklist_converting_at_target,
        objections_reduced: it.checklist_objections_reduced,
      }
      if (!allTrue(checklist)) throw apiError(412, 'All Phase 03 checklist items must be checked')
    }

    if (phase === 4) {
      const { data: li } = await db.from('lock_in').select('*').eq('project_id', project_id).single()
      if (!li?.generated_positioning?.trim()) throw apiError(412, 'Locked positioning required')
      if (!li.final_brand_name?.trim()) throw apiError(412, 'Final brand name required')
      if (!li.not_for?.trim()) throw apiError(412, '"Who this is NOT for" required')
      const checklist = {
        five_conversions: li.checklist_five_conversions,
        one_sentence_positioning: li.checklist_one_sentence_positioning,
        three_proof_pieces: li.checklist_three_proof_pieces,
        objections_mapped: li.checklist_objections_mapped,
        brand_from_data: li.checklist_brand_from_data,
        not_for_defined: li.checklist_not_for_defined,
      }
      if (!allTrue(checklist)) throw apiError(412, 'All 6 lock-in items must be checked')
    }

    const now = new Date().toISOString()
    await db.from('projects').update({
      [`phase_${phase}_completed`]: true,
      current_phase: phase < 4 ? phase + 1 : 4,
      status: phase === 4 ? 'surfaced' : projectData.status,
      ready_to_surface: phase === 4 ? true : (projectData.ready_to_surface ?? false),
      updated_at: now,
    }).eq('id', project_id)

    await logActivity({ user_id: uid, project_id, action: 'phase_completed', metadata: { phase } })

    res.status(200).json({ ok: true, phase })
  } catch (err) {
    handleError(res, err)
  }
}
