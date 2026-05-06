import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase reads the code/token from the URL hash/query params and
    // exchanges it for a session. onAuthStateChange in AuthContext picks
    // up the resulting session automatically.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    })
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="label text-phantom-lime">Signing you in…</span>
    </div>
  )
}
