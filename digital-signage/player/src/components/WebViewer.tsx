import { useEffect, useRef, useState } from 'react'

export type WebViewerProps = {
  url: string
  mode?: 'iframe' | 'snapshot'
  snapshotRefreshMs?: number
  onSuccess?: () => void
  onError?: (e: string) => void
  autoScrollEnabled?: boolean
  autoScrollMs?: number
  autoScrollDistancePct?: number
  autoScrollStartDelayMs?: number
}

/**
 * WebViewer renders an iframe with kiosk-friendly sandbox attributes.
 * It shows a small overlay status indicator and a fallback UI if the content fails to load or is blocked.
 */
export default function WebViewer({ url, mode = 'iframe', snapshotRefreshMs = 300000, onSuccess, onError, autoScrollEnabled = false, autoScrollMs = 30000, autoScrollDistancePct = 25, autoScrollStartDelayMs = 0 }: WebViewerProps) {
  const [error, setError] = useState<string | null>(null)
  const [loadedAt, setLoadedAt] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [snapshotSrc, setSnapshotSrc] = useState<string | null>(null)
  const [snapshotLoading, setSnapshotLoading] = useState(false)
  const [snapshotError, setSnapshotError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [panDistancePx, setPanDistancePx] = useState<number>(0)
  const panZoom = 1.06

  useEffect(() => { setError(null); setLoadedAt(null) }, [url])

  if (!url) return <div className="web-viewer empty">No URL configured</div>

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        className={autoScrollEnabled ? 'auto-scroll' : undefined}
        ref={containerRef}
        style={autoScrollEnabled ? ({
          position: 'absolute', inset: 0,
          // @ts-ignore CSS variables for animation
          '--pan-duration': `${Math.max(5000, autoScrollMs)}ms`,
          '--pan-distance': `${Math.max(0, Math.min(100, autoScrollDistancePct))}%`,
          '--pan-distance-px': `${panDistancePx}px`,
          '--pan-delay': `${Math.max(0, autoScrollStartDelayMs)}ms`,
          '--pan-zoom': String(panZoom),
        } as any) : { position: 'absolute', inset: 0 }}
      >
        <div className={autoScrollEnabled ? 'pan-inner' : undefined} style={{ position: 'absolute', inset: 0 }}>
          {!snapshotSrc && mode === 'iframe' && (
            <iframe
              ref={iframeRef}
              className="web-viewer"
              src={url}
              onLoad={() => { setLoadedAt(new Date().toISOString()); onSuccess && onSuccess() }}
              onError={() => { const msg = 'iframe load error'; setError(msg); onError && onError(msg); tryLoadSnapshot(); }}
              referrerPolicy="no-referrer"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              allow="autoplay; fullscreen"
            />
          )}
          {(snapshotSrc || mode === 'snapshot') && (
            <img
              src={snapshotSrc || buildSnapshotUrl(url)}
              alt="snapshot"
              className="web-viewer snapshot-img"
              ref={imgRef}
              onLoad={() => { setSnapshotLoading(false); setSnapshotError(null); setLoadedAt(new Date().toISOString()); updatePanDistance() }}
              onError={() => { setSnapshotLoading(false); setSnapshotError('snapshot failed') }}
            />
          )}
        </div>
      </div>
      {autoScrollEnabled && (
        <CycleController durationMs={Math.max(5000, autoScrollMs)} delayMs={Math.max(0, autoScrollStartDelayMs)} containerRef={containerRef as React.RefObject<HTMLDivElement>} />
      )}
      <div style={{ position: 'absolute', right: 6, top: 6, padding: '2px 6px', borderRadius: 4, background: error ? '#a00' : '#0a0', color: '#fff', fontSize: 12 }}>
        {error ? 'error' : 'live'}
      </div>
      {(error || snapshotError) && (
        <div className="fallback" role="alert">
          <div>Embedding blocked or failed to load.</div>
          <div><a href={url} target="_blank" rel="noreferrer">Open in new window</a></div>
          <div className="small">Last successful load: {loadedAt || 'never'}</div>
          {snapshotLoading && <div className="small">Loading snapshot…</div>}
          {snapshotError && <div className="small">Snapshot error. Check server and VITE_SERVER_URL.</div>}
        </div>
      )}
    </div>
  )

  function tryLoadSnapshot() {
    // Request server-side snapshot and display it
    try {
      const u = buildSnapshotUrl(url)
      setSnapshotError(null)
      setSnapshotLoading(true)
      setSnapshotSrc(u)
    } catch {}
  }

  // Fallback timer: if the iframe neither loads nor errors within a short timeout,
  // assume it is blocked (e.g., X-Frame-Options) and switch to snapshot mode.
  // This captures cases where browsers don't fire onerror for XFO blocks.
  useEffect(() => {
    const timeoutMs = 3000
    const id = setTimeout(() => {
      if (!loadedAt && !snapshotSrc) {
        const msg = 'embed blocked or timed out'
        setError((prev) => prev || msg)
        tryLoadSnapshot()
      }
    }, timeoutMs)
    return () => clearTimeout(id)
  }, [url, loadedAt, snapshotSrc, mode])

  // Auto-refresh snapshot if mode is snapshot
  useEffect(() => {
    if (mode !== 'snapshot') return
    const id = setInterval(() => {
      setSnapshotSrc(buildSnapshotUrl(url) + `&t=${Date.now()}`)
      setSnapshotLoading(true)
    }, Math.max(60000, snapshotRefreshMs))
    return () => clearInterval(id)
  }, [mode, url, snapshotRefreshMs])

  function computeApiBase(): string {
    const env = import.meta.env.VITE_SERVER_URL as string | undefined
    if (env && /^https?:\/\//.test(env)) return env
    const loc = window.location
    const host = loc.hostname
    // Heuristics for common dev setups
    if (host === 'localhost' || host === '127.0.0.1') {
      return `${loc.protocol}//${host}:3000`
    }
    if (loc.port === '5173' || loc.port === '8080') {
      return `${loc.protocol}//${host}:3000`
    }
    // Fallback to same origin (works only if reverse-proxied)
    return loc.origin
  }

  function buildSnapshotUrl(target: string): string {
    const base = computeApiBase()
    const u = new URL(`/api/snapshot`, base)
    u.searchParams.set('url', target)
    // Always request a 16:9 image for consistent fitting; client scales with object-fit: contain
    const width = Math.max(1280, Math.floor((window.innerWidth || 1920) / 16) * 16)
    const height = Math.floor(width * 9 / 16)
    u.searchParams.set('w', String(width))
    u.searchParams.set('h', String(height))
    u.searchParams.set('fullPage', 'true')
    u.searchParams.set('hideConsent', 'true')
    return u.toString()
  }

  function updatePanDistance() {
    try {
      const container = containerRef.current
      const img = imgRef.current
      if (!container || !img) return
      const containerWidth = container.clientWidth || 0
      const containerHeight = container.clientHeight || 0
      if (!containerWidth || !containerHeight) return
      const naturalWidth = (img.naturalWidth || img.width || containerWidth)
      const naturalHeight = (img.naturalHeight || img.height || containerHeight)
      // Image rendered to fit container width by CSS (width:100%, height:auto)
      const renderedBaseHeight = (naturalHeight / naturalWidth) * containerWidth
      const renderedScaledHeight = renderedBaseHeight * panZoom
      const overflow = Math.max(0, renderedScaledHeight - containerHeight)
      const fraction = Math.max(0, Math.min(1, autoScrollDistancePct / 100))
      setPanDistancePx(Math.round(overflow * fraction))
    } catch {}
  }

  useEffect(() => {
    if (!autoScrollEnabled) return
    updatePanDistance()
    const onResize = () => updatePanDistance()
    window.addEventListener('resize', onResize)
    let ro: ResizeObserver | null = null
    if (containerRef.current) {
      ro = new ResizeObserver(() => updatePanDistance())
      ro.observe(containerRef.current)
    }
    return () => {
      window.removeEventListener('resize', onResize)
      if (ro) ro.disconnect()
    }
  }, [autoScrollEnabled, autoScrollDistancePct, url, mode])
}

function CycleController({ durationMs, delayMs, containerRef }: { durationMs: number; delayMs: number; containerRef: React.RefObject<HTMLDivElement> }) {
  useEffect(() => {
    const root = containerRef.current
    if (!root) return
    let stop = false
    function startCycle() {
      if (stop) return
      root.classList.add('run')
      const total = durationMs + delayMs
      setTimeout(() => {
        if (stop) return
        root.classList.remove('run')
        // Force reflow to restart animations cleanly
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        root.offsetHeight
        setTimeout(startCycle, 0)
      }, total)
    }
    // initial start after microtask to ensure styles applied
    const id = setTimeout(startCycle, 0)
    return () => { stop = true; clearTimeout(id); root.classList.remove('run') }
  }, [durationMs, delayMs, containerRef])
  return null
}


