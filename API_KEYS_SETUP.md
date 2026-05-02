# API Keys Setup Guide

## Required: Gemini API Key

Your Gemini API key is already configured:
```
AIzaSyDkXm_gh3BzcCspwKnW27bHUA5vzk2A1-M
```

## Optional: Groq API Key

Groq provides faster AI responses with different models. It's optional but recommended.

### Get a Groq API Key

1. Go to: https://console.groq.com/keys
2. Sign up or log in
3. Click "Create API Key"
4. Copy the key (starts with `gsk_...`)

### Add to Local Environment

Edit `functions/.env.local` and add:
```
GROQ_API_KEY=gsk_your_key_here
```

### Deploy Both Secrets to Firebase

Run these commands:

```bash
# Set Gemini key
firebase functions:secrets:set GEMINI_API_KEY
# Paste: AIzaSyDkXm_gh3BzcCspwKnW27bHUA5vzk2A1-M

# Set Groq key (if you have one)
firebase functions:secrets:set GROQ_API_KEY
# Paste: gsk_your_key_here
```

Then deploy:
```bash
firebase deploy --only functions
```

---

## Quick Deploy Script

I've created a script that will help you set both keys:

**Option 1: Set both keys at once**
```bash
setup-all-secrets.bat
```

**Option 2: Manual commands**
```bash
# Gemini (required)
firebase functions:secrets:set GEMINI_API_KEY
# Paste: AIzaSyDkXm_gh3BzcCspwKnW27bHUA5vzk2A1-M

# Groq (optional)
firebase functions:secrets:set GROQ_API_KEY
# Paste: your_groq_key

# Deploy
firebase deploy --only functions
```

---

## Which AI Provider to Use?

Users can choose their preferred AI provider in settings:

- **Gemini** (default) - Google's AI, good balance of speed and quality
- **Groq** - Faster responses, uses Llama models
- **Groq Fast** - Fastest, uses smaller Llama model
- **Qwen** - Alternative model via Groq
- **Groq Compound** - Advanced reasoning model

If you only set up Gemini, that's fine - it will work for all users. Groq is optional for users who want faster responses.

---

## Current Status

✅ Gemini API Key: Configured
⚠️ Groq API Key: Not configured (optional)

**To deploy with just Gemini:**
```bash
firebase functions:secrets:set GEMINI_API_KEY
# Paste: AIzaSyDkXm_gh3BzcCspwKnW27bHUA5vzk2A1-M

firebase deploy --only functions
```

**To deploy with both:**
1. Get Groq key from https://console.groq.com/keys
2. Run both `firebase functions:secrets:set` commands
3. Deploy functions

---

## Testing

After deployment, test in your app:
1. Go to Settings
2. Try different AI providers
3. Generate something with each provider
4. See which one you prefer!

---

**Need help?** The app works fine with just Gemini. Groq is optional for speed.
