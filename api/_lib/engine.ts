import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ZodSchema } from 'zod'
import { generateJSON, getUserProvider, type Provider } from './ai'
import { gate, meterUsage, requirePlan, type Plan } from './guards'
import { logActivity } from './activity'
import { adminClient } from './supabase'
import { apiError, isApiError } from './auth'

export type GeneratorId =
  | 'refineProblemStatement'
  | 'extractUnfairAdvantages'
  | 'synthesizePositioning'
  | 'extractAudienceLanguage'
  | 'findWhereToTest'
  | 'buildMinimumOffer'
  | 'generateOutreach'
  | 'buildObjectionLibrary'
  | 'diagnoseOffer'
  | 'suggestIteration'
  | 'competitiveGapAnalysis'
  | 'positioningFromData'
  | 'recommendBrandIdentity'
  | 'buildNotFor'
  | 'structureTestimonial'
  | 'curateProofPackage'

export interface EngineContext<TInput> {
  uid: string
  input: TInput
  plan: Plan
  project?: { id: string; data: Record<string, unknown> }
}

export interface EngineSpec<TInput, TOutput extends Record<string, unknown>> {
  id: GeneratorId
  input: ZodSchema<TInput>
  plans: Plan[]
  dailyLimit: number
  maxTokens?: number
  temperature?: number
  prompt: (ctx: EngineContext<TInput>) => Promise<string> | string
  persist: (ctx: EngineContext<TInput>, output: TOutput) => Promise<{ written_paths: string[] }>
  activityMeta?: (output: TOutput) => Record<string, unknown>
}

async function loadProjectIfPresent<TInput>(
  uid: string,
  input: TInput,
): Promise<EngineContext<TInput>['project']> {
  const maybeId = (input as { project_id?: unknown } | null)?.project_id
  if (typeof maybeId !== 'string' || !maybeId) return undefined
  const db = adminClient()
  const { data, error } = await db.from('projects').select('*').eq('id', maybeId).single()
  if (error || !data) throw apiError(404, 'Project not found')
  if (data.user_id !== uid) throw apiError(403, 'Not your project')
  return { id: maybeId, data: data as Record<string, unknown> }
}

export async function appendGenerationHistory(args: {
  project_id: string
  generator: GeneratorId
  input: unknown
  output: unknown
}): Promise<string> {
  const db = adminClient()
  const { data } = await db
    .from('generations')
    .insert({ project_id: args.project_id, generator: args.generator, input: args.input, output: args.output })
    .select('id')
    .single()
  return `generations/${data?.id ?? 'unknown'}`
}

export function defineEngine<TInput, TOutput extends Record<string, unknown>>(
  spec: EngineSpec<TInput, TOutput>,
) {
  return async (req: VercelRequest, res: VercelResponse): Promise<void> => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' })
      return
    }
    try {
      const uid = await gate(req)
      const plan = await requirePlan(uid, spec.plans)

      const parsed = spec.input.safeParse(req.body)
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') })
        return
      }
      const input = parsed.data
      const project = await loadProjectIfPresent<TInput>(uid, input)

      await meterUsage(uid, spec.id, spec.dailyLimit)

      const ctx: EngineContext<TInput> = { uid, input, plan, project }

      let prompt: string
      try {
        prompt = await spec.prompt(ctx)
      } catch (err) {
        console.error('engine.prompt.failed', { id: spec.id, uid, error: (err as Error).message })
        throw apiError(500, `Generator ${spec.id} failed to build prompt`)
      }

      let output: TOutput
      try {
        const provider = await getUserProvider(uid)
        output = await generateJSON<TOutput>({
          user: prompt,
          maxTokens: spec.maxTokens ?? 1500,
          temperature: spec.temperature ?? 0.7,
          provider: provider as Provider,
        })
      } catch (err) {
        console.error('engine.ai.failed', { id: spec.id, uid, error: (err as Error).message })
        if (isApiError(err)) throw err
        throw apiError(503, `Generator ${spec.id} AI call failed`)
      }

      let written_paths: string[] = []
      try {
        const persisted = await spec.persist(ctx, output)
        written_paths = persisted.written_paths
      } catch (err) {
        console.error('engine.persist.failed', { id: spec.id, uid, error: (err as Error).message })
        await logActivity({
          user_id: uid,
          project_id: project?.id ?? null,
          action: 'generator_run',
          metadata: { generator: spec.id, persisted: false, error: (err as Error).message },
        })
        res.status(200).json({ output, written_paths: [], generator: spec.id, generated_at: new Date().toISOString() })
        return
      }

      await logActivity({
        user_id: uid,
        project_id: project?.id ?? null,
        action: 'generator_run',
        metadata: { generator: spec.id, plan, ...(spec.activityMeta?.(output) ?? {}) },
      })

      res.status(200).json({ output, written_paths, generator: spec.id, generated_at: new Date().toISOString() })
    } catch (err) {
      if (isApiError(err)) {
        res.status(err.status).json({ error: err.message })
      } else {
        console.error('engine.unhandled', err)
        res.status(500).json({ error: 'Internal server error' })
      }
    }
  }
}
