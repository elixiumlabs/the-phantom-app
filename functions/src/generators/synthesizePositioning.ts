import * as admin from 'firebase-admin'
import { z } from 'zod'
import { appendGenerationHistory, defineEngine } from '../lib/engine'

const Input = z.object({
  problemStatement: z.string().min(10).max(1000),
  unfairAdvantages: z.array(z.string().min(2)).min(1).max(20),
  project_id: z.string().min(1).optional(),
})
type In = z.infer<typeof Input>

interface Out extends Record<string, unknown> {
  positioningOptions: Array<{
    sentence: string
    angle: 'problem-led' | 'outcome-led' | 'identity-led'
    reasoning: string
  }>
  workingNames: Array<{ name: string; rationale: string }>
  voiceTriples: Array<{ adjectives: [string, string, string]; whyItFits: string }>
}

export const synthesizePositioning = defineEngine<In, Out>({
  id: 'synthesizePositioning',
  input: Input,
  plans: ['free', 'phantom', 'phantom_pro'],
  dailyLimit: 15,
  maxTokens: 2000,
  prompt: ({ input }) => `Synthesize hypothesis positioning options for a phantom-phase brand.

Problem statement:
"""${input.problemStatement}"""

Unfair advantages:
${input.unfairAdvantages.map((a, i) => `${i + 1}. ${a}`).join('\n')}

Generate:
1. THREE one-sentence positioning options, each leading with a different angle (problem-led, outcome-led, identity-led). Each must be testable, specific, and stated in audience-facing language.
2. THREE working brand names. Functional, not precious. The user is naming a TEST, not a final brand. Avoid generic SaaS-style names. Short, distinct.
3. THREE voice-adjective triples. Each triple should reflect HOW the offer must sound for THIS specific audience to trust it. No generic adjectives like "professional" or "friendly".

Return JSON: { "positioningOptions": [{ "sentence": string, "angle": "problem-led"|"outcome-led"|"identity-led", "reasoning": string }], "workingNames": [{ "name": string, "rationale": string }], "voiceTriples": [{ "adjectives": [string, string, string], "whyItFits": string }] }`,
  persist: async (ctx, output) => {
    const written: string[] = []
    if (ctx.project) {
      written.push(
        await appendGenerationHistory({
          project_ref: ctx.project.ref,
          generator: 'synthesizePositioning',
          input: ctx.input,
          output,
        }),
      )
      const giRef = ctx.project.ref.collection('ghost_identity').doc('main')
      await giRef.set(
        {
          ai_positioning_options: output.positioningOptions,
          ai_working_names: output.workingNames,
          ai_voice_triples: output.voiceTriples,
          ai_positioning_generated_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      )
      written.push(giRef.path)
    }
    return { written_paths: written }
  },
})
