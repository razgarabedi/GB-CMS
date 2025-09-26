'use client';

import { useEffect, useState } from 'react';

interface ClockWidgetProps {
  timezone?: string;
  format?: '12-hour' | '24-hour';
  size?: 'small' | 'medium' | 'large';
  type?: 'digital' | 'analog';
}

export default function ClockWidget({
  timezone = 'UTC',
  format = '12-hour',
  size = 'medium',
  type = 'digital'
}: ClockWidgetProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    if (format === '12-hour') {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: false 
      });
    }
  };

  const sizeClasses = {
    small: 'text-lg',
    medium: 'text-2xl',
    large: 'text-4xl'
  };

  if (type === 'analog') {
    const hours = currentTime.getHours() % 12;
    const minutes = currentTime.getMinutes();
    const seconds = currentTime.getSeconds();
    
    const hourAngle = (hours * 30) + (minutes * 0.5);
    const minuteAngle = minutes * 6;
    const secondAngle = seconds * 6;

    return (
      <div className="clock-widget h-full w-full flex flex-col items-center justify-center bg-slate-800 rounded-lg">
        <div className="relative w-32 h-32 mb-4">
          <svg className="w-full h-full" viewBox="0 0 200 200">
            {/* Clock face */}
            <circle cx="100" cy="100" r="95" fill="transparent" stroke="rgb(148, 163, 184)" strokeWidth="2"/>
            
            {/* Hour markers */}
            {[...Array(12)].map((_, i) => {
              const angle = (i * 30) - 90;
              const x1 = 100 + 85 * Math.cos(angle * Math.PI / 180);
              const y1 = 100 + 85 * Math.sin(angle * Math.PI / 180);
              const x2 = 100 + 75 * Math.cos(angle * Math.PI / 180);
              const y2 = 100 + 75 * Math.sin(angle * Math.PI / 180);
              
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgb(148, 163, 184)"
                  strokeWidth="2"
                />
              );
            })}
            
            {/* Hour hand */}
            <line
              x1="100"
              y1="100"
              x2={100 + 50 * Math.cos((hourAngle - 90) * Math.PI / 180)}
              y2={100 + 50 * Math.sin((hourAngle - 90) * Math.PI / 180)}
              stroke="rgb(59, 130, 246)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            
            {/* Minute hand */}
            <line
              x1="100"
              y1="100"
              x2={100 + 70 * Math.cos((minuteAngle - 90) * Math.PI / 180)}
              y2={100 + 70 * Math.sin((minuteAngle - 90) * Math.PI / 180)}
              stroke="rgb(34, 197, 94)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            
            {/* Second hand */}
            <line
              x1="100"
              y1="100"
              x2={100 + 80 * Math.cos((secondAngle - 90) * Math.PI / 180)}
              y2={100 + 80 * Math.sin((secondAngle - 90) * Math.PI / 180)}
              stroke="rgb(239, 68, 68)"
              strokeWidth="1"
              strokeLinecap="round"
            />
            
            {/* Center dot */}
            <circle cx="100" cy="100" r="4" fill="rgb(148, 163, 184)"/>
          </svg>
        </div>
        
        <div className="text-center text-slate-300">
          <div className="text-sm font-medium">{timezone}</div>
          <div className="text-xs">{currentTime.toLocaleDateString()}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="clock-widget h-full w-full flex flex-col items-center justify-center bg-slate-800 rounded-lg">
      <div className={`font-mono font-bold text-white ${sizeClasses[size]} mb-2`}>
        {formatTime(currentTime)}
      </div>
      <div className="text-sm text-slate-400 text-center">
        <div>{timezone}</div>
        <div>{currentTime.toLocaleDateString('en-US', { 
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</div>
      </div>
    </div>
  );
}
