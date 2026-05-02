# The Phantom App

Pre-launch brand validation operating system.

## 🚀 Quick Start

**New here? Start with:**
- [FOUNDER_SETUP.md](./FOUNDER_SETUP.md) - Complete setup guide for the founder
- [QUICKSTART.md](./QUICKSTART.md) - Quick reference for common tasks

## 📋 Setup Checklist

- [ ] Grant yourself lifetime PRO: `grant-founder-access.bat`
- [ ] Set up Firebase secrets: `firebase functions:secrets:set GEMINI_API_KEY`
- [ ] Deploy functions: `firebase deploy --only functions`
- [ ] Test at: https://the-phantom-app-io.web.app

## 🛠️ Helper Scripts

- `grant-founder-access.bat` - Upgrade your account to lifetime PRO
- `setup-functions.bat` - Set up and deploy functions with secrets
- `deploy.bat` - Quick deploy to Firebase
- `dev-local.bat` - Run local development environment

## 📚 Documentation

- [FOUNDER_SETUP.md](./FOUNDER_SETUP.md) - Complete founder setup guide
- [QUICKSTART.md](./QUICKSTART.md) - Quick reference
- [FIX_AI_GENERATION.md](./FIX_AI_GENERATION.md) - Troubleshooting AI issues
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide

## 🔧 Development

### Local Development
```bash
dev-local.bat
```
Opens:
- App: http://localhost:5173
- Emulator UI: http://localhost:4000

### Deploy to Production
```bash
firebase deploy
```

## 🎯 Your Account

- **Email**: brandsbyempress@gmail.com
- **Plan**: PHANTOM PRO (Lifetime)
- **Admin**: Yes

## 📦 Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind
- **Backend**: Firebase Functions + Firestore
- **AI**: Google Gemini API
- **Auth**: Firebase Auth
- **Hosting**: Firebase Hosting

## 🐛 Issues?

1. AI not working? → [FIX_AI_GENERATION.md](./FIX_AI_GENERATION.md)
2. Not PRO? → Run `grant-founder-access.bat`
3. Functions failing? → Check `firebase functions:log`

---

**Ready to go?** Run `grant-founder-access.bat` then `deploy.bat`
