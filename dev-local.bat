@echo off
echo Starting Phantom App in LOCAL MODE...
echo.
echo This will start:
echo - Firebase Emulators (Functions, Firestore, Auth, Storage)
echo - Vite Dev Server
echo.
echo Make sure functions/.env.local has your GEMINI_API_KEY
echo.

start "Firebase Emulators" cmd /k "firebase emulators:start"
timeout /t 5 /nobreak > nul
start "Vite Dev Server" cmd /k "npm run dev"

echo.
echo Both servers are starting in separate windows...
echo - Emulators: http://localhost:4000 (UI)
echo - App: http://localhost:5173
echo.
pause
