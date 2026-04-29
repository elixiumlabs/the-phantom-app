import { memo, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { X, Loader } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBrands } from '@/contexts/BrandContext'

interface StressTestResult {
  steelman_against: string
  steelman_for: string
  critical_assumption: string
  cheapest_validation_method: string
}

const PhaseIdentify = memo(() => {
  const { id } = useParams()
  const { getBrand, updateBrand } = useBrands()
  const brand = getBrand(id!)

  const p1 = (brand?.phase1Data ?? {}) as Record<string, string | string[]>

  const [person, setPerson] = useState((p1.person as string) ?? '')
  const [problem, setProblem] = useState((p1.problem as string) ?? '')
  const [outcome, setOutcome] = useState((p1.outcome as string) ?? '')
  const [avoid, setAvoid] = useState((p1.avoid as string) ?? '')

  const [advantages, setAdvantages] = useState<string[]>((p1.advantages as string[]) ?? [])
  const [newAdvantage, setNewAdvantage] = useState('')

  const [workingName, setWorkingName] = useState((p1.workingName as string) ?? '')
  const [positioning, setPositioning] = useState((p1.positioning as string) ?? '')
  const [brandVoice, setBrandVoice] = useState((p1.brandVoice as string) ?? '')

  const [stressTest, setStressTest] = useState<StressTestResult | null>(
    p1.stressTest ? (p1.stressTest as unknown as StressTestResult) : null
  )
  const [stressTestRunning, setStressTestRunning] = useState(false)
  const [stressTestOpen, setStressTestOpen] = useState(false)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const hypothesis =
    person && problem && outcome && avoid
      ? `I help ${person} who is experiencing ${problem} to achieve ${outcome} without ${avoid}.`
      : ''

  const gate = {
    hypothesis: !!hypothesis,
    advantages: advantages.length >= 3,
    positioning: positioning.trim().length > 0,
    stressTest: !!stressTest,
  }
  const allGatePassed = Object.values(gate).every(Boolean)

  const saveData = useCallback(async () => {
    if (!id) return
    setSaving(true)
    updateBrand(id, {
      phase1Data: {
        person, problem, outcome, avoid,
        advantages, workingName, positioning, brandVoice,
        stressTest: stressTest ?? undefined,
      },
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [id, person, problem, outcome, avoid, advantages, workingName, positioning, brandVoice, stressTest, updateBrand])

  const advancePhase = async () => {
    if (!id || !allGatePassed) return
    await saveData()
    updateBrand(id, { currentPhase: 'test' })
  }

  const addAdvantage = () => {
    const trimmed = newAdvantage.trim()
    if (trimmed && advantages.length < 10) {
      setAdvantages(prev => [...prev, trimmed])
      setNewAdvantage('')
    }
  }

  const removeAdvantage = (i: number) => setAdvantages(prev => prev.filter((_, idx) => idx !== i))

  const runStressTest = async () => {
    if (!hypothesis) return
    setStressTestRunning(true)
    setStressTestOpen(true)

    await new Promise(r => setTimeout(r, 1800))

    const result: StressTestResult = {
      steelman_against: `The core assumption—that your target audience will pay to solve "${problem}"—has not been validated. Most founders discover that their target person has the problem but lacks urgency or budget to solve it. The market for "${person}" may already be served by free or cheaper alternatives that require no behavioral change.`,
      steelman_for: `The specificity of your positioning is a real advantage. Solving "${problem}" for "${person}" is narrow enough to be ownable. If this person exists in sufficient numbers and the problem is as acute as described, the barrier to a first sale is primarily messaging and distribution—not product complexity.`,
      critical_assumption: `That "${person}" actively wants to solve "${problem}" badly enough to pay for a solution and that they do not have a cheaper workaround that is "good enough" already.`,
      cheapest_validation_method: `Write 20 cold DMs to people who match your "${person}" description on LinkedIn or in a niche community. Do not pitch. Ask: "What's the most expensive part of dealing with ${problem} for you right now?" Count replies. If fewer than 4 of 20 respond substantively, the problem framing is wrong.`,
    }

    setStressTest(result)
    setStressTestRunning(false)
    updateBrand(id!, {
      phase1Data: {
        person, problem, outcome, avoid,
        advantages, workingName, positioning, brandVoice,
        stressTest: result,
      },
    })
  }

  if (!brand) return null

  return (
    <motion.div
      className="max-w-3xl"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="mb-8">
        <p className="label text-phantom-lime mb-2">Phase 01 — Ghost Identity</p>
        <h1 className="font-display font-bold text-[32px] text-phantom-text-primary mb-3">
          Define the hypothesis.
        </h1>
        <p className="font-body text-[16px] text-phantom-text-secondary">
          Nothing is locked in yet. You are building a working hypothesis, not a brand. Answer each section precisely.
        </p>
      </div>

      {/* Section 1 — Problem Definition */}
      <div className="card mb-6">
        <p className="label mb-4">The Problem</p>
        <p className="font-body text-[14px] text-phantom-text-secondary mb-4">
          Write one sentence completing this structure:
        </p>

        <div className="bg-[#0d0d0d] border border-phantom-border-subtle rounded p-4 mb-6 font-body text-[13px] text-phantom-text-muted leading-relaxed">
          I help [specific type of person] who is experiencing [specific named problem] to achieve [specific measurable outcome] without [the thing they most want to avoid].
        </div>

        <div className="space-y-4 mb-6">
          {[
            { label: 'Specific type of person', val: person, set: setPerson, ph: 'e.g. solo founders building their first SaaS' },
            { label: 'Specific named problem', val: problem, set: setProblem, ph: 'e.g. launching without validated demand' },
            { label: 'Specific measurable outcome', val: outcome, set: setOutcome, ph: 'e.g. 5 paying customers before going public' },
            { label: 'What they most want to avoid', val: avoid, set: setAvoid, ph: 'e.g. building an audience before having proof' },
          ].map(({ label, val, set, ph }) => (
            <div key={label}>
              <label className="label text-phantom-text-secondary mb-2 block">{label}</label>
              <input className="input" value={val} onChange={e => set(e.target.value)} placeholder={ph} />
            </div>
          ))}
        </div>

        <AnimatePresence>
          {hypothesis && (
            <motion.div
              className="bg-[#0a1900] border border-phantom-lime/40 rounded p-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <p className="label text-phantom-lime mb-2">Your hypothesis:</p>
              <p className="font-body text-[15px] text-phantom-text-primary leading-relaxed">{hypothesis}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Section 2 — Unfair Advantages */}
      <div className="card mb-6">
        <p className="label mb-4">Your Unfair Advantages</p>
        <p className="font-body text-[14px] text-phantom-text-secondary mb-4">
          List what you know, have done, have survived, or have built that gives you specific credibility with this person. Not aspirational. Actual.
        </p>

        <div className="flex gap-2 mb-4">
          <input
            className="input flex-1"
            value={newAdvantage}
            onChange={e => setNewAdvantage(e.target.value)}
            placeholder="Add an unfair advantage..."
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAdvantage())}
          />
          <button
            className="btn-secondary"
            onClick={addAdvantage}
            disabled={!newAdvantage.trim() || advantages.length >= 10}
          >
            Add
          </button>
        </div>

        {advantages.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {advantages.map((adv, i) => (
              <span key={i} className="badge badge-active flex items-center gap-1.5">
                {adv}
                <button
                  onClick={() => removeAdvantage(i)}
                  className="hover:text-phantom-danger transition-colors"
                  aria-label={`Remove ${adv}`}
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="font-body text-[11px] text-phantom-text-muted">
          {advantages.length} / 10 {advantages.length < 3 && <span className="text-phantom-danger"> — need at least 3</span>}
        </p>
      </div>

      {/* Section 3 — Hypothesis Brand */}
      <div className="card mb-6">
        <p className="label mb-4">Hypothesis Brand</p>

        <div className="space-y-4 mb-5">
          <div>
            <label className="label text-phantom-text-secondary mb-2 block">Working name</label>
            <input
              className="input"
              value={workingName}
              onChange={e => setWorkingName(e.target.value)}
              placeholder="Functional is fine. This is not your real brand yet."
            />
          </div>
          <div>
            <label className="label text-phantom-text-secondary mb-2 block">One-sentence positioning</label>
            <input
              className="input"
              value={positioning}
              onChange={e => setPositioning(e.target.value)}
              placeholder="What it is, who it is for, what it produces"
            />
          </div>
          <div>
            <label className="label text-phantom-text-secondary mb-2 block">Brand voice (three adjectives)</label>
            <input
              className="input"
              value={brandVoice}
              onChange={e => setBrandVoice(e.target.value)}
              placeholder="e.g. direct, technical, no-nonsense"
            />
          </div>
        </div>

        <div className="bg-[#0a1900] border-l-4 border-phantom-lime p-4 rounded-r">
          <p className="font-body text-[13px] text-phantom-text-secondary">
            No logo. No colors. No website. A landing page only if you need somewhere to send traffic.
          </p>
        </div>
      </div>

      {/* Section 4 — AI Stress Test */}
      <div className="card mb-6">
        <p className="label mb-3">AI Stress Test</p>
        <p className="font-body text-[14px] text-phantom-text-secondary mb-4">
          Run your hypothesis through a steelman analysis to surface blind spots before you build anything.
        </p>

        <button
          className="btn-primary"
          onClick={runStressTest}
          disabled={!hypothesis || stressTestRunning}
        >
          {stressTestRunning ? (
            <><Loader size={14} className="animate-spin" /> Running stress test...</>
          ) : (
            'Run stress test on my hypothesis'
          )}
        </button>

        {!hypothesis && (
          <p className="font-body text-[12px] text-phantom-text-muted mt-2">
            Complete the problem hypothesis above first.
          </p>
        )}

        <AnimatePresence>
          {stressTestOpen && (
            <motion.div
              className="mt-5 space-y-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {stressTestRunning ? (
                <div className="bg-[#0d0d0d] border border-phantom-border-subtle rounded p-6 text-center">
                  <Loader size={20} className="animate-spin text-phantom-lime mx-auto mb-2" />
                  <p className="font-body text-[13px] text-phantom-text-muted">Running stress test...</p>
                </div>
              ) : stressTest && (
                <>
                  {[
                    { label: 'Steelman against', key: 'steelman_against', color: 'text-phantom-danger' },
                    { label: 'Steelman for', key: 'steelman_for', color: 'text-phantom-lime' },
                    { label: 'Critical assumption', key: 'critical_assumption', color: 'text-phantom-warning' },
                    { label: 'Cheapest validation method', key: 'cheapest_validation_method', color: 'text-phantom-text-primary' },
                  ].map(({ label, key, color }) => (
                    <div key={key} className="bg-[#0d0d0d] border border-phantom-border-subtle rounded p-4">
                      <p className={`label mb-2 ${color}`}>{label}</p>
                      <p className="font-body text-[14px] text-phantom-text-secondary leading-relaxed">
                        {stressTest[key as keyof StressTestResult]}
                      </p>
                    </div>
                  ))}
                  <p className="font-body text-[12px] text-phantom-text-muted">
                    Results are saved to your workspace.
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Save button */}
      <div className="flex justify-end mb-6">
        <button className="btn-secondary" onClick={saveData} disabled={saving}>
          {saving ? 'Saving...' : saved ? 'Saved.' : 'Save phase'}
        </button>
      </div>

      {/* Completion Gate */}
      <div className={`card ${allGatePassed ? 'border-phantom-lime' : 'border-phantom-border'} transition-colors duration-300`}>
        <p className="label text-phantom-lime mb-4">Phase 1 Completion</p>

        <div className="space-y-3 mb-6">
          {[
            { label: 'Problem sentence completed', done: gate.hypothesis },
            { label: 'Minimum 3 unfair advantages listed', done: gate.advantages },
            { label: 'Working positioning statement written', done: gate.positioning },
            { label: 'Stress test completed and reviewed', done: gate.stressTest },
          ].map(({ label, done }) => (
            <div key={label} className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  done ? 'bg-phantom-lime border-phantom-lime' : 'border-phantom-border'
                }`}
              >
                {done && (
                  <span className="text-phantom-black text-[11px] font-bold">✓</span>
                )}
              </div>
              <span className={`font-body text-[14px] ${done ? 'text-phantom-text-primary' : 'text-phantom-text-muted'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {!allGatePassed && (
          <p className="font-body text-[13px] text-phantom-text-muted mb-4">
            Complete all required items to advance.
          </p>
        )}

        <button
          className="btn-primary"
          disabled={!allGatePassed}
          onClick={advancePhase}
        >
          Phase 1 complete. Proceed to Silent Test →
        </button>
      </div>
    </motion.div>
  )
})

PhaseIdentify.displayName = 'PhaseIdentify'
export default PhaseIdentify
