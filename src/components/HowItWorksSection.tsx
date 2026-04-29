import { memo, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const PHASES = [
  {
    number: '01',
    title: 'Ghost Identity',
    body: 'Define the problem, map your unfair advantages, and build a working brand hypothesis. Nothing is locked in. Everything is testable.',
    badge: 'Start here',
  },
  {
    number: '02',
    title: 'Silent Test',
    body: 'Present your minimum offer to real buyers in rooms where the problem already lives. Track replies, conversions, and objections. Ignore everything else.',
    badge: 'Validates demand',
  },
  {
    number: '03',
    title: 'Iteration Loop',
    body: 'Fix what the data tells you to fix. One variable at a time. No explaining pivots to an audience. Just building what the market is actually asking for.',
    badge: 'Builds proof',
  },
  {
    number: '04',
    title: 'Lock In',
    body: 'Repeatable conversions. Validated messaging. Proof package assembled. Now you go public with leverage instead of hope.',
    badge: 'Go live',
  },
]

const HowItWorksSection = memo(() => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="how-it-works" className="bg-phantom-black py-32 px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.p
          className="label text-phantom-lime mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          The four phases
        </motion.p>

        <motion.h2
          className="font-display font-bold text-[40px] text-phantom-text-primary leading-tight mb-16"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
        >
          From ghost to live.<br />
          In the right order.
        </motion.h2>

        {/* Desktop: horizontal stepper */}
        <div className="hidden md:block">
          {/* Connector row */}
          <div className="relative flex items-center justify-between mb-8 px-[calc(12.5%-1px)]">
            {/* Animated track line */}
            <motion.div
              className="absolute left-[12.5%] right-[12.5%] top-1/2 -translate-y-1/2 h-px bg-phantom-lime/20 origin-left"
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
            />
            <motion.div
              className="absolute left-[12.5%] right-[12.5%] top-1/2 -translate-y-1/2 h-px bg-phantom-lime origin-left"
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.5 }}
            />

            {/* Dots for each phase */}
            {PHASES.map((phase, i) => (
              <motion.div
                key={phase.number}
                className="relative z-10 flex flex-col items-center"
                style={{ width: '25%' }}
                initial={{ opacity: 0, scale: 0 }}
                animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut', delay: 0.5 + i * 0.18 }}
              >
                <div className="w-4 h-4 rounded-full bg-phantom-lime border-4 border-phantom-black shadow-[0_0_12px_rgba(214,255,0,0.6)]" />
              </motion.div>
            ))}
          </div>

          {/* Cards row */}
          <div className="grid grid-cols-4 gap-4">
            {PHASES.map(({ number, title, body, badge }, i) => (
              <motion.div
                key={number}
                className="card"
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 + i * 0.1 }}
              >
                <p className="font-code text-[13px] text-phantom-lime uppercase tracking-wider mb-2">Phase {number}</p>
                <h3 className="font-display font-semibold text-[20px] text-phantom-text-primary mb-3">{title}</h3>
                <p className="font-body text-[14px] text-phantom-text-secondary leading-relaxed mb-4">{body}</p>
                <span className="badge badge-active">{badge}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile: vertical stepper */}
        <div className="md:hidden flex flex-col gap-0">
          {PHASES.map(({ number, title, body, badge }, i) => (
            <div key={number} className="flex gap-4">
              {/* Left: dot + line */}
              <div className="flex flex-col items-center">
                <motion.div
                  className="w-4 h-4 rounded-full bg-phantom-lime border-4 border-phantom-black flex-shrink-0 shadow-[0_0_12px_rgba(214,255,0,0.6)]"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut', delay: 0.3 + i * 0.15 }}
                />
                {i < PHASES.length - 1 && (
                  <motion.div
                    className="w-px flex-1 bg-phantom-lime mt-1 mb-1 origin-top"
                    initial={{ scaleY: 0 }}
                    animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: 0.5 + i * 0.15 }}
                  />
                )}
              </div>

              {/* Right: card */}
              <motion.div
                className="card flex-1 mb-4"
                initial={{ opacity: 0, x: 16 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 16 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 + i * 0.1 }}
              >
                <p className="font-code text-[13px] text-phantom-lime uppercase tracking-wider mb-2">Phase {number}</p>
                <h3 className="font-display font-semibold text-[22px] text-phantom-text-primary mb-3">{title}</h3>
                <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-4">{body}</p>
                <span className="badge badge-active">{badge}</span>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})

HowItWorksSection.displayName = 'HowItWorksSection'
export default HowItWorksSection
