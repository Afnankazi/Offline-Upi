@echo off
echo Starting Cloudflare Tunnel...
npx cloudflared tunnel --url http://localhost:5173
pause 