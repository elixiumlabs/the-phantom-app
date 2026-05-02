@echo off
echo ========================================
echo FIXING PHANTOM APP
echo ========================================
echo.

echo [1/6] Cleaning old builds...
if exist "dist" rmdir /s /q dist
if exist ".vite" rmdir /s /q .vite
if exist "node_modules\.vite" rmdir /s /q node_modules\.vite
echo Done.
echo.

echo [2/6] Reinstalling dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
echo Done.
echo.

echo [3/6] Checking Firebase configuration...
if not exist ".env.local" (
    echo ERROR: .env.local not found!
    echo Please create .env.local with your Firebase config.
    pause
    exit /b 1
)
echo Firebase config found.
echo.

echo [4/6] Building functions...
cd functions
call npm install
call npm run build
if %errorlevel% neq 0 (
    echo WARNING: Functions build had issues, but continuing...
)
cd ..
echo Done.
echo.

echo [5/6] Testing Firebase connection...
firebase projects:list
if %errorlevel% neq 0 (
    echo ERROR: Firebase CLI not authenticated!
    echo Run: firebase login
    pause
    exit /b 1
)
echo Firebase connected.
echo.

echo [6/6] Starting development server...
echo.
echo ========================================
echo App should open at: http://localhost:5173
echo ========================================
echo.
call npm run dev
