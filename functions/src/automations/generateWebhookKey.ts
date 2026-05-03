import * as admin from 'firebase-admin'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { randomBytes } from 'crypto'

/**
 * Generate or regenerate a webhook key for the authenticated user.
 * This key is used to authenticate incoming proof webhook requests.
 */
export const generateWebhookKey = onCall(
  { region: 'us-central1' },
  async (req) => {
    if (!req.auth) {
      throw new HttpsError('unauthenticated', 'Must be signed in')
    }

    const uid = req.auth.uid
    const regenerate = req.data?.regenerate === true

    // Generate a secure random key
    const webhookKey = `phantom_${randomBytes(32).toString('hex')}`

    // Update user document
    await admin.firestore().doc(`users/${uid}`).set(
      {
        webhook_key: webhookKey,
        webhook_key_generated_at: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    )

    return {
      webhook_key: webhookKey,
      webhook_url: `https://us-central1-the-phantom-app-io.cloudfunctions.net/proofWebhook`,
      message: regenerate ? 'Webhook key regenerated' : 'Webhook key generated',
    }
  }
)
