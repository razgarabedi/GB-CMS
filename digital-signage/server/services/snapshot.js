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

async function generateSnapshot(url, width = 1920, height = 1080, options = { fullPage: true, hideConsent: false }) {
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
    if (options?.hideConsent) {
      try {
        await dismissConsentBanners(page);
      } catch (_) {}
    }
    if (options?.fullPage) {
      // Gently scroll through the page to trigger lazy-loaded content
      try {
        await autoScroll(page);
      } catch (_) {}
    }
    // Prevent sticky/fixed headers and navbars from being stamped across full-page screenshots
    try {
      await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        for (const el of elements) {
          const cs = window.getComputedStyle(el);
          if (cs.position === 'fixed' || cs.position === 'sticky') {
            // For cookie banners fixed to corners, prefer to hide completely instead of reflowing to top
            const rect = (el instanceof HTMLElement) ? el.getBoundingClientRect() : { width: 0, height: 0 };
            const small = rect.width * rect.height < 0.25 * (window.innerWidth * window.innerHeight);
            const likelyCookie = /cookie|consent|banner|gdpr/i.test(el.className || '') || /cookie|consent|banner|gdpr/i.test(el.id || '');
            if (small && likelyCookie) {
              el.style.setProperty('display', 'none', 'important');
              continue;
            }
            el.style.setProperty('position', 'static', 'important');
            el.style.setProperty('top', 'auto', 'important');
            el.style.setProperty('bottom', 'auto', 'important');
            el.style.setProperty('transform', 'none', 'important');
          }
        }
        // Common header selectors as a backup
        const hdrSel = 'header, [role="banner"], .header, .navbar, .site-header, [data-sticky], [class*="sticky"], [class*="Sticky"], [class*="Header"], [class*="navbar"], .app-header, .nav';
        document.querySelectorAll(hdrSel).forEach((el) => {
          (el instanceof HTMLElement) && el.style.setProperty('position', 'static', 'important');
        });
      });
    } catch (_) {}
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

async function dismissConsentBanners(page) {
  await page.evaluate(() => {
    const selectors = [
      '#onetrust-accept-btn-handler',
      '#onetrust-reject-all-handler',
      '.onetrust-close-btn-handler',
      'button[aria-label="Accept cookies"]',
      'button[aria-label="Alle akzeptieren"]',
      'button[aria-label*="accept"]',
      'button:contains("Accept all")',
      'button:contains("Alle akzeptieren")',
      'button:contains("Zustimmen")',
      '[data-test="cookie-accept-all"]',
      '.cc-allow', '.cc-accept', '.cookie-accept', '.consent-accept',
    ]
    function clickIfExists(sel) {
      try { const el = document.querySelector(sel); (el instanceof HTMLElement) && el.click() } catch {}
    }
    selectors.forEach(clickIfExists)
    // Also hide common overlay containers if present
    const overlays = [
      '#onetrust-banner-sdk',
      '.ot-sdk-container',
      '.cookie-banner',
      '.consent-banner',
      '[aria-modal="true"][role="dialog"]',
    ]
    overlays.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        (el instanceof HTMLElement) && el.style.setProperty('display', 'none', 'important')
      })
    })
  })
}

module.exports = { getSnapshotForUrl };


