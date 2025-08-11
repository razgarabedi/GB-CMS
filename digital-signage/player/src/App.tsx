import { useEffect, useState } from 'react'
import './index.css'

type Slide = { id: string; type: 'text' | 'image' | 'weather'; content: string };
type Content = { slides: Slide[] };

function App() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL || ''}/api/content`)
        const data: Content = await res.json()
        setSlides(Array.isArray(data.slides) ? data.slides : [])
      } catch {}
    }
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (slides.length === 0) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 8000)
    return () => clearInterval(timer)
  }, [slides])

  const slide = slides[index]
  return (
    <div style={{ height: '100vh', width: '100vw', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {!slide && <div>Waiting for content…</div>}
      {slide?.type === 'text' && (
        <div style={{ fontSize: '6vmin', padding: '2rem', textAlign: 'center' }}>{slide.content}</div>
      )}
      {slide?.type === 'image' && (
        <img src={slide.content} style={{ maxWidth: '100%', maxHeight: '100%' }} />
      )}
      {slide?.type === 'weather' && (
        <Weather city={slide.content} />
      )}
    </div>
  )
}

function Weather({ city }: { city: string }) {
  const [info, setInfo] = useState<any>(null)
  useEffect(() => {
    async function load() {
      try {
        const url = `${import.meta.env.VITE_SERVER_URL || ''}/api/weather?city=${encodeURIComponent(city)}`
        const res = await fetch(url)
        const data = await res.json()
        setInfo(data)
      } catch {}
    }
    load()
  }, [city])
  if (!info) return <div>Loading weather…</div>
  const temp = info?.main?.temp
  const summary = info?.weather?.[0]?.description
  return <div style={{ fontSize: '6vmin' }}>{city}: {Math.round(temp)}°, {summary}</div>
}

export default App
