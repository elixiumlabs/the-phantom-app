import { GoogleGenerativeAI } from '@google/generative-ai'
import { apiError } from './auth'

export type Provider =
  | 'gemini'
  | 'groq'
  | 'groq_fast'
  | 'qwen'
  | 'groq_compound'
  | 'openrouter'

const GEMINI_MODEL = 'gemini-1.5-flash'
const GROQ_MODEL = 'llama-3.3-70b-versatile'
const GROQ_FAST_MODEL = 'llama-3.1-8b-instant'
const QWEN_MODEL = 'qwen/qwen3-32b'
const GROQ_COMPOUND_MODEL = 'groq/compound'
const DEFAULT_OPENROUTER_MODEL = 'openrouter/auto'

export const PHANTOM_SYSTEM = `You are Phantom — the private operating system for pre-launch brand validation.
You execute the four-phase Phantom methodology: Ghost Identity, Silent Test, Iteration Loop, Lock In.
You are decisive, concrete, and never give generic advice. You reason from the user's actual data.
Output only what the schema requests. No preambles, no apologies, no disclaimers, no hype, no emojis.`

interface JsonCallOpts {
  user: string
  system?: string
  maxTokens?: number
  temperature?: number
  provider?: Provider
}

export async function generateJSON<T>(opts: JsonCallOpts): Promise<T> {
  const provider: Provider = opts.provider ?? 'gemini'
  const system = opts.system ?? PHANTOM_SYSTEM
  const maxTokens = opts.maxTokens ?? 1500
  const temperature = opts.temperature ?? 0.7

  let raw: string
  try {
    if (provider === 'gemini') {
      raw = await callGemini({ user: opts.user, system, maxTokens, temperature })
    } else if (provider === 'openrouter') {
      raw = await callOpenRouter({ user: opts.user, system, maxTokens, temperature })
    } else {
      const model =
        provider === 'groq' ? GROQ_MODEL :
        provider === 'groq_fast' ? GROQ_FAST_MODEL :
        provider === 'qwen' ? QWEN_MODEL :
        GROQ_COMPOUND_MODEL
      raw = await callGroq({ user: opts.user, system, maxTokens, temperature, model })
    }
  } catch (err) {
    if (typeof (err as { status?: unknown }).status === 'number') throw err
    throw apiError(503, `AI generation failed (${provider}): ${(err as Error).message}`)
  }

  if (!raw) throw apiError(503, `AI (${provider}) returned no text`)

  try {
    return JSON.parse(raw) as T
  } catch {
    const cleaned = raw.replace(/```(?:json)?/gi, '').trim()
    try {
      return JSON.parse(cleaned) as T
    } catch (e) {
      throw apiError(503, `AI (${provider}) returned invalid JSON: ${(e as Error).message}`)
    }
  }
}

let geminiClient: GoogleGenerativeAI | null = null
async function callGemini(args: { user: string; system: string; maxTokens: number; temperature: number }): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw apiError(503, 'GEMINI_API_KEY not configured')
  if (!geminiClient) geminiClient = new GoogleGenerativeAI(apiKey)
  const model = geminiClient.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: { temperature: args.temperature, maxOutputTokens: args.maxTokens, responseMimeType: 'application/json' },
  })
  const result = await model.generateContent(`${args.system}\n\n${args.user}`)
  return result.response.text()
}

async function callGroq(args: { user: string; system: string; maxTokens: number; temperature: number; model: string }): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw apiError(503, 'GROQ_API_KEY not configured')
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: args.model,
      messages: [{ role: 'system', content: args.system }, { role: 'user', content: args.user }],
      temperature: args.temperature,
      max_tokens: args.maxTokens,
      response_format: { type: 'json_object' },
    }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Groq HTTP ${res.status}: ${body.slice(0, 400)}`)
  }
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
  return data.choices?.[0]?.message?.content ?? ''
}

async function callOpenRouter(args: { user: string; system: string; maxTokens: number; temperature: number }): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw apiError(503, 'OPENROUTER_API_KEY not configured')
  const model = process.env.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'https://thephantom.app',
      'X-OpenRouter-Title': process.env.OPENROUTER_APP_TITLE || 'Phantom',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: args.system }, { role: 'user', content: args.user }],
      temperature: args.temperature,
      max_tokens: args.maxTokens,
      response_format: { type: 'json_object' },
    }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`OpenRouter HTTP ${res.status}: ${body.slice(0, 400)}`)
  }
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
  return data.choices?.[0]?.message?.content ?? ''
}

export async function getUserProvider(uid: string): Promise<Provider> {
  try {
    const { adminClient } = await import('./supabase')
    const db = adminClient()
    const { data } = await db.from('users').select('llm_provider').eq('id', uid).single()
    const v = data?.llm_provider
    if (v === 'gemini' || v === 'groq' || v === 'groq_fast' || v === 'qwen' || v === 'groq_compound' || v === 'openrouter') return v
  } catch { /* ignore */ }
  return 'gemini'
}
