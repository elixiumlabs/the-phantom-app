import { useState } from 'react'
import { isFirebaseConfigured } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'

export default function DiagnosticPage() {
  const { user, firebaseUser } = useAuth()
  const [testResult, setTestResult] = useState<string>('')
  const [testing, setTesting] = useState(false)

  const runTest = async () => {
    setTesting(true)
    setTestResult('Testing...')
    
    try {
      // Test 1: Firebase Config
      if (!isFirebaseConfigured) {
        setTestResult('❌ Firebase not configured. Check .env.local')
        setTesting(false)
        return
      }
      
      // Test 2: Auth
      if (!firebaseUser) {
        setTestResult('⚠️ Not logged in. Sign in to test functions.')
        setTesting(false)
        return
      }
      
      // Test 3: Try a simple function call
      const { refineProblemStatement } = await import('@/lib/functions')
      
      try {
        await refineProblemStatement({
          draft: 'I help founders who struggle with brand positioning to create clear messaging without hiring expensive agencies.'
        })
        setTestResult('✅ All systems working! Functions are connected.')
      } catch (err: any) {
        if (err.message?.includes('daily limit')) {
          setTestResult('✅ Functions connected! (Hit daily limit, which means it worked)')
        } else if (err.message?.includes('permission')) {
          setTestResult('✅ Functions connected! (Permission error is expected without a project)')
        } else {
          setTestResult(`⚠️ Function error: ${err.message}`)
        }
      }
    } catch (err: any) {
      setTestResult(`❌ Error: ${err.message}`)
    }
    
    setTesting(false)
  }

  return (
    <div className="min-h-screen bg-phantom-black text-phantom-text-primary p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-4xl mb-8 text-phantom-lime">
          🔧 Phantom App Diagnostics
        </h1>
        
        <div className="space-y-6">
          {/* Firebase Config */}
          <div className="card">
            <h2 className="label mb-4">Firebase Configuration</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className={isFirebaseConfigured ? 'text-phantom-lime' : 'text-phantom-danger'}>
                  {isFirebaseConfigured ? '✅' : '❌'}
                </span>
                <span className="font-body text-sm">
                  {isFirebaseConfigured ? 'Configured' : 'Not configured'}
                </span>
              </div>
            </div>
          </div>

          {/* Auth Status */}
          <div className="card">
            <h2 className="label mb-4">Authentication</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className={firebaseUser ? 'text-phantom-lime' : 'text-phantom-danger'}>
                  {firebaseUser ? '✅' : '❌'}
                </span>
                <span className="font-body text-sm">
                  {firebaseUser ? `Logged in as ${firebaseUser.email}` : 'Not logged in'}
                </span>
              </div>
              {user && (
                <div className="ml-8 space-y-1 text-sm text-phantom-text-secondary">
                  <div>Plan: <span className="text-phantom-lime">{user.plan}</span></div>
                  <div>Onboarding: {user.onboardingCompleted ? '✅' : '❌'}</div>
                </div>
              )}
            </div>
          </div>

          {/* Function Test */}
          <div className="card">
            <h2 className="label mb-4">Cloud Functions</h2>
            <button
              onClick={runTest}
              disabled={testing || !firebaseUser}
              className="btn-primary mb-4"
            >
              {testing ? 'Testing...' : 'Test Function Connection'}
            </button>
            
            {testResult && (
              <div className="p-4 bg-phantom-black/40 border border-phantom-border-subtle rounded">
                <p className="font-body text-sm whitespace-pre-wrap">{testResult}</p>
              </div>
            )}
            
            {!firebaseUser && (
              <p className="font-body text-sm text-phantom-text-muted">
                Sign in first to test functions
              </p>
            )}
          </div>

          {/* Environment Info */}
          <div className="card">
            <h2 className="label mb-4">Environment</h2>
            <div className="space-y-2 font-code text-xs text-phantom-text-secondary">
              <div>Mode: {import.meta.env.MODE}</div>
              <div>Dev: {import.meta.env.DEV ? 'true' : 'false'}</div>
              <div>Project ID: {import.meta.env.VITE_FIREBASE_PROJECT_ID || 'not set'}</div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="card">
            <h2 className="label mb-4">Quick Links</h2>
            <div className="space-y-2">
              <a href="/" className="btn-secondary block text-center">
                ← Back to App
              </a>
              {!firebaseUser && (
                <a href="/login" className="btn-primary block text-center">
                  Sign In
                </a>
              )}
              {firebaseUser && !user?.onboardingCompleted && (
                <a href="/onboarding" className="btn-primary block text-center">
                  Complete Onboarding
                </a>
              )}
              {firebaseUser && user?.onboardingCompleted && (
                <a href="/dashboard" className="btn-primary block text-center">
                  Go to Dashboard
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
