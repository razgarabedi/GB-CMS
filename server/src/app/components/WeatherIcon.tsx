import React from 'react';

interface WeatherIconProps {
  conditionCode: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const WeatherIcon: React.FC<WeatherIconProps> = ({ 
  conditionCode, 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  // Map weather condition codes to icon files
  const getIconPath = (code: number): string => {
    switch (code) {
      // Clear sky - Sunny
      case 0:
      case 1:
        return '/weather-icons/sunny.png';
      
      // Partly cloudy
      case 2:
        return '/weather-icons/partly-cloudy.png';
      
      // Overcast - Use partly cloudy as fallback
      case 3:
        return '/weather-icons/partly-cloudy.png';
      
      // Rain - Rainy
      case 51:
      case 53:
      case 55:
      case 56:
      case 57:
      case 61:
      case 63:
      case 65:
      case 66:
      case 67:
      case 80:
      case 81:
      case 82:
        return '/weather-icons/rainy.png';
      
      // Thunderstorm - Thunder
      case 95:
      case 96:
      case 99:
        return '/weather-icons/thunder.png';
      
      // Snow - Snowy
      case 71:
      case 73:
      case 75:
      case 77:
      case 85:
      case 86:
        return '/weather-icons/snowy.png';
      
      // Fog - Use partly cloudy as fallback
      case 45:
      case 48:
        return '/weather-icons/partly-cloudy.png';
      
      // Default - Sunny
      default:
        return '/weather-icons/sunny.png';
    }
  };

  // Emoji fallback for when icons fail to load
  const getEmojiFallback = (code: number): string => {
    switch (code) {
      // Clear sky - Sun
      case 0:
      case 1:
        return '<span class="text-yellow-400">☀️</span>';
      
      // Partly cloudy
      case 2:
        return '<span class="text-blue-300">⛅</span>';
      
      // Overcast
      case 3:
        return '<span class="text-gray-400">☁️</span>';
      
      // Rain
      case 51:
      case 53:
      case 55:
      case 56:
      case 57:
      case 61:
      case 63:
      case 65:
      case 66:
      case 67:
      case 80:
      case 81:
      case 82:
        return '<span class="text-blue-400">🌧️</span>';
      
      // Thunderstorm
      case 95:
      case 96:
      case 99:
        return '<span class="text-yellow-500">⛈️</span>';
      
      // Snow
      case 71:
      case 73:
      case 75:
      case 77:
      case 85:
      case 86:
        return '<span class="text-blue-200">❄️</span>';
      
      // Fog
      case 45:
      case 48:
        return '<span class="text-gray-300">🌫️</span>';
      
      // Default
      default:
        return '<span class="text-yellow-400">☀️</span>';
    }
  };

  return (
    <img 
      src={getIconPath(conditionCode)} 
      alt={`Weather condition ${conditionCode}`}
      className={`${sizeClasses[size]} ${className}`}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        const currentSrc = target.src;
        
        // First fallback: try sunny icon
        if (!currentSrc.includes('/weather-icons/sunny.png')) {
          target.src = '/weather-icons/sunny.png';
        } else {
          // Second fallback: use emoji if even sunny icon fails
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = getEmojiFallback(conditionCode);
          }
        }
      }}
    />
  );
};

export default WeatherIcon;
