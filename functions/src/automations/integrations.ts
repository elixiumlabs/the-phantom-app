import * as admin from 'firebase-admin'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { z } from 'zod'
import { gate, validate } from '../lib/guards'

export const TYPEFORM_CLIENT_ID = defineSecret('TYPEFORM_CLIENT_ID')
export const TYPEFORM_CLIENT_SECRET = defineSecret('TYPEFORM_CLIENT_SECRET')
export const STRIPE_CLIENT_ID = defineSecret('STRIPE_CLIENT_ID')
export const STRIPE_CLIENT_SECRET = defineSecret('STRIPE_CLIENT_SECRET')

const ConnectInput = z.object({
  platform: z.enum(['typeform', 'stripe', 'calendly', 'gumroad']),
  project_id: z.string().min(1),
})

const DisconnectInput = z.object({
  platform: z.enum(['typeform', 'stripe', 'calendly', 'gumroad']),
  project_id: z.string().min(1),
})

/**
 * Generate OAuth URL for connecting a platform
 */
export const getIntegrationAuthUrl = onCall(
  {
    region: 'us-central1',
    secrets: [TYPEFORM_CLIENT_ID, TYPEFORM_CLIENT_SECRET, STRIPE_CLIENT_ID, STRIPE_CLIENT_SECRET],
    cors: [
      /localhost:\d+$/,
      'https://the-phantom-app-io.web.app',
      'https://the-phantom-app-io.firebaseapp.com',
    ],
  },
  async (req): Promise<{ auth_url: string }> => {
    const uid = await gate(req)
    const { platform, project_id } = validate(ConnectInput, req.data)

    // Verify project ownership
    const projectRef = admin.firestore().doc(`projects/${project_id}`)
    const projectSnap = await projectRef.get()
    if (!projectSnap.exists || projectSnap.data()?.user_id !== uid) {
      throw new HttpsError('permission-denied', 'Project not found or not owned by user')
    }

    // Generate state token for OAuth callback
    const state = Buffer.from(
      JSON.stringify({ uid, project_id, platform, timestamp: Date.now() })
    ).toString('base64url')

    const redirectUri = `https://us-central1-the-phantom-app-io.cloudfunctions.net/integrationCallback`

    let authUrl = ''

    switch (platform) {
      case 'typeform': {
        const clientId = TYPEFORM_CLIENT_ID.value()
        const scopes = 'forms:read responses:read'
        authUrl = `https://api.typeform.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${state}`
        break
      }

      case 'stripe': {
        const clientId = STRIPE_CLIENT_ID.value()
        authUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${clientId}&scope=read_only&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`
        break
      }

      case 'calendly': {
        // Calendly uses OAuth 2.0
        authUrl = `https://auth.calendly.com/oauth/authorize?client_id=YOUR_CALENDLY_CLIENT_ID&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`
        break
      }

      case 'gumroad': {
        // Gumroad uses simple API key, no OAuth needed
        throw new HttpsError('unimplemented', 'Gumroad uses API key authentication. Use settings page.')
      }

      default:
        throw new HttpsError('invalid-argument', 'Unsupported platform')
    }

    return { auth_url: authUrl }
  }
)

/**
 * Disconnect a platform integration
 */
export const disconnectIntegration = onCall(
  {
    region: 'us-central1',
    cors: [
      /localhost:\d+$/,
      'https://the-phantom-app-io.web.app',
      'https://the-phantom-app-io.firebaseapp.com',
    ],
  },
  async (req): Promise<{ success: boolean }> => {
    const uid = await gate(req)
    const { platform, project_id } = validate(DisconnectInput, req.data)

    // Verify project ownership
    const projectRef = admin.firestore().doc(`projects/${project_id}`)
    const projectSnap = await projectRef.get()
    if (!projectSnap.exists || projectSnap.data()?.user_id !== uid) {
      throw new HttpsError('permission-denied', 'Project not found or not owned by user')
    }

    // Remove integration
    await projectRef.collection('integrations').doc(platform).delete()

    return { success: true }
  }
)

/**
 * Get list of connected integrations for a project
 */
export const getIntegrations = onCall(
  {
    region: 'us-central1',
    cors: [
      /localhost:\d+$/,
      'https://the-phantom-app-io.web.app',
      'https://the-phantom-app-io.firebaseapp.com',
    ],
  },
  async (req): Promise<{ integrations: Array<{ platform: string; connected_at: string; status: string }> }> => {
    const uid = await gate(req)
    const { project_id } = validate(z.object({ project_id: z.string().min(1) }), req.data)

    // Verify project ownership
    const projectRef = admin.firestore().doc(`projects/${project_id}`)
    const projectSnap = await projectRef.get()
    if (!projectSnap.exists || projectSnap.data()?.user_id !== uid) {
      throw new HttpsError('permission-denied', 'Project not found or not owned by user')
    }

    // Get integrations
    const integrationsSnap = await projectRef.collection('integrations').get()
    const integrations = integrationsSnap.docs.map(doc => ({
      platform: doc.id,
      connected_at: doc.data().connected_at || '',
      status: doc.data().status || 'active',
    }))

    return { integrations }
  }
)
