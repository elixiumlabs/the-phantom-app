import * as admin from 'firebase-admin'
import { z } from 'zod'
import { appendGenerationHistory, defineEngine } from '../lib/engine'

const Input = z.object({
  problem_statement: z.string().min(10).max(1000),
  audience: z.string().min(3).max(500),
  project_id: z.string().min(1).optional(),
})
type In = z.infer<typeof Input>

interface Out extends Record<string, unknown> {
  existing_solutions: Array<{
    name: string
    category: 'incumbent_software' | 'service_provider' | 'community' | 'content_creator' | 'diy_method' | 'other'
    does_well: string[]
    consistently_misses: string[]
  }>
  gaps: Array<{ gap: string; why_unfilled: string; user_wedge: string }>
  primary_wedge: string
}

export const competitiveGapAnalysis = defineEngine<In, Out>({
  id: 'competitiveGapAnalysis',
  input: Input,
  plans: ['phantom_pro'],
  dailyLimit: 8,
  maxTokens: 2400,
  temperature: 0.5,
  prompt: ({ input }) => `Map the competitive landscape and find the gap.

Problem: """${input.problem_statement}"""
Audience: """${input.audience}"""

Identify what people CURRENTLY use to address this problem (software, services, communities, creators, DIY). For each: 2-4 things they do well, 2-4 things they consistently fail to deliver.

Then surface 2-4 GAPS — outcomes the audience needs that the existing landscape doesn't reliably provide.

Return JSON: { "existing_solutions": [{ "name": string, "category": ..., "does_well": string[], "consistently_misses": string[] }], "gaps": [{ "gap": string, "why_unfilled": string, "user_wedge": string }], "primary_wedge": string }

primary_wedge: ONE sentence — the specific gap the user is best positioned to fill.`,
  persist: async (ctx, output) => {
    if (!ctx.project) return { written_paths: [] }
    const written: string[] = []
    written.push(
      await appendGenerationHistory({
        project_ref: ctx.project.ref,
        generator: 'competitiveGapAnalysis',
        input: ctx.input,
        output,
      }),
    )
    const ref = ctx.project.ref.collection('competitive_gap').doc('main')
    await ref.set(
      { ...output, generated_at: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true },
    )
    written.push(ref.path)
    return { written_paths: written }
  },
})
