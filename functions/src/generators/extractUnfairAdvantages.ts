import * as admin from 'firebase-admin'
import { z } from 'zod'
import { appendGenerationHistory, defineEngine } from '../lib/engine'

const Input = z.object({
  background: z.string().min(20).max(4000),
  problemStatement: z.string().max(1000).optional(),
  project_id: z.string().min(1).optional(),
})
type In = z.infer<typeof Input>

interface Out extends Record<string, unknown> {
  advantages: Array<{
    advantage: string
    type: 'experience' | 'survived' | 'built' | 'access' | 'knowledge'
    credibilityScore: number
    reasoning: string
  }>
  rejected: Array<{ claim: string; reason: string }>
}

export const extractUnfairAdvantages = defineEngine<In, Out>({
  id: 'extractUnfairAdvantages',
  input: Input,
  plans: ['free', 'phantom', 'phantom_pro'],
  dailyLimit: 20,
  maxTokens: 1800,
  prompt: ({ input }) => `Extract the user's unfair advantages from their background.

Background:
"""${input.background}"""
${input.problemStatement ? `\nProblem they are trying to solve:\n"""${input.problemStatement}"""\n` : ''}
RULES:
- Only ACTUAL advantages: things they have done, survived, built, accessed, or specifically learned. Not aspirational ones.
- Rank by credibility a skeptical stranger would assign (0-100), not by how the user feels about them.
- Reject any aspirational or vague claims and explain why in "rejected".
- If a problem statement is provided, weight advantages by their relevance to that specific audience.

Return JSON: { "advantages": [{ "advantage": string, "type": "experience"|"survived"|"built"|"access"|"knowledge", "credibilityScore": number, "reasoning": string }], "rejected": [{ "claim": string, "reason": string }] }

Sort advantages by credibilityScore descending.`,
  persist: async (ctx, output) => {
    const written: string[] = []
    if (ctx.project) {
      written.push(
        await appendGenerationHistory({
          project_ref: ctx.project.ref,
          generator: 'extractUnfairAdvantages',
          input: ctx.input,
          output,
        }),
      )
      const giRef = ctx.project.ref.collection('ghost_identity').doc('main')
      await giRef.set(
        {
          ai_advantage_options: output.advantages,
          ai_rejected_claims: output.rejected,
          ai_advantages_generated_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      )
      written.push(giRef.path)
    }
    return { written_paths: written }
  },
  activityMeta: (out) => ({ kept: out.advantages.length, rejected: out.rejected.length }),
})
