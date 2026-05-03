// Anti-scraping protection utilities

// Detect DevTools
export function detectDevTools(): boolean {
  const threshold = 160
  const widthThreshold = window.outerWidth - window.innerWidth > threshold
  const heightThreshold = window.outerHeight - window.innerHeight > threshold
  return widthThreshold || heightThreshold
}

// Monitor DevTools
export function monitorDevTools(callback: (isOpen: boolean) => void) {
  const check = () => {
    const isOpen = detectDevTools()
    callback(isOpen)
  }
  
  setInterval(check, 1000)
  window.addEventListener('resize', check)
}

// Disable right-click
export function disableRightClick(element?: HTMLElement) {
  const target = element || document
  target.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    return false
  })
}

// Disable text selection
export function disableTextSelection(element: HTMLElement) {
  element.style.userSelect = 'none'
  element.style.webkitUserSelect = 'none'
}

// Monitor copy events
export function monitorCopyEvents(callback: (text: string) => void) {
  document.addEventListener('copy', (e) => {
    const selection = window.getSelection()?.toString() || ''
    if (selection.length > 100) {
      callback(selection)
    }
  })
}

// Generate session fingerprint
export function generateFingerprint(): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return 'unknown'
  
  ctx.textBaseline = 'top'
  ctx.font = '14px Arial'
  ctx.fillText('phantom', 2, 2)
  
  return canvas.toDataURL().slice(-50)
}

// Detect automation tools
export function detectAutomation(): boolean {
  const checks = [
    // Check for webdriver
    !!(navigator as any).webdriver,
    // Check for common automation properties
    !!(window as any).__nightmare,
    !!(window as any).__selenium,
    !!(window as any).callPhantom,
    !!(window as any)._phantom,
    // Check for headless Chrome
    /HeadlessChrome/.test(navigator.userAgent),
  ]
  
  return checks.some(check => check === true)
}

// Add invisible watermark to text
export function watermarkText(text: string, userId: string): string {
  const timestamp = Date.now().toString(36)
  const marker = `\u200B${userId.slice(0, 8)}\u200B${timestamp}\u200B`
  return text + marker
}

// Obfuscate sensitive content
export function obfuscateContent(element: HTMLElement) {
  element.setAttribute('data-protected', 'true')
  element.style.webkitUserSelect = 'none'
  element.style.userSelect = 'none'
  element.setAttribute('unselectable', 'on')
  element.setAttribute('onselectstart', 'return false')
}

// Rate limit detection
let requestCount = 0
let lastReset = Date.now()

export function checkRateLimit(maxRequests = 100, windowMs = 60000): boolean {
  const now = Date.now()
  
  if (now - lastReset > windowMs) {
    requestCount = 0
    lastReset = now
  }
  
  requestCount++
  return requestCount > maxRequests
}

// Keyboard shortcut blocker
export function blockDevToolsShortcuts() {
  document.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12') {
      e.preventDefault()
      return false
    }
    
    // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
      e.preventDefault()
      return false
    }
    
    // Ctrl+U (view source)
    if (e.ctrlKey && e.key.toLowerCase() === 'u') {
      e.preventDefault()
      return false
    }
  })
}

// Console protection
export function protectConsole() {
  const noop = () => {}
  const methods = ['log', 'debug', 'info', 'warn', 'error'] as const
  
  // Only in production
  if (import.meta.env.PROD) {
    methods.forEach(method => {
      (console as any)[method] = noop
    })
  }
}

// Anti-debugging
export function antiDebug() {
  setInterval(() => {
    const start = performance.now()
    debugger
    const end = performance.now()
    
    // If debugger is open, this will take longer
    if (end - start > 100) {
      // Detected debugger
      window.location.href = '/'
    }
  }, 1000)
}
