import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

export interface User {
  id: string
  name: string
  email: string
  plan: 'free' | 'pro'
  createdAt: string
}

interface AuthCtx {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthCtx | null>(null)

const STORAGE_KEY = 'phantom_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setUser(JSON.parse(stored))
    } catch {}
    setLoading(false)
  }, [])

  const persist = (u: User) => {
    setUser(u)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
  }

  const login = useCallback(async (email: string, _password: string) => {
    await new Promise(r => setTimeout(r, 600))
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const u: User = JSON.parse(stored)
      if (u.email === email) { persist(u); return }
    }
    // Allow any email/password in pre-Supabase mode — create a session
    const u: User = {
      id: crypto.randomUUID(),
      name: email.split('@')[0],
      email,
      plan: 'free',
      createdAt: new Date().toISOString(),
    }
    persist(u)
  }, [])

  const signup = useCallback(async (name: string, email: string, _password: string) => {
    // Simulated — swap for Supabase auth.signUp
    await new Promise(r => setTimeout(r, 600))
    const u: User = {
      id: crypto.randomUUID(),
      name,
      email,
      plan: 'free',
      createdAt: new Date().toISOString(),
    }
    persist(u)
  }, [])

  const loginWithGoogle = useCallback(async () => {
    await new Promise(r => setTimeout(r, 800))
    const u: User = {
      id: crypto.randomUUID(),
      name: 'Google User',
      email: 'user@gmail.com',
      plan: 'free',
      createdAt: new Date().toISOString(),
    }
    persist(u)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
