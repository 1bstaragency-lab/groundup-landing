# BlueBubbles + Cloudflare Tunnel Setup

## What this gives you
- iMessages/SMS sent from `messages.groundupapp.com` via your Apple ID
- Always-on even with the lid closed (Cloudflare Tunnel runs as a system daemon)
- Netlify functions call the URL — no port-forwarding, no dynamic IP issues

---

## Hardware requirement
You need a **Mac that stays on**. Options:
- **Mac mini** (recommended — $600, silent, draws 6W, lives in a closet)
- **MacBook on power adapter** with sleep disabled (see below)
- **Cloud Mac** — MacStadium (~$100/mo) or MacMini.cloud (~$30/mo)

### If using a MacBook — prevent sleep with lid closed:
```bash
# One-time: disable sleep entirely (plugged-in only, safe)
sudo pmset -c sleep 0 disksleep 0 displaysleep 30

# Or run this each session before closing lid:
caffeinate -dimsu &
```

---

## Step 1 — Install & configure BlueBubbles on the Mac

1. Download BlueBubbles Server from https://bluebubbles.app
2. Open it → Settings:
   - **Server URL**: leave blank for now (Cloudflare will set it)
   - **Password**: pick a strong password — save it for env vars
   - **Private API**: turn ON (needed for `method: private-api` in our functions)
   - **iMessage**: sign in with the Apple ID you want texts sent from
3. Start the server — it runs on port **1234** by default

---

## Step 2 — Cloudflare Tunnel (makes it public + survives reboots)

```bash
# Install
brew install cloudflared

# Authenticate with your Cloudflare account (groundupapp.com must be on Cloudflare)
cloudflared tunnel login

# Create the tunnel (one-time)
cloudflared tunnel create groundup-bb
# → saves a credentials JSON and prints a tunnel ID — copy it

# Wire up the subdomain
cloudflared tunnel route dns groundup-bb messages.groundupapp.com

# Copy the config
cp bluebubbles-server/cloudflare-tunnel.yml ~/.cloudflared/config.yml
# Then edit it: paste your tunnel ID and your Mac username

# Install as a system daemon (auto-starts on boot, survives lid-close)
sudo cloudflared service install
sudo launchctl start com.cloudflare.cloudflared
```

Your BlueBubbles server is now live at **https://messages.groundupapp.com**

---

## Step 3 — Set Netlify environment variables

In Netlify → Site configuration → Environment variables, add:

| Variable | Value |
|---|---|
| `BLUEBUBBLES_SERVER_URL` | `https://messages.groundupapp.com` |
| `BLUEBUBBLES_PASSWORD` | *(the password you set in step 1)* |

Then **redeploy** (or the next deploy picks them up automatically).

---

## Step 4 — Test it

```bash
curl -X POST https://YOUR-SITE.netlify.app/.netlify/functions/send-imessage \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1XXXXXXXXXX", "message": "Test from GrounduP 🎵"}'
```

If it works, the waitlist SMS flow is live end-to-end:
1. User submits phone on waitlist form
2. `waitlist-sms` Netlify function fires (non-blocking)
3. BlueBubbles on your Mac sends the iMessage
4. User gets a branded welcome text from your Apple ID

---

## Verify BlueBubbles is reachable
```bash
curl "https://messages.groundupapp.com/api/v1/server/info?password=YOUR_PASSWORD"
# Should return JSON with server info
```
