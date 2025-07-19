# Setting Up Cloudflare Tunnel for Local Development

This guide will help you set up Cloudflare Tunnel to expose your local development server to the internet.

## Prerequisites

1. Node.js and npm installed
2. Cloudflare account (free tier is sufficient)
3. Cloudflared CLI installed (`npm install -g cloudflared`)

## Option 1: Quick Tunnel (Temporary)

For quick testing, you can use a temporary tunnel:

```bash
# Start your local development server first
npm run dev

# In a separate terminal, start the tunnel
npx cloudflared tunnel --url http://localhost:5173
```

This will give you a temporary URL like `https://something.trycloudflare.com`.

## Option 2: Named Tunnel (Recommended)

For more stable access, create a named tunnel:

1. Login to Cloudflare:
   ```bash
   npx cloudflared tunnel login
   ```

2. Create a named tunnel:
   ```bash
   npx cloudflared tunnel create my-tunnel
   ```

3. Configure the tunnel:
   ```bash
   npx cloudflared tunnel route dns my-tunnel your-subdomain.yourdomain.com
   ```

4. Create a configuration file (config.yml):
   ```yaml
   tunnel: my-tunnel
   credentials-file: /path/to/your/credentials.json
   ingress:
     - hostname: your-subdomain.yourdomain.com
       service: http://localhost:5173
     - service: http_status:404
   ```

5. Start the tunnel:
   ```bash
   npx cloudflared tunnel run my-tunnel
   ```

## Troubleshooting

If you see errors about `host-0.0.0.0`:

1. Make sure your local development server is running on the correct port (5173)
2. Check that you're using the correct URL in the tunnel command
3. Try using a named tunnel instead of a quick tunnel

## For Offline UPI App

For your offline UPI app, you don't necessarily need Cloudflare Tunnel. The SMS functionality we've implemented uses the device's native SMS capabilities, which work independently of your web server.

If you're just testing on your local network, you can access your app directly using your computer's IP address (e.g., `http://192.168.1.100:5173`). 