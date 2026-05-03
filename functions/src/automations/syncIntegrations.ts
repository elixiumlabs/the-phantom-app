import * as admin from 'firebase-admin'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { logger } from 'firebase-functions/v2'
import { defineSecret } from 'firebase-functions/params'

const TYPEFORM_CLIENT_ID = defineSecret('TYPEFORM_CLIENT_ID')
const TYPEFORM_CLIENT_SECRET = defineSecret('TYPEFORM_CLIENT_SECRET')

/**
 * Sync proof from connected integrations every hour
 */
export const syncIntegrations = onSchedule(
  {
    schedule: 'every 1 hours',
    region: 'us-central1',
    secrets: [TYPEFORM_CLIENT_ID, TYPEFORM_CLIENT_SECRET],
  },
  async () => {
    logger.info('Starting integration sync')

    // Get all projects with active integrations
    const projectsSnap = await admin.firestore().collection('projects').get()

    for (const projectDoc of projectsSnap.docs) {
      const projectId = projectDoc.id
      const projectData = projectDoc.data()
      const userId = projectData.user_id

      // Get integrations for this project
      const integrationsSnap = await projectDoc.ref.collection('integrations').get()

      for (const integrationDoc of integrationsSnap.docs) {
        const integration = integrationDoc.data()
        const platform = integrationDoc.id

        if (integration.status !== 'active') continue

        try {
          switch (platform) {
            case 'typeform':
              await syncTypeform(userId, projectId, integration)
              break
            case 'stripe':
              await syncStripe(userId, projectId, integration)
              break
            default:
              logger.warn('Unknown platform', { platform })
          }

          // Update last sync time
          await integrationDoc.ref.update({
            last_sync: admin.firestore.FieldValue.serverTimestamp(),
          })
        } catch (err) {
          logger.error('Integration sync failed', {
            platform,
            project_id: projectId,
            error: (err as Error).message,
          })
        }
      }
    }

    logger.info('Integration sync complete')
  }
)

async function syncTypeform(userId: string, projectId: string, integration: admin.firestore.DocumentData) {
  const accessToken = integration.access_token

  // Get all forms
  const formsResponse = await fetch('https://api.typeform.com/forms', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!formsResponse.ok) {
    throw new Error(`Typeform API error: ${formsResponse.statusText}`)
  }

  const formsData = await formsResponse.json() as { items: Array<{ id: string; title: string }> }

  // For each form, get responses
  for (const form of formsData.items) {
    const responsesResponse = await fetch(
      `https://api.typeform.com/forms/${form.id}/responses?page_size=100`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!responsesResponse.ok) continue

    const responsesData = await responsesResponse.json() as {
      items: Array<{
        response_id: string
        submitted_at: string
        answers: Array<{ field: { ref: string }; text?: string; choice?: { label: string } }>
      }>
    }

    // Import each response as testimonial
    for (const response of responsesData.items) {
      // Check if already imported
      const existingProof = await admin
        .firestore()
        .collection('proof_vault')
        .where('user_id', '==', userId)
        .where('project_id', '==', projectId)
        .where('external_id', '==', response.response_id)
        .limit(1)
        .get()

      if (!existingProof.empty) continue

      // Extract testimonial text (look for text answers)
      const testimonialAnswer = response.answers.find(a => a.text && a.text.length > 20)
      if (!testimonialAnswer?.text) continue

      // Extract attribution (look for name field)
      const nameAnswer = response.answers.find(a => 
        a.field.ref.toLowerCase().includes('name') && a.text
      )

      await admin.firestore().collection('proof_vault').add({
        user_id: userId,
        project_id: projectId,
        proof_type: 'testimonial',
        title: nameAnswer?.text || 'Typeform Response',
        content: testimonialAnswer.text,
        source: `Typeform: ${form.title}`,
        amount: null,
        date: response.submitted_at,
        file_url: null,
        tags: ['typeform', 'auto-imported'],
        content_type: null,
        size: null,
        external_id: response.response_id,
        integration_source: 'typeform',
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      })

      logger.info('Imported Typeform response', {
        project_id: projectId,
        response_id: response.response_id,
      })
    }
  }
}

async function syncStripe(userId: string, projectId: string, integration: admin.firestore.DocumentData) {
  const accessToken = integration.access_token

  // Get recent charges (last 7 days)
  const sevenDaysAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60
  const chargesResponse = await fetch(
    `https://api.stripe.com/v1/charges?created[gte]=${sevenDaysAgo}&limit=100`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!chargesResponse.ok) {
    throw new Error(`Stripe API error: ${chargesResponse.statusText}`)
  }

  const chargesData = await chargesResponse.json() as {
    data: Array<{
      id: string
      amount: number
      currency: string
      created: number
      description: string
      status: string
    }>
  }

  // Import successful charges as revenue proof
  for (const charge of chargesData.data) {
    if (charge.status !== 'succeeded') continue

    // Check if already imported
    const existingProof = await admin
      .firestore()
      .collection('proof_vault')
      .where('user_id', '==', userId)
      .where('project_id', '==', projectId)
      .where('external_id', '==', charge.id)
      .limit(1)
      .get()

    if (!existingProof.empty) continue

    const amountInDollars = charge.amount / 100

    await admin.firestore().collection('proof_vault').add({
      user_id: userId,
      project_id: projectId,
      proof_type: 'revenue',
      title: `$${amountInDollars.toFixed(2)} ${charge.currency.toUpperCase()} payment`,
      content: charge.description || 'Stripe payment',
      source: 'Stripe',
      amount: amountInDollars,
      date: new Date(charge.created * 1000).toISOString(),
      file_url: null,
      tags: ['stripe', 'auto-imported'],
      content_type: null,
      size: null,
      external_id: charge.id,
      integration_source: 'stripe',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    })

    logger.info('Imported Stripe charge', {
      project_id: projectId,
      charge_id: charge.id,
      amount: amountInDollars,
    })
  }
}
