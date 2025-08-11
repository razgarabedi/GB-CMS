import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import AnalogClock from '../components/AnalogClock'
import WeatherWidget from '../components/WeatherWidget'
import WebViewer from '../components/WebViewer'

type RefreshIntervals = { contentMs: number; rotateMs: number }
type Config = {
  screenId: string
  timezone: string
  weatherLocation: string
  webViewerUrl: string
  refreshIntervals: RefreshIntervals
  schedule: any[]
}

function useWebSocket(url: string | undefined, identify: any) {
  const wsRef = useRef<WebSocket | null>(null)
  useEffect(() => {
    if (!url) return
    const ws = new WebSocket(url)
    wsRef.current = ws
    ws.addEventListener('open', () => {
      if (identify) ws.send(JSON.stringify(identify))
    })
    return () => ws.close()
  }, [url])
  return wsRef
}

export default function Player() {
  const { screenId = '' } = useParams()
  const [config, setConfig] = useState<Config | null>(null)
  const [lastLoadedAt, setLastLoadedAt] = useState<string | null>(null)
  const [iframeError, setIframeError] = useState<string | null>(null)

  async function loadConfig() {
    const base = import.meta.env.VITE_SERVER_URL || ''
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

  // websocket for live pushes
  const wsUrl = useMemo(() => {
    const loc = window.location
    const base = import.meta.env.VITE_SERVER_URL
    if (base) {
      const u = new URL(base)
      u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:'
      u.pathname = '/ws'
      return u.toString()
    }
    const proto = loc.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${proto}//${loc.host}/ws`
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
  return (
    <div className="kiosk">
      <div className="grid">
        <div className="cell clock"><AnalogClock timezone={config?.timezone || 'UTC'} /></div>
        <div className="cell weather"><WeatherWidget location={config?.weatherLocation || 'London'} /></div>
        <div className="cell viewer"><WebViewer url={url} onSuccess={() => setLastLoadedAt(new Date().toISOString())} onError={(e) => setIframeError(e)} /></div>
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


