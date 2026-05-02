@echo off
echo ========================================
echo Testing Phantom App Configuration
echo ========================================
echo.

echo [1/5] Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    exit /b 1
)
echo.

echo [2/5] Checking npm packages...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)
echo.

echo [3/5] Checking environment variables...
if not exist ".env.local" (
    echo ERROR: .env.local not found!
    exit /b 1
)
type .env.local
echo.

echo [4/5] Building TypeScript...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    exit /b 1
)
echo.

echo [5/5] All checks passed!
echo.
echo To start the app, run: npm run dev
echo.
