'use client';

import { useState, useEffect, useCallback } from 'react';

// Weather data interfaces based on Open-Meteo API
export interface WeatherData {
  temperature: number;
  condition: string;
  conditionCode: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  lastUpdated: Date;
}

export interface ForecastDay {
  date: string;
  dayName: string;
  temperature: number;
  condition: string;
  conditionCode: number;
  high: number;
  low: number;
  humidity: number;
  precipitation: number;
  backgroundImage: string;
}

export interface WeatherError {
  message: string;
  code?: string;
}

export interface WeatherConfig {
  latitude: number;
  longitude: number;
  locationName?: string;
  refreshInterval?: number; // in milliseconds
}

// Weather condition mapping based on Open-Meteo weather codes
const WEATHER_CONDITIONS: Record<number, string> = {
  0: 'Clear Sky',
  1: 'Mainly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing Rime Fog',
  51: 'Light Drizzle',
  53: 'Moderate Drizzle',
  55: 'Dense Drizzle',
  56: 'Light Freezing Drizzle',
  57: 'Dense Freezing Drizzle',
  61: 'Slight Rain',
  63: 'Moderate Rain',
  65: 'Heavy Rain',
  66: 'Light Freezing Rain',
  67: 'Heavy Freezing Rain',
  71: 'Slight Snow',
  73: 'Moderate Snow',
  75: 'Heavy Snow',
  77: 'Snow Grains',
  80: 'Slight Rain Showers',
  81: 'Moderate Rain Showers',
  82: 'Violent Rain Showers',
  85: 'Slight Snow Showers',
  86: 'Heavy Snow Showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with Slight Hail',
  99: 'Thunderstorm with Heavy Hail'
};

// Weather emoji mapping
const WEATHER_EMOJIS: Record<number, string> = {
  0: '☀️',
  1: '🌤️',
  2: '⛅',
  3: '☁️',
  45: '🌫️',
  48: '🌫️',
  51: '🌦️',
  53: '🌦️',
  55: '🌦️',
  56: '🌨️',
  57: '🌨️',
  61: '🌧️',
  63: '🌧️',
  65: '🌧️',
  66: '🌨️',
  67: '🌨️',
  71: '❄️',
  73: '❄️',
  75: '❄️',
  77: '❄️',
  80: '🌦️',
  81: '🌦️',
  82: '🌦️',
  85: '🌨️',
  86: '🌨️',
  95: '⛈️',
  96: '⛈️',
  99: '⛈️'
};

// Background images for different weather conditions
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

/**
 * Custom hook for fetching weather data from Open-Meteo API
 */
export function useWeather(config: WeatherConfig) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<WeatherError | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchWeatherData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Open-Meteo API endpoint for current weather and forecast
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${config.latitude}&longitude=${config.longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,winddirection_10m,surface_pressure,visibility,uv_index&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_mean&timezone=auto&forecast_days=4`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.current_weather) {
        throw new Error('No weather data available');
      }

      const current = data.current_weather;
      const hourly = data.hourly;

      // Get current hour index for additional data
      const currentTime = new Date(current.time);
      const currentHour = currentTime.getHours();
      const currentHourIndex = hourly.time.findIndex((time: string) => {
        const hourTime = new Date(time);
        return hourTime.getHours() === currentHour;
      });

      const weatherData: WeatherData = {
        temperature: Math.round(current.temperature),
        condition: WEATHER_CONDITIONS[current.weathercode] || 'Unknown',
        conditionCode: current.weathercode,
        humidity: currentHourIndex >= 0 ? Math.round(hourly.relativehumidity_2m[currentHourIndex]) : 0,
        windSpeed: Math.round(current.windspeed),
        windDirection: current.winddirection,
        pressure: currentHourIndex >= 0 ? Math.round(hourly.surface_pressure[currentHourIndex]) : 0,
        visibility: currentHourIndex >= 0 ? Math.round(hourly.visibility[currentHourIndex] / 1000) : 0, // Convert to km
        uvIndex: currentHourIndex >= 0 ? Math.round(hourly.uv_index[currentHourIndex]) : 0,
        lastUpdated: new Date()
      };

      // Process forecast data (next 3 days)
      const daily = data.daily;
      const forecastData: ForecastDay[] = [];
      
      for (let i = 1; i <= 3; i++) { // Skip today (index 0), get next 3 days
        if (daily.time[i]) {
          const date = new Date(daily.time[i]);
          const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
          const dayName = dayNames[date.getDay()];
          
          const weatherCode = daily.weathercode[i];
          const backgroundImage = WEATHER_BACKGROUNDS[weatherCode] || WEATHER_BACKGROUNDS[0] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop';
          
          
          forecastData.push({
            date: daily.time[i],
            dayName: dayName,
            temperature: Math.round((daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2),
            condition: WEATHER_CONDITIONS[weatherCode] || 'Unknown',
            conditionCode: weatherCode,
            high: Math.round(daily.temperature_2m_max[i]),
            low: Math.round(daily.temperature_2m_min[i]),
            humidity: Math.round(daily.precipitation_probability_mean[i] || 0),
            precipitation: Math.round(daily.precipitation_probability_mean[i] || 0),
            backgroundImage: backgroundImage
          });
        }
      }

      setWeather(weatherData);
      setForecast(forecastData);
      setLastFetch(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setError({
        message: errorMessage,
        code: 'WEATHER_FETCH_ERROR'
      });
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [config.latitude, config.longitude]);

  // Initial fetch - only when coordinates change
  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  // Set up refresh interval - only when refresh interval changes
  useEffect(() => {
    if (config.refreshInterval && config.refreshInterval > 0) {
      const interval = setInterval(fetchWeatherData, config.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [config.refreshInterval, fetchWeatherData]);

  // Get weather emoji based on condition code
  const getWeatherEmoji = useCallback((conditionCode: number): string => {
    return WEATHER_EMOJIS[conditionCode] || '🌤️';
  }, []);

  return {
    weather,
    forecast,
    loading,
    error,
    lastFetch,
    refetch: fetchWeatherData,
    getWeatherEmoji
  };
}

/**
 * Hook for geocoding location names to coordinates
 */
export function useGeocoding() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocodeLocation = useCallback(async (locationName: string): Promise<{ latitude: number; longitude: number; name: string } | null> => {
    try {
      setLoading(true);
      setError(null);

      // Use Open-Meteo geocoding API
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=1&language=en&format=json`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        throw new Error(`Location "${locationName}" not found`);
      }

      const result = data.results[0];
      return {
        latitude: result.latitude,
        longitude: result.longitude,
        name: result.name
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to geocode location';
      setError(errorMessage);
      console.error('Geocoding error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    geocodeLocation,
    loading,
    error
  };
}
