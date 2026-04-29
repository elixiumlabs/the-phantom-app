import { memo, useRef } from 'react'
import { Megaphone, TrendingDown, Lock } from 'lucide-react'
import { motion, useInView } from 'framer-motion'

const PROBLEMS = [
  {
    icon: Megaphone,
    title: 'Audience before proof',
    body: 'An audience that watched you build is an audience optimized for entertainment. They don\'t convert. They observe.',
  },
  {
    icon: TrendingDown,
    title: 'Dirty data',
    body: 'Support likes are not purchase signals. Every \'this is amazing\' from a follower is noise hiding the real conversion number.',
  },
  {
    icon: Lock,
    title: 'Locked into a story',
    body: 'Every public pivot costs you credibility. Every failed launch is documented. The phantom phase eliminates all of that.',
  },
]

const ProblemSection = memo(() => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="bg-phantom-black py-32 px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.p
          className="label text-phantom-danger mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          The real cost of building in public
        </motion.p>

        <motion.h2
          className="font-display font-bold text-[40px] text-phantom-text-primary leading-tight max-w-3xl mb-16"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
        >
          You announced it before you built it.<br />
          Now you're performing a business<br />
          that doesn't exist yet.
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6">
          {PROBLEMS.map(({ icon: Icon, title, body }, i) => (
            <motion.div
              key={title}
              className="card"
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 + i * 0.08 }}
            >
              <Icon className="text-phantom-danger mb-4" size={24} />
              <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3">{title}</h3>
              <p className="font-body text-[16px] text-phantom-text-secondary leading-relaxed">{body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
})

ProblemSection.displayName = 'ProblemSection'
export default ProblemSection
