# Weather Widget with Open-Meteo API Integration

## Overview

The Weather Widget now fetches real-time weather data from the Open-Meteo API, providing accurate and up-to-date weather information for any location worldwide.

## Features

### 🌍 Location Support
- **City Names**: Enter any city name (e.g., "New York", "London", "Tokyo")
- **Coordinates**: Use precise latitude and longitude for exact locations
- **Auto-Geocoding**: Automatically converts city names to coordinates

### 📊 Weather Data
- **Current Temperature**: Real-time temperature in Celsius
- **Weather Conditions**: Detailed weather descriptions (Clear Sky, Partly Cloudy, etc.)
- **Additional Metrics**: Humidity, wind speed, atmospheric pressure, UV index
- **Weather Icons**: Dynamic emoji icons based on weather conditions

### ⚙️ Configuration Options
- **Refresh Interval**: 1 minute to 1 hour (default: 5 minutes)
- **Display Options**: Show/hide clock, details, animated background
- **Theme Support**: Light and dark themes
- **Location Priority**: Coordinates override city names when both are provided

## API Integration

### Open-Meteo API
The widget uses the free Open-Meteo API which provides:
- No API key required
- High accuracy weather data
- Global coverage
- Real-time updates
- CORS-friendly

### Data Sources
- **Current Weather**: Temperature, weather code, wind speed/direction
- **Hourly Data**: Humidity, pressure, visibility, UV index
- **Geocoding**: Location name to coordinates conversion

## Usage

### Basic Setup
1. Add a Weather Widget to your screen
2. Enter a location name (e.g., "New York")
3. Configure display options as needed
4. The widget will automatically fetch and display weather data

### Advanced Configuration
1. **Precise Location**: Use latitude/longitude coordinates for exact positioning
2. **Refresh Rate**: Set how often to update weather data
3. **Display Details**: Choose which weather metrics to show
4. **Visual Style**: Customize theme and animations

### Location Examples
```
City Names:
- "New York"
- "London, UK"
- "Tokyo, Japan"
- "Paris, France"

Coordinates:
- Latitude: 40.7128, Longitude: -74.0060 (New York)
- Latitude: 51.5074, Longitude: -0.1278 (London)
- Latitude: 35.6762, Longitude: 139.6503 (Tokyo)
```

## Weather Conditions

The widget supports all Open-Meteo weather codes with appropriate icons:

| Code | Condition | Icon |
|------|-----------|------|
| 0 | Clear Sky | ☀️ |
| 1-3 | Partly Cloudy to Overcast | 🌤️⛅☁️ |
| 45-48 | Fog | 🌫️ |
| 51-67 | Rain/Drizzle | 🌧️🌦️🌨️ |
| 71-77 | Snow | ❄️ |
| 80-86 | Showers | 🌦️🌨️ |
| 95-99 | Thunderstorms | ⛈️ |

## Error Handling

The widget gracefully handles various error conditions:
- **Network Issues**: Shows loading state and retry options
- **Invalid Location**: Displays error message for unknown locations
- **API Failures**: Shows fallback content with error details
- **Geocoding Errors**: Handles location lookup failures

## Performance

### Optimization Features
- **Caching**: Weather data is cached between refreshes
- **Efficient Updates**: Only fetches new data when needed
- **Background Refresh**: Updates don't interrupt user experience
- **Error Recovery**: Automatic retry on temporary failures

### Resource Usage
- **API Calls**: Minimal requests (every 5 minutes by default)
- **Memory**: Lightweight data structures
- **Network**: Small payload sizes (~1KB per request)

## Troubleshooting

### Common Issues

**Weather not loading:**
- Check internet connection
- Verify location name is correct
- Try using coordinates instead of city name

**Incorrect location:**
- Use more specific location names
- Try adding country code (e.g., "London, UK")
- Use precise coordinates for exact positioning

**Slow updates:**
- Reduce refresh interval
- Check network connectivity
- Verify API service status

### Debug Information
The widget displays helpful debug information:
- Last update time
- Loading states
- Error messages
- Location resolution status

## API Limits

Open-Meteo API is free with generous limits:
- **Rate Limit**: 10,000 requests per day
- **No API Key**: Required
- **Global Coverage**: Worldwide weather data
- **High Accuracy**: Professional-grade weather data

## Future Enhancements

Planned features for future updates:
- **Forecast Data**: Multi-day weather predictions
- **Weather Alerts**: Severe weather notifications
- **Custom Icons**: User-defined weather icons
- **Multiple Locations**: Support for multiple weather widgets
- **Historical Data**: Past weather information
- **Weather Maps**: Visual weather overlays

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify your location settings
3. Test with different locations
4. Check browser console for error messages

The weather widget is designed to be robust and user-friendly, providing reliable weather information for your digital signage displays.
