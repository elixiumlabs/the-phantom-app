import { memo, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Loader, ExternalLink, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useProjects } from '@/contexts/ProjectContext'
import {
  diagnoseOffer,
  suggestIteration,
  competitiveGapAnalysis,
  completePhase,
} from '@/lib/functions'
import GeneratorPanel from '@/components/app/GeneratorPanel'
import { ProtectedContent } from '@/components/ui/ProtectedContent'
import { useProtection } from '@/hooks'

const PhaseIterate = memo(() => {
  const { id } = useParams()
  const navigate = useNavigate()
  const projectId = id!
  const {
    currentProject,
    iterationLoop,
    iterationVersions,
    silentTest,
    ghostIdentity,
  } = useProjects()

  // Enable protection for AI-generated content
  useProtection({ disableRightClick: true, monitorCopy: true })

  const ilRef = doc(db, 'projects', projectId, 'iteration_loop', 'main')

  const [privateNotes, setPrivateNotes] = useState('')
  const [audienceForGap, setAudienceForGap] = useState('')

  // Iteration version form
  const [showVersionForm, setShowVersionForm] = useState(false)
  const [newVersion, setNewVersion] = useState({
    what_changed: '',
    single_variable: true,
    result: '',
    new_conversion_rate: '',
  })

  // Expanded state per iteration row
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const [completing, setCompleting] = useState(false)
  const [completionError, setCompletionError] = useState<string | null>(null)

  useEffect(() => {
    if (!iterationLoop) return
    setPrivateNotes(iterationLoop.private_notes ?? '')
  }, [iterationLoop])

  if (!currentProject || !iterationLoop) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="animate-spin text-phantom-lime" size={24} />
      </div>
    )
  }

  // ----- Direct writes -----
  const savePrivateNotes = async () => {
    await setDoc(ilRef, { private_notes: privateNotes, updated_at: serverTimestamp() }, { merge: true })
  }

  const addVersion = async () => {
    if (!newVersion.what_changed.trim()) return
    await addDoc(collection(db, 'projects', projectId, 'iteration_versions'), {
      project_id: projectId,
      // version_number is server-stamped by the iterationTriggers function.
      date: new Date().toISOString().slice(0, 10),
      what_changed: newVersion.what_changed.trim(),
      single_variable: newVersion.single_variable,
      result: newVersion.result.trim(),
      new_conversion_rate: newVersion.new_conversion_rate ? Number(newVersion.new_conversion_rate) : null,
      created_at: serverTimestamp(),
    })
    setNewVersion({ what_changed: '', single_variable: true, result: '', new_conversion_rate: '' })
    setShowVersionForm(false)

    // Mark log_documented + one_iteration on the iteration_loop checklist.
    await setDoc(
      ilRef,
      {
        'checklist.log_documented': true,
        'checklist.one_iteration': true,
        updated_at: serverTimestamp(),
      },
      { merge: true },
    )
  }

  const toggleExpanded = (vid: string) => {
    setExpanded((s) => {
      const next = new Set(s)
      if (next.has(vid)) next.delete(vid)
      else next.add(vid)
      return next
    })
  }

  // ----- Completion gate -----
  const checklist = iterationLoop.checklist || {}

  const targetRate = silentTest?.target_conversion_rate ?? null
  const currentRate = silentTest?.summary?.conversion_rate ?? 0
  const convertingAtTarget = targetRate !== null ? currentRate >= targetRate : false

  const allGatePassed =
    !!checklist.diagnosis_done &&
    !!checklist.one_iteration &&
    !!checklist.log_documented &&
    convertingAtTarget &&
    !!checklist.objections_reduced

  const handleCompletePhase = async () => {
    setCompleting(true)
    setCompletionError(null)
    try {
      await completePhase({ project_id: projectId, phase: 3 })
      navigate(`/project/${projectId}/lock`)
    } catch (err) {
      setCompletionError(err instanceof Error ? err.message : 'Could not advance phase.')
      setCompleting(false)
    }
  }

  const toggleObjectionsReduced = async () => {
    await setDoc(
      ilRef,
      {
        'checklist.objections_reduced': !checklist.objections_reduced,
        updated_at: serverTimestamp(),
      },
      { merge: true },
    )
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
        <p className="label text-phantom-lime mb-2">Phase 03 — Iteration Loop</p>
        <h1 className="font-display font-bold text-[32px] text-phantom-text-primary mb-3">
          Fix what the data tells you to fix.
        </h1>
        <p className="font-body text-[16px] text-phantom-text-secondary">
          Diagnose. Change one variable. Document the result. No public pivots — just market signal.
        </p>
      </div>

      {/* Section 1 — Diagnosis */}
      <div className="card mb-6">
        <p className="label mb-2">Diagnosis</p>
        <p className="font-body text-[14px] text-phantom-text-secondary mb-4">
          The diagnoser reads your real outreach data and tells you which variable to change. No guessing.
        </p>

        <GeneratorPanel
          title="Diagnose the offer"
          description="Reads your outreach log (response rate, conversion rate, objections) and returns one specific diagnosis + one fix instruction."
          requiredPlan="phantom_pro"
          cta="Run diagnosis"
          run={() => diagnoseOffer({ project_id: projectId })}
          renderResult={(out) => (
            <ProtectedContent watermark disableSelect>
              <div className="space-y-3">
              <div className="bg-phantom-warning/10 border border-phantom-warning/30 rounded p-3">
                <p className="label text-phantom-warning mb-2">Diagnosis</p>
                <p className="font-body text-[14px] text-phantom-text-primary mb-2">{out.diagnosis}</p>
                <p className="font-body text-[12px] text-phantom-text-muted uppercase tracking-wide">
                  Variable to change: <span className="text-phantom-lime">{out.variable_to_change.replace(/_/g, ' ')}</span>
                </p>
              </div>
              <div className="bg-phantom-lime/5 border border-phantom-lime/30 rounded p-3">
                <p className="label text-phantom-lime mb-2">Fix</p>
                <p className="font-body text-[14px] text-phantom-text-primary">{out.fix}</p>
              </div>
              <p className="font-body text-[12px] text-phantom-text-muted italic">{out.reasoning}</p>
              <p className="font-body text-[11px] text-phantom-text-muted">
                Diagnosis saved. Marks "diagnosis done" complete on the checklist.
              </p>
            </div>
            </ProtectedContent>
          )}
        />
      </div>

      {/* Section 2 — Single-variable suggester */}
      <div className="card mb-6">
        <p className="label mb-2">Next iteration suggester</p>
        <p className="font-body text-[14px] text-phantom-text-secondary mb-4">
          Given current state, returns the ONE variable to change next, the hypothesis, and how to measure the effect.
        </p>

        <GeneratorPanel
          title="Suggest next iteration"
          description="One variable. One hypothesis. One thing to measure."
          requiredPlan="phantom_pro"
          cta="Suggest"
          run={() => suggestIteration({ project_id: projectId })}
          renderResult={(out) => (
            <ProtectedContent watermark disableSelect>
              <div className="space-y-3">
              <div className="bg-phantom-black/40 border border-phantom-border-subtle rounded p-3">
                <p className="label text-phantom-lime mb-1">Variable to change</p>
                <p className="font-body text-[14px] text-phantom-text-primary">{out.variable_to_change}</p>
              </div>
              <div className="bg-phantom-black/40 border border-phantom-border-subtle rounded p-3">
                <p className="label text-phantom-lime mb-1">Hypothesis</p>
                <p className="font-body text-[14px] text-phantom-text-primary">{out.hypothesis}</p>
              </div>
              <div className="bg-phantom-black/40 border border-phantom-border-subtle rounded p-3">
                <p className="label text-phantom-lime mb-1">Exact change</p>
                <p className="font-body text-[14px] text-phantom-text-primary">{out.exact_change}</p>
              </div>
              <div className="bg-phantom-black/40 border border-phantom-border-subtle rounded p-3">
                <p className="label text-phantom-lime mb-1">How to measure</p>
                <p className="font-body text-[14px] text-phantom-text-primary">{out.measure}</p>
                <p className="font-body text-[12px] text-phantom-text-muted mt-1">Expected signal: {out.expected_signal}</p>
              </div>
              {out.do_not_change.length > 0 && (
                <div className="bg-phantom-danger/10 border border-phantom-danger/30 rounded p-3">
                  <p className="label text-phantom-danger mb-1">Do NOT change</p>
                  <ul className="space-y-1">
                    {out.do_not_change.map((d, i) => (
                      <li key={i} className="font-body text-[13px] text-phantom-text-secondary">— {d}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            </ProtectedContent>
          )}
        />
      </div>

      {/* Section 3 — Competitive gap analysis */}
      <div className="card mb-6">
        <p className="label mb-2">Competitive gap analysis</p>
        <p className="font-body text-[14px] text-phantom-text-secondary mb-4">
          Maps existing solutions, what they do well, what they consistently miss, and the gap your offer can fill.
        </p>

        <label className="label text-phantom-text-secondary mb-2 block">
          Audience description (one line)
        </label>
        <input
          className="input mb-4"
          value={audienceForGap}
          onChange={(e) => setAudienceForGap(e.target.value)}
          placeholder="e.g. neurodivergent freelancers running their own service businesses"
        />

        <GeneratorPanel
          title="Run competitive gap analysis"
          description="Returns a map of incumbents + the wedge you can claim."
          requiredPlan="phantom_pro"
          disabled={!ghostIdentity?.problem_statement || audienceForGap.trim().length < 5}
          disabledReason="Phase 01 problem statement and an audience line are required."
          cta="Map the gaps"
          run={() =>
            competitiveGapAnalysis({
              problem_statement: ghostIdentity?.problem_statement ?? '',
              audience: audienceForGap,
              project_id: projectId,
            })
          }
          renderResult={(out) => (
            <ProtectedContent watermark disableSelect>
              <div className="space-y-3">
              <p className="font-body text-[13px] text-phantom-text-secondary">
                Primary wedge: <span className="text-phantom-lime font-medium">{out.primary_wedge}</span>
              </p>
              <div className="space-y-2">
                <p className="label text-phantom-lime">Existing solutions</p>
                {out.existing_solutions.map((s, i) => (
                  <div key={i} className="bg-phantom-black/40 border border-phantom-border-subtle rounded p-3">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="font-body text-[14px] text-phantom-text-primary font-medium">{s.name}</p>
                      <span className="font-code text-[10px] text-phantom-text-muted uppercase tracking-wider shrink-0">
                        {s.category.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="font-body text-[12px] text-phantom-lime mb-1">Does well:</p>
                    <ul className="mb-2">
                      {s.does_well.map((x, j) => (
                        <li key={j} className="font-body text-[12px] text-phantom-text-secondary">— {x}</li>
                      ))}
                    </ul>
                    <p className="font-body text-[12px] text-phantom-danger mb-1">Misses:</p>
                    <ul>
                      {s.consistently_misses.map((x, j) => (
                        <li key={j} className="font-body text-[12px] text-phantom-text-secondary">— {x}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <p className="label text-phantom-lime">Gaps you can fill</p>
                {out.gaps.map((g, i) => (
                  <div key={i} className="bg-phantom-lime/5 border border-phantom-lime/30 rounded p-3">
                    <p className="font-body text-[14px] text-phantom-text-primary mb-1">{g.gap}</p>
                    <p className="font-body text-[12px] text-phantom-text-muted mb-1">Why unfilled: {g.why_unfilled}</p>
                    <p className="font-body text-[12px] text-phantom-text-secondary">Your wedge: {g.user_wedge}</p>
                  </div>
                ))}
              </div>
            </div>
            </ProtectedContent>
          )}
        />
      </div>

      {/* Section 4 — Iteration log */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="label">Iteration log</p>
          <button className="btn-primary text-[13px] py-2" onClick={() => setShowVersionForm((v) => !v)}>
            <Plus size={14} /> Log iteration
          </button>
        </div>
        <p className="font-body text-[13px] text-phantom-text-muted mb-5">
          One variable changed at a time. The version number is auto-stamped server-side.
        </p>

        <AnimatePresence>
          {showVersionForm && (
            <motion.div
              className="bg-[#0d0d0d] border border-phantom-border-subtle rounded p-4 mb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
            >
              <p className="label text-phantom-lime mb-3">New iteration</p>
              <div className="space-y-3">
                <div>
                  <label className="label text-phantom-text-secondary mb-1.5 block text-[11px]">What changed?</label>
                  <textarea
                    className="input text-[13px] py-2 min-h-[60px]"
                    value={newVersion.what_changed}
                    onChange={(e) => setNewVersion((f) => ({ ...f, what_changed: e.target.value }))}
                    placeholder="One variable, described precisely."
                  />
                </div>
                <label className="flex items-center gap-2 font-body text-[13px] text-phantom-text-secondary">
                  <input
                    type="checkbox"
                    checked={newVersion.single_variable}
                    onChange={(e) => setNewVersion((f) => ({ ...f, single_variable: e.target.checked }))}
                  />
                  Single variable changed (recommended)
                </label>
                {!newVersion.single_variable && (
                  <div className="flex items-start gap-2 bg-phantom-warning/10 border border-phantom-warning/30 rounded p-2">
                    <AlertTriangle size={13} className="text-phantom-warning mt-0.5 shrink-0" />
                    <p className="font-body text-[12px] text-phantom-warning">
                      Multi-variable changes get flagged. You won't be able to attribute the result to anything specific.
                    </p>
                  </div>
                )}
                <div>
                  <label className="label text-phantom-text-secondary mb-1.5 block text-[11px]">Result</label>
                  <textarea
                    className="input text-[13px] py-2 min-h-[60px]"
                    value={newVersion.result}
                    onChange={(e) => setNewVersion((f) => ({ ...f, result: e.target.value }))}
                    placeholder="What happened after the change?"
                  />
                </div>
                <div>
                  <label className="label text-phantom-text-secondary mb-1.5 block text-[11px]">New conversion rate (%)</label>
                  <input
                    className="input text-[13px] py-2"
                    type="number"
                    step="0.1"
                    value={newVersion.new_conversion_rate}
                    onChange={(e) => setNewVersion((f) => ({ ...f, new_conversion_rate: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>
                <div className="flex gap-2">
                  <button className="btn-primary text-[13px] py-2" onClick={addVersion} disabled={!newVersion.what_changed.trim()}>
                    Log it
                  </button>
                  <button className="btn-ghost text-[13px]" onClick={() => setShowVersionForm(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {iterationVersions.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-phantom-border rounded">
            <p className="font-body text-[14px] text-phantom-text-muted">No iterations logged yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {iterationVersions.map((v) => {
              const isOpen = expanded.has(v.id)
              return (
                <div key={v.id} className="bg-[#0d0d0d] border border-phantom-border-subtle rounded">
                  <button
                    className="w-full flex items-center justify-between p-3 text-left"
                    onClick={() => toggleExpanded(v.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-code text-[13px] text-phantom-lime shrink-0">v{v.version_number ?? '?'}</span>
                      <span className="font-body text-[13px] text-phantom-text-primary truncate">{v.what_changed}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {v.new_conversion_rate !== null && (
                        <span className="font-code text-[12px] text-phantom-text-secondary">{v.new_conversion_rate}%</span>
                      )}
                      {isOpen ? <ChevronUp size={14} className="text-phantom-text-muted" /> : <ChevronDown size={14} className="text-phantom-text-muted" />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="border-t border-phantom-border-subtle p-3 space-y-2">
                      <p className="font-body text-[12px] text-phantom-text-muted">Date: {v.date}</p>
                      <p className="font-body text-[12px] text-phantom-text-muted">
                        Single variable: {v.single_variable ? 'yes' : <span className="text-phantom-warning">no</span>}
                      </p>
                      <p className="font-body text-[13px] text-phantom-text-secondary">
                        <span className="text-phantom-lime">Result:</span> {v.result || '—'}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Section 5 — Private documentation */}
      <div className="card mb-6">
        <p className="label mb-2">Private documentation</p>
        <p className="font-body text-[14px] text-phantom-text-secondary mb-4">
          Every version of the offer. Every outreach message. Every objection and how you responded.
          This becomes your proof library and methodology when you surface.
        </p>

        <textarea
          className="input min-h-[160px] font-mono text-[13px]"
          value={privateNotes}
          onChange={(e) => setPrivateNotes(e.target.value)}
          placeholder="Write freely. This is the asset you're building."
        />

        <button className="btn-secondary mt-3" onClick={savePrivateNotes}>
          Save notes
        </button>
      </div>

      {/* Completion Gate */}
      <div className={`card transition-colors duration-300 ${allGatePassed ? 'border-phantom-lime' : 'border-phantom-border'}`}>
        <p className="label text-phantom-lime mb-4">Phase 3 Completion</p>

        <div className="space-y-3 mb-6">
          {[
            { label: 'Diagnosis completed for current data', done: !!checklist.diagnosis_done },
            { label: 'At least one iteration cycle completed', done: !!checklist.one_iteration },
            { label: 'Iteration log documents each change and result', done: !!checklist.log_documented },
            {
              label: targetRate
                ? `Converting at or above target rate (${currentRate}% / target ${targetRate}%)`
                : 'Converting at or above target rate',
              done: convertingAtTarget,
            },
            {
              label: 'Objection list reduced to predictable set',
              done: !!checklist.objections_reduced,
              toggle: true,
            },
          ].map(({ label, done, toggle }) => (
            <div
              key={label}
              className={`flex items-center gap-3 ${toggle ? 'cursor-pointer' : ''}`}
              onClick={toggle ? toggleObjectionsReduced : undefined}
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
                {toggle && !done && <span className="text-phantom-text-muted text-[12px] ml-2">(click to confirm)</span>}
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
              Phase 3 complete. Proceed to Lock In <ExternalLink size={12} />
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
})

PhaseIterate.displayName = 'PhaseIterate'
export default PhaseIterate
