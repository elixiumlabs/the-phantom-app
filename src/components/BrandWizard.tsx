import { memo, useState } from 'react'
import { X, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useBrands } from '@/contexts/BrandContext'

interface Props {
  onClose: () => void
}

const STEPS = [
  {
    title: 'What problem are you trying to solve?',
    hint: 'Brain dump. No structure yet.',
    placeholder: 'Describe the problem you see...',
    multiline: true,
  },
  {
    title: 'Who has this problem most acutely?',
    hint: 'Describe the person, not a demographic.',
    placeholder: 'The specific person experiencing this...',
    multiline: true,
  },
  {
    title: 'What do you want to call this brand for now?',
    hint: 'You can change this anytime.',
    placeholder: 'Working name...',
    multiline: false,
  },
]

const BrandWizard = memo(({ onClose }: Props) => {
  const { user } = useAuth()
  const { createBrand } = useBrands()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [values, setValues] = useState(['', '', ''])
  const [creating, setCreating] = useState(false)

  const current = STEPS[step]
  const value = values[step]
  const canContinue = value.trim().length > 0

  const updateValue = (v: string) => {
    const next = [...values]
    next[step] = v
    setValues(next)
  }

  const handleNext = () => {
    if (step < 2) setStep(s => s + 1)
    else handleCreate()
  }

  const handleCreate = async () => {
    if (!user || !canContinue) return
    setCreating(true)
    const brand = createBrand(user.id, values[2].trim(), values[0].trim(), values[1].trim())
    navigate(`/brand/${brand.id}/identify`)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <motion.div
        className="card max-w-lg w-full"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="transition-all duration-300"
                style={{
                  width: i === step ? 24 : 8,
                  height: 4,
                  borderRadius: 2,
                  background: i <= step ? '#89F336' : '#222222',
                }}
              />
            ))}
          </div>
          <button
            onClick={onClose}
            className="text-phantom-text-muted hover:text-phantom-text-primary transition-colors"
            aria-label="Close wizard"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <p className="label text-phantom-lime mb-2">Step {step + 1} of 3</p>
            <h2 className="font-display font-bold text-[22px] text-phantom-text-primary mb-2 leading-tight">
              {current.title}
            </h2>
            <p className="font-body text-[13px] text-phantom-text-muted mb-5">{current.hint}</p>

            {current.multiline ? (
              <textarea
                className="input w-full"
                rows={4}
                placeholder={current.placeholder}
                value={value}
                onChange={e => updateValue(e.target.value)}
                autoFocus
              />
            ) : (
              <input
                className="input w-full"
                type="text"
                placeholder={current.placeholder}
                value={value}
                onChange={e => updateValue(e.target.value)}
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter' && canContinue) handleNext()
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="flex items-center justify-between mt-8">
          {step > 0 ? (
            <button className="btn-ghost" onClick={() => setStep(s => s - 1)}>
              Back
            </button>
          ) : (
            <span />
          )}

          <button
            className="btn-primary"
            onClick={handleNext}
            disabled={!canContinue || creating}
          >
            {creating
              ? 'Creating...'
              : step < 2
              ? <>Continue <ArrowRight size={14} /></>
              : 'Create brand →'
            }
          </button>
        </div>
      </motion.div>
    </div>
  )
})

BrandWizard.displayName = 'BrandWizard'
export default BrandWizard
