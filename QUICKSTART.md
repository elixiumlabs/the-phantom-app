# QUICK START - Fix AI Generation

## The Problem
Your AI generators don't work because the Firebase Functions need the API key configured as a secret.

## The Solution (Choose One)

### ⚡ FASTEST: Deploy to Firebase (30 seconds)

1. Open terminal and run:
```bash
firebase functions:secrets:set GEMINI_API_KEY
```

2. When prompted, paste this:
```
AIzaSyDkXm_gh3BzcCspwKnW27bHUA5vzk2A1-M
```

3. Deploy:
```bash
firebase deploy --only functions
```

4. Done! Visit https://the-phantom-app-io.web.app and test.

**OR use the script:**
```bash
setup-functions.bat
```

---

### 🔧 ALTERNATIVE: Run Locally

1. Double-click `dev-local.bat`
   - This starts Firebase Emulators + Vite dev server
   - Wait for both to start (about 10 seconds)

2. Open http://localhost:5173

3. Test AI generation - it should work!

---

## Grant Yourself Lifetime PRO

Your account (brandsbyempress@gmail.com) should have lifetime PHANTOM PRO access.

**Option 1: Run the script (easiest)**
```bash
grant-founder-access.bat
```

**Option 2: Manual via Firebase Console**
1. Go to https://console.firebase.google.com/project/the-phantom-app-io/firestore
2. Open the `users` collection
3. Find your user document (search by email)
4. Click Edit and set:
   - `plan`: `phantom_pro`
   - `is_admin`: `true`
   - `lifetime`: `true`
   - `subscription_status`: `lifetime`
5. Save and refresh your app

---

## What Changed

I fixed the connection between frontend and backend:

1. **src/lib/functions.ts** - Now connects to local emulator in dev mode
2. **functions/.env.local** - Already has your GEMINI_API_KEY
3. **functions/src/automations/bootstrapUser.ts** - Auto-grants you lifetime PRO on signup
4. **Created helper scripts** - deploy.bat, dev-local.bat, setup-functions.bat, grant-founder-access.bat

## Why It Wasn't Working

- Backend functions use Firebase secrets for API keys
- Frontend was calling functions without the secrets configured
- Functions couldn't access the AI API
- Now: Either deploy with secrets OR run emulator locally

## Test It

After deploying or starting locally:

1. Go to any generator in the app
2. Click "Generate"
3. Should see AI output instead of errors

---

**Need help?** Check FIX_AI_GENERATION.md for detailed troubleshooting.
