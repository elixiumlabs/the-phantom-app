import { memo, useMemo, useRef, useState } from 'react'
import { Plus, Trash2, TrendingUp, MessageSquare, FileText, Camera, Filter, Upload, Loader, ExternalLink, Edit2, Link as LinkIcon, Copy, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { useProjects, type ProofVaultItem } from '@/contexts/ProjectContext'
import { useVault } from '@/hooks'
import { db } from '@/lib/firebase'
import { requestProofUploadUrl, getIntegrationAuthUrl } from '@/lib/functions'
import { generateWebhookKey } from '@/lib/webhook'
import AppSidebar from '@/components/app/AppSidebar'

type BackendProofType = ProofVaultItem['proof_type']

const TYPE_LABELS: Record<BackendProofType, string> = {
  revenue:              'Result',
  testimonial:          'Testimonial',
  case_study:           'Case Study',
  screenshot:           'Screenshot',
  conversion_data:      'Conversion Data',
  landing_page_test:    'Landing Page Test',
  ad_performance:       'Ad Performance',
  survey_data:          'Survey Data',
  preorder_campaign:    'Pre-order Campaign',
  competitor_analysis:  'Competitor Analysis',
  market_research:      'Market Research',
}

const TYPE_BADGE: Record<BackendProofType, string> = {
  revenue:              'badge badge-active',
  testimonial:          'badge',
  case_study:           'badge',
  screenshot:           'badge',
  conversion_data:      'badge',
  landing_page_test:    'badge badge-active',
  ad_performance:       'badge badge-active',
  survey_data:          'badge',
  preorder_campaign:    'badge badge-active',
  competitor_analysis:  'badge',
  market_research:      'badge',
}

const ALLOWED_FILE = /^(image\/.+|application\/pdf|text\/csv)$/

const VaultPage = memo(() => {
  const { user } = useAuth()
  const { projects } = useProjects()
  const { items, loading } = useVault()

  const userProjects = useMemo(
    () => projects.filter((p) => p.user_id === user?.id),
    [projects, user?.id],
  )

  const [typeFilter, setTypeFilter] = useState<BackendProofType | 'all'>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<ProofVaultItem | null>(null)
  const [formType, setFormType] = useState<BackendProofType>('testimonial')
  const [projectId, setProjectId] = useState(userProjects[0]?.id ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Per-type form state (text fields only — file is read from input ref)
  const [resultForm, setResultForm] = useState({ metric: '', context: '', date: '' })
  const [testimonialForm, setTestimonialForm] = useState({ quote: '', attribution: '', dateCollected: '' })
  const [caseForm, setCaseForm] = useState({ beforeState: '', whatWasDone: '', afterState: '', timeline: '' })
  const [screenshotForm, setScreenshotForm] = useState({ title: '', notes: '' })
  const [landingPageForm, setLandingPageForm] = useState({ conversionRate: '', visitors: '', signups: '', adSpend: '', context: '' })
  const [adPerformanceForm, setAdPerformanceForm] = useState({ platform: '', spend: '', impressions: '', clicks: '', conversions: '', ctr: '', cpa: '' })
  const [surveyForm, setSurveyForm] = useState({ question: '', responses: '', keyFinding: '', sampleSize: '' })
  const [preorderForm, setPreorderForm] = useState({ revenue: '', orders: '', avgOrderValue: '', timeframe: '', source: '' })
  const [competitorForm, setCompetitorForm] = useState({ competitor: '', finding: '', source: '', implication: '' })
  const [marketResearchForm, setMarketResearchForm] = useState({ topic: '', finding: '', source: '', date: '' })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showWebhook, setShowWebhook] = useState(false)
  const [integrationMode, setIntegrationMode] = useState<'oauth' | 'webhook'>('oauth')
  const [webhookData, setWebhookData] = useState<{ key: string; url: string } | null>(null)
  const [webhookLoading, setWebhookLoading] = useState(false)
  const [copied, setCopied] = useState<'key' | 'url' | null>(null)
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return items
      .filter((p) => typeFilter === 'all' || p.proof_type === typeFilter)
      .filter((p) => projectFilter === 'all' || p.project_id === projectFilter)
      .sort((a, b) => {
        const aTs = parseTs(a.created_at)
        const bTs = parseTs(b.created_at)
        return sortBy === 'newest' ? bTs - aTs : aTs - bTs
      })
  }, [items, typeFilter, projectFilter, sortBy])

  const counts = useMemo(
    () => ({
      revenue: items.filter((p) => p.proof_type === 'revenue').length,
      testimonial: items.filter((p) => p.proof_type === 'testimonial').length,
      case_study: items.filter((p) => p.proof_type === 'case_study').length,
      screenshot: items.filter((p) => p.proof_type === 'screenshot').length,
      conversion_data: items.filter((p) => p.proof_type === 'conversion_data').length,
    }),
    [items],
  )

  const getProjectName = (id: string) =>
    userProjects.find((p) => p.id === id)?.name ?? 'Unknown project'

  const resetForms = () => {
    setResultForm({ metric: '', context: '', date: '' })
    setTestimonialForm({ quote: '', attribution: '', dateCollected: '' })
    setCaseForm({ beforeState: '', whatWasDone: '', afterState: '', timeline: '' })
    setScreenshotForm({ title: '', notes: '' })
    setLandingPageForm({ conversionRate: '', visitors: '', signups: '', adSpend: '', context: '' })
    setAdPerformanceForm({ platform: '', spend: '', impressions: '', clicks: '', conversions: '', ctr: '', cpa: '' })
    setSurveyForm({ question: '', responses: '', keyFinding: '', sampleSize: '' })
    setPreorderForm({ revenue: '', orders: '', avgOrderValue: '', timeframe: '', source: '' })
    setCompetitorForm({ competitor: '', finding: '', source: '', implication: '' })
    setMarketResearchForm({ topic: '', finding: '', source: '', date: '' })
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setError(null)
    setEditingItem(null)
  }

  const canSubmit = () => {
    if (!projectId) return false
    if (submitting) return false
    if (formType === 'revenue') return resultForm.metric.trim().length > 0
    if (formType === 'testimonial') return testimonialForm.quote.trim().length > 0
    if (formType === 'case_study') return caseForm.beforeState.trim().length > 0
    if (formType === 'screenshot') return screenshotForm.title.trim().length > 0 && selectedFile !== null
    if (formType === 'landing_page_test') return landingPageForm.conversionRate.trim().length > 0
    if (formType === 'ad_performance') return adPerformanceForm.platform.trim().length > 0 && adPerformanceForm.spend.trim().length > 0
    if (formType === 'survey_data') return surveyForm.question.trim().length > 0 && surveyForm.keyFinding.trim().length > 0
    if (formType === 'preorder_campaign') return preorderForm.revenue.trim().length > 0
    if (formType === 'competitor_analysis') return competitorForm.competitor.trim().length > 0 && competitorForm.finding.trim().length > 0
    if (formType === 'market_research') return marketResearchForm.topic.trim().length > 0 && marketResearchForm.finding.trim().length > 0
    return false
  }

  const submit = async () => {
    if (!canSubmit() || !user) return
    setSubmitting(true)
    setError(null)

    try {
      if (editingItem) {
        // Update existing item
        const content = formatContent(formType, { resultForm, testimonialForm, caseForm, landingPageForm, adPerformanceForm, surveyForm, preorderForm, competitorForm, marketResearchForm })
        const amount =
          formType === 'revenue' && resultForm.metric ? extractAmount(resultForm.metric) : null
        const date =
          formType === 'revenue' ? resultForm.date :
          formType === 'testimonial' ? testimonialForm.dateCollected :
          null
        
        await updateDoc(doc(db, 'proof_vault', editingItem.id), {
          title: deriveTitle(formType, { resultForm, testimonialForm, caseForm, landingPageForm, adPerformanceForm, surveyForm, preorderForm, competitorForm, marketResearchForm }),
          content,
          amount,
          source: formType === 'testimonial' ? testimonialForm.attribution || null : null,
          date: date || null,
        })
      } else if (formType === 'screenshot' && selectedFile) {
        if (!ALLOWED_FILE.test(selectedFile.type)) {
          throw new Error(`Unsupported file type: ${selectedFile.type || 'unknown'}`)
        }
        const { upload_url } = await requestProofUploadUrl({
          project_id: projectId,
          proof_type: 'screenshot',
          filename: selectedFile.name,
          content_type: selectedFile.type,
          title: screenshotForm.title.trim() || undefined,
        })
        const res = await fetch(upload_url, {
          method: 'PUT',
          headers: {
            'Content-Type': selectedFile.type,
            'x-goog-meta-uid': user.id,
            'x-goog-meta-project-id': projectId,
            'x-goog-meta-proof-type': 'screenshot',
            'x-goog-meta-title': screenshotForm.title.trim() || '',
            'x-goog-meta-source': '',
            'x-goog-meta-amount': '',
          },
          body: selectedFile,
        })
        if (!res.ok) throw new Error(`Upload failed (${res.status})`)
        // The onFinalize trigger will create the proof_vault doc.
      } else {
        const content = formatContent(formType, { resultForm, testimonialForm, caseForm, landingPageForm, adPerformanceForm, surveyForm, preorderForm, competitorForm, marketResearchForm })
        const amount =
          formType === 'revenue' && resultForm.metric ? extractAmount(resultForm.metric) : null
        const date =
          formType === 'revenue' ? resultForm.date :
          formType === 'testimonial' ? testimonialForm.dateCollected :
          null
        await addDoc(collection(db, 'proof_vault'), {
          user_id: user.id,
          project_id: projectId,
          proof_type: formType,
          title: deriveTitle(formType, { resultForm, testimonialForm, caseForm, landingPageForm, adPerformanceForm, surveyForm, preorderForm, competitorForm, marketResearchForm }),
          content,
          amount,
          source: formType === 'testimonial' ? testimonialForm.attribution || null : null,
          date: date || null,
          tags: [],
          content_type: null,
          size: null,
          created_at: serverTimestamp(),
        })
      }

      resetForms()
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save proof item.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (item: ProofVaultItem) => {
    setEditingItem(item)
    setFormType(item.proof_type)
    setProjectId(item.project_id)
    
    // Populate forms based on type
    if (item.proof_type === 'revenue') {
      setResultForm({
        metric: item.title || '',
        context: item.content || '',
        date: item.date || '',
      })
    } else if (item.proof_type === 'testimonial') {
      setTestimonialForm({
        quote: item.content || '',
        attribution: item.source || '',
        dateCollected: item.date || '',
      })
    } else if (item.proof_type === 'case_study') {
      const parts = parseCaseStudy(item.content)
      setCaseForm({
        beforeState: parts.before || '',
        whatWasDone: parts.what || '',
        afterState: parts.after || '',
        timeline: parts.timeline || '',
      })
    } else if (item.proof_type === 'screenshot') {
      setScreenshotForm({
        title: item.title || '',
        notes: item.content || '',
      })
    }
    
    setShowForm(true)
  }

  const handleDelete = async (item: ProofVaultItem) => {
    if (!confirm('Delete this proof item?')) return
    try {
      await deleteDoc(doc(db, 'proof_vault', item.id))
    } catch (err) {
      console.error('[phantom] delete proof failed:', err)
    }
  }

  const handleGenerateWebhook = async () => {
    setWebhookLoading(true)
    try {
      const result = await generateWebhookKey({ regenerate: !!webhookData })
      setWebhookData({
        key: result.data.webhook_key,
        url: result.data.webhook_url,
      })
    } catch (err) {
      console.error('[phantom] webhook generation failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate webhook')
    } finally {
      setWebhookLoading(false)
    }
  }

  const copyToClipboard = async (text: string, type: 'key' | 'url') => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleConnectPlatform = async (platform: 'typeform' | 'stripe') => {
    if (!projectId || userProjects.length === 0) {
      setError('Please select a project first')
      return
    }
    
    setConnectingPlatform(platform)
    try {
      const result = await getIntegrationAuthUrl({ platform, project_id: projectId })
      window.location.href = result.auth_url
    } catch (err) {
      console.error('[phantom] integration auth failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to connect platform')
      setConnectingPlatform(null)
    }
  }

  return (
    <div className="flex min-h-screen bg-phantom-black">
      <AppSidebar />
      <main className="flex-1 ml-60 p-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-10">
            <div>
              <h1 className="font-display font-bold text-[28px] text-phantom-text-primary mb-1">
                Proof Vault
              </h1>
              <p className="font-body text-[14px] text-phantom-text-secondary">
                Every result, testimonial, and case study collected in private. The asset library for when phantom phase ends.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                className="btn-secondary"
                onClick={() => setShowWebhook(!showWebhook)}
              >
                <LinkIcon size={16} /> Connect reviews
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  if (userProjects.length === 0) return
                  setShowForm((v) => !v)
                  resetForms()
                  if (!projectId && userProjects[0]) setProjectId(userProjects[0].id)
                }}
                disabled={userProjects.length === 0}
              >
                <Plus size={16} /> Add proof
              </button>
            </div>
          </div>

          {userProjects.length === 0 && (
            <div className="card mb-6 border-phantom-border-subtle">
              <p className="font-body text-[14px] text-phantom-text-secondary">
                Create a project first — the vault stores proof against a specific phantom test.
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total proof items', val: items.length, icon: TrendingUp },
              { label: 'Results',           val: counts.revenue, icon: TrendingUp },
              { label: 'Testimonials',      val: counts.testimonial, icon: MessageSquare },
              { label: 'Case studies',      val: counts.case_study, icon: FileText },
            ].map(({ label, val, icon: Icon }) => (
              <div key={label} className="card">
                <Icon size={14} className="text-phantom-text-muted mb-3" />
                <p className="font-code text-[38px] text-phantom-lime font-bold leading-none mb-1">{val}</p>
                <p className="font-body text-[12px] text-phantom-text-muted">{label}</p>
              </div>
            ))}
          </div>

          {/* Connect Reviews Panel */}
          <AnimatePresence>
            {showWebhook && (
              <motion.div
                className="card mb-6 border-phantom-lime/30"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="label text-phantom-lime mb-2">Connect review platforms</p>
                    <p className="font-body text-[13px] text-phantom-text-secondary">
                      Auto-import testimonials and reviews from external platforms
                    </p>
                  </div>
                  <a
                    href="/help/integrations"
                    target="_blank"
                    className="font-body text-[12px] text-phantom-lime hover:underline flex items-center gap-1"
                  >
                    View documentation <ExternalLink size={12} />
                  </a>
                </div>

                {/* Toggle between OAuth and Webhook */}
                <div className="flex items-center gap-2 mb-6 p-1 bg-phantom-surface-dark rounded-lg w-fit">
                  <button
                    onClick={() => setIntegrationMode('oauth')}
                    className={`px-4 py-2 rounded font-ui text-[12px] transition-all ${
                      integrationMode === 'oauth'
                        ? 'bg-phantom-lime text-phantom-black font-semibold'
                        : 'text-phantom-text-muted hover:text-phantom-text-secondary'
                    }`}
                  >
                    One-click connect
                  </button>
                  <button
                    onClick={() => setIntegrationMode('webhook')}
                    className={`px-4 py-2 rounded font-ui text-[12px] transition-all ${
                      integrationMode === 'webhook'
                        ? 'bg-phantom-lime text-phantom-black font-semibold'
                        : 'text-phantom-text-muted hover:text-phantom-text-secondary'
                    }`}
                  >
                    Webhook (advanced)
                  </button>
                </div>

                {/* OAuth Mode */}
                {integrationMode === 'oauth' && (
                  <div>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      {[
                        { name: 'Typeform', desc: 'Import form responses as testimonials', available: true },
                        { name: 'Stripe', desc: 'Auto-import payment data as revenue proof', available: true },
                        { name: 'Google Forms', desc: 'Import testimonials from forms', available: false },
                        { name: 'Calendly', desc: 'Track consultation bookings', available: false },
                      ].map(({ name, desc, available }) => (
                        <div
                          key={name}
                          className="border border-phantom-border-subtle rounded-xl p-4 flex items-start justify-between"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-display font-semibold text-[14px] text-phantom-text-primary">
                                {name}
                              </p>
                              {!available && (
                                <span className="badge text-[9px]">Coming soon</span>
                              )}
                            </div>
                            <p className="font-body text-[12px] text-phantom-text-muted">{desc}</p>
                          </div>
                          <button
                            className={`btn-${available ? 'primary' : 'ghost'} text-[12px] py-2 px-3 ml-3`}
                            disabled={!available || connectingPlatform === name.toLowerCase()}
                            onClick={() => available && void handleConnectPlatform(name.toLowerCase() as 'typeform' | 'stripe')}
                          >
                            {connectingPlatform === name.toLowerCase() ? (
                              <><Loader size={12} className="animate-spin" /> Connecting...</>
                            ) : available ? 'Connect' : 'Soon'}
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="bg-phantom-surface-dark border border-phantom-border-subtle rounded-xl p-4">
                      <p className="font-body text-[12px] text-phantom-text-secondary">
                        <strong className="text-phantom-text-primary">How it works:</strong> Click Connect → Authorize access → Reviews auto-import every hour. No Zapier or webhooks needed.
                      </p>
                    </div>
                  </div>
                )}

                {/* Webhook Mode */}
                {integrationMode === 'webhook' && (
                  <div>
                    {!webhookData ? (
                      <button
                        className="btn-primary"
                        onClick={() => void handleGenerateWebhook()}
                        disabled={webhookLoading}
                      >
                        {webhookLoading ? (
                          <><Loader size={14} className="animate-spin" /> Generating...</>
                        ) : (
                          <><LinkIcon size={14} /> Generate webhook URL</>
                        )}
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="label text-phantom-text-secondary mb-2 block">Webhook URL</label>
                          <div className="flex gap-2">
                            <input
                              className="input flex-1 font-mono text-[12px]"
                              value={webhookData.url}
                              readOnly
                            />
                            <button
                              className="btn-secondary"
                              onClick={() => void copyToClipboard(webhookData.url, 'url')}
                            >
                              {copied === 'url' ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="label text-phantom-text-secondary mb-2 block">Webhook Key (keep secret)</label>
                          <div className="flex gap-2">
                            <input
                              className="input flex-1 font-mono text-[12px]"
                              value={webhookData.key}
                              readOnly
                              type="password"
                            />
                            <button
                              className="btn-secondary"
                              onClick={() => void copyToClipboard(webhookData.key, 'key')}
                            >
                              {copied === 'key' ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>

                        <div className="bg-phantom-surface-dark border border-phantom-border-subtle rounded-xl p-4">
                          <p className="font-ui text-[11px] text-phantom-lime uppercase tracking-wider mb-3">Setup instructions</p>
                          <ol className="space-y-2 font-body text-[13px] text-phantom-text-secondary">
                            <li className="flex gap-2">
                              <span className="text-phantom-lime">1.</span>
                              <span>Create a Zap/Scenario in your automation tool</span>
                            </li>
                            <li className="flex gap-2">
                              <span className="text-phantom-lime">2.</span>
                              <span>Connect your review platform (Trustpilot, Google Reviews, etc.)</span>
                            </li>
                            <li className="flex gap-2">
                              <span className="text-phantom-lime">3.</span>
                              <span>Add a Webhook POST action with the URL above</span>
                            </li>
                            <li className="flex gap-2">
                              <span className="text-phantom-lime">4.</span>
                              <span>Add header: <code className="text-phantom-lime">x-phantom-webhook-key</code> with your key</span>
                            </li>
                            <li className="flex gap-2">
                              <span className="text-phantom-lime">5.</span>
                              <span>Send JSON: <code className="text-phantom-lime">{'{ project_id, proof_type, title, content, source }'}</code></span>
                            </li>
                          </ol>
                        </div>

                        <button
                          className="btn-ghost text-[12px]"
                          onClick={() => void handleGenerateWebhook()}
                          disabled={webhookLoading}
                        >
                          Regenerate key
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add Proof Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                className="card mb-6 border-phantom-lime/30"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="label text-phantom-lime mb-4">{editingItem ? 'Edit proof item' : 'New proof item'}</p>

                <div className="grid md:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="label text-phantom-text-secondary mb-2 block">Proof type</label>
                    <select
                      className="input"
                      value={formType}
                      onChange={(e) => {
                        setFormType(e.target.value as BackendProofType)
                        resetForms()
                      }}
                      disabled={!!editingItem}
                    >
                      <option value="testimonial">Testimonial</option>
                      <option value="revenue">Result</option>
                      <option value="case_study">Case Study</option>
                      <option value="screenshot">Screenshot</option>
                      <option value="landing_page_test">Landing Page Test</option>
                      <option value="ad_performance">Ad Performance</option>
                      <option value="survey_data">Survey Data</option>
                      <option value="preorder_campaign">Pre-order Campaign</option>
                      <option value="competitor_analysis">Competitor Analysis</option>
                      <option value="market_research">Market Research</option>
                    </select>
                  </div>
                  <div>
                    <label className="label text-phantom-text-secondary mb-2 block">Project</label>
                    <select className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                      {userProjects.length === 0 ? (
                        <option value="">Create a project first</option>
                      ) : (
                        userProjects.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {formType === 'revenue' && (
                  <div className="space-y-4 mb-5">
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">The metric (specific and measurable)</label>
                      <input className="input" value={resultForm.metric} onChange={(e) => setResultForm((f) => ({ ...f, metric: e.target.value }))} placeholder="e.g. 3x revenue increase in 30 days, 40% time saved per week" />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Context</label>
                      <input className="input" value={resultForm.context} onChange={(e) => setResultForm((f) => ({ ...f, context: e.target.value }))} placeholder="Who achieved this result and in what situation" />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Date</label>
                      <input className="input" type="date" value={resultForm.date} onChange={(e) => setResultForm((f) => ({ ...f, date: e.target.value }))} />
                    </div>
                  </div>
                )}

                {formType === 'testimonial' && (
                  <div className="space-y-4 mb-5">
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Quote — their exact words</label>
                      <textarea className="input" rows={3} value={testimonialForm.quote} onChange={(e) => setTestimonialForm((f) => ({ ...f, quote: e.target.value }))} placeholder='"I went from X to Y in Z timeframe. The specific thing that made the difference was..."' />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Attribution</label>
                      <input className="input" value={testimonialForm.attribution} onChange={(e) => setTestimonialForm((f) => ({ ...f, attribution: e.target.value }))} placeholder="Name, title, or role — no last names required" />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Date collected</label>
                      <input className="input" type="date" value={testimonialForm.dateCollected} onChange={(e) => setTestimonialForm((f) => ({ ...f, dateCollected: e.target.value }))} />
                    </div>
                  </div>
                )}

                {formType === 'case_study' && (
                  <div className="space-y-4 mb-5">
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Before — what was their situation</label>
                      <textarea className="input" rows={2} value={caseForm.beforeState} onChange={(e) => setCaseForm((f) => ({ ...f, beforeState: e.target.value }))} placeholder="The specific problem, pain, or situation they were in" />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">What was done</label>
                      <textarea className="input" rows={2} value={caseForm.whatWasDone} onChange={(e) => setCaseForm((f) => ({ ...f, whatWasDone: e.target.value }))} placeholder="What you worked on or delivered together" />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">After — specific measurable result</label>
                      <textarea className="input" rows={2} value={caseForm.afterState} onChange={(e) => setCaseForm((f) => ({ ...f, afterState: e.target.value }))} placeholder="The outcome. Use numbers wherever possible." />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Timeline</label>
                      <input className="input" value={caseForm.timeline} onChange={(e) => setCaseForm((f) => ({ ...f, timeline: e.target.value }))} placeholder="e.g. 6 weeks, 3 months" />
                    </div>
                  </div>
                )}

                {formType === 'screenshot' && (
                  <div className="space-y-4 mb-5">
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">What this screenshot shows</label>
                      <input className="input" value={screenshotForm.title} onChange={(e) => setScreenshotForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Stripe dashboard showing $4,200 in week 1" />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Notes</label>
                      <textarea className="input" rows={2} value={screenshotForm.notes} onChange={(e) => setScreenshotForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Context, date, what it proves" />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">File (image, PDF, or CSV)</label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,application/pdf,text/csv"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                        className="block w-full text-[13px] text-phantom-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-phantom-border-subtle file:bg-phantom-black file:text-phantom-lime file:font-ui file:text-[12px] hover:file:border-phantom-lime/40 cursor-pointer"
                      />
                      {selectedFile && (
                        <p className="font-body text-[12px] text-phantom-text-muted mt-2">
                          {selectedFile.name} — {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {formType === 'landing_page_test' && (
                  <div className="space-y-4 mb-5">
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Conversion rate</label>
                      <input className="input" value={landingPageForm.conversionRate} onChange={(e) => setLandingPageForm((f) => ({ ...f, conversionRate: e.target.value }))} placeholder="e.g. 42% or 210/500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label text-phantom-text-secondary mb-2 block">Visitors</label>
                        <input className="input" value={landingPageForm.visitors} onChange={(e) => setLandingPageForm((f) => ({ ...f, visitors: e.target.value }))} placeholder="500" />
                      </div>
                      <div>
                        <label className="label text-phantom-text-secondary mb-2 block">Signups/Conversions</label>
                        <input className="input" value={landingPageForm.signups} onChange={(e) => setLandingPageForm((f) => ({ ...f, signups: e.target.value }))} placeholder="210" />
                      </div>
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Ad spend (optional)</label>
                      <input className="input" value={landingPageForm.adSpend} onChange={(e) => setLandingPageForm((f) => ({ ...f, adSpend: e.target.value }))} placeholder="$200" />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Context</label>
                      <textarea className="input" rows={2} value={landingPageForm.context} onChange={(e) => setLandingPageForm((f) => ({ ...f, context: e.target.value }))} placeholder="Target audience, traffic source, test duration" />
                    </div>
                  </div>
                )}

                {formType === 'ad_performance' && (
                  <div className="space-y-4 mb-5">
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Platform</label>
                      <input className="input" value={adPerformanceForm.platform} onChange={(e) => setAdPerformanceForm((f) => ({ ...f, platform: e.target.value }))} placeholder="Facebook, Google, LinkedIn, etc." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label text-phantom-text-secondary mb-2 block">Total spend</label>
                        <input className="input" value={adPerformanceForm.spend} onChange={(e) => setAdPerformanceForm((f) => ({ ...f, spend: e.target.value }))} placeholder="$200" />
                      </div>
                      <div>
                        <label className="label text-phantom-text-secondary mb-2 block">Conversions</label>
                        <input className="input" value={adPerformanceForm.conversions} onChange={(e) => setAdPerformanceForm((f) => ({ ...f, conversions: e.target.value }))} placeholder="42" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="label text-phantom-text-secondary mb-2 block">Impressions</label>
                        <input className="input" value={adPerformanceForm.impressions} onChange={(e) => setAdPerformanceForm((f) => ({ ...f, impressions: e.target.value }))} placeholder="10,000" />
                      </div>
                      <div>
                        <label className="label text-phantom-text-secondary mb-2 block">Clicks</label>
                        <input className="input" value={adPerformanceForm.clicks} onChange={(e) => setAdPerformanceForm((f) => ({ ...f, clicks: e.target.value }))} placeholder="500" />
                      </div>
                      <div>
                        <label className="label text-phantom-text-secondary mb-2 block">CTR %</label>
                        <input className="input" value={adPerformanceForm.ctr} onChange={(e) => setAdPerformanceForm((f) => ({ ...f, ctr: e.target.value }))} placeholder="5%" />
                      </div>
                    </div>
                  </div>
                )}

                {formType === 'survey_data' && (
                  <div className="space-y-4 mb-5">
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Survey question</label>
                      <input className="input" value={surveyForm.question} onChange={(e) => setSurveyForm((f) => ({ ...f, question: e.target.value }))} placeholder="What question did you ask?" />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Key finding</label>
                      <textarea className="input" rows={2} value={surveyForm.keyFinding} onChange={(e) => setSurveyForm((f) => ({ ...f, keyFinding: e.target.value }))} placeholder="The most important insight from responses" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label text-phantom-text-secondary mb-2 block">Sample size</label>
                        <input className="input" value={surveyForm.sampleSize} onChange={(e) => setSurveyForm((f) => ({ ...f, sampleSize: e.target.value }))} placeholder="150 responses" />
                      </div>
                      <div>
                        <label className="label text-phantom-text-secondary mb-2 block">Response summary</label>
                        <input className="input" value={surveyForm.responses} onChange={(e) => setSurveyForm((f) => ({ ...f, responses: e.target.value }))} placeholder="73% said yes" />
                      </div>
                    </div>
                  </div>
                )}

                {formType === 'preorder_campaign' && (
                  <div className="space-y-4 mb-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label text-phantom-text-secondary mb-2 block">Total revenue</label>
                        <input className="input" value={preorderForm.revenue} onChange={(e) => setPreorderForm((f) => ({ ...f, revenue: e.target.value }))} placeholder="$8,400" />
                      </div>
                      <div>
                        <label className="label text-phantom-text-secondary mb-2 block">Number of orders</label>
                        <input className="input" value={preorderForm.orders} onChange={(e) => setPreorderForm((f) => ({ ...f, orders: e.target.value }))} placeholder="84" />
                      </div>
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Average order value</label>
                      <input className="input" value={preorderForm.avgOrderValue} onChange={(e) => setPreorderForm((f) => ({ ...f, avgOrderValue: e.target.value }))} placeholder="$100" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label text-phantom-text-secondary mb-2 block">Timeframe</label>
                        <input className="input" value={preorderForm.timeframe} onChange={(e) => setPreorderForm((f) => ({ ...f, timeframe: e.target.value }))} placeholder="2 weeks" />
                      </div>
                      <div>
                        <label className="label text-phantom-text-secondary mb-2 block">Traffic source</label>
                        <input className="input" value={preorderForm.source} onChange={(e) => setPreorderForm((f) => ({ ...f, source: e.target.value }))} placeholder="Organic, paid ads, etc." />
                      </div>
                    </div>
                  </div>
                )}

                {formType === 'competitor_analysis' && (
                  <div className="space-y-4 mb-5">
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Competitor name</label>
                      <input className="input" value={competitorForm.competitor} onChange={(e) => setCompetitorForm((f) => ({ ...f, competitor: e.target.value }))} placeholder="Company or product name" />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Key finding</label>
                      <textarea className="input" rows={3} value={competitorForm.finding} onChange={(e) => setCompetitorForm((f) => ({ ...f, finding: e.target.value }))} placeholder="What did you learn? Pricing, positioning, gaps, etc." />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Source</label>
                      <input className="input" value={competitorForm.source} onChange={(e) => setCompetitorForm((f) => ({ ...f, source: e.target.value }))} placeholder="Website, reviews, customer interviews, etc." />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Implication for your brand</label>
                      <textarea className="input" rows={2} value={competitorForm.implication} onChange={(e) => setCompetitorForm((f) => ({ ...f, implication: e.target.value }))} placeholder="How does this inform your positioning or strategy?" />
                    </div>
                  </div>
                )}

                {formType === 'market_research' && (
                  <div className="space-y-4 mb-5">
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Research topic</label>
                      <input className="input" value={marketResearchForm.topic} onChange={(e) => setMarketResearchForm((f) => ({ ...f, topic: e.target.value }))} placeholder="What were you researching?" />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Key finding</label>
                      <textarea className="input" rows={3} value={marketResearchForm.finding} onChange={(e) => setMarketResearchForm((f) => ({ ...f, finding: e.target.value }))} placeholder="The most important insight or data point" />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Source</label>
                      <input className="input" value={marketResearchForm.source} onChange={(e) => setMarketResearchForm((f) => ({ ...f, source: e.target.value }))} placeholder="Report, study, database, etc." />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Date</label>
                      <input className="input" type="date" value={marketResearchForm.date} onChange={(e) => setMarketResearchForm((f) => ({ ...f, date: e.target.value }))} />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-phantom-danger/10 border border-phantom-danger/30 rounded-lg p-3 mb-4">
                    <p className="font-body text-[13px] text-phantom-danger">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button className="btn-primary" onClick={() => void submit()} disabled={!canSubmit()}>
                    {submitting ? (
                      <><Loader size={14} className="animate-spin" /> {editingItem ? 'Updating...' : 'Saving...'}</>
                    ) : formType === 'screenshot' && !editingItem ? (
                      <><Upload size={14} /> Upload to vault</>
                    ) : (
                      editingItem ? 'Update' : 'Save to vault'
                    )}
                  </button>
                  <button className="btn-ghost" onClick={() => { setShowForm(false); resetForms(); }} disabled={submitting}>Cancel</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters + Sort */}
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={14} className="text-phantom-text-muted shrink-0" />
              {(['all', 'revenue', 'testimonial', 'case_study', 'screenshot'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`font-ui text-[12px] px-3 py-1.5 rounded-full border transition-all duration-150 ${
                    typeFilter === t
                      ? 'border-phantom-lime text-phantom-lime bg-phantom-lime/10'
                      : 'border-phantom-border text-phantom-text-muted hover:border-[#333] hover:text-phantom-text-secondary'
                  }`}
                >
                  {t === 'all' ? 'All' : TYPE_LABELS[t]}
                  {t !== 'all' && (
                    <span className="ml-1.5 opacity-50">{counts[t as keyof typeof counts]}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {userProjects.length > 1 && (
                <select className="input text-[13px] py-1.5 w-auto min-w-[140px]" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
                  <option value="all">All projects</option>
                  {userProjects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
              <select className="input text-[13px] py-1.5 w-auto" value={sortBy} onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>

          {/* Empty / list */}
          {loading ? (
            <div className="card text-center py-16">
              <Loader size={20} className="animate-spin text-phantom-text-muted mx-auto mb-3" />
              <p className="font-body text-[14px] text-phantom-text-secondary">Loading vault...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card text-center py-16">
              <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-[#0a1900] border border-phantom-lime/30">
                <TrendingUp size={20} className="text-phantom-lime" />
              </div>
              <h3 className="font-display font-bold text-[18px] text-phantom-text-primary mb-2">
                Vault is empty.
              </h3>
              <p className="font-body text-[14px] text-phantom-text-secondary mb-6 max-w-sm mx-auto">
                Start uploading proof. Every result, every conversion, every testimonial belongs here.
              </p>
              <button
                className="btn-primary mx-auto"
                onClick={() => setShowForm(true)}
                disabled={userProjects.length === 0}
              >
                <Plus size={14} /> Add proof
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((item) => (
                <motion.div
                  key={item.id}
                  className="card card-interactive group relative"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-phantom-text-muted hover:text-phantom-lime transition-colors"
                      aria-label="Edit"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => void handleDelete(item)}
                      className="text-phantom-text-muted hover:text-phantom-danger transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className={TYPE_BADGE[item.proof_type]}>{TYPE_LABELS[item.proof_type]}</span>
                    <span className="font-body text-[11px] text-phantom-text-muted">{getProjectName(item.project_id)}</span>
                  </div>

                  <ProofCard item={item} />

                  <p className="font-body text-[11px] text-phantom-text-muted mt-4 pt-3 border-t border-phantom-border-subtle">
                    {formatDate(item.created_at)}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
})

VaultPage.displayName = 'VaultPage'
export default VaultPage

function ProofCard({ item }: { item: ProofVaultItem }) {
  if (item.proof_type === 'revenue') {
    return (
      <>
        <p className="font-code font-bold text-[18px] text-phantom-lime leading-tight mb-2">{item.title || item.content}</p>
        {item.content && item.title && item.content !== item.title && (
          <p className="font-body text-[13px] text-phantom-text-secondary">{item.content}</p>
        )}
      </>
    )
  }
  if (item.proof_type === 'testimonial') {
    return (
      <>
        <p className="font-display text-[28px] text-phantom-lime opacity-30 leading-none mb-1">"</p>
        <p className="font-body text-[14px] text-phantom-text-primary leading-relaxed mb-3 line-clamp-4">{item.content || item.title}</p>
        {item.source && (
          <p className="font-ui text-[11px] text-phantom-text-muted uppercase tracking-wider">— {item.source}</p>
        )}
      </>
    )
  }
  if (item.proof_type === 'case_study') {
    const parts = parseCaseStudy(item.content)
    return (
      <div className="space-y-3">
        {parts.before && (
          <div>
            <p className="font-body text-[10px] text-phantom-text-muted uppercase tracking-wider mb-1">Before</p>
            <p className="font-body text-[13px] text-phantom-text-secondary line-clamp-2">{parts.before}</p>
          </div>
        )}
        {parts.after && (
          <div>
            <p className="font-body text-[10px] text-phantom-lime uppercase tracking-wider mb-1">After</p>
            <p className="font-body text-[13px] text-phantom-text-primary line-clamp-2">{parts.after}</p>
          </div>
        )}
        {parts.timeline && (
          <p className="font-body text-[11px] text-phantom-text-muted">Timeline: {parts.timeline}</p>
        )}
      </div>
    )
  }
  if (item.proof_type === 'screenshot') {
    return (
      <>
        <div className="flex items-center justify-center w-full h-24 bg-[#0d0d0d] border border-phantom-border-subtle rounded-xl mb-3">
          <Camera size={20} className="text-phantom-text-muted" />
        </div>
        <p className="font-body text-[14px] text-phantom-text-primary mb-1">{item.title || 'Screenshot'}</p>
        {item.content && <p className="font-body text-[12px] text-phantom-text-muted line-clamp-2">{item.content}</p>}
        {item.file_url && (
          <p className="font-body text-[11px] text-phantom-text-muted mt-2 inline-flex items-center gap-1">
            <ExternalLink size={11} /> File stored
          </p>
        )}
      </>
    )
  }
  return <p className="font-body text-[13px] text-phantom-text-secondary">{item.title || item.content}</p>
}

function formatContent(
  type: BackendProofType,
  forms: {
    resultForm: { metric: string; context: string; date: string }
    testimonialForm: { quote: string; attribution: string; dateCollected: string }
    caseForm: { beforeState: string; whatWasDone: string; afterState: string; timeline: string }
    landingPageForm?: { conversionRate: string; visitors: string; signups: string; adSpend: string; context: string }
    adPerformanceForm?: { platform: string; spend: string; impressions: string; clicks: string; conversions: string; ctr: string; cpa: string }
    surveyForm?: { question: string; responses: string; keyFinding: string; sampleSize: string }
    preorderForm?: { revenue: string; orders: string; avgOrderValue: string; timeframe: string; source: string }
    competitorForm?: { competitor: string; finding: string; source: string; implication: string }
    marketResearchForm?: { topic: string; finding: string; source: string; date: string }
  },
): string {
  if (type === 'revenue') {
    return forms.resultForm.context.trim() || forms.resultForm.metric.trim()
  }
  if (type === 'testimonial') {
    return forms.testimonialForm.quote.trim()
  }
  if (type === 'case_study') {
    return JSON.stringify({
      before: forms.caseForm.beforeState.trim(),
      what: forms.caseForm.whatWasDone.trim(),
      after: forms.caseForm.afterState.trim(),
      timeline: forms.caseForm.timeline.trim(),
    })
  }
  if (type === 'landing_page_test' && forms.landingPageForm) {
    return JSON.stringify({
      conversionRate: forms.landingPageForm.conversionRate.trim(),
      visitors: forms.landingPageForm.visitors.trim(),
      signups: forms.landingPageForm.signups.trim(),
      adSpend: forms.landingPageForm.adSpend.trim(),
      context: forms.landingPageForm.context.trim(),
    })
  }
  if (type === 'ad_performance' && forms.adPerformanceForm) {
    return JSON.stringify({
      platform: forms.adPerformanceForm.platform.trim(),
      spend: forms.adPerformanceForm.spend.trim(),
      impressions: forms.adPerformanceForm.impressions.trim(),
      clicks: forms.adPerformanceForm.clicks.trim(),
      conversions: forms.adPerformanceForm.conversions.trim(),
      ctr: forms.adPerformanceForm.ctr.trim(),
    })
  }
  if (type === 'survey_data' && forms.surveyForm) {
    return JSON.stringify({
      question: forms.surveyForm.question.trim(),
      responses: forms.surveyForm.responses.trim(),
      keyFinding: forms.surveyForm.keyFinding.trim(),
      sampleSize: forms.surveyForm.sampleSize.trim(),
    })
  }
  if (type === 'preorder_campaign' && forms.preorderForm) {
    return JSON.stringify({
      revenue: forms.preorderForm.revenue.trim(),
      orders: forms.preorderForm.orders.trim(),
      avgOrderValue: forms.preorderForm.avgOrderValue.trim(),
      timeframe: forms.preorderForm.timeframe.trim(),
      source: forms.preorderForm.source.trim(),
    })
  }
  if (type === 'competitor_analysis' && forms.competitorForm) {
    return JSON.stringify({
      competitor: forms.competitorForm.competitor.trim(),
      finding: forms.competitorForm.finding.trim(),
      source: forms.competitorForm.source.trim(),
      implication: forms.competitorForm.implication.trim(),
    })
  }
  if (type === 'market_research' && forms.marketResearchForm) {
    return JSON.stringify({
      topic: forms.marketResearchForm.topic.trim(),
      finding: forms.marketResearchForm.finding.trim(),
      source: forms.marketResearchForm.source.trim(),
      date: forms.marketResearchForm.date.trim(),
    })
  }
  return ''
}

function deriveTitle(
  type: BackendProofType,
  forms: {
    resultForm: { metric: string; context: string; date: string }
    testimonialForm: { quote: string; attribution: string; dateCollected: string }
    caseForm: { beforeState: string; whatWasDone: string; afterState: string; timeline: string }
    landingPageForm?: { conversionRate: string; visitors: string; signups: string; adSpend: string; context: string }
    adPerformanceForm?: { platform: string; spend: string; impressions: string; clicks: string; conversions: string; ctr: string; cpa: string }
    surveyForm?: { question: string; responses: string; keyFinding: string; sampleSize: string }
    preorderForm?: { revenue: string; orders: string; avgOrderValue: string; timeframe: string; source: string }
    competitorForm?: { competitor: string; finding: string; source: string; implication: string }
    marketResearchForm?: { topic: string; finding: string; source: string; date: string }
  },
): string {
  if (type === 'revenue') return forms.resultForm.metric.trim()
  if (type === 'testimonial') return forms.testimonialForm.attribution.trim() || 'Testimonial'
  if (type === 'case_study') return forms.caseForm.beforeState.trim().slice(0, 80)
  if (type === 'landing_page_test' && forms.landingPageForm) return `${forms.landingPageForm.conversionRate} conversion rate`
  if (type === 'ad_performance' && forms.adPerformanceForm) return `${forms.adPerformanceForm.platform} - ${forms.adPerformanceForm.conversions} conversions`
  if (type === 'survey_data' && forms.surveyForm) return forms.surveyForm.question.trim().slice(0, 80)
  if (type === 'preorder_campaign' && forms.preorderForm) return `${forms.preorderForm.revenue} in pre-orders`
  if (type === 'competitor_analysis' && forms.competitorForm) return forms.competitorForm.competitor.trim()
  if (type === 'market_research' && forms.marketResearchForm) return forms.marketResearchForm.topic.trim()
  return ''
}

function parseCaseStudy(content: string): { before?: string; what?: string; after?: string; timeline?: string } {
  if (!content) return {}
  try {
    const parsed = JSON.parse(content)
    if (parsed && typeof parsed === 'object') return parsed
  } catch {
    // fall through — treat as plain text
  }
  return { before: content }
}

function extractAmount(metric: string): number | null {
  const match = metric.match(/\$?\s*([\d,]+(?:\.\d+)?)/)
  if (!match) return null
  const num = parseFloat(match[1].replace(/,/g, ''))
  return Number.isFinite(num) ? num : null
}

function parseTs(value: unknown): number {
  if (!value) return 0
  if (typeof value === 'string') {
    const t = Date.parse(value)
    return Number.isNaN(t) ? 0 : t
  }
  if (typeof value === 'object' && value !== null) {
    const v = value as { toDate?: () => Date; seconds?: number }
    if (typeof v.toDate === 'function') return v.toDate().getTime()
    if (typeof v.seconds === 'number') return v.seconds * 1000
  }
  return 0
}

function formatDate(value: unknown): string {
  const ts = parseTs(value)
  if (!ts) return ''
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
