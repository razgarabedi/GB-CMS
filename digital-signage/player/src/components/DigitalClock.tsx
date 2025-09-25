import { useEffect, useMemo, useState } from 'react'
import { sanitizeTimeZone } from './clockUtils'
import type { DigitalClockProps } from '../types/ComponentInterfaces'

function formatT(time: Date, tz: string) {
  const safe = sanitizeTimeZone(tz)
  try {
    const fmt = new Intl.DateTimeFormat('de-DE', { timeZone: safe, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    return fmt.format(time)
  } catch {
    const fmt = new Intl.DateTimeFormat('de-DE', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    return fmt.format(time)
  }
}

export default function DigitalClock({ timezone, type = 'minimal', size = 64, color = '#fff' }: DigitalClockProps) {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 500)
    return () => clearInterval(id)
  }, [])
  const text = useMemo(() => formatT(now, timezone), [now, timezone])

  if (type === 'neon') return <Neon text={text} size={size} color={color} />
  if (type === 'flip') return <Flip text={text} size={size} color={color} />
  return <Minimal text={text} size={size} color={color} />
}

function Minimal({ text, size, color }: { text: string; size: number; color: string }) {
  return (
    <div style={{ fontFamily: 'ui-rounded, SF Pro Rounded, Segoe UI, Roboto, system-ui', fontWeight: 700, fontSize: size * 0.66, color, letterSpacing: 1 }}>
      {text}
    </div>
  )
}

function Neon({ text, size, color }: { text: string; size: number; color: string }) {
  const glow = `${color}80`
  return (
    <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: size * 0.7, color, textShadow: `0 0 8px ${glow}, 0 0 16px ${glow}` }}>
      {text}
    </div>
  )
}

function Flip({ text, size, color }: { text: string; size: number; color: string }) {
  const [h, m, s] = text.split(':')
  const cell = (val: string, key: string) => (
    <div key={key} style={{ background: '#111', color, borderRadius: 6, padding: '6px 10px', margin: '0 4px', fontFamily: 'monospace', fontSize: size * 0.62, boxShadow: '0 2px 8px rgba(0,0,0,0.4)'}}>{val}</div>
  )
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {cell(h, 'h')}<span style={{ opacity: 0.8, margin: '0 6px' }}>:</span>{cell(m, 'm')}<span style={{ opacity: 0.8, margin: '0 6px' }}>:</span>{cell(s, 's')}
    </div>
  )
}


