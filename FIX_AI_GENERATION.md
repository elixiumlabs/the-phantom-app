# Fix AI Generation Issue

## Problem
The AI generators aren't working because Firebase Functions need the API keys configured as secrets.

## Solution

### Option 1: Deploy Functions (Recommended)

1. **Set the Firebase secret:**
   ```bash
   firebase functions:secrets:set GEMINI_API_KEY
   ```
   When prompted, paste: `AIzaSyDkXm_gh3BzcCspwKnW27bHUA5vzk2A1-M`

2. **Deploy the functions:**
   ```bash
   firebase deploy --only functions
   ```

3. **Test the app:**
   - Open your app at https://the-phantom-app-io.web.app
   - Try generating something
   - It should now work!

### Option 2: Use Local Emulator

If you want to test locally:

1. **Make sure functions/.env.local has the API key:**
   ```
   GEMINI_API_KEY=AIzaSyDkXm_gh3BzcCspwKnW27bHUA5vzk2A1-M
   ```

2. **Start the emulator:**
   ```bash
   firebase emulators:start
   ```

3. **Update src/lib/functions.ts to use emulator:**
   Add this after line 4:
   ```typescript
   if (import.meta.env.DEV) {
     connectFunctionsEmulator(fns, 'localhost', 5001)
   }
   ```

4. **Run the dev server:**
   ```bash
   npm run dev
   ```

## Why This Happened

The backend functions were built before the frontend, and they use Firebase Functions secrets for API keys. The frontend can't access these secrets directly - they're only available to the deployed functions.

## Quick Fix (Just Deploy)

Run these two commands:
```bash
firebase functions:secrets:set GEMINI_API_KEY
firebase deploy --only functions
```

That's it! Your app will work.
