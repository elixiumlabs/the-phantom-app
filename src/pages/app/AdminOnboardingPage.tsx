import { memo, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ExternalLink, Loader2, ShieldCheck } from 'lucide-react'
import AppSidebar from '@/components/app/AppSidebar'
import { useAuth } from '@/contexts/AuthContext'
import { getAdminOnboardingResponses, type AdminOnboardingResponse } from '@/lib/functions'

const USER_TYPE_LABELS: Record<AdminOnboardingResponse['user_type'], string> = {
  solo_founder: 'Solo founder',
  creator: 'Creator',
  coach_consultant: 'Coach / consultant',
  agency: 'Agency',
  other: 'Other',
}

const BUILT_IN_PUBLIC_LABELS: Record<AdminOnboardingResponse['built_in_public'], string> = {
  yes: 'Tried before',
  currently: 'Doing it now',
  no: 'Never',
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

const AdminOnboardingPage = memo(() => {
  const { user } = useAuth()
  const [responses, setResponses] = useState<AdminOnboardingResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.isAdmin) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    getAdminOnboardingResponses()
      .then(({ responses: nextResponses }) => {
        if (!cancelled) setResponses(nextResponses)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load onboarding responses.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user?.isAdmin])

  return (
    <div className="flex min-h-screen bg-phantom-black">
      <AppSidebar />

      <main className="ml-60 flex-1 p-10">
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <p className="label mb-3 text-phantom-lime">Admin</p>
            <h1 className="font-display text-[34px] font-bold leading-tight text-phantom-text-primary">
              Customer onboarding
            </h1>
            <p className="mt-2 max-w-2xl font-body text-[14px] leading-relaxed text-phantom-text-secondary">
              Review what new customers are building, where they are in the validation journey, and which starting project Phantom created for them.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded border border-phantom-border-subtle bg-phantom-surface-dark px-3 py-2 text-phantom-lime">
            <ShieldCheck size={16} aria-hidden="true" />
            <span className="font-ui text-[11px] uppercase">Admin only</span>
          </div>
        </div>

        {!user?.isAdmin && (
          <div className="rounded border border-phantom-danger/30 bg-phantom-danger/10 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={17} className="mt-0.5 shrink-0 text-phantom-danger" aria-hidden="true" />
              <div>
                <h2 className="font-display text-[18px] font-semibold text-phantom-text-primary">Access denied</h2>
                <p className="mt-1 font-body text-[14px] text-phantom-text-secondary">
                  This page is only available to Phantom admins.
                </p>
              </div>
            </div>
          </div>
        )}

        {user?.isAdmin && loading && (
          <div className="flex items-center gap-3 rounded border border-phantom-border-subtle bg-phantom-surface-dark p-5 font-body text-[14px] text-phantom-text-secondary">
            <Loader2 className="animate-spin text-phantom-lime" size={18} aria-hidden="true" />
            Loading customer intake...
          </div>
        )}

        {user?.isAdmin && error && (
          <div className="rounded border border-phantom-danger/30 bg-phantom-danger/10 p-4">
            <p className="font-body text-[14px] text-phantom-danger">{error}</p>
          </div>
        )}

        {user?.isAdmin && !loading && !error && (
          <div className="overflow-hidden rounded border border-phantom-border-subtle bg-phantom-surface-dark">
            <div className="grid grid-cols-[1.1fr_1.4fr_1fr_1fr_0.9fr] gap-4 border-b border-phantom-border-subtle px-5 py-3 font-ui text-[11px] uppercase text-phantom-text-muted">
              <span>Customer</span>
              <span>What they are building</span>
              <span>Profile</span>
              <span>Starting project</span>
              <span>Date</span>
            </div>

            {responses.length === 0 ? (
              <div className="px-5 py-10 text-center font-body text-[14px] text-phantom-text-muted">
                No onboarding responses yet.
              </div>
            ) : (
              <div className="divide-y divide-phantom-border-subtle">
                {responses.map((response) => (
                  <div
                    key={response.id}
                    className="grid grid-cols-[1.1fr_1.4fr_1fr_1fr_0.9fr] gap-4 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-body text-[14px] text-phantom-text-primary">
                        {response.users?.full_name || response.users?.email || 'Unknown user'}
                      </p>
                      <p className="mt-1 truncate font-code text-[11px] text-phantom-text-muted">
                        {response.users?.email ?? response.user_id}
                      </p>
                      <span className="badge mt-2 text-[9px]">
                        {response.users?.plan ?? 'free'}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <p className="line-clamp-3 font-body text-[13px] leading-relaxed text-phantom-text-secondary">
                        {response.what_building}
                      </p>
                      {response.history_note && (
                        <p className="mt-2 line-clamp-2 font-body text-[12px] leading-relaxed text-phantom-text-muted">
                          Note: {response.history_note}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="font-body text-[13px] text-phantom-text-primary">
                        {USER_TYPE_LABELS[response.user_type]}
                      </p>
                      <p className="mt-1 font-body text-[12px] text-phantom-text-muted">
                        {BUILT_IN_PUBLIC_LABELS[response.built_in_public]}
                      </p>
                      <p className="mt-2 font-body text-[12px] text-phantom-text-muted">
                        Onboarding: {response.users?.onboarding_completed ? 'complete' : 'incomplete'}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-body text-[13px] text-phantom-text-primary">
                        {response.projects?.name || response.suggested_name || 'No project'}
                      </p>
                      {response.project_id && (
                        <Link
                          to={`/project/${response.project_id}/identify`}
                          className="mt-2 inline-flex items-center gap-1 font-ui text-[12px] text-phantom-lime no-underline hover:text-phantom-text-primary"
                        >
                          Open project
                          <ExternalLink size={12} aria-hidden="true" />
                        </Link>
                      )}
                    </div>

                    <div>
                      <p className="font-code text-[12px] text-phantom-text-secondary">
                        {formatDate(response.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
})

AdminOnboardingPage.displayName = 'AdminOnboardingPage'
export default AdminOnboardingPage
