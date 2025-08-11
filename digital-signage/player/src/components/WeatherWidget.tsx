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

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const base = import.meta.env.VITE_SERVER_URL || ''
        const q = 'units=metric&lang=de'
        const res1 = await fetch(`${base}/api/weather/${encodeURIComponent(location)}?${q}`)
        const res2 = await fetch(`${base}/api/forecast/${encodeURIComponent(location)}?${q}`)
        const cur = await res1.json()
        const fc = await res2.json()
        if (mounted) { setCurrent(cur); setForecast(fc) }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    const id = setInterval(load, 10 * 60 * 1000)
    return () => { mounted = false; clearInterval(id) }
  }, [location])

  if (loading) return <div>Wetter wird geladen…</div>
  if (!current) return <div>Wetter nicht verfügbar</div>
  const temp = Math.round(current?.main?.temp)
  const desc = current?.weather?.[0]?.description
  const icon = current?.weather?.[0]?.icon
  const wind = current?.wind?.speedKmh
  const iconUrl = icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : ''
  const photoUrl = photoFor(current)
  const overlay = theme === 'light'
    ? 'linear-gradient(0deg, rgba(255,255,255,0.35), rgba(255,255,255,0.35))'
    : 'linear-gradient(0deg, rgba(0,0,0,0.35), rgba(0,0,0,0.35))'
  const days = (forecast?.daily || []).slice(0, 5)
  const today = new Date().toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
  const textColor = theme === 'light' ? '#111' : '#fff'
  const subColor = theme === 'light' ? '#333' : '#fff'
  // const chipBg = theme === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.2)'
  return (
    <div style={{ padding: '18px', width: '100%', height: '100%', boxSizing: 'border-box', display: 'grid', gridTemplateRows: 'auto 1fr auto', color: textColor, backgroundImage: `${overlay}, url(${photoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div style={{ fontSize: '2.2vmin', opacity: 0.85 }}>{location}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '96px 1fr', alignItems: 'center', gap: 12 }}>
        {iconUrl && <img src={iconUrl} alt={desc || 'Wetter'} style={{ width: 96, height: 96 }} />}
        <div>
          <div style={{ fontSize: '7vmin', lineHeight: 1, color: subColor }}>{temp}°</div>
          <div style={{ fontSize: '2.4vmin' }}>{desc}</div>
          {typeof wind === 'number' && <div style={{ fontSize: '2vmin', opacity: 0.8 }}>Wind {wind} km/h</div>}
          <div style={{ fontSize: '2vmin', opacity: 0.8 }}>{today}</div>
        </div>
      </div>
      <div style={{ alignSelf: 'end', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, textAlign: 'center' }}>
        {days.map((d: any, i: number) => (
          <div key={i} style={{
            borderRadius: 8,
            padding: 6,
            minHeight: '8vh',
            backgroundImage: `${theme === 'light' ? 'linear-gradient(0deg, rgba(255,255,255,0.35), rgba(255,255,255,0.35))' : 'linear-gradient(0deg, rgba(0,0,0,0.25), rgba(0,0,0,0.25))'}, url(${photoForIcon(d.weather?.[0]?.icon || '')})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: theme === 'light' ? '#111' : '#fff', textShadow: theme === 'light' ? '0 0 0 transparent' : '0 1px 2px rgba(0,0,0,0.6)'
          }}>
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
  if (/thunder/.test(code)) return 'https://images.unsplash.com/photo-1500674425229-f692875b0ab7?q=80&w=1920&auto=format&fit=crop'
  if (/rain|drizzle/.test(code)) return 'https://images.unsplash.com/photo-1494210950344-7c05e9b93b53?q=80&w=1920&auto=format&fit=crop' // rainy street
  if (/snow/.test(code)) return 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1920&auto=format&fit=crop'
  if (/cloud/.test(code)) return 'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?q=80&w=1920&auto=format&fit=crop' // cloudy sky
  if (/clear/.test(code)) return 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1920&auto=format&fit=crop'
  return 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1920&auto=format&fit=crop' // mist/fog
}

function photoForIcon(icon: string): string {
  const id = icon.slice(0, 2)
  if (id === '01') return photoFor({ weather: [{ main: 'clear' }] })
  if (id === '02' || id === '03' || id === '04') return photoFor({ weather: [{ main: 'clouds' }] })
  if (id === '09' || id === '10') return photoFor({ weather: [{ main: 'rain' }] })
  if (id === '11') return photoFor({ weather: [{ main: 'thunder' }] })
  if (id === '13') return photoFor({ weather: [{ main: 'snow' }] })
  return photoFor({ weather: [{ main: 'mist' }] })
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


