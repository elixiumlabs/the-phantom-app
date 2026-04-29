import { memo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, ChevronDown, ChevronUp, Pencil, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBrands, type Iteration, type IterationStatus } from '@/contexts/BrandContext'

/* ─── Diagnosis logic ─── */
type RadioVal = 'yes' | 'no' | 'sometimes' | ''

const STATUS_LABELS: Record<IterationStatus, string> = {
  testing: 'Testing',
  complete: 'Complete',
  abandoned: 'Abandoned',
}

const STATUS_CLASSES: Record<IterationStatus, string> = {
  testing: 'badge badge-warning',
  complete: 'badge badge-active',
  abandoned: 'badge badge-danger',
}

function getDiagnosis(q1: RadioVal, q2: RadioVal, q3: RadioVal, q4: RadioVal): string | null {
  if (q1 === 'no') return 'Problem framing. The person does not recognize themselves in how you describe the problem. Rewrite the problem statement using language from real objections.'
  if (q1 === 'yes' && q2 === 'no') return 'Offer clarity. Replies are happening but the offer is not landing as the obvious next step. The connection between problem and solution is unclear.'
  if (q1 === 'yes' && q2 === 'yes' && q3 === 'no') return 'Close mechanics. Sales conversations are not closing. Read your objections literally — the issue is in pricing, proof, trust, or offer structure.'
  if (q4 === 'yes') return 'Messaging sharpness. You are converting but below threshold. The structure is right — the language needs tightening.'
  if (q1 === 'yes' && q2 === 'yes' && q3 === 'yes') return 'No structural issue detected. You may be below threshold due to volume, not conversion. Increase outreach before pivoting.'
  return null
}

interface IterForm {
  variableChanged: string
  reason: string
  hypothesis: string
}

const DEFAULT_ITER_FORM: IterForm = { variableChanged: '', reason: '', hypothesis: '' }

