# Weather Icons for Static Weather Widget

This folder contains weather condition icons used by the StaticWeatherWidget component.

## Required Icons

### Weather Condition Icons
- `sunny.png` - Clear sky and sunny conditions
- `partly-cloudy.png` - Partly cloudy conditions  
- `rainy.png` - Rain and precipitation conditions
- `thunder.png` - Thunderstorm conditions
- `snowy.png` - Snow conditions

### Weather Data Icons
- `wind-speed.png` - Wind speed indicator
- `humidity.png` - Humidity indicator
- `pressure.png` - Atmospheric pressure indicator
- `uv.png` - UV index indicator

## Usage

These icons are automatically loaded by the WeatherIcon component based on weather condition codes from the Open-Meteo API. The component maps weather condition codes to the appropriate icon files.

## Icon Specifications

- Format: PNG
- Recommended size: 64x64 pixels or higher
- Background: Transparent
- Style: Consistent with the overall widget design theme

## File Naming Convention

All icons should follow the exact naming convention shown above to ensure proper loading by the WeatherIcon component.

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
