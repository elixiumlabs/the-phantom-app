import { memo, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Loader, AlertTriangle } from 'lucide-react'
import LiquidBackground from '@/components/LiquidBackground'
import { useAuth } from '@/contexts/AuthContext'
import { completeOnboarding, skipOnboarding } from '@/lib/functions'

type UserType = 'solo_founder' | 'creator' | 'coach_consultant' | 'agency' | 'other'
type BuiltInPublic = 'yes' | 'no' | 'currently'

const USER_TYPES: Array<{ value: UserType; label: string }> = [
  { value: 'solo_founder', label: 'Solo founder' },
  { value: 'creator', label: 'Content creator / digital product creator' },
  { value: 'coach_consultant', label: 'Coach or consultant' },
  { value: 'agency', label: 'Agency' },
  { value: 'other', label: 'Other' },
]

const BUILT_OPTIONS: Array<{ value: BuiltInPublic; label: string }> = [
  { value: 'yes', label: 'Yes, and it is behind me' },
  { value: 'currently', label: 'I am doing it right now' },
  { value: 'no', label: 'No, never' },
]

const OnboardingPage = memo(() => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [whatBuilding, setWhatBuilding] = useState('')
  const [userType, setUserType] = useState<UserType | null>(null)
  const [builtInPublic, setBuiltInPublic] = useState<BuiltInPublic | null>(null)
  const [historyNote, setHistoryNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingDestination, setPendingDestination] = useState<string | null>(null)

  // The server flips onboarding_completed via Firestore. RequireAuth reads
  // that flag and bounces back to /onboarding if it's still false at the
  // moment we navigate. So: once we've kicked off the call, wait for the
  // live AuthContext snapshot to show onboarding_completed=true *before*
  // routing into the gated app.
  useEffect(() => {
    if (pendingDestination && user?.onboardingCompleted) {
      navigate(pendingDestination, { replace: true })
    }
  }, [pendingDestination, user?.onboardingCompleted, navigate])

  const canProceed = (): boolean => {
    if (step === 1) return whatBuilding.trim().length >= 3
    if (step === 2) return userType !== null
    if (step === 3) return builtInPublic !== null
    return false
  }

  const submit = async () => {
    if (!whatBuilding || !userType || !builtInPublic) return
    setSubmitting(true)
    setError(null)
    try {
      const { project_id } = await completeOnboarding({
        what_building: whatBuilding.trim(),
        user_type: userType,
        built_in_public: builtInPublic,
        history_note: historyNote.trim() || undefined,
      })
      setPendingDestination(`/project/${project_id}/identify`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not finish onboarding.'
      // Idempotent recovery: if onboarding was already completed (e.g. from a
      // previous attempt), just send them to dashboard without showing an error
      if (/onboarding already completed/i.test(msg) || /already has a project/i.test(msg)) {
        setPendingDestination('/dashboard')
        return
      }
      setError(msg)
      setSubmitting(false)
    }
  }

  const next = () => {
    if (step < 3) setStep((s) => (s + 1) as 1 | 2 | 3)
    else void submit()
  }

  const back = () => {
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3)
    else navigate('/')
  }

  const skip = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await skipOnboarding({})
      setPendingDestination('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not skip onboarding.')
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-12">
      <LiquidBackground />

      <motion.div
        className="relative z-10 w-full max-w-[560px]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="flex items-center justify-between mb-6">
          <p className="label text-phantom-lime">
            Phantom setup — step {step} of 3
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => void skip()}
              disabled={submitting}
              className="font-body text-[12px] text-phantom-text-muted hover:text-phantom-text-secondary transition-colors disabled:opacity-50"
            >
              Skip for now
            </button>
            <p className="font-body text-[12px] text-phantom-text-muted">
              {user?.name}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-10">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded transition-all duration-300 ${
                s <= step ? 'bg-phantom-lime' : 'bg-phantom-border-subtle'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <h1 className="font-display font-bold text-[34px] text-phantom-text-primary leading-tight mb-3">
                What are you building?
              </h1>
              <p className="font-body text-[15px] text-phantom-text-secondary mb-6">
                One sentence is fine. We will refine it with you in Phase 01. The more specific you can be about who and what, the faster the test runs.
              </p>
              <textarea
                className="input h-32 resize-none"
                value={whatBuilding}
                onChange={(e) => setWhatBuilding(e.target.value)}
                placeholder="e.g. A short course that helps neurodivergent freelancers price their work without negotiating against themselves."
                maxLength={500}
                autoFocus
              />
              <p className="font-body text-[11px] text-phantom-text-muted mt-2">
                {whatBuilding.length} / 500
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <h1 className="font-display font-bold text-[34px] text-phantom-text-primary leading-tight mb-3">
                How would you describe yourself?
              </h1>
              <p className="font-body text-[15px] text-phantom-text-secondary mb-6">
                Pick the one closest to your situation. We use this to calibrate test parameters and outreach style.
              </p>
              <div className="space-y-2">
                {USER_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setUserType(t.value)}
                    className={`w-full text-left card hover:border-phantom-lime/40 transition-colors ${
                      userType === t.value
                        ? 'border-phantom-lime bg-phantom-lime/5'
                        : 'border-phantom-border-subtle'
                    }`}
                  >
                    <p className="font-body text-[15px] text-phantom-text-primary">{t.label}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <h1 className="font-display font-bold text-[34px] text-phantom-text-primary leading-tight mb-3">
                Have you tried building in public before?
              </h1>
              <p className="font-body text-[15px] text-phantom-text-secondary mb-6">
                Honest answer. We are not judging — we use this to set sensible defaults for how cautious to be.
              </p>
              <div className="space-y-2 mb-5">
                {BUILT_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setBuiltInPublic(o.value)}
                    className={`w-full text-left card hover:border-phantom-lime/40 transition-colors ${
                      builtInPublic === o.value
                        ? 'border-phantom-lime bg-phantom-lime/5'
                        : 'border-phantom-border-subtle'
                    }`}
                  >
                    <p className="font-body text-[15px] text-phantom-text-primary">{o.label}</p>
                  </button>
                ))}
              </div>

              {builtInPublic === 'yes' && (
                <div>
                  <label className="label text-phantom-text-secondary mb-2 block">
                    How did it go? (optional)
                  </label>
                  <textarea
                    className="input h-24 resize-none"
                    value={historyNote}
                    onChange={(e) => setHistoryNote(e.target.value)}
                    placeholder="A line or two is plenty."
                    maxLength={1000}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            className="mt-6 flex items-start gap-2 bg-phantom-danger/10 border border-phantom-danger/30 rounded-lg p-3"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertTriangle size={14} className="text-phantom-danger mt-0.5 shrink-0" />
            <p className="font-body text-[13px] text-phantom-danger">{error}</p>
          </motion.div>
        )}

        {/* Footer */}
        <div className="mt-8 flex items-center justify-between">
          <button
            className="btn-ghost flex items-center gap-2"
            onClick={back}
            disabled={submitting}
          >
            <ArrowLeft size={14} /> {step === 1 ? 'Exit' : 'Back'}
          </button>

          <button
            className="btn-primary flex items-center gap-2"
            onClick={next}
            disabled={!canProceed() || submitting}
          >
            {submitting ? (
              <>
                <Loader size={14} className="animate-spin" /> Creating your phantom...
              </>
            ) : step === 3 ? (
              <>Finish setup <ArrowRight size={14} /></>
            ) : (
              <>Continue <ArrowRight size={14} /></>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
})

OnboardingPage.displayName = 'OnboardingPage'
export default OnboardingPage
