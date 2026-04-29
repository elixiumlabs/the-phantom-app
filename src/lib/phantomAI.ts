// Phantom domain AI — niche discovery, audience research, positioning,
// outreach drafting, signal analysis, next-action suggestion, daily briefs.
import { complete, completeJSON, type AIMessage } from './aiClient'
import type { Brand, Signal, ProofItem } from '@/contexts/BrandContext'

const SYSTEM = `You are Phantom — an autonomous brand-building system for faceless brand developers.
You execute the four-phase Phantom framework: Ghost Identity, Silent Test, Iteration Loop, Lock In.
You are decisive, concrete, and never give generic advice. Always reason from the user's actual data.
Output only what the schema requests. No preambles, no apologies, no disclaimers.`

// ---------- Niche Discovery ----------

export interface NicheOpportunity {
  niche: string
  problem: string
  audience: string
  unfairAngle: string
  marketSize: 'small' | 'medium' | 'large'
  competitionLevel: 'low' | 'medium' | 'high'
  monetizationPath: string
  score: number // 0-100
  reasoning: string
}

export async function discoverNiches(seed: string, count = 6): Promise<NicheOpportunity[]> {
  const messages: AIMessage[] = [
    { role: 'system', content: SYSTEM },
    {
      role: 'user',
      content: `Generate ${count} faceless brand niche opportunities based on this seed: "${seed}".

Each opportunity must be:
- Specific enough to validate in 30 days (no "fitness for everyone")
- Backed by a real, painful problem the audience already pays to solve
- Approachable as a faceless/anonymous brand (info products, services, communities, software)
- Scored 0-100 on overall opportunity quality (demand × accessibility × monetization speed × low-competition advantage)

Return JSON: { "opportunities": [{ "niche": string, "problem": string, "audience": string, "unfairAngle": string, "marketSize": "small"|"medium"|"large", "competitionLevel": "low"|"medium"|"high", "monetizationPath": string, "score": number, "reasoning": string }] }

Sort by score descending. Be brutally honest — score generic ideas low.`,
    },
  ]
  const data = await completeJSON<{ opportunities: NicheOpportunity[] }>({
    messages,
    temperature: 0.85,
  })
  return data.opportunities
}

// ---------- Audience Research ----------

export interface AudienceProfile {
  demographics: string
  psychographics: string
  painPoints: string[]
  desires: string[]
  objections: string[]
  whereTheyHangOut: string[]
  languageTheyUse: string[]
  whatTheyAlreadyBuy: string[]
}

export async function researchAudience(brand: Brand): Promise<AudienceProfile> {
  const phase1 = brand.phase1Data as Record<string, string>
  const messages: AIMessage[] = [
    { role: 'system', content: SYSTEM },
    {
      role: 'user',
      content: `Deep audience research for this brand:
Brand: ${brand.name}
Problem: ${phase1.problem || 'unspecified'}
Audience: ${phase1.audience || 'unspecified'}
Positioning: ${phase1.positioning || 'unspecified'}

Return JSON: { "demographics": string, "psychographics": string, "painPoints": string[], "desires": string[], "objections": string[], "whereTheyHangOut": string[] (specific subreddits/communities/forums/discord servers), "languageTheyUse": string[] (actual phrases they say, not corporate-speak), "whatTheyAlreadyBuy": string[] }

Be specific. List actual subreddit names like "r/digitalnomad" not "online communities".`,
    },
  ]
  return completeJSON<AudienceProfile>({ messages, temperature: 0.6 })
}

// ---------- Positioning Generation ----------

export interface PositioningKit {
  workingName: string
  oneLiner: string
  tagline: string
  voiceAdjectives: string[]
  hypothesis: string
  uniqueMechanism: string
}

export async function generatePositioning(seed: {
  problem: string
  audience: string
  unfairAdvantages: string[]
}): Promise<PositioningKit> {
  const messages: AIMessage[] = [
    { role: 'system', content: SYSTEM },
    {
      role: 'user',
      content: `Generate a Phase 01 positioning kit:
Problem: ${seed.problem}
Audience: ${seed.audience}
Unfair advantages: ${seed.unfairAdvantages.join('; ')}

Return JSON: { "workingName": string (functional codename, not final), "oneLiner": string (single sentence positioning), "tagline": string (≤8 words), "voiceAdjectives": string[3], "hypothesis": string ("I help [person] who is [problem] to achieve [outcome] without [avoidance]."), "uniqueMechanism": string (the *how* that makes this brand defensible) }`,
    },
  ]
  return completeJSON<PositioningKit>({ messages, temperature: 0.7 })
}

// ---------- Outreach Drafting ----------

export interface OutreachVariant {
  channel: string
  subjectOrHook: string
  body: string
  callToAction: string
  rationale: string
}

