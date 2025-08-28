import { useEffect, useMemo, useState } from 'react'

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
        const r = await fetch(`${base}/api/pv/solarweb?token=${encodeURIComponent(token)}`)
        const data = await r.json()
        if (!stop) setPv(data || null)
      } catch {
        if (!stop) setError('PV data unavailable')
      }
    }
    load()
    const id = setInterval(load, 30 * 1000)
    return () => { stop = true; clearInterval(id) }
  }, [token])

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
    const start = { x: a.x + ux * 46, y: a.y + uy * 46 }
    const end = { x: b.x - ux * 46, y: b.y - uy * 46 }
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`
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

        {/* connective flows */}
        {/* Sun -> Inverter (always towards inverter) */}
        <path d={flowPath(nodes.sun, nodes.inv)} stroke="#f59e0b" strokeWidth="6" fill="none" strokeDasharray="6 12" className="dash flow-forward" />

        {/* Inverter <-> Load (always from inverter to load) */}
        <path d={flowPath(nodes.inv, nodes.load)} stroke="#38bdf8" strokeWidth="6" fill="none" strokeDasharray="6 12" className="dash flow-forward" />

        {/* Grid flow direction depends on import/export */}
        {gridFlowIn && (
          <path d={flowPath(nodes.grid, nodes.inv)} stroke="#94a3b8" strokeWidth="6" fill="none" strokeDasharray="6 12" className="dash flow-forward" />
        )}
        {gridFlowOut && (
          <path d={flowPath(nodes.inv, nodes.grid)} stroke="#94a3b8" strokeWidth="6" fill="none" strokeDasharray="6 12" className="dash flow-forward" />
        )}

        {/* Battery flow depends on charge/discharge */}
        {battFlowIn && (
          <path d={flowPath(nodes.inv, nodes.batt)} stroke="#10b981" strokeWidth="6" fill="none" strokeDasharray="6 12" className="dash flow-forward" />
        )}
        {battFlowOut && (
          <path d={flowPath(nodes.batt, nodes.inv)} stroke="#10b981" strokeWidth="6" fill="none" strokeDasharray="6 12" className="dash flow-forward" />
        )}

        {/* central inverter panel */}
        <g filter="url(#softShadow)">
          <circle cx={nodes.inv.x} cy={nodes.inv.y} r={42} fill={colors.panel} stroke={colors.grid} strokeWidth="2" />
          <text x={nodes.inv.x} y={nodes.inv.y + 5} textAnchor="middle" fontSize="14" fill={colors.sub}>PV</text>
        </g>

        {/* node: sun */}
        {renderNode(nodes.sun.x, nodes.sun.y, ringSun, colors, '☀️', fmtKw(metrics.pPv))}
        {/* node: load */}
        {renderNode(nodes.load.x, nodes.load.y, ringLoad, colors, '🔌', fmtKw(metrics.pLoad))}
        {/* node: grid */}
        {renderNode(nodes.grid.x, nodes.grid.y, ringGrid, colors, '⚡', fmtKw(Math.max(metrics.gridImport, metrics.gridExport)))}
        {/* node: battery */}
        {renderNode(nodes.batt.x, nodes.batt.y, ringBatt, colors, '🔋', metrics.battDischarge > 0 || metrics.battCharge > 0 ? fmtKw(Math.max(metrics.battCharge, metrics.battDischarge)) : (metrics.battSoc != null ? `${Math.round(metrics.battSoc)} %` : '–'))}

        {/* title */}
        <text x={size/2} y={32} textAnchor="middle" fontSize="16" fill={colors.sub} style={{ letterSpacing: 1.2 }}>AKTUELLE LEISTUNG</text>
      </svg>
      <style>{`
        .pv-flow .dash { animation: flowDash 1400ms linear infinite; }
        @keyframes flowDash { to { stroke-dashoffset: -36; } }
      `}</style>
      {error && <div style={{ position: 'absolute', bottom: 8, left: 8, color: '#f87171', fontSize: 14 }}>{error}</div>}
    </div>
  )
}

function renderNode(x: number, y: number, ring: { radius: number; c: number; dash: string; color: string }, colors: any, icon: string, label: string) {
  const r = ring.radius
  return (
    <g transform={`translate(${x}, ${y})`} filter="url(#softShadow)">
      <circle cx={0} cy={0} r={r + 18} fill="transparent" />
      <circle cx={0} cy={0} r={r} fill="#0a0f1a80" stroke={colors.grid} strokeWidth={2} />
      <circle cx={0} cy={0} r={r} fill="transparent" stroke={ring.color} strokeWidth={8} strokeDasharray={ring.dash} strokeLinecap="round" transform="rotate(-90)" />
      <text x={0} y={6} textAnchor="middle" fontSize="24" fill={colors.text}>{icon}</text>
      <text x={0} y={r + 24} textAnchor="middle" fontSize="14" fill={colors.sub}>{label}</text>
    </g>
  )
}


