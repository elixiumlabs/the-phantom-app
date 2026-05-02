@echo off
echo ============================================
echo GRANT FOUNDER LIFETIME PRO
echo ============================================
echo.
echo This will grant lifetime PHANTOM PRO to:
echo brandsbyempress@gmail.com
echo.
echo Make sure you're logged in to Firebase CLI:
echo firebase login
echo.
pause

cd functions
node scripts\grantFounder.mjs
cd ..

echo.
echo ============================================
echo.
echo If successful, sign out and back in to see changes.
echo.
pause
