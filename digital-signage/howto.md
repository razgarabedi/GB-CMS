# Deploying Digital Signage (Ubuntu + Nginx)

This guide shows how to run the Digital Signage server (Node.js API + Admin + WebSocket) and the Player (static site) behind Nginx on Ubuntu.

## 1) Prerequisites

- Ubuntu 22.04+ with sudo
- Domain (e.g., `signage.example.com`) pointing to the server
- Node.js LTS and PM2
- Nginx
- Puppeteer system dependencies (for website snapshots)

```bash
sudo apt update
# Nginx + firewall
sudo apt install -y nginx
sudo ufw allow 'Nginx Full'

# Node + PM2 (NodeSource)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm i -g pm2

# Puppeteer runtime deps
sudo apt install -y libasound2 libatk1.0-0 libc6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
  libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libgbm1 libpangocairo-1.0-0 libgtk-3-0 \
  libnss3 libxshmfence1
```

## 2) Get the code onto the server

```bash
sudo mkdir -p /opt/digital-signage
sudo chown $USER:$USER /opt/digital-signage
cd /opt/digital-signage
# Copy your repo here (git clone or scp)
# e.g. git clone <your-repo-url> .
```

## 3) Build and install the Player (static files)

```bash
cd /opt/digital-signage/digital-signage/player
npm ci
npm run build

sudo mkdir -p /var/www/signage-player
sudo rsync -a dist/ /var/www/signage-player/
```

Notes:
- The player auto-detects the server base when served on the same origin; no special env vars are needed in this setup.
- Re-run `rsync` when you rebuild the player.

### API connection options for the Player

The player needs to reach the server for `/api` and the WebSocket `/ws`:

- Same-origin deployment (recommended): serve the player and proxy the server under the same domain via Nginx (as in this guide). The player will auto-detect and use the same origin for API and WS.
- Split origins (player and server on different domains/ports): build the player with `VITE_SERVER_URL` set to the server base URL so the player knows where to call the API and WS.

Build-time example for split origins:

```bash
# Suppose the server lives at https://api.example.com
cd /opt/digital-signage/digital-signage/player
VITE_SERVER_URL=https://api.example.com npm run build
sudo rsync -a dist/ /var/www/signage-player/
```

Server requirements for split origins:
- Ensure CORS is enabled on the server if serving APIs from a different origin (the server has CORS middleware enabled by default).
- Expose `/api`, `/admin`, and `/ws` from that server origin. If proxying via another Nginx, make sure to forward WebSocket Upgrade headers.

## 4) Run the Server (API + Admin + WebSocket)

```bash
cd /opt/digital-signage/digital-signage/server
npm ci

# Optional .env (API key protects admin writes; keep it secret)
cat > .env << 'EOF'
PORT=3000
API_KEY=change_me_admin_key
# Optional: weather provider key
# OPENWEATHER_API_KEY=your_key
EOF

# Start with PM2 and enable on boot
pm2 start index.js --name signage-server
pm2 save
pm2 startup  # follow the one-liner it prints
```

Data is stored under `digital-signage/server/data/` (configs, uploads, snapshots).

## 5) Nginx site config (player + reverse proxy)

Create `/etc/nginx/sites-available/digital-signage` with:

```nginx
server {
  listen 80;
  server_name signage.example.com;

  # Player static site
  root /var/www/signage-player;
  index index.html;

  # SPA fallback for routes like /player/:screenId
  location / {
    try_files $uri /index.html;
  }

  # Proxy API + Admin (Node on :3000)
  location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  location /admin/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  # WebSockets
  location /ws {
    proxy_pass http://127.0.0.1:3000/ws;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;
  }

  # Increase timeouts for snapshots if needed
  location /api/snapshot {
    proxy_pass http://127.0.0.1:3000/api/snapshot;
    proxy_read_timeout 120s;
    proxy_send_timeout 120s;
    proxy_set_header Host $host;
  }

  # Serve uploaded files from the Node server
  location /uploads/ {
    proxy_pass http://127.0.0.1:3000;  # keep URI so /uploads/... is preserved
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  # Optional: allow direct access to generated snapshots
  location /snapshots/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
  }

  # Larger upload limit for slide images
  location /api/uploads {
    client_max_body_size 50M;
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/digital-signage /etc/nginx/sites-enabled/digital-signage
sudo nginx -t
sudo systemctl reload nginx
```

