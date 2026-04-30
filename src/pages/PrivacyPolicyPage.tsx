import { memo } from 'react'
import { motion } from 'framer-motion'
import NavigationDock from '@/components/NavigationDock'
import FooterSection from '@/components/FooterSection'

const PrivacyPolicyPage = memo(() => {
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
              Privacy Policy
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
                Introduction
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                Phantom ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform and services.
              </p>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                By using Phantom, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, do not use our services.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Information We Collect
              </h2>
              
              <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3 mt-6">
                Information You Provide
              </h3>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                We collect information that you voluntarily provide when you:
              </p>
              <ul className="space-y-2 list-none p-0 mb-4">
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Create an account (name, email address, password)
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Use our services (brand information, project data, customer signals, proof vault content)
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Subscribe to a paid plan (billing information processed by our payment processor)
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Contact our support team (correspondence, feedback, support requests)
                </li>
              </ul>

              <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3 mt-6">
                Information Collected Automatically
              </h3>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                When you access our platform, we automatically collect certain information:
              </p>
              <ul className="space-y-2 list-none p-0 mb-4">
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Device information (IP address, browser type, operating system)
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Usage data (pages visited, features used, time spent, click patterns)
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Cookies and similar tracking technologies (see our Cookie Policy)
                </li>
              </ul>

              <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3 mt-6">
                Information from Third Parties
              </h3>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                We may receive information from third-party services you connect to Phantom, such as authentication providers (Google, GitHub) or payment processors (Stripe). We only collect the minimum information necessary to provide our services.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                How We Use Your Information
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                We use the information we collect to:
              </p>
              <ul className="space-y-2 list-none p-0">
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Provide, maintain, and improve our services
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Process transactions and send transaction notifications
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Send administrative information, updates, and security alerts
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Respond to your comments, questions, and support requests
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Analyze usage patterns to improve user experience
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Detect, prevent, and address technical issues or fraudulent activity
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Send marketing communications (only with your consent, and you can opt out anytime)
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Comply with legal obligations and enforce our terms
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                How We Share Your Information
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              
              <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3 mt-6">
                Service Providers
              </h3>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-4">
                We share information with third-party service providers who perform services on our behalf, such as:
              </p>
              <ul className="space-y-2 list-none p-0 mb-4">
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Cloud hosting providers (AWS, Google Cloud)
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Payment processors (Stripe)
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Email service providers
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Analytics providers
                </li>
              </ul>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-4">
                These providers are contractually obligated to protect your information and use it only for the purposes we specify.
              </p>

              <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3 mt-6">
                Legal Requirements
              </h3>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-4">
                We may disclose your information if required by law or in response to valid requests by public authorities (e.g., court orders, subpoenas, or government agencies).
              </p>

              <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3 mt-6">
                Business Transfers
              </h3>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                If Phantom is involved in a merger, acquisition, or sale of assets, your information may be transferred. We will notify you before your information becomes subject to a different privacy policy.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Data Security
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="space-y-2 list-none p-0 mb-3">
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Encryption in transit (TLS/SSL) and at rest
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Secure authentication and password hashing
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Regular security audits and monitoring
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Access controls and employee training
                </li>
              </ul>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Data Retention
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                We retain your information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. Specifically:
              </p>
              <ul className="space-y-2 list-none p-0 mb-3">
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Account information is retained while your account is active
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Project data is retained until you delete it or close your account
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Billing records are retained for 7 years for tax and accounting purposes
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Usage logs are retained for 90 days for security and analytics
                </li>
              </ul>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                When you delete your account, we will delete or anonymize your personal information within 30 days, except where we are required to retain it for legal or regulatory purposes.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Your Rights and Choices
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="space-y-2 list-none p-0 mb-3">
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  <span className="font-medium text-phantom-text-primary">Access:</span> Request a copy of the personal information we hold about you
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  <span className="font-medium text-phantom-text-primary">Correction:</span> Request correction of inaccurate or incomplete information
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  <span className="font-medium text-phantom-text-primary">Deletion:</span> Request deletion of your personal information
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  <span className="font-medium text-phantom-text-primary">Portability:</span> Request a copy of your data in a machine-readable format
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  <span className="font-medium text-phantom-text-primary">Opt-out:</span> Unsubscribe from marketing emails at any time
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  <span className="font-medium text-phantom-text-primary">Object:</span> Object to processing of your information for certain purposes
                </li>
              </ul>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                To exercise these rights, contact us at{' '}
                <a href="mailto:privacy@phantom.app" className="text-phantom-lime hover:underline">
                  privacy@phantom.app
                </a>
                . We will respond within 30 days.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                International Data Transfers
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Children's Privacy
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                Phantom is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately and we will delete it.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Third-Party Links
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any information.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Changes to This Policy
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of material changes by email or through a prominent notice on our platform. Your continued use of Phantom after changes become effective constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Contact Us
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="card bg-phantom-surface-dark">
                <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-2">
                  <span className="font-medium text-phantom-text-primary">Email:</span>{' '}
                  <a href="mailto:privacy@phantom.app" className="text-phantom-lime hover:underline">
                    privacy@phantom.app
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
                This privacy policy is effective as of the date stated at the top of this page. We reserve the right to modify this policy at any time, so please review it frequently.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <FooterSection />
    </div>
  )
})

PrivacyPolicyPage.displayName = 'PrivacyPolicyPage'
export default PrivacyPolicyPage
