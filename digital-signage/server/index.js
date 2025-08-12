const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer, WebSocket } = require('ws');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
// Basic request logger (avoid logging secrets)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    // eslint-disable-next-line no-console
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });
  next();
});

const PORT = process.env.PORT || 3000;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '';
const API_KEY = process.env.API_KEY || process.env.ADMIN_API_KEY || '';

// Ensure data directory and db file exist
const dataDir = path.join(__dirname, 'data');
const dbFilePath = path.join(dataDir, 'db.json');
function ensureDb() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dbFilePath)) {
    const initial = { playlists: [], slides: [], screens: {}, updatedAt: new Date().toISOString() };
    fs.writeFileSync(dbFilePath, JSON.stringify(initial, null, 2));
  }
}
ensureDb();

function readDb() {
  try {
    const raw = fs.readFileSync(dbFilePath, 'utf-8');
    return JSON.parse(raw || '{}');
  } catch (err) {
    return { playlists: [], slides: [], screens: {}, updatedAt: new Date().toISOString() };
  }
}

function writeDb(data) {
  const payload = { ...data, updatedAt: new Date().toISOString() };
  fs.writeFileSync(dbFilePath, JSON.stringify(payload, null, 2));
  return payload;
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Basic content endpoints for the player to consume
app.get('/api/content', (req, res) => {
  res.json(readDb());
});

app.post('/api/content', (req, res) => {
  const incoming = req.body || {};
  const saved = writeDb(incoming);
  res.json(saved);
});

// Optional weather proxy using OpenWeather (legacy query form)
app.get('/api/weather', async (req, res) => {
  try {
    if (!OPENWEATHER_API_KEY) {
      return res.status(400).json({ error: 'OPENWEATHER_API_KEY not configured' });
    }
    const city = (req.query.city || 'London').toString();
    const units = (req.query.units || 'metric').toString();
    const url = new URL('https://api.openweathermap.org/data/2.5/weather');
    url.searchParams.set('q', city);
    url.searchParams.set('appid', OPENWEATHER_API_KEY);
    url.searchParams.set('units', units);

    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch weather' });
  }
});

// Weather proxy with caching: GET /api/weather/:location
const { getWeather, getForecast } = require('./services/weather');
const openMeteo = require('./services/openmeteo');
const { getSnapshotForUrl } = require('./services/snapshot');
const multer = require('multer');
app.get('/api/weather/:location', async (req, res) => {
  try {
    const location = req.params.location;
    const units = (req.query.units || 'metric').toString();
    const lang = (req.query.lang || 'en').toString();
    // Prefer Open-Meteo when no OpenWeather key or when query param provider=open-meteo
    const provider = (req.query.provider || '').toString();
    let data;
    if (!OPENWEATHER_API_KEY || provider === 'open-meteo') {
      data = await openMeteo.getCurrent(location, units, lang || 'de');
    } else {
      data = await getWeather(location, units, lang);
    }
    res.json(data);
  } catch (err) {
    const status = err?.status || 500;
    res.status(status).json({ error: err?.message || 'Failed to fetch weather' });
  }
});

// 5-day forecast (using OneCall daily)
app.get('/api/forecast/:location', async (req, res) => {
  try {
    const location = req.params.location;
    const units = (req.query.units || 'metric').toString();
    const lang = (req.query.lang || 'en').toString();
    const provider = (req.query.provider || '').toString();
    let data;
    if (!OPENWEATHER_API_KEY || provider === 'open-meteo') {
      data = await openMeteo.getDaily(location, units, lang || 'de');
    } else {
      data = await getForecast(location, units, lang);
    }
    res.json(data);
  } catch (err) {
    const status = err?.status || 500;
    res.status(status).json({ error: err?.message || 'Failed to fetch forecast' });
  }
});

// Screens listing: GET /api/screens
app.get('/api/screens', (req, res) => {
  const db = readDb();
  const screens = db.screens || {};
  res.json({ screens });
});

// Config endpoints for screens
function defaultConfig(screenId) {
  return {
    screenId,
    timezone: 'UTC',
    weatherLocation: 'London',
    webViewerUrl: '',
    webViewerMode: 'iframe', // 'iframe' | 'snapshot'
    snapshotRefreshMs: 300000, // 5 minutes
    theme: 'dark', // 'dark' | 'light'
    refreshIntervals: { contentMs: 30000, rotateMs: 8000 },
    autoScrollEnabled: false,
    autoScrollMs: 30000,
    autoScrollDistancePct: 25,
    autoScrollStartDelayMs: 0,
    schedule: [],
    updatedAt: new Date().toISOString(),
  };
}

app.get('/api/config/:screenId', (req, res) => {
  const { screenId } = req.params;
  const db = readDb();
  const cfg = (db.screens && db.screens[screenId]) || defaultConfig(screenId);
  res.json(cfg);
});

function requireApiKey(req, res, next) {
  if (!API_KEY) return res.status(500).json({ error: 'API key not configured on server' });
  const key = req.header('X-Api-Key') || '';
  if (key !== API_KEY) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

app.post('/api/config/:screenId', requireApiKey, (req, res) => {
  const { screenId } = req.params;
  const incoming = req.body || {};
  const db = readDb();
  const current = (db.screens && db.screens[screenId]) || defaultConfig(screenId);
  const merged = { ...current, ...incoming, screenId, updatedAt: new Date().toISOString() };
  const nextDb = { ...db, screens: { ...(db.screens || {}), [screenId]: merged }, updatedAt: new Date().toISOString() };
  writeDb(nextDb);
  res.json(merged);
  // Notify via WS
  notifyScreen(screenId, { type: 'configUpdated', screenId });
  // eslint-disable-next-line no-console
  console.log(`Config updated for screen ${screenId}`);
});

// Snapshot endpoint: GET /api/snapshot?url=...&w=1920&h=1080
app.get('/api/snapshot', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: 'url is required' });
    const w = Number(req.query.w || 1920);
    const h = Number(req.query.h || 1080);
    const fullPage = String(req.query.fullPage || 'true') === 'true';
    const ttlMs = Number(req.query.ttlMs || 5 * 60 * 1000);
    const buffer = await getSnapshotForUrl(String(url), w, h, { fullPage, ttlMs });
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate snapshot' });
  }
});

