import { memo, useMemo, useState } from 'react'
import { Sparkles, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import AppSidebar from '@/components/app/AppSidebar'

function evaluateBrandDraft(input: string) {
  const text = input.toLowerCase()
  const issues: string[] = []
  const strengths: string[] = []

  if (input.trim().length < 120) {
    issues.push('Too short. Add audience, problem, and concrete outcome.')
  } else {
    strengths.push('Good detail depth for a first pass.')
  }

  if (!/who|for|founder|creator|agency|coach|team|business|customer/.test(text)) {
    issues.push('Audience is unclear. Name exactly who this is for.')
  } else {
    strengths.push('Audience appears to be specified.')
  }

  if (!/problem|struggle|pain|stuck|frustrat|overwhelm|waste/.test(text)) {
    issues.push('Problem language is weak. Describe the pain in buyer terms.')
  } else {
    strengths.push('Problem framing is present.')
  }

  if (!/result|outcome|increase|reduce|save|convert|revenue|growth|booked/.test(text)) {
    issues.push('Outcome is vague. Add measurable or observable results.')
  } else {
    strengths.push('Outcome signal is present.')
  }

  return { issues, strengths }
}

const AIBrandAssistantPage = memo(() => {
  const [draft, setDraft] = useState('')
  const [submittedDraft, setSubmittedDraft] = useState('')

  const analysis = useMemo(() => evaluateBrandDraft(submittedDraft), [submittedDraft])

  const submit = () => {
    if (!draft.trim()) return
    setSubmittedDraft(draft.trim())
    setDraft('')
  }

  return (
    <div className="flex min-h-screen bg-phantom-black">
      <AppSidebar />
      <main className="flex-1 ml-60 h-screen flex flex-col">
        <motion.div
          className="px-8 pt-8 pb-4 border-b border-phantom-border-subtle"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div>
            <h1 className="font-display font-bold text-[24px] text-phantom-text-primary mb-1">
              AI Brand Assistant
            </h1>
            <p className="font-body text-[13px] text-phantom-text-secondary">
              Chat-style feedback on your positioning and offer messaging.
            </p>
          </div>
        </motion.div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-phantom-lime/20 border border-phantom-lime/40 flex items-center justify-center shrink-0">
              <Sparkles size={14} className="text-phantom-lime" />
            </div>
            <div className="max-w-3xl rounded-2xl rounded-tl-md bg-[#111] border border-phantom-border-subtle p-4">
              <p className="font-body text-[13px] text-phantom-text-secondary leading-relaxed">
                Paste a positioning or offer draft and I’ll review it like a brand strategist. I’ll flag what’s strong, what’s weak, and what to tighten.
              </p>
            </div>
          </div>

          {submittedDraft && (
            <>
              <div className="flex items-start justify-end gap-3">
                <div className="max-w-3xl rounded-2xl rounded-tr-md bg-phantom-lime/15 border border-phantom-lime/30 p-4">
                  <p className="font-body text-[13px] text-phantom-text-primary whitespace-pre-wrap leading-relaxed">
                    {submittedDraft}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-phantom-lime/20 border border-phantom-lime/40 flex items-center justify-center shrink-0">
                  <Sparkles size={14} className="text-phantom-lime" />
                </div>
                <div className="max-w-3xl rounded-2xl rounded-tl-md bg-[#111] border border-phantom-border-subtle p-4 space-y-3">
                  <p className="font-ui text-[11px] uppercase tracking-wider text-phantom-text-muted">Assistant feedback</p>

                  <div>
                    <p className="font-ui text-[11px] uppercase tracking-wider text-phantom-text-muted mb-1.5">Strengths</p>
                    {analysis.strengths.length === 0 ? (
                      <p className="font-body text-[13px] text-phantom-text-muted">No clear strengths detected yet.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {analysis.strengths.map((s) => (
                          <li key={s} className="font-body text-[13px] text-phantom-text-secondary">• {s}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <p className="font-ui text-[11px] uppercase tracking-wider text-phantom-text-muted mb-1.5">What to fix next</p>
                    {analysis.issues.length === 0 ? (
                      <p className="font-body text-[13px] text-phantom-lime">No major issues detected. This is strong enough to test.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {analysis.issues.map((i) => (
                          <li key={i} className="font-body text-[13px] text-phantom-text-secondary">• {i}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="px-8 py-4 border-t border-phantom-border-subtle bg-[#0d0d0d]">
          <div className="max-w-4xl mx-auto flex gap-3">
            <textarea
              className="input min-h-[52px] max-h-36 resize-y"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Message AI Brand Assistant..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  submit()
                }
              }}
            />
            <button className="btn-primary self-end" onClick={submit} disabled={!draft.trim()}>
              <Send size={14} /> Send
            </button>
          </div>
        </div>
      </main>
    </div>
  )
})

AIBrandAssistantPage.displayName = 'AIBrandAssistantPage'
export default AIBrandAssistantPage
