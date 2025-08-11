import { useEffect, useState } from 'react'

export default function Slideshow({ images, intervalMs = 8000 }: { images: string[]; intervalMs?: number }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (!images?.length) return
    const id = setInterval(() => setI((v) => (v + 1) % images.length), intervalMs)
    return () => clearInterval(id)
  }, [images, intervalMs])
  if (!images?.length) return <div style={{ color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>Keine Bilder</div>
  const src = images[i]
  return (
    <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  )
}


