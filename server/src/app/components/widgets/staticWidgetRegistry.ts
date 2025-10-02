import { StaticWidgetConfig, StaticWidgetSize, STATIC_WIDGET_DIMENSIONS } from '../../types/staticWidgets';
import StaticWeatherWidget from './StaticWeatherWidget';

// Static Widget Registry
export const StaticWidgetRegistry: Record<string, StaticWidgetConfig> = {
  'static-weather': {
    id: 'static-weather',
    name: 'Static Weather',
    description: 'Weather widget with predefined sizes and layouts',
    category: 'weather',
    icon: '🌤️',
    component: StaticWeatherWidget,
    sizes: ['compact', 'medium', 'large', 'xlarge'],
    defaultSize: 'compact',
    defaultProps: {
      location: 'New York',
      latitude: undefined,
      longitude: undefined,
      showClock: true,
      showAnimatedBg: false,
      theme: 'dark',
      refreshInterval: 300000,
      showDetails: true
    },
    propTypes: {
      location: 'string',
      latitude: 'number',
      longitude: 'number',
      showClock: 'boolean',
      showAnimatedBg: 'boolean',
      theme: 'string',
      refreshInterval: 'number',
      showDetails: 'boolean',
      size: 'string'
    },
    capabilities: ['weather', 'clock', 'real-time', 'static-sizing'],
    dependencies: ['weather-api', 'geocoding-api']
  }
};

// Helper function to get widget configuration
export const getStaticWidgetConfig = (widgetId: string): StaticWidgetConfig | null => {
  return StaticWidgetRegistry[widgetId] || null;
};

// Helper function to get all available static widgets
export const getAllStaticWidgets = (): StaticWidgetConfig[] => {
  return Object.values(StaticWidgetRegistry);
};

// Helper function to get widget dimensions for a specific size
export const getStaticWidgetDimensions = (widgetId: string, size: StaticWidgetSize): { w: number; h: number } | null => {
  const config = getStaticWidgetConfig(widgetId);
  if (!config || !config.sizes.includes(size)) {
    return null;
  }
  return STATIC_WIDGET_DIMENSIONS[size];
};

// Helper function to check if a widget supports a specific size
export const supportsSize = (widgetId: string, size: StaticWidgetSize): boolean => {
  const config = getStaticWidgetConfig(widgetId);
  return config ? config.sizes.includes(size) : false;
};

// Helper function to get available sizes for a widget
export const getAvailableSizes = (widgetId: string): StaticWidgetSize[] => {
  const config = getStaticWidgetConfig(widgetId);
  return config ? config.sizes : [];
};

