import * as admin from 'firebase-admin'
import { z } from 'zod'
import { appendGenerationHistory, defineEngine } from '../lib/engine'

const Input = z.object({ project_id: z.string().min(1) })
type In = z.infer<typeof Input>

interface Out extends Record<string, unknown> {
  variable_to_change: string
  hypothesis: string
  exact_change: string
  measure: string
  expected_signal: string
  do_not_change: string[]
}

export const suggestIteration = defineEngine<In, Out>({
  id: 'suggestIteration',
  input: Input,
  plans: ['free', 'phantom', 'phantom_pro'],
  dailyLimit: 15,
  maxTokens: 900,
  temperature: 0.4,
  prompt: async ({ project }) => {
    if (!project) throw new Error('project required')
    const [stSnap, ilSnap, insightsSnap] = await Promise.all([
      project.ref.collection('silent_test').doc('main').get(),
      project.ref.collection('iteration_loop').doc('main').get(),
      project.ref.collection('insights').doc('main').get(),
    ])
    const st = stSnap.data() ?? {}
    const il = ilSnap.data() ?? {}
    const insights = insightsSnap.data() ?? {}

    return `Recommend the SINGLE next iteration. One variable. One hypothesis. One way to measure.

Diagnosis: """${il.diagnosis ?? '—'}"""
Suggested variable from diagnosis: ${il.diagnosis_variable ?? '—'}
Offer summary: ${st.offer_name ?? ''} — ${st.offer_outcome ?? ''}
Conversion rate: ${insights.conversion_rate ?? 0}
Target: ${st.target_conversion_rate ?? 'unset'}
Top objection: ${insights.top_objections?.[0]?.objection ?? '—'}

The phantom methodology forbids changing more than one variable per iteration. Pick the one with the highest expected information gain.

Return JSON: { "variable_to_change": string, "hypothesis": string, "exact_change": string, "measure": string, "expected_signal": string, "do_not_change": string[] }

- exact_change: a concrete, copyable instruction (e.g., "Replace the offer outcome line with: ...").
- measure: which metric will tell you it worked, and what threshold counts as a win.
- do_not_change: 2-4 things the user should explicitly leave alone this round.`
  },
  persist: async (ctx, output) => {
    if (!ctx.project) return { written_paths: [] }
    const written: string[] = []
    written.push(
      await appendGenerationHistory({
        project_ref: ctx.project.ref,
        generator: 'suggestIteration',
        input: ctx.input,
        output,
      }),
    )
    const ref = ctx.project.ref.collection('iteration_suggestions').doc()
    await ref.set({
      ...output,
      acted_on: false,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    })
    written.push(ref.path)
    return { written_paths: written }
  },
})
