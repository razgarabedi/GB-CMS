import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import AnalogClock from '../components/AnalogClock'
import WeatherWidget from '../components/WeatherWidget'
import WebViewer from '../components/WebViewer'
import Slideshow from '../components/Slideshow'

type RefreshIntervals = { contentMs: number; rotateMs: number }
type Config = {
  screenId: string
  timezone: string
  weatherLocation: string
  webViewerUrl: string
  webViewerMode?: 'iframe' | 'snapshot'
  snapshotRefreshMs?: number
  theme?: 'dark' | 'light'
  refreshIntervals: RefreshIntervals
  schedule: any[]
  autoScrollEnabled?: boolean
  autoScrollMs?: number
  autoScrollDistancePct?: number
}

// removed legacy hook

export default function Player() {
  const { screenId = '' } = useParams()
  const [config, setConfig] = useState<Config | null>(null)
  const [lastLoadedAt, setLastLoadedAt] = useState<string | null>(null)
  const [iframeError, setIframeError] = useState<string | null>(null)

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

  async function loadConfig() {
    const base = computeApiBase()
    const res = await fetch(`${base}/api/config/${encodeURIComponent(screenId)}`)
    const cfg = (await res.json()) as Config
    setConfig(cfg)
  }

  useEffect(() => {
    if (!screenId) return
    loadConfig()
  }, [screenId])

  // periodic refresh
  useEffect(() => {
    if (!config) return
    const minutes = Math.max(1, Math.floor((config.refreshIntervals?.contentMs ?? 30000) / 60000))
    const interval = setInterval(loadConfig, minutes * 60000)
    return () => clearInterval(interval)
  }, [config?.refreshIntervals?.contentMs])

  // websocket for live pushes (match HTTP base detection)
  const wsUrl = useMemo(() => {
    const httpBase = computeApiBase()
    const u = new URL(httpBase)
    u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:'
    u.pathname = '/ws'
    return u.toString()
  }, [])

  // WebSocket with retry/backoff
  useEffect(() => {
    if (!wsUrl) return
    let attempts = 0
    let stop = false
    let ws: WebSocket | null = null
    const connect = () => {
      if (stop) return
      ws = new WebSocket(wsUrl)
      ws.addEventListener('open', () => {
        attempts = 0
        ws?.send(JSON.stringify({ type: 'identify', screenId }))
        console.info('[WS] connected')
      })
      ws.addEventListener('message', (ev) => {
        try {
          const msg = JSON.parse(ev.data)
          if (msg?.type === 'configUpdated' && msg?.screenId === screenId) {
            loadConfig()
          }
          if (msg?.type === 'refresh') {
            window.location.reload()
          }
        } catch {}
      })
      ws.addEventListener('close', () => {
        if (stop) return
        attempts += 1
        const delay = Math.min(30000, 500 * Math.pow(2, attempts))
        console.warn(`[WS] closed, reconnecting in ${Math.round(delay)}ms`)
        setTimeout(connect, delay)
      })
      ws.addEventListener('error', () => {
        // Swallow errors; close event will trigger backoff
      })
    }
    connect()
    return () => { stop = true; try { ws?.close() } catch {} }
  }, [wsUrl, screenId])

  const url = config?.webViewerUrl || ''
  const mode = config?.webViewerMode || 'iframe'
  const snapshotMs = config?.snapshotRefreshMs ?? 300000
  const theme = config?.theme || 'dark'
  return (
    <div className="kiosk">
      <div className="grid">
        <div className="cell weather"><WeatherWidget location={config?.weatherLocation || 'London'} theme={theme} /></div>
        <div className="cell viewer">
          <div className="ratio-16x9">
            <WebViewer
              url={url}
              mode={mode}
              snapshotRefreshMs={snapshotMs}
              autoScrollEnabled={!!config?.autoScrollEnabled}
              autoScrollMs={config?.autoScrollMs ?? 30000}
              autoScrollDistancePct={config?.autoScrollDistancePct ?? 25}
              onSuccess={() => setLastLoadedAt(new Date().toISOString())}
              onError={(e) => setIframeError(e)}
            />
          </div>
        </div>
        <div className="cell slideshow">
          <Slideshow images={(config as any)?.slides || []} intervalMs={config?.refreshIntervals?.rotateMs || 8000} />
          <div className="clock-overlay">
            {theme === 'light' ? (
              <AnalogClock timezone={config?.timezone || 'UTC'} size={200} theme={{ background: 'rgba(255,255,255,0.6)', hourHand: '#333', minuteHand: '#555', secondHand: '#e33', tick: 'rgba(0,0,0,0.4)', center: '#222' }} />
            ) : (
              <AnalogClock timezone={config?.timezone || 'UTC'} size={200} theme={{ background: 'rgba(0,0,0,0.35)' }} />
            )}
          </div>
        </div>
      </div>
      {iframeError && (
        <div className="fallback">
          <div>Failed to load embedded page.</div>
          <div><a href={url} target="_blank" rel="noreferrer">Open in new window</a></div>
          <div className="small">Last successful load: {lastLoadedAt || 'never'}</div>
        </div>
      )}
    </div>
  )
}

// component code moved to ../components


