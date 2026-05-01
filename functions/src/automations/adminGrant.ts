import * as admin from 'firebase-admin'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { z } from 'zod'

// Hardcoded admin allowlist. Only these UIDs may invoke adminGrantPro.
const ADMIN_UIDS = new Set<string>([
  'AATG3dK5T5aqM0GvS86BPr1IWEG3',
])

const Input = z.object({
  uid: z.string().min(1).optional(),
  plan: z.enum(['phantom', 'phantom_pro']).default('phantom_pro'),
})

/**
 * Promote a user to a paid plan with a lifetime flag, bypassing Stripe.
 * Caller must be in ADMIN_UIDS. If `uid` is omitted, promotes the caller.
 */
export const adminGrantPro = onCall({ region: 'us-central1' }, async (req) => {
  const callerUid = req.auth?.uid
  if (!callerUid || !ADMIN_UIDS.has(callerUid)) {
    throw new HttpsError('permission-denied', 'Admin only')
  }
  const input = Input.parse(req.data ?? {})
  const targetUid = input.uid ?? callerUid

  const userRef = admin.firestore().doc(`users/${targetUid}`)
  await userRef.set(
    {
      plan: input.plan,
      is_admin: true,
      lifetime: true,
      subscription_status: 'lifetime',
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  )

  return { ok: true, uid: targetUid, plan: input.plan }
})
