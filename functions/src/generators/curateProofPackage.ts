import { onCall } from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'
import { z } from 'zod'
import { ANTHROPIC_API_KEY, generateJSON } from '../lib/anthropic'
import { gate, meterUsage, requirePlan, validate } from '../lib/guards'
import { loadOwnedProject } from '../lib/projectAccess'

const Input = z.object({ project_id: z.string().min(1) })

interface Output {
  selected: Array<{
    proof_id: string
    proof_type: string
    why_it_belongs: string
    skeptic_score: number
  }>
  missing_categories: string[]
  recommendation: string
}

export const curateProofPackage = onCall(
  { secrets: [ANTHROPIC_API_KEY], region: 'us-central1' },
  async (req) => {
    const uid = await gate(req)
    await requirePlan(uid, ['free', 'phantom', 'phantom_pro'])
    await meterUsage(uid, 'curateProofPackage', 10)
    const { project_id } = validate(Input, req.data)
    await loadOwnedProject(uid, project_id)

    const vault = await admin
      .firestore()
      .collection('proof_vault')
      .where('project_id', '==', project_id)
      .get()

    const items = vault.docs.map((d) => ({
      id: d.id,
      type: d.data().proof_type,
      title: d.data().title,
      content: (d.data().content as string | undefined)?.slice(0, 600) ?? '',
      amount: d.data().amount ?? null,
      source: d.data().source ?? null,
      date: d.data().date ?? null,
    }))

    if (items.length === 0) {
      return {
        selected: [],
        missing_categories: ['screenshot', 'testimonial', 'case_study', 'revenue', 'conversion_data'],
        recommendation: 'No proof in the vault yet. Phase 04 lock-in requires at least 3 credible pieces.',
      } satisfies Output
    }

    return generateJSON<Output>({
      user: `Curate the strongest proof package from this vault. A skeptical stranger must find it credible.

Vault items:
${JSON.stringify(items, null, 2)}

Return JSON: { "selected": [{ "proof_id": string, "proof_type": string, "why_it_belongs": string, "skeptic_score": number }], "missing_categories": string[], "recommendation": string }

- Pick at least 3, no more than 7.
- skeptic_score 0-100: how much weight a stranger would give this piece.
- missing_categories: which proof types are absent that the package would benefit from.
- recommendation: ONE sentence on how to strengthen the package next.`,
      maxTokens: 1800,
      temperature: 0.3,
    })
  },
)
