import { supabase } from './supabase'
import type {
  GhostIdentity,
  IterationLoop,
  IterationVersion,
  LockIn,
  OutreachLog,
  ProofVaultItem,
  Project,
  SilentTest,
} from '@/contexts/ProjectContext'

type Row = Record<string, any>

function parseJsonObject(value: unknown): Record<string, unknown> | undefined {
  if (!value) return undefined
  if (typeof value === 'object') return value as Record<string, unknown>
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return parsed && typeof parsed === 'object' ? parsed : undefined
    } catch {
      return undefined
    }
  }
  return undefined
}

export function mapGhostIdentity(row: Row | null): GhostIdentity | null {
  if (!row) return null
  return {
    ...row,
    checklist: {
      problem_written: Boolean(row.checklist_problem_written),
      advantages_mapped: Boolean(row.checklist_advantages_mapped),
      positioning_written: Boolean(row.checklist_positioning_written),
      voice_defined: Boolean(row.checklist_voice_defined),
      anti_customers_defined: Boolean(row.checklist_anti_customers_defined),
    },
  } as GhostIdentity
}

export function mapSilentTest(row: Row | null): SilentTest | null {
  if (!row) return null
  return {
    ...row,
    sales_page: parseJsonObject(row.sales_page),
    summary: {
      total: Number(row.summary_total ?? 0),
      responded: Number(row.summary_responded ?? 0),
      converted: Number(row.summary_converted ?? 0),
      conversions: Number(row.summary_converted ?? 0),
      response_rate: Number(row.summary_response_rate ?? 0),
      conversion_rate: Number(row.summary_conversion_rate ?? 0),
      top_objection: row.summary_top_objection ?? null,
    },
    checklist: {
      offer_built: Boolean(row.checklist_offer_built),
      parameters_set: Boolean(row.checklist_parameters_set),
      outreach_30: Boolean(row.checklist_outreach_30),
      data_recorded: Boolean(row.checklist_data_recorded),
      objections_documented: Boolean(row.checklist_objections_documented),
      sales_page_built: Boolean(row.checklist_sales_page_built),
    },
  } as SilentTest
}

export function mapIterationLoop(row: Row | null): IterationLoop | null {
  if (!row) return null
  return {
    ...row,
    checklist: {
      diagnosis_done: Boolean(row.checklist_diagnosis_done),
      one_iteration: Boolean(row.checklist_one_iteration),
      log_documented: Boolean(row.checklist_log_documented),
      converting_at_target: Boolean(row.checklist_converting_at_target),
      objections_reduced: Boolean(row.checklist_objections_reduced),
    },
  } as IterationLoop
}

export function mapLockIn(row: Row | null): LockIn | null {
  if (!row) return null
  return {
    ...row,
    checklist: {
      five_conversions: Boolean(row.checklist_five_conversions),
      one_sentence_positioning: Boolean(row.checklist_one_sentence_positioning),
      three_proof_pieces: Boolean(row.checklist_three_proof_pieces),
      objections_mapped: Boolean(row.checklist_objections_mapped),
      brand_from_data: Boolean(row.checklist_brand_from_data),
      not_for_defined: Boolean(row.checklist_not_for_defined),
    },
  } as LockIn
}

export async function updateGhostIdentity(projectId: string, data: Partial<Row>) {
  const { error } = await supabase.from('ghost_identity').update(data).eq('project_id', projectId)
  if (error) throw new Error(error.message)
}

export async function updateSilentTest(projectId: string, data: Partial<Row>) {
  const { error } = await supabase.from('silent_test').update(data).eq('project_id', projectId)
  if (error) throw new Error(error.message)
}

export async function updateIterationLoop(projectId: string, data: Partial<Row>) {
  const { error } = await supabase.from('iteration_loop').update(data).eq('project_id', projectId)
  if (error) throw new Error(error.message)
}

export async function updateLockIn(projectId: string, data: Partial<Row>) {
  const { error } = await supabase.from('lock_in').update(data).eq('project_id', projectId)
  if (error) throw new Error(error.message)
}

export async function insertOutreachLog(data: Omit<OutreachLog, 'id' | 'created_at'> & { outreach_type?: string; identifier?: string }) {
  const { error } = await supabase.from('outreach_log').insert(data)
  if (error) throw new Error(error.message)
}

export async function updateOutreachLog(id: string, data: Partial<OutreachLog> & { outreach_type?: string; identifier?: string }) {
  const { error } = await supabase.from('outreach_log').update(data).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteOutreachLog(id: string) {
  const { error } = await supabase.from('outreach_log').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function insertIterationVersion(data: Omit<IterationVersion, 'id' | 'created_at' | 'version_number' | 'flags'> & { user_id: string }) {
  const { data: existing } = await supabase
    .from('iteration_versions')
    .select('version_number')
    .eq('project_id', data.project_id)
    .order('version_number', { ascending: false })
    .limit(1)
  const versionNumber = Number(existing?.[0]?.version_number ?? 0) + 1
  const { error } = await supabase.from('iteration_versions').insert({
    ...data,
    version_number: versionNumber,
    flags: data.single_variable ? [] : ['multi_variable'],
  })
  if (error) throw new Error(error.message)
}

export async function insertProofVaultItem(data: Omit<ProofVaultItem, 'id' | 'created_at'>) {
  const { error } = await supabase.from('proof_vault').insert(data)
  if (error) throw new Error(error.message)
}

export async function updateProofVaultItem(id: string, data: Partial<ProofVaultItem>) {
  const { error } = await supabase.from('proof_vault').update(data).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteProofVaultItem(id: string) {
  const { error } = await supabase.from('proof_vault').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function fetchProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as Project[]
}

