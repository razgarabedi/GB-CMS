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
