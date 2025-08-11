const path = require('path');
const fs = require('fs');

// Lazy require puppeteer so server can start without it if unused
let puppeteerPromise = null;
async function getPuppeteer() {
  if (!puppeteerPromise) {
    puppeteerPromise = import('puppeteer').then(mod => mod.default || mod);
  }
  return puppeteerPromise;
}

const dataDir = path.join(__dirname, '..', 'data');
const snapshotDir = path.join(dataDir, 'snapshots');
if (!fs.existsSync(snapshotDir)) fs.mkdirSync(snapshotDir, { recursive: true });

// In-memory index of last generated timestamps
const memoryIndex = new Map(); // key -> { ts, filePath }

function keyFor(url, width, height) {
  return `${url}|${width}|${height}`;
}

function filePathFor(key) {
  // simple hash replacement for filesystem safety
  const safe = Buffer.from(key).toString('base64url');
  return path.join(snapshotDir, `${safe}.jpg`);
}

async function generateSnapshot(url, width = 1920, height = 1080) {
  const puppeteer = await getPuppeteer();
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    const buffer = await page.screenshot({ type: 'jpeg', quality: 80 });
    return buffer;
  } finally {
    await browser.close();
  }
}

/**
 * Returns a snapshot buffer for the given URL, generating it if stale.
 * Saves the snapshot under server/data/snapshots for reuse.
 */
async function getSnapshotForUrl(url, width = 1920, height = 1080, ttlMs = 5 * 60 * 1000) {
  const key = keyFor(url, width, height);
  const filePath = filePathFor(key);

  const idx = memoryIndex.get(key);
  const fresh = idx && (Date.now() - idx.ts) < ttlMs && fs.existsSync(idx.filePath);
  if (fresh) {
    return fs.readFileSync(idx.filePath);
  }

  // If file exists but memory index missing, try using it
  if (!fresh && fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    if (Date.now() - stat.mtimeMs < ttlMs) {
      memoryIndex.set(key, { ts: stat.mtimeMs, filePath });
      return fs.readFileSync(filePath);
    }
  }

  const buffer = await generateSnapshot(url, width, height);
  fs.writeFileSync(filePath, buffer);
  memoryIndex.set(key, { ts: Date.now(), filePath });
  return buffer;
}

module.exports = { getSnapshotForUrl };


