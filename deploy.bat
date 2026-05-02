@echo off
echo Deploying Firebase Functions...
echo.
firebase deploy --only functions
echo.
echo Done! Test your app at: https://the-phantom-app-io.web.app
pause
