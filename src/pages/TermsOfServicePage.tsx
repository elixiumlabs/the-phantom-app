import { memo } from 'react'
import { motion } from 'framer-motion'
import NavigationDock from '@/components/NavigationDock'
import FooterSection from '@/components/FooterSection'

const TermsOfServicePage = memo(() => {
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
              Terms of Service
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
                Agreement to Terms
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                These Terms of Service ("Terms") constitute a legally binding agreement between you and Phantom ("Company," "we," "us," or "our") concerning your access to and use of the Phantom platform and services.
              </p>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                By accessing or using our services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use our services.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Eligibility
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                You must be at least 18 years old to use Phantom. By using our services, you represent and warrant that:
              </p>
              <ul className="space-y-2 list-none p-0">
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  You are at least 18 years of age
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  You have the legal capacity to enter into these Terms
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  You will comply with these Terms and all applicable laws
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  All information you provide is accurate and current
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Account Registration
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                To access certain features, you must create an account. You agree to:
              </p>
              <ul className="space-y-2 list-none p-0 mb-3">
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Provide accurate, complete, and current information
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Maintain the security of your password and account
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Notify us immediately of any unauthorized access
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Be responsible for all activity under your account
                </li>
              </ul>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent, abusive, or illegal activity.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Subscription Plans and Billing
              </h2>
              
              <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3 mt-6">
                Free Trial
              </h3>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-4">
                Phantom Pro includes a 14-day free trial. No credit card is required. You will not be charged unless you choose to continue with a paid subscription after the trial ends.
              </p>

              <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3 mt-6">
                Paid Subscriptions
              </h3>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                By subscribing to a paid plan, you agree to pay all applicable fees. Subscriptions automatically renew unless canceled before the renewal date.
              </p>
              <ul className="space-y-2 list-none p-0 mb-4">
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Monthly subscriptions renew every 30 days
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Annual subscriptions renew every 12 months
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Prices are subject to change with 30 days notice
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  All fees are non-refundable except as stated in our Refund Policy
                </li>
              </ul>

              <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3 mt-6">
                Payment Processing
              </h3>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-4">
                Payments are processed by third-party payment processors (Stripe). You agree to provide accurate payment information and authorize us to charge your payment method for all fees incurred.
              </p>

              <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3 mt-6">
                Cancellation
              </h3>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                You may cancel your subscription at any time from your account settings. Cancellation takes effect at the end of your current billing period. No refunds are provided for partial billing periods.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Acceptable Use Policy
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                You agree not to use Phantom to:
              </p>
              <ul className="space-y-2 list-none p-0">
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Violate any laws, regulations, or third-party rights
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Transmit harmful, offensive, or illegal content
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Impersonate others or misrepresent your affiliation
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Interfere with or disrupt the services or servers
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Attempt to gain unauthorized access to any systems
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Use automated tools to scrape or extract data
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Reverse engineer, decompile, or disassemble the platform
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Resell or redistribute the services without authorization
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Upload viruses, malware, or malicious code
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Engage in spam, phishing, or fraudulent activities
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Intellectual Property Rights
              </h2>
              
              <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3 mt-6">
                Our Content
              </h3>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-4">
                All content, features, and functionality of Phantom, including but not limited to text, graphics, logos, software, and design, are owned by Phantom and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written permission.
              </p>

              <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3 mt-6">
                Your Content
              </h3>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                You retain ownership of all content you create, upload, or store on Phantom ("User Content"). By using our services, you grant us a limited, non-exclusive, royalty-free license to:
              </p>
              <ul className="space-y-2 list-none p-0 mb-4">
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Host, store, and display your User Content
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Process and analyze your User Content to provide services
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Make backups and ensure service reliability
                </li>
              </ul>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                You represent and warrant that you own or have the necessary rights to all User Content and that it does not violate any third-party rights or applicable laws.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Privacy and Data Protection
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                Your use of Phantom is also governed by our Privacy Policy. By using our services, you consent to the collection, use, and disclosure of your information as described in the Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Disclaimers and Limitations of Liability
              </h2>
              
              <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3 mt-6">
                Service Availability
              </h3>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-4">
                Phantom is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that the services will be uninterrupted, error-free, or secure. We reserve the right to modify, suspend, or discontinue any part of the services at any time without notice.
              </p>

              <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3 mt-6">
                No Warranty
              </h3>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-4">
                We make no warranties regarding the accuracy, reliability, or completeness of any content or information provided through Phantom. We do not guarantee any specific results from using our services.
              </p>

              <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3 mt-6">
                Limitation of Liability
              </h3>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                To the maximum extent permitted by law, Phantom and its affiliates, officers, employees, and agents shall not be liable for:
              </p>
              <ul className="space-y-2 list-none p-0 mb-4">
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Any indirect, incidental, special, or consequential damages
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Loss of profits, revenue, data, or business opportunities
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Damages resulting from unauthorized access to your account
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Damages arising from third-party content or services
                </li>
              </ul>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                Our total liability to you for all claims arising from your use of Phantom shall not exceed the amount you paid us in the 12 months preceding the claim, or $100, whichever is greater.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Indemnification
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                You agree to indemnify, defend, and hold harmless Phantom and its affiliates from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the services, your User Content, or your violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Termination
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                We may suspend or terminate your account and access to Phantom at any time, with or without notice, for:
              </p>
              <ul className="space-y-2 list-none p-0 mb-3">
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Violation of these Terms
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Fraudulent, abusive, or illegal activity
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Non-payment of fees
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Extended periods of inactivity
                </li>
              </ul>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                Upon termination, your right to use Phantom immediately ceases. We may delete your account and User Content, though we may retain certain information as required by law or for legitimate business purposes.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Dispute Resolution
              </h2>
              
              <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3 mt-6">
                Informal Resolution
              </h3>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-4">
                Before filing a claim, you agree to contact us at{' '}
                <a href="mailto:legal@phantom.app" className="text-phantom-lime hover:underline">
                  legal@phantom.app
                </a>{' '}
                to attempt to resolve the dispute informally. We will attempt to resolve disputes in good faith.
              </p>

              <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3 mt-6">
                Arbitration
              </h3>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-4">
                If informal resolution fails, any dispute arising from these Terms or your use of Phantom shall be resolved through binding arbitration, except where prohibited by law. You waive your right to a jury trial or to participate in a class action lawsuit.
              </p>

              <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3 mt-6">
                Governing Law
              </h3>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                These Terms are governed by and construed in accordance with the laws of the United States, without regard to conflict of law principles.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Changes to Terms
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify you of material changes via email or through a prominent notice on our platform. Your continued use of Phantom after changes become effective constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                General Provisions
              </h2>
              <ul className="space-y-3 list-none p-0">
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                  <span className="font-medium text-phantom-text-primary">Entire Agreement:</span> These Terms, together with our Privacy Policy and Refund Policy, constitute the entire agreement between you and Phantom.
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                  <span className="font-medium text-phantom-text-primary">Severability:</span> If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full effect.
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                  <span className="font-medium text-phantom-text-primary">Waiver:</span> Our failure to enforce any right or provision of these Terms does not constitute a waiver of that right or provision.
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                  <span className="font-medium text-phantom-text-primary">Assignment:</span> You may not assign or transfer these Terms without our written consent. We may assign these Terms without restriction.
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                  <span className="font-medium text-phantom-text-primary">Force Majeure:</span> We are not liable for any failure to perform due to circumstances beyond our reasonable control.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Contact Us
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                If you have questions about these Terms, please contact us:
              </p>
              <div className="card bg-phantom-surface-dark">
                <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-2">
                  <span className="font-medium text-phantom-text-primary">Legal:</span>{' '}
                  <a href="mailto:legal@phantom.app" className="text-phantom-lime hover:underline">
                    legal@phantom.app
                  </a>
                </p>
                <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                  <span className="font-medium text-phantom-text-primary">Support:</span>{' '}
                  <a href="mailto:support@phantom.app" className="text-phantom-lime hover:underline">
                    support@phantom.app
                  </a>
                </p>
              </div>
            </section>

            <div className="pt-8 mt-8 border-t border-phantom-border-subtle">
              <p className="font-body text-[13px] text-phantom-text-muted leading-relaxed">
                By using Phantom, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <FooterSection />
    </div>
  )
})

TermsOfServicePage.displayName = 'TermsOfServicePage'
export default TermsOfServicePage
