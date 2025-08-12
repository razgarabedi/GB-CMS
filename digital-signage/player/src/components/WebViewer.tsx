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
}

/**
 * WebViewer renders an iframe with kiosk-friendly sandbox attributes.
 * It shows a small overlay status indicator and a fallback UI if the content fails to load or is blocked.
 */
export default function WebViewer({ url, mode = 'iframe', snapshotRefreshMs = 300000, onSuccess, onError, autoScrollEnabled = false, autoScrollMs = 30000, autoScrollDistancePct = 25 }: WebViewerProps) {
  const [error, setError] = useState<string | null>(null)
  const [loadedAt, setLoadedAt] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [snapshotSrc, setSnapshotSrc] = useState<string | null>(null)
  const [snapshotLoading, setSnapshotLoading] = useState(false)
  const [snapshotError, setSnapshotError] = useState<string | null>(null)

  useEffect(() => { setError(null); setLoadedAt(null) }, [url])

  if (!url) return <div className="web-viewer empty">No URL configured</div>

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        className={autoScrollEnabled ? 'auto-scroll' : undefined}
        style={autoScrollEnabled ? ({
          position: 'absolute', inset: 0,
          // @ts-ignore CSS variables for animation
          '--pan-duration': `${Math.max(5000, autoScrollMs)}ms`,
          '--pan-distance': `${Math.max(0, Math.min(80, autoScrollDistancePct))}%`,
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
              className="web-viewer"
              onLoad={() => { setSnapshotLoading(false); setSnapshotError(null); setLoadedAt(new Date().toISOString()) }}
              onError={() => { setSnapshotLoading(false); setSnapshotError('snapshot failed') }}
            />
          )}
        </div>
      </div>
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
    u.searchParams.set('w', String(window.innerWidth || 1920))
    u.searchParams.set('h', String(window.innerHeight || 1080))
    u.searchParams.set('fullPage', 'true')
    return u.toString()
  }
}


