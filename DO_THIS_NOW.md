# DO THIS NOW - 3 Simple Steps

## Step 1: Grant Yourself Lifetime PRO (30 seconds)

Double-click this file:
```
grant-founder-access.bat
```

This upgrades `brandsbyempress@gmail.com` to lifetime PHANTOM PRO.

---

## Step 2: Add Your Groq API Key

Open `functions/.env.local` and paste your Groq API key:
```
GEMINI_API_KEY=AIzaSyDkXm_gh3BzcCspwKnW27bHUA5vzk2A1-M
GROQ_API_KEY=paste_your_groq_key_here
```

---

## Step 3: Deploy Functions with Both API Keys (2 minutes)

Run:
```bash
setup-functions.bat
```

This will:
1. Prompt for GEMINI_API_KEY - paste: `AIzaSyDkXm_gh3BzcCspwKnW27bHUA5vzk2A1-M`
2. Prompt for GROQ_API_KEY - paste your Groq key
3. Deploy functions automatically

**OR manually:**
```bash
firebase functions:secrets:set GEMINI_API_KEY
# Paste: AIzaSyDkXm_gh3BzcCspwKnW27bHUA5vzk2A1-M

firebase functions:secrets:set GROQ_API_KEY
# Paste: your_groq_key

firebase deploy --only functions
```

---

## Step 4: Test It (30 seconds)

1. Go to: https://the-phantom-app-io.web.app
2. Sign in with: brandsbyempress@gmail.com
3. Check you see "PHANTOM PRO" badge
4. Try any AI generator
5. Should work! ✅

---

## That's It!

Your app is now fully functional with:
- ✅ AI generators working (Gemini + Groq)
- ✅ Your account has lifetime PRO
- ✅ Admin access enabled
- ✅ Unlimited usage

---

## Optional: Local Development

Want to work locally? Run:
```bash
dev-local.bat
```

Then open: http://localhost:5173

---

**Questions?** See [FOUNDER_SETUP.md](./FOUNDER_SETUP.md) for details.