(Optional) TLS with Certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d signage.example.com
```

## 6) Verify

- Server health:

```bash
curl http://127.0.0.1:3000/health
```

- Admin UI: `http://signage.example.com/admin`
  - Click a screen to edit or create a new one (set a unique Screen ID).
  - Fields of interest:
    - Timezone, Weather Location
    - Layout (default, slideshow, vertical-3)
    - Theme (dark/light)
    - Web Viewer URL and Mode (iframe/snapshot)
    - Slideshow (slides JSON, or upload via the UI; multiple upload supported)
    - Slideshow-specific options (shown only for slideshow layout):
      - Welcome Text (supports inline color segments like `{#ff0000}Hello{/} World`)
      - Welcome Text Color (default color for untagged parts)
      - Bottom Widgets Background (color and/or uploaded image; image keeps aspect ratio and aligns right)
      - Clock Type (analog/digital) and Style
  - Save (if `API_KEY` is set, ensure your client includes `X-Api-Key`).

- Player: `http://signage.example.com/player/<your-screen-id>`

## 7) Updates and operations

- Update player bundle after changes:

```bash
cd /opt/digital-signage/digital-signage/player
npm ci
npm run build
sudo rsync -a dist/ /var/www/signage-player/
sudo systemctl reload nginx
```

- Manage server process with PM2:

```bash
pm2 logs signage-server
pm2 restart signage-server
pm2 status
```

## 8) Troubleshooting

- Snapshot shows black/partial page:
  - Make sure Puppeteer dependencies are installed.
  - Increase `/api/snapshot` timeouts in Nginx block.
- WebSocket connection fails:
  - Check `/ws` location with Upgrade/Connection headers.
- CORS issues:
  - In this setup, player and server share the same origin. If you split domains, build player with `VITE_SERVER_URL` pointing to the server and ensure server CORS is enabled.

---

You should now have:
- Nginx serving the player static site with SPA fallback
- Node server on port 3000 behind Nginx for `/api`, `/admin`, and `/ws`
- TLS via Certbot (optional)
- Admin to configure screens, and player reachable at `/player/:screenId`

## 9) Production run checklist (server environment)

- Environment
  - Set `NODE_ENV=production` for the server (via PM2 env or `.env`).
  - Keep your `API_KEY` secret; only send it from trusted admin clients.
- Process manager (PM2)
  - Use PM2 to keep the Node server alive and auto-start on boot:
    ```bash
    pm2 start index.js --name signage-server --env production
    pm2 save
    pm2 startup  # run the suggested command
    ```
  - Logs: `pm2 logs signage-server`, rotate periodically (PM2 integrates with logrotate or use your own).
- Nginx hardening
  - Firewall: only open 80/443 to the public; keep port 3000 bound to localhost.
  - WebSockets: ensure `/ws` has Upgrade/Connection headers (as shown above).
  - Uploads: set `client_max_body_size` for `/api/uploads` (example uses 50M).
  - Static caching (optional): you can add `expires`/`cache-control` for `/var/www/signage-player` static assets.
- Player ↔ API connectivity
  - Same-origin: recommended; no extra config needed.
  - Split-origin: build player with `VITE_SERVER_URL=https://your-api-domain` and ensure CORS on the server (already enabled).
- Data and backups
  - Persist and back up `digital-signage/server/data/` (contains `db.json`, `uploads/`, `snapshots/`).
  - Consider excluding `snapshots/` from backups if space is a concern; they are regenerable.
