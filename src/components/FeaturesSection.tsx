import { memo, useRef } from 'react'
import { Target, Users, BarChart2, FileText, Shield, CheckSquare, MessageSquare, RefreshCw, Zap, TrendingUp, Download, EyeOff } from 'lucide-react'
import { motion, useInView } from 'framer-motion'

const FEATURES = [
  { icon: Target, title: 'Idea Stress Tester', body: 'Run your idea through a structured steelman analysis before you build a single thing.' },
  { icon: Users, title: 'Audience Specificity Engine', body: 'Sharpen a broad audience into the most underserved sub-segment with the most acute version of your problem.' },
  { icon: BarChart2, title: 'Signal Tracker', body: 'Track replies, conversions, and objections in one place. Only the three metrics that matter in the phantom phase.' },
  { icon: FileText, title: 'Offer Architecture Builder', body: 'Build and review your minimum offer structure with gap analysis before it hits the market.' },
  { icon: Shield, title: 'Proof Vault', body: 'Collect and organize testimonials, results, and case studies privately until your proof package is ready to deploy.' },
  { icon: CheckSquare, title: 'Lock-In Checklist', body: 'A hard gate between the phantom phase and public visibility. Every item must be checked before the brand goes live.' },
  { icon: MessageSquare, title: 'Outreach Templates', body: 'Cold outreach frameworks built for testing in niche communities. Problem-focused, non-promotional, and built to surface real buyers.' },
  { icon: RefreshCw, title: 'Iteration Log', body: 'Document every version of every offer with one variable tracked per cycle. Know exactly what you changed and what changed because of it.' },
  { icon: Zap, title: 'AI-Assisted Validation', body: 'Structured AI prompts built into each phase. Not generic ChatGPT. Purpose-built validation workflows that surface what you cannot see from inside your own idea.' },
  { icon: TrendingUp, title: 'Launch Readiness Score', body: 'A live score built from every phase condition: signals, conversions, proof, and messaging lock. You know exactly where you stand before you go public.' },
  { icon: Download, title: 'Brand Lock-In Export', body: 'When the phantom phase is complete, export a full brand kit — positioning, proof package, iteration history, and identity decisions — as a structured document ready to deploy.' },
  { icon: EyeOff, title: 'Zero Public Footprint', body: 'Nothing you build inside PHANTOM is visible externally. No public profile. No follower count. No performance. You are invisible until the proof says otherwise.' },
]

const FeaturesSection = memo(() => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="features" className="bg-[#080808] py-32 px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.p
          className="label text-phantom-lime mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          What's inside
        </motion.p>

        <motion.h2
          className="font-display font-bold text-[40px] text-phantom-text-primary leading-tight mb-16"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
        >
          Every tool the phantom phase needs.<br />
          Nothing it doesn't.
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, body }, i) => (
            <motion.div
              key={title}
              className="card"
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 + i * 0.05 }}
            >
              <Icon className="text-phantom-lime mb-4" size={20} />
              <h3 className="font-display font-semibold text-[16px] text-phantom-text-primary mb-2">{title}</h3>
              <p className="font-body text-[14px] text-phantom-text-secondary leading-relaxed">{body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
})

FeaturesSection.displayName = 'FeaturesSection'
export default FeaturesSection
