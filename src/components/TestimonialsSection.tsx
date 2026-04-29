import { memo, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const TESTIMONIALS = [
  {
    quote: 'Launched my first offer to crickets three times. The phantom phase gave me five paying clients before I posted a single thing publicly.',
    attr: 'M.K., Digital Strategist',
  },
  {
    quote: 'I used to redesign my logo every time something didn\'t convert. Now I know it was never the logo.',
    attr: 'T.O., Course Creator',
  },
  {
    quote: 'The lock-in checklist alone saved me from a $4,000 launch that had no validated demand behind it.',
    attr: 'A.R., Consultant',
  },
]

const TestimonialsSection = memo(() => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="bg-phantom-black py-32 px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.p
          className="label text-phantom-lime mb-16"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          From the phantom phase
        </motion.p>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ quote, attr }, i) => (
            <motion.div
              key={attr}
              className="card"
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 + i * 0.08 }}
            >
              <div className="font-display font-bold text-[48px] text-phantom-lime opacity-40 leading-none mb-4">"</div>
              <p className="font-body text-[16px] text-[#ccc] leading-relaxed mb-6">{quote}</p>
              <p className="font-ui text-[13px] text-phantom-text-muted uppercase tracking-wider">— {attr}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
})

TestimonialsSection.displayName = 'TestimonialsSection'
export default TestimonialsSection
