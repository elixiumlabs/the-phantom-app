import * as admin from 'firebase-admin'
import { setGlobalOptions } from 'firebase-functions/v2'

admin.initializeApp()
setGlobalOptions({ region: 'us-central1', maxInstances: 10 })

// ─── Generators ────────────────────────────────────────────────────────────
// Phase 01
export { refineProblemStatement } from './generators/refineProblemStatement'
export { extractUnfairAdvantages } from './generators/extractUnfairAdvantages'
export { synthesizePositioning } from './generators/synthesizePositioning'
export { extractAudienceLanguage } from './generators/extractAudienceLanguage'
export { findWhereToTest } from './generators/findWhereToTest'
// Phase 02
export { buildMinimumOffer } from './generators/buildMinimumOffer'
export { generateOutreach } from './generators/generateOutreach'
export { buildObjectionLibrary } from './generators/objectionLibrary'
// Phase 03
export { diagnoseOffer } from './generators/diagnoseOffer'
export { suggestIteration } from './generators/suggestIteration'
export { competitiveGapAnalysis } from './generators/competitiveGap'
// Phase 04
export { positioningFromData } from './generators/positioningFromData'
export { recommendBrandIdentity } from './generators/brandIdentity'
export { buildNotFor } from './generators/notForBuilder'
export { structureTestimonial } from './generators/structureTestimonial'
export { curateProofPackage } from './generators/curateProofPackage'
// Export
export { exportLockInPdf } from './generators/exportLockInPdf'

// ─── Automations: callables ────────────────────────────────────────────────
export { createProject } from './automations/createProject'
export { completeOnboarding, skipOnboarding } from './automations/onboardingSeeder'
export { adminGrantPro } from './automations/adminGrant'
export { deleteProject } from './automations/deleteProject'
export { completePhase } from './automations/completePhase'

// ─── Automations: triggers ─────────────────────────────────────────────────
export { bootstrapUser } from './automations/bootstrapUser'
export { sendWelcomeEmail } from './automations/userTriggers'
export { recomputeOutreachAggregates, logOutreachActivity } from './automations/outreachTriggers'
export { numberIterationVersion } from './automations/iterationTriggers'
export { detectReadyToSurface } from './automations/lockInTriggers'
export { phaseCompletedEmail } from './automations/projectTriggers'
export { onProofVaultCreated } from './automations/vaultTriggers'

// ─── Automations: scheduled ────────────────────────────────────────────────
export { inactivityNudge, generateDailyBriefs } from './automations/scheduledJobs'

// ─── Storage pipeline ──────────────────────────────────────────────────────
export { requestProofUploadUrl, onProofFileFinalized } from './storage/proofUpload'

// ─── Billing (Stripe) ──────────────────────────────────────────────────────
export { createCheckoutSession, createBillingPortalSession, stripeWebhook } from './billing/stripe'
