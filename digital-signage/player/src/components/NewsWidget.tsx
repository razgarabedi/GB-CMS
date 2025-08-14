import { useEffect, useState } from 'react'

export type NewsWidgetProps = {
  category?: 'wirtschaft' | 'top'
  limit?: number
  theme?: 'dark' | 'light'
  rotationMs?: number
}

function computeApiBase(): string {
  const env = import.meta.env.VITE_SERVER_URL as string | undefined
  if (env && /^https?:\/\//.test(env)) return env
  const loc = window.location
  const host = loc.hostname
  if (host === 'localhost' || host === '127.0.0.1') return `${loc.protocol}//${host}:3000`
  if (loc.port === '5173' || loc.port === '8080') return `${loc.protocol}//${host}:3000`
  return loc.origin
}

export default function NewsWidget({ category = 'wirtschaft', limit = 6, theme = 'dark', rotationMs = 8000 }: NewsWidgetProps) {
  const [items, setItems] = useState<Array<{ title: string; link: string; pubDate?: string; description?: string; summary?: string; image?: string }>>([])
  const [error, setError] = useState<string | null>(null)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    let stop = false
    async function load() {
      try {
        setError(null)
        const base = computeApiBase()
        const u = new URL('/api/news/tagesschau', base)
        u.searchParams.set('category', category)
        u.searchParams.set('limit', String(limit))
        const r = await fetch(u)
        const data = await r.json()
        if (!stop) setItems(Array.isArray(data?.items) ? data.items : [])
      } catch {
        if (!stop) setError('news unavailable')
      }
    }
    load()
    const id = setInterval(load, 10 * 60 * 1000)
    return () => { stop = true; clearInterval(id) }
  }, [category, limit])

  // rotate through items
  useEffect(() => {
    if (!items.length) return
    setIndex(0)
    const id = setInterval(() => setIndex((v) => (v + 1) % items.length), Math.max(2000, rotationMs))
    return () => clearInterval(id)
  }, [items, rotationMs])

  const text = theme === 'light' ? '#111' : '#fff'
  const sub = theme === 'light' ? '#333' : '#cbd5e1'

  function stripHtml(s?: string): string {
    if (!s) return ''
    const decoded = s
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
    return decoded.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  }

  const cur = items[index]
  const imageUrl = cur?.image ? `${computeApiBase()}/api/image?url=${encodeURIComponent(cur.image)}` : null
  return (
    <div style={{
      padding: 12,
      height: '100%',
      width: '100%',
      boxSizing: 'border-box',
      overflow: 'hidden',
      display: 'grid',
      gridTemplateRows: 'auto 1fr',
      color: text,
      position: 'relative',
    }}>
      {imageUrl && (
        <>
          <img
            src={imageUrl}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.12)', transformOrigin: 'center', zIndex: 0, pointerEvents: 'none' }}
          />
          <div
            style={{ position: 'absolute', inset: 0, background: `linear-gradient(${theme === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.55)'}, ${theme === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.55)'})`, zIndex: 1, pointerEvents: 'none' }}
          />
        </>
      )}
      <div style={{ fontWeight: 800, letterSpacing: .4, fontSize: '2.4vmin' }}>Aktuelle Nachrichten</div>
      {error && <div style={{ color: '#f87171', fontSize: '2vmin' }}>{error}</div>}
      {!items.length && !error && <div style={{ fontSize: '2vmin', color: sub }}>Keine Nachrichten</div>}
      {cur && (
        <div style={{ color: text, marginTop: 8, overflow: 'hidden', position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: '2.2vmin', fontWeight: 800, textAlign: 'left' }}>{cur.title}</div>
          {cur.pubDate && <div style={{ fontSize: '1.6vmin', color: sub, marginTop: 6 }}>{new Date(cur.pubDate).toLocaleString('de-DE')}</div>}
          <div style={{ fontSize: '1.9vmin', color: sub, marginTop: 8, lineHeight: 1.25, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as any}>
            {(cur.summary || stripHtml(cur.description))}
          </div>
        </div>
      )}
    </div>
  )
}


