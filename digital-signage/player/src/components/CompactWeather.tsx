import { useEffect, useState } from 'react'
import type { CompactWeatherProps } from '../types/ComponentInterfaces'

export default function CompactWeather({ 
  location, 
  theme = 'dark',
  onError,
  onDataUpdate,
  refreshIntervalMs = 600000 // 10 minutes default
}: CompactWeatherProps) {
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
        if (!stop) { 
          setCurrent(cur)
          setForecast(fc)
          // Notify parent of data update
          onDataUpdate?.({ current: cur, forecast: fc })
        }
      } catch (error) {
        if (!stop) {
          const errorMsg = 'weather unavailable'
          setError(errorMsg)
          onError?.(error instanceof Error ? error : new Error(errorMsg))
        }
      }
    }
    load()
    const id = setInterval(load, refreshIntervalMs)
    return () => { stop = true; clearInterval(id) }
  }, [location, refreshIntervalMs, onError, onDataUpdate])

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
  const todayDaily = Array.isArray(days) && days.length ? days[0] : null
  const todayHi: number | undefined = typeof todayDaily?.temp?.max === 'number' ? Math.round(todayDaily.temp.max) : (typeof todayDaily?.temp?.day === 'number' ? Math.round(todayDaily.temp.day) : undefined)
  const todayLo: number | undefined = typeof todayDaily?.temp?.min === 'number' ? Math.round(todayDaily.temp.min) : (typeof todayDaily?.temp?.night === 'number' ? Math.round(todayDaily.temp.night) : undefined)
  const todayHumidity: number | undefined = typeof todayDaily?.humidity === 'number' ? Math.round(todayDaily.humidity) : (typeof current?.main?.humidity === 'number' ? Math.round(current.main.humidity) : undefined)

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
      padding: 6,
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
      <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: isLight ? 'linear-gradient(135deg, #fafafaB5, #f1f5f975)' : 'linear-gradient(135deg, #0a0f1a9c, #0f172a80)' }} />
      <div style={{ position: 'relative', zIndex: 2, paddingTop: 4 }}>
        <div style={{ position: 'absolute', top: 2, right: 8, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.4)', padding: '4px 8px', borderRadius: 999 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: accent, boxShadow: `0 0 10px ${accent}AA`, animation: 'cwPulse 2.8s ease-in-out infinite' }} />
          <span style={{ fontSize: '1.6vmin', color: '#fff', fontWeight: 600 }}>{location}</span>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.34)', borderRadius: 10, padding: 4, marginTop: 4 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', lineHeight: 1.05 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-start' }}>
            {iconUrl && <img src={iconUrl} alt="" style={{ width: 40, height: 40, filter: isLight ? 'none' : 'drop-shadow(0 1px 1px rgba(0,0,0,0.6))' }} />}
            <div style={{ fontSize: '3.0vmin', fontWeight: 800, color: text }}>{isFinite(temp as any) ? `${temp}°` : '–'}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.7vmin', color: sub, fontWeight: 600, marginBottom: 2 }}>{dateStr}</div>
            <div style={{ fontSize: '3.2vmin', fontWeight: 800, color: text }}>{timeStr}</div>
          </div>
          <div></div>
        </div>
        <div style={{ display: 'grid', justifyItems: 'center', alignItems: 'center', gap: 4 }}>
          <div style={{ fontSize: '1.4vmin', color: sub, textTransform: 'capitalize' }}>{desc}</div>
          <div style={{ fontSize: '1.4vmin', color: sub }}>
            {typeof windKmh === 'number' ? `Wind ${Math.round(windKmh)} km/h` : ''}
            {typeof todayHi === 'number' ? ` · H ${todayHi}°` : ''}
            {typeof todayLo === 'number' ? ` · L ${todayLo}°` : ''}
            {typeof todayHumidity === 'number' ? ` · 💧 ${todayHumidity}%` : ''}
          </div>
        </div>
        </div>
      </div>
      <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, minHeight: 0, alignItems: 'stretch' }}>
        {days.map((d: any, i: number) => (
          <div key={i} style={{
            display: 'grid', gridTemplateRows: 'auto 1fr', justifyItems: 'stretch',
            padding: 6, borderRadius: 8,
            backgroundImage: `${isLight ? 'linear-gradient(0deg, rgba(255,255,255,0.28), rgba(255,255,255,0.28))' : 'linear-gradient(0deg, rgba(0,0,0,0.28), rgba(0,0,0,0.28))'}, url(${photoForIcon(d.weather?.[0]?.icon || '')})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: isLight ? '1px solid #e5e7eb' : '1px solid #243449',
          }}>
            <div style={{ fontSize: '1.5vmin', color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.5)', textAlign: 'center' }}>{formatDay(d.dt, 'de-DE')}</div>
            <div style={{ background: 'rgba(0,0,0,0.38)', borderRadius: 6, padding: 4, width: '100%', boxSizing: 'border-box', display: 'grid', gridTemplateRows: 'auto auto auto', alignItems: 'center', justifyItems: 'center', gap: 4, color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <img src={`https://openweathermap.org/img/wn/${normalizeIcon(d.weather?.[0]?.icon || '')}.png`} alt="" style={{ width: 28, height: 28 }} />
                <div style={{ fontSize: '1.6vmin', fontWeight: 700 }}>{typeof d.temp?.day === 'number' ? Math.round(d.temp.day) + '°' : '–'}</div>
              </div>
              {typeof d.humidity === 'number' && (
                <div style={{ fontSize: '1.4vmin' }}>
                  {`💧 ${Math.round(d.humidity)}%`}
                </div>
              )}
              <div style={{ fontSize: '1.4vmin' }}>
                {`H ${typeof d.temp?.max === 'number' ? Math.round(d.temp.max) + '°' : (typeof d.temp?.day === 'number' ? Math.round(d.temp.day) + '°' : '–')} · L ${typeof d.temp?.min === 'number' ? Math.round(d.temp.min) + '°' : (typeof d.temp?.night === 'number' ? Math.round(d.temp.night) + '°' : '–')}`}
              </div>
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

// Deterministic static photo for daily tiles (terrain only)
function photoForIcon(icon: string): string {
  const id = (icon || '').slice(0, 2)
  const CLEAR = [
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1920&auto=format&fit=crop',
  ]
  const CLOUDS = [
    'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?q=80&w=1920&auto=format&fit=crop',
  ]
  const RAIN = [
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1920&auto=format&fit=crop',
  ]
  const THUNDER = [
    'https://images.unsplash.com/photo-1504386106331-3e4e71712b38?q=80&w=1920&auto=format&fit=crop',
  ]
  const SNOW = [
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1920&auto=format&fit=crop',
  ]
  const MIST = [
    'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1920&auto=format&fit=crop',
  ]
  if (id === '01') return CLEAR[0]
  if (id === '02' || id === '03' || id === '04') return CLOUDS[0]
  if (id === '09' || id === '10') return RAIN[0]
  if (id === '11') return THUNDER[0]
  if (id === '13') return SNOW[0]
  return MIST[0]
}


