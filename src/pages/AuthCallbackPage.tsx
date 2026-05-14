import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

function safeInternalPath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/dashboard'
  return value
}

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const next = safeInternalPath(new URLSearchParams(location.search).get('next'))

    // Supabase reads the code/token from the URL hash/query params and
    // exchanges it for a session. onAuthStateChange in AuthContext picks
    // up the resulting session automatically.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate(next, { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    })
  }, [location.search, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="label text-phantom-lime">Signing you in…</span>
    </div>
  )
}
