import * as admin from 'firebase-admin'
import { onRequest } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions/v2'
import { defineSecret } from 'firebase-functions/params'

const TYPEFORM_CLIENT_ID = defineSecret('TYPEFORM_CLIENT_ID')
const TYPEFORM_CLIENT_SECRET = defineSecret('TYPEFORM_CLIENT_SECRET')
const STRIPE_CLIENT_SECRET = defineSecret('STRIPE_CLIENT_SECRET')

/**
 * OAuth callback handler for all platform integrations
 */
export const integrationCallback = onRequest(
  {
    region: 'us-central1',
    secrets: [TYPEFORM_CLIENT_ID, TYPEFORM_CLIENT_SECRET, STRIPE_CLIENT_SECRET],
  },
  async (req, res) => {
    const { code, state, error } = req.query

    if (error) {
      logger.error('OAuth error', { error })
      res.redirect(`https://the-phantom-app-io.web.app/vault?error=${error}`)
      return
    }

    if (!code || !state) {
      res.status(400).send('Missing code or state')
      return
    }

    // Decode state
    let stateData: { uid: string; project_id: string; platform: string; timestamp: number }
    try {
      stateData = JSON.parse(Buffer.from(state as string, 'base64url').toString())
    } catch (err) {
      logger.error('Invalid state token', { error: err })
      res.status(400).send('Invalid state')
      return
    }

    const { uid, project_id, platform } = stateData

    // Verify project ownership
    const projectRef = admin.firestore().doc(`projects/${project_id}`)
    const projectSnap = await projectRef.get()
    if (!projectSnap.exists || projectSnap.data()?.user_id !== uid) {
      res.status(403).send('Unauthorized')
      return
    }

    const redirectUri = `https://us-central1-the-phantom-app-io.cloudfunctions.net/integrationCallback`

    try {
      let accessToken = ''
      let refreshToken = ''
      let expiresAt = 0

      switch (platform) {
        case 'typeform': {
          const tokenResponse = await fetch('https://api.typeform.com/oauth/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              code: code as string,
              client_id: TYPEFORM_CLIENT_ID.value(),
              client_secret: TYPEFORM_CLIENT_SECRET.value(),
              redirect_uri: redirectUri,
            }),
          })

          if (!tokenResponse.ok) {
            throw new Error(`Typeform token exchange failed: ${tokenResponse.statusText}`)
          }

          const tokenData = await tokenResponse.json() as {
            access_token: string
            refresh_token: string
            expires_in: number
          }

          accessToken = tokenData.access_token
          refreshToken = tokenData.refresh_token
          expiresAt = Date.now() + tokenData.expires_in * 1000
          break
        }

        case 'stripe': {
          const tokenResponse = await fetch('https://connect.stripe.com/oauth/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              code: code as string,
              client_secret: STRIPE_CLIENT_SECRET.value(),
            }),
          })

          if (!tokenResponse.ok) {
            throw new Error(`Stripe token exchange failed: ${tokenResponse.statusText}`)
          }

          const tokenData = await tokenResponse.json() as {
            access_token: string
            refresh_token: string
            stripe_user_id: string
          }

          accessToken = tokenData.access_token
          refreshToken = tokenData.refresh_token
          break
        }

        default:
          throw new Error(`Unsupported platform: ${platform}`)
      }

      // Store integration credentials
      await projectRef.collection('integrations').doc(platform).set({
        platform,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt || null,
        connected_at: admin.firestore.FieldValue.serverTimestamp(),
        status: 'active',
        last_sync: null,
      })

      logger.info('Integration connected', { uid, project_id, platform })

      // Redirect back to app
      res.redirect(`https://the-phantom-app-io.web.app/vault?connected=${platform}`)
    } catch (err) {
      logger.error('Integration callback failed', {
        error: (err as Error).message,
        platform,
        uid,
        project_id,
      })
      res.redirect(`https://the-phantom-app-io.web.app/vault?error=connection_failed`)
    }
  }
)
