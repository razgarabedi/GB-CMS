import React, { useState, useEffect } from 'react';
import './Slideshow.css';

interface SlideshowProps {
  images: string[];
  intervalMs: number;
  animations: 'fade' | 'slide';
}

const Slideshow: React.FC<SlideshowProps> = ({ images, intervalMs, animations }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(interval);
  }, [images.length, intervalMs]);

  return (
    <div className={`slideshow ${animations}`}>
      {images.map((image, index) => (
        <img
          key={index}
          src={image}
          alt={`Slide ${index}`}
          className={index === currentIndex ? 'active' : ''}
        />
      ))}
    </div>
  );
};

export default Slideshow;
