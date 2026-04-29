// Production AI client for Phantom.
// Uses OpenAI-compatible endpoint (works with OpenAI, OpenRouter, Together, Anthropic-via-proxy, etc.)
// Set VITE_OPENAI_API_KEY and optionally VITE_AI_BASE_URL + VITE_AI_MODEL.

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string | undefined
const BASE_URL = (import.meta.env.VITE_AI_BASE_URL as string | undefined) || 'https://api.openai.com/v1'
const MODEL = (import.meta.env.VITE_AI_MODEL as string | undefined) || 'gpt-4o-mini'

export class AIError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message)
    this.name = 'AIError'
  }
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface CompletionOptions {
  messages: AIMessage[]
  temperature?: number
  maxTokens?: number
  json?: boolean
  signal?: AbortSignal
}

export function isAIConfigured(): boolean {
  return !!API_KEY
}

export async function complete(opts: CompletionOptions): Promise<string> {
  if (!API_KEY) {
    throw new AIError('AI is not configured. Set VITE_OPENAI_API_KEY in .env.local')
  }

  const body: Record<string, unknown> = {
    model: MODEL,
    messages: opts.messages,
    temperature: opts.temperature ?? 0.7,
  }
  if (opts.maxTokens) body.max_tokens = opts.maxTokens
  if (opts.json) body.response_format = { type: 'json_object' }

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
    signal: opts.signal,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new AIError(`AI request failed (${res.status}): ${text.slice(0, 200)}`, res.status)
  }

  const data = await res.json()
  const content = data?.choices?.[0]?.message?.content
  if (typeof content !== 'string') {
    throw new AIError('AI returned no content')
  }
  return content
}

export async function completeJSON<T>(opts: Omit<CompletionOptions, 'json'>): Promise<T> {
  const raw = await complete({ ...opts, json: true })
  try {
    return JSON.parse(raw) as T
  } catch {
    // Some providers wrap JSON in markdown — strip and retry
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
    return JSON.parse(cleaned) as T
  }
}
