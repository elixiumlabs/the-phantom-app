import { memo, useState } from 'react'
import { ArrowRight, Repeat2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PhaseFlipCardProps {
  number: string
  title: string
  subtitle: string
  description: string
  features: string[]
  badge?: string
}

const PhaseFlipCard = memo(({
  number,
  title,
  subtitle,
  description,
  features,
  badge,
}: PhaseFlipCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div
      className="group relative h-[420px] w-full [perspective:2000px]"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onFocus={() => setIsFlipped(true)}
      onBlur={() => setIsFlipped(false)}
      tabIndex={0}
    >
      <div
        className={cn(
          'relative h-full w-full',
          '[transform-style:preserve-3d]',
          'transition-all duration-700',
          isFlipped ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]',
        )}
      >
        {/* Front */}
        <div
          className={cn(
            'absolute inset-0 h-full w-full',
            '[backface-visibility:hidden] [transform:rotateY(0deg)]',
            'overflow-hidden rounded-2xl',
            'bg-phantom-surface border border-phantom-border-subtle',
            'shadow-lg transition-all duration-700',
            'group-hover:border-phantom-lime/40 group-hover:shadow-[0_0_40px_rgba(137,243,54,0.08)]',
            isFlipped ? 'opacity-0' : 'opacity-100',
          )}
        >
          <div className="relative h-full overflow-hidden bg-gradient-to-b from-phantom-surface to-phantom-black">
            {/* Pulse ring animation */}
            <div className="absolute inset-0 flex items-start justify-center pt-20">
              <div className="relative flex h-[100px] w-[200px] items-center justify-center">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'absolute h-[50px] w-[50px] rounded-[140px] opacity-0',
                      'animate-[phase-pulse_3s_linear_infinite]',
                      'group-hover:animate-[phase-pulse_2s_linear_infinite]',
                    )}
                    style={{ animationDelay: `${i * 0.3}s` }}
                  />
                ))}
              </div>
            </div>

            {/* Phase number watermark */}
            <p className="absolute top-5 left-5 font-code text-[12px] text-phantom-lime uppercase tracking-[0.2em]">
              Phase {number}
            </p>
          </div>

          <div className="absolute right-0 bottom-0 left-0 p-5">
            <div className="flex items-end justify-between gap-3">
              <div className="space-y-1.5 min-w-0">
                <h3 className="font-display font-semibold text-[20px] text-phantom-text-primary leading-snug tracking-tight transition-all duration-500 ease-out-expo group-hover:translate-y-[-4px]">
                  {title}
                </h3>
                <p className="line-clamp-2 font-body text-[13px] text-phantom-text-secondary leading-relaxed transition-all duration-500 ease-out-expo group-hover:translate-y-[-4px]" style={{ transitionDelay: '50ms' }}>
                  {subtitle}
                </p>
              </div>
              <div className="group/icon relative shrink-0">
                <div className="absolute inset-[-8px] rounded-lg bg-gradient-to-br from-phantom-lime/20 via-phantom-lime/10 to-transparent transition-opacity duration-300" />
                <Repeat2 className="relative z-10 h-4 w-4 text-phantom-lime transition-transform duration-300 group-hover/icon:-rotate-12 group-hover/icon:scale-110" />
              </div>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className={cn(
            'absolute inset-0 h-full w-full',
            '[backface-visibility:hidden] [transform:rotateY(180deg)]',
            'rounded-2xl p-5',
            'bg-gradient-to-b from-phantom-surface to-phantom-black',
            'border border-phantom-border',
            'shadow-lg flex flex-col overflow-hidden',
            'transition-all duration-700',
            'group-hover:border-phantom-lime/40 group-hover:shadow-[0_0_40px_rgba(137,243,54,0.12)]',
            isFlipped ? 'opacity-100' : 'opacity-0',
          )}
        >
          <div className="flex-1 space-y-5">
            <div className="space-y-2">
              <p className="font-code text-[12px] text-phantom-lime uppercase tracking-[0.2em]">Phase {number}</p>
              <h3 className="font-display font-semibold text-[20px] text-phantom-text-primary leading-snug tracking-tight transition-all duration-500 ease-out-expo group-hover:translate-y-[-2px]">
                {title}
              </h3>
              <p className="font-body text-[13px] text-phantom-text-secondary leading-relaxed transition-all duration-500 ease-out-expo group-hover:translate-y-[-2px]">
                {description}
              </p>
            </div>

            <div className="space-y-2">
              {features.map((feature, index) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 font-body text-[13px] text-phantom-text-secondary transition-all duration-500"
                  style={{
                    transform: isFlipped ? 'translateX(0)' : 'translateX(-10px)',
                    opacity: isFlipped ? 1 : 0,
                    transitionDelay: `${index * 80 + 200}ms`,
                  }}
                >
                  <ArrowRight className="h-3 w-3 text-phantom-lime shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {badge && (
            <div className="mt-4 border-t border-phantom-border-subtle pt-4 shrink-0">
              <div
                className={cn(
                  'group/badge relative -mx-1 flex items-center justify-between rounded-xl px-3 py-2.5',
                  'bg-phantom-black/40',
                  'transition-all duration-300',
                  'hover:bg-phantom-lime/10 hover:scale-[1.02] hover:cursor-default',
                )}
              >
                <span className="font-body text-[13px] font-medium text-phantom-text-primary transition-colors duration-300 group-hover/badge:text-phantom-lime">
                  {badge}
                </span>
                <div className="relative">
                  <div className="absolute inset-[-6px] rounded-lg bg-gradient-to-br from-phantom-lime/20 via-phantom-lime/10 to-transparent scale-90 opacity-0 transition-all duration-300 group-hover/badge:scale-100 group-hover/badge:opacity-100" />
                  <ArrowRight className="relative z-10 h-4 w-4 text-phantom-lime transition-all duration-300 group-hover/badge:translate-x-0.5 group-hover/badge:scale-110" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

PhaseFlipCard.displayName = 'PhaseFlipCard'
export default PhaseFlipCard
