import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { RESEND_API_KEY, sendMail } from '../lib/mailer'

/**
 * Send the welcome email when the bootstrapUser auth trigger lands the
 * users/{uid} doc. Decoupled from the v1 auth trigger so secrets work cleanly.
 */
export const sendWelcomeEmail = onDocumentCreated(
  { document: 'users/{uid}', region: 'us-central1', secrets: [RESEND_API_KEY] },
  async (event) => {
    const data = event.data?.data()
    const email = data?.email as string | undefined
    if (!email) return
    await sendMail(email, { template: 'welcome', data: {} })
  },
)
