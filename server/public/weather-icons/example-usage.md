# Weather Icons Usage Example

This folder contains weather icons that are automatically used by the StaticWeatherWidget component.

## How to Add Your Icons

1. Place your PNG icon files directly in this folder (`server/public/weather-icons/`)
2. Use the exact filenames as specified in the README.md
3. The icons will be automatically loaded by the WeatherIcon component

## Icon Mapping

The WeatherIcon component maps weather condition codes to these icon files:

- **sunny.png** - Clear sky (codes 0, 1)
- **partly-cloudy.png** - Partly cloudy (code 2), overcast (code 3), fog (codes 45, 48)
- **rainy.png** - All rain conditions (codes 51-82)
- **thunder.png** - Thunderstorms (codes 95, 96, 99)
- **snowy.png** - All snow conditions (codes 71-77, 85-86)

## Weather Data Icons

Additional icons are used for weather data display:

- **humidity.png** - Humidity percentage
- **wind-speed.png** - Wind speed
- **pressure.png** - Atmospheric pressure
- **uv.png** - UV index

## Fallback Behavior

The weather widget includes comprehensive fallback handling:

### Weather Condition Icons
1. **Primary**: Uses the specific PNG icon for the weather condition
2. **First Fallback**: If the specific icon fails, tries to load `sunny.png`
3. **Final Fallback**: If even `sunny.png` fails, displays a colored emoji (☀️, ⛅, 🌧️, ⛈️, ❄️, etc.)

### Weather Data Icons
1. **Primary**: Uses the specific PNG icon (humidity.png, wind-speed.png, etc.)
2. **Fallback**: If the icon fails, displays a corresponding emoji (💧, 💨, 📊, ☀️)

This ensures the weather widget always displays meaningful content even if icon files are missing or fail to load.
