import { useEffect, useState } from 'react'

export type WeatherWidgetProps = {
  location: string
  theme?: 'dark' | 'light'
  showClock?: boolean
  showAnimatedBg?: boolean
}

/**
 * WeatherWidget fetches weather data from the server's cached proxy endpoint.
 * Shows a simple icon, temperature, and short description. Handles loading state.
 */
export default function WeatherWidget({ location, theme = 'dark', showClock = false, showAnimatedBg = false }: WeatherWidgetProps) {
  const [current, setCurrent] = useState<any>(null)
  const [forecast, setForecast] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [animVariant, setAnimVariant] = useState<string>('')
  const [bgUrl, setBgUrl] = useState<string | null>(null)
  const [prevBgUrl, setPrevBgUrl] = useState<string | null>(null)
  const [bgAnimSeed, setBgAnimSeed] = useState<number>(() => Math.floor(Math.random()*1000))
  const [bgVideoUrl, setBgVideoUrl] = useState<string | null>(null)
  const [prevBgVideoUrl, setPrevBgVideoUrl] = useState<string | null>(null)
  const [bgVideoFallbackUrl, setBgVideoFallbackUrl] = useState<string | null>(null)
  const [prevBgVideoFallbackUrl, setPrevBgVideoFallbackUrl] = useState<string | null>(null)
  const bgFadeMs = 900
  // ticker for live clock when enabled
  const [nowMs, setNowMs] = useState<number>(() => Date.now())

  function computeApiBase(): string {
    const env = import.meta.env.VITE_SERVER_URL as string | undefined
    if (env && /^https?:\/\//.test(env)) return env
    const loc = window.location
    const host = loc.hostname
    if (host === 'localhost' || host === '127.0.0.1') {
      return `${loc.protocol}//${host}:3000`
    }
    if (loc.port === '5173' || loc.port === '8080') {
      return `${loc.protocol}//${host}:3000`
    }
    return loc.origin
  }

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const base = computeApiBase()
        const q = 'units=metric&lang=de'
        const res1 = await fetch(`${base}/api/weather/${encodeURIComponent(location)}?${q}`)
        const res2 = await fetch(`${base}/api/forecast/${encodeURIComponent(location)}?${q}`)
        const cur = await res1.json()
        const fc = await res2.json()
        if (mounted) {
          setCurrent(cur)
          setForecast(fc)
          // pick a fresh animation variant each successful load
          const variants = ['weather-anim-fade', 'weather-anim-slide', 'weather-anim-zoom', 'weather-anim-rise', 'weather-anim-tilt']
          setAnimVariant(variants[Math.floor(Math.random() * variants.length)])
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    const id = setInterval(load, 10 * 60 * 1000)
    return () => { mounted = false; clearInterval(id) }
  }, [location])

  // live clock updater when showClock is enabled
  useEffect(() => {
    if (!showClock) return
    const id = setInterval(() => setNowMs(Date.now()), 1000)
    return () => clearInterval(id)
  }, [showClock])

  // Update background when current weather changes
  useEffect(() => {
    if (!current) return
    const nextImage = photoFor(current)
    const nextVideo = showAnimatedBg ? videoFor(current, computeApiBase()) : null
    setPrevBgUrl(bgUrl)
    setPrevBgVideoUrl(bgVideoUrl)
    setBgUrl(nextImage)
    setBgVideoUrl(nextVideo?.primary || null)
    setBgVideoFallbackUrl(nextVideo?.fallback || null)
    setPrevBgVideoFallbackUrl(bgVideoFallbackUrl)
    const t = setTimeout(() => setPrevBgUrl(null), bgFadeMs + 50)
    const t2 = setTimeout(() => setPrevBgVideoUrl(null), bgFadeMs + 50)
    return () => { clearTimeout(t); clearTimeout(t2) }
  }, [current])

  // Ensure endless subtle motion when animated backgrounds enabled
  useEffect(() => {
    if (!showAnimatedBg) return
    // change seed occasionally to vary motion subtly
    const id = setInterval(() => setBgAnimSeed((s) => (s + 1) % 10_000), 30000)
    return () => clearInterval(id)
  }, [showAnimatedBg])

  if (loading) return <div>Wetter wird geladen…</div>
  if (!current) return <div>Wetter nicht verfügbar</div>
  const temp = Math.round(current?.main?.temp)
  const desc = current?.weather?.[0]?.description
  const icon = current?.weather?.[0]?.icon
  const wind = current?.wind?.speedKmh
  const iconUrl = icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : ''
  const overlay = theme === 'light'
    ? 'linear-gradient(0deg, rgba(255,255,255,0.35), rgba(255,255,255,0.35))'
    : 'linear-gradient(0deg, rgba(0,0,0,0.35), rgba(0,0,0,0.35))'
  const days = (forecast?.daily || []).slice(0, 5)
  const today = new Date().toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
  const textColor = theme === 'light' ? '#111' : '#fff'
  const subColor = theme === 'light' ? '#333' : '#fff'
  // const chipBg = theme === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.2)'
  return (
    <div className={`weather-card ${animVariant}`} style={{ padding: '18px', width: '100%', height: '100%', boxSizing: 'border-box', display: 'grid', gridTemplateRows: showClock ? 'auto 1fr auto' : 'auto 1fr', color: textColor }}>
      {/* Background: prefer looping video when animated backgrounds are enabled */}
      {showAnimatedBg && (bgVideoUrl || prevBgVideoUrl) ? (
        <>
          {(prevBgVideoUrl || prevBgVideoFallbackUrl) && (
            <video
              key={`prev-${prevBgVideoUrl || prevBgVideoFallbackUrl}`}
              className="ww-bg-video previous"
              src={proxyVideo(prevBgVideoUrl || prevBgVideoFallbackUrl || '')}
              autoPlay
              muted
              loop
              playsInline
            />
          )}
          {(bgVideoUrl || bgVideoFallbackUrl) && (
            <video
              key={`cur-${bgVideoUrl || bgVideoFallbackUrl}`}
              className="ww-bg-video current"
              src={proxyVideo(bgVideoUrl || bgVideoFallbackUrl || '')}
              autoPlay
              muted
              loop
              playsInline
            />
          )}
          {/* Dim overlay to keep text readable */}
          <div className="ww-bg-dim" style={{ background: overlay }} />
        </>
      ) : (
        <>
          {prevBgUrl && (
            <div className={`ww-bg previous ${showAnimatedBg ? 'ww-bg-animated' : ''}`} style={{ backgroundImage: `${overlay}, url(${proxy(bgUrl || prevBgUrl)})` }} />
          )}
          {bgUrl && (
            <div className={`ww-bg current ${showAnimatedBg ? 'ww-bg-animated' : ''}`} style={{ backgroundImage: `${overlay}, url(${proxy(bgUrl)})`, 
              // @ts-ignore CSS variables
              '--ww-pan-seed': bgAnimSeed,
            } as any} />
          )}
        </>
      )}
      <div className="ww-location" style={{ fontSize: '2.2vmin', opacity: 0.85 }}>{location}</div>
      <div className="ww-main" style={{ display: 'grid', gridTemplateColumns: '96px 1fr', alignItems: 'center', gap: 12 }}>
        {iconUrl && <img className="ww-icon" src={iconUrl} alt={desc || 'Wetter'} style={{ width: 96, height: 96 }} />}
        <div>
          <div className="ww-temp" style={{ fontSize: '7vmin', lineHeight: 1, color: subColor }}>{temp}°</div>
          <div className="ww-desc" style={{ fontSize: '2.4vmin' }}>{desc}</div>
          {typeof wind === 'number' && <div className="ww-wind" style={{ fontSize: '2vmin', opacity: 0.8 }}>Wind {wind} km/h</div>}
          <div className="ww-date" style={{ fontSize: '2vmin', opacity: 0.8 }}>{today}</div>
        </div>
      </div>
      <div className="ww-forecast" style={{ alignSelf: 'end', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, textAlign: 'center' }}>
        {days.map((d: any, i: number) => (
          <div key={i} className="day" style={{
            // @ts-ignore custom CSS var for stagger
            '--i': i,
            borderRadius: 8,
            padding: 6,
            minHeight: '8vh',
            backgroundImage: `${theme === 'light' ? 'linear-gradient(0deg, rgba(255,255,255,0.35), rgba(255,255,255,0.35))' : 'linear-gradient(0deg, rgba(0,0,0,0.25), rgba(0,0,0,0.25))'}, url(${photoForIcon(d.weather?.[0]?.icon || '')})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: theme === 'light' ? '#111' : '#fff', textShadow: theme === 'light' ? '0 0 0 transparent' : '0 1px 2px rgba(0,0,0,0.6)'
          } as any}>
            <div style={{ fontSize: '1.6vmin', fontWeight: 600 }}>{formatDay(d.dt, 'de-DE')}</div>
            <DailyIcon icon={d.weather?.[0]?.icon || ''} theme={theme} size={42} />
            <div style={{ fontSize: '1.8vmin', fontWeight: 600 }}>{Math.round(d.temp?.day)}° / {Math.round(d.temp?.night)}°</div>
            {typeof d.precipProbability === 'number' && (
              <div style={{ fontSize: '1.6vmin', display: 'flex', alignItems: 'center', gap: 4, opacity: 0.9 }}>
                <span aria-hidden>💧</span><span>{d.precipProbability}%</span>
              </div>
            )}
          </div>
        ))}
      </div>
      {showClock && (
        <div style={{ marginTop: 12, textAlign: 'center', fontFamily: 'ui-rounded, SF Pro Rounded, Segoe UI, Roboto, system-ui', fontWeight: 700, fontSize: '4vmin', opacity: 0.95 }}>
          {new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(nowMs))}
        </div>
      )}
    </div>
  )
}

function formatDay(unix: number, locale: string) {
  return new Date(unix * 1000).toLocaleDateString(locale, { weekday: 'short' })
}

// kept for reference; not used since we switched to photo backgrounds

function categoryFromCurrent(cur: any): 'thunder' | 'rain' | 'snow' | 'clouds' | 'clear' | 'mist' {
  // Prefer icon prefix if present (works with Open-Meteo mapping), fallback to "main" or description
  const icon: string = String(cur?.weather?.[0]?.icon || '')
  const main: string = String(cur?.weather?.[0]?.main || '').toLowerCase()
  const desc: string = String(cur?.weather?.[0]?.description || '').toLowerCase()
  const icon2 = icon.slice(0, 2) // 01,02,03,04,09,10,11,13,50
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

function photoFor(cur: any): string {
  const category = categoryFromCurrent(cur)
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]
  // Terrain-only selections (no cars/buildings)
  if (category === 'thunder') return pick([
    'https://images.unsplash.com/photo-1500674425229-f692875b0ab7?q=80&w=1920&auto=format&fit=crop', // lightning over plains
    'https://images.unsplash.com/photo-1504386106331-3e4e71712b38?q=80&w=1920&auto=format&fit=crop', // lightning over sea
    'https://images.unsplash.com/photo-1495305379050-64540d6ee95d?q=80&w=1920&auto=format&fit=crop', // storm clouds over fields
  ])
  if (category === 'rain') return pick([
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1920&auto=format&fit=crop', // mountain lake, moody rain clouds
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1920&auto=format&fit=crop', // valley under rain clouds
    'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1920&auto=format&fit=crop', // foggy/rainy forest
  ])
  if (category === 'snow') return pick([
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1920&auto=format&fit=crop', // snowy forest
    'https://images.unsplash.com/photo-1482192505345-5655af888cc4?q=80&w=1920&auto=format&fit=crop', // snowy mountain
    'https://images.unsplash.com/photo-1455717974081-0436a066bb96?q=80&w=1920&auto=format&fit=crop', // snow trail in woods
  ])
  if (category === 'clouds') return pick([
    'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?q=80&w=1920&auto=format&fit=crop', // dramatic clouds over hills
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1920&auto=format&fit=crop', // valley with cloud cover
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1920&auto=format&fit=crop', // lake and clouds
  ])
  if (category === 'clear') return pick([
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1920&auto=format&fit=crop', // clear sky over dunes
    'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=1920&auto=format&fit=crop', // grassland under blue sky
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1920&auto=format&fit=crop', // mountain lake, clear
  ])
  return pick([
    'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1920&auto=format&fit=crop', // misty forest
    'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?q=80&w=1920&auto=format&fit=crop', // cloudy hills
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1920&auto=format&fit=crop', // moody valley
  ])
}

// Optional looping background videos per weather condition
function videoFor(cur: any, base: string): { primary: string | null; fallback: string | null } {
  const category = categoryFromCurrent(cur)
  // Prefer local assets from the player build for smoothness and reliability; fall back to CDN.
  // Place your local mp4 assets under /public/videos/weather/...
  const local = (name: string) => `/videos/weather/${name}.mp4`
  const cdn = (url: string) => url
  if (category === 'thunder') return { primary: local('thunder-1'), fallback: cdn('https://cdn.coverr.co/videos/coverr-thunderstorm-9561/1080p.mp4') }
  if (category === 'rain') return { primary: local('rain-1'), fallback: cdn('https://cdn.coverr.co/videos/coverr-rain-drops-on-window-5905/1080p.mp4') }
  if (category === 'snow') return { primary: local('snow-1'), fallback: cdn('https://cdn.coverr.co/videos/coverr-snowfall-in-forest-7616/1080p.mp4') }
  if (category === 'clouds') return { primary: local('clouds-1'), fallback: cdn('https://cdn.coverr.co/videos/coverr-clouds-timelapse-5734/1080p.mp4') }
  if (category === 'clear') return { primary: local('clear-1'), fallback: cdn('https://cdn.coverr.co/videos/coverr-sunny-sky-8741/1080p.mp4') }
  return { primary: local('mist-1'), fallback: cdn('https://cdn.coverr.co/videos/coverr-morning-mist-over-the-forest-4757/1080p.mp4') }
}

function proxy(u: string): string {
  if (!u) return u
  try {
    const url = new URL(u)
    if (url.origin === window.location.origin) return u
    const base = (import.meta.env.VITE_SERVER_URL as string) || `${window.location.protocol}//${window.location.host}`
    const api = new URL('/api/image', base)
    api.searchParams.set('url', u)
    return api.toString()
  } catch {
    return u
  }
}

function proxyVideo(u: string): string {
  if (!u) return u
  try {
    const url = new URL(u)
    if (url.origin === window.location.origin) return u
    const base = (import.meta.env.VITE_SERVER_URL as string) || `${window.location.protocol}//${window.location.host}`
    const api = new URL('/api/video', base)
    api.searchParams.set('url', u)
    return api.toString()
  } catch {
    return u
  }
}

function photoForIcon(icon: string): string {
  const id = icon.slice(0, 2)
  // Deterministic terrain photos for small daily view (no randomization)
  const pick = (arr: string[]) => arr[0]
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

  if (id === '01') return pick(CLEAR)
  if (id === '02' || id === '03' || id === '04') return pick(CLOUDS)
  if (id === '09' || id === '10') return pick(RAIN)
  if (id === '11') return pick(THUNDER)
  if (id === '13') return pick(SNOW)
  return pick(MIST)
}

function DailyIcon({ icon, size = 42, theme = 'dark' as 'dark' | 'light' }: { icon: string; size?: number; theme?: 'dark' | 'light' }) {
  const src = `https://openweathermap.org/img/wn/${normalizeIcon(icon)}.png`
  const filter = theme === 'light' ? 'none' : 'drop-shadow(0 1px 1px rgba(0,0,0,0.6))'
  return <img src={src} alt="" style={{ width: size, height: size, filter }} />
}

function normalizeIcon(icon: string): string {
  // Ensure sunny icon for clear sky: some providers give 50x codes; map to 01d default if missing
  if (!icon) return '01d'
  const id = icon.slice(0, 2)
  if (id === '50') return '01d' // mist → fallback to clear if unknown
  return icon
}


