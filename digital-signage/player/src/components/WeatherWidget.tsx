import { useEffect, useState } from 'react'

export type WeatherWidgetProps = {
  location: string
}

/**
 * WeatherWidget fetches weather data from the server's cached proxy endpoint.
 * Shows a simple icon, temperature, and short description. Handles loading state.
 */
export default function WeatherWidget({ location }: WeatherWidgetProps) {
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
  const bg = backgroundFor(current)
  const days = (forecast?.daily || []).slice(0, 5)
  const today = new Date().toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
  return (
    <div style={{ padding: '18px', background: bg, width: '100%', height: '100%', boxSizing: 'border-box', display: 'grid', gridTemplateRows: 'auto auto 1fr', color: '#fff' }}>
      <div style={{ fontSize: '2.2vmin', opacity: 0.9 }}>{location}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '96px 1fr', alignItems: 'center', gap: 12 }}>
        {iconUrl && <img src={iconUrl} alt={desc || 'Wetter'} style={{ width: 96, height: 96 }} />}
        <div>
          <div style={{ fontSize: '7vmin', lineHeight: 1 }}>{temp}°</div>
          <div style={{ fontSize: '2.4vmin' }}>{desc}</div>
          {typeof wind === 'number' && <div style={{ fontSize: '2vmin', opacity: 0.85 }}>Wind {wind} km/h</div>}
          <div style={{ fontSize: '2vmin', opacity: 0.85 }}>{today}</div>
        </div>
      </div>
      <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, textAlign: 'center' }}>
        {days.map((d: any, i: number) => (
          <div key={i} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: 6 }}>
            <div style={{ fontSize: '1.9vmin' }}>{formatDay(d.dt, 'de-DE')}</div>
            <img src={`https://openweathermap.org/img/wn/${d.weather?.[0]?.icon}.png`} alt={d.weather?.[0]?.main || ''} />
            <div style={{ fontSize: '2.0vmin' }}>{Math.round(d.temp?.day)}° / {Math.round(d.temp?.night)}°</div>
            {typeof d.precipProbability === 'number' && <div style={{ fontSize: '1.8vmin', opacity: 0.85 }}>{d.precipProbability}%</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

function formatDay(unix: number, locale: string) {
  return new Date(unix * 1000).toLocaleDateString(locale, { weekday: 'short' })
}

function backgroundFor(cur: any): string {
  const code = cur?.weather?.[0]?.main?.toLowerCase() || ''
  switch (true) {
    case /thunder/.test(code):
      return 'linear-gradient(135deg, #2c3e50, #4b79a1)'
    case /rain|drizzle/.test(code):
      return 'linear-gradient(135deg, #283048, #859398)'
    case /snow/.test(code):
      return 'linear-gradient(135deg, #83a4d4, #b6fbff)'
    case /cloud/.test(code):
      return 'linear-gradient(135deg, #757f9a, #d7dde8)'
    case /clear/.test(code):
      return 'linear-gradient(135deg, #2980b9, #6dd5fa)'
    default:
      return 'linear-gradient(135deg, #232526, #414345)'
  }
}


