import * as admin from 'firebase-admin'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { RESEND_API_KEY, sendMail } from '../lib/mailer'
import { generateJSON } from '../lib/anthropic'

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

interface ProjectDoc {
  user_id: string
  name: string
  status: string
  current_phase: number
  updated_at?: FirebaseFirestore.Timestamp
  last_inactivity_email_at?: FirebaseFirestore.Timestamp
  ready_to_surface?: boolean
}

/**
 * Daily inactivity nudge: active, non-surfaced projects untouched for 7+ days.
 * Per-project 7-day cooldown so we don't email the same project weekly forever.
 */
export const inactivityNudge = onSchedule(
  { schedule: 'every day 14:00', timeZone: 'UTC', region: 'us-central1', secrets: [RESEND_API_KEY] },
  async () => {
    const cutoff = admin.firestore.Timestamp.fromMillis(Date.now() - SEVEN_DAYS_MS)
    const snap = await admin
      .firestore()
      .collection('projects')
      .where('status', '==', 'active')
      .where('updated_at', '<', cutoff)
      .limit(500)
      .get()

    for (const doc of snap.docs) {
      const data = doc.data() as ProjectDoc
      if (data.ready_to_surface) continue
      if (data.last_inactivity_email_at && data.last_inactivity_email_at.toMillis() > Date.now() - SEVEN_DAYS_MS)
        continue

      const userSnap = await admin.firestore().doc(`users/${data.user_id}`).get()
      const email = userSnap.data()?.email as string | undefined
      if (!email) continue

      await sendMail(email, { template: 'inactivity_nudge', data: { project_name: data.name } })
      await doc.ref.update({ last_inactivity_email_at: admin.firestore.FieldValue.serverTimestamp() })
    }
  },
)

/**
 * Daily brief generator. For each user with at least one active project, write
 * a 3-line brief onto users/{uid}.daily_brief: top objection this week,
 * the variable to test next, conversions remaining to phase up.
 */
export const generateDailyBriefs = onSchedule(
  { schedule: 'every day 08:00', timeZone: 'UTC', region: 'us-central1' },
  async () => {
    const db = admin.firestore()
    const projects = await db.collection('projects').where('status', '==', 'active').limit(500).get()

    const byUser = new Map<string, FirebaseFirestore.QueryDocumentSnapshot[]>()
    for (const p of projects.docs) {
      const uid = p.data().user_id as string
      if (!byUser.has(uid)) byUser.set(uid, [])
      byUser.get(uid)!.push(p)
    }

    for (const [uid, list] of byUser.entries()) {
      const primary = list[0]
      const insights = (await primary.ref.collection('insights').doc('main').get()).data() ?? {}
      const project = primary.data()

      try {
        const brief = await generateJSON<{ lines: [string, string, string] }>({
          user: `Write a 3-line phantom brief for the user. Each line under 90 characters. Direct, concrete, no hype.

Project: ${project.name}
Current phase: ${project.current_phase}
Outreach total: ${insights.outreach_total ?? 0}
Conversion rate: ${insights.conversion_rate ?? 0}
Top objections: ${JSON.stringify(insights.top_objections ?? [])}
Best platform: ${JSON.stringify(insights.best_platform ?? null)}

Return JSON: { "lines": [string, string, string] }
Line 1: top friction this week (objection or response gap).
Line 2: the single variable to test next.
Line 3: what's blocking phase advancement (specific number to hit).`,
          maxTokens: 400,
          temperature: 0.4,
        })
        await db.doc(`users/${uid}`).set(
          {
            daily_brief: { lines: brief.lines, generated_at: admin.firestore.FieldValue.serverTimestamp() },
          },
          { merge: true },
        )
      } catch {
        // Brief generation is best-effort; never block other users.
      }
    }
  },
)
