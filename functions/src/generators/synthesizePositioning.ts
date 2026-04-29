import { onCall } from 'firebase-functions/v2/https'
import { z } from 'zod'
import { ANTHROPIC_API_KEY, generateJSON } from '../lib/anthropic'
import { meterUsage, requireAuth, requirePlan, validate } from '../lib/guards'

const Input = z.object({
  problemStatement: z.string().min(10).max(1000),
  unfairAdvantages: z.array(z.string().min(2)).min(1).max(20),
})

interface Output {
  positioningOptions: Array<{
    sentence: string
    angle: 'problem-led' | 'outcome-led' | 'identity-led'
    reasoning: string
  }>
  workingNames: Array<{ name: string; rationale: string }>
  voiceTriples: Array<{ adjectives: [string, string, string]; whyItFits: string }>
}

export const synthesizePositioning = onCall(
  { secrets: [ANTHROPIC_API_KEY], region: 'us-central1' },
  async (req) => {
    const uid = requireAuth(req)
    await requirePlan(uid, ['free', 'phantom', 'phantom_pro'])
    await meterUsage(uid, 'synthesizePositioning', 15)

    const { problemStatement, unfairAdvantages } = validate(Input, req.data)

    return generateJSON<Output>({
      user: `Synthesize hypothesis positioning options for a phantom-phase brand.

Problem statement:
"""${problemStatement}"""

Unfair advantages:
${unfairAdvantages.map((a, i) => `${i + 1}. ${a}`).join('\n')}

Generate:
1. THREE one-sentence positioning options, each leading with a different angle (problem-led, outcome-led, identity-led). Each must be testable, specific, and stated in audience-facing language.
2. THREE working brand names. Functional, not precious. The user is naming a TEST, not a final brand. Avoid generic SaaS-style names. Short, distinct.
3. THREE voice-adjective triples. Each triple should reflect HOW the offer must sound for THIS specific audience to trust it. No generic adjectives like "professional" or "friendly".

Return JSON: { "positioningOptions": [{ "sentence": string, "angle": "problem-led"|"outcome-led"|"identity-led", "reasoning": string }], "workingNames": [{ "name": string, "rationale": string }], "voiceTriples": [{ "adjectives": [string, string, string], "whyItFits": string }] }`,
      maxTokens: 2000,
    })
  },
)
