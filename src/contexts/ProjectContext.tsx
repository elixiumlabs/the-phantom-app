import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import {
  fetchProjects,
  mapGhostIdentity,
  mapIterationLoop,
  mapLockIn,
  mapSilentTest,
} from '@/lib/supabaseData'

export type Phase = 1 | 2 | 3 | 4

export interface Project {
  id: string
  user_id: string
  name: string
  status: 'active' | 'archived' | 'surfaced'
  current_phase: Phase
  phase_1_completed: boolean
  phase_2_completed: boolean
  phase_3_completed: boolean
  phase_4_completed: boolean
  ready_to_surface: boolean
  created_at: string
  updated_at: string
}

export interface GhostIdentity {
  problem_statement: string
  unfair_advantages: string[]
  working_name: string
  positioning_statement: string
  voice_adjectives: string[]
  anti_customers?: string[]
  checklist: {
    problem_written: boolean
    advantages_mapped: boolean
    positioning_written: boolean
    voice_defined: boolean
    anti_customers_defined?: boolean
  }
  // AI-generated options
  ai_problem_options?: Array<{
    statement: string
    tightened: string
    note: string
  }>
  ai_advantage_options?: Array<{
    advantage: string
    type: string
    credibilityScore: number
    reasoning: string
  }>
  ai_rejected_claims?: Array<{ claim: string; reason: string }>
  ai_positioning_options?: Array<{
    sentence: string
    angle: string
    reasoning: string
  }>
  ai_working_names?: Array<{ name: string; rationale: string }>
  ai_voice_triples?: Array<{ adjectives: [string, string, string]; whyItFits: string }>
}

export interface SilentTest {
  offer_name: string
  offer_type: string | null
  offer_includes: string[]
  offer_outcome: string
  offer_price: number | null
  offer_currency: string
  delivery_method: string
  test_sample_size: number | null
  target_conversion_rate: number | null
  failed_test_criteria: string
  test_locations: string[]
  summary: {
    total: number
    responded: number
    converted: number
    conversions?: number
    response_rate: number
    conversion_rate: number
    top_objection: string | null
  }
  checklist: {
    offer_built: boolean
    parameters_set: boolean
    outreach_30: boolean
    data_recorded: boolean
    objections_documented: boolean
    sales_page_built?: boolean
  }
  sales_page?: {
    headline: string
    subheadline: string
    problem: string
    promise: string
    proof: string
    price: string
    cta: string
  }
  // AI-generated
  ai_offer_drafts?: Array<{
    name: string
    type: string
    includes: string[]
    outcome_sentence: string
    price_band: { low: number; high: number; currency: string }
    delivery_method: string
    why_this_validates_fast: string
  }>
}

export interface IterationLoop {
  diagnosis: string
  diagnosis_code?: string
  diagnosis_fix?: string
  diagnosis_variable?: string
  private_notes: string
  checklist: {
    diagnosis_done: boolean
    one_iteration: boolean
    log_documented: boolean
    converting_at_target: boolean
    objections_reduced: boolean
  }
}

export interface LockIn {
  buyer_problem_language: string
  buyer_outcome_language: string
  buyer_prior_attempts: string
  generated_positioning: string
  final_brand_name: string
  visual_direction: string | null
  final_voice_adjectives: string[]
  not_for: string
  checklist: {
    five_conversions: boolean
    one_sentence_positioning: boolean
    three_proof_pieces: boolean
    objections_mapped: boolean
    brand_from_data: boolean
    not_for_defined: boolean
  }
  // AI-generated
  ai_brand_identity?: Record<string, unknown>
  ai_not_for_exclusions?: Array<{ exclusion: string; why: string }>
}

export interface OutreachLog {
  id: string
  project_id: string
  date: string
  platform: string
  responded: boolean
  converted: boolean
  objection: string
  notes: string
  created_at: string
}

export interface IterationVersion {
  id: string
  project_id: string
  version_number: number
  date: string
  what_changed: string
  single_variable: boolean
  result: string
  new_conversion_rate: number | null
  flags: string[]
  created_at: string
}

export interface ProofVaultItem {
  id: string
  user_id: string
  project_id: string
  proof_type: 'screenshot' | 'testimonial' | 'case_study' | 'revenue' | 'conversion_data' | 'landing_page_test' | 'ad_performance' | 'survey_data' | 'preorder_campaign' | 'competitor_analysis' | 'market_research'
  title: string
  content: string
  file_url?: string
  storage_path?: string
  amount: number | null
  source: string | null
  date?: string | null
  tags: string[]
  content_type: string | null
  size: number | null
  created_at: string
}

