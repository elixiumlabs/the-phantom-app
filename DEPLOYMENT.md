# PHANTOM - Deployment Guide

## 🚀 Deploy to Vercel

### Prerequisites
1. Firebase project set up with:
   - Authentication enabled (Email/Password + Google)
   - Firestore database created
   - Cloud Functions deployed
   - Storage bucket configured

### Step 1: Install Vercel CLI (Optional)
```bash
npm i -g vercel
```

### Step 2: Set Environment Variables in Vercel

Go to your Vercel project settings → Environment Variables and add:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Important:** Add these to all environments (Production, Preview, Development)

### Step 3: Deploy

#### Option A: Deploy via Vercel Dashboard
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel will auto-detect Vite configuration
4. Click "Deploy"

#### Option B: Deploy via CLI
```bash
vercel
```

### Step 4: Configure Firebase for Vercel Domain

1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add your Vercel domain: `your-app.vercel.app`
3. Add your custom domain if you have one

### Step 5: Update Stripe Webhook (if using Stripe)

Update your Stripe webhook URL to point to your Cloud Functions:
```
https://us-central1-your-project-id.cloudfunctions.net/stripeWebhook
```

---

## 🔧 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase credentials.

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

### 5. Preview Production Build
```bash
npm run preview
```

---

## 🐛 Troubleshooting

### Build Fails with "Firebase not configured"
- Make sure all `VITE_FIREBASE_*` environment variables are set in Vercel
- Check that variable names match exactly (case-sensitive)

### "Module not found" errors
- Run `npm install` to ensure all dependencies are installed
- Check that `node_modules` is not committed to git

### Routes return 404 on refresh
- `vercel.json` should have the rewrite rule (already configured)
- This ensures all routes go to `index.html` for client-side routing

### Firebase Functions not working
- Ensure Cloud Functions are deployed: `firebase deploy --only functions`
- Check CORS settings in Cloud Functions
- Verify function region matches (`us-central1`)

---

## 📦 Project Structure

```
the-phantom-app/
├── src/
│   ├── components/     # React components
│   ├── contexts/       # React contexts (Auth, Projects)
│   ├── lib/           # Utilities (Firebase, functions)
│   ├── pages/         # Page components
│   └── styles/        # Global styles
├── functions/         # Firebase Cloud Functions
├── public/           # Static assets
├── vercel.json       # Vercel configuration
└── .env.local        # Local environment variables (not committed)
```

---

## 🔐 Security Notes

- Never commit `.env.local` to git
- All Firebase security rules are enforced server-side
- Cloud Functions validate user authentication
- Rate limiting is enforced per-user (100 req/min)
- Free tier caps are enforced server-side

---

## 📊 Monitoring

### Vercel Analytics
- Automatically enabled for all deployments
- View in Vercel dashboard → Analytics

### Firebase Console
- Monitor Cloud Functions: Firebase Console → Functions
- Monitor Firestore: Firebase Console → Firestore Database
- Monitor Auth: Firebase Console → Authentication

---

## 🆘 Support

If deployment fails, check:
1. Vercel build logs for specific errors
2. Firebase Console for function deployment status
3. Browser console for runtime errors
4. Network tab for failed API calls
