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

async function generateSnapshot(url, width = 1920, height = 1080, options = { fullPage: true }) {
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
    if (options?.fullPage) {
      // Gently scroll through the page to trigger lazy-loaded content
      try {
        await autoScroll(page);
      } catch (_) {}
    }
    const buffer = await page.screenshot({ type: 'jpeg', quality: 80, fullPage: !!options?.fullPage });
    return buffer;
  } finally {
    await browser.close();
  }
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = Math.max(200, Math.floor(window.innerHeight * 0.5));
      const timer = setInterval(() => {
        const { scrollHeight } = document.body;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight - window.innerHeight - 2) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
  });
}

/**
 * Returns a snapshot buffer for the given URL, generating it if stale.
 * Saves the snapshot under server/data/snapshots for reuse.
 */
async function getSnapshotForUrl(url, width = 1920, height = 1080, options = { ttlMs: 5 * 60 * 1000, fullPage: true }) {
  const key = keyFor(url, width, height);
  const filePath = filePathFor(key);

  const idx = memoryIndex.get(key);
  const fresh = idx && (Date.now() - idx.ts) < (options?.ttlMs ?? 5 * 60 * 1000) && fs.existsSync(idx.filePath);
  if (fresh) {
    return fs.readFileSync(idx.filePath);
  }

  // If file exists but memory index missing, try using it
  if (!fresh && fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    if (Date.now() - stat.mtimeMs < (options?.ttlMs ?? 5 * 60 * 1000)) {
      memoryIndex.set(key, { ts: stat.mtimeMs, filePath });
      return fs.readFileSync(filePath);
    }
  }

  const buffer = await generateSnapshot(url, width, height, { fullPage: !!options?.fullPage });
  fs.writeFileSync(filePath, buffer);
  memoryIndex.set(key, { ts: Date.now(), filePath });
  return buffer;
}

module.exports = { getSnapshotForUrl };


