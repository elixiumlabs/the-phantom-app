import { memo, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Marquee } from '@/components/ui/marquee'

const TESTIMONIALS_ROW_1 = [
  {
    quote: 'Launched my first offer to crickets three times. The phantom phase gave me five paying clients before I posted a single thing publicly.',
    attr: 'M.K.',
    role: 'Digital Strategist',
  },
  {
    quote: 'I used to redesign my logo every time something didn\'t convert. Now I know it was never the logo.',
    attr: 'T.O.',
    role: 'Course Creator',
  },
  {
    quote: 'The lock-in checklist alone saved me from a $4,000 launch that had no validated demand behind it.',
    attr: 'A.R.',
    role: 'Consultant',
  },
  {
    quote: 'Three months in, I had real buyers lined up before my brand was even named. Phantom is how you build without gambling.',
    attr: 'J.P.',
    role: 'SaaS Founder',
  },
]

const TESTIMONIALS_ROW_2 = [
  {
    quote: 'Every tool I used before was built for public launches. Phantom is the only one built for the invisible phase — when everything is still being figured out.',
    attr: 'D.W.',
    role: 'Brand Strategist',
  },
  {
    quote: 'I had a conversion before I had a website. That\'s the phantom phase working exactly as designed.',
    attr: 'S.L.',
    role: 'Coach',
  },
  {
    quote: 'The Signal Tracker changed how I think about outreach. I stopped counting likes and started counting conversations.',
    attr: 'R.M.',
    role: 'Agency Owner',
  },
  {
    quote: 'Went from idea to five paid beta clients in six weeks — all without a single public post. This is the only way I\'ll ever launch again.',
    attr: 'C.B.',
    role: 'Product Designer',
  },
]

function TestimonialCard({ quote, attr, role }: { quote: string; attr: string; role: string }) {
  return (
    <div
      className="w-[340px] shrink-0 bg-phantom-surface border border-phantom-border-subtle rounded-2xl p-6"
    >
      <div className="font-display font-bold text-[36px] text-phantom-lime opacity-40 leading-none mb-3">"</div>
      <p className="font-body text-[14px] text-[#ccc] leading-relaxed mb-5">{quote}</p>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-phantom-lime/20 border border-phantom-lime/30 flex items-center justify-center">
          <span className="font-code text-[10px] text-phantom-lime font-bold">{attr[0]}</span>
        </div>
        <div>
          <p className="font-ui text-[12px] text-phantom-text-primary font-medium">{attr}</p>
          <p className="font-ui text-[11px] text-phantom-text-muted uppercase tracking-wider">{role}</p>
        </div>
      </div>
    </div>
  )
}

const TestimonialsSection = memo(() => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="bg-phantom-black py-32 overflow-hidden" ref={ref}>
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <motion.p
          className="label text-phantom-lime mb-4"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          From the phantom phase
        </motion.p>
        <motion.h2
          className="font-display font-bold text-[32px] text-phantom-text-primary leading-tight"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
        >
          Built invisible. Launched inevitable.
        </motion.h2>
      </div>

      <motion.div
        className="flex flex-col gap-4 relative"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
      >
        {/* fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10" style={{ background: 'linear-gradient(to right, #0a0a0a, transparent)' }} />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10" style={{ background: 'linear-gradient(to left, #0a0a0a, transparent)' }} />

        <Marquee duration={50} direction="left">
          {TESTIMONIALS_ROW_1.map(({ quote, attr, role }) => (
            <TestimonialCard key={attr} quote={quote} attr={attr} role={role} />
          ))}
        </Marquee>
        <Marquee duration={50} direction="right">
          {TESTIMONIALS_ROW_2.map(({ quote, attr, role }) => (
            <TestimonialCard key={attr} quote={quote} attr={attr} role={role} />
          ))}
        </Marquee>
      </motion.div>
    </section>
  )
})

TestimonialsSection.displayName = 'TestimonialsSection'
export default TestimonialsSection
