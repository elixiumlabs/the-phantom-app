import * as admin from 'firebase-admin'
import { z } from 'zod'
import { appendGenerationHistory, defineEngine } from '../lib/engine'

const Input = z.object({ project_id: z.string().min(1) })
type In = z.infer<typeof Input>

interface Out extends Record<string, unknown> {
  diagnosis_code:
    | 'no_replies'
    | 'replies_no_conversations'
    | 'conversations_no_close'
    | 'converting_below_target'
    | 'no_conversion_after_30'
  diagnosis: string
  fix: string
  variable_to_change: 'problem_statement' | 'offer_structure' | 'positioning' | 'audience' | 'price' | 'proof'
  reasoning: string
}

export const diagnoseOffer = defineEngine<In, Out>({
  id: 'diagnoseOffer',
  input: Input,
  plans: ['phantom_pro'],
  dailyLimit: 10,
  maxTokens: 800,
  temperature: 0.3,
  prompt: async ({ project }) => {
    if (!project) throw new Error('project required')
    const [stSnap, insightsSnap, outreach] = await Promise.all([
      project.ref.collection('silent_test').doc('main').get(),
      project.ref.collection('insights').doc('main').get(),
      project.ref.collection('outreach_log').get(),
    ])
    const st = stSnap.data() ?? {}
    const insights = insightsSnap.data() ?? {}
    const total = outreach.size

    return `You are diagnosing a Phase 02 silent-test result. Be direct. Name the variable to change.

Total outreach: ${total}
Response rate: ${insights.response_rate ?? 0}
Conversion rate: ${insights.conversion_rate ?? 0}
Target conversion rate: ${st.target_conversion_rate ?? 'unset'}
Top objections: ${JSON.stringify(insights.top_objections ?? [])}
Best platform: ${JSON.stringify(insights.best_platform ?? null)}

Diagnosis decision tree (PRD §11):
- no_replies → problem framing wrong; revise problem statement
- replies_no_conversations → offer doesn't land as obvious solution; revise offer structure
- conversations_no_close → check objections (price/trust/proof); address most frequent
- converting_below_target → messaging needs sharpening; revise positioning
- no_conversion_after_30 → audience definition broken; rebuild

Return JSON: { "diagnosis_code": ..., "diagnosis": string, "fix": string, "variable_to_change": ..., "reasoning": string }
Be specific. No softening. One variable to change.`
  },
  persist: async (ctx, output) => {
    if (!ctx.project) return { written_paths: [] }
    const written: string[] = []
    written.push(
      await appendGenerationHistory({
        project_ref: ctx.project.ref,
        generator: 'diagnoseOffer',
        input: ctx.input,
        output,
      }),
    )
    const ilRef = ctx.project.ref.collection('iteration_loop').doc('main')
    await ilRef.set(
      {
        diagnosis: output.diagnosis,
        diagnosis_code: output.diagnosis_code,
        diagnosis_fix: output.fix,
        diagnosis_variable: output.variable_to_change,
        diagnosis_generated_at: admin.firestore.FieldValue.serverTimestamp(),
        checklist: { diagnosis_done: true },
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    )
    written.push(ilRef.path)
    return { written_paths: written }
  },
  activityMeta: (out) => ({ diagnosis_code: out.diagnosis_code, variable: out.variable_to_change }),
})
