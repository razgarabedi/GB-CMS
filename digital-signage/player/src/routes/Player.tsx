import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import AnalogClock from '../components/AnalogClock'
import DigitalClock from '../components/DigitalClock'
import WeatherWidget from '../components/WeatherWidget'
import WebViewer from '../components/WebViewer'
import Slideshow from '../components/Slideshow'
import NewsWidget from '../components/NewsWidget'
import PVFlowWidget from '../components/PVFlowWidget'
import CompactWeather from '../components/CompactWeather'

type RefreshIntervals = { contentMs: number; rotateMs: number }
type Config = {
  screenId: string
  timezone: string
  weatherLocation: string
  webViewerUrl: string
  webViewerMode?: 'iframe' | 'snapshot'
  snapshotRefreshMs?: number
  theme?: 'dark' | 'light'
  layout?: 'default' | 'slideshow' | 'vertical-3' | 'news' | 'pv' | 'PV'
  welcomeText?: string
  welcomeTextColor?: string
  clockType?: 'analog' | 'digital'
  clockStyle?: 'classic' | 'mono' | 'glass' | 'minimal' | 'neon' | 'flip'
  bottomWidgetsBgColor?: string
  bottomWidgetsBgImage?: string
  slideshowAnimations?: string[]
  slideshowAnimationDurationMs?: number
  powerProfile?: 'performance' | 'balanced' | 'visual'
  slideshowPreloadNext?: boolean
  newsCategory?: 'wirtschaft' | 'top'
  newsLimit?: number
  newsRotationMs?: number
    weatherAnimatedBackground?: boolean
  refreshIntervals: RefreshIntervals
  schedule: any[]
  autoScrollEnabled?: boolean
  autoScrollMs?: number
  autoScrollDistancePct?: number
  autoScrollStartDelayMs?: number
  hideCursor?: boolean
}

// removed legacy hook

