import { memo, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import PhaseFlipCard from './PhaseFlipCard'

const PHASES = [
  {
    number: '01',
    title: 'Ghost Identity',
    subtitle: 'Define the problem and the working hypothesis. Nothing public yet.',
    description: 'Map the audience, the problem, and your unfair advantages. Build a working brand hypothesis that exists only inside Phantom.',
    features: [
      'Problem statement refiner',
      'Unfair advantage extractor',
      'Hypothesis positioning',
      'Audience language',
    ],
    badge: 'Start here',
  },
  {
    number: '02',
    title: 'Silent Test',
    subtitle: 'Present the minimum offer where the problem already lives.',
    description: 'Build the smallest version of the offer. Test it in real rooms. Track replies, conversions, and objections — ignore everything else.',
    features: [
      'Minimum offer builder',
      'Where-to-test finder',
      'Outreach generator',
      'Conversion tracker',
    ],
    badge: 'Validates demand',
  },
  {
    number: '03',
    title: 'Iteration Loop',
    subtitle: 'Fix what the data tells you. One variable at a time.',
    description: 'Diagnose what is failing. Change one variable. Document the result. No public pivots, no audience to manage — just market signal.',
    features: [
      'Offer diagnosis',
      'Single-variable suggester',
      'Iteration version log',
      'Objection response library',
    ],
    badge: 'Builds proof',
  },
  {
    number: '04',
    title: 'Lock In',
    subtitle: 'Repeatable conversions. Validated messaging. Surface with leverage.',
    description: 'Lock in positioning built from buyer language, not preference. Assemble the proof package. Export the brand guide. Now you go live.',
    features: [
      'Positioning from data',
      'Brand identity recommender',
      'Proof package curator',
      'Lock-in PDF export',
    ],
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
          className="font-display font-bold text-[40px] text-phantom-text-primary leading-tight mb-4"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
        >
          From ghost to live.<br />
          In the right order.
        </motion.h2>

        <motion.p
          className="font-body text-[15px] text-phantom-text-secondary max-w-xl mb-16"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
        >
          Hover any phase to see the apps inside it.
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PHASES.map((phase, i) => (
            <motion.div
              key={phase.number}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 + i * 0.08 }}
            >
              <PhaseFlipCard {...phase} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
})

HowItWorksSection.displayName = 'HowItWorksSection'
export default HowItWorksSection
