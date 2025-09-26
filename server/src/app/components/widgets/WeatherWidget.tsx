'use client';

import { useState } from 'react';
import { useCurrentTime } from '../../hooks/useHydration';

interface WeatherWidgetProps {
  location?: string;
  showClock?: boolean;
  showAnimatedBg?: boolean;
  theme?: 'light' | 'dark';
}

export default function WeatherWidget({
  location = 'New York',
  showClock = true,
  showAnimatedBg = false,
  theme = 'dark'
}: WeatherWidgetProps) {
  const { value: currentTime, isHydrated } = useCurrentTime(showClock ? 1000 : 0);
  const [weather] = useState({
    temperature: 22,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12
  });

  return (
    <div className={`weather-widget ${theme} ${showAnimatedBg ? 'animated-bg' : ''} h-full w-full relative overflow-hidden rounded-lg`}>
      {showAnimatedBg && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 opacity-20">
          <div className="absolute inset-0 animate-pulse" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
      )}
      
      <div className="relative z-10 p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🌤️</span>
            <div>
              <h3 className="font-semibold text-white">{location}</h3>
              <p className="text-xs text-slate-300">{weather.condition}</p>
            </div>
          </div>
          {showClock && (
            <div className="text-right">
              <div className="text-lg font-mono text-white">
                {isHydrated && currentTime ? currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }) : '--:--'}
              </div>
              <div className="text-xs text-slate-300">
                {isHydrated && currentTime ? currentTime.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                }) : '-- --'}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-light text-white mb-2">
              {weather.temperature}°
            </div>
            <div className="text-sm text-slate-300 space-y-1">
              <div>💧 {weather.humidity}%</div>
              <div>💨 {weather.windSpeed} km/h</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
