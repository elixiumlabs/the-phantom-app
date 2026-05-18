@echo off
echo ========================================
echo   PHANTOM - Local Development
echo ========================================
echo.
echo OPTION A: Full stack (frontend + API functions)
echo   Run: npm run dev:local
echo   Opens at: http://localhost:3000
echo   Requires: vercel login (one-time setup)
echo.
echo OPTION B: Frontend only (no API)
echo   Run: npm run dev
echo   Opens at: http://localhost:5173
echo   API calls proxy to localhost:3000 - start vercel dev in another terminal
echo.
echo Starting full stack with vercel dev...
echo.
npm run dev:local
