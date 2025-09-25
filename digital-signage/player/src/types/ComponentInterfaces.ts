/**
 * Base interfaces for digital signage components
 * This file defines the standardized interfaces that all components should implement
 * to ensure consistency and interoperability across the modular signage system.
 */

// ============================================================================
// BASE INTERFACES
// ============================================================================

/**
 * Base theme interface that all components should support
 */
export interface BaseTheme {
  /** Visual theme variant */
  theme?: 'dark' | 'light'
}

/**
 * Base location interface for components that require location data
 */
export interface BaseLocation {
  /** Location identifier (city name, coordinates, etc.) */
  location: string
}

/**
 * Base API configuration interface
 */
export interface BaseApiConfig {
  /** API base URL override */
  apiBase?: string
}

/**
 * Base error handling interface
 */
export interface BaseErrorHandling {
  /** Error callback function */
  onError?: (error: Error) => void
}

/**
 * Base data update interface
 */
export interface BaseDataUpdate {
  /** Data update callback function */
  onDataUpdate?: (data: any) => void
}

/**
 * Base refresh configuration interface
 */
export interface BaseRefreshConfig {
  /** Refresh interval in milliseconds */
  refreshIntervalMs?: number
}

// ============================================================================
// COMPONENT-SPECIFIC INTERFACES
// ============================================================================

/**
 * Weather widget component interface
 */
export interface WeatherWidgetProps extends BaseTheme, BaseLocation, BaseErrorHandling, BaseDataUpdate, BaseRefreshConfig {
  /** Show integrated clock */
  showClock?: boolean
  /** Enable animated background */
  showAnimatedBg?: boolean
  /** Timezone for clock display */
  timezone?: string
}

/**
 * PV Compact widget component interface
 */
export interface PVCompactWidgetProps extends BaseTheme, BaseLocation, BaseErrorHandling, BaseDataUpdate, BaseRefreshConfig {
  /** PublicDisplayToken from SolarWeb */
  token: string
}

/**
 * PV Flow widget component interface
 */
export interface PVFlowWidgetProps extends BaseTheme, BaseErrorHandling, BaseDataUpdate, BaseRefreshConfig {
  /** PublicDisplayToken from SolarWeb */
  token: string
}

/**
 * Slideshow component interface
 */
export interface SlideshowProps extends BaseErrorHandling {
  /** Array of image URLs */
  images: string[]
  /** Slide interval in milliseconds */
  intervalMs?: number
  /** Animation types */
  animations?: ('fade' | 'cut' | 'wipe')[]
  /** Animation duration in milliseconds */
  durationMs?: number
  /** Preload next image */
  preloadNext?: boolean
}

/**
 * News widget component interface
 */
export interface NewsWidgetProps extends BaseTheme, BaseErrorHandling, BaseDataUpdate, BaseRefreshConfig {
  /** News category */
  category?: 'wirtschaft' | 'top'
  /** Maximum number of news items */
  limit?: number
  /** Rotation interval in milliseconds */
  rotationMs?: number
  /** Compact display mode */
  compact?: boolean
}

/**
 * Digital clock component interface
 */
export interface DigitalClockProps extends BaseTheme {
  /** IANA timezone identifier */
  timezone: string
  /** Clock display type */
  type?: 'minimal' | 'neon' | 'flip'
  /** Size in pixels */
  size?: number
  /** Text color */
  color?: string
}

/**
 * Analog clock component interface
 */
export interface AnalogClockProps extends BaseTheme {
  /** IANA timezone identifier */
  timezone: string
  /** Size in pixels */
  size?: number
  /** Custom theme colors */
  theme?: {
    background?: string
    tick?: string
    hourHand?: string
    minuteHand?: string
    secondHand?: string
    center?: string
  }
}

/**
 * Compact weather component interface
 */
export interface CompactWeatherProps extends BaseTheme, BaseLocation, BaseErrorHandling, BaseDataUpdate, BaseRefreshConfig {
  /** Show time display */
  showTime?: boolean
  /** Timezone for time display */
  timezone?: string
}

/**
 * Web viewer component interface
 */
export interface WebViewerProps extends BaseTheme, BaseErrorHandling {
  /** URL to display */
  url: string
  /** Display mode */
  mode?: 'iframe' | 'embed'
  /** Refresh interval in milliseconds */
  refreshIntervalMs?: number
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Common component size options
 */
export type ComponentSize = 'small' | 'medium' | 'large' | 'full'

/**
 * Common animation types
 */
export type AnimationType = 'fade' | 'slide' | 'zoom' | 'cut' | 'wipe'

/**
 * Common refresh intervals
 */
export const REFRESH_INTERVALS = {
  FAST: 5000,      // 5 seconds
  NORMAL: 30000,   // 30 seconds
  SLOW: 300000,    // 5 minutes
  VERY_SLOW: 600000 // 10 minutes
} as const

/**
 * Common component categories
 */
export type ComponentCategory = 'weather' | 'clock' | 'news' | 'slideshow' | 'pv' | 'web' | 'custom'

// ============================================================================
// PLUGIN INTERFACE (for future plugin system)
// ============================================================================

/**
 * Base plugin interface for future extensibility
 */
export interface BasePlugin {
  /** Unique plugin identifier */
  id: string
  /** Plugin name */
  name: string
  /** Plugin version */
  version: string
  /** Plugin description */
  description: string
  /** Plugin author */
  author: string
  /** Plugin category */
  category: ComponentCategory
  /** Plugin dependencies */
  dependencies?: string[]
}

/**
 * Plugin component interface
 */
export interface PluginComponent extends BasePlugin {
  /** React component */
  component: React.ComponentType<any>
  /** Props schema for validation */
  propsSchema?: any
  /** Default props */
  defaultProps?: Record<string, any>
}
