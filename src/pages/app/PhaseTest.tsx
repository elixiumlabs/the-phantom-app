import { memo, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Trash2, Lock, Unlock, Loader, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useProjects } from '@/contexts/ProjectContext'
import {
  buildMinimumOffer,
  generateOutreach,
  buildObjectionLibrary,
  completePhase,
} from '@/lib/functions'
import GeneratorPanel from '@/components/app/GeneratorPanel'

type OutreachKind = 'cold_dm' | 'email' | 'community_post' | 'ad' | 'other'
type Channel = 'dm' | 'email' | 'community_post'

const CHANNEL_OPTIONS: Array<{ value: Channel; label: string }> = [
  { value: 'dm', label: 'Cold DM' },
  { value: 'email', label: 'Email' },
  { value: 'community_post', label: 'Community post' },
]

const PhaseTest = memo(() => {
  const { id } = useParams()
  const projectId = id!
  const { currentProject, silentTest, outreachLog } = useProjects()

  // Sub-doc ref shortcut
  const stRef = doc(db, 'projects', projectId, 'silent_test', 'main')

  // Local form state — hydrate from snapshot
  const [offerName, setOfferName] = useState('')
  const [offerType, setOfferType] = useState('')
  const [offerOutcome, setOfferOutcome] = useState('')
  const [offerPrice, setOfferPrice] = useState('')
  const [offerDelivery, setOfferDelivery] = useState('')
  const [offerIncludesRaw, setOfferIncludesRaw] = useState('')

  const [targetSampleSize, setTargetSampleSize] = useState('')
  const [targetConversion, setTargetConversion] = useState('')
  const [failedTestCriteria, setFailedTestCriteria] = useState('')
  const [paramsConfirmed, setParamsConfirmed] = useState(false)

  // Outreach generator inputs
  const [platform, setPlatform] = useState('')
  const [channel, setChannel] = useState<Channel>('dm')

  // Outreach log form
  const [showLogForm, setShowLogForm] = useState(false)
  const [newEntry, setNewEntry] = useState({
    platform: '',
    outreach_type: 'cold_dm' as OutreachKind,
    identifier: '',
    responded: false,
    converted: false,
    objection: '',
    notes: '',
  })

  const [completing, setCompleting] = useState(false)
  const [completionError, setCompletionError] = useState<string | null>(null)

  useEffect(() => {
    if (!silentTest) return
    setOfferName(silentTest.offer_name ?? '')
    setOfferType(silentTest.offer_type ?? '')
    setOfferOutcome(silentTest.offer_outcome ?? '')
    setOfferPrice(silentTest.offer_price?.toString() ?? '')
    setOfferDelivery(silentTest.delivery_method ?? '')
    setOfferIncludesRaw((silentTest.offer_includes ?? []).join('\n'))
    setTargetSampleSize(silentTest.test_sample_size?.toString() ?? '')
    setTargetConversion(silentTest.target_conversion_rate?.toString() ?? '')
    setFailedTestCriteria(silentTest.failed_test_criteria ?? '')
    setParamsConfirmed(!!silentTest.checklist?.parameters_set)
  }, [silentTest])

  if (!currentProject || !silentTest) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="animate-spin text-phantom-lime" size={24} />
      </div>
    )
  }

  // ----- Direct Firestore writes (rules allow these) -----
  const saveOffer = async () => {
    await setDoc(
      stRef,
      {
        offer_name: offerName,
        offer_type: offerType || null,
        offer_outcome: offerOutcome,
        offer_price: offerPrice ? Number(offerPrice) : null,
        offer_currency: 'USD',
        delivery_method: offerDelivery,
        offer_includes: offerIncludesRaw
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        'checklist.offer_built':
          offerName.trim().length > 0 && offerOutcome.trim().length > 0,
        updated_at: serverTimestamp(),
      },
      { merge: true },
    )
  }

  const confirmParams = async () => {
    await setDoc(
      stRef,
      {
        test_sample_size: targetSampleSize ? Number(targetSampleSize) : null,
        target_conversion_rate: targetConversion ? Number(targetConversion) : null,
        failed_test_criteria: failedTestCriteria,
        'checklist.parameters_set': true,
        updated_at: serverTimestamp(),
      },
      { merge: true },
    )
    setParamsConfirmed(true)
  }

  const editParams = async () => {
    await setDoc(
      stRef,
      {
        'checklist.parameters_set': false,
        updated_at: serverTimestamp(),
      },
      { merge: true },
    )
    setParamsConfirmed(false)
  }

  const addOutreachEntry = async () => {
    if (!newEntry.platform.trim()) return
    await addDoc(collection(db, 'projects', projectId, 'outreach_log'), {
      project_id: projectId,
      date: new Date().toISOString().slice(0, 10),
      platform: newEntry.platform.trim(),
      outreach_type: newEntry.outreach_type,
      identifier: newEntry.identifier.trim(),
      responded: newEntry.responded,
      converted: newEntry.converted,
      objection: newEntry.objection.trim(),
      notes: newEntry.notes.trim(),
      created_at: serverTimestamp(),
    })
    setNewEntry({
      platform: '',
      outreach_type: 'cold_dm',
      identifier: '',
      responded: false,
      converted: false,
      objection: '',
      notes: '',
    })
    setShowLogForm(false)
  }

  const removeEntry = async (entryId: string) => {
    await deleteDoc(doc(db, 'projects', projectId, 'outreach_log', entryId))
  }

  // ----- Derived stats from live outreach_log (the recompute trigger
  // also writes summary on silent_test, but we render from raw for instant
  // feedback while the trigger catches up) -----
  const total = outreachLog.length
  const responded = outreachLog.filter((e) => e.responded).length
  const converted = outreachLog.filter((e) => e.converted).length
  const objections = outreachLog.filter((e) => e.objection?.trim()).length
  const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0.0'
  const responseRate = total > 0 ? ((responded / total) * 100).toFixed(1) : '0.0'

  const objectionCounts = outreachLog
    .filter((e) => e.objection?.trim())
    .reduce<Record<string, number>>((acc, e) => {
      const key = e.objection.trim()
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {})

  // ----- Completion gate: server-side enforcement, but mirror locally for UI -----
  const checklist = silentTest.checklist || {}
  const targetMet = silentTest.test_sample_size
    ? total >= silentTest.test_sample_size
    : total >= 30 // PRD floor

  const allGatePassed =
    !!checklist.offer_built &&
    !!checklist.parameters_set &&
    targetMet &&
    total > 0 &&
    !!checklist.objections_documented

  const handleCompletePhase = async () => {
    setCompleting(true)
    setCompletionError(null)
    try {
      await completePhase({ project_id: projectId, phase: 2 })
    } catch (err) {
      setCompletionError(err instanceof Error ? err.message : 'Could not advance phase.')
      setCompleting(false)
    }
  }

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
          Present your minimum offer to real buyers. Track replies, conversions, objections — ignore the rest.
        </p>
      </div>

      {/* Section 1 — Minimum Offer */}
      <div className="card mb-6">
        <p className="label mb-4">Minimum Offer</p>

        <div className="space-y-4 mb-5">
          <div>
            <label className="label text-phantom-text-secondary mb-2 block">Offer name</label>
            <input
              className="input"
              value={offerName}
              onChange={(e) => setOfferName(e.target.value)}
              placeholder="A short, functional name. Naming a test, not a product."
            />
          </div>
          <div>
            <label className="label text-phantom-text-secondary mb-2 block">Offer type</label>
            <select className="input" value={offerType} onChange={(e) => setOfferType(e.target.value)}>
              <option value="">Select...</option>
              <option value="service">Service</option>
              <option value="digital_product">Digital product</option>
              <option value="course">Course</option>
              <option value="consultation">Consultation</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="label text-phantom-text-secondary mb-2 block">What it includes (one per line)</label>
            <textarea
              className="input min-h-[88px]"
              value={offerIncludesRaw}
              onChange={(e) => setOfferIncludesRaw(e.target.value)}
              placeholder={'• 30-min strategy call\n• Written audit\n• 7-day follow-up'}
            />
          </div>
          <div>
            <label className="label text-phantom-text-secondary mb-2 block">The outcome it produces</label>
            <input
              className="input"
              value={offerOutcome}
              onChange={(e) => setOfferOutcome(e.target.value)}
              placeholder="The measurable result the buyer gets"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label text-phantom-text-secondary mb-2 block">Price (USD)</label>
              <input
                className="input"
                type="number"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                placeholder="e.g. 297"
              />
            </div>
            <div>
              <label className="label text-phantom-text-secondary mb-2 block">Delivery</label>
              <input
                className="input"
                value={offerDelivery}
                onChange={(e) => setOfferDelivery(e.target.value)}
                placeholder="e.g. 1:1 call + Notion doc"
              />
            </div>
          </div>
        </div>

        <button className="btn-secondary" onClick={saveOffer}>
          Save offer
        </button>

        <div className="mt-5 pt-5 border-t border-phantom-border-subtle">
          <GeneratorPanel
            title="Build the minimum offer"
            description="Returns 3 minimum-offer drafts calibrated to validate fast — name, includes, outcome, price band, delivery."
            cta="Generate 3 offer drafts"
            run={() => buildMinimumOffer({ project_id: projectId })}
            renderResult={(out) => (
              <div className="space-y-3">
                {out.drafts.map((d, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setOfferName(d.name)
                      setOfferType(d.type)
                      setOfferIncludesRaw(d.includes.join('\n'))
                      setOfferOutcome(d.outcome_sentence)
                      setOfferPrice(String(d.price_band.low))
                      setOfferDelivery(d.delivery_method)
                    }}
                    className="w-full text-left bg-phantom-black/40 border border-phantom-border-subtle rounded p-3 hover:border-phantom-lime/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <p className="font-body text-[14px] text-phantom-text-primary font-medium">{d.name}</p>
                      <span className="font-code text-[12px] text-phantom-lime shrink-0">
                        ${d.price_band.low}–${d.price_band.high}
                      </span>
                    </div>
                    <p className="font-body text-[12px] text-phantom-text-muted mb-2">{d.outcome_sentence}</p>
                    <p className="font-body text-[11px] text-phantom-text-muted">{d.why_this_validates_fast}</p>
                  </button>
                ))}
                <p className="font-body text-[11px] text-phantom-text-muted">
                  Click any draft to load it into the form above.
                </p>
              </div>
            )}
          />
        </div>
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
              { label: 'Target outreach attempts', val: targetSampleSize },
              { label: 'Validation conversion rate', val: `${targetConversion}%` },
              { label: 'Failure condition', val: failedTestCriteria },
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
                How many people will you present this to?
              </label>
              <input
                className="input"
                type="number"
                min="1"
                value={targetSampleSize}
                onChange={(e) => setTargetSampleSize(e.target.value)}
                placeholder="At least 30 (PRD floor)"
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
                value={targetConversion}
                onChange={(e) => setTargetConversion(e.target.value)}
                placeholder="e.g. 10"
              />
            </div>
            <div>
              <label className="label text-phantom-text-secondary mb-2 block">
                What counts as a failed test that requires rebuilding?
              </label>
              <textarea
                className="input"
                rows={2}
                value={failedTestCriteria}
                onChange={(e) => setFailedTestCriteria(e.target.value)}
                placeholder="The condition that means rebuild, not tweak."
              />
            </div>
            <button
              className="btn-primary"
              onClick={confirmParams}
              disabled={!targetSampleSize || !targetConversion || !failedTestCriteria.trim()}
            >
              Confirm parameters
            </button>
          </div>
        )}
      </div>

      {/* Section 3 — Outreach Generator */}
      <div className="card mb-6">
        <p className="label mb-2">Outreach Generator</p>
        <p className="font-body text-[14px] text-phantom-text-secondary mb-4">
          Generate three calibrated variations (direct / curious / value-first) for the platform you're testing on.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="label text-phantom-text-secondary mb-2 block">Platform</label>
            <input
              className="input"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="e.g. r/Entrepreneur, LinkedIn, Indie Hackers"
            />
          </div>
          <div>
            <label className="label text-phantom-text-secondary mb-2 block">Channel</label>
            <select
              className="input"
              value={channel}
              onChange={(e) => setChannel(e.target.value as Channel)}
            >
              {CHANNEL_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <GeneratorPanel
          title="Generate outreach"
          description="3 variations, each calibrated to the channel — direct, curious, value-first."
          requiredPlan="phantom_pro"
          disabled={!platform.trim()}
          disabledReason="Pick a specific platform first."
          cta="Generate 3 variations"
          run={() => generateOutreach({ project_id: projectId, platform, channel })}
          renderResult={(out) => (
            <div className="space-y-3">
              {out.variations.map((v, i) => (
                <div key={i} className="bg-phantom-black/40 border border-phantom-border-subtle rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="label text-phantom-lime uppercase text-[11px]">{v.variant.replace(/_/g, ' ')}</p>
                    <span className="font-code text-[11px] text-phantom-text-muted">{v.word_count} words</span>
                  </div>
                  <p className="font-body text-[13px] text-phantom-text-secondary whitespace-pre-wrap mb-2">{v.message}</p>
                  <p className="font-body text-[11px] text-phantom-text-muted italic">{v.why_this_works}</p>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(v.message)}
                    className="btn-ghost text-[12px] mt-2 px-2 py-1"
                  >
                    Copy to clipboard
                  </button>
                </div>
              ))}
              <p className="font-body text-[11px] text-phantom-text-muted">{out.platform_notes}</p>
            </div>
          )}
        />
      </div>

      {/* Section 4 — Outreach Log */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="label">Outreach Log</p>
          <button className="btn-primary text-[13px] py-2" onClick={() => setShowLogForm((v) => !v)}>
            <Plus size={14} /> Log outreach
          </button>
        </div>
        <p className="font-body text-[13px] text-phantom-text-muted mb-5">
          Track three things only: replies, conversions, objections.
        </p>

        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Total outreach', val: total, sub: '' },
            { label: 'Replies', val: responded, sub: total ? `${responseRate}%` : '' },
            { label: 'Conversions', val: converted, sub: total ? `${conversionRate}%` : '' },
            { label: 'Objections', val: objections, sub: '' },
          ].map(({ label, val, sub }) => (
            <div key={label} className="bg-[#0d0d0d] border border-phantom-border-subtle rounded p-3">
              <p className="font-code font-bold text-[22px] text-phantom-lime leading-none">{val}</p>
              <p className="font-body text-[11px] text-phantom-text-muted mt-1">{label}</p>
              {sub && <p className="font-body text-[11px] text-phantom-text-secondary">{sub}</p>}
            </div>
          ))}
        </div>

        <AnimatePresence>
          {showLogForm && (
            <motion.div
              className="bg-[#0d0d0d] border border-phantom-border-subtle rounded p-4 mb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
            >
              <p className="label text-phantom-lime mb-3">New outreach</p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label text-phantom-text-secondary mb-1.5 block text-[11px]">Platform</label>
                    <input
                      className="input text-[13px] py-2"
                      value={newEntry.platform}
                      onChange={(e) => setNewEntry((f) => ({ ...f, platform: e.target.value }))}
                      placeholder="e.g. r/SaaS, gmail"
                    />
                  </div>
                  <div>
                    <label className="label text-phantom-text-secondary mb-1.5 block text-[11px]">Type</label>
                    <select
                      className="input text-[13px] py-2"
                      value={newEntry.outreach_type}
                      onChange={(e) => setNewEntry((f) => ({ ...f, outreach_type: e.target.value as OutreachKind }))}
                    >
                      <option value="cold_dm">Cold DM</option>
                      <option value="email">Email</option>
                      <option value="community_post">Community post</option>
                      <option value="ad">Ad</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label text-phantom-text-secondary mb-1.5 block text-[11px]">Recipient (pseudonym is fine)</label>
                  <input
                    className="input text-[13px] py-2"
                    value={newEntry.identifier}
                    onChange={(e) => setNewEntry((f) => ({ ...f, identifier: e.target.value }))}
                    placeholder="e.g. j.smith / @handle / B2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 font-body text-[13px] text-phantom-text-secondary">
                    <input
                      type="checkbox"
                      checked={newEntry.responded}
                      onChange={(e) => setNewEntry((f) => ({ ...f, responded: e.target.checked }))}
                    />
                    Responded
                  </label>
                  <label className="flex items-center gap-2 font-body text-[13px] text-phantom-text-secondary">
                    <input
                      type="checkbox"
                      checked={newEntry.converted}
                      onChange={(e) => setNewEntry((f) => ({ ...f, converted: e.target.checked }))}
                    />
                    Converted
                  </label>
                </div>
                <div>
                  <label className="label text-phantom-text-secondary mb-1.5 block text-[11px]">Objection (if any)</label>
                  <input
                    className="input text-[13px] py-2"
                    value={newEntry.objection}
                    onChange={(e) => setNewEntry((f) => ({ ...f, objection: e.target.value }))}
                    placeholder="What did they push back on?"
                  />
                </div>
                <div>
                  <label className="label text-phantom-text-secondary mb-1.5 block text-[11px]">Notes</label>
                  <textarea
                    className="input text-[13px] py-2 min-h-[60px]"
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry((f) => ({ ...f, notes: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <button className="btn-primary text-[13px] py-2" onClick={addOutreachEntry} disabled={!newEntry.platform.trim()}>
                    Log it
                  </button>
                  <button className="btn-ghost text-[13px]" onClick={() => setShowLogForm(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {outreachLog.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-phantom-border rounded">
            <p className="font-body text-[14px] text-phantom-text-muted">No outreach logged.</p>
            <p className="font-body text-[13px] text-phantom-text-muted mt-1">
              Every test starts with a first attempt.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-phantom-border-subtle">
                  {['Date', 'Platform', 'Type', 'Recipient', 'Responded', 'Converted', 'Objection', ''].map((col) => (
                    <th key={col} className="text-left font-body text-[11px] text-phantom-text-muted pb-2 pr-4">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {outreachLog.map((e) => (
                  <tr key={e.id} className="border-b border-phantom-border-subtle/50">
                    <td className="py-3 pr-4 font-body text-[12px] text-phantom-text-muted whitespace-nowrap">{e.date}</td>
                    <td className="py-3 pr-4 font-body text-[13px] text-phantom-text-secondary">{e.platform}</td>
                    <td className="py-3 pr-4">
                      <span className="badge text-[11px]">{(e as any).outreach_type?.replace(/_/g, ' ') ?? 'other'}</span>
                    </td>
                    <td className="py-3 pr-4 font-body text-[13px] text-phantom-text-muted">
                      {/* identifier may not exist on legacy entries */}
                      {(e as { identifier?: string }).identifier ?? '—'}
                    </td>
                    <td className="py-3 pr-4">
                      {e.responded ? <span className="text-phantom-lime">Yes</span> : <span className="text-phantom-text-muted">—</span>}
                    </td>
                    <td className="py-3 pr-4">
                      {e.converted ? <span className="text-phantom-lime">Yes</span> : <span className="text-phantom-text-muted">—</span>}
                    </td>
                    <td className="py-3 pr-4 font-body text-[13px] text-phantom-text-secondary max-w-[200px] truncate">
                      {e.objection || '—'}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => removeEntry(e.id)}
                        className="text-phantom-text-muted hover:text-phantom-danger transition-colors"
                        aria-label="Delete entry"
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

        {Object.keys(objectionCounts).length > 0 && (
          <div className="mt-5 pt-5 border-t border-phantom-border-subtle">
            <p className="label mb-3">Top objections (raw)</p>
            <div className="space-y-2">
              {Object.entries(objectionCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 8)
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

      {/* Section 5 — Objection Library */}
      <div className="card mb-6">
        <p className="label mb-2">Objection Library</p>
        <p className="font-body text-[14px] text-phantom-text-secondary mb-4">
          Group your raw objections into patterns and prepared responses. Marks "objections documented" complete.
        </p>

        <GeneratorPanel
          title="Build objection library"
          description="Buckets your logged objections (price / trust / proof / fit / timing) and writes a prepared response for each pattern."
          disabled={objections === 0}
          disabledReason="Log at least one objection in the outreach log first."
          cta="Build the library"
          run={() => buildObjectionLibrary({ project_id: projectId })}
          renderResult={(out) => {
            if (out.empty) {
              return <p className="font-body text-[13px] text-phantom-text-muted">No objections to bucket yet.</p>
            }
            return (
              <div className="space-y-4">
                <p className="font-body text-[13px] text-phantom-text-secondary">
                  Most common bucket: <span className="text-phantom-lime font-medium">{out.most_common_bucket}</span>
                </p>
                {out.buckets.map((b) => (
                  <div key={b.bucket} className="bg-phantom-black/40 border border-phantom-border-subtle rounded p-3">
                    <p className="label text-phantom-lime mb-3">{b.bucket}</p>
                    <div className="space-y-3">
                      {b.objections.map((o, i) => (
                        <div key={i}>
                          <p className="font-body text-[13px] text-phantom-text-secondary italic mb-1">"{o.raw}"</p>
                          <p className="font-body text-[12px] text-phantom-text-muted mb-1">Pattern: {o.pattern}</p>
                          <p className="font-body text-[13px] text-phantom-text-primary mb-1">Response: {o.response}</p>
                          {o.offer_change_hint && (
                            <p className="font-body text-[12px] text-phantom-warning">
                              Offer hint: {o.offer_change_hint}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <p className="font-body text-[11px] text-phantom-text-muted">
                  Saved to your project. The objection library carries into Phase 03 diagnosis.
                </p>
              </div>
            )
          }}
        />
      </div>

      {/* Completion gate */}
      <div className={`card transition-colors duration-300 ${allGatePassed ? 'border-phantom-lime' : 'border-phantom-border'}`}>
        <p className="label text-phantom-lime mb-4">Phase 2 Completion</p>

        <div className="space-y-3 mb-6">
          {[
            { label: 'Minimum offer built', done: !!checklist.offer_built },
            { label: 'Test parameters set and confirmed', done: !!checklist.parameters_set },
            {
              label: silentTest.test_sample_size
                ? `Minimum ${silentTest.test_sample_size} outreach attempts logged (${total} so far)`
                : `30 outreach attempts logged (${total} so far)`,
              done: targetMet,
            },
            { label: `Conversion data recorded (${conversionRate}% conversion)`, done: total > 0 },
            { label: 'Objection library generated', done: !!checklist.objections_documented },
          ].map(({ label, done }) => (
            <div key={label} className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  done ? 'bg-phantom-lime border-phantom-lime' : 'border-phantom-border'
                }`}
              >
                {done && <span className="text-phantom-black text-[11px] font-bold">✓</span>}
              </div>
              <span className={`font-body text-[14px] ${done ? 'text-phantom-text-primary' : 'text-phantom-text-muted'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {completionError && (
          <div className="bg-phantom-danger/10 border border-phantom-danger/30 rounded p-3 mb-4">
            <p className="font-body text-[13px] text-phantom-danger">{completionError}</p>
          </div>
        )}

        <button className="btn-primary" disabled={!allGatePassed || completing} onClick={handleCompletePhase}>
          {completing ? (
            <>
              <Loader size={14} className="animate-spin" /> Advancing phase...
            </>
          ) : (
            <>
              Phase 2 complete. Proceed to Iteration Loop <ExternalLink size={12} />
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
})

PhaseTest.displayName = 'PhaseTest'
export default PhaseTest
