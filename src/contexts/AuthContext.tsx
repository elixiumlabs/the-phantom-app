import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Session, User as SupabaseUser } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const NOT_CONFIGURED = new Error(
  'Auth is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local and restart.',
)

export type Plan = 'free' | 'phantom' | 'phantom_pro'
export type LLMProvider = 'gemini' | 'groq' | 'groq_fast' | 'qwen' | 'groq_compound'

export interface User {
  id: string
  name: string
  email: string
  emailVerified: boolean
  plan: Plan
  llmProvider: LLMProvider
  onboardingCompleted: boolean
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  createdAt: string
}

interface AuthCtx {
  user: User | null
  session: Session | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthCtx | null>(null)

function authErrorMessage(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('email already') || m.includes('already registered')) return 'An account with this email already exists.'
  if (m.includes('invalid email')) return 'That email address is not valid.'
  if (m.includes('password') && m.includes('short')) return 'Password must be at least 6 characters.'
  if (m.includes('invalid login') || m.includes('invalid credentials') || m.includes('email not confirmed')) return 'Email or password is incorrect.'
  if (m.includes('too many requests') || m.includes('rate limit')) return 'Too many attempts. Try again in a few minutes.'
  if (m.includes('popup') || m.includes('cancelled')) return 'Sign-in cancelled.'
  if (m.includes('network')) return 'Network error. Check your connection.'
  return message || 'Something went wrong. Try again.'
}

function shapeUser(supaUser: SupabaseUser, profile: Record<string, unknown> | null): User {
  const rawProvider = profile?.llm_provider as string | undefined
  const llmProvider: LLMProvider =
    rawProvider === 'gemini' ||
    rawProvider === 'groq' ||
    rawProvider === 'groq_fast' ||
    rawProvider === 'qwen' ||
    rawProvider === 'groq_compound'
      ? rawProvider
      : 'gemini'

  const meta = supaUser.user_metadata as Record<string, unknown> | undefined

  return {
    id: supaUser.id,
    name:
      (profile?.full_name as string | undefined) ??
      (meta?.full_name as string | undefined) ??
      (meta?.name as string | undefined) ??
      supaUser.email?.split('@')[0] ??
      'phantom',
    email: supaUser.email ?? '',
    emailVerified: Boolean(supaUser.email_confirmed_at),
    plan: (profile?.plan as Plan | undefined) ?? 'free',
    llmProvider,
    onboardingCompleted: Boolean(profile?.onboarding_completed),
    stripeCustomerId: profile?.stripe_customer_id as string | undefined,
    stripeSubscriptionId: profile?.stripe_subscription_id as string | undefined,
    createdAt: (profile?.created_at as string | undefined) ?? new Date().toISOString(),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    // Load the initial session from local storage synchronously.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (!data.session) {
        setUser(null)
        setLoading(false)
      }
    })

    // Subscribe to auth state changes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)

      if (!newSession) {
        setUser(null)
        setLoading(false)
        return
      }

      // Fetch the users row so plan + onboarding changes reach the UI.
      // The bootstrapUser API route creates this row on first sign-up.
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', newSession.user.id)
        .single()

      setUser(shapeUser(newSession.user, profile))
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Re-fetch profile whenever session changes so plan updates propagate.
  useEffect(() => {
    if (!session) return
    let cancelled = false

    supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data: profile }) => {
        if (!cancelled && session) {
          setUser(shapeUser(session.user, profile))
          setLoading(false)
        }
      })

    // Subscribe to realtime changes on the user's own row so plan flips
    // (e.g. after Stripe webhook) reach the UI without a page refresh.
    const channel = supabase
      .channel(`user-profile-${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${session.user.id}`,
        },
        (payload) => {
          if (!cancelled && session) {
            setUser(shapeUser(session.user, payload.new as Record<string, unknown>))
          }
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [session?.user.id])

  const signup = useCallback(async (name: string, email: string, password: string) => {
    if (!isSupabaseConfigured) throw NOT_CONFIGURED
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (error) throw new Error(authErrorMessage(error.message))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) throw NOT_CONFIGURED
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(authErrorMessage(error.message))
  }, [])

  const loginWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured) throw NOT_CONFIGURED
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: { prompt: 'select_account' },
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw new Error(authErrorMessage(error.message))
  }, [])

  const logout = useCallback(async () => {
    if (!isSupabaseConfigured) return
    await supabase.auth.signOut()
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, loading, login, loginWithGoogle, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
