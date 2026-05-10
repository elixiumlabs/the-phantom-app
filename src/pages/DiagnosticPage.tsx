import { useState } from 'react'
import { isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function DiagnosticPage() {
  const { user, session } = useAuth()
  const [testResult, setTestResult] = useState('')
  const [testing, setTesting] = useState(false)

  const runTest = async () => {
    setTesting(true)
    setTestResult('Testing...')

    try {
      if (!isSupabaseConfigured) {
        setTestResult('Supabase is not configured. Check .env.local.')
        return
      }
      if (!session) {
        setTestResult('Not logged in. Sign in to test API routes.')
        return
      }

      const { refineProblemStatement } = await import('@/lib/functions')
      try {
        await refineProblemStatement({
          draft: 'I help founders who struggle with brand positioning to create clear messaging without hiring expensive agencies.',
        })
        setTestResult('All systems working. Supabase auth and Vercel API routes are connected.')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        if (message.toLowerCase().includes('daily limit')) {
          setTestResult('API routes connected. The daily limit response came from the backend.')
        } else if (message.toLowerCase().includes('permission')) {
          setTestResult('API routes connected. Permission errors are expected without a project.')
        } else {
          setTestResult(`API route error: ${message}`)
        }
      }
    } catch (err) {
      setTestResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-phantom-black text-phantom-text-primary p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-4xl mb-8 text-phantom-lime">Phantom App Diagnostics</h1>

        <div className="space-y-6">
          <div className="card">
            <h2 className="label mb-4">Supabase Configuration</h2>
            <div className="flex items-center gap-3">
              <span className={isSupabaseConfigured ? 'text-phantom-lime' : 'text-phantom-danger'}>
                {isSupabaseConfigured ? 'OK' : 'Missing'}
              </span>
              <span className="font-body text-sm">{isSupabaseConfigured ? 'Configured' : 'Not configured'}</span>
            </div>
          </div>

          <div className="card">
            <h2 className="label mb-4">Authentication</h2>
            <div className="flex items-center gap-3">
              <span className={session ? 'text-phantom-lime' : 'text-phantom-danger'}>
                {session ? 'OK' : 'Missing'}
              </span>
              <span className="font-body text-sm">
                {session ? `Logged in as ${user?.email ?? session.user.email}` : 'Not logged in'}
              </span>
            </div>
            {user && (
              <div className="ml-8 mt-2 space-y-1 text-sm text-phantom-text-secondary">
                <div>Plan: <span className="text-phantom-lime">{user.plan}</span></div>
                <div>Onboarding: {user.onboardingCompleted ? 'complete' : 'incomplete'}</div>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="label mb-4">Vercel API Routes</h2>
            <button onClick={runTest} disabled={testing || !session} className="btn-primary mb-4">
              {testing ? 'Testing...' : 'Test API Connection'}
            </button>
            {testResult && (
              <div className="p-4 bg-phantom-black/40 border border-phantom-border-subtle rounded">
                <p className="font-body text-sm whitespace-pre-wrap">{testResult}</p>
              </div>
            )}
            {!session && <p className="font-body text-sm text-phantom-text-muted">Sign in first to test API routes.</p>}
          </div>

          <div className="card">
            <h2 className="label mb-4">Environment</h2>
            <div className="space-y-2 font-code text-xs text-phantom-text-secondary">
              <div>Mode: {import.meta.env.MODE}</div>
              <div>Dev: {import.meta.env.DEV ? 'true' : 'false'}</div>
              <div>Supabase URL: {import.meta.env.VITE_SUPABASE_URL || 'not set'}</div>
            </div>
          </div>

          <div className="card">
            <h2 className="label mb-4">Quick Links</h2>
            <div className="space-y-2">
              <a href="/" className="btn-secondary block text-center">Back to App</a>
              {!session && <a href="/login" className="btn-primary block text-center">Sign In</a>}
              {session && !user?.onboardingCompleted && <a href="/onboarding" className="btn-primary block text-center">Complete Onboarding</a>}
              {session && user?.onboardingCompleted && <a href="/dashboard" className="btn-primary block text-center">Go to Dashboard</a>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

