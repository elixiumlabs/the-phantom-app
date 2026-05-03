import { memo, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader, Sparkles, CheckCircle, Upload, Linkedin } from 'lucide-react'
import { motion } from 'framer-motion'
import { useProjects } from '@/contexts/ProjectContext'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  refineProblemStatement,
  extractUnfairAdvantages,
  synthesizePositioning,
  extractAudienceLanguage,
  findWhereToTest,
  completePhase,
} from '@/lib/functions'
import GeneratorPanel from '@/components/app/GeneratorPanel'
import { ProtectedContent } from '@/components/ui/ProtectedContent'
import { useProtection } from '@/hooks'

const PhaseIdentify = memo(() => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentProject, ghostIdentity } = useProjects()

  // Enable protection for AI-generated content
  useProtection({ disableRightClick: true, monitorCopy: true })

  // Local form state
  const [problemDraft, setProblemDraft] = useState('')
  const [audienceDescription, setAudienceDescription] = useState('')
  const [backgroundText, setBackgroundText] = useState('')
  const [selectedAdvantages, setSelectedAdvantages] = useState<string[]>([])
  const [workingName, setWorkingName] = useState('')
  const [selectedPositioning, setSelectedPositioning] = useState('')
  const [selectedVoice, setSelectedVoice] = useState<string[]>([])
  const [antiCustomers, setAntiCustomers] = useState<string[]>([])

  // AI loading states
  const [refiningProblem, setRefiningProblem] = useState(false)
  const [extractingAdvantages, setExtractingAdvantages] = useState(false)
  const [generatingPositioning, setGeneratingPositioning] = useState(false)
  const [completingPhase, setCompletingPhase] = useState(false)
  const [uploadingResume, setUploadingResume] = useState(false)

  // Error states
  const [error, setError] = useState('')
  
  // Resume state
  const [resumeFile, setResumeFile] = useState<File | null>(null)

  // Sync Firestore data to local state
  useEffect(() => {
    if (ghostIdentity) {
      setProblemDraft(ghostIdentity.problem_statement || '')
      setSelectedAdvantages(ghostIdentity.unfair_advantages || [])
      setWorkingName(ghostIdentity.working_name || '')
      setSelectedPositioning(ghostIdentity.positioning_statement || '')
      setSelectedVoice(ghostIdentity.voice_adjectives || [])
      setAntiCustomers(ghostIdentity.anti_customers || [])
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
    } catch (err: any) {
      console.error('refineProblemStatement error:', err)
      const message = err?.message || err?.code || 'Failed to refine problem statement'
      setError(message)
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
    // Show success feedback
    alert('Positioning selections saved successfully!')
  }

  const saveAntiCustomers = async (customers: string[]) => {
    await updateDoc(projectRef, {
      anti_customers: customers,
      'checklist.anti_customers_defined': customers.length >= 2,
      updated_at: new Date().toISOString(),
    })
    setAntiCustomers(customers)
  }

  // ========================================
  // COMPLETE PHASE
  // ========================================

  const handleCompletePhase = async () => {
    setCompletingPhase(true)
    setError('')
    try {
      await completePhase({ project_id: id!, phase: 1 })
      // Navigate to Phase 2
      navigate(`/project/${id}/test`)
    } catch (err) {
      console.error('Complete phase error:', err)
      const message = err instanceof Error ? err.message : 'Failed to complete phase'
      setError(message)
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
    checklist.voice_defined &&
    checklist.anti_customers_defined

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
          <ProtectedContent watermark disableSelect className="space-y-3 mt-5 pt-5 border-t border-phantom-border-subtle">
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
          </ProtectedContent>
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

        {/* Optional: LinkedIn or Resume */}
        <div className="mb-4 p-4 bg-phantom-black/20 border border-phantom-border-subtle rounded">
          <p className="label text-phantom-text-secondary mb-3">
            <span className="text-phantom-text-muted text-[11px] uppercase tracking-wide">Optional</span> — Add more context
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* LinkedIn URL */}
            <div>
              <label className="flex items-center gap-2 font-body text-[13px] text-phantom-text-secondary mb-2">
                <Linkedin size={14} className="text-phantom-lime" />
                LinkedIn Profile
              </label>
              <input
                type="url"
                className="input text-[13px]"
                placeholder="linkedin.com/in/yourprofile"
                onChange={(e) => {
                  const url = e.target.value.trim()
                  if (url && url.includes('linkedin.com')) {
                    setBackgroundText(prev => {
                      // Remove previous LinkedIn URL if exists
                      const withoutLinkedIn = prev.replace(/LinkedIn:.*?(?=\n\n|$)/gs, '').trim()
                      return withoutLinkedIn + (withoutLinkedIn ? '\n\n' : '') + `LinkedIn: ${url}`
                    })
                  }
                }}
              />
            </div>

            {/* Resume Upload */}
            <div>
              <label className="flex items-center gap-2 font-body text-[13px] text-phantom-text-secondary mb-2">
                <Upload size={14} className="text-phantom-lime" />
                Resume / CV
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".txt,.doc,.docx"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    
                    setResumeFile(file)
                    setUploadingResume(true)
                    
                    try {
                      const text = await file.text()
                      setBackgroundText(prev => {
                        // Remove previous resume content if exists
                        const withoutResume = prev.replace(/Resume content:[\s\S]*?(?=\n\nLinkedIn:|$)/g, '').trim()
                        return withoutResume + (withoutResume ? '\n\n' : '') + `Resume content:\n${text.slice(0, 3000)}`
                      })
                      setError('')
                    } catch (err) {
                      setError('Failed to read file. Please use .txt format or paste your resume content directly in the text area above.')
                    } finally {
                      setUploadingResume(false)
                    }
                  }}
                />
                <div className="input text-[13px] flex items-center justify-between pointer-events-none">
                  <span className={resumeFile ? 'text-phantom-text-primary' : 'text-phantom-text-muted'}>
                    {resumeFile ? resumeFile.name : 'Choose file...'}
                  </span>
                  {resumeFile && <span className="text-phantom-lime text-[11px]">✓</span>}
                </div>
              </div>
              <p className="font-body text-[10px] text-phantom-text-muted mt-1">
                .txt format works best. For PDF, copy/paste content above.
              </p>
            </div>
          </div>
          
          <p className="font-body text-[11px] text-phantom-text-muted mt-3">
            Adding LinkedIn or resume helps extract more specific advantages from your full work history.
          </p>
        </div>

        <button
          className="btn-primary mb-4"
          onClick={handleExtractAdvantages}
          disabled={extractingAdvantages || uploadingResume || !backgroundText.trim()}
        >
          {extractingAdvantages ? (
            <>
              <Loader size={14} className="animate-spin" /> Extracting advantages...
            </>
          ) : uploadingResume ? (
            <>
              <Loader size={14} className="animate-spin" /> Processing resume...
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

      {/* Section 4 — Anti-Customer Definition */}
      <div className="card mb-6">
        <p className="label mb-4">Anti-Customer Definition</p>
        <p className="font-body text-[14px] text-phantom-text-secondary mb-4">
          Name who this is NOT for. The fastest way to sharpen positioning is to say no before you say yes. Define at least 2 types of people you will refuse to serve.
        </p>

        <div className="space-y-3 mb-4">
          {antiCustomers.map((customer, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded border border-phantom-border bg-phantom-black/20">
              <div className="flex-1">
                <p className="font-body text-[14px] text-phantom-text-primary">{customer}</p>
              </div>
              <button
                onClick={() => saveAntiCustomers(antiCustomers.filter((_, idx) => idx !== i))}
                className="text-phantom-text-muted hover:text-phantom-danger transition-colors text-[12px]"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="e.g. People who want done-for-you solutions without doing any work"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                const newCustomer = e.currentTarget.value.trim()
                saveAntiCustomers([...antiCustomers, newCustomer])
                e.currentTarget.value = ''
              }
            }}
          />
          <button
            className="btn-secondary"
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement
              if (input.value.trim()) {
                const newCustomer = input.value.trim()
                saveAntiCustomers([...antiCustomers, newCustomer])
                input.value = ''
              }
            }}
          >
            Add
          </button>
        </div>

        <div className="mt-4 p-3 bg-phantom-black/40 border border-phantom-border-subtle rounded">
          <p className="font-body text-[12px] text-phantom-text-secondary mb-2">Examples of anti-customers:</p>
          <ul className="space-y-1">
            <li className="font-body text-[11px] text-phantom-text-muted">• People who need hand-holding through every step</li>
            <li className="font-body text-[11px] text-phantom-text-muted">• Businesses with less than $10k/month revenue</li>
            <li className="font-body text-[11px] text-phantom-text-muted">• Anyone looking for a quick fix or magic bullet</li>
            <li className="font-body text-[11px] text-phantom-text-muted">• Teams that aren't willing to change their process</li>
          </ul>
        </div>

        {antiCustomers.length >= 2 && (
          <div className="mt-4 p-3 bg-phantom-lime/10 border border-phantom-lime/30 rounded flex items-start gap-2">
            <CheckCircle className="text-phantom-lime shrink-0 mt-0.5" size={16} />
            <p className="font-body text-[13px] text-phantom-lime">
              Anti-customers defined. Your positioning is now sharper.
            </p>
          </div>
        )}
      </div>

      {/* Section 5 — Audience Language (PRO) */}
      <div className="card mb-6">
        <p className="label mb-2">Step 4 — Audience Language</p>
        <p className="font-body text-[14px] text-phantom-text-secondary mb-4">
          Pull the verbatim phrases this audience uses about their problem, so your outreach lands in their words, not yours.
        </p>

        <label className="label text-phantom-text-secondary mb-2 block">
          Describe the audience (one sentence)
        </label>
        <input
          className="input mb-4"
          value={audienceDescription}
          onChange={(e) => setAudienceDescription(e.target.value)}
          placeholder="e.g. neurodivergent freelancers in their late 20s who run their own service businesses"
        />

        <GeneratorPanel
          title="Extract audience language"
          description="Returns the literal words this audience uses — phrases, emotional descriptors, jargon to avoid, and 4-6 plausible quotes."
          requiredPlan="phantom_pro"
          disabled={!problemDraft.trim() || audienceDescription.trim().length < 5}
          disabledReason="Add a problem statement and a one-line audience description first."
          cta="Extract verbatim language"
          run={() =>
            extractAudienceLanguage({
              problemStatement: problemDraft,
              audienceDescription,
              project_id: id,
            })
          }
          renderResult={(out) => {
            // Debug: log the actual response
            console.log('Audience language response:', out)
            
            // Safely handle the response - check if data is nested in 'output'
            const data = (out as any).output || out
            
            if (!data) return <p className="font-body text-[13px] text-phantom-text-muted">No results returned.</p>
            
            // Try multiple possible field name variations
            const problemPhrases = data.problemPhrases || data.problem_phrases || []
            const emotionalDescriptors = data.emotionalDescriptors || data.emotional_descriptors || []
            const jargonToAvoid = data.jargonToAvoid || data.jargon_to_avoid || []
            const examples = data.examples || []
            const failedAttemptPhrases = data.failedAttemptPhrases || data.failed_attempt_phrases || []
            const outcomePhrases = data.outcomePhrases || data.outcome_phrases || []
            
            // Check if we have any data at all
            const hasData = problemPhrases.length > 0 || emotionalDescriptors.length > 0 || 
                           jargonToAvoid.length > 0 || examples.length > 0 ||
                           failedAttemptPhrases.length > 0 || outcomePhrases.length > 0
            
            if (!hasData) {
              return (
                <div className="space-y-3">
                  <div className="bg-phantom-warning/10 border border-phantom-warning/30 rounded p-3">
                    <p className="font-body text-[13px] text-phantom-warning">
                      No audience language data was generated. The AI may need more context.
                    </p>
                  </div>
                  <details className="bg-phantom-black/40 border border-phantom-border-subtle rounded p-3">
                    <summary className="font-body text-[12px] text-phantom-text-secondary cursor-pointer">
                      Debug: View raw response
                    </summary>
                    <pre className="font-code text-[10px] text-phantom-text-muted mt-2 overflow-auto">
                      {JSON.stringify(out, null, 2)}
                    </pre>
                  </details>
                </div>
              )
            }
            
            return (
            <div className="space-y-4">
              {problemPhrases.length > 0 && (
              <div>
                <p className="label text-phantom-lime mb-2">Problem phrases</p>
                <div className="flex flex-wrap gap-2">
                  {problemPhrases.map((p: string, i: number) => (
                    <span key={i} className="badge text-[12px] px-2 py-1 bg-phantom-black/40 border border-phantom-border-subtle rounded">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              )}
              {emotionalDescriptors.length > 0 && (
              <div>
                <p className="label text-phantom-lime mb-2">Emotional descriptors</p>
                <div className="flex flex-wrap gap-2">
                  {emotionalDescriptors.map((p: string, i: number) => (
                    <span key={i} className="badge text-[12px] px-2 py-1 bg-phantom-black/40 border border-phantom-border-subtle rounded">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              )}
              {failedAttemptPhrases.length > 0 && (
              <div>
                <p className="label text-phantom-lime mb-2">Failed attempt phrases</p>
                <div className="flex flex-wrap gap-2">
                  {failedAttemptPhrases.map((p: string, i: number) => (
                    <span key={i} className="badge text-[12px] px-2 py-1 bg-phantom-black/40 border border-phantom-border-subtle rounded">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              )}
              {outcomePhrases.length > 0 && (
              <div>
                <p className="label text-phantom-lime mb-2">Outcome phrases</p>
                <div className="flex flex-wrap gap-2">
                  {outcomePhrases.map((p: string, i: number) => (
                    <span key={i} className="badge text-[12px] px-2 py-1 bg-phantom-black/40 border border-phantom-border-subtle rounded">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              )}
              {jargonToAvoid.length > 0 && (
              <div>
                <p className="label text-phantom-lime mb-2">Jargon to avoid</p>
                <div className="flex flex-wrap gap-2">
                  {jargonToAvoid.map((p: string, i: number) => (
                    <span key={i} className="badge text-[12px] px-2 py-1 bg-phantom-danger/10 border border-phantom-danger/30 rounded text-phantom-danger">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              )}
              {examples.length > 0 && (
              <div>
                <p className="label text-phantom-lime mb-2">Verbatim examples</p>
                <div className="space-y-2">
                  {examples.map((ex: any, i: number) => (
                    <div key={i} className="bg-phantom-black/40 border border-phantom-border-subtle rounded p-3">
                      <p className="font-body text-[13px] text-phantom-text-primary mb-1">"{ex.verbatim}"</p>
                      <p className="font-body text-[11px] text-phantom-text-muted">{ex.whereSaid}</p>
                    </div>
                  ))}
                </div>
              </div>
              )}
              <p className="font-body text-[11px] text-phantom-text-muted">
                Saved to your project. You'll see these again in Phase 02 when you write outreach.
              </p>
            </div>
            )
          }}
        />
      </div>

      {/* Section 6 — Where To Test */}
      <div className="card mb-6">
        <p className="label mb-2">Step 5 — Where To Test</p>
        <p className="font-body text-[14px] text-phantom-text-secondary mb-4">
          Find the specific places this audience already gathers — subreddits, Discord servers, FB groups, niche forums. This list carries into Phase 02.
        </p>

        <GeneratorPanel
          title="Find where to test"
          description="Returns 8+ specific named communities with priority scores, plus 5-10 search queries you can paste into Google."
          disabled={!problemDraft.trim() || audienceDescription.trim().length < 5}
          disabledReason="Add a problem statement and a one-line audience description above."
          cta="Find communities"
          run={() =>
            findWhereToTest({
              problemStatement: problemDraft,
              audienceDescription,
              project_id: id,
            })
          }
          renderResult={(out) => {
            // Handle nested output structure
            const data = (out as any).output || out
            
            if (!data || !data.locations) {
              return (
                <div className="bg-phantom-warning/10 border border-phantom-warning/30 rounded p-3">
                  <p className="font-body text-[13px] text-phantom-warning">
                    No communities found. Try adjusting your problem statement or audience description.
                  </p>
                </div>
              )
            }
            
            const locations = data.locations || []
            const searchQueries = data.searchQueries || data.search_queries || []
            
            return (
            <div className="space-y-4">
              {locations.length > 0 && (
              <div>
                <p className="label text-phantom-lime mb-2">Top communities</p>
                <div className="space-y-2">
                  {locations.map((loc: any, i: number) => (
                    <div key={i} className="bg-phantom-black/40 border border-phantom-border-subtle rounded p-3">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div>
                          <p className="font-body text-[14px] text-phantom-text-primary font-medium">{loc.name}</p>
                          <p className="font-body text-[11px] text-phantom-text-muted uppercase tracking-wide">
                            {loc.channel.replace(/_/g, ' ')} · {loc.accessDifficulty} access
                          </p>
                        </div>
                        <span className="font-code text-[12px] text-phantom-lime shrink-0">{loc.priorityScore}/100</span>
                      </div>
                      <p className="font-body text-[12px] text-phantom-text-secondary mb-2">{loc.whyAudienceIsHere}</p>
                      <p className="font-body text-[11px] text-phantom-text-muted">
                        Outreach style: {loc.outreachStyle}
                      </p>
                      {loc.url && (
                        <a
                          href={loc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-body text-[11px] text-phantom-lime hover:underline"
                        >
                          {loc.url}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              )}
              {searchQueries.length > 0 && (
              <div>
                <p className="label text-phantom-lime mb-2">Search queries to find more</p>
                <div className="space-y-1">
                  {searchQueries.map((q: string, i: number) => (
                    <div key={i} className="bg-phantom-black/40 border border-phantom-border-subtle rounded px-3 py-2">
                      <p className="font-code text-[12px] text-phantom-text-secondary">{q}</p>
                    </div>
                  ))}
                </div>
              </div>
              )}
              <p className="font-body text-[11px] text-phantom-text-muted">
                Saved. These appear in Phase 02 as your test locations.
              </p>
            </div>
            )
          }}
        />
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
            { label: 'At least 2 anti-customers defined', done: checklist.anti_customers_defined },
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
