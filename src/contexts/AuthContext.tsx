import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  sendEmailVerification,
  updateProfile,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore'
import { auth, db, googleProvider, isFirebaseConfigured } from '@/lib/firebase'

const NOT_CONFIGURED = new Error(
  'Auth is not configured. Add Firebase env vars (VITE_FIREBASE_*) to .env.local and restart the dev server.',
)

export type Plan = 'free' | 'phantom' | 'phantom_pro'

export interface User {
  id: string
  name: string
  email: string
  emailVerified: boolean
  plan: Plan
  onboardingCompleted: boolean
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  createdAt: string
}

interface AuthCtx {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthCtx | null>(null)

function authErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use': return 'An account with this email already exists.'
    case 'auth/invalid-email': return 'That email address is not valid.'
    case 'auth/weak-password': return 'Password must be at least 6 characters.'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'Email or password is incorrect.'
    case 'auth/too-many-requests': return 'Too many attempts. Try again in a few minutes.'
    case 'auth/popup-closed-by-user': return 'Sign-in cancelled.'
    case 'auth/network-request-failed': return 'Network error. Check your connection.'
    default: return 'Something went wrong. Try again.'
  }
}

function shapeUser(fbUser: FirebaseUser, profile: Record<string, unknown> | null): User {
  return {
    id: fbUser.uid,
    name: (profile?.full_name as string | undefined) ?? fbUser.displayName ?? fbUser.email?.split('@')[0] ?? 'phantom',
    email: fbUser.email ?? '',
    emailVerified: fbUser.emailVerified,
    plan: ((profile?.plan as Plan | undefined) ?? 'free'),
    onboardingCompleted: Boolean(profile?.onboarding_completed),
    stripeCustomerId: profile?.stripe_customer_id as string | undefined,
    stripeSubscriptionId: profile?.stripe_subscription_id as string | undefined,
    createdAt: (profile?.created_at as string | undefined) ?? new Date().toISOString(),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }

    let profileUnsub: Unsubscribe | null = null

    const unsub = onAuthStateChanged(auth, (fbUser) => {
      profileUnsub?.()
      profileUnsub = null

      setFirebaseUser(fbUser)

      if (!fbUser) {
        setUser(null)
        setLoading(false)
        return
      }

      // Subscribe to users/{uid} so plan + onboarding flips reach the UI live.
      // Doc is created server-side by the Auth onCreate trigger; until it lands,
      // we shape from the firebase user alone with safe defaults.
      profileUnsub = onSnapshot(
        doc(db, 'users', fbUser.uid),
        (snap) => {
          setUser(shapeUser(fbUser, snap.exists() ? snap.data() : null))
          setLoading(false)
        },
        () => {
          setUser(shapeUser(fbUser, null))
          setLoading(false)
        },
      )
    })

    return () => {
      profileUnsub?.()
      unsub()
    }
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string) => {
    if (!isFirebaseConfigured) throw NOT_CONFIGURED
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      if (name) await updateProfile(cred.user, { displayName: name })
      await sendEmailVerification(cred.user).catch(() => {})
    } catch (err) {
      const code = (err as { code?: string }).code ?? ''
      throw new Error(authErrorMessage(code))
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    if (!isFirebaseConfigured) throw NOT_CONFIGURED
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      const code = (err as { code?: string }).code ?? ''
      throw new Error(authErrorMessage(code))
    }
  }, [])

  const loginWithGoogle = useCallback(async () => {
    if (!isFirebaseConfigured) throw NOT_CONFIGURED
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      const code = (err as { code?: string }).code ?? ''
      throw new Error(authErrorMessage(code))
    }
  }, [])

  const logout = useCallback(async () => {
    if (!isFirebaseConfigured) return
    await signOut(auth)
  }, [])

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, loginWithGoogle, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
