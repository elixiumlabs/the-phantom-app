# Firebase Backend Deployment

## Prerequisites

1. Firebase CLI installed:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

## Step 1: Set Firebase Secrets

All Cloud Functions require these secrets:

```bash
# Anthropic API (for AI generators)
firebase functions:secrets:set ANTHROPIC_API_KEY

# Resend API (for emails)
firebase functions:secrets:set RESEND_API_KEY

# Stripe (for billing)
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
firebase functions:secrets:set STRIPE_PRICE_TO_PLAN
firebase functions:secrets:set APP_URL

# Puppeteer (for PDF export - optional)
firebase functions:secrets:set PUPPETEER_EXEC_PATH
```

### Getting API Keys

**Anthropic (Claude):**
- Go to https://console.anthropic.com/
- Create API key
- Paste when prompted

**Resend (Email):**
- Go to https://resend.com/api-keys
- Create API key
- Paste when prompted

**Stripe:**
- Go to https://dashboard.stripe.com/apikeys
- Copy Secret key → `STRIPE_SECRET_KEY`
- Go to Webhooks → Add endpoint → Copy signing secret → `STRIPE_WEBHOOK_SECRET`
- Create price IDs for plans → format as JSON:
  ```json
  {"price_phantom_monthly":"phantom","price_phantom_yearly":"phantom","price_pro_monthly":"phantom_pro","price_pro_yearly":"phantom_pro"}
  ```

**APP_URL:**
- Your Vercel URL: `https://your-app.vercel.app`

## Step 2: Deploy Functions

```bash
# Install dependencies
cd functions
npm install
cd ..

# Deploy all functions
firebase deploy --only functions

# Or deploy specific function
firebase deploy --only functions:createProject
```

## Step 3: Deploy Firestore Rules & Indexes

```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes

# Deploy storage rules
firebase deploy --only storage
```

## Step 4: Verify Deployment

```bash
# Check function logs
firebase functions:log

# List deployed functions
firebase functions:list
```

## Expected Functions (24 total)

### Generators (17)
- refineProblemStatement
- extractUnfairAdvantages
- synthesizePositioning
- extractAudienceLanguage
- findWhereToTest
- buildMinimumOffer
- generateOutreach
- buildObjectionLibrary
- diagnoseOffer
- suggestIteration
- competitiveGapAnalysis
- positioningFromData
- recommendBrandIdentity
- buildNotFor
- structureTestimonial
- curateProofPackage
- exportLockInPdf

### Automations (4)
- createProject
- completeOnboarding
- deleteProject
- completePhase

### Triggers (7)
- bootstrapUser
- sendWelcomeEmail
- recomputeOutreachAggregates
- logOutreachActivity
- numberIterationVersion
- detectReadyToSurface
- phaseCompletedEmail
- onProofVaultCreated

### Scheduled (2)
- inactivityNudge
- generateDailyBriefs

### Storage (2)
- requestProofUploadUrl
- onProofFileFinalized

### Stripe (3)
- createCheckoutSession
- createBillingPortalSession
- stripeWebhook

## Troubleshooting

### "Missing required secret"
```bash
# List all secrets
firebase functions:secrets:list

# Set missing secret
firebase functions:secrets:set SECRET_NAME
```

### "Insufficient permissions"
```bash
# Ensure you're logged in as project owner
firebase login --reauth
```

### "Build failed"
```bash
# Test build locally
cd functions
npm run build
```

### Function timeout
- Default timeout is 60s
- Increase in function definition if needed
- Check function logs for errors

## Monitoring

### View Logs
```bash
# All functions
firebase functions:log

# Specific function
firebase functions:log --only createProject

# Follow logs in real-time
firebase functions:log --follow
```

### Firebase Console
- Functions: https://console.firebase.google.com/project/_/functions
- Firestore: https://console.firebase.google.com/project/_/firestore
- Authentication: https://console.firebase.google.com/project/_/authentication

## Cost Monitoring

Free tier limits:
- Cloud Functions: 2M invocations/month
- Firestore: 50K reads, 20K writes, 20K deletes per day
- Storage: 5GB

Monitor usage:
- Firebase Console → Usage and billing
- Set up budget alerts
