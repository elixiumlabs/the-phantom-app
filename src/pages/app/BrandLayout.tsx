import { memo } from 'react'
import { Outlet, NavLink, useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, Lock, ArrowLeft } from 'lucide-react'
import { useBrands, type Phase } from '@/contexts/BrandContext'
import AppSidebar from '@/components/app/AppSidebar'

const PHASES: { id: Phase; label: string }[] = [
  { id: 'identify', label: '01 Ghost Identity' },
  { id: 'test', label: '02 Silent Test' },
  { id: 'iterate', label: '03 Iteration Loop' },
  { id: 'lock', label: '04 Lock In' },
]

const PHASE_ORDER: Phase[] = ['identify', 'test', 'iterate', 'lock', 'complete']

function phaseIndex(p: Phase) {
  return PHASE_ORDER.indexOf(p)
}

const BrandLayout = memo(() => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getBrand } = useBrands()
  const brand = getBrand(id!)

  if (!brand) {
    return (
      <div className="flex min-h-screen bg-phantom-black">
        <AppSidebar />
        <main className="flex-1 ml-60 flex items-center justify-center">
          <div className="text-center">
            <p className="font-code text-[13px] text-phantom-text-muted mb-4">404</p>
            <h1 className="font-display font-bold text-[24px] text-phantom-text-primary mb-3">
              Brand not found.
            </h1>
            <p className="font-body text-[14px] text-phantom-text-secondary mb-6">
              This brand does not exist or was deleted.
            </p>
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>
              <ArrowLeft size={14} /> Back to dashboard
            </button>
          </div>
        </main>
      </div>
    )
  }

  const currentPhaseIdx = phaseIndex(brand.currentPhase)

  return (
    <div className="flex min-h-screen bg-phantom-black">
      <AppSidebar />

      <div className="flex-1 ml-60 flex flex-col">
        {/* Phase nav bar */}
        <nav className="h-14 border-b border-phantom-border-subtle bg-[#0d0d0d] flex items-stretch px-2 gap-0 overflow-x-auto shrink-0 sticky top-0 z-30">
          {PHASES.map(({ id: phaseId, label }) => {
            const phaseIdx = phaseIndex(phaseId)
            const isCompleted = phaseIdx < currentPhaseIdx
            const isLocked = phaseIdx > currentPhaseIdx
            const isActive = phaseId === brand.currentPhase

            return (
              <NavLink
                key={phaseId}
                to={`/brand/${id}/${phaseId}`}
                className={({ isActive: navActive }) =>
                  [
                    'flex items-center gap-2 font-body text-[13px] px-5 py-1 transition-colors duration-150 border-b-2 whitespace-nowrap',
                    navActive
                      ? 'text-phantom-text-primary border-phantom-lime'
                      : isCompleted
                      ? 'text-phantom-text-muted border-transparent hover:text-phantom-text-secondary'
                      : isLocked
                      ? 'text-[#333] border-transparent cursor-not-allowed pointer-events-none'
                      : 'text-phantom-text-muted border-transparent hover:text-phantom-text-secondary',
                  ].join(' ')
                }
                onClick={e => {
                  if (isLocked) e.preventDefault()
                }}
              >
                {isCompleted && !isActive && (
                  <CheckCircle size={12} className="text-phantom-lime flex-shrink-0" />
                )}
                {isLocked && (
                  <Lock size={11} className="text-[#444] flex-shrink-0" />
                )}
                {label}
              </NavLink>
            )
          })}

          {/* Brand name right-aligned */}
          <div className="ml-auto flex items-center pr-4">
            <span className="font-display font-semibold text-[13px] text-phantom-text-muted truncate max-w-[140px]">
              {brand.name}
            </span>
          </div>
        </nav>

        {/* Content */}
        <main className="flex-1 p-10 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
})

BrandLayout.displayName = 'BrandLayout'
export default BrandLayout
