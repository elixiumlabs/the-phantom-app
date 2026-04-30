// Firestore-shape types — mirror functions/src/automations/createProject.ts
// and the generators' persist() targets exactly. These are the types the UI sees.

import type { Timestamp } from 'firebase/firestore'

export type ProjectStatus = 'active' | 'archived' | 'surfaced'

export interface Project {
  id: string
  user_id: string
  name: string
  status: ProjectStatus
  current_phase: 1 | 2 | 3 | 4
  phase_1_completed: boolean
  phase_2_completed: boolean
  phase_3_completed: boolean
  phase_4_completed: boolean
  ready_to_surface: boolean
  created_at: Timestamp | null
  updated_at: Timestamp | null
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
  // AI generator output (server-written)
  ai_problem_options?: Array<{ statement: string; tightened: string; note: string }>
  ai_advantage_options?: Array<{ advantage: string; type: string; credibilityScore: number; reasoning: string }>
  ai_rejected_claims?: Array<{ claim: string; reason: string }>
  ai_positioning_options?: Array<{ sentence: string; angle: string; reasoning: string }>
  ai_working_names?: Array<{ name: string; rationale: string }>
  ai_voice_triples?: Array<{ adjectives: [string, string, string]; whyItFits: string }>
  updated_at?: Timestamp | null
}

export interface SilentTest {
  offer_name: string
  offer_type: 'service' | 'digital_product' | 'course' | 'consultation' | 'other' | null
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
  ai_test_locations?: Array<{
    name: string
    channel: string
    url?: string
    whyAudienceIsHere: string
    outreachStyle: string
    accessDifficulty: 'easy' | 'medium' | 'hard'
    priorityScore: number
  }>
  ai_search_queries?: string[]
  updated_at?: Timestamp | null
}

export interface IterationLoop {
  diagnosis: string
  private_notes: string
  checklist: {
    diagnosis_done: boolean
    one_iteration: boolean
    log_documented: boolean
    converting_at_target: boolean
    objections_reduced: boolean
  }
  updated_at?: Timestamp | null
}

export interface LockIn {
  buyer_problem_language: string
  buyer_outcome_language: string
  buyer_prior_attempts: string
  generated_positioning: string
  final_brand_name: string
  visual_direction: 'minimal' | 'editorial' | 'bold' | 'warm' | 'technical' | 'other' | null
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
  updated_at?: Timestamp | null
}

export interface OutreachEntry {
  id: string
  project_id: string
  date: string
  platform: string
  outreach_type: 'cold_dm' | 'email' | 'community_post' | 'ad' | 'other'
  identifier: string
  responded: boolean | null
  converted: boolean | null
  objection: string
  notes: string
  created_at: Timestamp | null
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
  created_at: Timestamp | null
}

export interface ProofVaultItem {
  id: string
  user_id: string
  project_id: string | null
  proof_type: 'screenshot' | 'testimonial' | 'case_study' | 'revenue' | 'conversion_data'
  title: string
  content: string
  file_url?: string
  storage_path?: string
  amount?: number
  source?: string
  date?: string
  tags: string[]
  created_at: Timestamp | null
}

export interface ActivityEntry {
  id: string
  user_id: string
  project_id: string | null
  action: string
  metadata: Record<string, unknown>
  created_at: Timestamp | null
}
