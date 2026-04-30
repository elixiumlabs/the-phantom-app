import { memo, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import LiquidBackground from '@/components/LiquidBackground'

interface AuthPageProps { mode: 'login' | 'signup' }

const TESTIMONIALS = [
  {
    quote: 'Launched my first offer to crickets three times. The phantom phase gave me five paying clients before I posted a single thing publicly.',
    attr: 'M.K., Digital Strategist',
  },
  {
    quote: 'I used to redesign my logo every time something didn\'t convert. Now I know it was never the logo.',
    attr: 'T.O., Course Creator',
  },
  {
    quote: 'The lock-in checklist alone saved me from a $4,000 launch that had no validated demand behind it.',
    attr: 'A.R., Consultant',
  },
]

const RotatingTestimonial = memo(() => {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % TESTIMONIALS.length), 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="mt-12 max-w-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <p className="font-body text-[14px] text-phantom-text-secondary leading-relaxed mb-3">
            "{TESTIMONIALS[index].quote}"
          </p>
          <p className="font-ui text-[11px] text-phantom-text-muted uppercase tracking-wider">
            — {TESTIMONIALS[index].attr}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Dot indicators */}
      <div className="flex gap-1.5 mt-5">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className="transition-all duration-300"
            style={{
              width: i === index ? 16 : 6,
              height: 4,
              borderRadius: 2,
              background: i === index ? '#89F336' : '#333',
            }}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
})
RotatingTestimonial.displayName = 'RotatingTestimonial'

const AuthPage = memo(({ mode }: AuthPageProps) => {
  const { login, loginWithGoogle, signup } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        if (!name.trim()) { setError('Name is required.'); setLoading(false); return }
        await signup(name.trim(), email.trim(), password)
        // RequireAuth will route to /onboarding if onboarding_completed is false.
        navigate('/dashboard', { replace: true })
      } else {
        await login(email.trim(), password)
        // RequireAuth will route to /onboarding if onboarding_completed is false.
        navigate('/dashboard', { replace: true })
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex overflow-hidden">
      <LiquidBackground />

      {/* Left panel */}
      <motion.div
        className="hidden lg:flex flex-col justify-center px-16 w-1/2 relative z-10 border-r border-phantom-border-subtle"
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Link to="/" className="flex items-center gap-2 no-underline mb-10">
          <div className="w-4 h-4 bg-phantom-lime" />
          <span className="font-display font-bold text-[18px] text-phantom-text-primary">PHANTOM</span>
        </Link>

        <h1 className="font-display font-bold text-[42px] text-phantom-text-primary leading-tight mb-4">
          Build invisible.<br />
          Launch inevitable.
        </h1>
        <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed max-w-md">
          Four phases of silent brand validation before anyone knows you exist.
        </p>

        <RotatingTestimonial />
      </motion.div>

      {/* Right panel */}
      <motion.div
        className="flex-1 flex items-center justify-center px-6 relative z-10"
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
      >
        <div className="w-full max-w-[400px]">
          <div className="card mb-5">
            <p className="label text-phantom-lime mb-6">
              {mode === 'signup' ? 'Create your phantom account' : 'Welcome back'}
            </p>

            <form onSubmit={submit} className="flex flex-col gap-4">
              {mode === 'signup' && (
                <div>
                  <label className="label text-phantom-text-secondary mb-2 block">Full name</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
              )}

              <div>
                <label className="label text-phantom-text-secondary mb-2 block">Email</label>
                <input
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label text-phantom-text-secondary">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      className="font-body text-[12px] text-phantom-text-muted hover:text-phantom-text-secondary transition-colors"
                    >
                      Forgot password
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    className="input pr-12"
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-phantom-text-muted hover:text-phantom-text-secondary transition-colors"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    className="font-body text-[13px] text-phantom-danger"
                    role="alert"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading
                  ? (mode === 'signup' ? 'Creating account...' : 'Signing in...')
                  : (mode === 'signup' ? 'Create account' : 'Sign in')
                }
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 divider" />
              <span className="font-body text-[12px] text-phantom-text-muted">or</span>
              <div className="flex-1 divider" />
            </div>

            <button
              className="btn-secondary w-full"
              type="button"
              disabled={loading}
              onClick={async () => {
                setError('')
                setLoading(true)
                try {
                  await loginWithGoogle()
                  // RequireAuth will route to /onboarding if onboarding_completed is false.
        navigate('/dashboard', { replace: true })
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Google sign-in failed.')
                } finally {
                  setLoading(false)
                }
              }}
            >
              Continue with Google
            </button>
          </div>

          <p className="text-center font-body text-[13px] text-phantom-text-muted">
            {mode === 'signup' ? (
              <>Already have an account?{' '}
                <Link to="/login" className="text-phantom-text-secondary hover:text-phantom-text-primary transition-colors">
                  Log in
                </Link>
              </>
            ) : (
              <>No account?{' '}
                <Link to="/signup" className="text-phantom-text-secondary hover:text-phantom-text-primary transition-colors">
                  Start free
                </Link>
              </>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  )
})

AuthPage.displayName = 'AuthPage'
export default AuthPage
