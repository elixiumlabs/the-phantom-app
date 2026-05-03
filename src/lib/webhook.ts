import { httpsCallable } from 'firebase/functions'
import { fns } from './firebase'

export const generateWebhookKey = httpsCallable<
  { regenerate?: boolean },
  { webhook_key: string; webhook_url: string; message: string }
>(fns, 'generateWebhookKey')