- TLS
  - Certbot auto-renewal runs daily; verify with `sudo systemctl status certbot.timer`.
- Health and monitoring
  - Health endpoint: `GET /health` (via `curl http://127.0.0.1:3000/health`).
  - Consider Uptime monitoring (e.g., UptimeRobot) for your domain.
- Common issues
  - 404 on `/uploads/...`: ensure Nginx `location /uploads/` proxies to the Node server (see config above).
  - 413 Request Entity Too Large on upload: increase `client_max_body_size` (see `/api/uploads` block).
  - Snapshot black frames: install Puppeteer deps and increase snapshot timeouts; confirm `/api/snapshot` reaches the server.

## 10) Running on Windows 10 (no Nginx)

This section describes a simple production-style setup on Windows 10 that serves the API/Admin from Node (port 3000) and the Player as a static site via a local static server (port 5173). You can later move to Nginx/IIS if needed.

### Step 1: Install prerequisites

- Install Node.js LTS for Windows from `https://nodejs.org` (includes npm)
- (Optional) Install Git for Windows
- (Optional) Install PM2 globally for easier process management:
  - PowerShell: `npm i -g pm2`

### Step 2: Get the code onto the machine

Open PowerShell and run:

```powershell
mkdir C:\GB-CMS
cd C:\GB-CMS
# Clone or copy the project here
# git clone <your-repo-url> .
```

### Step 3: Install and run the Server (API + Admin)

```powershell
cd C:\GB-CMS\digital-signage\server
npm ci

# Create .env (Optional but recommended)
@"
PORT=3000
API_KEY=change_me_admin_key
# OPENWEATHER_API_KEY=your_key
"@ | Out-File -Encoding ascii .env

# Start the server
npm run start   # runs: node index.js
# or keep it running via PM2
pm2 start index.js --name signage-server
pm2 save
```

- Verify: open `http://localhost:3000/health` and `http://localhost:3000/admin`
- Ensure Windows Defender Firewall allows inbound on port 3000 if accessed from LAN

### Step 4: Build and serve the Player (static files)

The player must know where the API lives. For a split origin (player on port 5173, API on port 3000), build with `VITE_SERVER_URL` pointing to the API.

- PowerShell:
```powershell
cd C:\GB-CMS\digital-signage\player
npm ci
$env:VITE_SERVER_URL = "http://localhost:3000"
npm run build
# serve the built files (choose a port, e.g., 5173)
npx serve -s dist -l 5173
```

- CMD (Command Prompt):
```bat
cd C:\GB-CMS\digital-signage\player
npm ci
set VITE_SERVER_URL=http://localhost:3000 && npm run build
npx serve -s dist -l 5173
```

- Open the player: `http://localhost:5173/player/<your-screen-id>`
- Admin is at `http://localhost:3000/admin` (configure your screen, slides, layout, etc.)

Notes:
- If running both on the same origin later (e.g., behind IIS/Nginx), rebuild the player without `VITE_SERVER_URL` or set it to the shared origin.
- On Windows, Puppeteer uses a bundled Chromium; no extra packages are required.

### Step 5: Auto-start on boot (optional)

- With PM2 (for the server):
```powershell
pm2 start index.js --name signage-server
pm2 save
# pm2-windows-service (optional) can install PM2 as a Windows service:
npm i -g pm2-windows-service
pm2-service-install -n "SignagePM2" -d "PM2 for Digital Signage"
```
- For the player static server, consider using IIS to serve `player/dist` as a static website on Windows, or create a Task Scheduler entry that runs `npx serve -s dist -l 5173` at logon.

### Step 6: Firewall and LAN access

- Allow inbound TCP for ports 3000 (server) and 5173 (player) in Windows Defender Firewall if other devices should access them.
- Verify from another machine: `http://<windows-host>:5173/player/<screenId>` and `http://<windows-host>:3000/admin`.
