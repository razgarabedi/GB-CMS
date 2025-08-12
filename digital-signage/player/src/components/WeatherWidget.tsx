import { useEffect, useState } from 'react'

export type WeatherWidgetProps = {
  location: string
  theme?: 'dark' | 'light'
}

/**
 * WeatherWidget fetches weather data from the server's cached proxy endpoint.
 * Shows a simple icon, temperature, and short description. Handles loading state.
 */
export default function WeatherWidget({ location, theme = 'dark' }: WeatherWidgetProps) {
  const [current, setCurrent] = useState<any>(null)
  const [forecast, setForecast] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [animVariant, setAnimVariant] = useState<string>('')
  const [bgUrl, setBgUrl] = useState<string | null>(null)
  const [prevBgUrl, setPrevBgUrl] = useState<string | null>(null)
  const bgFadeMs = 900

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

  // Update animated background when current weather changes
  useEffect(() => {
    if (!current) return
    const next = photoFor(current)
    setPrevBgUrl(bgUrl)
    setBgUrl(next)
    const t = setTimeout(() => setPrevBgUrl(null), bgFadeMs + 50)
    return () => clearTimeout(t)
  }, [current])

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
    <div className={`weather-card ${animVariant}`} style={{ padding: '18px', width: '100%', height: '100%', boxSizing: 'border-box', display: 'grid', gridTemplateRows: 'auto 1fr auto', color: textColor }}>
      {prevBgUrl && (
        <div className="ww-bg previous" style={{ backgroundImage: `${overlay}, url(${prevBgUrl})` }} />
      )}
      {bgUrl && (
        <div className="ww-bg current" style={{ backgroundImage: `${overlay}, url(${bgUrl})` }} />
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
    </div>
  )
}

function formatDay(unix: number, locale: string) {
  return new Date(unix * 1000).toLocaleDateString(locale, { weekday: 'short' })
}

// kept for reference; not used since we switched to photo backgrounds

function photoFor(cur: any): string {
  const code = cur?.weather?.[0]?.main?.toLowerCase() || ''
  // Royalty-free representative backgrounds (Unsplash). Replace with your own assets if needed.
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]
  // Terrain-only selections (no cars/buildings)
  if (/thunder/.test(code)) return pick([
    'https://images.unsplash.com/photo-1500674425229-f692875b0ab7?q=80&w=1920&auto=format&fit=crop', // lightning over plains
    'https://images.unsplash.com/photo-1504386106331-3e4e71712b38?q=80&w=1920&auto=format&fit=crop', // lightning over sea
    'https://images.unsplash.com/photo-1495305379050-64540d6ee95d?q=80&w=1920&auto=format&fit=crop', // storm clouds over fields
  ])
  if (/rain|drizzle/.test(code)) return pick([
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1920&auto=format&fit=crop', // mountain lake, moody rain clouds
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1920&auto=format&fit=crop', // valley under rain clouds
    'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1920&auto=format&fit=crop', // foggy/rainy forest
  ])
  if (/snow/.test(code)) return pick([
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1920&auto=format&fit=crop', // snowy forest
    'https://images.unsplash.com/photo-1482192505345-5655af888cc4?q=80&w=1920&auto=format&fit=crop', // snowy mountain
    'https://images.unsplash.com/photo-1455717974081-0436a066bb96?q=80&w=1920&auto=format&fit=crop', // snow trail in woods
  ])
  if (/cloud/.test(code)) return pick([
    'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?q=80&w=1920&auto=format&fit=crop', // dramatic clouds over hills
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1920&auto=format&fit=crop', // valley with cloud cover
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1920&auto=format&fit=crop', // lake and clouds
  ])
  if (/clear/.test(code)) return pick([
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


