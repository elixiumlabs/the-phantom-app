import * as admin from 'firebase-admin'
import { setGlobalOptions } from 'firebase-functions/v2'

admin.initializeApp()
setGlobalOptions({ region: 'us-central1', maxInstances: 10 })

// Generators (Phase 01)
export { refineProblemStatement } from './generators/refineProblemStatement'
export { extractUnfairAdvantages } from './generators/extractUnfairAdvantages'
export { synthesizePositioning } from './generators/synthesizePositioning'
export { extractAudienceLanguage } from './generators/extractAudienceLanguage'
export { findWhereToTest } from './generators/findWhereToTest'

// Automations
export { bootstrapUser } from './automations/bootstrapUser'
