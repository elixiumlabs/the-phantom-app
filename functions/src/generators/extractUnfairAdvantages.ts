import { onCall } from 'firebase-functions/v2/https'
import { z } from 'zod'
import { ANTHROPIC_API_KEY, generateJSON } from '../lib/anthropic'
import { meterUsage, requireAuth, requirePlan, validate } from '../lib/guards'

const Input = z.object({
  background: z.string().min(20).max(4000),
  problemStatement: z.string().max(1000).optional(),
})

interface Output {
  advantages: Array<{
    advantage: string
    type: 'experience' | 'survived' | 'built' | 'access' | 'knowledge'
    credibilityScore: number
    reasoning: string
  }>
  rejected: Array<{ claim: string; reason: string }>
}

export const extractUnfairAdvantages = onCall(
  { secrets: [ANTHROPIC_API_KEY], region: 'us-central1' },
  async (req) => {
    const uid = requireAuth(req)
    await requirePlan(uid, ['free', 'phantom', 'phantom_pro'])
    await meterUsage(uid, 'extractUnfairAdvantages', 20)

    const { background, problemStatement } = validate(Input, req.data)

    return generateJSON<Output>({
      user: `Extract the user's unfair advantages from their background.

Background:
"""${background}"""
${problemStatement ? `\nProblem they are trying to solve:\n"""${problemStatement}"""\n` : ''}
RULES:
- Only ACTUAL advantages: things they have done, survived, built, accessed, or specifically learned. Not aspirational ones.
- Rank by credibility a skeptical stranger would assign (0-100), not by how the user feels about them.
- Reject any aspirational or vague claims and explain why in "rejected".
- If a problem statement is provided, weight advantages by their relevance to that specific audience.

Return JSON: { "advantages": [{ "advantage": string, "type": "experience"|"survived"|"built"|"access"|"knowledge", "credibilityScore": number, "reasoning": string }], "rejected": [{ "claim": string, "reason": string }] }

Sort advantages by credibilityScore descending.`,
    })
  },
)
