import { memo } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Clock, Activity } from 'lucide-react'
import NavigationDock from '@/components/NavigationDock'
import FooterSection from '@/components/FooterSection'

const SERVICES = [
  { name: 'Platform API', status: 'operational', uptime: '99.99%' },
  { name: 'Authentication', status: 'operational', uptime: '100%' },
  { name: 'Database', status: 'operational', uptime: '99.98%' },
  { name: 'File Storage', status: 'operational', uptime: '99.97%' },
  { name: 'AI Assistant', status: 'operational', uptime: '99.95%' },
  { name: 'Email Delivery', status: 'operational', uptime: '99.99%' },
  { name: 'Payment Processing', status: 'operational', uptime: '100%' },
  { name: 'Analytics', status: 'operational', uptime: '99.96%' },
]

const INCIDENTS = [
  {
    date: 'Jan 15, 2025',
    title: 'Scheduled Maintenance',
    status: 'resolved',
    description: 'Database optimization and performance improvements. All services were restored within the maintenance window.',
    duration: '45 minutes',
  },
  {
    date: 'Jan 8, 2025',
    title: 'Elevated API Response Times',
    status: 'resolved',
    description: 'Brief increase in API response times due to traffic spike. Auto-scaling resolved the issue within 12 minutes.',
    duration: '12 minutes',
  },
  {
    date: 'Dec 28, 2024',
    title: 'Email Delivery Delays',
    status: 'resolved',
    description: 'Transactional emails experienced delays due to third-party provider issues. All emails were delivered successfully.',
    duration: '2 hours',
  },
]

const METRICS = [
  { label: 'Uptime (30 days)', value: '99.98%', icon: Activity },
  { label: 'Avg Response Time', value: '124ms', icon: Clock },
  { label: 'Incidents (30 days)', value: '0', icon: AlertCircle },
]

const SystemStatusPage = memo(() => {
  const allOperational = SERVICES.every(s => s.status === 'operational')

  return (
    <div className="relative min-h-screen bg-phantom-black">
      <NavigationDock />

      <main className="pt-24 pb-32 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <p className="label text-phantom-lime mb-4">System Status</p>
            <h1 className="font-display font-bold text-[48px] md:text-[64px] text-phantom-text-primary leading-tight mb-6">
              All systems operational.
            </h1>
            <p className="font-body text-[16px] text-phantom-text-secondary max-w-xl mx-auto">
              Real-time status of Phantom services and infrastructure. Updated every 60 seconds.
            </p>
          </motion.div>

          {/* Overall Status */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
          >
            <div className={`card ${allOperational ? 'border-phantom-lime/20 bg-phantom-lime/5' : 'border-red-500/20 bg-red-500/5'}`}>
              <div className="flex items-center gap-4">
                {allOperational ? (
                  <CheckCircle className="text-phantom-lime" size={32} />
                ) : (
                  <AlertCircle className="text-red-500" size={32} />
                )}
                <div>
                  <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-1">
                    {allOperational ? 'All Systems Operational' : 'Service Disruption'}
                  </h2>
                  <p className="font-body text-[14px] text-phantom-text-secondary">
                    {allOperational 
                      ? 'All services are running normally with no known issues.'
                      : 'We are experiencing issues with some services. Our team is investigating.'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Metrics */}
          <motion.div
            className="grid md:grid-cols-3 gap-6 mb-16"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 }}
          >
            {METRICS.map(({ label, value, icon: Icon }) => (
              <div key={label} className="card text-center">
                <Icon className="text-phantom-lime mx-auto mb-3" size={28} />
                <p className="font-code text-[32px] font-bold text-phantom-text-primary mb-1">{value}</p>
                <p className="font-ui text-[13px] text-phantom-text-muted uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </motion.div>

          {/* Services */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
          >
            <h2 className="font-display font-bold text-[28px] text-phantom-text-primary mb-6">
              Service Status
            </h2>
            <div className="space-y-3">
              {SERVICES.map(({ name, status, uptime }, i) => (
                <motion.div
                  key={name}
                  className="card"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut', delay: 0.25 + i * 0.03 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {status === 'operational' ? (
                        <CheckCircle className="text-phantom-lime" size={20} />
                      ) : (
                        <AlertCircle className="text-red-500" size={20} />
                      )}
                      <span className="font-ui text-[15px] text-phantom-text-primary font-medium">
                        {name}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="font-body text-[13px] text-phantom-text-muted">
                        {uptime} uptime
                      </span>
                      <span className={`font-ui text-[13px] font-medium ${
                        status === 'operational' ? 'text-phantom-lime' : 'text-red-500'
                      }`}>
                        {status === 'operational' ? 'Operational' : 'Degraded'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Incident History */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
          >
            <h2 className="font-display font-bold text-[28px] text-phantom-text-primary mb-6">
              Incident History
            </h2>
            <div className="space-y-4">
              {INCIDENTS.map(({ date, title, status, description, duration }, i) => (
                <motion.div
                  key={date + title}
                  className="card"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut', delay: 0.35 + i * 0.05 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-body text-[13px] text-phantom-text-muted mb-1">{date}</p>
                      <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary">
                        {title}
                      </h3>
                    </div>
                    <span className="badge badge-active text-[11px]">
                      {status}
                    </span>
                  </div>
                  <p className="font-body text-[14px] text-phantom-text-secondary leading-relaxed mb-2">
                    {description}
                  </p>
                  <p className="font-body text-[13px] text-phantom-text-muted">
                    Duration: {duration}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Subscribe */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.45 }}
          >
            <div className="card bg-phantom-surface-dark text-center">
              <h3 className="font-display font-bold text-[22px] text-phantom-text-primary mb-3">
                Get status updates
              </h3>
              <p className="font-body text-[14px] text-phantom-text-secondary mb-6">
                Subscribe to receive notifications when incidents occur or are resolved.
              </p>
              <div className="flex items-center gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="input flex-1"
                />
                <button className="btn-primary">
                  Subscribe
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <FooterSection />
    </div>
  )
})

SystemStatusPage.displayName = 'SystemStatusPage'
export default SystemStatusPage
