import { memo, useState } from 'react'
import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const FREE_FEATURES = [
  '1 active brand',
  'Phase 1 and 2 access',
  'Signal tracker (up to 30 entries)',
  'Basic offer builder',
  'Community outreach templates',
  '5 AI validation prompts per month',
]

const PRO_FEATURES = [
  'Unlimited active brands',
  'All four phases unlocked',
  'Full signal tracker',
  'Advanced offer architecture builder',
  'Proof vault with unlimited entries',
  'Full outreach template library',
  'Unlimited AI validation prompts',
  'Iteration log with variable tracking',
  'Lock-in checklist with export',
  'Priority support',
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut', delay },
})

const PricingSection = memo(() => {
  const [annual, setAnnual] = useState(false)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const proPrice = annual ? 37 : 44

  return (
    <section id="pricing" className="bg-[#080808] py-32 px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.p className="label text-phantom-lime mb-6 text-center" {...fadeUp(0)} animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}>
          Pricing
        </motion.p>

        <motion.h2
          className="font-display font-bold text-[40px] text-phantom-text-primary leading-tight mb-10 text-center"
          {...fadeUp(0.05)}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        >
          Two plans. Both built for<br />
          the phantom phase.
        </motion.h2>

        {/* Toggle */}
        <motion.div
          className="flex justify-center mb-12"
          {...fadeUp(0.1)}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        >
          <div
            className="flex items-center rounded-full p-1 gap-0"
            style={{ background: '#1a1a1a' }}
          >
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className="px-5 py-2 rounded-full font-ui text-[13px] font-medium transition-all duration-200"
              style={{
                background: !annual ? '#89F336' : 'transparent',
                color: !annual ? '#0a0a0a' : '#888888',
              }}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className="px-5 py-2 rounded-full font-ui text-[13px] font-medium transition-all duration-200 flex items-center gap-2"
              style={{
                background: annual ? '#89F336' : 'transparent',
                color: annual ? '#0a0a0a' : '#888888',
              }}
            >
              Annual
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm"
                style={{
                  background: annual ? 'rgba(0,0,0,0.2)' : '#142400',
                  color: annual ? '#0a0a0a' : '#89F336',
                }}
              >
                –20%
              </span>
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free */}
          <motion.div
            className="card"
            {...fadeUp(0.15)}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          >
            <h3 className="font-display font-bold text-[24px] text-phantom-text-primary mb-2">Phantom Free</h3>
            <p className="font-body text-[14px] text-phantom-text-secondary mb-6">Everything you need to test your first idea.</p>

            <div className="mb-6">
              <span className="font-code font-bold text-[40px] text-phantom-text-primary">$0</span>
              <span className="font-body text-[14px] text-phantom-text-secondary"> / month</span>
            </div>

            <ul className="space-y-3 mb-6">
              {FREE_FEATURES.map(feature => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="text-phantom-lime flex-shrink-0 mt-0.5" size={16} />
                  <span className="font-body text-[14px] text-phantom-text-secondary">{feature}</span>
                </li>
              ))}
            </ul>

            <Link to="/signup" className="btn-secondary w-full text-center">
              Start free
            </Link>
          </motion.div>

          {/* Pro */}
          <motion.div
            className="card border-phantom-lime relative"
            {...fadeUp(0.2)}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          >
            <div className="absolute -top-3 left-6">
              <span className="badge bg-phantom-lime text-phantom-black border-phantom-lime">Most used</span>
            </div>

            <h3 className="font-display font-bold text-[24px] text-phantom-text-primary mb-2">Phantom Pro</h3>
            <p className="font-body text-[14px] text-phantom-text-secondary mb-6">For founders serious about validating before they launch.</p>

            <div className="mb-6 flex items-end gap-2">
              <div>
                <span className="font-code font-bold text-[40px] text-phantom-text-primary">${proPrice}</span>
                <span className="font-body text-[14px] text-phantom-text-secondary"> / month</span>
              </div>
              {annual && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-body text-[13px] text-phantom-lime mb-1.5"
                >
                  billed annually
                </motion.span>
              )}
            </div>

            <ul className="space-y-3 mb-6">
              {PRO_FEATURES.map(feature => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="text-phantom-lime flex-shrink-0 mt-0.5" size={16} />
                  <span className="font-body text-[14px] text-phantom-text-secondary">{feature}</span>
                </li>
              ))}
            </ul>

            <Link to="/signup" className="btn-primary w-full text-center">
              Start Pro free for 14 days
            </Link>

            <p className="font-body text-[13px] text-phantom-text-muted text-center mt-3">
              Cancel anytime. No card required for trial.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
})

PricingSection.displayName = 'PricingSection'
export default PricingSection