export default function Player() {
  const { screenId = '' } = useParams()
  const [config, setConfig] = useState<Config | null>(null)
  const [lastLoadedAt, setLastLoadedAt] = useState<string | null>(null)
  const [iframeError, setIframeError] = useState<string | null>(null)
  const [, setTimeTick] = useState(0)

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

  // lightweight tick to re-evaluate schedule without full config reload
  useEffect(() => {
    const id = setInterval(() => setTimeTick((v) => (v + 1) % 1_000_000), 30_000)
    return () => clearInterval(id)
  }, [])

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
  const effective = getEffectiveConfig(config)
  const theme = effective?.theme || 'dark'
  const layout = (((effective?.layout || 'default') as unknown as string)?.toLowerCase?.() || 'default') as 'default' | 'slideshow' | 'vertical-3' | 'news' | 'pv'
  // Allow URL override for quick kiosk tweaks: ?cursor=none or ?hideCursor=true
  const search = typeof window !== 'undefined' ? window.location.search : ''
  const params = useMemo(() => new URLSearchParams(search), [search])
  const urlHideCursor = (params.get('cursor') === 'none') || (params.get('hideCursor') === 'true')
  const hideCursor = Boolean(effective?.hideCursor) || urlHideCursor
  const clockType = effective?.clockType || 'analog'
  const clockStyle = (effective?.clockStyle as any) || (clockType === 'digital' ? 'minimal' : 'classic')
  const profile = effective?.powerProfile || 'balanced'

  // Apply profile to slideshow defaults if not explicitly set
  const profileAnims = profile === 'performance' ? ['cut'] : profile === 'visual' ? ['fade','wipe'] : ['fade','cut']
  const profileFxMs = profile === 'performance' ? 450 : profile === 'visual' ? 900 : 650
  const animList = (effective?.slideshowAnimations as any) || profileAnims
  const animDur = effective?.slideshowAnimationDurationMs ?? profileFxMs
  const preloadNext = effective?.slideshowPreloadNext ?? true

  function renderClock(size: number) {
    if (clockType === 'digital') {
      const digitalType = (['minimal', 'neon', 'flip'] as const).includes(clockStyle)
        ? (clockStyle as 'minimal' | 'neon' | 'flip')
        : 'minimal'
      const color = theme === 'light'
        ? (digitalType === 'neon' ? '#0077ff' : '#111')
        : (digitalType === 'neon' ? '#00e5ff' : '#fff')
      return <DigitalClock timezone={effective?.timezone || 'UTC'} type={digitalType} size={Math.max(24, Math.round(size * 0.45))} color={color} />
    }
    const t = buildAnalogTheme(clockStyle, theme)
    return <AnalogClock timezone={effective?.timezone || 'UTC'} size={size} theme={t} />
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

  // Compute effective config by applying schedule overrides if a rule is active now
  function getEffectiveConfig(base: Config | null): Config | null {
    if (!base) return base
    const rules = Array.isArray(base.schedule) ? base.schedule : []
    if (!rules.length) return base
    const now = new Date()
    // Use provided timezone if any for day/hour matching by converting to that locale
    const locale = (base.timezone || 'UTC')
    // Build a helper to get weekday (0=Sun..6=Sat) and minutes-of-day in target tz using Intl
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: locale,
      weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
    })
    const parts = fmt.formatToParts(now)
    const wd = parts.find(p => p.type === 'weekday')?.value?.toLowerCase() || ''
    const hourStr = parts.find(p => p.type === 'hour')?.value || '00'
    const minStr = parts.find(p => p.type === 'minute')?.value || '00'
    const minutesOfDay = Number(hourStr) * 60 + Number(minStr)

    // Normalize days names
    const dayAliases: Record<string,string> = { sun:'sun', mon:'mon', tue:'tue', wed:'wed', thu:'thu', fri:'fri', sat:'sat', so:'sun', mo:'mon', di:'tue', mi:'wed', do:'thu', fr:'fri', sa:'sat' }
    const curDay = dayAliases[wd.slice(0,2)] || dayAliases[wd.slice(0,3)] || 'sun'

    const within = (start: string, end: string): boolean => {
      const [sh, sm] = start.split(':').map(n => Number(n) || 0)
      const [eh, em] = end.split(':').map(n => Number(n) || 0)
      const s = sh * 60 + sm
      const e = eh * 60 + em
      if (e >= s) return minutesOfDay >= s && minutesOfDay < e
      // spans midnight
      return minutesOfDay >= s || minutesOfDay < e
    }

    // Find first matching rule (topmost wins). Rule shape: { days: ['mon','tue'], start:'08:00', end:'12:00', overrides: { theme:'light', layout:'news' } }
    const match = rules.find((r: any) => {
      if (!r || typeof r !== 'object') return false
      const ds = Array.isArray(r.days) ? r.days.map((d:any)=>String(d).toLowerCase().slice(0,3)) : null
      if (ds && !ds.includes(curDay)) return false
      const st = typeof r.start === 'string' ? r.start : '00:00'
      const en = typeof r.end === 'string' ? r.end : '24:00'
      return within(st, en)
    })
    if (!match || !match.overrides || typeof match.overrides !== 'object') return base
    return { ...base, ...match.overrides }
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
    <div className={`kiosk theme-${theme} power-${profile} ${hideCursor ? 'hide-cursor' : ''}`}>
      {layout === 'default' && (
        <div className="grid">
          <div className="cell weather"><WeatherWidget location={effective?.weatherLocation || 'London'} theme={theme} showAnimatedBg={!!effective?.weatherAnimatedBackground} /></div>
          <div className="cell viewer">
            <div className="ratio-16x9">
              <WebViewer
                url={url}
                mode={mode}
                snapshotRefreshMs={snapshotMs}
                autoScrollEnabled={profile === 'performance' ? false : !!effective?.autoScrollEnabled}
                autoScrollMs={effective?.autoScrollMs ?? 30000}
                autoScrollDistancePct={effective?.autoScrollDistancePct ?? 25}
                autoScrollStartDelayMs={effective?.autoScrollStartDelayMs ?? 0}
                onSuccess={() => setLastLoadedAt(new Date().toISOString())}
                onError={(e) => setIframeError(e)}
              />
            </div>
          </div>
          <div className="cell slideshow">
            <Slideshow images={(effective as any)?.slides || []} intervalMs={effective?.refreshIntervals?.rotateMs || 8000} animations={animList} durationMs={animDur} preloadNext={preloadNext} />
            <div className="clock-overlay">{renderClock(200)}</div>
          </div>
        </div>
      )}

      {layout === 'slideshow' && (
        <div className="grid-slideshow">
          <div className="cell weather"><WeatherWidget location={effective?.weatherLocation || 'London'} theme={theme} showAnimatedBg={!!effective?.weatherAnimatedBackground} /></div>
          <div className="cell viewer">
            <div className="ratio-16x9">
              {/* Slideshow in the main area; can be empty */}
              <Slideshow images={(effective as any)?.slides || []} intervalMs={effective?.refreshIntervals?.rotateMs || 8000} animations={animList} durationMs={animDur} preloadNext={preloadNext} />
            </div>
          </div>
          <div className="cell slideshow">
            <div className="bottom-widgets" style={{
              backgroundImage: (effective?.bottomWidgetsBgImage ? `url(${effective.bottomWidgetsBgImage})` : undefined),
              backgroundPosition: (config?.bottomWidgetsBgImage ? 'right center' : undefined),
              backgroundRepeat: (config?.bottomWidgetsBgImage ? 'no-repeat' : undefined),
              backgroundSize: (config?.bottomWidgetsBgImage ? 'contain' : undefined),
              backgroundColor: (effective?.bottomWidgetsBgColor || undefined),
            }}>
              <div className="bottom-clock">{renderClock(140)}</div>
              <div className="bottom-welcome" style={{ color: effective?.welcomeTextColor || '#fff' }}>
                {renderWelcomeText(effective?.welcomeText || 'Herzlich Willkommen', effective?.welcomeTextColor || '#fff')}
              </div>
            </div>
          </div>
        </div>
      )}

      {layout === 'pv' && (
        <div className="grid-news">
          <div className="cell weather" style={{ display: 'grid', gridTemplateRows: '1.1fr 1.3fr 0.8fr', height: '100%' }}>
            <div style={{ display: 'contents' }}>
              <div style={{ gridRow: '1 / 2', minHeight: 0, height: '100%', width: '100%', alignSelf: 'stretch', justifySelf: 'stretch' }}>
                <NewsWidget compact theme={theme} category={effective?.newsCategory as any || 'wirtschaft'} limit={Math.min(6, effective?.newsLimit || 6)} rotationMs={effective?.newsRotationMs || 8000} />
              </div>
              <div style={{ gridRow: '2 / 3', minHeight: 0, height: '100%', width: '100%', alignSelf: 'stretch', justifySelf: 'stretch' }}>
                <PVFlowWidget theme={theme} token={String(import.meta.env.VITE_PV_TOKEN || '29fa1885-18ab-43c2-b3f8-b89a0f5cc839')} />
              </div>
              <div style={{ gridRow: '3 / 4', minHeight: 0, height: '100%', width: '100%', alignSelf: 'stretch', justifySelf: 'stretch' }}>
                <CompactWeather location={effective?.weatherLocation || 'London'} theme={theme} />
              </div>
            </div>
          </div>
          <div className="cell viewer">
            <div className="ratio-16x9">
              <Slideshow
                images={(effective as any)?.slides || []}
                intervalMs={effective?.refreshIntervals?.rotateMs || 8000}
                animations={animList}
                durationMs={animDur}
                preloadNext={preloadNext}
              />
            </div>
          </div>
          <div className="cell bottom">
            <div className="bottom-widgets" style={{
              backgroundImage: (effective?.bottomWidgetsBgImage ? `url(${effective.bottomWidgetsBgImage})` : undefined),
              backgroundPosition: (config?.bottomWidgetsBgImage ? 'right center' : undefined),
              backgroundRepeat: (config?.bottomWidgetsBgImage ? 'no-repeat' : undefined),
              backgroundSize: (config?.bottomWidgetsBgImage ? 'contain' : undefined),
              backgroundColor: (effective?.bottomWidgetsBgColor || undefined),
            }}>
              <div className="bottom-welcome" style={{ color: effective?.welcomeTextColor || '#fff' }}>
                {renderWelcomeText(effective?.welcomeText || 'Herzlich Willkommen', effective?.welcomeTextColor || '#fff')}
              </div>
            </div>
          </div>
        </div>
      )}

      {layout === 'news' && (
        <div className="grid-news">
          <div className="cell weather">
            <div style={{ display: 'contents' }}>
              <div style={{ gridRow: '1 / 2', minHeight: 0, height: '100%', width: '100%', alignSelf: 'stretch', justifySelf: 'stretch' }}>
                <NewsWidget theme={theme} category={effective?.newsCategory as any || 'wirtschaft'} limit={effective?.newsLimit || 8} rotationMs={effective?.newsRotationMs || 8000} />
              </div>
              <div style={{ gridRow: '2 / 3', minHeight: 0, height: '100%', width: '100%', alignSelf: 'stretch', justifySelf: 'stretch' }}>
                <WeatherWidget location={effective?.weatherLocation || 'London'} theme={theme} showClock showAnimatedBg={!!effective?.weatherAnimatedBackground} />
              </div>
            </div>
          </div>
          <div className="cell viewer">
            <div className="ratio-16x9">
              <Slideshow
                images={(effective as any)?.slides || []}
                intervalMs={effective?.refreshIntervals?.rotateMs || 8000}
                animations={animList}
                durationMs={animDur}
                preloadNext={preloadNext}
              />
            </div>
          </div>
          <div className="cell bottom">
            <div className="bottom-widgets" style={{
              backgroundImage: (effective?.bottomWidgetsBgImage ? `url(${effective.bottomWidgetsBgImage})` : undefined),
              backgroundPosition: (config?.bottomWidgetsBgImage ? 'right center' : undefined),
              backgroundRepeat: (config?.bottomWidgetsBgImage ? 'no-repeat' : undefined),
              backgroundSize: (config?.bottomWidgetsBgImage ? 'contain' : undefined),
              backgroundColor: (effective?.bottomWidgetsBgColor || undefined),
            }}>
              <div className="bottom-welcome" style={{ color: effective?.welcomeTextColor || '#fff' }}>
                {renderWelcomeText(effective?.welcomeText || 'Herzlich Willkommen', effective?.welcomeTextColor || '#fff')}
              </div>
            </div>
          </div>
        </div>
      )}

      {layout === 'vertical-3' && (
        <div className="grid-vertical-3">
          <div className="cell v-weather">
            <div className="v-weather-inner">
              <WeatherWidget location={effective?.weatherLocation || 'London'} theme={theme} showAnimatedBg={!!effective?.weatherAnimatedBackground} />
              <div className="v-clock">{renderClock(140)}</div>
            </div>
          </div>
          <div className="cell v-slideshow">
            <Slideshow images={(effective as any)?.slides || []} intervalMs={effective?.refreshIntervals?.rotateMs || 8000} animations={animList} durationMs={animDur} preloadNext={preloadNext} />
          </div>
          <div className="cell v-viewer">
            <WebViewer
              url={url}
              mode={mode}
              snapshotRefreshMs={snapshotMs}
                autoScrollEnabled={!!effective?.autoScrollEnabled}
                autoScrollMs={effective?.autoScrollMs ?? 30000}
                autoScrollDistancePct={effective?.autoScrollDistancePct ?? 25}
                autoScrollStartDelayMs={effective?.autoScrollStartDelayMs ?? 0}
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
      {hideCursor && <div className="cursor-hide-overlay" aria-hidden />}
    </div>
  )
}

// component code moved to ../components


