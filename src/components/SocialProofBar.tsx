import { memo, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const STATS = [
  { number: '2,400+', label: 'founders in the phantom phase' },
  { number: '91%', label: 'validate demand before launch' },
  { number: '4', label: 'phases from ghost to live' },
  { number: '0', label: 'public posts required to test' },
  { number: '3.2x', label: 'higher conversion at launch' },
]

const SocialProofBar = memo(() => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <section className="bg-[#0d0d0d] border-t border-b border-phantom-border-subtle py-8" ref={ref}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {STATS.map(({ number, label }, i) => (
            <motion.div
              key={label}
              className="flex items-center gap-12"
              initial={{ opacity: 0, y: 8 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: 0.35, ease: 'easeOut', delay: i * 0.06 }}
            >
              <div className="text-center">
                <p className="font-code font-bold text-[28px] text-phantom-lime leading-none mb-1">{number}</p>
                <p className="font-body text-[13px] text-phantom-text-muted">{label}</p>
              </div>
              {i < STATS.length - 1 && (
                <div className="hidden lg:block w-px h-12 bg-[#1e1e1e]" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
})

SocialProofBar.displayName = 'SocialProofBar'
export default SocialProofBar
