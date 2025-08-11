import { useEffect, useRef, useState } from 'react'
import { computeHandAngles } from './clockUtils'

export type AnalogClockProps = {
  /** IANA timezone like 'UTC', 'Europe/Berlin' */
  timezone: string
  /** Size in CSS pixels of the clock face width/height */
  size?: number
  /** Theme colors */
  theme?: {
    background?: string
    tick?: string
    hourHand?: string
    minuteHand?: string
    secondHand?: string
    center?: string
  }
}

/**
 * AnalogClock renders a clock with smooth second hand using requestAnimationFrame.
 * The hands are rotated with CSS transform for smooth animations.
 */
export default function AnalogClock({ timezone, size = 300, theme }: AnalogClockProps) {
  const [now, setNow] = useState(() => new Date())
  const [msFraction, setMsFraction] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    let running = true
    function loop(t: number) {
      const d = new Date()
      setNow(d)
      setMsFraction(d.getMilliseconds() / 1000)
      if (running) rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => { running = false; if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  const { hourDeg, minuteDeg, secondDeg } = computeHandAngles(now, timezone, msFraction)
  const t = {
    background: theme?.background ?? '#000',
    tick: theme?.tick ?? '#444',
    hourHand: theme?.hourHand ?? '#fff',
    minuteHand: theme?.minuteHand ?? '#ddd',
    secondHand: theme?.secondHand ?? '#e33',
    center: theme?.center ?? '#fff',
  }

  const sizePx = `${size}px`
  const center = size / 2
  const handStyle = (width: number, color: string) => ({
    position: 'absolute' as const,
    width: `${width}px`,
    height: `${center - 14}px`,
    background: color,
    top: `${14}px`,
    left: `${center - width / 2}px`,
    transformOrigin: `center ${center - 14}px`,
    borderRadius: '2px',
  })

  return (
    <div style={{ position: 'relative', width: sizePx, height: sizePx, borderRadius: '50%', background: t.background, boxShadow: '0 0 0 2px #222 inset' }}>
      {/* ticks */}
      {[...Array(60)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: i % 5 === 0 ? '4px' : '2px',
          height: i % 5 === 0 ? '12px' : '6px',
          background: t.tick,
          left: `${center - (i % 5 === 0 ? 2 : 1)}px`,
          top: '2px',
          transform: `rotate(${i * 6}deg) translateY(2px)`,
          transformOrigin: 'center 148px',
          borderRadius: '1px'
        }}/>
      ))}

      {/* hour hand */}
      <div style={{ ...handStyle(6, t.hourHand), transform: `rotate(${hourDeg}deg)` }} />
      {/* minute hand */}
      <div style={{ ...handStyle(4, t.minuteHand), transform: `rotate(${minuteDeg}deg)` }} />
      {/* second hand */}
      <div style={{ ...handStyle(2, t.secondHand), transform: `rotate(${secondDeg}deg)` }} />
      {/* center cap */}
      <div style={{ position: 'absolute', width: '12px', height: '12px', borderRadius: '50%', background: t.center, left: `${center - 6}px`, top: `${center - 6}px` }} />
    </div>
  )
}


