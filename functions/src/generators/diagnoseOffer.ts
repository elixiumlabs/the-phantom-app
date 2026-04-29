import { onCall } from 'firebase-functions/v2/https'
import { z } from 'zod'
import { ANTHROPIC_API_KEY, generateJSON } from '../lib/anthropic'
import { gate, meterUsage, requirePlan, validate } from '../lib/guards'
import { loadOwnedProject } from '../lib/projectAccess'

const Input = z.object({ project_id: z.string().min(1) })

interface Output {
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

export const diagnoseOffer = onCall(
  { secrets: [ANTHROPIC_API_KEY], region: 'us-central1' },
  async (req) => {
    const uid = await gate(req)
    await requirePlan(uid, ['phantom_pro'])
    await meterUsage(uid, 'diagnoseOffer', 10)
    const { project_id } = validate(Input, req.data)
    const { ref } = await loadOwnedProject(uid, project_id)

    const [stSnap, insightsSnap, outreach] = await Promise.all([
      ref.collection('silent_test').doc('main').get(),
      ref.collection('insights').doc('main').get(),
      ref.collection('outreach_log').get(),
    ])
    const st = stSnap.data() ?? {}
    const insights = insightsSnap.data() ?? {}
    const total = outreach.size

    return generateJSON<Output>({
      user: `You are diagnosing a Phase 02 silent-test result. Be direct. Name the variable to change.

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
Be specific. No softening. One variable to change.`,
      maxTokens: 800,
      temperature: 0.3,
    })
  },
)
