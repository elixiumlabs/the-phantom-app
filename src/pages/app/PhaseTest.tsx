import { memo, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Copy, Check, Trash2, Lock, Unlock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBrands, type Signal, type SignalType } from '@/contexts/BrandContext'

/* ─── Outreach Templates ─── */
const TEMPLATES: Record<string, string> = {
  'Cold DM': `Hey [Name], I'm researching [specific problem area] and I've been connecting with [their type of person]. Quick question — how are you currently handling [specific pain point]? Not pitching anything. Genuinely trying to understand how people in your position deal with this before I build anything.`,
  'Community Post': `Question for [community name]: For those dealing with [specific problem], what's been your biggest frustration with the current solutions? I'm researching this space before building anything and want to understand it from people who actually live it.`,
  'Forum Reply': `I've been researching this exact issue. Before building a solution, I'm curious — what would solving [specific aspect] actually look like for you? What would need to be true for you to say the problem is finally fixed?`,
  Email: `Subject: Quick question about [problem area]\n\nHi [Name],\n\nI came across your [post/comment/profile] about [specific context]. I'm researching [problem area] and I have one question: what's the most expensive part of this problem for you right now — in time, money, or frustration?\n\nNo pitch. Just research. Would value a 2-minute reply if you have it.\n\n[Your name]`,
}

