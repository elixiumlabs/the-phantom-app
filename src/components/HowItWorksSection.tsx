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

        <div className="grid md:grid-cols-2 gap-6 relative">
          <div className="hidden md:block absolute left-8 top-0 bottom-0 w-px bg-phantom-lime" />

          {PHASES.map(({ number, title, body, badge }, i) => (
            <motion.div
              key={number}
              className="card relative"
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 + i * 0.07 }}
            >
              <div className="hidden md:block absolute -left-[49px] top-8 w-3 h-3 rounded-full bg-phantom-lime border-4 border-phantom-black" />
              <p className="font-code text-[13px] text-phantom-lime uppercase tracking-wider mb-2">Phase {number}</p>
              <h3 className="font-display font-semibold text-[24px] text-phantom-text-primary mb-3">{title}</h3>
              <p className="font-body text-[16px] text-phantom-text-secondary leading-relaxed mb-4">{body}</p>
              <span className="badge badge-active">{badge}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
})

HowItWorksSection.displayName = 'HowItWorksSection'
export default HowItWorksSection
