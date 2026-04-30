import { z } from 'zod'
import * as admin from 'firebase-admin'
import { appendGenerationHistory, defineEngine } from '../lib/engine'

const Input = z.object({
  draft: z.string().min(10).max(2000),
  project_id: z.string().min(1).optional(),
})
type In = z.infer<typeof Input>

interface Out extends Record<string, unknown> {
  refined: Array<{
    statement: string
    tightened: 'specificity' | 'audience' | 'outcome' | 'avoidance'
    note: string
  }>
}

export const refineProblemStatement = defineEngine<In, Out>({
  id: 'refineProblemStatement',
  input: Input,
  plans: ['free', 'phantom', 'phantom_pro'],
  dailyLimit: 20,
  maxTokens: 1200,
  prompt: ({ input, project }) => `The user wrote this rough Phase 01 problem statement.

"""${input.draft}"""
${project ? `\nProject context: ${project.data.name}` : ''}

Phantom requires the format: "I help [specific type of person] who is experiencing [specific named problem] to achieve [specific measurable outcome] without [the thing they most want to avoid]."

Return 3 refined versions, each fixing a different weakness:
- one tightens SPECIFICITY of the person
- one sharpens the named PROBLEM in audience-facing words
- one makes the OUTCOME more measurable OR makes the AVOIDANCE more specific

For each, write a short note explaining what you tightened and why.

Return JSON: { "refined": [{ "statement": string, "tightened": "specificity"|"audience"|"outcome"|"avoidance", "note": string }] }`,
  persist: async (ctx, output) => {
    const written: string[] = []
    if (ctx.project) {
      const path = await appendGenerationHistory({
        project_ref: ctx.project.ref,
        generator: 'refineProblemStatement',
        input: ctx.input,
        output,
      })
      written.push(path)
      // Stash latest options on ghost_identity for the UI to pick from.
      const giRef = ctx.project.ref.collection('ghost_identity').doc('main')
      await giRef.set(
        {
          ai_problem_options: output.refined,
          ai_problem_generated_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      )
      written.push(giRef.path)
    }
    return { written_paths: written }
  },
  activityMeta: (out) => ({ option_count: out.refined.length }),
})
