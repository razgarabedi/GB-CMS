import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import AnalogClock from '../components/AnalogClock'
import DigitalClock from '../components/DigitalClock'
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
  layout?: 'default' | 'slideshow' | 'vertical-3'
  welcomeText?: string
  welcomeTextColor?: string
  clockType?: 'analog' | 'digital'
  clockStyle?: 'classic' | 'mono' | 'glass' | 'minimal' | 'neon' | 'flip'
  bottomWidgetsBgColor?: string
  bottomWidgetsBgImage?: string
  refreshIntervals: RefreshIntervals
  schedule: any[]
  autoScrollEnabled?: boolean
  autoScrollMs?: number
  autoScrollDistancePct?: number
  autoScrollStartDelayMs?: number
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
  const layout = config?.layout || 'default'
  const clockType = config?.clockType || 'analog'
  const clockStyle = (config?.clockStyle as any) || (clockType === 'digital' ? 'minimal' : 'classic')

  function renderClock(size: number) {
    if (clockType === 'digital') {
      const digitalType = (['minimal', 'neon', 'flip'] as const).includes(clockStyle)
        ? (clockStyle as 'minimal' | 'neon' | 'flip')
        : 'minimal'
      const color = theme === 'light'
        ? (digitalType === 'neon' ? '#0077ff' : '#111')
        : (digitalType === 'neon' ? '#00e5ff' : '#fff')
      return <DigitalClock timezone={config?.timezone || 'UTC'} type={digitalType} size={Math.max(24, Math.round(size * 0.45))} color={color} />
    }
    const t = buildAnalogTheme(clockStyle, theme)
    return <AnalogClock timezone={config?.timezone || 'UTC'} size={size} theme={t} />
  }

  function buildAnalogTheme(style: string, uiTheme: 'dark' | 'light') {
    const isLight = uiTheme === 'light'
    if (style === 'mono') {
      const ink = isLight ? '#222' : '#fff'
      return { background: isLight ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.35)', tick: ink, hourHand: ink, minuteHand: ink, secondHand: ink, center: ink }
    }
    if (style === 'glass') {
      return {
        background: isLight ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)',
        tick: isLight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)',
        hourHand: isLight ? '#333' : '#fff',
        minuteHand: isLight ? '#555' : '#ddd',
        secondHand: isLight ? '#e33' : '#ff5757',
        center: isLight ? '#333' : '#fff',
      }
    }
    return {
      background: isLight ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.35)',
      tick: isLight ? '#444' : '#666',
      hourHand: isLight ? '#222' : '#fff',
      minuteHand: isLight ? '#444' : '#ddd',
      secondHand: isLight ? '#e33' : '#ff4d4d',
      center: isLight ? '#222' : '#fff',
    }
  }

  function renderWelcomeText(input: string, defaultColor: string) {
    const parts: Array<{ text: string; color?: string }> = []
    const pattern = /\{#([0-9a-fA-F]{3,8}|[a-zA-Z]+)\}([\s\S]*?)\{\/\}/g
    let lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = pattern.exec(input))) {
      const [full, color, text] = m
      if (m.index > lastIndex) {
        parts.push({ text: input.slice(lastIndex, m.index) })
      }
      parts.push({ text, color: `#${color}`.startsWith('##') ? color : (/#/ .test(color[0]) ? color : (color.match(/^[a-zA-Z]+$/) ? color : `#${color}`)) })
      lastIndex = m.index + full.length
    }
    if (lastIndex < input.length) parts.push({ text: input.slice(lastIndex) })
    return parts.map((p, i) => (
      <span key={i} style={{ color: p.color || defaultColor }}>{p.text}</span>
    ))
  }
  return (
    <div className={`kiosk theme-${theme}`}>
      {layout === 'default' && (
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
                autoScrollStartDelayMs={config?.autoScrollStartDelayMs ?? 0}
                onSuccess={() => setLastLoadedAt(new Date().toISOString())}
                onError={(e) => setIframeError(e)}
              />
            </div>
          </div>
          <div className="cell slideshow">
            <Slideshow images={(config as any)?.slides || []} intervalMs={config?.refreshIntervals?.rotateMs || 8000} />
            <div className="clock-overlay">{renderClock(200)}</div>
          </div>
        </div>
      )}

      {layout === 'slideshow' && (
        <div className="grid-slideshow">
          <div className="cell weather"><WeatherWidget location={config?.weatherLocation || 'London'} theme={theme} /></div>
          <div className="cell viewer">
            <div className="ratio-16x9">
              {/* Slideshow in the main area; can be empty */}
              <Slideshow images={(config as any)?.slides || []} intervalMs={config?.refreshIntervals?.rotateMs || 8000} />
            </div>
          </div>
          <div className="cell slideshow">
            <div className="bottom-widgets" style={{
              backgroundImage: (config?.bottomWidgetsBgImage ? `url(${config.bottomWidgetsBgImage})` : undefined),
              backgroundPosition: (config?.bottomWidgetsBgImage ? 'right center' : undefined),
              backgroundRepeat: (config?.bottomWidgetsBgImage ? 'no-repeat' : undefined),
              backgroundSize: (config?.bottomWidgetsBgImage ? 'contain' : undefined),
              backgroundColor: (config?.bottomWidgetsBgColor || undefined),
            }}>
              <div className="bottom-clock">{renderClock(140)}</div>
              <div className="bottom-welcome" style={{ color: config?.welcomeTextColor || '#fff' }}>
                {renderWelcomeText(config?.welcomeText || 'Herzlich Willkommen', config?.welcomeTextColor || '#fff')}
              </div>
            </div>
          </div>
        </div>
      )}

      {layout === 'vertical-3' && (
        <div className="grid-vertical-3">
          <div className="cell v-weather">
            <div className="v-weather-inner">
              <WeatherWidget location={config?.weatherLocation || 'London'} theme={theme} />
              <div className="v-clock">{renderClock(140)}</div>
            </div>
          </div>
          <div className="cell v-slideshow">
            <Slideshow images={(config as any)?.slides || []} intervalMs={config?.refreshIntervals?.rotateMs || 8000} />
          </div>
          <div className="cell v-viewer">
            <WebViewer
              url={url}
              mode={mode}
              snapshotRefreshMs={snapshotMs}
              autoScrollEnabled={!!config?.autoScrollEnabled}
              autoScrollMs={config?.autoScrollMs ?? 30000}
              autoScrollDistancePct={config?.autoScrollDistancePct ?? 25}
              autoScrollStartDelayMs={config?.autoScrollStartDelayMs ?? 0}
              onSuccess={() => setLastLoadedAt(new Date().toISOString())}
              onError={(e) => setIframeError(e)}
            />
          </div>
        </div>
      )}

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


