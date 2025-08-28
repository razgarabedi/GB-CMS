import { useEffect, useState } from 'react'

export type PVCompactWidgetProps = {
  location: string
  theme?: 'dark' | 'light'
  /** PublicDisplayToken from SolarWeb */
  token: string
}

type PvData = {
  IsOnline?: boolean
  AllOnline?: boolean
  P_Grid?: number
  P_Load?: number
  P_Batt?: number
  SOC?: number
  BatMode?: number
  P_PV?: number
}

export default function PVCompactWidget({ location, theme = 'dark', token }: PVCompactWidgetProps) {
  const [pv, setPv] = useState<PvData | null>(null)
  const [weather, setWeather] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

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
        const wq = 'units=metric&lang=de'
        const [pvRes, wRes] = await Promise.all([
          fetch(`${base}/api/pv/solarweb?token=${encodeURIComponent(token)}`),
          fetch(`${base}/api/weather/${encodeURIComponent(location)}?${wq}`),
        ])
        const pvJson = await pvRes.json()
        const wJson = await wRes.json()
        if (!stop) {
          setPv(pvJson || null)
          setWeather(wJson || null)
        }
      } catch (e) {
        if (!stop) setError('PV/Weather unavailable')
      }
    }
    load()
    const id = setInterval(load, 30 * 1000)
    return () => { stop = true; clearInterval(id) }
  }, [location, token])

  const text = theme === 'light' ? '#111' : '#fff'
  const sub = theme === 'light' ? '#333' : '#cbd5e1'

  const pPvKw = toKw(pv?.P_PV)
  const pLoadKw = toKw(pv?.P_Load, true)
  const pGridKw = toKw(pv?.P_Grid)
  const pBattKw = toKw(pv?.P_Batt)
  const socPct = typeof pv?.SOC === 'number' ? Math.round(pv!.SOC!) : null
  const temp = Math.round(weather?.main?.temp ?? NaN)
  const desc = weather?.weather?.[0]?.description || ''
  const icon = weather?.weather?.[0]?.icon || ''
  const iconUrl = icon ? `https://openweathermap.org/img/wn/${icon}.png` : ''

  return (
    <div style={{
      padding: 10,
      boxSizing: 'border-box',
      height: '100%',
      width: '100%',
      display: 'grid',
      gridTemplateRows: 'auto auto 1fr',
      gap: 8,
      color: text,
    }}>
      <div style={{ fontWeight: 800, letterSpacing: .4, fontSize: '2.1vmin' }}>PV & Wetter</div>
      {error && <div style={{ color: '#f87171', fontSize: '1.8vmin' }}>{error}</div>}
      {!error && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', gap: 8 }}>
            <div style={{ fontSize: '1.8vmin', color: sub, fontWeight: 600 }}>PV aktuell</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, alignItems: 'center' }}>
              <Kv label="Erzeugung" value={formatKw(pPvKw)} />
              <Kv label="Verbrauch" value={formatKw(pLoadKw)} />
              <Kv label="Netz" value={formatKw(pGridKw)} />
              <Kv label="Batterie" value={formatKw(pBattKw)} />
              <Kv label="SOC" value={socPct != null ? socPct + '%' : '–'} />
              <Kv label="Status" value={pv?.IsOnline ? 'online' : 'offline'} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', gap: 8 }}>
            <div style={{ fontSize: '1.8vmin', color: sub, fontWeight: 600 }}>Wetter</div>
            <div style={{ display: 'grid', gridTemplateColumns: '42px 1fr', alignItems: 'center', gap: 8 }}>
              {iconUrl && <img src={iconUrl} alt="" style={{ width: 42, height: 42 }} />}
              <div>
                <div style={{ fontSize: '2.8vmin', fontWeight: 800 }}>{isFinite(temp as any) ? `${temp}°` : '–'}</div>
                <div style={{ fontSize: '1.7vmin', color: sub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{desc}</div>
                <div style={{ fontSize: '1.6vmin', color: sub, opacity: 0.9 }}>{location}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function toKw(v?: number | null, abs = false): number | null {
  if (typeof v !== 'number' || !isFinite(v)) return null
  const watts = abs ? Math.abs(v) : v
  return watts / 1000
}

function formatKw(v: number | null): string {
  if (v == null) return '–'
  const n = Math.abs(v) < 10 ? v.toFixed(2) : v.toFixed(1)
  return `${n} kW`
}

function Kv({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateRows: 'auto auto' }}>
      <div style={{ fontSize: '1.5vmin', opacity: 0.85 }}>{label}</div>
      <div style={{ fontSize: '2.1vmin', fontWeight: 800 }}>{value}</div>
    </div>
  )
}


