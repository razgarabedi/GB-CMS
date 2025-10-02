'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useCurrentTime } from '../../hooks/useHydration';
import { useWeather, useGeocoding, WeatherConfig } from '../../hooks/useWeather';

interface WeatherWidgetProps {
  location?: string;
  latitude?: number;
  longitude?: number;
  showClock?: boolean;
  showAnimatedBg?: boolean;
  theme?: 'light' | 'dark';
  refreshInterval?: number;
  showDetails?: boolean;
}

export default function WeatherWidget({
  location = 'New York',
  latitude,
  longitude,
  showClock = true,
  showAnimatedBg = false,
  theme = 'dark',
  refreshInterval = 300000, // 5 minutes
  showDetails = true
}: WeatherWidgetProps) {
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
      // Use provided coordinates
      setCoordinates({
        latitude,
        longitude,
        name: location || 'Custom Location'
      });
      setIsInitialized(true);
    } else if (location && !latitude && !longitude) {
      // Geocode location name
      geocodeLocationName(location).finally(() => {
        setIsInitialized(true);
      });
    } else {
      // Use default coordinates
      setCoordinates({
        latitude: 40.7128,
        longitude: -74.0060,
        name: 'New York'
      });
      setIsInitialized(true);
    }
  }, [location, latitude, longitude, geocodeLocationName]);

  // Determine weather config - only when coordinates are available
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

  const { weather, loading: weatherLoading, error: weatherError, getWeatherEmoji } = useWeather(weatherConfig);

  // Determine display location name
  const displayLocation = coordinates?.name || location;

  // Handle loading and error states - only show loading if not initialized yet
  const isLoading = (!isInitialized && geocodingLoading) || (isInitialized && weatherLoading);
  const hasError = weatherError || locationError || geocodingError;

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('WeatherWidget Debug:', {
      isInitialized,
      coordinates,
      weatherLoading,
      geocodingLoading,
      weather,
      error: hasError
    });
  }

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
            <span className="text-2xl">
              {weather ? getWeatherEmoji(weather.conditionCode) : '🌤️'}
            </span>
            <div>
              <h3 className="font-semibold text-white">{displayLocation}</h3>
              <p className="text-xs text-slate-300">
                {isLoading ? 'Loading...' : 
                 hasError ? 'Error loading weather' : 
                 weather ? weather.condition : 'Unknown'}
              </p>
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
          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <div className="text-sm text-slate-300">Loading weather...</div>
            </div>
          ) : hasError ? (
            <div className="text-center">
              <div className="text-4xl font-light text-white mb-2">⚠️</div>
              <div className="text-sm text-slate-300">
                {locationError || weatherError?.message || 'Failed to load weather'}
              </div>
            </div>
          ) : weather ? (
            <div className="text-center">
              <div className="text-4xl font-light text-white mb-2">
                {weather.temperature}°
              </div>
              {showDetails && (
                <div className="text-sm text-slate-300 space-y-1">
                  <div>💧 {weather.humidity}%</div>
                  <div>💨 {weather.windSpeed} km/h</div>
                  {weather.pressure > 0 && <div>📊 {weather.pressure} hPa</div>}
                  {weather.uvIndex > 0 && <div>☀️ UV {weather.uvIndex}</div>}
                </div>
              )}
              {weather.lastUpdated && (
                <div className="text-xs text-slate-400 mt-2">
                  Updated {weather.lastUpdated.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              )}
            </div>
          ) : !isInitialized ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <div className="text-sm text-slate-300">Initializing...</div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-4xl font-light text-white mb-2">--°</div>
              <div className="text-sm text-slate-300">No data available</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
