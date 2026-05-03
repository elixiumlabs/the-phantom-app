import { memo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Zap, Link as LinkIcon } from 'lucide-react'

const IntegrationsHelpPage = memo(() => {
  return (
    <div className="min-h-screen bg-phantom-black">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link to="/vault" className="inline-flex items-center gap-2 font-body text-[13px] text-phantom-lime hover:underline mb-8">
          <ArrowLeft size={14} /> Back to Proof Vault
        </Link>

        <h1 className="font-display font-bold text-[42px] text-phantom-text-primary mb-4">
          Connect Review Platforms
        </h1>
        <p className="font-body text-[18px] text-phantom-text-secondary mb-12">
          Auto-import testimonials and reviews into your Proof Vault
        </p>

        {/* One-Click Connect */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Zap size={24} className="text-phantom-lime" />
            <h2 className="font-display font-bold text-[28px] text-phantom-text-primary">
              One-Click Connect (OAuth)
            </h2>
          </div>
          
          <p className="font-body text-[16px] text-phantom-text-secondary mb-6">
            The easiest way to connect platforms. Click "Connect" → Authorize → Done. Reviews auto-import every hour.
          </p>

          <div className="space-y-8">
            {/* Typeform */}
            <div className="card">
              <h3 className="font-display font-semibold text-[20px] text-phantom-text-primary mb-3">
                Typeform
              </h3>
              <p className="font-body text-[14px] text-phantom-text-secondary mb-4">
                Import form responses as testimonials automatically.
              </p>
              <ol className="space-y-2 font-body text-[14px] text-phantom-text-secondary">
                <li className="flex gap-2">
                  <span className="text-phantom-lime font-semibold">1.</span>
                  <span>Click "Connect Typeform" in your Proof Vault</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-phantom-lime font-semibold">2.</span>
                  <span>Authorize Phantom to access your forms</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-phantom-lime font-semibold">3.</span>
                  <span>New responses automatically import as testimonials every hour</span>
                </li>
              </ol>
            </div>

            {/* Stripe */}
            <div className="card">
              <h3 className="font-display font-semibold text-[20px] text-phantom-text-primary mb-3">
                Stripe
              </h3>
              <p className="font-body text-[14px] text-phantom-text-secondary mb-4">
                Auto-import successful payments as revenue proof.
              </p>
              <ol className="space-y-2 font-body text-[14px] text-phantom-text-secondary">
                <li className="flex gap-2">
                  <span className="text-phantom-lime font-semibold">1.</span>
                  <span>Click "Connect Stripe" in your Proof Vault</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-phantom-lime font-semibold">2.</span>
                  <span>Authorize Phantom to read your payment data</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-phantom-lime font-semibold">3.</span>
                  <span>Successful charges import as revenue proof automatically</span>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* Webhook Integration */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <LinkIcon size={24} className="text-phantom-lime" />
            <h2 className="font-display font-bold text-[28px] text-phantom-text-primary">
              Webhook Integration (Advanced)
            </h2>
          </div>
          
          <p className="font-body text-[16px] text-phantom-text-secondary mb-6">
            Connect any platform using Zapier, Make, or n8n. Requires technical setup.
          </p>

          <div className="card mb-6">
            <h3 className="font-display font-semibold text-[20px] text-phantom-text-primary mb-4">
              Setup Steps
            </h3>
            <ol className="space-y-3 font-body text-[14px] text-phantom-text-secondary">
              <li className="flex gap-2">
                <span className="text-phantom-lime font-semibold">1.</span>
                <div>
                  <strong className="text-phantom-text-primary">Generate webhook credentials</strong>
                  <p className="text-[13px] mt-1">Go to Proof Vault → Connect reviews → Webhook (advanced) → Generate webhook URL</p>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-phantom-lime font-semibold">2.</span>
                <div>
                  <strong className="text-phantom-text-primary">Create automation</strong>
                  <p className="text-[13px] mt-1">In Zapier/Make/n8n, create a new workflow connecting your review platform</p>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-phantom-lime font-semibold">3.</span>
                <div>
                  <strong className="text-phantom-text-primary">Add webhook action</strong>
                  <p className="text-[13px] mt-1">Add a "Webhook POST" action with your webhook URL</p>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-phantom-lime font-semibold">4.</span>
                <div>
                  <strong className="text-phantom-text-primary">Configure headers</strong>
                  <p className="text-[13px] mt-1">Add header: <code className="text-phantom-lime bg-phantom-surface-dark px-2 py-0.5 rounded">x-phantom-webhook-key</code> with your webhook key</p>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-phantom-lime font-semibold">5.</span>
                <div>
                  <strong className="text-phantom-text-primary">Send JSON payload</strong>
                  <p className="text-[13px] mt-1">Format your data as JSON (see payload format below)</p>
                </div>
              </li>
            </ol>
          </div>

          <div className="card bg-phantom-surface-dark border-phantom-border-subtle">
            <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3">
              Webhook Payload Format
            </h3>
            <pre className="bg-phantom-black border border-phantom-border-subtle rounded-lg p-4 overflow-x-auto">
              <code className="font-mono text-[13px] text-phantom-lime">
{`{
  "project_id": "your-project-id",
  "proof_type": "testimonial",
  "title": "Customer Name",
  "content": "The testimonial quote...",
  "source": "Platform name",
  "amount": 1000,
  "date": "2024-01-15"
}`}
              </code>
            </pre>
            <div className="mt-4 space-y-2 font-body text-[13px] text-phantom-text-secondary">
              <p><strong className="text-phantom-text-primary">proof_type:</strong> testimonial | revenue | case_study | screenshot</p>
              <p><strong className="text-phantom-text-primary">title:</strong> Short title or name (required)</p>
              <p><strong className="text-phantom-text-primary">content:</strong> Main content/quote (required)</p>
              <p><strong className="text-phantom-text-primary">source:</strong> Where it came from (optional)</p>
              <p><strong className="text-phantom-text-primary">amount:</strong> Revenue amount in dollars (optional)</p>
              <p><strong className="text-phantom-text-primary">date:</strong> ISO date string (optional)</p>
            </div>
          </div>
        </section>

        {/* Example Integrations */}
        <section>
          <h2 className="font-display font-bold text-[28px] text-phantom-text-primary mb-6">
            Example Integrations
          </h2>
          
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-display font-semibold text-[16px] text-phantom-text-primary mb-2">
                Trustpilot → Phantom (via Zapier)
              </h3>
              <p className="font-body text-[13px] text-phantom-text-secondary">
                Trigger: New Trustpilot review → Action: Webhook POST to Phantom with review content
              </p>
            </div>

            <div className="card">
              <h3 className="font-display font-semibold text-[16px] text-phantom-text-primary mb-2">
                Google Reviews → Phantom (via Make)
              </h3>
              <p className="font-body text-[13px] text-phantom-text-secondary">
                Trigger: New Google review → Action: HTTP POST to Phantom webhook with review data
              </p>
            </div>

            <div className="card">
              <h3 className="font-display font-semibold text-[16px] text-phantom-text-primary mb-2">
                Gumroad → Phantom (via n8n)
              </h3>
              <p className="font-body text-[13px] text-phantom-text-secondary">
                Trigger: New Gumroad sale → Action: Webhook POST to Phantom with sale amount as revenue proof
              </p>
            </div>
          </div>
        </section>

        {/* Support */}
        <div className="mt-16 card bg-phantom-surface-dark border-phantom-lime/30">
          <p className="font-body text-[14px] text-phantom-text-secondary">
            <strong className="text-phantom-text-primary">Need help?</strong> Email{' '}
            <a href="mailto:support@thephantomapp.io" className="text-phantom-lime hover:underline">
              support@thephantomapp.io
            </a>
          </p>
        </div>
      </div>
    </div>
  )
})

IntegrationsHelpPage.displayName = 'IntegrationsHelpPage'
export default IntegrationsHelpPage
