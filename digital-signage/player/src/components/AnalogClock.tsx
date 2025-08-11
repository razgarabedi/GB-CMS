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
    function loop() {
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
  const r = size / 2
  const ringRadius = Math.max(20, r - 10)
  const pivotY = r // bottom-origin approach

  const handStyle = (width: number, color: string, length: number) => ({
    position: 'absolute' as const,
    width: `${width}px`,
    height: `${length}px`,
    background: color,
    top: `${pivotY - length}px`,
    left: `${r - width / 2}px`,
    transformOrigin: `center ${length}px`,
    borderRadius: '2px',
  })

  const majorLen = Math.max(10, Math.round(size * 0.12))
  const minorLen = Math.max(6, Math.round(size * 0.06))
  const tickTop = pivotY - ringRadius

  return (
    <div style={{ position: 'relative', width: sizePx, height: sizePx, borderRadius: '50%', background: t.background, boxShadow: '0 0 0 2px rgba(0,0,0,0.4) inset', backdropFilter: 'blur(2px)' }}>
      {/* ticks (properly scaled to size) */}
      {[...Array(60)].map((_, i) => {
        const isMajor = i % 5 === 0
        const w = isMajor ? 4 : 2
        const h = isMajor ? majorLen : minorLen
        return (
          <div key={i} style={{
            position: 'absolute',
            width: `${w}px`,
            height: `${h}px`,
            background: t.tick,
            left: `${r - w / 2}px`,
            top: `${tickTop}px`,
            transform: `rotate(${i * 6}deg)`,
            transformOrigin: `center ${ringRadius}px`,
            borderRadius: '1px',
          }}/>
        )
      })}

      {/* hands */}
      <div style={{ ...handStyle(8, t.hourHand, ringRadius * 0.55), transform: `rotate(${hourDeg}deg)` }} />
      <div style={{ ...handStyle(5, t.minuteHand, ringRadius * 0.78), transform: `rotate(${minuteDeg}deg)` }} />
      <div style={{ ...handStyle(2, t.secondHand, ringRadius * 0.9), transform: `rotate(${secondDeg}deg)`, background: '#e74c3c' }} />

      {/* center cap */}
      <div style={{ position: 'absolute', width: '12px', height: '12px', borderRadius: '50%', background: t.center, left: `${r - 6}px`, top: `${r - 6}px` }} />
    </div>
  )
}


