# ✅ Vercel Deployment Checklist

## Pre-Deployment

- [x] Build passes locally (`npm run build`)
- [x] `vercel.json` configured for SPA routing
- [x] `.gitignore` updated (dist, .vercel, .env.local)
- [x] `.env.example` created with all required variables
- [ ] Firebase project created
- [ ] Cloud Functions deployed
- [ ] Firestore indexes deployed
- [ ] Firestore security rules deployed
- [ ] Storage rules deployed

## Vercel Setup

### 1. Import Project
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Framework Preset: **Vite** (auto-detected)
4. Root Directory: `./` (leave default)
5. Build Command: `npm run build` (auto-detected)
6. Output Directory: `dist` (auto-detected)

### 2. Environment Variables (CRITICAL)

Add these in Vercel → Settings → Environment Variables:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Important:** 
- Add to **all environments** (Production, Preview, Development)
- Get these from Firebase Console → Project Settings → General → Your apps → Web app

### 3. Deploy
Click "Deploy" button

### 4. Post-Deployment

#### A. Add Vercel Domain to Firebase
1. Firebase Console → Authentication → Settings → Authorized domains
2. Click "Add domain"
3. Add: `your-app.vercel.app`
4. Add custom domain if you have one

#### B. Test Authentication
1. Visit your Vercel URL
2. Try signing up with email
3. Try Google sign-in
4. Check Firebase Console → Authentication → Users

#### C. Test Project Creation
1. Click "New project" on dashboard
2. Complete 3-step onboarding
3. Check Firestore → projects collection
4. Verify AI-generated problem statement

## Troubleshooting

### Build Fails
```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npm run build 2>&1 | grep "error TS"
```

### Environment Variables Not Working
- Variable names are case-sensitive
- Must start with `VITE_` prefix
- Redeploy after adding variables
- Check Vercel build logs for "undefined"

### Firebase Not Connecting
- Check browser console for errors
- Verify all 6 environment variables are set
- Check Firebase Console → Project Settings → General
- Ensure domain is authorized in Firebase

### Routes Return 404
- Verify `vercel.json` exists with rewrite rule
- Check Vercel → Settings → Functions → Rewrites

### Cloud Functions Not Working
```bash
# Deploy functions
cd functions
npm install
cd ..
firebase deploy --only functions

# Check function logs
firebase functions:log
```

## Success Indicators

✅ Vercel deployment shows "Ready"
✅ Can access homepage at Vercel URL
✅ Can sign up / sign in
✅ Can create project via onboarding
✅ Project appears in Firestore
✅ Phase 01 AI generators work
✅ No console errors in browser

## Next Steps After Deployment

1. Set up custom domain (optional)
2. Configure Stripe webhook URL
3. Test all 4 phases end-to-end
4. Monitor Vercel Analytics
5. Monitor Firebase Console → Functions
6. Set up error tracking (Sentry, etc.)
