# FOUNDER SETUP GUIDE

## Quick Setup (3 Steps)

### Step 1: Grant Yourself Lifetime PRO

Run this script:
```bash
grant-founder-access.bat
```

This will automatically upgrade `brandsbyempress@gmail.com` to lifetime PHANTOM PRO with admin access.

**OR do it manually:**
1. Go to [Firebase Console - Firestore](https://console.firebase.google.com/project/the-phantom-app-io/firestore)
2. Open `users` collection
3. Find your user document
4. Edit these fields:
   - `plan`: `phantom_pro`
   - `is_admin`: `true`
   - `lifetime`: `true`
   - `subscription_status`: `lifetime`

---

### Step 2: Deploy Functions with API Key

Run this:
```bash
firebase functions:secrets:set GEMINI_API_KEY
```

Paste when prompted: `AIzaSyDkXm_gh3BzcCspwKnW27bHUA5vzk2A1-M`

Then deploy:
```bash
firebase deploy --only functions
```

---

### Step 3: Test Everything

1. Go to https://the-phantom-app-io.web.app
2. Sign in with `brandsbyempress@gmail.com`
3. Check that you see "PHANTOM PRO" in your account
4. Try any AI generator - it should work!

---

## What's Been Fixed

### 1. Automatic Founder Access
- `functions/src/automations/bootstrapUser.ts` now auto-grants you lifetime PRO
- Any new account with your email gets instant admin + lifetime access
- Existing account can be upgraded with the script

### 2. AI Generation Fixed
- `src/lib/functions.ts` connects to emulator in dev mode
- Functions use secrets for API keys (secure)
- Both deployed and local modes work

### 3. Helper Scripts Created
- `grant-founder-access.bat` - Upgrade your account
- `setup-functions.bat` - Deploy with secrets
- `deploy.bat` - Quick deploy
- `dev-local.bat` - Run everything locally

---

## Local Development

To work locally with emulators:

```bash
dev-local.bat
```

This starts:
- Firebase Emulators (Functions, Firestore, Auth, Storage)
- Vite dev server

Then open: http://localhost:5173

---

## Production Deployment

To deploy everything:

```bash
firebase deploy
```

Or just functions:
```bash
firebase deploy --only functions
```

---

## Troubleshooting

### AI generators still not working?
1. Check that the secret is set: `firebase functions:secrets:access GEMINI_API_KEY`
2. Redeploy: `firebase deploy --only functions`
3. Check logs: `firebase functions:log`

### Not seeing PRO access?
1. Run `grant-founder-access.bat`
2. Sign out and sign back in
3. Check Firestore console to verify the fields

### Local emulator not working?
1. Make sure `functions/.env.local` has `GEMINI_API_KEY`
2. Restart emulators: `firebase emulators:start`
3. Check that frontend connects to emulator (see `src/lib/functions.ts`)

---

## Your Account Details

- **Email**: brandsbyempress@gmail.com
- **Plan**: PHANTOM PRO (Lifetime)
- **Admin**: Yes
- **Daily Limits**: Unlimited
- **All Features**: Unlocked

---

**You're all set!** 🎉
