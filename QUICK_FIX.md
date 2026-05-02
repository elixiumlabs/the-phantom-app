# 🚨 QUICK FIX GUIDE

## The Problem
Your app wasn't connecting to the deployed Firebase Functions because the frontend was trying to use the local emulator (which wasn't running).

## The Fix
I've updated `src/lib/functions.ts` to connect directly to your deployed functions instead of the emulator.

## How to Start the App

### Option 1: Quick Start (Recommended)
```bash
fix-app.bat
```
This will:
- Clean old builds
- Reinstall dependencies
- Build functions
- Start the dev server

### Option 2: Manual Start
```bash
npm run dev
```

## What Should Work Now

✅ **Frontend**: Opens at http://localhost:5173
✅ **Authentication**: Sign up / Login with email or Google
✅ **AI Generation**: All generators should work (they connect to deployed functions)
✅ **Firestore**: Data persistence works

## If You Still Have Issues

### 1. Check Browser Console
Open DevTools (F12) and look for errors. Common issues:
- **CORS errors**: Functions are deployed with CORS enabled for localhost
- **Auth errors**: Make sure you're logged in
- **Network errors**: Check your internet connection

### 2. Check Firebase Functions Logs
```bash
firebase functions:log --limit 50
```

### 3. Verify Your Account Has PRO Access
```bash
grant-founder-access.bat
```

### 4. Test a Simple Generation
1. Sign up / Log in
2. Complete onboarding
3. Create a project
4. Go to Phase 01 - Identify
5. Write a problem statement
6. Click "Refine problem statement"
7. Check if AI options appear

## Environment Variables

Your `.env.local` should have:
```
VITE_FIREBASE_API_KEY=AIzaSyDy7tadbuMzrWYuMQYY8Kw4_HbDWplx16I
VITE_FIREBASE_AUTH_DOMAIN=the-phantom-app-io.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=the-phantom-app-io
VITE_FIREBASE_STORAGE_BUCKET=the-phantom-app-io.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=367209793577
VITE_FIREBASE_APP_ID=1:367209793577:web:42de7143a8a91e86ff3438
```

## Using the Emulator (Optional)

If you want to use the local emulator for development:

1. Add to `.env.local`:
```
VITE_USE_EMULATOR=true
```

2. Start emulators:
```bash
firebase emulators:start
```

3. In another terminal:
```bash
npm run dev
```

## Deploy to Production

When ready to deploy:
```bash
deploy.bat
```

This deploys:
- Frontend to Firebase Hosting
- Functions to Cloud Functions
- Firestore rules
- Storage rules

---

**Need help?** Check the browser console and Firebase logs first.
