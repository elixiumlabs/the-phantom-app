import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ExternalLink, Loader2, ShieldCheck, X } from 'lucide-react'
import LiquidBackground from '@/components/LiquidBackground'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

type OAuthAuthorizationDetails = {
  authorization_id: string
  redirect_uri: string
  client: {
    id: string
    name: string
    uri?: string
    logo_uri?: string
  }
  user?: {
    id: string
    email?: string
  }
  scope?: string
}

type Decision = 'approve' | 'deny'

const SCOPE_LABELS: Record<string, string> = {
  openid: 'Confirm your identity',
  email: 'Share your email address',
  profile: 'Share your basic profile',
  phone: 'Share your phone number',
}

function formatScope(scope: string): string {
  return SCOPE_LABELS[scope] ?? scope.replace(/[_:.-]+/g, ' ')
}

function safeReturnPath(pathname: string, search: string): string {
  const next = `${pathname}${search}`
  if (!next.startsWith('/') || next.startsWith('//')) return '/oauth/consent'
  return next
}

export default function OAuthConsentPage() {
  const { user, loading: authLoading } = useAuth()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()

  const authorizationId = searchParams.get('authorization_id') ?? ''
  const [details, setDetails] = useState<OAuthAuthorizationDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [decision, setDecision] = useState<Decision | null>(null)
  const [error, setError] = useState('')

  const scopes = useMemo(
    () => details?.scope?.split(' ').map(scope => scope.trim()).filter(Boolean) ?? [],
    [details?.scope],
  )

  useEffect(() => {
    if (authLoading) return

    if (!authorizationId) {
      setLoading(false)
      setError('Missing authorization request.')
      return
    }

    if (!user) {
      const redirect = safeReturnPath(location.pathname, location.search)
      navigate(`/login?redirect=${encodeURIComponent(redirect)}`, { replace: true })
      return
    }

    let cancelled = false
    setLoading(true)
    setError('')

    supabase.auth.oauth.getAuthorizationDetails(authorizationId).then(({ data, error: authError }) => {
      if (cancelled) return

      if (authError || !data) {
        setError(authError?.message ?? 'Invalid authorization request.')
        setLoading(false)
        return
      }

      if ('redirect_url' in data) {
        window.location.assign(data.redirect_url)
        return
      }

      setDetails(data)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [authLoading, authorizationId, location.pathname, location.search, navigate, user])

  const submitDecision = useCallback(async (nextDecision: Decision) => {
    if (!authorizationId) return

    setDecision(nextDecision)
    setError('')

    const action =
      nextDecision === 'approve'
        ? supabase.auth.oauth.approveAuthorization
        : supabase.auth.oauth.denyAuthorization

    const { data, error: decisionError } = await action(authorizationId, { skipBrowserRedirect: true })

    if (decisionError || !data?.redirect_url) {
      setError(decisionError?.message ?? 'Could not complete authorization.')
      setDecision(null)
      return
    }

    window.location.assign(data.redirect_url)
  }, [authorizationId])

  return (
    <div className="relative min-h-screen overflow-hidden">
      <LiquidBackground />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">
        <section className="w-full max-w-[520px]">
          <Link to="/" className="mb-8 flex items-center gap-2 no-underline">
            <div className="h-4 w-4 bg-phantom-lime" />
            <span className="font-display text-[18px] font-bold text-phantom-text-primary">PHANTOM</span>
          </Link>

          <div className="card">
            <div className="mb-6 flex items-start justify-between gap-5">
              <div>
                <p className="label mb-3 text-phantom-lime">Authorization request</p>
                <h1 className="font-display text-[30px] font-bold leading-tight text-phantom-text-primary">
                  {details ? `Authorize ${details.client.name}` : 'Authorize access'}
                </h1>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-phantom-border bg-phantom-surface-dark text-phantom-lime">
                <ShieldCheck size={20} aria-hidden="true" />
              </div>
            </div>

            {loading && (
              <div className="flex items-center gap-3 py-8 font-body text-[14px] text-phantom-text-secondary">
                <Loader2 className="animate-spin text-phantom-lime" size={18} aria-hidden="true" />
                Loading authorization details...
              </div>
            )}

            {!loading && error && (
              <div className="rounded-xl border border-phantom-danger/40 bg-phantom-danger/10 p-4">
                <p className="font-body text-[14px] text-phantom-danger" role="alert">{error}</p>
              </div>
            )}

            {!loading && details && (
              <>
                <div className="mb-6 space-y-4 font-body text-[14px] text-phantom-text-secondary">
                  <p>
                    {details.client.name} wants access to your Phantom account
                    {details.user?.email ? ` (${details.user.email})` : user?.email ? ` (${user.email})` : ''}.
                  </p>

                  <div className="rounded-xl border border-phantom-border-subtle bg-phantom-surface-dark p-4">
                    <p className="label mb-2 text-phantom-text-muted">Redirect URI</p>
                    <p className="break-all font-code text-[12px] text-phantom-text-secondary">
                      {details.redirect_uri}
                    </p>
                  </div>

                  {scopes.length > 0 && (
                    <div>
                      <p className="label mb-3 text-phantom-text-muted">Requested permissions</p>
                      <div className="flex flex-col gap-2">
                        {scopes.map(scope => (
                          <div
                            key={scope}
                            className="flex items-center justify-between gap-3 rounded-xl border border-phantom-border-subtle bg-phantom-surface-dark px-4 py-3"
                          >
                            <span className="text-phantom-text-primary">{formatScope(scope)}</span>
                            <span className="font-code text-[11px] text-phantom-text-muted">{scope}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {details.client.uri && (
                    <a
                      href={details.client.uri}
                      rel="noreferrer"
                      target="_blank"
                      className="inline-flex items-center gap-2 font-ui text-[13px] text-phantom-text-secondary transition-colors hover:text-phantom-lime"
                    >
                      View client website
                      <ExternalLink size={14} aria-hidden="true" />
                    </a>
                  )}
                </div>

                {error && (
                  <p className="mb-4 font-body text-[13px] text-phantom-danger" role="alert">{error}</p>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    className="btn-secondary w-full"
                    disabled={Boolean(decision)}
                    onClick={() => submitDecision('deny')}
                  >
                    {decision === 'deny' ? <Loader2 className="animate-spin" size={16} /> : <X size={16} />}
                    Deny
                  </button>
                  <button
                    type="button"
                    className="btn-primary w-full"
                    disabled={Boolean(decision)}
                    onClick={() => submitDecision('approve')}
                  >
                    {decision === 'approve' && <Loader2 className="animate-spin" size={16} />}
                    Approve
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
