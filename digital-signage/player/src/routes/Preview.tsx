import { useEffect, useState } from 'react'
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
  refreshIntervals: RefreshIntervals
  schedule: any[]
  autoScrollEnabled?: boolean
  autoScrollMs?: number
  autoScrollDistancePct?: number
  autoScrollStartDelayMs?: number
  slides?: string[]
}

function withDefaults(cfg: Partial<Config> | null): Config {
  const c = cfg || {}
  return {
    screenId: c.screenId || 'preview',
    timezone: c.timezone || 'UTC',
    weatherLocation: c.weatherLocation || 'London',
    webViewerUrl: c.webViewerUrl || '',
    webViewerMode: c.webViewerMode || 'iframe',
    snapshotRefreshMs: c.snapshotRefreshMs ?? 300000,
    theme: c.theme || 'dark',
    layout: c.layout || 'default',
    welcomeText: c.welcomeText || 'Herzlich Willkommen',
    welcomeTextColor: c.welcomeTextColor || '#ffffff',
    clockType: c.clockType || 'analog',
    clockStyle: c.clockStyle || 'classic',
    bottomWidgetsBgColor: c.bottomWidgetsBgColor || '',
    bottomWidgetsBgImage: c.bottomWidgetsBgImage || '',
    slideshowAnimations: c.slideshowAnimations || ['fade'],
    slideshowAnimationDurationMs: c.slideshowAnimationDurationMs ?? 900,
    powerProfile: c.powerProfile || 'balanced',
    slideshowPreloadNext: c.slideshowPreloadNext ?? true,
    newsCategory: c.newsCategory || 'wirtschaft',
    newsLimit: c.newsLimit ?? 8,
    newsRotationMs: c.newsRotationMs ?? 8000,
    refreshIntervals: c.refreshIntervals || { contentMs: 30000, rotateMs: 8000 },
    schedule: Array.isArray(c.schedule) ? c.schedule : [],
    autoScrollEnabled: c.autoScrollEnabled ?? false,
    autoScrollMs: c.autoScrollMs ?? 30000,
    autoScrollDistancePct: c.autoScrollDistancePct ?? 25,
    autoScrollStartDelayMs: c.autoScrollStartDelayMs ?? 0,
    slides: Array.isArray(c.slides) ? c.slides : [],
  }
}

