# Icon File Renaming Guide

Your current icon files need to be renamed to match the expected naming convention used by the WeatherIcon component.

## Current Files Found:
- Sunny.png → should be: sunny.png
- Pratly-cloudy.png → should be: partly-cloudy.png  
- Rainy.png → should be: rainy.png
- Thunder.png → should be: thunder.png
- Snowy.png → should be: snowy.png
- Wind-speed.png → should be: wind-speed.png
- Humidity.png → should be: humidity.png
- Preasure.png → should be: pressure.png
- UV.png → should be: uv.png
- cloudy.png → can be used as partly-cloudy.png

## Renaming Instructions:

1. Rename the files to match the exact names above (all lowercase with hyphens)
2. Make sure to fix the typo in "Pratly-cloudy.png" → "partly-cloudy.png"
3. Make sure to fix the typo in "Preasure.png" → "pressure.png"

## After Renaming:

The WeatherIcon component will automatically use these icons based on weather condition codes from the Open-Meteo API. The component includes fallback behavior, so if an icon fails to load, it will show the sunny.png icon instead.

## Testing:

Once you've renamed the files, you can test the weather widget to see the icons in action. The icons will appear in:
- Weather condition displays
- Weather data sections (humidity, wind speed, pressure, UV index)
- Forecast displays
