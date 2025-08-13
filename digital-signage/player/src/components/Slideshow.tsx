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

type Anim = 'fade' | 'cut' | 'wipe'
export default function Slideshow({ images, intervalMs = 8000, animations = ['fade'] as Anim[], durationMs = 900, preloadNext = true }: { images: string[]; intervalMs?: number; animations?: Anim[]; durationMs?: number; preloadNext?: boolean }) {
  const [i, setI] = useState(0)
  const [prevI, setPrevI] = useState<number | null>(null)
  const fadeMs = Math.max(150, durationMs)

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
  const nextSrc = resolveUrl(images[(i + 1) % images.length || 0])

  // Pick animation for this transition
  const anims = (Array.isArray(animations) && animations.length ? animations : ['fade']) as Anim[]
  const chosen = anims[Math.floor(Math.random() * anims.length)]

  // Compute inline animation styles to ensure effect applies regardless of CSS precedence
  const prevStyle: React.CSSProperties = {
    // transition part
    animationName: chosen === 'wipe' ? 'fadeOut' : 'fadeOut',
    animationDuration: `${fadeMs}ms`,
    animationTimingFunction: chosen === 'cut' ? 'linear' : 'ease',
    animationFillMode: 'forwards',
    // pass vars for kenburns even if not used here
    ['--fx' as any]: `${fadeMs}ms`,
    // keep the last zoomed state so it doesn't snap back before fade completes
    transform: 'scale(1.10) translate3d(0, -1%, 0)'
  }

  const currentStyle: React.CSSProperties = {
    // two animations: transition-in and kenburns
    animationName: chosen === 'fade' ? 'fadeIn, kenburns' : chosen === 'wipe' ? 'wipeIn, kenburns' : 'none, kenburns',
    animationDuration: `${fadeMs}ms, ${Math.max(intervalMs, fadeMs)}ms`,
    animationTimingFunction: chosen === 'cut' ? `linear, ease-in-out` : `ease, ease-in-out`,
    animationFillMode: 'forwards, forwards',
    ['--fx' as any]: `${fadeMs}ms`,
    ['--ken' as any]: `${Math.max(intervalMs, fadeMs)}ms`,
    // for wipe effect, set initial clip-path so keyframes can reveal
    ...(chosen === 'wipe' ? { clipPath: 'inset(0 100% 0 0)' } : {}),
  }

  return (
    <div className="slideshow-stack">
      {prevSrc && (
        <img
          src={prevSrc}
          className={`slide previous anim-${chosen}`}
          alt="previous slide"
          style={prevStyle}
        />
      )}
      <img
        key={i}
        src={src}
        className={`slide current anim-${chosen}`}
        alt="current slide"
        style={currentStyle}
      />
      {/* hidden preloader keeps the next image hot in cache */}
      {preloadNext && <img src={nextSrc} alt="" style={{ display: 'none' }} aria-hidden />}
    </div>
  )
}


