import { memo } from 'react'
import { motion } from 'framer-motion'
import NavigationDock from '@/components/NavigationDock'
import FooterSection from '@/components/FooterSection'

const RefundPolicyPage = memo(() => {
  return (
    <div className="relative min-h-screen bg-phantom-black">
      <NavigationDock />

      <main className="pt-24 pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <p className="label text-phantom-lime mb-4">Legal</p>
            <h1 className="font-display font-bold text-[40px] md:text-[56px] text-phantom-text-primary leading-tight mb-6">
              Refund Policy
            </h1>
            <p className="font-body text-[14px] text-phantom-text-muted mb-12">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </motion.div>

          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
          >
            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                14-Day Free Trial
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                Phantom Pro includes a 14-day free trial. No credit card is required to start your trial. You will only be charged if you choose to continue with a paid subscription after the trial period ends.
              </p>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                You may cancel your trial at any time during the 14-day period without being charged.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                30-Day Money-Back Guarantee
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                If you are not satisfied with Phantom Pro for any reason, you may request a full refund within 30 days of your initial purchase. This applies to both monthly and annual subscriptions.
              </p>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                To request a refund, contact us at <a href="mailto:support@phantom.app" className="text-phantom-lime hover:underline">support@phantom.app</a> with your account email and reason for the refund. Refunds are typically processed within 5-7 business days.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Subscription Cancellation
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                You may cancel your subscription at any time from your account settings. Upon cancellation:
              </p>
              <ul className="space-y-2 list-none p-0 mb-3">
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  You will retain access to Phantom Pro features until the end of your current billing period
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  You will not be charged for subsequent billing periods
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Your account will automatically downgrade to Phantom Free at the end of the billing period
                </li>
              </ul>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                Cancellations made after the 30-day refund window are not eligible for a refund, but you will continue to have access through the end of your paid period.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Annual Subscriptions
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                Annual subscriptions are billed once per year and are eligible for a full refund within 30 days of the initial purchase date.
              </p>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                After the 30-day refund window, annual subscriptions are non-refundable. However, you may cancel at any time and retain access until the end of your annual billing period.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Phantom Free
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                Phantom Free is a free tier with no charges. No refunds are applicable as there are no payments made.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Refund Processing
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                Approved refunds are processed within 5-7 business days and will be credited to the original payment method used for the purchase.
              </p>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                Please allow additional time for your bank or credit card company to process and post the refund to your account.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Exceptions
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                Refunds may be denied in cases of:
              </p>
              <ul className="space-y-2 list-none p-0 mb-3">
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Violation of our Terms of Service
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Fraudulent or abusive refund requests
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Requests made after the 30-day refund window
                </li>
              </ul>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                We reserve the right to refuse refunds at our discretion in cases of suspected abuse or violation of our policies.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Contact Us
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                If you have questions about our refund policy or need to request a refund, please contact us at{' '}
                <a href="mailto:support@phantom.app" className="text-phantom-lime hover:underline">
                  support@phantom.app
                </a>
                .
              </p>
            </section>

            <div className="pt-8 mt-8 border-t border-phantom-border-subtle">
              <p className="font-body text-[13px] text-phantom-text-muted leading-relaxed">
                This refund policy is subject to change. We will notify users of any material changes via email or through the platform. Continued use of Phantom after changes constitutes acceptance of the updated policy.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <FooterSection />
    </div>
  )
})

RefundPolicyPage.displayName = 'RefundPolicyPage'
export default RefundPolicyPage
