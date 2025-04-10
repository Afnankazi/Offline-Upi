@echo off
echo Starting development server for mobile access...
echo.
echo To access the app from your mobile device:
echo 1. Make sure your mobile device is connected to the same WiFi network as your computer
echo 2. Open a browser on your mobile device and go to:
echo    http://YOUR_COMPUTER_IP:5173
echo.
echo Your computer's IP addresses:
ipconfig | findstr /i "IPv4"
echo.
echo Press Ctrl+C to stop the server
echo.
npm run dev 