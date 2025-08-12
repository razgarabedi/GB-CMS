import { useEffect, useState } from 'react'

function computeApiBase(): string {
  const env = import.meta.env.VITE_SERVER_URL as string | undefined
  if (env && /^https?:\/\//.test(env)) return env
  const loc = window.location
  const host = loc.hostname
  if (host === 'localhost' || host === '127.0.0.1') {
    return `${loc.protocol}//${host}:3000`
  }
  if (loc.port === '5173' || loc.port === '8080') {
    return `${loc.protocol}//${host}:3000`
  }
  return loc.origin
}

function resolveUrl(url: string): string {
  if (!url) return url
  if (/^https?:\/\//i.test(url)) return url
  const base = computeApiBase()
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

export default function Slideshow({ images, intervalMs = 8000 }: { images: string[]; intervalMs?: number }) {
  const [i, setI] = useState(0)
  const [prevI, setPrevI] = useState<number | null>(null)
  const fadeMs = 900

  // Advance slides
  useEffect(() => {
    if (!images?.length) return
    const id = setInterval(() => {
      setI((v) => {
        setPrevI(v)
        return (v + 1) % images.length
      })
    }, intervalMs)
    return () => clearInterval(id)
  }, [images, intervalMs])

  // Reset indices if images change length
  useEffect(() => {
    if (!images?.length) { setI(0); setPrevI(null) }
    else if (i >= images.length) { setI(0); setPrevI(null) }
  }, [images, i])

  // After fade, clear previous image
  useEffect(() => {
    if (prevI === null) return
    const t = setTimeout(() => setPrevI(null), fadeMs + 50)
    return () => clearTimeout(t)
  }, [prevI])

  if (!images?.length) return <div style={{ color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>Keine Bilder</div>

  const src = resolveUrl(images[i])
  const prevSrc = prevI !== null ? resolveUrl(images[prevI]) : null

  return (
    <div className="slideshow-stack">
      {prevSrc && (
        <img
          src={prevSrc}
          className="slide previous"
          alt="previous slide"
        />
      )}
      <img
        key={i}
        src={src}
        className="slide current"
        alt="current slide"
        style={{ animationDuration: `${fadeMs}ms, ${Math.max(intervalMs, fadeMs)}ms` }}
      />
    </div>
  )
}


