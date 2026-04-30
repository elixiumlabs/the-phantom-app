import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { collection, query, where, onSnapshot, doc, type Unsubscribe } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from './AuthContext'

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
  checklist: {
    problem_written: boolean
    advantages_mapped: boolean
    positioning_written: boolean
    voice_defined: boolean
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
  proof_type: 'screenshot' | 'testimonial' | 'case_study' | 'revenue' | 'conversion_data'
  title: string
  content: string
  file_url?: string
  storage_path?: string
  amount: number | null
  source: string | null
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
    if (!user) {
      setProjects([])
      setLoading(false)
      return
    }

    const q = query(collection(db, 'projects'), where('user_id', '==', user.id))
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Project))
        setProjects(data)
        setLoading(false)
      },
      (err) => {
        console.error('[ProjectContext] Failed to load projects:', err)
        setLoading(false)
      }
    )

    return unsub
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

    const projectRef = doc(db, 'projects', currentProjectId)
    const unsubs: Unsubscribe[] = []

    // ghost_identity
    unsubs.push(
      onSnapshot(doc(projectRef, 'ghost_identity', 'main'), (snap) => {
        setGhostIdentity(snap.exists() ? (snap.data() as GhostIdentity) : null)
      })
    )

    // silent_test
    unsubs.push(
      onSnapshot(doc(projectRef, 'silent_test', 'main'), (snap) => {
        setSilentTest(snap.exists() ? (snap.data() as SilentTest) : null)
      })
    )

    // iteration_loop
    unsubs.push(
      onSnapshot(doc(projectRef, 'iteration_loop', 'main'), (snap) => {
        setIterationLoop(snap.exists() ? (snap.data() as IterationLoop) : null)
      })
    )

    // lock_in
    unsubs.push(
      onSnapshot(doc(projectRef, 'lock_in', 'main'), (snap) => {
        setLockIn(snap.exists() ? (snap.data() as LockIn) : null)
      })
    )

    // outreach_log
    unsubs.push(
      onSnapshot(collection(projectRef, 'outreach_log'), (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as OutreachLog))
        setOutreachLog(data)
      })
    )

    // iteration_versions
    unsubs.push(
      onSnapshot(collection(projectRef, 'iteration_versions'), (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as IterationVersion))
        setIterationVersions(data.sort((a, b) => (b.version_number || 0) - (a.version_number || 0)))
      })
    )

    return () => unsubs.forEach((u) => u())
  }, [currentProjectId])

  // Subscribe to user's proof vault
  useEffect(() => {
    if (!user) {
      setProofVault([])
      return
    }

    const q = query(collection(db, 'proof_vault'), where('user_id', '==', user.id))
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProofVaultItem))
      setProofVault(data)
    })

    return unsub
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
