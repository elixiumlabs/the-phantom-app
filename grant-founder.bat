@echo off
echo ============================================
echo GRANT FOUNDER LIFETIME PRO ACCESS
echo ============================================
echo.
echo This will upgrade brandsbyempress@gmail.com to lifetime PHANTOM PRO
echo.
echo Step 1: Get your UID
echo Run this command to find your user ID:
echo.
echo firebase auth:export users.json --format=JSON
echo.
echo Then look for "brandsbyempress@gmail.com" and copy the "localId" value
echo.
echo Step 2: Update Firestore
echo Once you have your UID, run:
echo.
echo firebase firestore:update users/YOUR_UID_HERE plan=phantom_pro is_admin=true lifetime=true subscription_status=lifetime
echo.
echo ============================================
echo.
echo OR use the Firebase Console:
echo 1. Go to: https://console.firebase.google.com/project/the-phantom-app-io/firestore
echo 2. Find: users collection
echo 3. Find your document (search by email)
echo 4. Edit and set:
echo    - plan: phantom_pro
echo    - is_admin: true
echo    - lifetime: true
echo    - subscription_status: lifetime
echo.
echo ============================================
pause