// Static admin UI
const adminDir = path.join(__dirname, 'public', 'admin');
app.use('/admin', express.static(adminDir));
// serve snapshots statically
app.use('/snapshots', express.static(path.join(__dirname, 'data', 'snapshots')));
// serve uploads statically
const uploadsDir = path.join(__dirname, 'data', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// uploads
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadsDir),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname || '') || '.bin';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({ storage });

app.post('/api/uploads', requireApiKey, upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'no file' });
  res.json({ url: `/uploads/${file.filename}` });
});

app.get('/api/uploads', (req, res) => {
  const files = fs.readdirSync(uploadsDir)
    .filter(f => !f.startsWith('.'))
    .map(f => ({ name: f, url: `/uploads/${f}` }));
  res.json({ files });
});

// HTTP server and WebSocket server
const server = http.createServer(app);

const wss = new WebSocketServer({ server, path: '/ws' });
/** @type {Map<string, Set<import('ws').WebSocket>>} */
const screenConnections = new Map();

function registerConnection(screenId, socket) {
  if (!screenConnections.has(screenId)) screenConnections.set(screenId, new Set());
  screenConnections.get(screenId).add(socket);
}
function unregisterConnection(socket) {
  for (const [screenId, set] of screenConnections) {
    if (set.has(socket)) {
      set.delete(socket);
      if (set.size === 0) screenConnections.delete(screenId);
    }
  }
}
function notifyScreen(screenId, payload) {
  const set = screenConnections.get(screenId);
  if (!set) return;
  const message = JSON.stringify(payload);
  for (const socket of set) {
    if (socket.readyState === WebSocket.OPEN) socket.send(message);
  }
}
function broadcast(payload) {
  const message = JSON.stringify(payload);
  for (const set of screenConnections.values()) {
    for (const socket of set) {
      if (socket.readyState === WebSocket.OPEN) socket.send(message);
    }
  }
}

wss.on('connection', (socket, req) => {
  let currentScreen = undefined;
  socket.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg?.type === 'identify' && msg?.screenId) {
        currentScreen = String(msg.screenId);
        registerConnection(currentScreen, socket);
        socket.send(JSON.stringify({ type: 'identified', screenId: currentScreen }));
        // eslint-disable-next-line no-console
        console.log(`WS connected for screen ${currentScreen}`);
        return;
      }
      if (msg?.type === 'refresh') {
        if (currentScreen) notifyScreen(currentScreen, { type: 'refresh' });
        return;
      }
    } catch (_) {
      // ignore
    }
  });
  socket.on('close', () => {
    unregisterConnection(socket);
    if (currentScreen) {
      // eslint-disable-next-line no-console
      console.log(`WS disconnected for screen ${currentScreen}`);
    }
  });
});

// Admin push endpoints
app.post('/api/push/:screenId/refresh', requireApiKey, (req, res) => {
  const { screenId } = req.params;
  notifyScreen(screenId, { type: 'refresh', screenId });
  res.json({ ok: true });
});

app.post('/api/push/broadcast/refresh', requireApiKey, (req, res) => {
  broadcast({ type: 'refresh' });
  res.json({ ok: true });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${PORT}`);
});


