import { useEffect, useState } from 'react'

export type WeatherWidgetProps = {
  location: string
}

/**
 * WeatherWidget fetches weather data from the server's cached proxy endpoint.
 * Shows a simple icon, temperature, and short description. Handles loading state.
 */
export default function WeatherWidget({ location }: WeatherWidgetProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const base = import.meta.env.VITE_SERVER_URL || ''
        const res = await fetch(`${base}/api/weather/${encodeURIComponent(location)}`)
        const json = await res.json()
        if (mounted) setData(json)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    const id = setInterval(load, 10 * 60 * 1000)
    return () => { mounted = false; clearInterval(id) }
  }, [location])

  if (loading) return <div>Loading weather…</div>
  if (!data) return <div>Weather unavailable</div>
  const temp = Math.round(data?.main?.temp)
  const desc = data?.weather?.[0]?.description
  const icon = data?.weather?.[0]?.icon
  const iconUrl = icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : ''
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '4vmin' }}>
      {iconUrl && <img src={iconUrl} alt={desc || 'weather'} style={{ width: 64, height: 64 }} />}
      <div>
        <div>{location}</div>
        <div>{temp}° — {desc}</div>
      </div>
    </div>
  )
}


