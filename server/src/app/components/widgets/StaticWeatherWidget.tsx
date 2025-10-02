'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useCurrentTime } from '../../hooks/useHydration';
import { useWeather, useGeocoding, WeatherConfig } from '../../hooks/useWeather';
import { StaticWidgetProps, StaticWidgetSize } from '../../types/staticWidgets';
import WeatherIcon from '../WeatherIcon';

// Weather data icon component with fallback
const WeatherDataIcon: React.FC<{
  iconName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ iconName, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const getEmojiFallback = (iconName: string): string => {
    switch (iconName) {
      case 'humidity':
        return '💧';
      case 'wind-speed':
        return '💨';
      case 'pressure':
        return '📊';
      case 'uv':
        return '☀️';
      default:
        return '❓';
    }
  };

  return (
    <img 
      src={`/weather-icons/${iconName}.png`}
      alt={iconName}
      className={`${sizeClasses[size]} ${className}`}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        const parent = target.parentElement;
        if (parent) {
          parent.innerHTML = `<span class="${sizeClasses[size]} ${className}">${getEmojiFallback(iconName)}</span>`;
        }
      }}
    />
  );
};

// Weather background images mapping (same as in useWeather.ts)
const WEATHER_BACKGROUNDS: Record<number, string> = {
  0: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop', // Clear sky
  1: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop', // Mainly clear
  2: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop', // Partly cloudy
  3: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop', // Overcast
  45: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop', // Fog
  48: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop', // Rime fog
  51: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop', // Light drizzle
  53: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop', // Moderate drizzle
  55: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop', // Dense drizzle
  56: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop', // Freezing drizzle
  57: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop', // Dense freezing drizzle
  61: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop', // Slight rain
  63: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop', // Moderate rain
  65: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop', // Heavy rain
  66: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop', // Freezing rain
  67: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop', // Heavy freezing rain
  71: 'https://images.unsplash.com/photo-1551524164-6cf4e4a2a4b8?w=800&h=600&fit=crop', // Snow
  73: 'https://images.unsplash.com/photo-1551524164-6cf4e4a2a4b8?w=800&h=600&fit=crop', // Moderate snow
  75: 'https://images.unsplash.com/photo-1551524164-6cf4e4a2a4b8?w=800&h=600&fit=crop', // Heavy snow
  77: 'https://images.unsplash.com/photo-1551524164-6cf4e4a2a4b8?w=800&h=600&fit=crop', // Snow grains
  80: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop', // Rain showers
  81: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop', // Moderate rain showers
  82: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop', // Violent rain showers
  85: 'https://images.unsplash.com/photo-1551524164-6cf4e4a2a4b8?w=800&h=600&fit=crop', // Snow showers
  86: 'https://images.unsplash.com/photo-1551524164-6cf4e4a2a4b8?w=800&h=600&fit=crop', // Heavy snow showers
  95: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop', // Thunderstorm
  96: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop', // Thunderstorm with hail
  99: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop'  // Violent thunderstorm
};

// Weather animation videos mapping for compact widget
const WEATHER_ANIMATIONS: Record<number, string> = {
  0: '/weather-animations/clear-1.mp4', // Clear sky
  1: '/weather-animations/clear-1.mp4', // Mainly clear
  2: '/weather-animations/clouds-1.mp4', // Partly cloudy
  3: '/weather-animations/clouds-1.mp4', // Overcast
  45: '/weather-animations/mist-1.mp4', // Fog
  48: '/weather-animations/mist-1.mp4', // Rime fog
  51: '/weather-animations/rain-1.mp4', // Light drizzle
  53: '/weather-animations/rain-1.mp4', // Moderate drizzle
  55: '/weather-animations/rain-1.mp4', // Dense drizzle
  56: '/weather-animations/rain-1.mp4', // Freezing drizzle
  57: '/weather-animations/rain-1.mp4', // Dense freezing drizzle
  61: '/weather-animations/rain-1.mp4', // Slight rain
  63: '/weather-animations/rain-1.mp4', // Moderate rain
  65: '/weather-animations/rain-1.mp4', // Heavy rain
  66: '/weather-animations/rain-1.mp4', // Freezing rain
  67: '/weather-animations/rain-1.mp4', // Heavy freezing rain
  71: '/weather-animations/snow-1.mp4', // Snow
  73: '/weather-animations/snow-1.mp4', // Moderate snow
  75: '/weather-animations/snow-1.mp4', // Heavy snow
  77: '/weather-animations/snow-1.mp4', // Snow grains
  80: '/weather-animations/rain-1.mp4', // Rain showers
  81: '/weather-animations/rain-1.mp4', // Moderate rain showers
  82: '/weather-animations/rain-1.mp4', // Violent rain showers
  85: '/weather-animations/snow-1.mp4', // Snow showers
  86: '/weather-animations/snow-1.mp4', // Heavy snow showers
  95: '/weather-animations/thunder-1.mp4', // Thunderstorm
  96: '/weather-animations/thunder-1.mp4', // Thunderstorm with hail
  99: '/weather-animations/thunder-1.mp4'  // Violent thunderstorm
};