interface ProjectCtx {
  projects: Project[]
  currentProject: Project | null
  ghostIdentity: GhostIdentity | null
  silentTest: SilentTest | null
  iterationLoop: IterationLoop | null
  lockIn: LockIn | null
  outreachLog: OutreachLog[]
  iterationVersions: IterationVersion[]
  proofVault: ProofVaultItem[]
  loading: boolean
  setCurrentProjectId: (id: string | null) => void
}

const ProjectContext = createContext<ProjectCtx | null>(null)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [ghostIdentity, setGhostIdentity] = useState<GhostIdentity | null>(null)
  const [silentTest, setSilentTest] = useState<SilentTest | null>(null)
  const [iterationLoop, setIterationLoop] = useState<IterationLoop | null>(null)
  const [lockIn, setLockIn] = useState<LockIn | null>(null)
  const [outreachLog, setOutreachLog] = useState<OutreachLog[]>([])
  const [iterationVersions, setIterationVersions] = useState<IterationVersion[]>([])
  const [proofVault, setProofVault] = useState<ProofVaultItem[]>([])
  const [loading, setLoading] = useState(true)

  // Subscribe to user's projects
  useEffect(() => {
    if (!isSupabaseConfigured || !user) {
      setProjects([])
      setLoading(false)
      return
    }

    let cancelled = false
    const load = async () => {
      try {
        const data = await fetchProjects(user.id)
        if (cancelled) return
        setProjects(data)
        setLoading(false)
      } catch (err) {
        console.error('[ProjectContext] Failed to load projects:', err)
        setLoading(false)
      }
    }
    void load()

    const channel = supabase
      .channel(`projects-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects', filter: `user_id=eq.${user.id}` },
        () => void load(),
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [user])

  // Subscribe to current project's subcollections
  useEffect(() => {
    if (!currentProjectId) {
      setGhostIdentity(null)
      setSilentTest(null)
      setIterationLoop(null)
      setLockIn(null)
      setOutreachLog([])
      setIterationVersions([])
      return
    }

    let cancelled = false
    const load = async () => {
      const [gi, st, il, li, outreach, versions] = await Promise.all([
        supabase.from('ghost_identity').select('*').eq('project_id', currentProjectId).maybeSingle(),
        supabase.from('silent_test').select('*').eq('project_id', currentProjectId).maybeSingle(),
        supabase.from('iteration_loop').select('*').eq('project_id', currentProjectId).maybeSingle(),
        supabase.from('lock_in').select('*').eq('project_id', currentProjectId).maybeSingle(),
        supabase.from('outreach_log').select('*').eq('project_id', currentProjectId).order('created_at', { ascending: false }),
        supabase.from('iteration_versions').select('*').eq('project_id', currentProjectId).order('version_number', { ascending: false }),
      ])
      if (cancelled) return
      setGhostIdentity(mapGhostIdentity(gi.data))
      setSilentTest(mapSilentTest(st.data))
      setIterationLoop(mapIterationLoop(il.data))
      setLockIn(mapLockIn(li.data))
      setOutreachLog((outreach.data ?? []) as OutreachLog[])
      setIterationVersions((versions.data ?? []) as IterationVersion[])
    }
    void load()

    const channel = supabase
      .channel(`project-detail-${currentProjectId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ghost_identity', filter: `project_id=eq.${currentProjectId}` }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'silent_test', filter: `project_id=eq.${currentProjectId}` }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'iteration_loop', filter: `project_id=eq.${currentProjectId}` }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lock_in', filter: `project_id=eq.${currentProjectId}` }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'outreach_log', filter: `project_id=eq.${currentProjectId}` }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'iteration_versions', filter: `project_id=eq.${currentProjectId}` }, () => void load())
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [currentProjectId])

  // Subscribe to user's proof vault
  useEffect(() => {
    if (!user) {
      setProofVault([])
      return
    }

    let cancelled = false
    const load = async () => {
      const { data, error } = await supabase
        .from('proof_vault')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (!cancelled && !error) setProofVault((data ?? []) as ProofVaultItem[])
    }
    void load()
    const channel = supabase
      .channel(`project-vault-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proof_vault', filter: `user_id=eq.${user.id}` }, () => void load())
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [user])

  const currentProject = projects.find((p) => p.id === currentProjectId) ?? null

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        ghostIdentity,
        silentTest,
        iterationLoop,
        lockIn,
        outreachLog,
        iterationVersions,
        proofVault,
        loading,
        setCurrentProjectId,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProjects() {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProjects must be used within ProjectProvider')
  return ctx
}
