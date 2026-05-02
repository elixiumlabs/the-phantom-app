@echo off
echo Setting up Firebase Functions secrets...

cd functions

echo.
echo Setting GEMINI_API_KEY...
firebase functions:secrets:set GEMINI_API_KEY --data-file .env.local

echo.
echo Deploying functions...
cd ..
firebase deploy --only functions

echo.
echo Done! Your functions are now deployed with API keys configured.