interface StaticWeatherWidgetProps extends StaticWidgetProps {
  location?: string;
  latitude?: number;
  longitude?: number;
  showClock?: boolean;
  showAnimatedBg?: boolean;
  theme?: 'light' | 'dark';
  refreshInterval?: number;
  showDetails?: boolean;
}

// Compact Layout (4x4)
const CompactWeatherLayout: React.FC<{
  weather: any;
  forecast: any[];
  displayLocation: string;
  isLoading: boolean;
  hasError: boolean;
  locationError: string | null;
  weatherError: any;
  showClock: boolean;
  currentTime: Date | null;
  isHydrated: boolean;
  getWeatherEmoji: (code: number) => string;
  showAnimatedBg: boolean;
}> = ({
  weather,
  displayLocation,
  isLoading,
  hasError,
  locationError,
  weatherError,
  showClock,
  currentTime,
  isHydrated,
  getWeatherEmoji,
  showAnimatedBg
}) => {
  return (
    <div className="h-full w-full flex flex-col relative overflow-hidden rounded-lg">
      {/* Background - Animated Video or Static Image */}
      {showAnimatedBg ? (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source 
            src={weather ? WEATHER_ANIMATIONS[weather.conditionCode] || WEATHER_ANIMATIONS[0] : WEATHER_ANIMATIONS[0]} 
            type="video/mp4" 
          />
        </video>
      ) : (
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${weather ? WEATHER_BACKGROUNDS[weather.conditionCode] || WEATHER_BACKGROUNDS[0] : WEATHER_BACKGROUNDS[0]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}
      
      {/* Transparent Black Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Content */}
      <div className="relative z-10 h-full w-full flex flex-col p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <WeatherIcon conditionCode={weather?.conditionCode || 0} size="md" className="text-white" />
            <div>
              <h3 className="font-medium text-white text-sm">{displayLocation}</h3>
              <p className="text-xs text-slate-300">
                {isLoading ? 'Loading...' : 
                 hasError ? 'Error' : 
                 weather ? weather.condition : 'Unknown'}
              </p>
            </div>
          </div>
          {showClock && (
            <div className="text-right">
              <div className="text-sm font-mono text-white">
                {isHydrated && currentTime ? currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }) : '--:--'}
              </div>
            </div>
          )}
        </div>
      
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center">
        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-1"></div>
            <div className="text-xs text-slate-300">Loading...</div>
          </div>
        ) : hasError ? (
          <div className="text-center">
            <div className="text-2xl font-light text-white mb-1">⚠️</div>
            <div className="text-xs text-slate-300">
              {locationError || weatherError?.message || 'Failed to load'}
            </div>
          </div>
        ) : weather ? (
          <div className="text-center">
            <div className="text-2xl font-light text-white mb-1">
              {weather.temperature}°
            </div>
            <div className="text-xs text-slate-300 flex items-center justify-center space-x-2">
              <WeatherDataIcon iconName="humidity" size="sm" />
              <span>{weather.humidity}%</span>
              <span>|</span>
              <WeatherDataIcon iconName="wind-speed" size="sm" />
              <span>{weather.windSpeed} km/h</span>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-2xl font-light text-white mb-1">--°</div>
            <div className="text-xs text-slate-300">No data</div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

// Medium Layout (7x6) - Based on the provided design
const MediumWeatherLayout: React.FC<{
  weather: any;
  forecast: any[];
  displayLocation: string;
  isLoading: boolean;
  hasError: boolean;
  locationError: string | null;
  weatherError: any;
  showClock: boolean;
  currentTime: Date | null;
  isHydrated: boolean;
  getWeatherEmoji: (code: number) => string;
  showAnimatedBg: boolean;
}> = ({
  weather,
  forecast,
  displayLocation,
  isLoading,
  hasError,
  locationError,
  weatherError,
  showClock,
  currentTime,
  isHydrated,
  getWeatherEmoji,
  showAnimatedBg
}) => {
  return (
    <div className="h-full w-full flex flex-col rounded-lg overflow-hidden relative">
      {/* Background - Animated Video or Static Image */}
      {showAnimatedBg ? (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source 
            src={weather ? WEATHER_ANIMATIONS[weather.conditionCode] || WEATHER_ANIMATIONS[0] : WEATHER_ANIMATIONS[0]} 
            type="video/mp4" 
          />
        </video>
      ) : (
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${weather ? WEATHER_BACKGROUNDS[weather.conditionCode] || WEATHER_BACKGROUNDS[0] : WEATHER_BACKGROUNDS[0]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}
      
      {/* Transparent Black Overlay for entire widget */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Top Section - Current Weather */}
      <div className="flex-1 relative p-0.5 z-10">
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Location Button */}
          <div className="absolute top-0 right-0">
            <div className="bg-blue-500 text-white px-1.5 py-0.5 rounded-full text-xs font-medium">
              {displayLocation}
            </div>
          </div>

          {/* Date and Time */}
          <div className="text-center mb-0.5">
            <div className="text-white text-xs mb-0.5">
              {isHydrated && currentTime ? currentTime.toLocaleDateString('de-DE', { 
                weekday: 'short', 
                day: '2-digit', 
                month: '2-digit' 
              }) : '--, --.--'}
            </div>
            <div className="text-white text-xs font-bold">
              {isHydrated && currentTime ? currentTime.toLocaleTimeString('de-DE', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }) : '--:--'}
            </div>
          </div>

          {/* Current Weather */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <WeatherIcon conditionCode={weather?.conditionCode || 0} size="sm" className="text-white" />
              <div className="text-sm font-light text-white">
                {weather ? weather.temperature : '--'}°
              </div>
            </div>
          </div>

          {/* Weather Condition */}
          <div className="text-center mt-0.5">
            <div className="text-white text-xs">
              {isLoading ? 'Loading...' : 
               hasError ? 'Error loading weather' : 
               weather ? weather.condition : 'Unknown'}
            </div>
          </div>

          {/* Additional Details */}
          <div className="flex items-center justify-center space-x-1 mt-0.5 text-white text-xs">
            <div>Wind {weather ? weather.windSpeed : '--'} km/h</div>
            <div>H {weather ? weather.high || weather.temperature : '--'}°</div>
            <div>L {weather ? weather.low || weather.temperature : '--'}°</div>
            <div className="flex items-center space-x-1">
              <WeatherDataIcon iconName="humidity" size="sm" />
              <span>{weather ? weather.humidity : '--'}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - 3-Day Forecast with Spacing */}
      <div className="h-31 flex gap-1.5 p-1 z-15">
        {forecast && forecast.length > 0 ? (
          forecast.map((day, index) => {
            console.log(`Forecast day ${index + 1}:`, {
              dayName: day.dayName,
              conditionCode: day.conditionCode,
              condition: day.condition,
              backgroundImage: day.backgroundImage
            });
            
            return (
            <div
              key={index}
              className="flex-1 relative overflow-hidden rounded-lg"
              style={{
                backgroundImage: `url(${day.backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
              onError={(e) => {
                console.log(`Background image failed to load for day ${index + 1}:`, day.backgroundImage);
                // Fallback to a default background
                e.currentTarget.style.backgroundImage = 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop)';
              }}
            >
              {/* Transparent Black Overlay */}
              <div className="absolute inset-0 bg-black/40"></div>
              
              {/* Content */}
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-white p-1">
                <div className="text-xs font-medium mb-0.5">{day.dayName}</div>
                <div className="text-lg mb-0.5">{day.temperature}°</div>
                <div className="mb-0.5">
                  <WeatherIcon conditionCode={day.conditionCode} size="sm" className="text-white" />
                </div>
                <div className="text-xs text-center">
                  <div>H {day.high}° • L {day.low}°</div>
                  <div className="flex items-center justify-center space-x-1 mt-0.5">
                    <WeatherDataIcon iconName="humidity" size="sm" />
                    <span>{day.precipitation}%</span>
                  </div>
                </div>
              </div>
            </div>
            );
          })
        ) : (
          // Fallback when no forecast data
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex-1 bg-slate-700 rounded-lg flex flex-col items-center justify-center text-white p-1"
            >
              <div className="text-xs font-medium mb-0.5">--</div>
              <div className="text-lg mb-0.5">--°</div>
              <div className="mb-0.5">
                <WeatherIcon conditionCode={0} size="sm" className="text-white" />
              </div>
              <div className="text-xs text-center">
                <div>H --° • L --°</div>
                <div className="flex items-center justify-center space-x-1 mt-0.5">
                  <WeatherDataIcon iconName="humidity" size="sm" />
                  <span>--%</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Large Layout (8x7)
const LargeWeatherLayout: React.FC<{
  weather: any;
  forecast: any[];
  displayLocation: string;
  isLoading: boolean;
  hasError: boolean;
  locationError: string | null;
  weatherError: any;
  showClock: boolean;
  currentTime: Date | null;
  isHydrated: boolean;
  getWeatherEmoji: (code: number) => string;
  showAnimatedBg: boolean;
}> = ({
  weather,
  displayLocation,
  isLoading,
  hasError,
  locationError,
  weatherError,
  showClock,
  currentTime,
  isHydrated,
  getWeatherEmoji,
  showAnimatedBg
}) => {
  return (
    <div className="h-full w-full flex flex-col relative overflow-hidden rounded-lg">
      {/* Background - Animated Video or Static Image */}
      {showAnimatedBg ? (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source 
            src={weather ? WEATHER_ANIMATIONS[weather.conditionCode] || WEATHER_ANIMATIONS[0] : WEATHER_ANIMATIONS[0]} 
            type="video/mp4" 
          />
        </video>
      ) : (
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${weather ? WEATHER_BACKGROUNDS[weather.conditionCode] || WEATHER_BACKGROUNDS[0] : WEATHER_BACKGROUNDS[0]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}
      
      {/* Transparent Black Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Content */}
      <div className="relative z-10 h-full w-full flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <WeatherIcon conditionCode={weather?.conditionCode || 0} size="xl" className="text-white" />
          <div>
            <h3 className="font-bold text-white text-xl">{displayLocation}</h3>
            <p className="text-base text-slate-300">
              {isLoading ? 'Loading weather data...' : 
               hasError ? 'Error loading weather' : 
               weather ? weather.condition : 'Unknown condition'}
            </p>
          </div>
        </div>
        {showClock && (
          <div className="text-right">
            <div className="text-2xl font-mono text-white">
              {isHydrated && currentTime ? currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }) : '--:--'}
            </div>
            <div className="text-base text-slate-300">
              {isHydrated && currentTime ? currentTime.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              }) : '-- --'}
            </div>
          </div>
        )}
      </div>
      
      {/* Main content with detailed layout */}
      <div className="flex-1 flex items-center justify-center">
        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <div className="text-base text-slate-300">Loading weather data...</div>
          </div>
        ) : hasError ? (
          <div className="text-center">
            <div className="text-6xl font-light text-white mb-3">⚠️</div>
            <div className="text-base text-slate-300">
              {locationError || weatherError?.message || 'Failed to load weather data'}
            </div>
          </div>
        ) : weather ? (
          <div className="text-center w-full">
            <div className="text-6xl font-light text-white mb-4">
              {weather.temperature}°
            </div>
            <div className="grid grid-cols-3 gap-6 text-base text-slate-300 mb-4">
              <div className="bg-slate-700/30 rounded-lg p-3">
                <WeatherDataIcon iconName="humidity" size="md" className="mb-1" />
                <div className="font-semibold">{weather.humidity}%</div>
                <div className="text-sm">Humidity</div>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <WeatherDataIcon iconName="wind-speed" size="md" className="mb-1" />
                <div className="font-semibold">{weather.windSpeed} km/h</div>
                <div className="text-sm">Wind Speed</div>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <WeatherDataIcon iconName="pressure" size="md" className="mb-1" />
                <div className="font-semibold">{weather.pressure} hPa</div>
                <div className="text-sm">Pressure</div>
              </div>
            </div>
            {weather.lastUpdated && (
              <div className="text-sm text-slate-400">
                Last updated: {weather.lastUpdated.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="text-6xl font-light text-white mb-4">--°</div>
            <div className="text-base text-slate-300">No weather data available</div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

// XLarge Layout (9x7)
const XLargeWeatherLayout: React.FC<{
  weather: any;
  forecast: any[];
  displayLocation: string;
  isLoading: boolean;
  hasError: boolean;
  locationError: string | null;
  weatherError: any;
  showClock: boolean;
  currentTime: Date | null;
  isHydrated: boolean;
  getWeatherEmoji: (code: number) => string;
  showAnimatedBg: boolean;
}> = ({
  weather,
  displayLocation,
  isLoading,
  hasError,
  locationError,
  weatherError,
  showClock,
  currentTime,
  isHydrated,
  getWeatherEmoji,
  showAnimatedBg
}) => {
  return (
    <div className="h-full w-full flex flex-col relative overflow-hidden rounded-lg">
      {/* Background - Animated Video or Static Image */}
      {showAnimatedBg ? (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source 
            src={weather ? WEATHER_ANIMATIONS[weather.conditionCode] || WEATHER_ANIMATIONS[0] : WEATHER_ANIMATIONS[0]} 
            type="video/mp4" 
          />
        </video>
      ) : (
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${weather ? WEATHER_BACKGROUNDS[weather.conditionCode] || WEATHER_BACKGROUNDS[0] : WEATHER_BACKGROUNDS[0]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}
      
      {/* Transparent Black Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Content */}
      <div className="relative z-10 h-full w-full flex flex-col p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-6">
          <WeatherIcon conditionCode={weather?.conditionCode || 0} size="xl" className="text-white" />
          <div>
            <h3 className="font-bold text-white text-2xl">{displayLocation}</h3>
            <p className="text-lg text-slate-300">
              {isLoading ? 'Loading weather data...' : 
               hasError ? 'Error loading weather' : 
               weather ? weather.condition : 'Unknown condition'}
            </p>
          </div>
        </div>
        {showClock && (
          <div className="text-right">
            <div className="text-3xl font-mono text-white">
              {isHydrated && currentTime ? currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }) : '--:--'}
            </div>
            <div className="text-lg text-slate-300">
              {isHydrated && currentTime ? currentTime.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              }) : '-- --'}
            </div>
          </div>
        )}
      </div>
      
      {/* Main content with comprehensive layout */}
      <div className="flex-1 flex items-center justify-center">
        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-6"></div>
            <div className="text-lg text-slate-300">Loading weather data...</div>
          </div>
        ) : hasError ? (
          <div className="text-center">
            <div className="text-8xl font-light text-white mb-4">⚠️</div>
            <div className="text-lg text-slate-300">
              {locationError || weatherError?.message || 'Failed to load weather data'}
            </div>
          </div>
        ) : weather ? (
          <div className="text-center w-full">
            <div className="text-8xl font-light text-white mb-6">
              {weather.temperature}°
            </div>
            <div className="grid grid-cols-4 gap-6 text-lg text-slate-300 mb-6">
              <div className="bg-slate-700/30 rounded-xl p-4">
                <WeatherDataIcon iconName="humidity" size="lg" className="mb-2" />
                <div className="font-bold text-xl">{weather.humidity}%</div>
                <div className="text-sm">Humidity</div>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-4">
                <WeatherDataIcon iconName="wind-speed" size="lg" className="mb-2" />
                <div className="font-bold text-xl">{weather.windSpeed} km/h</div>
                <div className="text-sm">Wind Speed</div>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-4">
                <WeatherDataIcon iconName="pressure" size="lg" className="mb-2" />
                <div className="font-bold text-xl">{weather.pressure} hPa</div>
                <div className="text-sm">Pressure</div>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-4">
                <WeatherDataIcon iconName="uv" size="lg" className="mb-2" />
                <div className="font-bold text-xl">{weather.uvIndex}</div>
                <div className="text-sm">UV Index</div>
              </div>
            </div>
            {weather.lastUpdated && (
              <div className="text-base text-slate-400">
                Last updated: {weather.lastUpdated.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="text-8xl font-light text-white mb-6">--°</div>
            <div className="text-lg text-slate-300">No weather data available</div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default function StaticWeatherWidget({
  location = 'New York',
  latitude,
  longitude,
  showClock = true,
  showAnimatedBg = false,
  theme = 'dark',
  refreshInterval = 300000,
  showDetails = true,
  size = 'compact'
}: StaticWeatherWidgetProps) {
  const { value: currentTime, isHydrated } = useCurrentTime(showClock ? 1000 : 0);
  const { geocodeLocation, loading: geocodingLoading, error: geocodingError } = useGeocoding();
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number; name: string } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoize the geocoding function to prevent unnecessary re-renders
  const geocodeLocationName = useCallback(async (locationName: string) => {
    setLocationError(null);
    const result = await geocodeLocation(locationName);
    if (result) {
      setCoordinates(result);
    } else {
      setLocationError(`Location "${locationName}" not found`);
    }
  }, [geocodeLocation]);

  // Initialize coordinates based on props
  useEffect(() => {
    // Reset initialization state when location changes
    setIsInitialized(false);
    
    if (latitude && longitude) {
      setCoordinates({
        latitude,
        longitude,
        name: location || 'Custom Location'
      });
      setIsInitialized(true);
    } else if (location && !latitude && !longitude) {
      geocodeLocationName(location).finally(() => {
        setIsInitialized(true);
      });
    } else {
      setCoordinates({
        latitude: 40.7128,
        longitude: -74.0060,
        name: 'New York'
      });
      setIsInitialized(true);
    }
  }, [location, latitude, longitude, geocodeLocationName]);

  // Determine weather config
  const weatherConfig: WeatherConfig = useMemo(() => {
    if (!coordinates) {
      return {
        latitude: 40.7128,
        longitude: -74.0060,
        locationName: 'New York',
        refreshInterval
      };
    }

    return {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      locationName: coordinates.name,
      refreshInterval
    };
  }, [coordinates, refreshInterval]);

  const { weather, forecast, loading: weatherLoading, error: weatherError, getWeatherEmoji } = useWeather(weatherConfig);

  // Determine display location name
  const displayLocation = coordinates?.name || location;

  // Handle loading and error states
  const isLoading = (!isInitialized && geocodingLoading) || (isInitialized && weatherLoading);
  const hasError = !!(weatherError || locationError || geocodingError);

  // Render the appropriate layout based on size
  const renderLayout = () => {
    const commonProps = {
      weather,
      forecast,
      displayLocation,
      isLoading,
      hasError,
      locationError,
      weatherError,
      showClock,
      currentTime,
      isHydrated,
      getWeatherEmoji,
      showAnimatedBg
    };

    switch (size) {
      case 'compact':
        return <CompactWeatherLayout {...commonProps} />;
      case 'medium':
        return <MediumWeatherLayout {...commonProps} />;
      case 'large':
        return <LargeWeatherLayout {...commonProps} />;
      case 'xlarge':
        return <XLargeWeatherLayout {...commonProps} />;
      default:
        return <CompactWeatherLayout {...commonProps} />;
    }
  };

  return (
    <div className={`weather-widget ${theme} ${showAnimatedBg ? 'animated-bg' : ''} h-full w-full relative overflow-hidden rounded-lg`}>
      {showAnimatedBg && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 opacity-20">
          <div className="absolute inset-0 animate-pulse" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
      )}
      
      <div className="relative z-10 h-full w-full">
        {renderLayout()}
      </div>
    </div>
  );
}

