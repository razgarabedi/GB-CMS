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

// Simple proxy for SolarWeb public display API to avoid CORS
// Very-light in-memory cache with short TTL to smooth out upstream fetch latency
const __pvCache = new Map(); // key: token -> { ts: number, data: any }
app.get('/api/pv/solarweb', async (req, res) => {
  try {
    const token = String(req.query.token || '').trim();
    if (!token) return res.status(400).json({ error: 'token required' });
    // Prevent any intermediary caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const cacheKey = token;
    const now = Date.now();
    const cached = __pvCache.get(cacheKey);
    const TTL = 1500; // 1.5s TTL
    if (cached && (now - cached.ts) < TTL) {
      return res.json(cached.data || {});
    }

    const url = new URL('https://www.solarweb.com/ActualData/GetCompareDataForPublicDisplay');
    url.searchParams.set('PublicDisplayToken', token);
    // Add an explicit cache buster just in case
    url.searchParams.set('_', String(now));
    const r = await fetch(url, { cache: 'no-store' });
    const data = await r.json();
    __pvCache.set(cacheKey, { ts: now, data });
    res.json(data || {});
  } catch (err) {
    res.status(500).json({ error: 'failed to fetch pv data' });
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
    weatherAnimatedBackground: false,
    webViewerUrl: '',
    webViewerMode: 'iframe', // 'iframe' | 'snapshot'
    snapshotRefreshMs: 300000, // 5 minutes
    theme: 'dark', // 'dark' | 'light'
    layout: 'default', // 'default' | 'slideshow' | 'vertical-3' | 'news' | 'pv'
    welcomeText: 'Herzlich Willkommen',
    welcomeTextColor: '#ffffff',
    clockType: 'analog', // 'analog' | 'digital'
    clockStyle: 'classic', // analog: 'classic' | 'mono' | 'glass'; digital: 'minimal' | 'neon' | 'flip'
    bottomWidgetsBgColor: '',
    bottomWidgetsBgImage: '',
    slideshowAnimations: ['fade'], // allowed: 'fade' | 'cut' | 'wipe'
    slideshowAnimationDurationMs: 900,
    slideshowPreloadNext: true,
    powerProfile: 'balanced', // 'performance' | 'balanced' | 'visual'
    newsCategory: 'wirtschaft',
    newsLimit: 8,
    newsRotationMs: 8000,
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

// Snapshot endpoint: GET /api/snapshot?url=...&w=1920&h=1080&fullPage=true&ttlMs=300000&hideConsent=true
app.get('/api/snapshot', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: 'url is required' });
    const w = Number(req.query.w || 1920);
    const h = Number(req.query.h || 1080);
    const fullPage = String(req.query.fullPage || 'true') === 'true';
    const ttlMs = Number(req.query.ttlMs || 5 * 60 * 1000);
    const hideConsent = String(req.query.hideConsent || 'true') === 'true';
    const buffer = await getSnapshotForUrl(String(url), w, h, { fullPage, ttlMs, hideConsent });
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

// simple remote image proxy/cache to improve reliability of external backgrounds
const imgCacheDir = path.join(__dirname, 'data', 'imgcache');
if (!fs.existsSync(imgCacheDir)) fs.mkdirSync(imgCacheDir, { recursive: true });
// simple remote video proxy/cache to improve reliability of external background videos
const vidCacheDir = path.join(__dirname, 'data', 'vidcache');
if (!fs.existsSync(vidCacheDir)) fs.mkdirSync(vidCacheDir, { recursive: true });

function cachePathFor(url) {
  const safe = Buffer.from(String(url)).toString('base64url');
  return path.join(imgCacheDir, safe);
}
function cachePathForVideo(url) {
  const safe = Buffer.from(String(url)).toString('base64url');
  return path.join(vidCacheDir, safe + '.mp4');
}

app.get('/api/image', async (req, res) => {
  try {
    const u = String(req.query.url || '');
    if (!/^https?:\/\//i.test(u)) return res.status(400).json({ error: 'invalid url' });
    const p = cachePathFor(u);
    const ttlMs = 24 * 60 * 60 * 1000; // 1 day
    if (fs.existsSync(p)) {
      const stat = fs.statSync(p);
      if (Date.now() - stat.mtimeMs < ttlMs) {
        const stream = fs.createReadStream(p);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        // best-effort content-type guess
        const ext = path.extname(p).toLowerCase();
        if (ext === '.png') res.setHeader('Content-Type', 'image/png');
        else if (ext === '.webp') res.setHeader('Content-Type', 'image/webp');
        else res.setHeader('Content-Type', 'image/jpeg');
        return stream.pipe(res);
      }
    }
    const upstream = await fetch(u);
    if (!upstream.ok) return res.status(upstream.status).json({ error: 'fetch failed' });
    const buff = Buffer.from(await upstream.arrayBuffer());
    try { fs.writeFileSync(p, buff); } catch {}
    const ct = upstream.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', ct);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(buff);
  } catch (err) {
    res.status(500).json({ error: 'proxy error' });
  }
});

// Proxy for videos (mp4/webm). Streams and caches for a day.
app.get('/api/video', async (req, res) => {
  try {
    const u = String(req.query.url || '');
    if (!/^https?:\/\//i.test(u)) return res.status(400).json({ error: 'invalid url' });
    const p = cachePathForVideo(u);
    const ttlMs = 24 * 60 * 60 * 1000; // 1 day
    if (fs.existsSync(p)) {
      const stat = fs.statSync(p);
      if (Date.now() - stat.mtimeMs < ttlMs) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('Content-Type', 'video/mp4');
        return fs.createReadStream(p).pipe(res);
      }
    }
    const upstream = await fetch(u);
    if (!upstream.ok) return res.status(upstream.status).json({ error: 'fetch failed' });
    const buff = Buffer.from(await upstream.arrayBuffer());
    try { fs.writeFileSync(p, buff); } catch {}
    const ct = upstream.headers.get('content-type') || 'video/mp4';
    res.setHeader('Content-Type', ct);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(buff);
  } catch (err) {
    res.status(500).json({ error: 'proxy error' });
  }
});

// ---- Simple Tagesschau news proxy (RSS -> JSON) ----
/** @type {Map<string, { ts: number, data: any }>} */
const newsCache = new Map();

function buildTagesschauRssUrl(category) {
  // Tagesschau RSS main feed: https://www.tagesschau.de/xml/rss2
  // Wirtschaft (economy) feed (commonly used category)
  if (category === 'wirtschaft') return 'https://www.tagesschau.de/xml/rss2?ressort=wirtschaft';
  return 'https://www.tagesschau.de/xml/rss2';
}

function parseRssItems(xml) {
  const items = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = itemRe.exec(xml))) {
    const block = m[1] || '';
    const grab = (re) => {
      const mm = re.exec(block);
      return (mm && (mm[1] || '') || '').replace(/<!\[CDATA\[|\]\]>/g, '').trim();
    };
    const title = grab(/<title>([\s\S]*?)<\/title>/i);
    const link = grab(/<link>([\s\S]*?)<\/link>/i);
    const pubDate = grab(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    let description = grab(/<description>([\s\S]*?)<\/description>/i);
    const content = grab(/<content:encoded>([\s\S]*?)<\/content:encoded>/i);
    const subtitle = grab(/<subtitle>([\s\S]*?)<\/subtitle>/i);
    if (!description) description = content || subtitle;

    // Try to extract an image from common RSS tags used by Tagesschau
    let image = null;
    const mediaContent = /<media:content[^>]*url="([^"]+)"[^>]*>/i.exec(block);
    const mediaThumb = /<media:thumbnail[^>]*url="([^"]+)"[^>]*>/i.exec(block);
    const enclosureImg = /<enclosure[^>]*url="([^"]+)"[^>]*type="image\/[^"]+"[^>]*>/i.exec(block);
    const descImg = /<img[^>]*src=["']([^"']+)["'][^>]*>/i.exec(description || '')
      || /<img[^>]*src=["']([^"']+)["'][^>]*>/i.exec(content || '')
      || /<img[^>]*src=["']([^"']+)["'][^>]*>/i.exec(block || '');
    const candidate = (mediaContent && mediaContent[1]) || (mediaThumb && mediaThumb[1]) || (enclosureImg && enclosureImg[1]) || (descImg && descImg[1]) || null;
    if (candidate) {
      try {
        image = new URL(candidate, link || undefined).toString();
      } catch {
        image = candidate;
      }
    }

    if (title && link) items.push({ title, link, pubDate, description, image });
  }
  return items;
}

