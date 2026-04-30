import * as admin from 'firebase-admin'
import { z } from 'zod'
import { appendGenerationHistory, defineEngine } from '../lib/engine'

const Input = z.object({
  problemStatement: z.string().min(10).max(1000),
  audienceDescription: z.string().min(5).max(1000),
  project_id: z.string().min(1).optional(),
})
type In = z.infer<typeof Input>

interface Out extends Record<string, unknown> {
  problemPhrases: string[]
  emotionalDescriptors: string[]
  failedAttemptPhrases: string[]
  outcomePhrases: string[]
  jargonToAvoid: string[]
  examples: Array<{ verbatim: string; whereSaid: string }>
}

export const extractAudienceLanguage = defineEngine<In, Out>({
  id: 'extractAudienceLanguage',
  input: Input,
  plans: ['phantom_pro'],
  dailyLimit: 15,
  maxTokens: 2000,
  prompt: ({ input }) => `Extract the LITERAL language this audience uses when describing their problem in their own words.

Problem statement:
"""${input.problemStatement}"""

Audience:
"""${input.audienceDescription}"""

Return verbatim-style phrases. Not your reframe. Not your interpretation. The actual words this audience would type into Reddit, Google, group chats, or DMs.

- problemPhrases: how they describe the problem when venting (5-10)
- emotionalDescriptors: the feelings/states they name (5-10)
- failedAttemptPhrases: how they describe what they already tried that didn't work (5-10)
- outcomePhrases: how they describe what they wish was true instead (5-10)
- jargonToAvoid: industry/marketer terms this audience does NOT use about themselves (3-8)
- examples: 4-6 plausible verbatim quotes you would expect to see, paired with where they would be said (e.g. "r/specific-subreddit", "private group chat", "1:1 venting", "Google search")

Return JSON: { "problemPhrases": string[], "emotionalDescriptors": string[], "failedAttemptPhrases": string[], "outcomePhrases": string[], "jargonToAvoid": string[], "examples": [{ "verbatim": string, "whereSaid": string }] }`,
  persist: async (ctx, output) => {
    const written: string[] = []
    if (ctx.project) {
      written.push(
        await appendGenerationHistory({
          project_ref: ctx.project.ref,
          generator: 'extractAudienceLanguage',
          input: ctx.input,
          output,
        }),
      )
      const ref = ctx.project.ref.collection('audience_language').doc('main')
      await ref.set(
        {
          ...output,
          generated_at: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      )
      written.push(ref.path)
    }
    return { written_paths: written }
  },
})
