@echo off
echo ========================================
echo  DEPLOYING CORS FIX TO FIREBASE
echo ========================================
echo.
echo This will redeploy all functions with updated CORS settings
echo to allow requests from Vercel (the-phantom-app.vercel.app)
echo.
pause

cd functions
echo.
echo Building functions...
call npm run build
if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)

cd ..
echo.
echo Deploying functions to Firebase...
call firebase deploy --only functions
if errorlevel 1 (
    echo Deploy failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo  CORS FIX DEPLOYED SUCCESSFULLY!
echo ========================================
echo.
echo Your functions now accept requests from:
echo  - localhost (any port)
echo  - the-phantom-app-io.web.app
echo  - the-phantom-app-io.firebaseapp.com
echo  - the-phantom-app.vercel.app
echo.
pause