app.get('/api/news/tagesschau', async (req, res) => {
  try {
    const category = String(req.query.category || 'wirtschaft').toLowerCase();
    const limit = Math.max(1, Math.min(20, Number(req.query.limit || 8)));
    const key = `${category}|${limit}`;
    const ttl = 10 * 60 * 1000; // 10 minutes
    // helpers for summary
    function decodeEntities(s) {
      return String(s || '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');
    }
    function stripHtml(s) {
      return decodeEntities(String(s || '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
    }
    function firstParagraph(html) {
      const pMatch = /<p[\s\S]*?>([\s\S]*?)<\/p>/i.exec(String(html || ''));
      const raw = pMatch ? pMatch[1] : html;
      const text = stripHtml(raw);
      return text.length > 380 ? text.slice(0, 377) + '…' : text;
    }
    const cached = newsCache.get(key);
    if (cached && Date.now() - cached.ts < ttl) {
      // enrich cached with summaries if missing
      const data = { ...cached.data };
      if (Array.isArray(data.items)) {
        data.items = data.items.map(it => ({ ...it, summary: it.summary || firstParagraph(it.description) }));
      }
      return res.json(data);
    }
    const url = buildTagesschauRssUrl(category);
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DigitalSignageBot/1.0; +https://example.invalid) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8',
      },
    });
    const xml = await r.text();
    let items = parseRssItems(xml);
    // Fallback: if category-specific feed yields nothing, try main feed
    if (!items.length && category !== 'top') {
      const r2 = await fetch(buildTagesschauRssUrl('top'));
      const xml2 = await r2.text();
      items = parseRssItems(xml2);
    }
    // Post-filter by category when necessary since Tagesschau may ignore ressort param
    if (category === 'wirtschaft') {
      items = items.filter((it) => {
        const link = String(it.link || '').toLowerCase()
        const text = `${it.title || ''} ${it.description || ''}`.toLowerCase()
        return link.includes('/wirtschaft/') || link.includes('/boerse/') || /\b(boerse|börse|wirtschaft)\b/.test(text)
      })
    }
    items = items.slice(0, limit).map((it) => ({ ...it, summary: firstParagraph(it.description) }));
    const data = { category, items, updatedAt: new Date().toISOString() };
    newsCache.set(key, { ts: Date.now(), data });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'failed to fetch news' });
  }
});

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

// ============================================================================
// ADVANCED ADMIN API ROUTES
// ============================================================================

console.log('🔗 Loading admin API routes...');

// Import and use admin routes
const adminRoutes = require('./routes/admin');
console.log('✅ Admin routes loaded successfully');

app.use('/', adminRoutes);
console.log('✅ Admin routes mounted on root path');

// Serve the basic admin interface
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin/index.html'));
});

// Serve the basic admin interface assets
app.use('/admin', express.static(path.join(__dirname, 'public/admin')));

// Serve the advanced admin interface
app.get('/admin-advanced', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin-advanced/index.html'));
});

// Serve the advanced admin interface assets
app.use('/admin-advanced', express.static(path.join(__dirname, 'public/admin-advanced')));

// ============================================================================
// SERVER STARTUP
// ============================================================================

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Basic Admin Interface: http://localhost:${PORT}/admin`);
  // eslint-disable-next-line no-console
  console.log(`Advanced Admin Interface: http://localhost:${PORT}/admin-advanced`);
});


