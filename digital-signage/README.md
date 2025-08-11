Digital Signage Monorepo

Monorepo containing:
- `server/`: Node 18+, Express, simple JSON file DB, optional weather proxy, WebSocket, and admin UI
- `player/`: React (Vite) SPA that runs fullscreen

Requirements
- Node 18+
- Docker (optional, for docker-compose flow)

Environment Variables
- `PORT` (default: `3000`) – port for the server
- `API_KEY` – required for write/admin endpoints (header `X-Api-Key`)
- `OPENWEATHER_API_KEY` – optional, for weather proxy in the server
- `VITE_SERVER_URL` – used by the player to reach the server (e.g., `http://localhost:3000` or `http://server:3000` in compose)

Quick Start (Local without Docker)

Terminal 1:
```bash
cd server
npm install
$env:API_KEY="your_admin_key"         # PowerShell
$env:OPENWEATHER_API_KEY="your_key"   # optional
npm run dev
```

Terminal 2:
```bash
cd player
npm install
# Point the player to the server
# PowerShell
$env:VITE_SERVER_URL="http://localhost:3000"
npm run dev
```

Quick Start (Docker Compose)

From repo root:
```bash
# Powershell
$env:OPENWEATHER_API_KEY="your_key_here"
$env:API_KEY="your_admin_key"

docker compose up --build
```
- Server: http://localhost:3000
- Admin UI: http://localhost:3000/admin
- Player: http://localhost:5173
  - If using the production Nginx player image from compose, player is on http://localhost:8080

Server Scripts (inside `server/`)
- `npm run start` – start Express
- `npm run dev` – start with nodemon

API
- `GET /health` – health check
- `GET /api/screens` – list all registered configs
- `GET /api/config/:screenId` – get a configuration object for a screen
- `POST /api/config/:screenId` – update configuration (header `X-Api-Key: $API_KEY`)
- `GET /api/weather/:location?units=metric` – proxy to OpenWeather (caches 10 minutes; requires `OPENWEATHER_API_KEY`)
- WebSocket: `ws://<host>/ws`
  - Client sends `{ "type": "identify", "screenId": "screen-1" }` once connected
  - Server may push `{ "type": "configUpdated", "screenId": "screen-1" }` or `{ "type": "refresh" }`
- Push endpoints (admin):
  - `POST /api/push/:screenId/refresh` (header `X-Api-Key`)
  - `POST /api/push/broadcast/refresh` (header `X-Api-Key`)

Security and API Key Rotation
- All write/admin endpoints require `X-Api-Key: $API_KEY`.
- Rotate keys by:
  1. Generate a new key and set it as `API_KEY` on the server (env var or secret manager).
  2. Restart/reload the server process (Docker compose up, systemd restart, or PM2 reload).
  3. Update any admin tools or scripts to use the new key.
  4. Remove the old key from all environments.
- Never commit API keys to source control. Prefer environment variables or a secret manager.

Player Scripts (inside `player/`)
- `npm run dev` – Vite dev server
- `npm run build` – build static assets
- `npm run serve` – preview the built app

The player is a fullscreen SPA that cycles through slides. Configure content via the server or admin UI.

Build and Deploy Player to TV (Kiosk)
- Build the player:
  - `cd player && npm install && npm run build`
  - Output is in `player/dist/` (served by Nginx in Docker build)
- Kiosk launch flags (Chrome/Chromium):
  - `--kiosk --start-fullscreen --incognito --noerrdialogs --disable-infobars --disable-translate --disable-session-crashed-bubble --autoplay-policy=no-user-gesture-required --app=http://<host>:8080/player/<screenId>`
- See `docs/kiosk.md` for Raspberry Pi, Android TV, and ChromeOS guidance.

Known Limitations
- Some sites block embedding in iframes via X-Frame-Options/Content-Security-Policy; in that case, WebViewer shows a fallback link.
- Weather data is proxied via OpenWeather; API quotas and network failures may apply.
- Admin API relies on a single `API_KEY` secret; rotate keys and keep them out of source control.

Next Steps & Advanced Features
- Playlist scheduling by time/day, calendar-based overrides.
- Multiple layout zones and templates per screen.
- Asset management and offline cache for resilience.
- Telemetry/analytics: uptime, last check-in, error rates, content impressions.
- Role-based admin auth and audit logging.


