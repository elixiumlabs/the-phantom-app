import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

export type Phase = 'identify' | 'test' | 'iterate' | 'lock' | 'complete'
export type SignalType = 'reply' | 'conversion' | 'objection' | 'no_response'
export type IterationStatus = 'testing' | 'complete' | 'abandoned'
export type ProofType = 'result' | 'testimonial' | 'case_study' | 'screenshot'

export interface Signal {
  id: string
  brandId: string
  type: SignalType
  source: string
  notes: string
  phase: Phase
  createdAt: string
}

export interface Iteration {
  id: string
  brandId: string
  iterationNumber: number
  variableChanged: string
  reason: string
  hypothesis: string
  outcome: string
  status: IterationStatus
  conversionRate: number
  createdAt: string
  completedAt?: string
}

export interface ProofItem {
  id: string
  brandId: string
  type: ProofType
  content: Record<string, string>
  phaseCollected: Phase
  createdAt: string
}

export interface Brand {
  id: string
  userId: string
  name: string
  currentPhase: Phase
  phase1Data: Record<string, unknown>
  phase2Data: Record<string, unknown>
  phase3Data: Record<string, unknown>
  phase4Data: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

interface BrandCtx {
  brands: Brand[]
  signals: Signal[]
  iterations: Iteration[]
  proofItems: ProofItem[]
  createBrand: (userId: string, name: string, problem: string, audience: string) => Brand
  updateBrand: (id: string, data: Partial<Brand>) => void
  deleteBrand: (id: string) => void
  addSignal: (s: Omit<Signal, 'id' | 'createdAt'>) => void
  updateSignal: (id: string, data: Partial<Signal>) => void
  deleteSignal: (id: string) => void
  addIteration: (it: Omit<Iteration, 'id' | 'createdAt'>) => void
  updateIteration: (id: string, data: Partial<Iteration>) => void
  addProofItem: (p: Omit<ProofItem, 'id' | 'createdAt'>) => void
  deleteProofItem: (id: string) => void
  getBrand: (id: string) => Brand | undefined
  getBrandSignals: (brandId: string) => Signal[]
  getBrandIterations: (brandId: string) => Iteration[]
  getBrandProof: (brandId: string) => ProofItem[]
}

const BrandContext = createContext<BrandCtx | null>(null)

function load<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? '') } catch { return fallback }
}

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brands, setBrands] = useState<Brand[]>(() => load('phantom_brands', []))
  const [signals, setSignals] = useState<Signal[]>(() => load('phantom_signals', []))
  const [iterations, setIterations] = useState<Iteration[]>(() => load('phantom_iterations', []))
  const [proofItems, setProofItems] = useState<ProofItem[]>(() => load('phantom_proof', []))

  useEffect(() => { localStorage.setItem('phantom_brands', JSON.stringify(brands)) }, [brands])
  useEffect(() => { localStorage.setItem('phantom_signals', JSON.stringify(signals)) }, [signals])
  useEffect(() => { localStorage.setItem('phantom_iterations', JSON.stringify(iterations)) }, [iterations])
  useEffect(() => { localStorage.setItem('phantom_proof', JSON.stringify(proofItems)) }, [proofItems])

  const createBrand = useCallback((userId: string, name: string, problem: string, audience: string): Brand => {
    const b: Brand = {
      id: crypto.randomUUID(),
      userId,
      name,
      currentPhase: 'identify',
      phase1Data: { problem, audience },
      phase2Data: {},
      phase3Data: {},
      phase4Data: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setBrands(prev => [...prev, b])
    return b
  }, [])

  const updateBrand = useCallback((id: string, data: Partial<Brand>) => {
    setBrands(prev => prev.map(b => b.id === id ? { ...b, ...data, updatedAt: new Date().toISOString() } : b))
  }, [])

  const deleteBrand = useCallback((id: string) => {
    setBrands(prev => prev.filter(b => b.id !== id))
    setSignals(prev => prev.filter(s => s.brandId !== id))
    setIterations(prev => prev.filter(i => i.brandId !== id))
    setProofItems(prev => prev.filter(p => p.brandId !== id))
  }, [])

  const addSignal = useCallback((s: Omit<Signal, 'id' | 'createdAt'>) => {
    setSignals(prev => [...prev, { ...s, id: crypto.randomUUID(), createdAt: new Date().toISOString() }])
  }, [])

  const updateSignal = useCallback((id: string, data: Partial<Signal>) => {
    setSignals(prev => prev.map(s => s.id === id ? { ...s, ...data } : s))
  }, [])

  const deleteSignal = useCallback((id: string) => {
    setSignals(prev => prev.filter(s => s.id !== id))
  }, [])

  const addIteration = useCallback((it: Omit<Iteration, 'id' | 'createdAt'>) => {
    setIterations(prev => [...prev, { ...it, id: crypto.randomUUID(), createdAt: new Date().toISOString() }])
  }, [])

  const updateIteration = useCallback((id: string, data: Partial<Iteration>) => {
    setIterations(prev => prev.map(i => i.id === id ? { ...i, ...data } : i))
  }, [])

  const addProofItem = useCallback((p: Omit<ProofItem, 'id' | 'createdAt'>) => {
    setProofItems(prev => [...prev, { ...p, id: crypto.randomUUID(), createdAt: new Date().toISOString() }])
  }, [])

  const deleteProofItem = useCallback((id: string) => {
    setProofItems(prev => prev.filter(p => p.id !== id))
  }, [])

  const getBrand = useCallback((id: string) => brands.find(b => b.id === id), [brands])
  const getBrandSignals = useCallback((brandId: string) => signals.filter(s => s.brandId === brandId), [signals])
  const getBrandIterations = useCallback((brandId: string) => iterations.filter(i => i.brandId === brandId), [iterations])
  const getBrandProof = useCallback((brandId: string) => proofItems.filter(p => p.brandId === brandId), [proofItems])

  return (
    <BrandContext.Provider value={{
      brands, signals, iterations, proofItems,
      createBrand, updateBrand, deleteBrand,
      addSignal, updateSignal, deleteSignal,
      addIteration, updateIteration,
      addProofItem, deleteProofItem,
      getBrand, getBrandSignals, getBrandIterations, getBrandProof,
    }}>
      {children}
    </BrandContext.Provider>
  )
}

export function useBrands() {
  const ctx = useContext(BrandContext)
  if (!ctx) throw new Error('useBrands must be used within BrandProvider')
  return ctx
}