export async function draftOutreach(brand: Brand, count = 3): Promise<OutreachVariant[]> {
  const phase1 = brand.phase1Data as Record<string, string>
  const messages: AIMessage[] = [
    { role: 'system', content: SYSTEM },
    {
      role: 'user',
      content: `Draft ${count} silent-test outreach variants for Phase 02 (Silent Test).
Brand: ${brand.name}
Problem: ${phase1.problem}
Audience: ${phase1.audience}
Positioning: ${phase1.positioning || phase1.oneLiner || ''}

Each variant tests a different psychological angle (curiosity, status, fear-of-missing-out, contrarian, peer-mention). Channels: cold email, LinkedIn DM, Reddit comment, X reply, niche community post — pick what fits the audience.

Return JSON: { "variants": [{ "channel": string, "subjectOrHook": string, "body": string (≤120 words, no fluff), "callToAction": string, "rationale": string (why this angle works for this audience) }] }`,
    },
  ]
  const data = await completeJSON<{ variants: OutreachVariant[] }>({ messages, temperature: 0.85 })
  return data.variants
}

// ---------- Signal Analysis ----------

export interface SignalAnalysis {
  patternsDetected: string[]
  conversionInsight: string
  objectionThemes: string[]
  recommendedIteration: string
  confidence: number // 0-1
}

export async function analyzeSignals(brand: Brand, signals: Signal[]): Promise<SignalAnalysis> {
  if (signals.length === 0) {
    return {
      patternsDetected: ['No signals yet — start outreach to generate data'],
      conversionInsight: 'No conversion data',
      objectionThemes: [],
      recommendedIteration: 'Run first round of outreach (≥10 contacts) before iterating',
      confidence: 0,
    }
  }
  const summary = signals.map((s) => `[${s.type}] ${s.source}: ${s.notes}`).join('\n')
  const messages: AIMessage[] = [
    { role: 'system', content: SYSTEM },
    {
      role: 'user',
      content: `Analyze ${signals.length} signals for brand "${brand.name}".

Signals:
${summary}

Return JSON: { "patternsDetected": string[], "conversionInsight": string, "objectionThemes": string[], "recommendedIteration": string (the single most-leveraged variable to change next), "confidence": number 0-1 }`,
    },
  ]
  return completeJSON<SignalAnalysis>({ messages, temperature: 0.4 })
}

// ---------- Next Action ----------

export interface NextAction {
  brandId: string
  action: string
  reason: string
  urgency: 'low' | 'medium' | 'high'
  estimatedMinutes: number
}

export async function suggestNextAction(
  brand: Brand,
  signals: Signal[],
  proof: ProofItem[]
): Promise<NextAction> {
  const messages: AIMessage[] = [
    { role: 'system', content: SYSTEM },
    {
      role: 'user',
      content: `Brand: ${brand.name}
Phase: ${brand.currentPhase}
Signals: ${signals.length} (${signals.filter((s) => s.type === 'conversion').length} conversions, ${signals.filter((s) => s.type === 'objection').length} objections)
Proof items: ${proof.length}
Days since last update: ${Math.floor((Date.now() - new Date(brand.updatedAt).getTime()) / 86_400_000)}

What is the SINGLE next action this user should take to move this brand forward? Be specific and concrete. No vague advice.

Return JSON: { "action": string (1 sentence imperative), "reason": string (1 sentence), "urgency": "low"|"medium"|"high", "estimatedMinutes": number }`,
    },
  ]
  const result = await completeJSON<Omit<NextAction, 'brandId'>>({
    messages,
    temperature: 0.5,
  })
  return { ...result, brandId: brand.id }
}

// ---------- Daily Brief ----------

export async function generateDailyBrief(
  brands: Brand[],
  signals: Signal[],
  proof: ProofItem[]
): Promise<string> {
  if (brands.length === 0) {
    return 'No brands yet. Run niche discovery to spawn your first phantom brand.'
  }
  const summary = brands
    .map((b) => {
      const bs = signals.filter((s) => s.brandId === b.id)
      const bp = proof.filter((p) => p.brandId === b.id)
      return `- ${b.name} (${b.currentPhase}): ${bs.length} signals, ${bp.length} proof items, last touched ${Math.floor((Date.now() - new Date(b.updatedAt).getTime()) / 86_400_000)}d ago`
    })
    .join('\n')

  const messages: AIMessage[] = [
    { role: 'system', content: SYSTEM },
    {
      role: 'user',
      content: `Write today's brief for this brand portfolio (3-4 sentences max, no bullet points, no greetings, conversational but sharp):

${summary}

Lead with the single brand most worth attention today and why. End with the one decision they should make right now.`,
    },
  ]
  return complete({ messages, temperature: 0.7, maxTokens: 220 })
}

// ---------- Stress Test (Phase 1 steelman) ----------

export interface StressTest {
  steelmanAgainst: string
  steelmanFor: string
  criticalAssumption: string
  cheapestValidation: string
}

export async function runStressTest(hypothesis: string, audience: string): Promise<StressTest> {
  const messages: AIMessage[] = [
    { role: 'system', content: SYSTEM },
    {
      role: 'user',
      content: `Stress-test this brand hypothesis:
Hypothesis: ${hypothesis}
Audience: ${audience}

Return JSON: { "steelmanAgainst": string (strongest case this fails), "steelmanFor": string (strongest case this wins), "criticalAssumption": string (the single belief that, if wrong, kills the brand), "cheapestValidation": string (cheapest 7-day test to validate or kill that assumption) }`,
    },
  ]
  return completeJSON<StressTest>({ messages, temperature: 0.6 })
}
