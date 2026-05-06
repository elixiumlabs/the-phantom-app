import { z } from 'zod'

export const PhaseNumber = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
export type PhaseNumber = z.infer<typeof PhaseNumber>

export const ProjectId = z.string().min(1).max(64)
export const NonEmptyText = (max = 2000) => z.string().min(1).max(max)
export const VoiceAdjective = z.string().min(2).max(40)
export const OfferType = z.enum(['service', 'digital_product', 'course', 'consultation', 'other'])
export const OutreachType = z.enum(['cold_dm', 'email', 'community_post', 'ad', 'other'])
export const VisualDirection = z.enum(['minimal', 'editorial', 'bold', 'warm', 'technical', 'other'])
export const ProofType = z.enum(['screenshot', 'testimonial', 'case_study', 'revenue', 'conversion_data'])

export const FREE_LIMITS = {
  active_projects: 1,
  offer_versions: 3,
  outreach_entries: 30,
  vault_items: 5,
} as const

export const PHASE_2_MIN_OUTREACH = 30
