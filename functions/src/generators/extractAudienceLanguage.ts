import { onCall } from 'firebase-functions/v2/https'
import { z } from 'zod'
import { ANTHROPIC_API_KEY, generateJSON } from '../lib/anthropic'
import { meterUsage, requireAuth, requirePlan, validate } from '../lib/guards'

const Input = z.object({
  problemStatement: z.string().min(10).max(1000),
  audienceDescription: z.string().min(5).max(1000),
})

interface Output {
  problemPhrases: string[]
  emotionalDescriptors: string[]
  failedAttemptPhrases: string[]
  outcomePhrases: string[]
  jargonToAvoid: string[]
  examples: Array<{ verbatim: string; whereSaid: string }>
}

export const extractAudienceLanguage = onCall(
  { secrets: [ANTHROPIC_API_KEY], region: 'us-central1' },
  async (req) => {
    const uid = requireAuth(req)
    await requirePlan(uid, ['free', 'phantom', 'phantom_pro'])
    await meterUsage(uid, 'extractAudienceLanguage', 15)

    const { problemStatement, audienceDescription } = validate(Input, req.data)

    return generateJSON<Output>({
      user: `Extract the LITERAL language this audience uses when describing their problem in their own words.

Problem statement:
"""${problemStatement}"""

Audience:
"""${audienceDescription}"""

Return verbatim-style phrases. Not your reframe. Not your interpretation. The actual words this audience would type into Reddit, Google, group chats, or DMs.

- problemPhrases: how they describe the problem when venting (5-10)
- emotionalDescriptors: the feelings/states they name (5-10)
- failedAttemptPhrases: how they describe what they already tried that didn't work (5-10)
- outcomePhrases: how they describe what they wish was true instead (5-10)
- jargonToAvoid: industry/marketer terms this audience does NOT use about themselves (3-8)
- examples: 4-6 plausible verbatim quotes you would expect to see, paired with where they would be said (e.g. "r/specific-subreddit", "private group chat", "1:1 venting", "Google search")

Return JSON: { "problemPhrases": string[], "emotionalDescriptors": string[], "failedAttemptPhrases": string[], "outcomePhrases": string[], "jargonToAvoid": string[], "examples": [{ "verbatim": string, "whereSaid": string }] }`,
      maxTokens: 2000,
    })
  },
)