export default function Preview() {
  const [config, setConfig] = useState<Config>(() => withDefaults(null))
  const [lastLoadedAt, setLastLoadedAt] = useState<string | null>(null)
  const [iframeError, setIframeError] = useState<string | null>(null)
  const [, setTimeTick] = useState(0)

  useEffect(() => {
    const onMsg = (ev: MessageEvent) => {
      try {
        const d = ev.data || {}
        if (d && d.type === 'previewConfig') {
          // Merge shallowly so layout switches and other fields apply immediately
          setConfig((prev) => withDefaults({ ...prev, ...(d.config || {}) }))
        }
      } catch {}
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  // lightweight tick to re-evaluate schedule
  useEffect(() => {
    const id = setInterval(() => setTimeTick(v => (v + 1) % 1_000_000), 30_000)
    return () => clearInterval(id)
  }, [])

  // For live admin preview, use the provided config directly (no schedule override)
  const url = config.webViewerUrl || ''
  const mode = config.webViewerMode || 'iframe'
  const snapshotMs = config.snapshotRefreshMs ?? 300000
  const theme = config.theme || 'dark'
  const layout = (((config.layout || 'default') as unknown as string)?.toLowerCase?.() || 'default') as 'default' | 'slideshow' | 'vertical-3' | 'news' | 'pv'
  const clockType = config.clockType || 'analog'
  const clockStyle = (config.clockStyle as any) || (clockType === 'digital' ? 'minimal' : 'classic')
  const profile = config.powerProfile || 'balanced'

  const profileAnims = profile === 'performance' ? ['cut'] : profile === 'visual' ? ['fade','wipe'] : ['fade','cut']
  const profileFxMs = profile === 'performance' ? 450 : profile === 'visual' ? 900 : 650
  const animList = (config.slideshowAnimations as any) || profileAnims
  const animDur = config.slideshowAnimationDurationMs ?? profileFxMs
  const preloadNext = config.slideshowPreloadNext ?? true

  function renderClock(size: number) {
    if (clockType === 'digital') {
      const digitalType = (['minimal', 'neon', 'flip'] as const).includes(clockStyle)
        ? (clockStyle as 'minimal' | 'neon' | 'flip')
        : 'minimal'
      const color = theme === 'light'
        ? (digitalType === 'neon' ? '#0077ff' : '#111')
        : (digitalType === 'neon' ? '#00e5ff' : '#fff')
      return <DigitalClock timezone={config.timezone || 'UTC'} type={digitalType} size={Math.max(24, Math.round(size * 0.45))} color={color} />
    }
    const t = buildAnalogTheme(clockStyle, theme)
    return <AnalogClock timezone={config.timezone || 'UTC'} size={size} theme={t} />
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
      const normalized = `#${color}`.startsWith('##') ? color : (/#/ .test(color[0]) ? color : (color.match(/^[a-zA-Z]+$/) ? color : `#${color}`))
      parts.push({ text, color: normalized })
      lastIndex = m.index + full.length
    }
    if (lastIndex < input.length) parts.push({ text: input.slice(lastIndex) })
    return parts.map((p, i) => (
      <span key={i} style={{ color: p.color || defaultColor }}>{p.text}</span>
    ))
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

  // Note: schedule overrides are not applied in Preview (live editing). If needed, reintroduce a safe evaluator here.

  return (
    <div className={`kiosk theme-${theme} power-${profile}`}>
      {layout === 'default' && (
        <div className="grid">
          <div className="cell weather"><WeatherWidget location={config.weatherLocation || 'London'} theme={theme} /></div>
          <div className="cell viewer">
            <div className="ratio-16x9">
              <WebViewer
                url={url}
                mode={mode}
                snapshotRefreshMs={snapshotMs}
                autoScrollEnabled={profile === 'performance' ? false : !!config.autoScrollEnabled}
                autoScrollMs={config.autoScrollMs ?? 30000}
                autoScrollDistancePct={config.autoScrollDistancePct ?? 25}
                autoScrollStartDelayMs={config.autoScrollStartDelayMs ?? 0}
                onSuccess={() => setLastLoadedAt(new Date().toISOString())}
                onError={(e) => setIframeError(e)}
              />
            </div>
          </div>
          <div className="cell slideshow">
            <Slideshow images={(config as any)?.slides || []} intervalMs={config.refreshIntervals?.rotateMs || 8000} animations={animList} durationMs={animDur} preloadNext={preloadNext} />
            <div className="clock-overlay">{renderClock(200)}</div>
          </div>
        </div>
      )}

      {layout === 'slideshow' && (
        <div className="grid-slideshow">
          <div className="cell weather"><WeatherWidget location={config.weatherLocation || 'London'} theme={theme} /></div>
          <div className="cell viewer">
            <div className="ratio-16x9">
              <Slideshow images={(config as any)?.slides || []} intervalMs={config.refreshIntervals?.rotateMs || 8000} animations={animList} durationMs={animDur} preloadNext={preloadNext} />
            </div>
          </div>
          <div className="cell slideshow">
            <div className="bottom-widgets" style={{
              backgroundImage: (config.bottomWidgetsBgImage ? `url(${config.bottomWidgetsBgImage})` : undefined),
              backgroundPosition: (config.bottomWidgetsBgImage ? 'right center' : undefined),
              backgroundRepeat: (config.bottomWidgetsBgImage ? 'no-repeat' : undefined),
              backgroundSize: (config.bottomWidgetsBgImage ? 'contain' : undefined),
              backgroundColor: (config.bottomWidgetsBgColor || undefined),
            }}>
              <div className="bottom-clock">{renderClock(140)}</div>
              <div className="bottom-welcome" style={{ color: config.welcomeTextColor || '#fff' }}>
                {renderWelcomeText(config.welcomeText || 'Herzlich Willkommen', config.welcomeTextColor || '#fff')}
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
                <NewsWidget compact theme={theme} category={config.newsCategory as any || 'wirtschaft'} limit={Math.min(6, config.newsLimit || 6)} rotationMs={config.newsRotationMs || 8000} />
              </div>
              <div style={{ gridRow: '2 / 3', minHeight: 0, height: '100%', width: '100%', alignSelf: 'stretch', justifySelf: 'stretch' }}>
                <PVFlowWidget theme={theme} token={String(import.meta.env.VITE_PV_TOKEN || '29fa1885-18ab-43c2-b3f8-b89a0f5cc839')} />
              </div>
              <div style={{ gridRow: '3 / 4', minHeight: 0, height: '100%', width: '100%', alignSelf: 'stretch', justifySelf: 'stretch' }}>
                <CompactWeather location={config.weatherLocation || 'London'} theme={theme} />
              </div>
            </div>
          </div>
          <div className="cell viewer">
            <div className="ratio-16x9">
              <Slideshow
                images={(config as any)?.slides || []}
                intervalMs={config.refreshIntervals?.rotateMs || 8000}
                animations={animList}
                durationMs={animDur}
                preloadNext={preloadNext}
              />
            </div>
          </div>
          <div className="cell bottom">
            <div className="bottom-widgets" style={{
              backgroundImage: (config.bottomWidgetsBgImage ? `url(${config.bottomWidgetsBgImage})` : undefined),
              backgroundPosition: (config.bottomWidgetsBgImage ? 'right center' : undefined),
              backgroundRepeat: (config.bottomWidgetsBgImage ? 'no-repeat' : undefined),
              backgroundSize: (config.bottomWidgetsBgImage ? 'contain' : undefined),
              backgroundColor: (config.bottomWidgetsBgColor || undefined),
            }}>
              <div className="bottom-welcome" style={{ color: config.welcomeTextColor || '#fff' }}>
                {renderWelcomeText(config.welcomeText || 'Herzlich Willkommen', config.welcomeTextColor || '#fff')}
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
                <NewsWidget theme={theme} category={config.newsCategory as any || 'wirtschaft'} limit={config.newsLimit || 8} rotationMs={config.newsRotationMs || 8000} />
              </div>
              <div style={{ gridRow: '2 / 3', minHeight: 0, height: '100%', width: '100%', alignSelf: 'stretch', justifySelf: 'stretch' }}>
                <WeatherWidget location={config.weatherLocation || 'London'} theme={theme} showClock />
              </div>
            </div>
          </div>
          <div className="cell viewer">
            <div className="ratio-16x9">
              <Slideshow
                images={(config as any)?.slides || []}
                intervalMs={config.refreshIntervals?.rotateMs || 8000}
                animations={animList}
                durationMs={animDur}
                preloadNext={preloadNext}
              />
            </div>
          </div>
          <div className="cell bottom">
            <div className="bottom-widgets" style={{
              backgroundImage: (config.bottomWidgetsBgImage ? `url(${config.bottomWidgetsBgImage})` : undefined),
              backgroundPosition: (config.bottomWidgetsBgImage ? 'right center' : undefined),
              backgroundRepeat: (config.bottomWidgetsBgImage ? 'no-repeat' : undefined),
              backgroundSize: (config.bottomWidgetsBgImage ? 'contain' : undefined),
              backgroundColor: (config.bottomWidgetsBgColor || undefined),
            }}>
              <div className="bottom-welcome" style={{ color: config.welcomeTextColor || '#fff' }}>
                {renderWelcomeText(config.welcomeText || 'Herzlich Willkommen', config.welcomeTextColor || '#fff')}
              </div>
            </div>
          </div>
        </div>
      )}

      {layout === 'vertical-3' && (
        <div className="grid-vertical-3">
          <div className="cell v-weather">
            <div className="v-weather-inner">
              <WeatherWidget location={config.weatherLocation || 'London'} theme={theme} />
              <div className="v-clock">{renderClock(140)}</div>
            </div>
          </div>
          <div className="cell v-slideshow">
            <Slideshow images={(config as any)?.slides || []} intervalMs={config.refreshIntervals?.rotateMs || 8000} animations={animList} durationMs={animDur} preloadNext={preloadNext} />
          </div>
          <div className="cell v-viewer">
            <WebViewer
              url={url}
              mode={mode}
              snapshotRefreshMs={snapshotMs}
              autoScrollEnabled={!!config.autoScrollEnabled}
              autoScrollMs={config.autoScrollMs ?? 30000}
              autoScrollDistancePct={config.autoScrollDistancePct ?? 25}
              autoScrollStartDelayMs={config.autoScrollStartDelayMs ?? 0}
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


