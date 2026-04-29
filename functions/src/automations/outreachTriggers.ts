import * as admin from 'firebase-admin'
import { onDocumentWritten, onDocumentCreated } from 'firebase-functions/v2/firestore'
import { logActivity } from '../lib/activity'
import { PHASE_2_MIN_OUTREACH } from '../lib/schemas'

interface OutreachDoc {
  responded?: boolean
  converted?: boolean
  objection?: string
  platform?: string
  date?: string
}

/**
 * Recompute the silent_test summary + insights doc whenever outreach_log changes.
 * Uses change.after to read whichever side exists post-write.
 */
export const recomputeOutreachAggregates = onDocumentWritten(
  { document: 'projects/{projectId}/outreach_log/{entryId}', region: 'us-central1' },
  async (event) => {
    const projectId = event.params.projectId
    const db = admin.firestore()
    const projectRef = db.doc(`projects/${projectId}`)

    const snap = await projectRef.collection('outreach_log').get()
    const entries = snap.docs.map((d) => d.data() as OutreachDoc)
    const total = entries.length
    const responded = entries.filter((e) => e.responded === true).length
    const converted = entries.filter((e) => e.converted === true).length

    const objectionCounts = new Map<string, number>()
    const platformCounts = new Map<string, { sent: number; responded: number; converted: number }>()
    for (const e of entries) {
      if (e.objection?.trim()) {
        const key = e.objection.trim().toLowerCase()
        objectionCounts.set(key, (objectionCounts.get(key) ?? 0) + 1)
      }
      const p = e.platform?.trim() || 'unknown'
      const cur = platformCounts.get(p) ?? { sent: 0, responded: 0, converted: 0 }
      cur.sent += 1
      if (e.responded) cur.responded += 1
      if (e.converted) cur.converted += 1
      platformCounts.set(p, cur)
    }

    const topObjection = [...objectionCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
    const top3Objections = [...objectionCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([objection, count]) => ({ objection, count }))

    const bestPlatform =
      [...platformCounts.entries()]
        .map(([platform, c]) => ({
          platform,
          conversion_rate: c.sent ? c.converted / c.sent : 0,
          sent: c.sent,
        }))
        .filter((x) => x.sent >= 3)
        .sort((a, b) => b.conversion_rate - a.conversion_rate)[0] ?? null

    const responseRate = total ? responded / total : 0
    const conversionRate = total ? converted / total : 0

    const now = admin.firestore.FieldValue.serverTimestamp()

    await projectRef.collection('silent_test').doc('main').set(
      {
        summary: {
          total,
          responded,
          converted,
          response_rate: responseRate,
          conversion_rate: conversionRate,
          top_objection: topObjection,
        },
        checklist: {
          outreach_30: total >= PHASE_2_MIN_OUTREACH,
          data_recorded: total > 0,
          objections_documented: objectionCounts.size > 0,
        },
        updated_at: now,
      },
      { merge: true },
    )

    await projectRef.collection('insights').doc('main').set(
      {
        outreach_total: total,
        response_rate: responseRate,
        conversion_rate: conversionRate,
        top_objections: top3Objections,
        best_platform: bestPlatform,
        updated_at: now,
      },
      { merge: true },
    )
  },
)

/**
 * Activity feed entry on each new outreach log entry.
 */
export const logOutreachActivity = onDocumentCreated(
  { document: 'projects/{projectId}/outreach_log/{entryId}', region: 'us-central1' },
  async (event) => {
    const projectId = event.params.projectId
    const projectSnap = await admin.firestore().doc(`projects/${projectId}`).get()
    const uid = projectSnap.data()?.user_id
    if (!uid) return
    const data = event.data?.data() as OutreachDoc | undefined
    await logActivity({
      user_id: uid,
      project_id: projectId,
      action: 'outreach_logged',
      metadata: { converted: data?.converted === true, platform: data?.platform ?? null },
    })
  },
)
