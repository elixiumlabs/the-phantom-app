import { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { obfuscateContent } from '@/lib/protection'

interface ProtectedContentProps {
  children: React.ReactNode
  watermark?: boolean
  disableSelect?: boolean
  className?: string
}

export function ProtectedContent({
  children,
  watermark = false,
  disableSelect = true,
  className = '',
}: ProtectedContentProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!ref.current || import.meta.env.DEV) return

    if (disableSelect) {
      obfuscateContent(ref.current)
    }

    // Add watermark overlay
    if (watermark && user) {
      const overlay = document.createElement('div')
      overlay.style.cssText = `
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: 0.02;
        font-size: 8px;
        color: #89F336;
        overflow: hidden;
        user-select: none;
      `
      overlay.textContent = `${user.uid} • ${new Date().toISOString()}`
      ref.current.appendChild(overlay)
    }
  }, [disableSelect, watermark, user])

  return (
    <div ref={ref} className={`relative ${className}`}>
      {children}
    </div>
  )
}
