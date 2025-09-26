'use client';

import { useEffect, useState } from 'react';

interface SlideshowWidgetProps {
  images?: string[];
  intervalMs?: number;
  animations?: 'fade' | 'slide';
  showControls?: boolean;
}

export default function SlideshowWidget({
  images = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop'
  ],
  intervalMs = 5000,
  animations = 'fade',
  showControls = true
}: SlideshowWidgetProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    if (isPlaying && images.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, intervalMs);
      return () => clearInterval(timer);
    }
  }, [isPlaying, images.length, intervalMs]);

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (images.length === 0) {
    return (
      <div className="slideshow-widget h-full w-full flex items-center justify-center bg-slate-800 rounded-lg">
        <div className="text-center text-slate-400">
          <div className="text-2xl mb-2">🖼️</div>
          <div className="text-sm">No images to display</div>
        </div>
      </div>
    );
  }

  return (
    <div className="slideshow-widget h-full w-full relative bg-slate-800 rounded-lg overflow-hidden group">
      {/* Image container */}
      <div className="relative h-full w-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              animations === 'fade' 
                ? (index === currentIndex ? 'opacity-100' : 'opacity-0')
                : ''
            }`}
            style={{
              transform: animations === 'slide' 
                ? `translateX(${(index - currentIndex) * 100}%)` 
                : undefined,
              transition: animations === 'slide' ? 'transform 0.5s ease-in-out' : undefined
            }}
          >
            {imageErrors[index] ? (
              <div className="h-full w-full flex items-center justify-center bg-slate-700">
                <div className="text-center text-slate-400">
                  <div className="text-2xl mb-2">🖼️</div>
                  <div className="text-sm">Image failed to load</div>
                </div>
              </div>
            ) : (
              <img
                src={image}
                alt={`Slide ${index + 1}`}
                className="h-full w-full object-cover"
                onError={() => handleImageError(index)}
              />
            )}
          </div>
        ))}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* Controls */}
      {showControls && (
        <>
          {/* Play/Pause and Navigation */}
          <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={prevSlide}
              className="w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
            >
              ←
            </button>
            <button
              onClick={nextSlide}
              className="w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
            >
              →
            </button>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between">
              {/* Indicators */}
              <div className="flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex 
                        ? 'bg-white' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>

              {/* Play/Pause */}
              <button
                onClick={togglePlayPause}
                className="w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors text-sm"
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>
            </div>
          </div>

          {/* Image counter */}
          <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}
