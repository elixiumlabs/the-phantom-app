import { memo, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Loader, Download, Sparkles, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useProjects } from '@/contexts/ProjectContext'
import { useVault } from '@/hooks'
import {
  positioningFromData,
  recommendBrandIdentity,
  buildNotFor,
  structureTestimonial,
  curateProofPackage,
  exportLockInPdf,
  completePhase,
} from '@/lib/functions'
import GeneratorPanel from '@/components/app/GeneratorPanel'

const VISUAL_DIRECTIONS = ['minimal', 'editorial', 'bold', 'warm', 'technical', 'other']

const PhaseLock = memo(() => {
  const { id } = useParams()
  const projectId = id!
  const { currentProject, lockIn } = useProjects()
  const { items: vaultItems } = useVault(projectId)

  const liRef = doc(db, 'projects', projectId, 'lock_in', 'main')

  // Buyer language (Phase 04 §1)
  const [buyerProblem, setBuyerProblem] = useState('')
  const [buyerOutcome, setBuyerOutcome] = useState('')
  const [buyerPrior, setBuyerPrior] = useState('')

  // Brand identity (§2)
  const [finalBrandName, setFinalBrandName] = useState('')
  const [generatedPositioning, setGeneratedPositioning] = useState('')
  const [visualDirection, setVisualDirection] = useState('')
  const [voiceAdjectives, setVoiceAdjectives] = useState('')
  const [notFor, setNotFor] = useState('')

  // Testimonial structurer input
  const [rawTestimonial, setRawTestimonial] = useState('')
  const [testimonialSource, setTestimonialSource] = useState('')

  // Export state
  const [exporting, setExporting] = useState(false)
  const [exportResult, setExportResult] = useState<{ url?: string; html?: string } | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  const [completing, setCompleting] = useState(false)
  const [completionError, setCompletionError] = useState<string | null>(null)

  useEffect(() => {
    if (!lockIn) return
    setBuyerProblem(lockIn.buyer_problem_language ?? '')
    setBuyerOutcome(lockIn.buyer_outcome_language ?? '')
    setBuyerPrior(lockIn.buyer_prior_attempts ?? '')
    setFinalBrandName(lockIn.final_brand_name ?? '')
    setGeneratedPositioning(lockIn.generated_positioning ?? '')
    setVisualDirection(lockIn.visual_direction ?? '')
    setVoiceAdjectives((lockIn.final_voice_adjectives ?? []).join(', '))
    setNotFor(lockIn.not_for ?? '')
  }, [lockIn])

  if (!currentProject || !lockIn) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="animate-spin text-phantom-lime" size={24} />
      </div>
    )
  }

  // ----- Direct writes -----
  const saveBuyerLanguage = async () => {
    await setDoc(
      liRef,
      {
        buyer_problem_language: buyerProblem,
        buyer_outcome_language: buyerOutcome,
        buyer_prior_attempts: buyerPrior,
        updated_at: serverTimestamp(),
      },
      { merge: true },
    )
  }

  const saveBrandIdentity = async () => {
    await setDoc(
      liRef,
      {
        final_brand_name: finalBrandName,
        generated_positioning: generatedPositioning,
        visual_direction: visualDirection || null,
        final_voice_adjectives: voiceAdjectives
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        not_for: notFor,
        'checklist.one_sentence_positioning': generatedPositioning.trim().length > 0,
        'checklist.brand_from_data': !!visualDirection,
        'checklist.not_for_defined': notFor.trim().length > 0,
        updated_at: serverTimestamp(),
      },
      { merge: true },
    )
  }

  const handleExport = async () => {
    setExporting(true)
    setExportError(null)
    setExportResult(null)
    try {
      const out = await exportLockInPdf({ project_id: projectId })
      if ('url' in out) setExportResult({ url: out.url })
      else setExportResult({ html: out.html })
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed.')
    } finally {
      setExporting(false)
    }
  }

  const handleCompletePhase = async () => {
    setCompleting(true)
    setCompletionError(null)
    try {
      await completePhase({ project_id: projectId, phase: 4 })
    } catch (err) {
      setCompletionError(err instanceof Error ? err.message : 'Could not complete phase.')
      setCompleting(false)
    }
  }

  // ----- Lock-in checklist -----
  const checklist = lockIn.checklist || {}
  const conversionsCount = vaultItems.filter((v) =>
    ['testimonial', 'case_study', 'revenue', 'conversion_data'].includes(v.proof_type),
  ).length

  const fiveConversionsMet = conversionsCount >= 5
  const threeProofMet = vaultItems.length >= 3

  const allChecked =
    fiveConversionsMet &&
    !!checklist.one_sentence_positioning &&
    threeProofMet &&
    !!checklist.objections_mapped &&
    !!checklist.brand_from_data &&
    !!checklist.not_for_defined

  const readyToSurface = currentProject.ready_to_surface

  return (
    <motion.div
      className="max-w-3xl"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="mb-8">
        <p className="label text-phantom-lime mb-2">Phase 04 — Lock In</p>
        <h1 className="font-display font-bold text-[32px] text-phantom-text-primary mb-3">
          Build the brand from the data.
        </h1>
        <p className="font-body text-[16px] text-phantom-text-secondary">
          Now that the offer works, lock in the positioning, the identity, and the proof package — built from validated buyer language, not preference.
        </p>
      </div>

      {/* Ready to surface banner */}
      {readyToSurface && (
        <motion.div
          className="mb-6 bg-phantom-lime text-phantom-black rounded-xl p-5"
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <p className="font-display font-bold text-[20px] mb-1">PHANTOM PHASE COMPLETE.</p>
          <p className="font-body text-[14px]">You have proof. Now you go visible.</p>
        </motion.div>
      )}

      {/* Section 1 — Buyer language */}
      <div className="card mb-6">
        <p className="label mb-2">Lock in positioning from buyer language</p>
        <p className="font-body text-[14px] text-phantom-text-secondary mb-4">
          Paste the actual words your buyers used. Not your interpretation. The positioning generator turns these into a one-sentence statement.
        </p>

        <div className="space-y-4 mb-4">
          <div>
            <label className="label text-phantom-text-secondary mb-2 block">
              How buyers described the problem before finding you
            </label>
            <textarea
              className="input min-h-[88px]"
              value={buyerProblem}
              onChange={(e) => setBuyerProblem(e.target.value)}
              placeholder="Their words, verbatim where possible."
            />
          </div>
          <div>
            <label className="label text-phantom-text-secondary mb-2 block">
              Words buyers used to describe the outcome they got
            </label>
            <textarea
              className="input min-h-[88px]"
              value={buyerOutcome}
              onChange={(e) => setBuyerOutcome(e.target.value)}
            />
          </div>
          <div>
            <label className="label text-phantom-text-secondary mb-2 block">
              What they had tried before that did not work
            </label>
            <textarea
              className="input min-h-[88px]"
              value={buyerPrior}
              onChange={(e) => setBuyerPrior(e.target.value)}
            />
          </div>
        </div>

        <button className="btn-secondary mb-5" onClick={saveBuyerLanguage}>
          Save buyer language
        </button>

        <GeneratorPanel
          title="Generate positioning from data"
          description="Takes the three buyer-language inputs above and synthesizes a one-sentence positioning statement built from their words."
          requiredPlan="phantom_pro"
          disabled={!buyerProblem.trim() || !buyerOutcome.trim()}
          disabledReason="Add buyer problem and outcome language first."
          cta="Generate positioning"
          run={() => positioningFromData({ project_id: projectId })}
          renderResult={(out) => (
            <div className="space-y-3">
              <div className="bg-phantom-lime/5 border border-phantom-lime/30 rounded p-4">
                <p className="label text-phantom-lime mb-2">Positioning</p>
                <p className="font-body text-[16px] text-phantom-text-primary leading-relaxed mb-3">
                  {out.positioning}
                </p>
                <button
                  className="btn-secondary text-[12px] py-1.5 px-3"
                  onClick={() => {
                    setGeneratedPositioning(out.positioning)
                  }}
                >
                  Use this positioning
                </button>
              </div>
              <p className="font-body text-[12px] text-phantom-text-muted italic">{out.reasoning}</p>
              {out.buyer_phrases_used.length > 0 && (
                <div>
                  <p className="label text-phantom-lime mb-2">Buyer phrases used</p>
                  <div className="flex flex-wrap gap-2">
                    {out.buyer_phrases_used.map((p, i) => (
                      <span key={i} className="badge text-[11px] px-2 py-1 bg-phantom-black/40 border border-phantom-border-subtle rounded">{p}</span>
                    ))}
                  </div>
                </div>
              )}
              {out.what_was_left_out.length > 0 && (
                <div>
                  <p className="label text-phantom-warning mb-2">Left out (worth reviewing)</p>
                  <ul className="space-y-1">
                    {out.what_was_left_out.map((p, i) => (
                      <li key={i} className="font-body text-[12px] text-phantom-text-secondary">— {p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        />
      </div>

      {/* Section 2 — Brand identity */}
      <div className="card mb-6">
        <p className="label mb-2">Brand identity decisions</p>
        <p className="font-body text-[14px] text-phantom-text-secondary mb-4">
          Now the name matters. Now the identity matters. The recommender pulls from your validated positioning and voice.
        </p>

        <div className="space-y-4 mb-5">
          <div>
            <label className="label text-phantom-text-secondary mb-2 block">Final brand name</label>
            <input
              className="input"
              value={finalBrandName}
              onChange={(e) => setFinalBrandName(e.target.value)}
            />
          </div>
          <div>
            <label className="label text-phantom-text-secondary mb-2 block">One-sentence positioning</label>
            <input
              className="input"
              value={generatedPositioning}
              onChange={(e) => setGeneratedPositioning(e.target.value)}
              placeholder="Generate from buyer language above, or write directly."
            />
          </div>
          <div>
            <label className="label text-phantom-text-secondary mb-2 block">Visual direction</label>
            <select
              className="input"
              value={visualDirection}
              onChange={(e) => setVisualDirection(e.target.value)}
            >
              <option value="">Select...</option>
              {VISUAL_DIRECTIONS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label text-phantom-text-secondary mb-2 block">Voice adjectives (comma-separated)</label>
            <input
              className="input"
              value={voiceAdjectives}
              onChange={(e) => setVoiceAdjectives(e.target.value)}
              placeholder="e.g. direct, technical, no-nonsense"
            />
          </div>
          <div>
            <label className="label text-phantom-text-secondary mb-2 block">Who this is NOT for</label>
            <textarea
              className="input min-h-[80px]"
              value={notFor}
              onChange={(e) => setNotFor(e.target.value)}
              placeholder="As specific as who it IS for."
            />
          </div>
        </div>

        <button className="btn-secondary mb-5" onClick={saveBrandIdentity}>
          Save brand identity
        </button>

        <GeneratorPanel
          title="Recommend brand identity"
          description="Returns a visual direction recommendation, color/type mood, voice pillars, and the one thing to avoid — all derived from your validated positioning."
          requiredPlan="phantom_pro"
          cta="Recommend identity"
          run={() => recommendBrandIdentity({ project_id: projectId })}
          renderResult={(out) => (
            <div className="space-y-3">
              <div className="bg-phantom-black/40 border border-phantom-border-subtle rounded p-3">
                <p className="label text-phantom-lime mb-1">Visual direction</p>
                <p className="font-body text-[14px] text-phantom-text-primary mb-1">{out.visual_direction}</p>
                <p className="font-body text-[12px] text-phantom-text-muted">{out.visual_reasoning}</p>
                <button
                  className="btn-secondary text-[12px] py-1 px-3 mt-2"
                  onClick={() => setVisualDirection(out.visual_direction)}
                >
                  Apply
                </button>
              </div>
              <div className="bg-phantom-black/40 border border-phantom-border-subtle rounded p-3">
                <p className="label text-phantom-lime mb-1">Color mood</p>
                <p className="font-body text-[13px] text-phantom-text-primary mb-1">{out.color_mood.primary_feel}</p>
                {out.color_mood.example_palette.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {out.color_mood.example_palette.map((c, i) => (
                      <span key={i} className="font-code text-[11px] px-2 py-1 rounded bg-phantom-black border border-phantom-border-subtle text-phantom-text-secondary">{c}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-phantom-black/40 border border-phantom-border-subtle rounded p-3">
                <p className="label text-phantom-lime mb-1">Voice pillars</p>
                <ul className="space-y-1">
                  {out.voice_pillars.map((v, i) => (
                    <li key={i} className="font-body text-[13px] text-phantom-text-secondary">— {v}</li>
                  ))}
                </ul>
                <button
                  className="btn-secondary text-[12px] py-1 px-3 mt-2"
                  onClick={() => setVoiceAdjectives(out.voice_pillars.slice(0, 3).join(', '))}
                >
                  Apply top 3
                </button>
              </div>
              <div className="bg-phantom-danger/10 border border-phantom-danger/30 rounded p-3">
                <p className="label text-phantom-danger mb-1">One thing to avoid</p>
                <p className="font-body text-[13px] text-phantom-text-secondary">{out.one_thing_to_avoid}</p>
              </div>
            </div>
          )}
        />
      </div>

      {/* Section 3 — Not-for builder */}
      <div className="card mb-6">
        <p className="label mb-2">Who this is NOT for</p>
        <p className="font-body text-[14px] text-phantom-text-secondary mb-4">
          Generate specific exclusions and the failure modes that follow if you serve them anyway.
        </p>

        <GeneratorPanel
          title="Build the not-for list"
          description="Returns a not-for paragraph, specific exclusions with reasoning, and what fails if you serve those people."
          requiredPlan="phantom_pro"
          cta="Build not-for"
          run={() => buildNotFor({ project_id: projectId })}
          renderResult={(out) => (
            <div className="space-y-3">
              <div className="bg-phantom-black/40 border border-phantom-border-subtle rounded p-3">
                <p className="label text-phantom-lime mb-2">Not-for paragraph</p>
                <p className="font-body text-[14px] text-phantom-text-primary mb-2 leading-relaxed">{out.not_for_paragraph}</p>
                <button
                  className="btn-secondary text-[12px] py-1 px-3"
                  onClick={() => setNotFor(out.not_for_paragraph)}
                >
                  Use this
                </button>
              </div>
              <div className="space-y-2">
                <p className="label text-phantom-lime">Specific exclusions</p>
                {out.exclusions.map((e, i) => (
                  <div key={i} className="bg-phantom-black/40 border border-phantom-border-subtle rounded p-3">
                    <p className="font-body text-[13px] text-phantom-text-primary font-medium">{e.exclusion}</p>
                    <p className="font-body text-[12px] text-phantom-text-muted">{e.why}</p>
                  </div>
                ))}
              </div>
              {out.failure_modes_if_we_serve_them.length > 0 && (
                <div className="bg-phantom-warning/10 border border-phantom-warning/30 rounded p-3">
                  <p className="label text-phantom-warning mb-1">Failure modes if you serve them</p>
                  <ul className="space-y-1">
                    {out.failure_modes_if_we_serve_them.map((f, i) => (
                      <li key={i} className="font-body text-[13px] text-phantom-text-secondary">— {f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        />
      </div>

      {/* Section 4 — Testimonial structurer */}
      <div className="card mb-6">
        <p className="label mb-2">Structure a raw testimonial</p>
        <p className="font-body text-[14px] text-phantom-text-secondary mb-4">
          Paste a raw quote. The structurer breaks it into buyer-language fields, flags missing pieces, and saves it to your vault.
        </p>

        <textarea
          className="input min-h-[100px] mb-3"
          value={rawTestimonial}
          onChange={(e) => setRawTestimonial(e.target.value)}
          placeholder="Paste the testimonial here. SMS, email, DM — whatever you have."
        />
        <input
          className="input mb-4"
          value={testimonialSource}
          onChange={(e) => setTestimonialSource(e.target.value)}
          placeholder="Source (e.g. 'B2 — Slack DM, 2025-12-04')"
        />

        <GeneratorPanel
          title="Structure testimonial"
          description="Splits the raw quote into problem-language, outcome-language, measurable result, and missing pieces. Auto-saves to vault."
          disabled={rawTestimonial.trim().length < 20}
          disabledReason="Paste a testimonial above first."
          cta="Structure it"
          run={() =>
            structureTestimonial({
              raw_text: rawTestimonial,
              source_note: testimonialSource || undefined,
              project_id: projectId,
              save_to_vault: true,
            })
          }
          renderResult={(out) => (
            <div className="space-y-3">
              <div className="bg-phantom-black/40 border border-phantom-border-subtle rounded p-3">
                <p className="label text-phantom-lime mb-1">Pull quote</p>
                <p className="font-body text-[15px] text-phantom-text-primary italic leading-relaxed">"{out.pull_quote}"</p>
              </div>
              <div className="bg-phantom-black/40 border border-phantom-border-subtle rounded p-3">
                <p className="label text-phantom-lime mb-1">Buyer problem language</p>
                <p className="font-body text-[13px] text-phantom-text-secondary">{out.buyer_problem_language}</p>
              </div>
              <div className="bg-phantom-black/40 border border-phantom-border-subtle rounded p-3">
                <p className="label text-phantom-lime mb-1">Buyer outcome language</p>
                <p className="font-body text-[13px] text-phantom-text-secondary">{out.buyer_outcome_language}</p>
              </div>
              {out.measurable_result && (
                <div className="bg-phantom-lime/5 border border-phantom-lime/30 rounded p-3">
                  <p className="label text-phantom-lime mb-1">Measurable result</p>
                  <p className="font-body text-[13px] text-phantom-text-primary">{out.measurable_result}</p>
                </div>
              )}
              <div className={`rounded p-3 border ${
                out.permission_flag === 'granted'
                  ? 'bg-phantom-lime/5 border-phantom-lime/30'
                  : 'bg-phantom-warning/10 border-phantom-warning/30'
              }`}>
                <p className="font-body text-[12px]">
                  Permission to use: <span className={out.permission_flag === 'granted' ? 'text-phantom-lime' : 'text-phantom-warning'}>{out.permission_flag.replace(/_/g, ' ')}</span>
                </p>
              </div>
              {out.missing_pieces.length > 0 && (
                <div>
                  <p className="label text-phantom-warning mb-1">Missing pieces</p>
                  <ul className="space-y-1">
                    {out.missing_pieces.map((m, i) => (
                      <li key={i} className="font-body text-[12px] text-phantom-text-secondary">— {m}</li>
                    ))}
                  </ul>
                </div>
              )}
              {out.follow_up_questions.length > 0 && (
                <div>
                  <p className="label text-phantom-lime mb-1">Follow-up questions to ask the buyer</p>
                  <ul className="space-y-1">
                    {out.follow_up_questions.map((q, i) => (
                      <li key={i} className="font-body text-[12px] text-phantom-text-secondary">— {q}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="font-body text-[11px] text-phantom-text-muted">Saved to your proof vault.</p>
            </div>
          )}
        />
      </div>

      {/* Section 5 — Proof package curator */}
      <div className="card mb-6">
        <p className="label mb-2">Proof package</p>
        <p className="font-body text-[14px] text-phantom-text-secondary mb-4">
          Picks the strongest proof items a skeptical stranger would believe. Saved as your project's proof_package.
        </p>

        <p className="font-body text-[13px] text-phantom-text-muted mb-4">
          Currently in vault for this project: <span className="text-phantom-lime">{vaultItems.length}</span> items.
        </p>

        <GeneratorPanel
          title="Curate proof package"
          description="Selects the strongest 3+ proof pieces with skeptic scores and flags missing categories."
          requiredPlan="phantom_pro"
          disabled={vaultItems.length < 3}
          disabledReason="Add at least 3 vault items first."
          cta="Curate"
          run={() => curateProofPackage({ project_id: projectId })}
          renderResult={(out) => (
            <div className="space-y-3">
              <p className="font-body text-[14px] text-phantom-text-secondary">{out.recommendation}</p>
              <div className="space-y-2">
                {out.selected.map((s, i) => (
                  <div key={i} className="bg-phantom-black/40 border border-phantom-border-subtle rounded p-3">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <p className="font-body text-[12px] text-phantom-text-muted uppercase tracking-wider">{s.proof_type}</p>
                      <span className="font-code text-[12px] text-phantom-lime shrink-0">skeptic: {s.skeptic_score}/100</span>
                    </div>
                    <p className="font-body text-[13px] text-phantom-text-secondary">{s.why_it_belongs}</p>
                  </div>
                ))}
              </div>
              {out.missing_categories.length > 0 && (
                <div className="bg-phantom-warning/10 border border-phantom-warning/30 rounded p-3">
                  <p className="label text-phantom-warning mb-1">Missing categories</p>
                  <p className="font-body text-[13px] text-phantom-text-secondary">{out.missing_categories.join(', ')}</p>
                </div>
              )}
            </div>
          )}
        />
      </div>

      {/* Section 6 — Lock-in checklist */}
      <div className={`card mb-6 transition-colors duration-300 ${allChecked ? 'border-phantom-lime' : 'border-phantom-border'}`}>
        <p className="label text-phantom-lime mb-4">The lock-in checklist</p>

        <div className="space-y-3 mb-4">
          {[
            {
              label: `Offer converted across 5+ unrelated buyers (${conversionsCount} so far)`,
              done: fiveConversionsMet,
              note: 'Auto-tracked from your vault.',
            },
            {
              label: 'Positioning stated in one sentence',
              done: !!checklist.one_sentence_positioning,
              note: 'Set automatically when you save brand identity above.',
            },
            {
              label: `At least 3 pieces of credible proof (${vaultItems.length} so far)`,
              done: threeProofMet,
              note: 'Auto-tracked from your vault.',
            },
            {
              label: 'Objection list reduced to predictable patterns',
              done: !!checklist.objections_mapped,
              note: 'Set when you build the objection library in Phase 02.',
            },
            {
              label: 'Brand identity reflects validated positioning',
              done: !!checklist.brand_from_data,
              note: 'Set automatically when you pick a visual direction above.',
            },
            {
              label: 'You can describe who this is NOT for',
              done: !!checklist.not_for_defined,
              note: 'Set automatically when you fill in the not-for field above.',
            },
          ].map(({ label, done, note }) => (
            <div key={label} className="flex items-start gap-3">
              <div
                className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  done ? 'bg-phantom-lime border-phantom-lime' : 'border-phantom-border'
                }`}
              >
                {done && <span className="text-phantom-black text-[11px] font-bold">✓</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-body text-[14px] ${done ? 'text-phantom-text-primary' : 'text-phantom-text-muted'}`}>{label}</p>
                <p className="font-body text-[11px] text-phantom-text-muted">{note}</p>
              </div>
            </div>
          ))}
        </div>

        {completionError && (
          <div className="bg-phantom-danger/10 border border-phantom-danger/30 rounded p-3 mb-4 flex items-start gap-2">
            <AlertTriangle size={14} className="text-phantom-danger mt-0.5 shrink-0" />
            <p className="font-body text-[13px] text-phantom-danger">{completionError}</p>
          </div>
        )}

        {!readyToSurface && (
          <button className="btn-primary w-full" disabled={!allChecked || completing} onClick={handleCompletePhase}>
            {completing ? (
              <>
                <Loader size={14} className="animate-spin" /> Locking in...
              </>
            ) : (
              <>
                <Sparkles size={14} /> Mark phase 4 complete
              </>
            )}
          </button>
        )}
      </div>

      {/* Export */}
      {readyToSurface && (
        <div className="card mb-6 border-phantom-lime">
          <p className="label text-phantom-lime mb-2">Export brand lock-in guide</p>
          <p className="font-body text-[14px] text-phantom-text-secondary mb-4">
            A branded PDF: positioning, validated offer, proof package, brand identity, iteration history, objections map.
          </p>

          <button className="btn-primary" disabled={exporting} onClick={handleExport}>
            {exporting ? (
              <>
                <Loader size={14} className="animate-spin" /> Generating PDF...
              </>
            ) : (
              <>
                <Download size={14} /> Export PDF
              </>
            )}
          </button>

          <AnimatePresence>
            {exportError && (
              <motion.div
                className="mt-3 bg-phantom-danger/10 border border-phantom-danger/30 rounded p-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="font-body text-[13px] text-phantom-danger">{exportError}</p>
              </motion.div>
            )}
            {exportResult?.url && (
              <motion.div
                className="mt-3 bg-phantom-lime/5 border border-phantom-lime/30 rounded p-3 flex items-center justify-between"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="font-body text-[13px] text-phantom-text-primary">Your guide is ready.</p>
                <a
                  href={exportResult.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary text-[12px] py-1.5 px-3 flex items-center gap-2"
                >
                  Download <Download size={12} />
                </a>
              </motion.div>
            )}
            {exportResult?.html && (
              <motion.div
                className="mt-3 bg-phantom-warning/10 border border-phantom-warning/30 rounded p-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="font-body text-[13px] text-phantom-warning">
                  PDF rendering is unavailable on this environment. The guide was generated as HTML — check your activity log for the saved snapshot.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
})

PhaseLock.displayName = 'PhaseLock'
export default PhaseLock
