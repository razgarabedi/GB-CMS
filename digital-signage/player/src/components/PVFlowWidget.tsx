import { useEffect, useMemo, useRef, useState } from 'react'

export type PVFlowWidgetProps = {
  token: string
  theme?: 'dark' | 'light'
}

type PvData = {
  IsOnline?: boolean
  P_Grid?: number
  P_Load?: number
  P_Batt?: number
  P_PV?: number
  SOC?: number
}

export default function PVFlowWidget({ token, theme = 'dark' }: PVFlowWidgetProps) {
  const [pv, setPv] = useState<PvData | null>(null)
  const [error, setError] = useState<string | null>(null)
  type IconKey = 'sun' | 'load' | 'grid' | 'batt' | 'inv'
  const ICON_PATHS: Record<IconKey, string> = {
    sun: '/pv/sun.png',
    load: '/pv/load.png',
    grid: '/pv/grid.png',
    batt: '/pv/batt.png',
    inv: '/pv/inv.png',
  }
  const [iconAvailable, setIconAvailable] = useState<Record<IconKey, boolean>>({ sun: false, load: false, grid: false, batt: false, inv: false })

  function computeApiBase(): string {
    const env = import.meta.env.VITE_SERVER_URL as string | undefined
    if (env && /^https?:\/\//.test(env)) return env
    const loc = window.location
    const host = loc.hostname
    if (host === 'localhost' || host === '127.0.0.1') return `${loc.protocol}//${host}:3000`
    if (loc.port === '5173' || loc.port === '8080') return `${loc.protocol}//${host}:3000`
    return loc.origin
  }

  const ctrlRef = useRef<AbortController | null>(null)
  useEffect(() => {
    let stop = false
    async function load() {
      try {
        setError(null)
        // abort any in-flight request before starting a new one
        try { ctrlRef.current?.abort() } catch {}
        const ctrl = new AbortController()
        ctrlRef.current = ctrl
        const base = computeApiBase()
        const url = `${base}/api/pv/solarweb?token=${encodeURIComponent(token)}&t=${Date.now()}`
        const r = await fetch(url, { signal: ctrl.signal, cache: 'no-store' as RequestCache })
        const data = await r.json()
        if (!stop) setPv(data || null)
      } catch {
        if (!stop) setError('PV data unavailable')
      }
    }
    load()
    const id = setInterval(load, 5 * 1000)
    return () => { stop = true; clearInterval(id); try { ctrlRef.current?.abort() } catch {} }
  }, [token])

  // probe for optional custom icon images in /pv/*.png
  useEffect(() => {
    (['sun', 'load', 'grid', 'batt', 'inv'] as IconKey[]).forEach((key) => {
      const img = new Image()
      img.onload = () => setIconAvailable(prev => ({ ...prev, [key]: true }))
      img.onerror = () => setIconAvailable(prev => ({ ...prev, [key]: false }))
      img.src = ICON_PATHS[key]
    })
  }, [])

  const colors = theme === 'light'
    ? { text: '#111', sub: '#334155', panel: '#fff', grid: '#e5e7eb' }
    : { text: '#fff', sub: '#cbd5e1', panel: '#0b1220', grid: '#1f2937' }

  const metrics = useMemo(() => {
    const pPv = Math.max(0, pv?.P_PV || 0)
    const pLoad = Math.abs(pv?.P_Load || 0)
    const pGrid = pv?.P_Grid || 0 // >0 import, <0 export
    const pBatt = pv?.P_Batt || 0 // >0 discharge, <0 charge
    const battSoc = typeof pv?.SOC === 'number' ? Math.max(0, Math.min(100, pv!.SOC!)) : null
    const maxW = Math.max(pPv, pLoad, Math.abs(pGrid), Math.abs(pBatt), 1)
    return {
      pPv, pLoad, pGrid, pBatt, battSoc, maxW,
      gridImport: Math.max(0, pGrid),
      gridExport: Math.max(0, -pGrid),
      battDischarge: Math.max(0, pBatt),
      battCharge: Math.max(0, -pBatt),
    }
  }, [pv])

  const size = 460
  const center = { x: size/2, y: size/2 }
  const rOuter = 180
  const nodes = {
    sun: { x: center.x - rOuter * 0.72, y: center.y - rOuter * 0.72 },
    load: { x: center.x + rOuter * 0.72, y: center.y - rOuter * 0.72 },
    grid: { x: center.x - rOuter * 0.72, y: center.y + rOuter * 0.72 },
    batt: { x: center.x + rOuter * 0.72, y: center.y + rOuter * 0.72 },
    inv: center,
  }

  function ring(valueW: number, maxW: number, color: string) {
    const val = Math.max(0, Math.min(1, valueW / Math.max(1, maxW)))
    const radius = 40
    const c = 2 * Math.PI * radius
    const dash = `${(c * val).toFixed(1)} ${c.toFixed(1)}`
    return { radius, c, dash, color }
  }

  function fmtKw(watts: number): string {
    const kw = watts / 1000
    if (Math.abs(kw) < 10) return kw.toFixed(2) + ' kW'
    return kw.toFixed(1) + ' kW'
  }

  function flowPath(a: {x:number,y:number}, b: {x:number,y:number}) {
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.sqrt(dx*dx + dy*dy)
    const ux = dx / len
    const uy = dy / len
    const inset = 30
    const start = { x: a.x + ux * inset, y: a.y + uy * inset }
    const end = { x: b.x - ux * inset, y: b.y - uy * inset }
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`
  }

  function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)) }

  const DOT_DURATION_S = 2.2
  function flowDotRadius(watts: number, maxW: number) {
    const ratio = clamp(watts / Math.max(1, maxW), 0, 1)
    const minR = 2.6
    const maxR = 6.2
    return minR + (maxR - minR) * ratio
  }

  const ringSun = ring(metrics.pPv, metrics.maxW, '#f59e0b')
  const ringLoad = ring(metrics.pLoad, metrics.maxW, '#38bdf8')
  const ringGrid = ring(Math.max(metrics.gridImport, metrics.gridExport), metrics.maxW, '#94a3b8')
  const ringBatt = ring(Math.max(metrics.battCharge, metrics.battDischarge), metrics.maxW, '#10b981')

  const gridFlowIn = metrics.gridImport > 1
  const gridFlowOut = metrics.gridExport > 1
  const battFlowIn = metrics.battCharge > 1
  const battFlowOut = metrics.battDischarge > 1

  return (
    <div className="pv-flow" style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundImage: 'url(/pv/pv.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', background: theme === 'light' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }} />
      <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ position: 'relative', zIndex: 1 }}>
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L8,4 L0,8 z" fill={colors.sub} />
          </marker>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* base connective lines (always visible) */}
        <path id="path-sun-inv" d={flowPath(nodes.sun, nodes.inv)} stroke={colors.grid} strokeWidth="2" fill="none" opacity="0.65" />
        <path id="path-inv-load" d={flowPath(nodes.inv, nodes.load)} stroke={colors.grid} strokeWidth="2" fill="none" opacity="0.65" />
        <path id="path-grid-inv" d={flowPath(nodes.grid, nodes.inv)} stroke={colors.grid} strokeWidth="2" fill="none" opacity="0.65" />
        <path id="path-inv-batt" d={flowPath(nodes.inv, nodes.batt)} stroke={colors.grid} strokeWidth="2" fill="none" opacity="0.65" />

        {/* moving dots to indicate flow direction and magnitude */}
        {/* Sun -> Inverter */}
        {metrics.pPv > 1 && (
          <DotsAlongPath d={flowPath(nodes.sun, nodes.inv)} color="#f59e0b" dur={DOT_DURATION_S} radius={flowDotRadius(metrics.pPv, metrics.maxW)} />
        )}
        {/* Inverter -> Load */}
        {metrics.pLoad > 1 && (
          <DotsAlongPath d={flowPath(nodes.inv, nodes.load)} color="#38bdf8" dur={DOT_DURATION_S} radius={flowDotRadius(metrics.pLoad, metrics.maxW)} />
        )}
        {/* Grid import/export */}
        {gridFlowIn && (
          <DotsAlongPath d={flowPath(nodes.grid, nodes.inv)} color="#94a3b8" dur={DOT_DURATION_S} radius={flowDotRadius(metrics.gridImport, metrics.maxW)} />
        )}
        {gridFlowOut && (
          <DotsAlongPath d={flowPath(nodes.inv, nodes.grid)} color="#94a3b8" dur={DOT_DURATION_S} radius={flowDotRadius(metrics.gridExport, metrics.maxW)} />
        )}
        {/* Battery charge/discharge */}
        {battFlowIn && (
          <DotsAlongPath d={flowPath(nodes.inv, nodes.batt)} color="#10b981" dur={DOT_DURATION_S} radius={flowDotRadius(metrics.battCharge, metrics.maxW)} />
        )}
        {battFlowOut && (
          <DotsAlongPath d={flowPath(nodes.batt, nodes.inv)} color="#10b981" dur={DOT_DURATION_S} radius={flowDotRadius(metrics.battDischarge, metrics.maxW)} />
        )}

        {/* central inverter panel */}
        <g filter="url(#softShadow)">
          <circle cx={nodes.inv.x} cy={nodes.inv.y} r={42} fill={colors.panel} stroke={colors.grid} strokeWidth="2" />
          {iconAvailable.inv ? (() => {
            const invIconSize = Math.min(42 * 1.05, 48)
            const ix = nodes.inv.x - invIconSize / 2
            const iy = nodes.inv.y - invIconSize / 2
            return (
              <image href={ICON_PATHS.inv} x={ix} y={iy} width={invIconSize} height={invIconSize} preserveAspectRatio="xMidYMid slice" />
            )
          })() : (
            <text x={nodes.inv.x} y={nodes.inv.y + 5} textAnchor="middle" fontSize="14" fill={colors.sub}>PV</text>
          )}
        </g>

        {/* node: sun */}
        {renderNode(nodes.sun.x, nodes.sun.y, ringSun, colors, '☀️', fmtKw(metrics.pPv), iconAvailable.sun ? ICON_PATHS.sun : undefined)}
        {/* node: load */}
        {renderNode(nodes.load.x, nodes.load.y, ringLoad, colors, '🔌', fmtKw(metrics.pLoad), iconAvailable.load ? ICON_PATHS.load : undefined)}
        {/* node: grid */}
        {renderNode(nodes.grid.x, nodes.grid.y, ringGrid, colors, '⚡', fmtKw(Math.max(metrics.gridImport, metrics.gridExport)), iconAvailable.grid ? ICON_PATHS.grid : undefined)}
        {/* node: battery */}
        {renderNode(
          nodes.batt.x,
          nodes.batt.y,
          ringBatt,
          colors,
          '🔋',
          (() => {
            const flow = Math.max(metrics.battCharge, metrics.battDischarge)
            const soc = metrics.battSoc
            const flowStr = flow > 0 ? `${fmtKw(flow)}` : ''
            const socStr = soc != null ? `${Math.round(soc)}%` : ''
            return [flowStr, socStr].filter(Boolean).join(' · ')
          })(),
          iconAvailable.batt ? ICON_PATHS.batt : undefined
        )}

        {/* title */}
        <text x={size/2} y={32} textAnchor="middle" fontSize="16" fill={colors.sub} style={{ letterSpacing: 1.2 }}>PV ANLAGE AKTUELLE LEISTUNG</text>
      </svg>
      <style>{``}</style>
      {error && <div style={{ position: 'absolute', bottom: 8, left: 8, color: '#f87171', fontSize: 14 }}>{error}</div>}
    </div>
  )
}

function renderNode(
  x: number,
  y: number,
  ring: { radius: number; c: number; dash: string; color: string },
  colors: any,
  icon: string,
  label: string,
  iconUrl?: string
) {
  const r = ring.radius
  return (
    <g transform={`translate(${x}, ${y})`} filter="url(#softShadow)">
      <circle cx={0} cy={0} r={r + 18} fill="transparent" />
      <circle cx={0} cy={0} r={r} fill={colors.panel} stroke={colors.grid} strokeWidth={2} />
      <circle cx={0} cy={0} r={r} fill="transparent" stroke={ring.color} strokeWidth={8} strokeDasharray={ring.dash} strokeLinecap="round" transform="rotate(-90)" />
      {iconUrl ? (() => {
        const iconSize = Math.min(r * 1.2, 56)
        const x = -iconSize / 2
        const y = -iconSize / 2
        return <image href={iconUrl} x={x} y={y} width={iconSize} height={iconSize} preserveAspectRatio="xMidYMid slice" />
      })() : (
        <text x={0} y={6} textAnchor="middle" fontSize="24" fill={colors.text}>{icon}</text>
      )}
      {(() => {
        const outline = (colors.text || '').toLowerCase() === '#111' ? '#fff' : '#000'
        return (
          <text
            x={0}
            y={r + 28}
            textAnchor="middle"
            fontSize="15"
            fill={colors.text}
            stroke={outline}
            strokeWidth={2}
            strokeOpacity={0.2}
            paintOrder="stroke"
            style={{ fontWeight: 500, letterSpacing: 0.3 }}
          >
            {label}
          </text>
        )
      })()}
    </g>
  )
}

function DotsAlongPath({ d, color, dur, count = 4, radius = 3 }: { d: string; color: string; dur: number; count?: number; radius?: number }) {
  const hiddenPathId = useMemo(() => `p-${Math.random().toString(36).slice(2)}`, [])
  const pathRef = useRef<SVGPathElement | null>(null)
  const [dotCount, setDotCount] = useState<number>(count)

  useEffect(() => {
    const el = pathRef.current
    if (!el) return
    try {
      const length = el.getTotalLength()
      const targetSpacingPx = 48 // desired pixel spacing between dots, consistent across paths
      const computed = Math.max(2, Math.round(length / targetSpacingPx))
      setDotCount(computed)
    } catch {
      // noop: fall back to provided count
      setDotCount(count)
    }
  }, [d, count])

  return (
    <g pointerEvents="none">
      <path ref={pathRef} id={hiddenPathId} d={d} fill="none" stroke="none" />
      {Array.from({ length: dotCount }).map((_, i) => (
        <circle key={i} r={radius} fill={color} opacity={0.95} filter="url(#softShadow)">
          <animateMotion dur={`${dur}s`} repeatCount="indefinite" begin={`${(dur / dotCount) * i}s`}>
            <mpath href={`#${hiddenPathId}`} />
          </animateMotion>
        </circle>
      ))}
    </g>
  )
}


