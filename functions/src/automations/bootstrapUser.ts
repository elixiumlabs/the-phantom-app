import * as admin from 'firebase-admin'
import * as functionsV1 from 'firebase-functions/v1'

/**
 * Auth onCreate trigger.
 *
 * Creates the users/{uid} doc the moment a new account is provisioned.
 * Every server-side guard (requirePlan, meterUsage, free-tier limits) reads
 * this doc — so it MUST exist before the user can call any generator.
 *
 * v1 trigger because v2 blocking triggers require Identity Platform.
 */
export const bootstrapUser = functionsV1
  .region('us-central1')
  .auth.user()
  .onCreate(async (user) => {
    const ref = admin.firestore().doc(`users/${user.uid}`)
    const now = admin.firestore.FieldValue.serverTimestamp()

    await ref.set(
      {
        email: user.email ?? null,
        full_name: user.displayName ?? null,
        avatar_url: user.photoURL ?? null,
        plan: 'free',
        onboarding_completed: false,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        provider: user.providerData[0]?.providerId ?? 'password',
        created_at: now,
        updated_at: now,
      },
      { merge: true },
    )

    await admin.firestore().collection('activity_log').add({
      user_id: user.uid,
      project_id: null,
      action: 'user_created',
      metadata: { provider: user.providerData[0]?.providerId ?? 'password' },
      created_at: now,
    })
  })
