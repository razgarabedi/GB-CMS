import WeatherWidget from './WeatherWidget';
import ClockWidget from './ClockWidget';
import NewsWidget from './NewsWidget';
import SlideshowWidget from './SlideshowWidget';
import WebViewerWidget from './WebViewerWidget';
import PVCompactWidget from './PVCompactWidget';
import PVFlowWidget from './PVFlowWidget';
import CustomWidget from './CustomWidget';

export {
  WeatherWidget,
  ClockWidget,
  NewsWidget,
  SlideshowWidget,
  WebViewerWidget,
  PVCompactWidget,
  PVFlowWidget,
  CustomWidget
};

// Widget registry for dynamic rendering
export const WidgetRegistry = {
  'Weather': WeatherWidget,
  'Clock': ClockWidget,
  'News': NewsWidget,
  'Slideshow': SlideshowWidget,
  'Web Viewer': WebViewerWidget,
  'PV Compact': PVCompactWidget,
  'PV Flow': PVFlowWidget,
  'Custom': CustomWidget,
};

// Default properties for each widget type
export const DefaultWidgetProps = {
  'Weather': {
    location: 'New York',
    showClock: true,
    showAnimatedBg: false,
    theme: 'dark'
  },
  'Clock': {
    timezone: 'UTC',
    format: '12-hour',
    size: 'medium',
    type: 'digital'
  },
  'News': {
    category: 'general',
    limit: 5,
    theme: 'dark',
    refreshInterval: 300000
  },
  'Slideshow': {
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop'
    ],
    intervalMs: 5000,
    animations: 'fade',
    showControls: true
  },
  'Web Viewer': {
    url: 'https://example.com',
    refreshInterval: 60000,
    showControls: true
  },
  'PV Compact': {
    location: 'Solar Array #1',
    theme: 'dark',
    token: 'demo-token',
    showDetails: true
  },
  'PV Flow': {
    token: 'demo-token',
    theme: 'dark',
    showAnimation: true
  },
  'Custom': {
    title: 'Custom Widget',
    content: 'This is a customizable widget. Configure its properties to match your needs.',
    backgroundColor: '#1e293b',
    textColor: '#ffffff',
    showBorder: true
  }
};

// Default dimensions for each widget type
export const DefaultWidgetDimensions = {
  'Weather': { w: 4, h: 4 },
  'Clock': { w: 4, h: 4 },
  'News': { w: 4, h: 4 },
  'Slideshow': { w: 4, h: 4 },
  'Web Viewer': { w: 4, h: 4 },
  'PV Compact': { w: 4, h: 4 },
  'PV Flow': { w: 4, h: 4 },
  'Custom': { w: 4, h: 4 }
};
