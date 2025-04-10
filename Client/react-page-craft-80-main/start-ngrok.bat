@echo off
echo Starting development server with ngrok tunnel...
echo.
echo This script will:
echo 1. Start your Vite development server
echo 2. Start ngrok to create a tunnel to your local server
echo.
echo Prerequisites:
echo - Make sure you have ngrok installed (https://ngrok.com/download)
echo - Make sure ngrok is in your PATH or in the same directory as this script
echo.
echo Press any key to continue...
pause > nul

echo.
echo Starting Vite development server in the background...
start cmd /k "npm run dev"

echo.
echo Waiting for the server to start (5 seconds)...
timeout /t 5 /nobreak > nul

echo.
echo Starting ngrok tunnel...
echo.
echo Once ngrok starts, you'll see a URL that looks like: https://xxxx-xx-xx-xxx-xx.ngrok.io
echo Use this URL to access your app from any device with internet access.
echo.
echo Press Ctrl+C to stop ngrok when you're done.
echo.

ngrok http 5173 