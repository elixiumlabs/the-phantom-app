import * as admin from 'firebase-admin'
import { onRequest } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions/v2'

/**
 * Universal webhook endpoint for proof vault automation.
 * Accepts standardized JSON from Zapier, Make, n8n, or any automation tool.
 * 
 * POST /proofWebhook
 * Headers: x-phantom-webhook-key: {user's webhook key}
 * Body: {
 *   project_id: string
 *   proof_type: 'testimonial' | 'revenue' | 'case_study' | 'screenshot'
 *   title: string
 *   content: string
 *   source?: string (attribution, platform name)
 *   amount?: number (for revenue)
 *   date?: string (ISO date)
 *   file_url?: string (external URL to screenshot/file)
 *   tags?: string[]
 * }
 */

interface WebhookPayload {
  project_id: string
  proof_type: 'testimonial' | 'revenue' | 'case_study' | 'screenshot'
  title: string
  content: string
  source?: string
  amount?: number
  date?: string
  file_url?: string
  tags?: string[]
}

export const proofWebhook = onRequest(
  { 
    region: 'us-central1',
    cors: true,
  },
  async (req, res) => {
    // Only accept POST
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' })
      return
    }

    // Verify webhook key
    const webhookKey = req.headers['x-phantom-webhook-key'] as string
    if (!webhookKey) {
      res.status(401).json({ error: 'Missing x-phantom-webhook-key header' })
      return
    }

    // Find user by webhook key
    const usersSnap = await admin.firestore()
      .collection('users')
      .where('webhook_key', '==', webhookKey)
      .limit(1)
      .get()

    if (usersSnap.empty) {
      logger.warn('Invalid webhook key attempted', { key: webhookKey.slice(0, 8) })
      res.status(401).json({ error: 'Invalid webhook key' })
      return
    }

    const userDoc = usersSnap.docs[0]
    const userId = userDoc.id

    // Parse payload
    const payload = req.body as WebhookPayload

    // Validate required fields
    if (!payload.project_id || !payload.proof_type || !payload.title || !payload.content) {
      res.status(400).json({ 
        error: 'Missing required fields',
        required: ['project_id', 'proof_type', 'title', 'content']
      })
      return
    }

    // Verify project ownership
    const projectRef = admin.firestore().doc(`projects/${payload.project_id}`)
    const projectSnap = await projectRef.get()
    
    if (!projectSnap.exists) {
      res.status(404).json({ error: 'Project not found' })
      return
    }

    const projectData = projectSnap.data()!
    if (projectData.user_id !== userId) {
      res.status(403).json({ error: 'Project does not belong to this user' })
      return
    }

    // Create proof vault entry
    try {
      const proofRef = await admin.firestore().collection('proof_vault').add({
        user_id: userId,
        project_id: payload.project_id,
        proof_type: payload.proof_type,
        title: payload.title,
        content: payload.content,
        source: payload.source || null,
        amount: payload.amount || null,
        date: payload.date || null,
        file_url: payload.file_url || null,
        tags: payload.tags || [],
        content_type: null,
        size: null,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        webhook_source: true,
      })

      logger.info('Proof added via webhook', {
        user_id: userId,
        project_id: payload.project_id,
        proof_type: payload.proof_type,
        proof_id: proofRef.id,
      })

      res.status(201).json({
        success: true,
        proof_id: proofRef.id,
        message: 'Proof added to vault',
      })
    } catch (err) {
      logger.error('Failed to create proof via webhook', {
        user_id: userId,
        error: (err as Error).message,
      })
      res.status(500).json({ error: 'Failed to create proof entry' })
    }
  }
)
