import type { VercelResponse } from '@vercel/node'
import { isApiError } from './auth'

export function handleError(res: VercelResponse, err: unknown): void {
  if (isApiError(err)) {
    res.status(err.status).json({ error: err.message })
  } else {
    console.error('Unhandled error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
