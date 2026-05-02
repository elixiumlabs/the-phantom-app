# ✅ PHANTOM APP - STARTUP CHECKLIST

## Before You Start

- [ ] Node.js installed (check: `node --version`)
- [ ] Firebase CLI installed (check: `firebase --version`)
- [ ] `.env.local` file exists in root directory
- [ ] Internet connection active

## First Time Setup

- [ ] Run `npm install` to install dependencies
- [ ] Run `grant-founder-access.bat` to get PRO access
- [ ] (Optional) Run `firebase login` if not logged in

## Start the App

Choose one:

### Option A: Quick Start (Recommended)
```bash
start.bat
```

### Option B: Full Setup + Start
```bash
fix-app.bat
```

### Option C: Manual
```bash
npm run dev
```

## Verify Everything Works

- [ ] App opens at http://localhost:5173
- [ ] Visit http://localhost:5173/diagnostic
- [ ] All checks show ✅ green
- [ ] Sign in with email or Google
- [ ] Complete onboarding
- [ ] Create a test project
- [ ] Try Phase 01 - Refine problem statement
- [ ] AI generates 3 options

## If Something Doesn't Work

1. **Check diagnostic page**: http://localhost:5173/diagnostic
2. **Check browser console**: Press F12, look for errors
3. **Check Firebase logs**: `firebase functions:log --limit 50`
4. **Read troubleshooting**: Open `QUICK_FIX.md`
5. **Restart**: Stop server (Ctrl+C), run `start.bat` again

## Common First-Time Issues

### "Firebase not configured"
- Check `.env.local` exists
- Verify all VITE_FIREBASE_* variables are set
- Restart dev server

### "Not logged in"
- Go to http://localhost:5173/login
- Sign up or sign in
- Complete onboarding

### "Functions not working"
- Check internet connection
- Verify functions are deployed: `firebase functions:list`
- Check browser console for CORS errors

### "Permission denied"
- Run `grant-founder-access.bat`
- Sign out and sign back in
- Check diagnostic page shows PRO plan

## Deploy to Production

When ready to deploy:

- [ ] Test everything locally first
- [ ] Run `firebase deploy` or `deploy.bat`
- [ ] Visit https://the-phantom-app-io.web.app
- [ ] Test production site

## Quick Reference

| Command | Purpose |
|---------|---------|
| `start.bat` | Start dev server |
| `fix-app.bat` | Full setup + start |
| `grant-founder-access.bat` | Get PRO access |
| `deploy.bat` | Deploy to production |
| `firebase functions:log` | View function logs |
| `firebase emulators:start` | Start local emulators |

## URLs

- **Local Dev**: http://localhost:5173
- **Diagnostic**: http://localhost:5173/diagnostic
- **Production**: https://the-phantom-app-io.web.app
- **Firebase Console**: https://console.firebase.google.com/project/the-phantom-app-io

---

**Ready?** Run `start.bat` and visit http://localhost:5173/diagnostic