const PhaseIterate = memo(() => {
  const { id } = useParams()
  const { getBrand, updateBrand, getBrandIterations, addIteration, updateIteration } = useBrands()
  const brand = getBrand(id!)
  const iterations = getBrandIterations(id!)

  const p3 = (brand?.phase3Data ?? {}) as Record<string, unknown>

  /* Diagnosis state */
  const [q1, setQ1] = useState<RadioVal>('')
  const [q2, setQ2] = useState<RadioVal>('')
  const [q3, setQ3] = useState<RadioVal>('')
  const [q4, setQ4] = useState<RadioVal>('')

  const diagnosis = q1 && q2 && q3 && q4 ? getDiagnosis(q1, q2, q3, q4) : null

  /* Iteration form */
  const [showIterForm, setShowIterForm] = useState(false)
  const [iterForm, setIterForm] = useState<IterForm>(DEFAULT_ITER_FORM)

  /* Editing an iteration outcome */
  const [editingOutcome, setEditingOutcome] = useState<string | null>(null)
  const [outcomeText, setOutcomeText] = useState('')

  /* Expanded iteration cards */
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpanded = (itId: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(itId)) next.delete(itId)
      else next.add(itId)
      return next
    })
  }

  const submitIteration = () => {
    if (!iterForm.variableChanged.trim() || !iterForm.hypothesis.trim()) return
    addIteration({
      brandId: id!,
      iterationNumber: iterations.length + 1,
      variableChanged: iterForm.variableChanged.trim(),
      reason: iterForm.reason.trim(),
      hypothesis: iterForm.hypothesis.trim(),
      outcome: '',
      status: 'testing',
      conversionRate: 0,
    })
    setIterForm(DEFAULT_ITER_FORM)
    setShowIterForm(false)
  }

  const startEditOutcome = (it: Iteration) => {
    setEditingOutcome(it.id)
    setOutcomeText(it.outcome)
  }

  const saveOutcome = (itId: string) => {
    updateIteration(itId, {
      outcome: outcomeText,
      status: outcomeText.trim() ? 'complete' : 'testing',
      completedAt: outcomeText.trim() ? new Date().toISOString() : undefined,
    })
    setEditingOutcome(null)
  }

  const setStatus = (itId: string, status: IterationStatus) => {
    updateIteration(itId, { status })
  }

  /* Completion gate */
  const [convRateMet, setConvRateMet] = useState(!!(p3.convRateMet))
  const [objReduced, setObjReduced] = useState(!!(p3.objReduced))

  const completeIterations = iterations.filter(it => it.status === 'complete')

  const gate = {
    oneComplete: completeIterations.length >= 1,
    convRate: convRateMet,
    objReduced: objReduced,
    bestVersion: completeIterations.length >= 1,
  }
  const allGatePassed = Object.values(gate).every(Boolean)

  const toggleGateItem = (key: 'convRateMet' | 'objReduced', val: boolean) => {
    const next = !val
    if (key === 'convRateMet') setConvRateMet(next)
    else setObjReduced(next)
    updateBrand(id!, { phase3Data: { ...p3, [key]: next } })
  }

  const advancePhase = () => {
    if (!allGatePassed) return
    updateBrand(id!, { currentPhase: 'lock' })
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
        <p className="label text-phantom-lime mb-2">Phase 03 — Iteration Loop</p>
        <h1 className="font-display font-bold text-[32px] text-phantom-text-primary mb-3">
          Fix what the data told you.
        </h1>
        <p className="font-body text-[16px] text-phantom-text-secondary">
          One variable per cycle. Document everything. No explaining pivots to an audience.
        </p>
      </div>

      {/* Section 1 — Diagnosis Tool */}
      <div className="card mb-6">
        <p className="label mb-4">Diagnose Before You Rebuild</p>

        <div className="space-y-5">
          {[
            {
              q: 'Is your outreach getting replies?',
              val: q1,
              set: setQ1,
              opts: ['yes', 'no', 'sometimes'] as RadioVal[],
              guidance: {
                no: 'The problem framing is off. The person does not recognize themselves in how you describe the problem.',
                sometimes: 'Inconsistent problem recognition. Narrow your target audience further.',
              },
            },
            {
              q: 'Are replies converting to sales conversations?',
              val: q2,
              set: setQ2,
              opts: ['yes', 'no', 'sometimes'] as RadioVal[],
              guidance: {
                no: 'The offer is not landing as the obvious solution to the confirmed problem.',
                sometimes: 'The offer framing is inconsistent. Test one specific angle at a time.',
              },
            },
            {
              q: 'Are sales conversations closing?',
              val: q3,
              set: setQ3,
              opts: ['yes', 'no', 'sometimes'] as RadioVal[],
              guidance: {
                no: 'Read your objections literally. The issue is in pricing, trust, proof, or offer structure.',
                sometimes: 'Address the most common objection with a structural fix, not a reframe.',
              },
            },
            {
              q: 'Are you converting but below your threshold?',
              val: q4,
              set: setQ4,
              opts: ['yes', 'no'] as RadioVal[],
              guidance: {
                yes: 'The messaging needs sharpening, not the offer structure.',
              },
            },
          ].map(({ q, val, set, opts, guidance }) => (
            <div key={q}>
              <p className="font-body text-[14px] text-phantom-text-primary mb-3">{q}</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {opts.map(opt => (
                  <button
                    key={opt}
                    className={`radio-option capitalize ${val === opt ? 'radio-option-selected' : ''}`}
                    onClick={() => set(opt)}
                  >
                    {opt.replace('_', ' ')}
                  </button>
                ))}
              </div>
              <AnimatePresence>
                {val && guidance[val as keyof typeof guidance] && (
                  <motion.div
                    className="bg-[#0d0d0d] border border-phantom-border-subtle rounded p-3 mt-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <p className="font-body text-[13px] text-phantom-text-secondary">
                      {guidance[val as keyof typeof guidance]}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {diagnosis && (
            <motion.div
              className="mt-5 bg-[#0a1900] border border-phantom-lime/30 rounded p-4"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <p className="label text-phantom-lime mb-2">Your primary issue is:</p>
              <p className="font-body text-[14px] text-phantom-text-primary leading-relaxed">{diagnosis}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Section 2 — Iteration Log */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="label">Iteration Log</p>
          <button className="btn-primary text-[13px] py-2" onClick={() => setShowIterForm(v => !v)}>
            <Plus size={14} /> New iteration
          </button>
        </div>
        <p className="font-body text-[13px] text-phantom-text-muted mb-5">One variable at a time.</p>

        {/* Iteration form */}
        <AnimatePresence>
          {showIterForm && (
            <motion.div
              className="bg-[#0d0d0d] border border-phantom-border-subtle rounded p-4 mb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
            >
              <p className="label text-phantom-lime mb-3">Iteration {iterations.length + 1}</p>
              <div className="space-y-3">
                <div>
                  <label className="label text-phantom-text-secondary mb-1.5 block text-[11px]">
                    What you changed
                  </label>
                  <input
                    className="input text-[13px] py-2"
                    value={iterForm.variableChanged}
                    onChange={e => setIterForm(f => ({ ...f, variableChanged: e.target.value }))}
                    placeholder="e.g. Changed headline from benefit to pain-point framing"
                  />
                </div>
                <div>
                  <label className="label text-phantom-text-secondary mb-1.5 block text-[11px]">
                    Why you changed it (what the data indicated)
                  </label>
                  <input
                    className="input text-[13px] py-2"
                    value={iterForm.reason}
                    onChange={e => setIterForm(f => ({ ...f, reason: e.target.value }))}
                    placeholder="e.g. 40% of objections mentioned confusion about who this is for"
                  />
                </div>
                <div>
                  <label className="label text-phantom-text-secondary mb-1.5 block text-[11px]">
                    Hypothesis: what result do you expect
                  </label>
                  <input
                    className="input text-[13px] py-2"
                    value={iterForm.hypothesis}
                    onChange={e => setIterForm(f => ({ ...f, hypothesis: e.target.value }))}
                    placeholder="e.g. Reply rate increases from 8% to 15%+"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn-primary text-[13px] py-2"
                    onClick={submitIteration}
                    disabled={!iterForm.variableChanged.trim() || !iterForm.hypothesis.trim()}
                  >
                    Log iteration
                  </button>
                  <button className="btn-ghost text-[13px]" onClick={() => setShowIterForm(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timeline */}
        {iterations.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-phantom-border rounded">
            <p className="font-body text-[14px] text-phantom-text-muted">No iterations logged.</p>
            <p className="font-body text-[13px] text-phantom-text-muted mt-1">
              Use the diagnosis tool above, then log your first change.
            </p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-[10px] top-0 bottom-0 w-px bg-phantom-border-subtle" />
            <div className="space-y-3 pl-7">
              {iterations.map((it: Iteration) => (
                <div key={it.id} className="relative">
                  <div className="absolute -left-7 top-4 w-2.5 h-2.5 rounded-full bg-phantom-lime border-2 border-phantom-black" />
                  <div className="bg-[#0d0d0d] border border-phantom-border-subtle rounded p-4">
                    <div className="flex items-start justify-between mb-2 gap-3">
                      <div>
                        <span className="font-code text-[11px] text-phantom-lime">
                          ITERATION {it.iterationNumber}
                        </span>
                        <p className="font-display font-semibold text-[15px] text-phantom-text-primary mt-0.5">
                          {it.variableChanged}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={STATUS_CLASSES[it.status]}>{STATUS_LABELS[it.status]}</span>
                        <button
                          onClick={() => toggleExpanded(it.id)}
                          className="text-phantom-text-muted hover:text-phantom-text-primary transition-colors"
                        >
                          {expandedIds.has(it.id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedIds.has(it.id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.15 }}
                          className="space-y-3 pt-2 border-t border-phantom-border-subtle mt-2"
                        >
                          {it.reason && (
                            <div>
                              <p className="font-body text-[11px] text-phantom-text-muted mb-0.5">Why</p>
                              <p className="font-body text-[13px] text-phantom-text-secondary">{it.reason}</p>
                            </div>
                          )}
                          <div>
                            <p className="font-body text-[11px] text-phantom-text-muted mb-0.5">Hypothesis</p>
                            <p className="font-body text-[13px] text-phantom-text-secondary">{it.hypothesis}</p>
                          </div>
                          <div>
                            <p className="font-body text-[11px] text-phantom-text-muted mb-1">Outcome</p>
                            {editingOutcome === it.id ? (
                              <div className="flex gap-2">
                                <input
                                  className="input text-[13px] py-1.5 flex-1"
                                  value={outcomeText}
                                  onChange={e => setOutcomeText(e.target.value)}
                                  placeholder="What happened..."
                                  autoFocus
                                />
                                <button
                                  onClick={() => saveOutcome(it.id)}
                                  className="btn-primary text-[12px] py-1.5 px-3"
                                >
                                  <Check size={12} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-start gap-2">
                                <p className="font-body text-[13px] text-phantom-text-secondary flex-1">
                                  {it.outcome || <span className="text-phantom-text-muted italic">Not recorded yet</span>}
                                </p>
                                <button
                                  onClick={() => startEditOutcome(it)}
                                  className="text-phantom-text-muted hover:text-phantom-text-primary transition-colors shrink-0"
                                >
                                  <Pencil size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {(['testing', 'complete', 'abandoned'] as IterationStatus[]).map(s => (
                              <button
                                key={s}
                                onClick={() => setStatus(it.id, s)}
                                className={`radio-option text-[11px] py-1 px-2 ${it.status === s ? 'radio-option-selected' : ''}`}
                              >
                                {STATUS_LABELS[s]}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section 3 — Offer Version Summary */}
      {completeIterations.length > 0 && (
        <div className="card mb-6">
          <p className="label mb-4">Completed Iterations</p>
          <div className="space-y-3">
            {completeIterations.map((it, i) => (
              <div key={it.id} className="flex items-start gap-4 py-3 border-b border-phantom-border-subtle last:border-0">
                <span className="font-code text-[11px] text-phantom-lime w-6 shrink-0 pt-0.5">v{i + 1}</span>
                <div className="flex-1">
                  <p className="font-body text-[13px] text-phantom-text-primary">{it.variableChanged}</p>
                  {it.outcome && (
                    <p className="font-body text-[12px] text-phantom-text-muted mt-0.5">{it.outcome}</p>
                  )}
                </div>
                <span className="font-body text-[11px] text-phantom-text-muted shrink-0">
                  {new Date(it.completedAt ?? it.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completion Gate */}
      <div className={`card transition-colors duration-300 ${allGatePassed ? 'border-phantom-lime' : 'border-phantom-border'}`}>
        <p className="label text-phantom-lime mb-4">Phase 3 Completion</p>

        <div className="space-y-3 mb-6">
          {[
            {
              label: 'Minimum 1 complete iteration cycle logged',
              done: gate.oneComplete,
              toggle: false,
            },
            {
              label: 'Conversion rate meets or exceeds threshold',
              done: gate.convRate,
              toggle: true,
              key: 'convRateMet' as const,
              val: convRateMet,
            },
            {
              label: 'Objection list has been reduced from Phase 2 baseline',
              done: gate.objReduced,
              toggle: true,
              key: 'objReduced' as const,
              val: objReduced,
            },
            {
              label: 'Offer version with best conversion rate identified',
              done: gate.bestVersion,
              toggle: false,
            },
          ].map(({ label, done, toggle, key, val }) => (
            <div
              key={label}
              className={`flex items-center gap-3 ${toggle ? 'cursor-pointer' : ''}`}
              onClick={toggle && key ? () => toggleGateItem(key, val!) : undefined}
            >
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  done ? 'bg-phantom-lime border-phantom-lime' : 'border-phantom-border'
                }`}
              >
                {done && <span className="text-phantom-black text-[11px] font-bold">✓</span>}
              </div>
              <span className={`font-body text-[14px] ${done ? 'text-phantom-text-primary' : 'text-phantom-text-muted'}`}>
                {label}
                {toggle && !done && (
                  <span className="text-phantom-text-muted text-[12px] ml-2">(click to confirm)</span>
                )}
              </span>
            </div>
          ))}
        </div>

        <button className="btn-primary" disabled={!allGatePassed} onClick={advancePhase}>
          Phase 3 complete. Proceed to Lock In →
        </button>
      </div>
    </motion.div>
  )
})

PhaseIterate.displayName = 'PhaseIterate'
export default PhaseIterate
