import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'

// Initialize protection in production
if (import.meta.env.PROD) {
  // Disable console
  const noop = () => {}
  ;['log', 'debug', 'info', 'warn', 'error'].forEach(method => {
    (console as any)[method] = noop
  })

  // Block common scraping shortcuts
  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
      (e.ctrlKey && e.key.toLowerCase() === 'u')
    ) {
      e.preventDefault()
    }
  })

  // Disable right-click globally
  document.addEventListener('contextmenu', (e) => e.preventDefault())
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