function TemplatePart({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[[^\]]+\])/g).map((part, i) =>
        /^\[.+\]$/.test(part) ? (
          <span key={i} className="text-phantom-lime">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

/* ─── Signal badge ─── */
const SIGNAL_COLORS: Record<SignalType, string> = {
  reply: 'badge',
  conversion: 'badge badge-active',
  objection: 'badge badge-danger',
  no_response: 'badge',
}

const SIGNAL_LABELS: Record<SignalType, string> = {
  reply: 'Reply',
  conversion: 'Conversion',
  objection: 'Objection',
  no_response: 'No response',
}

/* ─── Add Signal Form ─── */
interface SignalFormState {
  type: SignalType
  source: string
  notes: string
}

const DEFAULT_SIGNAL: SignalFormState = { type: 'reply', source: '', notes: '' }

/* ─── PhaseTest ─── */
const PhaseTest = memo(() => {
  const { id } = useParams()
  const { getBrand, updateBrand, getBrandSignals, addSignal, deleteSignal } = useBrands()
  const brand = getBrand(id!)
  const allSignals = getBrandSignals(id!)
  const signals = allSignals.filter(s => s.phase === 'test')

  const p2 = (brand?.phase2Data ?? {}) as Record<string, unknown>

  /* Offer state */
  const [offer, setOffer] = useState({
    description: (p2.offerDescription as string) ?? '',
    outcome: (p2.offerOutcome as string) ?? '',
    delivery: (p2.offerDelivery as string) ?? 'Call',
    price: (p2.offerPrice as string) ?? '',
    belief: (p2.offerBelief as string) ?? '',
  })

  /* Test parameters */
  const [params, setParams] = useState({
    targetOutreach: (p2.targetOutreach as string) ?? '',
    validationRate: (p2.validationRate as string) ?? '',
    failCondition: (p2.failCondition as string) ?? '',
  })
  const [paramsConfirmed, setParamsConfirmed] = useState(!!(p2.paramsConfirmed))

  /* Templates */
  const [activeTemplate, setActiveTemplate] = useState('Cold DM')
  const [copied, setCopied] = useState(false)

  /* Signal form */
  const [showSignalForm, setShowSignalForm] = useState(false)
  const [signalForm, setSignalForm] = useState<SignalFormState>(DEFAULT_SIGNAL)

  /* Completion gate */
  const [objectionsReviewed, setObjectionsReviewed] = useState(!!(p2.objectionsReviewed))

  const saveOffer = useCallback(() => {
    updateBrand(id!, {
      phase2Data: {
        ...p2,
        offerDescription: offer.description,
        offerOutcome: offer.outcome,
        offerDelivery: offer.delivery,
        offerPrice: offer.price,
        offerBelief: offer.belief,
      },
    })
  }, [id, p2, offer, updateBrand])

  const confirmParams = () => {
    updateBrand(id!, {
      phase2Data: { ...p2, ...params, paramsConfirmed: true },
    })
    setParamsConfirmed(true)
  }

  const editParams = () => {
    updateBrand(id!, { phase2Data: { ...p2, paramsConfirmed: false } })
    setParamsConfirmed(false)
  }

  const copyTemplate = () => {
    const text = TEMPLATES[activeTemplate]
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const submitSignal = () => {
    if (!signalForm.source.trim()) return
    addSignal({
      brandId: id!,
      type: signalForm.type,
      source: signalForm.source.trim(),
      notes: signalForm.notes.trim(),
      phase: 'test',
    })
    setSignalForm(DEFAULT_SIGNAL)
    setShowSignalForm(false)
  }

  const toggleObjectionsReviewed = () => {
    const next = !objectionsReviewed
    setObjectionsReviewed(next)
    updateBrand(id!, { phase2Data: { ...p2, objectionsReviewed: next } })
  }

  const total = signals.length
  const replies = signals.filter(s => s.type === 'reply').length
  const conversions = signals.filter(s => s.type === 'conversion').length
  const objections = signals.filter(s => s.type === 'objection').length

  const conversionRate = total > 0 ? ((conversions / total) * 100).toFixed(1) : '0'
  const replyRate = total > 0 ? ((replies / total) * 100).toFixed(1) : '0'

  const targetMet = params.targetOutreach
    ? total >= parseInt(params.targetOutreach)
    : false
  const rateMet = params.validationRate
    ? parseFloat(conversionRate) >= parseFloat(params.validationRate)
    : false

  const gate = {
    offer: offer.description.trim().length > 0 && offer.outcome.trim().length > 0,
    params: paramsConfirmed,
    outreach: targetMet,
    rate: total > 0,
    objections: objectionsReviewed,
  }
  const allGatePassed = Object.values(gate).every(Boolean)

  const advancePhase = () => {
    if (!allGatePassed) return
    updateBrand(id!, { currentPhase: 'iterate' })
  }

  const objectionList = signals
    .filter(s => s.type === 'objection')
    .reduce<Record<string, number>>((acc, s) => {
      const key = s.notes || 'No details'
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {})

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
        <p className="label text-phantom-lime mb-2">Phase 02 — Silent Test</p>
        <h1 className="font-display font-bold text-[32px] text-phantom-text-primary mb-3">
          Test before you build.
        </h1>
        <p className="font-body text-[16px] text-phantom-text-secondary">
          Present your minimum offer to real buyers. Track what matters. Ignore the rest.
        </p>
      </div>

      {/* Section 1 — Minimum Offer */}
      <div className="card mb-6">
        <p className="label mb-4">Minimum Offer</p>

        <div className="space-y-4 mb-5">
          <div>
            <label className="label text-phantom-text-secondary mb-2 block">What exactly is the offer</label>
            <textarea
              className="input"
              rows={3}
              value={offer.description}
              onChange={e => setOffer(o => ({ ...o, description: e.target.value }))}
              placeholder="Describe the offer in plain language..."
            />
          </div>
          <div>
            <label className="label text-phantom-text-secondary mb-2 block">What specific outcome does it produce</label>
            <input
              className="input"
              value={offer.outcome}
              onChange={e => setOffer(o => ({ ...o, outcome: e.target.value }))}
              placeholder="The measurable result the buyer gets"
            />
          </div>
          <div>
            <label className="label text-phantom-text-secondary mb-2 block">How is it delivered</label>
            <select
              className="input"
              value={offer.delivery}
              onChange={e => setOffer(o => ({ ...o, delivery: e.target.value }))}
            >
              {['PDF', 'Call', 'Course', 'Service', 'Template', 'Other'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label text-phantom-text-secondary mb-2 block">Price</label>
            <input
              className="input"
              value={offer.price}
              onChange={e => setOffer(o => ({ ...o, price: e.target.value }))}
              placeholder="e.g. $97, $300, $1,200"
            />
          </div>
          <div>
            <label className="label text-phantom-text-secondary mb-2 block">
              What does the buyer need to believe to purchase it
            </label>
            <textarea
              className="input"
              rows={2}
              value={offer.belief}
              onChange={e => setOffer(o => ({ ...o, belief: e.target.value }))}
              placeholder="The core belief that makes this an obvious purchase..."
            />
          </div>
        </div>

        <button className="btn-secondary" onClick={saveOffer}>
          Save offer
        </button>
      </div>

      {/* Section 2 — Test Parameters */}
      <div className="card mb-6">
        <div className="flex items-start justify-between mb-1">
          <p className="label">Set Your Test Parameters</p>
          {paramsConfirmed && (
            <button className="btn-ghost text-[12px] py-1 px-2 gap-1" onClick={editParams}>
              <Unlock size={11} /> Edit
            </button>
          )}
        </div>
        <p className="font-body text-[13px] text-phantom-text-muted mb-5">
          Set these before you start. Not after.
        </p>

        {paramsConfirmed ? (
          <div className="space-y-3">
            {[
              { label: 'Target outreach attempts', val: params.targetOutreach },
              { label: 'Validation conversion rate', val: `${params.validationRate}%` },
              { label: 'Failure condition', val: params.failCondition },
            ].map(({ label, val }) => (
              <div key={label} className="flex items-start gap-4">
                <span className="font-body text-[12px] text-phantom-text-muted w-48 shrink-0 pt-0.5">
                  {label}
                </span>
                <span className="font-body text-[14px] text-phantom-text-primary">{val}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-2">
              <Lock size={12} className="text-phantom-lime" />
              <span className="font-body text-[12px] text-phantom-lime">Parameters locked</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="label text-phantom-text-secondary mb-2 block">
                How many people will you present this to
              </label>
              <input
                className="input"
                type="number"
                min="1"
                value={params.targetOutreach}
                onChange={e => setParams(p => ({ ...p, targetOutreach: e.target.value }))}
                placeholder="e.g. 50"
              />
            </div>
            <div>
              <label className="label text-phantom-text-secondary mb-2 block">
                What conversion rate counts as validated demand (%)
              </label>
              <input
                className="input"
                type="number"
                min="0"
                max="100"
                value={params.validationRate}
                onChange={e => setParams(p => ({ ...p, validationRate: e.target.value }))}
                placeholder="e.g. 10"
              />
            </div>
            <div>
              <label className="label text-phantom-text-secondary mb-2 block">
                What counts as a failed test requiring a rebuild
              </label>
              <textarea
                className="input"
                rows={2}
                value={params.failCondition}
                onChange={e => setParams(p => ({ ...p, failCondition: e.target.value }))}
                placeholder="Describe the specific condition that means you need to rebuild, not just tweak..."
              />
            </div>
            <button
              className="btn-primary"
              onClick={confirmParams}
              disabled={!params.targetOutreach || !params.validationRate || !params.failCondition.trim()}
            >
              Confirm parameters
            </button>
          </div>
        )}
      </div>

      {/* Section 3 — Outreach Templates */}
      <div className="card mb-6">
        <p className="label mb-4">Outreach Templates</p>

        {/* Tab switcher */}
        <div className="flex gap-1 mb-5 border-b border-phantom-border-subtle pb-1">
          {Object.keys(TEMPLATES).map(tab => (
            <button
              key={tab}
              className={`font-body text-[13px] px-4 py-2 rounded-t transition-colors duration-150 ${
                activeTemplate === tab
                  ? 'text-phantom-lime border-b-2 border-phantom-lime -mb-[1px]'
                  : 'text-phantom-text-muted hover:text-phantom-text-secondary'
              }`}
              onClick={() => setActiveTemplate(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-[#0d0d0d] border border-phantom-border-subtle rounded p-4 mb-4">
          <p className="font-body text-[13px] text-phantom-text-secondary leading-relaxed whitespace-pre-wrap">
            <TemplatePart text={TEMPLATES[activeTemplate]} />
          </p>
        </div>

        <div className="flex gap-3">
          <button className="btn-secondary gap-2" onClick={copyTemplate}>
            {copied ? <Check size={14} className="text-phantom-lime" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy to clipboard'}
          </button>
        </div>
      </div>

      {/* Section 4 — Signal Tracker */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="label">Signal Tracker</p>
          <button className="btn-primary text-[13px] py-2" onClick={() => setShowSignalForm(v => !v)}>
            <Plus size={14} /> Log signal
          </button>
        </div>
        <p className="font-body text-[13px] text-phantom-text-muted mb-5">
          Track three things only: replies, conversions, objections.
        </p>

        {/* Summary row */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Total outreach', val: total, sub: '' },
            { label: 'Replies', val: replies, sub: total ? `${replyRate}%` : '' },
            { label: 'Conversions', val: conversions, sub: total ? `${conversionRate}%` : '' },
            { label: 'Objections', val: objections, sub: '' },
          ].map(({ label, val, sub }) => (
            <div key={label} className="bg-[#0d0d0d] border border-phantom-border-subtle rounded p-3">
              <p className="font-code font-bold text-[22px] text-phantom-lime leading-none">{val}</p>
              <p className="font-body text-[11px] text-phantom-text-muted mt-1">{label}</p>
              {sub && <p className="font-body text-[11px] text-phantom-text-secondary">{sub}</p>}
            </div>
          ))}
        </div>

        {/* Add signal form */}
        <AnimatePresence>
          {showSignalForm && (
            <motion.div
              className="bg-[#0d0d0d] border border-phantom-border-subtle rounded p-4 mb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
            >
              <p className="label text-phantom-lime mb-3">New signal</p>
              <div className="space-y-3">
                <div>
                  <label className="label text-phantom-text-secondary mb-1.5 block text-[11px]">Signal type</label>
                  <select
                    className="input text-[13px] py-2"
                    value={signalForm.type}
                    onChange={e => setSignalForm(f => ({ ...f, type: e.target.value as SignalType }))}
                  >
                    <option value="reply">Reply</option>
                    <option value="conversion">Conversion</option>
                    <option value="objection">Objection</option>
                    <option value="no_response">No response</option>
                  </select>
                </div>
                <div>
                  <label className="label text-phantom-text-secondary mb-1.5 block text-[11px]">Source</label>
                  <input
                    className="input text-[13px] py-2"
                    value={signalForm.source}
                    onChange={e => setSignalForm(f => ({ ...f, source: e.target.value }))}
                    placeholder="Where did you reach this person"
                  />
                </div>
                <div>
                  <label className="label text-phantom-text-secondary mb-1.5 block text-[11px]">Notes</label>
                  <textarea
                    className="input text-[13px] py-2 min-h-[72px]"
                    value={signalForm.notes}
                    onChange={e => setSignalForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="What happened, what they said"
                  />
                </div>
                <div className="flex gap-2">
                  <button className="btn-primary text-[13px] py-2" onClick={submitSignal} disabled={!signalForm.source.trim()}>
                    Log signal
                  </button>
                  <button className="btn-ghost text-[13px]" onClick={() => setShowSignalForm(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Signal table */}
        {signals.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-phantom-border rounded">
            <p className="font-body text-[14px] text-phantom-text-muted">No signals logged.</p>
            <p className="font-body text-[13px] text-phantom-text-muted mt-1">
              Start your outreach and log every reply, conversion, and objection here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-phantom-border-subtle">
                  {['Date', 'Type', 'Source', 'Notes', ''].map(col => (
                    <th key={col} className="text-left font-body text-[11px] text-phantom-text-muted pb-2 pr-4">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {signals.map((s: Signal) => (
                  <tr key={s.id} className="border-b border-phantom-border-subtle/50">
                    <td className="py-3 pr-4 font-body text-[12px] text-phantom-text-muted whitespace-nowrap">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={SIGNAL_COLORS[s.type]}>
                        {SIGNAL_LABELS[s.type]}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-body text-[13px] text-phantom-text-secondary max-w-[140px] truncate">
                      {s.source}
                    </td>
                    <td className="py-3 pr-4 font-body text-[13px] text-phantom-text-secondary max-w-[200px] truncate">
                      {s.notes || '—'}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => deleteSignal(s.id)}
                        className="text-phantom-text-muted hover:text-phantom-danger transition-colors"
                        aria-label="Delete signal"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Objections summary */}
        {objections > 0 && (
          <div className="mt-5 pt-5 border-t border-phantom-border-subtle">
            <p className="label mb-3">Objection Summary</p>
            <div className="space-y-2">
              {Object.entries(objectionList)
                .sort(([, a], [, b]) => b - a)
                .map(([note, count]) => (
                  <div key={note} className="flex items-start gap-3">
                    <span className="font-code text-[13px] text-phantom-lime w-6 shrink-0">{count}×</span>
                    <span className="font-body text-[13px] text-phantom-text-secondary">{note}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Completion Gate */}
      <div className={`card transition-colors duration-300 ${allGatePassed ? 'border-phantom-lime' : 'border-phantom-border'}`}>
        <p className="label text-phantom-lime mb-4">Phase 2 Completion</p>

        <div className="space-y-3 mb-6">
          {[
            { label: 'Minimum offer defined', done: gate.offer },
            { label: 'Test parameters set and confirmed', done: gate.params },
            {
              label: params.targetOutreach
                ? `Minimum ${params.targetOutreach} outreach attempts logged (${total} so far)`
                : 'Minimum outreach attempts logged',
              done: gate.outreach,
            },
            { label: `Conversion rate calculated (${conversionRate}%)`, done: gate.rate },
            {
              label: 'Objection list reviewed',
              done: gate.objections,
              toggle: true,
            },
          ].map(({ label, done, toggle }) => (
            <div
              key={label}
              className={`flex items-center gap-3 ${toggle ? 'cursor-pointer' : ''}`}
              onClick={toggle ? toggleObjectionsReviewed : undefined}
            >
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  done ? 'bg-phantom-lime border-phantom-lime' : 'border-phantom-border'
                } ${toggle ? 'cursor-pointer' : ''}`}
              >
                {done && <span className="text-phantom-black text-[11px] font-bold">✓</span>}
              </div>
              <span className={`font-body text-[14px] ${done ? 'text-phantom-text-primary' : 'text-phantom-text-muted'}`}>
                {label}
                {toggle && !done && <span className="text-phantom-text-muted text-[12px] ml-2">(click to confirm)</span>}
              </span>
            </div>
          ))}
        </div>

        {params.validationRate && !rateMet && total > 0 && (
          <div className="bg-[#1a0000] border border-phantom-danger/30 rounded p-3 mb-4">
            <p className="font-body text-[13px] text-phantom-danger">
              Your conversion rate ({conversionRate}%) is below your threshold ({params.validationRate}%). Review your objections before proceeding.
            </p>
          </div>
        )}

        <button className="btn-primary" disabled={!allGatePassed} onClick={advancePhase}>
          Phase 2 complete. Proceed to Iteration Loop →
        </button>
      </div>
    </motion.div>
  )
})

PhaseTest.displayName = 'PhaseTest'
export default PhaseTest
