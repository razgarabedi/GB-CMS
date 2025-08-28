import { useEffect, useState } from 'react'

export type CompactWeatherProps = {
  location: string
  theme?: 'dark' | 'light'
}

export default function CompactWeather({ location, theme = 'dark' }: CompactWeatherProps) {
  const [current, setCurrent] = useState<any>(null)
  const [forecast, setForecast] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [nowMs, setNowMs] = useState<number>(() => Date.now())
  const [bgVideoUrl, setBgVideoUrl] = useState<string | null>(null)

  function computeApiBase(): string {
    const env = import.meta.env.VITE_SERVER_URL as string | undefined
    if (env && /^https?:\/\//.test(env)) return env
    const loc = window.location
    const host = loc.hostname
    if (host === 'localhost' || host === '127.0.0.1') return `${loc.protocol}//${host}:3000`
    if (loc.port === '5173' || loc.port === '8080') return `${loc.protocol}//${host}:3000`
    return loc.origin
  }

  useEffect(() => {
    let stop = false
    async function load() {
      try {
        setError(null)
        const base = computeApiBase()
        const q = 'units=metric&lang=de'
        const [r1, r2] = await Promise.all([
          fetch(`${base}/api/weather/${encodeURIComponent(location)}?${q}`),
          fetch(`${base}/api/forecast/${encodeURIComponent(location)}?${q}`),
        ])
        const cur = await r1.json()
        const fc = await r2.json()
        if (!stop) { setCurrent(cur); setForecast(fc) }
      } catch {
        if (!stop) setError('weather unavailable')
      }
    }
    load()
    const id = setInterval(load, 10 * 60 * 1000)
    return () => { stop = true; clearInterval(id) }
  }, [location])

  // tick every 30s to refresh time display without seconds
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 30000)
    return () => clearInterval(id)
  }, [])

  const temp = Math.round(current?.main?.temp ?? NaN)
  const desc = current?.weather?.[0]?.description || ''
  const icon = current?.weather?.[0]?.icon || ''
  const iconUrl = icon ? `https://openweathermap.org/img/wn/${normalizeIcon(icon)}.png` : ''
  const days = (forecast?.daily || []).slice(0, 3)
  const windKmh: number | undefined = typeof current?.wind?.speedKmh === 'number' ? current.wind.speedKmh : (typeof current?.wind?.speed === 'number' ? Math.round(current.wind.speed * 3.6) : undefined)
  const dateStr = new Date(nowMs).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })
  const timeStr = new Date(nowMs).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })

  // Update animated weather background when current changes
  useEffect(() => {
    if (!current) return
    const cat = categoryFromCurrent(current)
    const localPath = localVideoFor(cat)
    setBgVideoUrl(localPath)
  }, [current])

  const isLight = theme === 'light'
  const text = isLight ? '#111' : '#fff'
  const sub = isLight ? '#334155' : '#cbd5e1'
  const accent = pickAccent(icon, isLight)

  return (
    <div style={{
      position: 'relative',
      overflow: 'hidden',
      height: '100%', width: '100%', boxSizing: 'border-box',
      padding: 10,
      display: 'grid',
      gridTemplateRows: 'auto 1fr',
      gap: 8,
      borderRadius: 10,
      border: isLight ? '1px solid #e5e7eb' : '1px solid #1e293b',
    }}>
      {bgVideoUrl && (
        <video
          className="cw-bg"
          src={bgVideoUrl}
          autoPlay
          muted
          loop
          playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        />
      )}
      <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: isLight ? 'linear-gradient(135deg, #fafafaC0, #f1f5f980)' : 'linear-gradient(135deg, #0a0f1ab0, #0f172a90)' }} />
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
        {iconUrl && <img src={iconUrl} alt="" style={{ width: 44, height: 44, filter: isLight ? 'none' : 'drop-shadow(0 1px 1px rgba(0,0,0,0.6))' }} />}
        <div style={{ display: 'grid', lineHeight: 1 }}>
          <div style={{ fontSize: '3.4vmin', fontWeight: 800, color: text }}>{isFinite(temp as any) ? `${temp}°` : '–'}</div>
          <div style={{ fontSize: '1.6vmin', color: sub, textTransform: 'capitalize' }}>{desc}</div>
          <div style={{ fontSize: '1.5vmin', color: sub, marginTop: 4 }}>
            {dateStr} · {timeStr}{typeof windKmh === 'number' ? ` · Wind ${Math.round(windKmh)} km/h` : ''}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: accent, boxShadow: `0 0 10px ${accent}AA`, animation: 'cwPulse 2.8s ease-in-out infinite' }} />
          <span style={{ fontSize: '1.5vmin', color: sub }}>{location}</span>
        </div>
      </div>
      <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {days.map((d: any, i: number) => (
          <div key={i} style={{
            display: 'grid', gridTemplateRows: 'auto auto', justifyItems: 'center',
            padding: 6, borderRadius: 8,
            background: isLight ? '#ffffff' : 'rgba(255,255,255,0.06)',
            border: isLight ? '1px solid #e5e7eb' : '1px solid #243449',
          }}>
            <div style={{ fontSize: '1.5vmin', color: sub }}>{formatDay(d.dt, 'de-DE')}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <img src={`https://openweathermap.org/img/wn/${normalizeIcon(d.weather?.[0]?.icon || '')}.png`} alt="" style={{ width: 28, height: 28 }} />
              <div style={{ fontSize: '1.6vmin', fontWeight: 700, color: text }}>{Math.round(d.temp?.day)}°</div>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes cwPulse { 0%,100% { transform: scale(1); opacity: .85 } 50% { transform: scale(1.25); opacity: 1 } }
      `}</style>
      {error && <div style={{ color: '#f87171', fontSize: '1.5vmin' }}>{error}</div>}
    </div>
  )
}

function pickAccent(icon: string, light: boolean): string {
  const id = (icon || '').slice(0,2)
  if (id === '01') return light ? '#f59e0b' : '#fbbf24' // clear
  if (id === '02' || id === '03' || id === '04') return light ? '#60a5fa' : '#38bdf8' // clouds
  if (id === '09' || id === '10') return '#3b82f6' // rain
  if (id === '11') return '#f97316' // thunder
  if (id === '13') return '#93c5fd' // snow
  return light ? '#84cc16' : '#22c55e'
}

function normalizeIcon(icon: string): string {
  if (!icon) return '01d'
  const id = icon.slice(0,2)
  if (id === '50') return '01d'
  return icon
}

function formatDay(unix: number, locale: string) {
  return new Date(unix * 1000).toLocaleDateString(locale, { weekday: 'short' })
}

// Helpers to map current weather to our local animated backgrounds
function categoryFromCurrent(cur: any): 'thunder' | 'rain' | 'snow' | 'clouds' | 'clear' | 'mist' {
  const icon: string = String(cur?.weather?.[0]?.icon || '')
  const main: string = String(cur?.weather?.[0]?.main || '').toLowerCase()
  const desc: string = String(cur?.weather?.[0]?.description || '').toLowerCase()
  const icon2 = icon.slice(0, 2)
  if (icon2 === '11') return 'thunder'
  if (icon2 === '09' || icon2 === '10') return 'rain'
  if (icon2 === '13') return 'snow'
  if (icon2 === '02' || icon2 === '03' || icon2 === '04') return 'clouds'
  if (icon2 === '01') return 'clear'
  if (icon2 === '50') return 'mist'
  if (/thunder|storm|gewitter/.test(main) || /thunder|storm|gewitter/.test(desc)) return 'thunder'
  if (/rain|drizzle|regen|schauer/.test(main) || /rain|drizzle|regen|schauer/.test(desc)) return 'rain'
  if (/snow|schnee/.test(main) || /snow|schnee/.test(desc)) return 'snow'
  if (/cloud|bewölkt|wolke|wolkig/.test(main) || /cloud|bewölkt|wolke|wolkig/.test(desc)) return 'clouds'
  if (/mist|fog|nebel|dunst|diesig|haze/.test(main) || /mist|fog|nebel|dunst|diesig|haze/.test(desc)) return 'mist'
  if (/clear|klar|heiter|sonnig/.test(main) || /clear|klar|heiter|sonnig/.test(desc)) return 'clear'
  return 'clear'
}

function localVideoFor(category: string): string | null {
  if (category === 'thunder') return '/videos/weather/thunder-1.mp4'
  if (category === 'rain') return '/videos/weather/rain-1.mp4'
  if (category === 'snow') return '/videos/weather/snow-1.mp4'
  if (category === 'clouds') return '/videos/weather/clouds-1.mp4'
  if (category === 'clear') return '/videos/weather/clear-1.mp4'
  if (category === 'mist') return '/videos/weather/mist-1.mp4'
  return null
}


