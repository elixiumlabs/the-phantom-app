import { onCall } from 'firebase-functions/v2/https'
import { z } from 'zod'
import { ANTHROPIC_API_KEY, generateJSON } from '../lib/anthropic'
import { gate, meterUsage, requirePlan, validate } from '../lib/guards'

const Input = z.object({
  problem_statement: z.string().min(10).max(1000),
  audience: z.string().min(3).max(500),
})

interface Output {
  existing_solutions: Array<{
    name: string
    category: 'incumbent_software' | 'service_provider' | 'community' | 'content_creator' | 'diy_method' | 'other'
    does_well: string[]
    consistently_misses: string[]
  }>
  gaps: Array<{ gap: string; why_unfilled: string; user_wedge: string }>
  primary_wedge: string
}

export const competitiveGapAnalysis = onCall(
  { secrets: [ANTHROPIC_API_KEY], region: 'us-central1' },
  async (req) => {
    const uid = await gate(req)
    await requirePlan(uid, ['phantom_pro'])
    await meterUsage(uid, 'competitiveGapAnalysis', 8)
    const input = validate(Input, req.data)

    return generateJSON<Output>({
      user: `Map the competitive landscape and find the gap.

Problem: """${input.problem_statement}"""
Audience: """${input.audience}"""

Identify what people CURRENTLY use to address this problem (software, services, communities, creators, DIY). For each: 2-4 things they do well, 2-4 things they consistently fail to deliver.

Then surface 2-4 GAPS — outcomes the audience needs that the existing landscape doesn't reliably provide.

Return JSON: { "existing_solutions": [{ "name": string, "category": ..., "does_well": string[], "consistently_misses": string[] }], "gaps": [{ "gap": string, "why_unfilled": string, "user_wedge": string }], "primary_wedge": string }

primary_wedge: ONE sentence — the specific gap the user is best positioned to fill.`,
      maxTokens: 2400,
      temperature: 0.5,
    })
  },
)
