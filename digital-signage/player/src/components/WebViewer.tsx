import { useEffect, useRef, useState } from 'react'

export type WebViewerProps = {
  url: string
  onSuccess?: () => void
  onError?: (e: string) => void
}

/**
 * WebViewer renders an iframe with kiosk-friendly sandbox attributes.
 * It shows a small overlay status indicator and a fallback UI if the content fails to load or is blocked.
 */
export default function WebViewer({ url, onSuccess, onError }: WebViewerProps) {
  const [error, setError] = useState<string | null>(null)
  const [loadedAt, setLoadedAt] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  useEffect(() => { setError(null); setLoadedAt(null) }, [url])

  if (!url) return <div className="web-viewer empty">No URL configured</div>

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <iframe
        ref={iframeRef}
        className="web-viewer"
        src={url}
        onLoad={() => { setLoadedAt(new Date().toISOString()); onSuccess && onSuccess() }}
        onError={() => { const msg = 'iframe load error'; setError(msg); onError && onError(msg) }}
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        allow="autoplay; fullscreen"
      />
      <div style={{ position: 'absolute', right: 6, top: 6, padding: '2px 6px', borderRadius: 4, background: error ? '#a00' : '#0a0', color: '#fff', fontSize: 12 }}>
        {error ? 'error' : 'live'}
      </div>
      {error && (
        <div className="fallback" role="alert">
          <div>Embedding blocked or failed to load.</div>
          <div><a href={url} target="_blank" rel="noreferrer">Open in new window</a></div>
          <div className="small">Last successful load: {loadedAt || 'never'}</div>
        </div>
      )}
    </div>
  )
}


