// Weather service: fetches OpenWeatherMap current weather and caches results
// Cache strategy: in-memory Map with 10 minute TTL. Optionally uses SQLite when available.
// Usage: const { getWeather } = require('./services/weather'); await getWeather('London', 'metric');

const path = require('path');
const fs = require('fs');
require('dotenv').config();

const DEFAULT_UNITS = process.env.WEATHER_UNITS || 'metric';
const TEN_MIN = 10 * 60 * 1000;

// In-memory cache fallback
const memoryCache = new Map(); // key -> { ts, data }

// Optional SQLite cache
let sqlite = null;
let db = null;
try {
  // Only attempt if env signals or module is present. This is optional.
  // eslint-disable-next-line global-require
  sqlite = require('sqlite3');
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const dbFile = path.join(dataDir, 'weather_cache.sqlite');
  db = new sqlite.Database(dbFile);
  db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS weather_cache (key TEXT PRIMARY KEY, ts INTEGER NOT NULL, data TEXT NOT NULL)');
  });
} catch (e) {
  sqlite = null;
  db = null;
}

function cacheKey(location, units) {
  return `${location}|${units}`.toLowerCase();
}

function getFromMemory(key) {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > TEN_MIN) return null;
  return entry.data;
}

function putInMemory(key, data) {
  memoryCache.set(key, { ts: Date.now(), data });
}

function getFromSqlite(key) {
  if (!db) return Promise.resolve(null);
  return new Promise((resolve) => {
    db.get('SELECT ts, data FROM weather_cache WHERE key = ?', [key], (err, row) => {
      if (err || !row) return resolve(null);
      if (Date.now() - row.ts > TEN_MIN) return resolve(null);
      try {
        resolve(JSON.parse(row.data));
      } catch {
        resolve(null);
      }
    });
  });
}

function putInSqlite(key, data) {
  if (!db) return;
  const ts = Date.now();
  const payload = JSON.stringify(data);
  db.run('INSERT INTO weather_cache(key, ts, data) VALUES(?, ?, ?) ON CONFLICT(key) DO UPDATE SET ts=excluded.ts, data=excluded.data', [key, ts, payload]);
}

function getApiKey() {
  return process.env.OPENWEATHER_API_KEY || '';
}

async function fetchWeather(location, units) {
  const OPENWEATHER_API_KEY = getApiKey();
  if (!OPENWEATHER_API_KEY) {
    const error = new Error('OPENWEATHER_API_KEY not configured');
    error.status = 400;
    throw error;
  }
  const url = new URL('https://api.openweathermap.org/data/2.5/weather');
  url.searchParams.set('q', location);
  url.searchParams.set('appid', OPENWEATHER_API_KEY);
  url.searchParams.set('units', units);
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data?.message || 'OpenWeather error');
    error.status = response.status;
    error.payload = data;
    throw error;
  }
  return data;
}

async function getWeather(location, units = DEFAULT_UNITS) {
  const key = cacheKey(location, units);
  // Memory first
  const fromMem = getFromMemory(key);
  if (fromMem) return fromMem;
  // SQLite next
  const fromDb = await getFromSqlite(key);
  if (fromDb) {
    putInMemory(key, fromDb);
    return fromDb;
  }
  // Fetch and cache
  const data = await fetchWeather(location, units);
  putInMemory(key, data);
  putInSqlite(key, data);
  return data;
}

function __clearCache() {
  memoryCache.clear();
  if (db) db.run('DELETE FROM weather_cache');
}

module.exports = { getWeather, __clearCache, _internals: { cacheKey, getFromMemory, putInMemory } };
module.exports.default = module.exports;


