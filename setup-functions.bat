@echo off
echo ============================================
echo PHANTOM APP - Deploy Functions with Secrets
echo ============================================
echo.
echo This will set up both API keys and deploy.
echo.
echo Step 1: Set GEMINI_API_KEY
echo.
firebase functions:secrets:set GEMINI_API_KEY
echo.
echo Step 2: Set GROQ_API_KEY
echo.
firebase functions:secrets:set GROQ_API_KEY
echo.
echo Step 3: Deploy functions
echo.
firebase deploy --only functions
echo.
echo ============================================
echo Done!
echo ============================================
pause
