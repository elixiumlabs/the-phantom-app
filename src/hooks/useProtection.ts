import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  monitorDevTools,
  disableRightClick,
  monitorCopyEvents,
  detectAutomation,
  blockDevToolsShortcuts,
  protectConsole,
  generateFingerprint,
} from '@/lib/protection'

export function useProtection(options: {
  disableRightClick?: boolean
  monitorCopy?: boolean
  blockDevTools?: boolean
  protectConsole?: boolean
} = {}) {
  const { user } = useAuth()

  useEffect(() => {
    // Only enable in production
    if (import.meta.env.DEV) return

    // Generate session fingerprint
    const fingerprint = generateFingerprint()
    sessionStorage.setItem('fp', fingerprint)

    // Detect automation
    if (detectAutomation()) {
      console.warn('Automation detected')
      // Log to analytics or backend
    }

    // Block DevTools shortcuts
    if (options.blockDevTools !== false) {
      blockDevToolsShortcuts()
    }

    // Protect console
    if (options.protectConsole !== false) {
      protectConsole()
    }

    // Disable right-click
    if (options.disableRightClick) {
      disableRightClick()
    }

    // Monitor copy events
    if (options.monitorCopy && user) {
      monitorCopyEvents((text) => {
        // Log suspicious copy activity
        console.warn('Large copy detected:', text.length, 'chars')
        // Could send to backend for monitoring
      })
    }

    // Monitor DevTools
    monitorDevTools((isOpen) => {
      if (isOpen) {
        // Log DevTools usage
        console.warn('DevTools detected')
      }
    })
  }, [user, options])
}
