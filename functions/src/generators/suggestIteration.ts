import { onCall } from 'firebase-functions/v2/https'
import { z } from 'zod'
import { ANTHROPIC_API_KEY, generateJSON } from '../lib/anthropic'
import { gate, meterUsage, requirePlan, validate } from '../lib/guards'

const Input = z.object({
  diagnosis: z.string().min(5).max(2000),
  current_state: z.object({
    problem_statement: z.string().max(1000).optional(),
    offer_summary: z.string().max(800).optional(),
    conversion_rate: z.number().min(0).max(1).optional(),
    target_conversion_rate: z.number().min(0).max(1).optional(),
    top_objection: z.string().max(400).optional(),
  }),
})

interface Output {
  variable_to_change: string
  hypothesis: string
  exact_change: string
  measure: string
  expected_signal: string
  do_not_change: string[]
}

export const suggestIteration = onCall(
  { secrets: [ANTHROPIC_API_KEY], region: 'us-central1' },
  async (req) => {
    const uid = await gate(req)
    await requirePlan(uid, ['free', 'phantom', 'phantom_pro'])
    await meterUsage(uid, 'suggestIteration', 15)
    const input = validate(Input, req.data)

    return generateJSON<Output>({
      user: `Recommend the SINGLE next iteration. One variable. One hypothesis. One way to measure.

Diagnosis: """${input.diagnosis}"""
Current state: ${JSON.stringify(input.current_state)}

The phantom methodology forbids changing more than one variable per iteration. Pick the one with the highest expected information gain.

Return JSON: { "variable_to_change": string, "hypothesis": string, "exact_change": string, "measure": string, "expected_signal": string, "do_not_change": string[] }

- exact_change: a concrete, copyable instruction (e.g., "Replace the offer outcome line with: ...").
- measure: which metric will tell you it worked, and what threshold counts as a win.
- do_not_change: 2-4 things the user should explicitly leave alone this round.`,
      maxTokens: 800,
      temperature: 0.4,
    })
  },
)
