import { memo, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Loader, Sparkles, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useProjects } from '@/contexts/ProjectContext'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  refineProblemStatement,
  extractUnfairAdvantages,
  synthesizePositioning,
  completePhase,
} from '@/lib/functions'

const PhaseIdentify = memo(() => {
  const { id } = useParams()
  const { currentProject, ghostIdentity } = useProjects()

  // Local form state
  const [problemDraft, setProblemDraft] = useState('')
  const [backgroundText, setBackgroundText] = useState('')
  const [selectedAdvantages, setSelectedAdvantages] = useState<string[]>([])
  const [workingName, setWorkingName] = useState('')
  const [selectedPositioning, setSelectedPositioning] = useState('')
  const [selectedVoice, setSelectedVoice] = useState<string[]>([])

  // AI loading states
  const [refiningProblem, setRefiningProblem] = useState(false)
  const [extractingAdvantages, setExtractingAdvantages] = useState(false)
  const [generatingPositioning, setGeneratingPositioning] = useState(false)
  const [completingPhase, setCompletingPhase] = useState(false)

  // Error states
  const [error, setError] = useState('')

  // Sync Firestore data to local state
  useEffect(() => {
    if (ghostIdentity) {
      setProblemDraft(ghostIdentity.problem_statement || '')
      setSelectedAdvantages(ghostIdentity.unfair_advantages || [])
      setWorkingName(ghostIdentity.working_name || '')
      setSelectedPositioning(ghostIdentity.positioning_statement || '')
      setSelectedVoice(ghostIdentity.voice_adjectives || [])
    }
  }, [ghostIdentity])

  if (!currentProject || !ghostIdentity) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="animate-spin text-phantom-lime" size={24} />
      </div>
    )
  }

  const projectRef = doc(db, 'projects', id!, 'ghost_identity', 'main')

  // ========================================
  // AI GENERATORS
  // ========================================

  const handleRefineProblem = async () => {
    if (!problemDraft.trim()) {
      setError('Write a draft problem statement first')
      return
    }
    setRefiningProblem(true)
    setError('')
    try {
      await refineProblemStatement({ draft: problemDraft, project_id: id })
      // AI options are auto-saved to Firestore by backend
      setRefiningProblem(false)
    } catch (err) {
      setError((err as Error).message)
      setRefiningProblem(false)
    }
  }

  const handleExtractAdvantages = async () => {
    if (!backgroundText.trim()) {
      setError('Describe your background first')
      return
    }
    setExtractingAdvantages(true)
    setError('')
    try {
      await extractUnfairAdvantages({
        background: backgroundText,
        problemStatement: problemDraft,
        project_id: id,
      })
      setExtractingAdvantages(false)
    } catch (err) {
      setError((err as Error).message)
      setExtractingAdvantages(false)
    }
  }

  const handleGeneratePositioning = async () => {
    if (selectedAdvantages.length < 3) {
      setError('Select at least 3 unfair advantages first')
      return
    }
    if (!problemDraft.trim()) {
      setError('Complete the problem statement first')
      return
    }
    setGeneratingPositioning(true)
    setError('')
    try {
      await synthesizePositioning({
        problemStatement: problemDraft,
        unfairAdvantages: selectedAdvantages,
        project_id: id,
      })
      setGeneratingPositioning(false)
    } catch (err) {
      setError((err as Error).message)
      setGeneratingPositioning(false)
    }
  }

  // ========================================
  // SAVE SELECTIONS
  // ========================================

  const saveProblemStatement = async (statement: string) => {
    await updateDoc(projectRef, {
      problem_statement: statement,
      'checklist.problem_written': true,
      updated_at: new Date().toISOString(),
    })
  }

  const saveAdvantages = async (advantages: string[]) => {
    await updateDoc(projectRef, {
      unfair_advantages: advantages,
      'checklist.advantages_mapped': advantages.length >= 3,
      updated_at: new Date().toISOString(),
    })
    setSelectedAdvantages(advantages)
  }

  const savePositioning = async (positioning: string, name: string, voice: string[]) => {
    await updateDoc(projectRef, {
      positioning_statement: positioning,
      working_name: name,
      voice_adjectives: voice,
      'checklist.positioning_written': !!positioning,
      'checklist.voice_defined': voice.length > 0,
      updated_at: new Date().toISOString(),
    })
  }

  // ========================================
  // COMPLETE PHASE
  // ========================================

  const handleCompletePhase = async () => {
    setCompletingPhase(true)
    setError('')
    try {
      await completePhase({ project_id: id!, phase: 1 })
      // Phase completion triggers backend to advance current_phase
    } catch (err) {
      setError((err as Error).message)
      setCompletingPhase(false)
    }
  }

  // ========================================
  // CHECKLIST
  // ========================================

  const checklist = ghostIdentity.checklist || {}
  const allComplete =
    checklist.problem_written &&
    checklist.advantages_mapped &&
    checklist.positioning_written &&
    checklist.voice_defined

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
          Nothing is locked in yet. You are building a working hypothesis, not a brand.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="card bg-phantom-danger/10 border-phantom-danger/30 mb-6">
          <p className="font-body text-[14px] text-phantom-danger">{error}</p>
        </div>
      )}

      {/* Section 1 — Problem Statement */}
      <div className="card mb-6">
        <p className="label mb-4">Problem Statement</p>
        <p className="font-body text-[14px] text-phantom-text-secondary mb-4">
          Write a draft problem statement. The AI will refine it into 3 options.
        </p>

        <textarea
          className="input min-h-[120px] mb-4"
          value={problemDraft}
          onChange={(e) => setProblemDraft(e.target.value)}
          placeholder="I help [specific type of person] who is experiencing [specific problem] to achieve [specific outcome] without [what they want to avoid]..."
        />

        <button
          className="btn-primary mb-4"
          onClick={handleRefineProblem}
          disabled={refiningProblem || !problemDraft.trim()}
        >
          {refiningProblem ? (
            <>
              <Loader size={14} className="animate-spin" /> Refining with AI...
            </>
          ) : (
            <>
              <Sparkles size={14} /> Refine problem statement
            </>
          )}
        </button>

        {/* AI-generated options */}
        {ghostIdentity.ai_problem_options && ghostIdentity.ai_problem_options.length > 0 && (
          <div className="space-y-3 mt-5 pt-5 border-t border-phantom-border-subtle">
            <p className="label text-phantom-lime mb-3">AI-Refined Options</p>
            {ghostIdentity.ai_problem_options.map((option, i) => (
              <label
                key={i}
                className="flex items-start gap-3 p-4 rounded border border-phantom-border hover:border-phantom-lime/40 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name="problem"
                  checked={problemDraft === option.statement}
                  onChange={() => {
                    setProblemDraft(option.statement)
                    saveProblemStatement(option.statement)
                  }}
                  className="mt-1 w-4 h-4"
                />
                <div className="flex-1">
                  <p className="font-body text-[14px] text-phantom-text-primary mb-1">
                    {option.statement}
                  </p>
                  <p className="font-body text-[12px] text-phantom-text-muted">
                    Tightened: {option.tightened} — {option.note}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Section 2 — Unfair Advantages */}
      <div className="card mb-6">
        <p className="label mb-4">Unfair Advantages</p>
        <p className="font-body text-[14px] text-phantom-text-secondary mb-4">
          Describe your background, experience, what you've built, survived, or have access to.
        </p>

        <textarea
          className="input min-h-[120px] mb-4"
          value={backgroundText}
          onChange={(e) => setBackgroundText(e.target.value)}
          placeholder="I've spent 5 years as a [role] at [company]. I built [thing] that got [result]. I survived [challenge]..."
        />

        <button
          className="btn-primary mb-4"
          onClick={handleExtractAdvantages}
          disabled={extractingAdvantages || !backgroundText.trim()}
        >
          {extractingAdvantages ? (
            <>
              <Loader size={14} className="animate-spin" /> Extracting advantages...
            </>
          ) : (
            <>
              <Sparkles size={14} /> Extract unfair advantages
            </>
          )}
        </button>

        {/* AI-extracted advantages */}
        {ghostIdentity.ai_advantage_options && ghostIdentity.ai_advantage_options.length > 0 && (
          <div className="space-y-3 mt-5 pt-5 border-t border-phantom-border-subtle">
            <p className="label text-phantom-lime mb-3">
              AI-Extracted Advantages (select at least 3)
            </p>
            {ghostIdentity.ai_advantage_options.map((adv, i) => (
              <label
                key={i}
                className="flex items-start gap-3 p-4 rounded border border-phantom-border hover:border-phantom-lime/40 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedAdvantages.includes(adv.advantage)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...selectedAdvantages, adv.advantage]
                      : selectedAdvantages.filter((a) => a !== adv.advantage)
                    saveAdvantages(next)
                  }}
                  className="mt-1 w-4 h-4"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-body text-[14px] text-phantom-text-primary">
                      {adv.advantage}
                    </p>
                    <span className="badge text-[9px]">{adv.type}</span>
                    <span className="font-code text-[11px] text-phantom-lime">
                      {adv.credibilityScore}/100
                    </span>
                  </div>
                  <p className="font-body text-[12px] text-phantom-text-muted">
                    {adv.reasoning}
                  </p>
                </div>
              </label>
            ))}

            {ghostIdentity.ai_rejected_claims && ghostIdentity.ai_rejected_claims.length > 0 && (
              <details className="mt-4">
                <summary className="font-body text-[12px] text-phantom-text-muted cursor-pointer">
                  Rejected claims ({ghostIdentity.ai_rejected_claims.length})
                </summary>
                <div className="space-y-2 mt-3">
                  {ghostIdentity.ai_rejected_claims.map((claim, i) => (
                    <div key={i} className="p-3 bg-[#0d0d0d] rounded border border-phantom-border-subtle">
                      <p className="font-body text-[13px] text-phantom-text-muted line-through mb-1">
                        {claim.claim}
                      </p>
                      <p className="font-body text-[11px] text-phantom-text-muted">
                        {claim.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </div>

      {/* Section 3 — Positioning & Voice */}
      <div className="card mb-6">
        <p className="label mb-4">Positioning & Voice</p>
        <p className="font-body text-[14px] text-phantom-text-secondary mb-4">
          Generate positioning options, working names, and voice adjectives from your problem + advantages.
        </p>

        <button
          className="btn-primary mb-4"
          onClick={handleGeneratePositioning}
          disabled={generatingPositioning || selectedAdvantages.length < 3}
        >
          {generatingPositioning ? (
            <>
              <Loader size={14} className="animate-spin" /> Generating positioning...
            </>
          ) : (
            <>
              <Sparkles size={14} /> Generate positioning options
            </>
          )}
        </button>

        {/* AI-generated positioning */}
        {ghostIdentity.ai_positioning_options && ghostIdentity.ai_positioning_options.length > 0 && (
          <div className="space-y-6 mt-5 pt-5 border-t border-phantom-border-subtle">
            {/* Positioning sentences */}
            <div>
              <p className="label text-phantom-lime mb-3">Positioning Options</p>
              <div className="space-y-2">
                {ghostIdentity.ai_positioning_options.map((opt, i) => (
                  <label
                    key={i}
                    className="flex items-start gap-3 p-3 rounded border border-phantom-border hover:border-phantom-lime/40 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name="positioning"
                      checked={selectedPositioning === opt.sentence}
                      onChange={() => setSelectedPositioning(opt.sentence)}
                      className="mt-1 w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-body text-[14px] text-phantom-text-primary mb-1">
                        {opt.sentence}
                      </p>
                      <p className="font-body text-[11px] text-phantom-text-muted">
                        {opt.angle} — {opt.reasoning}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Working names */}
            {ghostIdentity.ai_working_names && ghostIdentity.ai_working_names.length > 0 && (
              <div>
                <p className="label text-phantom-lime mb-3">Working Name Suggestions</p>
                <div className="space-y-2">
                  {ghostIdentity.ai_working_names.map((name, i) => (
                    <label
                      key={i}
                      className="flex items-start gap-3 p-3 rounded border border-phantom-border hover:border-phantom-lime/40 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="working_name"
                        checked={workingName === name.name}
                        onChange={() => setWorkingName(name.name)}
                        className="mt-1 w-4 h-4"
                      />
                      <div className="flex-1">
                        <p className="font-body text-[14px] text-phantom-text-primary mb-1">
                          {name.name}
                        </p>
                        <p className="font-body text-[11px] text-phantom-text-muted">
                          {name.rationale}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Voice triples */}
            {ghostIdentity.ai_voice_triples && ghostIdentity.ai_voice_triples.length > 0 && (
              <div>
                <p className="label text-phantom-lime mb-3">Voice Adjective Triples</p>
                <div className="space-y-2">
                  {ghostIdentity.ai_voice_triples.map((triple, i) => (
                    <label
                      key={i}
                      className="flex items-start gap-3 p-3 rounded border border-phantom-border hover:border-phantom-lime/40 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="voice"
                        checked={
                          selectedVoice.length === 3 &&
                          selectedVoice.every((v, idx) => v === triple.adjectives[idx])
                        }
                        onChange={() => setSelectedVoice(triple.adjectives)}
                        className="mt-1 w-4 h-4"
                      />
                      <div className="flex-1">
                        <p className="font-body text-[14px] text-phantom-text-primary mb-1">
                          {triple.adjectives.join(' · ')}
                        </p>
                        <p className="font-body text-[11px] text-phantom-text-muted">
                          {triple.whyItFits}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              className="btn-secondary w-full"
              onClick={() => savePositioning(selectedPositioning, workingName, selectedVoice)}
              disabled={!selectedPositioning || !workingName || selectedVoice.length === 0}
            >
              Save positioning selections
            </button>
          </div>
        )}
      </div>

      {/* Completion Gate */}
      <div
        className={`card ${
          allComplete ? 'border-phantom-lime' : 'border-phantom-border'
        } transition-colors duration-300`}
      >
        <p className="label text-phantom-lime mb-4">Phase 1 Completion</p>

        <div className="space-y-3 mb-6">
          {[
            { label: 'Problem statement written', done: checklist.problem_written },
            { label: 'Minimum 3 unfair advantages selected', done: checklist.advantages_mapped },
            { label: 'Positioning statement selected', done: checklist.positioning_written },
            { label: 'Voice adjectives selected', done: checklist.voice_defined },
          ].map(({ label, done }) => (
            <div key={label} className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  done ? 'bg-phantom-lime border-phantom-lime' : 'border-phantom-border'
                }`}
              >
                {done && <CheckCircle size={14} className="text-phantom-black" />}
              </div>
              <span
                className={`font-body text-[14px] ${
                  done ? 'text-phantom-text-primary' : 'text-phantom-text-muted'
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {!allComplete && (
          <p className="font-body text-[13px] text-phantom-text-muted mb-4">
            Complete all required items to advance.
          </p>
        )}

        <button
          className="btn-primary w-full"
          disabled={!allComplete || completingPhase}
          onClick={handleCompletePhase}
        >
          {completingPhase ? (
            <>
              <Loader size={14} className="animate-spin" /> Completing phase...
            </>
          ) : (
            'Phase 1 complete. Proceed to Silent Test →'
          )}
        </button>
      </div>
    </motion.div>
  )
})

PhaseIdentify.displayName = 'PhaseIdentify'
export default PhaseIdentify
