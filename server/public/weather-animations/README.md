# Weather Animations

This folder contains animated background videos for the Static Weather Widget.

## Required Files

Place the following video files in this directory:

- `clear-1.mp4` - For clear sky and mainly clear weather conditions
- `clouds-1.mp4` - For partly cloudy and overcast conditions  
- `mist-1.mp4` - For fog and mist conditions
- `rain-1.mp4` - For all rain-related conditions (drizzle, rain, showers)
- `snow-1.mp4` - For all snow-related conditions
- `thunder-1.mp4` - For thunderstorm conditions

## Video Specifications

- **Format**: MP4
- **Codec**: H.264 (recommended for best browser compatibility)
- **Resolution**: 1920x1080 or higher (will be scaled to fit)
- **Duration**: 10-30 seconds (will loop automatically)
- **File Size**: Keep under 10MB per video for optimal performance

## Usage

The videos are automatically selected based on the weather condition code from the Open-Meteo API:

- **Clear/Mainly Clear** (codes 0, 1) → `clear-1.mp4`
- **Cloudy** (codes 2, 3) → `clouds-1.mp4`
- **Fog/Mist** (codes 45, 48) → `mist-1.mp4`
- **Rain** (codes 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82) → `rain-1.mp4`
- **Snow** (codes 71, 73, 75, 77, 85, 86) → `snow-1.mp4`
- **Thunderstorm** (codes 95, 96, 99) → `thunder-1.mp4`

## Fallback

If a video file is missing or fails to load, the widget will fall back to the default clear sky video (`clear-1.mp4`).
