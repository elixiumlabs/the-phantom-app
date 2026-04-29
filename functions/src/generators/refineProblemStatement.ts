import { onCall } from 'firebase-functions/v2/https'
import { z } from 'zod'
import { ANTHROPIC_API_KEY, generateJSON } from '../lib/anthropic'
import { meterUsage, requireAuth, requirePlan, validate } from '../lib/guards'

const Input = z.object({
  draft: z.string().min(10).max(2000),
})

interface Output {
  refined: Array<{
    statement: string
    tightened: 'specificity' | 'audience' | 'outcome' | 'avoidance'
    note: string
  }>
}

export const refineProblemStatement = onCall(
  { secrets: [ANTHROPIC_API_KEY], region: 'us-central1' },
  async (req) => {
    const uid = requireAuth(req)
    await requirePlan(uid, ['free', 'phantom', 'phantom_pro'])
    await meterUsage(uid, 'refineProblemStatement', 20)

    const { draft } = validate(Input, req.data)

    return generateJSON<Output>({
      user: `The user wrote this rough problem statement for Phase 01 (Ghost Identity):

"""${draft}"""

Phantom requires the format: "I help [specific type of person] who is experiencing [specific named problem] to achieve [specific measurable outcome] without [the thing they most want to avoid]."

Return 3 refined versions. Each version should fix a different weakness:
- one that tightens SPECIFICITY of the person
- one that sharpens the named PROBLEM language (audience-facing words)
- one that makes the OUTCOME more measurable, OR makes the AVOIDANCE more specific

For each, write a short note explaining what you tightened and why.

Return JSON: { "refined": [{ "statement": string, "tightened": "specificity"|"audience"|"outcome"|"avoidance", "note": string }] }`,
    })
  },
)
