import { memo, useMemo, useState } from 'react'
import { Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react'
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

  const analysis = useMemo(() => evaluateBrandDraft(draft), [draft])

  return (
    <div className="flex min-h-screen bg-phantom-black">
      <AppSidebar />
      <main className="flex-1 ml-60 p-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div className="mb-8">
            <h1 className="font-display font-bold text-[28px] text-phantom-text-primary mb-1">
              AI Brand Assistant
            </h1>
            <p className="font-body text-[14px] text-phantom-text-secondary">
              Get instant feedback on positioning clarity, offer framing, and message strength before you publish.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card">
              <p className="label text-phantom-lime mb-3">Draft your positioning</p>
              <textarea
                className="input min-h-[240px]"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Paste your current positioning/offer message here..."
              />
              <p className="font-body text-[12px] text-phantom-text-muted mt-3">
                Tip: Include audience, specific problem, and measurable outcome.
              </p>
            </div>

            <div className="space-y-4">
              <div className="card">
                <p className="label mb-3 flex items-center gap-2"><Sparkles size={13} /> Assistant feedback</p>
                {draft.trim().length === 0 ? (
                  <p className="font-body text-[13px] text-phantom-text-secondary">
                    Start by pasting a draft. I’ll flag weak spots and confirm strong signals.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="font-ui text-[11px] uppercase tracking-wider text-phantom-text-muted mb-2">Strengths</p>
                      <div className="space-y-2">
                        {analysis.strengths.length === 0 ? (
                          <p className="font-body text-[13px] text-phantom-text-muted">No clear strengths yet.</p>
                        ) : (
                          analysis.strengths.map((s) => (
                            <p key={s} className="font-body text-[13px] text-phantom-text-secondary flex items-start gap-2">
                              <CheckCircle2 size={14} className="text-phantom-lime mt-0.5" /> {s}
                            </p>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="font-ui text-[11px] uppercase tracking-wider text-phantom-text-muted mb-2">Gaps to fix</p>
                      <div className="space-y-2">
                        {analysis.issues.length === 0 ? (
                          <p className="font-body text-[13px] text-phantom-lime">No obvious issues detected.</p>
                        ) : (
                          analysis.issues.map((i) => (
                            <p key={i} className="font-body text-[13px] text-phantom-text-secondary flex items-start gap-2">
                              <AlertTriangle size={14} className="text-phantom-warning mt-0.5" /> {i}
                            </p>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
})

AIBrandAssistantPage.displayName = 'AIBrandAssistantPage'
export default AIBrandAssistantPage
