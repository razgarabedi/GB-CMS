/**
 * Configuration Management Types
 * Enhanced configuration system with validation, versioning, and inheritance
 */

import type { ComponentCategory } from './ComponentInterfaces'
import type { LayoutConfig } from './LayoutTypes'

// ============================================================================
// CORE CONFIGURATION TYPES
// ============================================================================

/**
 * Base configuration interface
 */
export interface BaseConfig {
  /** Configuration version */
  version: string
  /** Configuration ID */
  id: string
  /** Configuration name */
  name: string
  /** Configuration description */
  description?: string
  /** Creation timestamp */
  createdAt: string
  /** Last update timestamp */
  updatedAt: string
  /** Configuration tags */
  tags?: string[]
  /** Configuration metadata */
  metadata?: Record<string, any>
}

/**
 * Screen configuration
 */
export interface ScreenConfig extends BaseConfig {
  /** Screen identifier */
  screenId: string
  /** Layout configuration */
  layout: LayoutConfig
  /** Global theme */
  theme: 'dark' | 'light'
  /** Timezone */
  timezone: string
  /** Component configurations */
  components: ComponentConfigs
  /** Global settings */
  global: GlobalSettings
  /** Schedule configuration */
  schedule: ScheduleConfig
  /** Power profile */
  powerProfile: 'performance' | 'balanced' | 'visual'
  /** Configuration inheritance */
  inheritance?: ConfigInheritance
}

/**
 * Component-specific configurations
 */
export interface ComponentConfigs {
  /** Weather widget configuration */
  weather?: WeatherConfig
  /** Clock configuration */
  clock?: ClockConfig
  /** News widget configuration */
  news?: NewsConfig
  /** Slideshow configuration */
  slideshow?: SlideshowConfig
  /** Web viewer configuration */
  webViewer?: WebViewerConfig
  /** PV widget configuration */
  pv?: PVConfig
  /** Custom component configurations */
  custom?: Record<string, any>
}

/**
 * Weather widget configuration
 */
export interface WeatherConfig {
  /** Weather location */
  location: string
  /** Show integrated clock */
  showClock?: boolean
  /** Enable animated background */
  showAnimatedBg?: boolean
  /** Refresh interval in milliseconds */
  refreshIntervalMs?: number
  /** Weather service provider */
  provider?: 'openweather' | 'openmeteo'
  /** API key for weather service */
  apiKey?: string
}

/**
 * Clock configuration
 */
export interface ClockConfig {
  /** Clock type */
  type: 'analog' | 'digital'
  /** Clock style */
  style: 'classic' | 'mono' | 'glass' | 'minimal' | 'neon' | 'flip'
  /** Clock size in pixels */
  size?: number
  /** Clock color */
  color?: string
  /** Show seconds */
  showSeconds?: boolean
  /** 24-hour format */
  format24h?: boolean
}

/**
 * News widget configuration
 */
export interface NewsConfig {
  /** News category */
  category: 'wirtschaft' | 'top' | 'sport' | 'politik'
  /** Maximum number of news items */
  limit: number
  /** Rotation interval in milliseconds */
  rotationMs: number
  /** Compact display mode */
  compact?: boolean
  /** News source */
  source?: 'tagesschau' | 'custom'
  /** Custom RSS feed URL */
  rssUrl?: string
  /** Refresh interval in milliseconds */
  refreshIntervalMs?: number
}

/**
 * Slideshow configuration
 */
export interface SlideshowConfig {
  /** Array of image URLs */
  images: string[]
  /** Slide interval in milliseconds */
  intervalMs: number
  /** Animation types */
  animations: ('fade' | 'cut' | 'wipe')[]
  /** Animation duration in milliseconds */
  durationMs: number
  /** Preload next image */
  preloadNext: boolean
  /** Randomize slide order */
  randomize?: boolean
  /** Image fit mode */
  fitMode?: 'cover' | 'contain' | 'fill'
}

/**
 * Web viewer configuration
 */
export interface WebViewerConfig {
  /** URL to display */
  url: string
  /** Display mode */
  mode: 'iframe' | 'snapshot'
  /** Snapshot refresh interval in milliseconds */
  snapshotRefreshMs: number
  /** Auto-scroll enabled */
  autoScrollEnabled: boolean
  /** Auto-scroll interval in milliseconds */
  autoScrollMs: number
  /** Auto-scroll distance percentage */
  autoScrollDistancePct: number
  /** Auto-scroll start delay in milliseconds */
  autoScrollStartDelayMs: number
  /** Custom CSS for iframe */
  customCSS?: string
  /** Allow fullscreen */
  allowFullscreen?: boolean
}

/**
 * PV (Photovoltaic) configuration
 */
export interface PVConfig {
  /** SolarWeb token */
  token: string
  /** PV system name */
  systemName?: string
  /** Show battery information */
  showBattery?: boolean
  /** Show grid information */
  showGrid?: boolean
  /** Refresh interval in milliseconds */
  refreshIntervalMs?: number
  /** Display mode */
  mode: 'flow' | 'compact' | 'detailed'
}

/**
 * Global settings
 */
export interface GlobalSettings {
  /** Welcome text */
  welcomeText: string
  /** Welcome text color */
  welcomeTextColor: string
  /** Bottom widgets background color */
  bottomWidgetsBgColor?: string
  /** Bottom widgets background image */
  bottomWidgetsBgImage?: string
  /** Hide cursor */
  hideCursor?: boolean
  /** Auto-refresh enabled */
  autoRefresh?: boolean
  /** Refresh intervals */
  refreshIntervals: {
    contentMs: number
    rotateMs: number
  }
}

/**
 * Schedule configuration
 */
export interface ScheduleConfig {
  /** Schedule rules */
  rules: ScheduleRule[]
  /** Default configuration */
  default: Partial<ScreenConfig>
  /** Timezone for schedule */
  timezone?: string
}

/**
 * Schedule rule
 */
export interface ScheduleRule {
  /** Rule ID */
  id: string
  /** Rule name */
  name: string
  /** Days of week (0=Sunday, 1=Monday, etc.) */
  days: number[]
  /** Start time (HH:MM format) */
  startTime: string
  /** End time (HH:MM format) */
  endTime: string
  /** Configuration overrides */
  overrides: Partial<ScreenConfig>
  /** Rule enabled */
  enabled: boolean
  /** Rule priority */
  priority: number
}

/**
 * Configuration inheritance
 */
export interface ConfigInheritance {
  /** Parent configuration ID */
  parentId?: string
  /** Inherited properties */
  inherited: string[]
  /** Overridden properties */
  overridden: string[]
  /** Inheritance level */
  level: number
}

// ============================================================================
// CONFIGURATION TEMPLATES
// ============================================================================

/**
 * Configuration template
 */
export interface ConfigTemplate extends BaseConfig {
  /** Template category */
  category: 'default' | 'custom' | 'preset' | 'industry'
  /** Template preview image */
  previewImage?: string
  /** Template configuration */
  config: Partial<ScreenConfig>
  /** Template variables */
  variables: ConfigVariable[]
  /** Template dependencies */
  dependencies?: string[]
  /** Template tags */
  tags: string[]
}

/**
 * Configuration variable
 */
export interface ConfigVariable {
  /** Variable name */
  name: string
  /** Variable type */
  type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'url'
  /** Variable description */
  description: string
  /** Default value */
  defaultValue: any
  /** Variable options (for select type) */
  options?: Array<{ value: any; label: string }>
  /** Variable validation */
  validation?: {
    required?: boolean
    min?: number
    max?: number
    pattern?: string
    custom?: (value: any) => boolean | string
  }
}

// ============================================================================
// CONFIGURATION VALIDATION
// ============================================================================

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  /** Validation success */
  valid: boolean
  /** Validation errors */
  errors: ConfigValidationError[]
  /** Validation warnings */
  warnings: ConfigValidationError[]
  /** Validation info */
  info: ConfigValidationError[]
}

/**
 * Configuration validation error
 */
export interface ConfigValidationError {
  /** Error path */
  path: string
  /** Error message */
  message: string
  /** Error code */
  code: string
  /** Error severity */
  severity: 'error' | 'warning' | 'info'
  /** Suggested fix */
  suggestion?: string
  /** Error context */
  context?: Record<string, any>
}

/**
 * Configuration validator
 */
export interface ConfigValidator {
  /** Validator name */
  name: string
  /** Validator version */
  version: string
  /** Validation function */
  validate: (config: ScreenConfig) => ConfigValidationResult
  /** Schema definition */
  schema?: any
}

// ============================================================================
// CONFIGURATION VERSIONING
// ============================================================================

/**
 * Configuration version
 */
export interface ConfigVersion {
  /** Version number */
  version: string
  /** Version description */
  description: string
  /** Version timestamp */
  timestamp: string
  /** Version author */
  author: string
  /** Version changes */
  changes: ConfigChange[]
  /** Migration script */
  migration?: ConfigMigration
}

/**
 * Configuration change
 */
export interface ConfigChange {
  /** Change type */
  type: 'added' | 'modified' | 'removed' | 'deprecated'
  /** Change path */
  path: string
  /** Change description */
  description: string
  /** Old value */
  oldValue?: any
  /** New value */
  newValue?: any
}

/**
 * Configuration migration
 */
export interface ConfigMigration {
  /** Migration function */
  migrate: (config: any) => any
  /** Migration validation */
  validate: (config: any) => boolean
  /** Rollback function */
  rollback?: (config: any) => any
}

// ============================================================================
// CONFIGURATION MANAGEMENT
// ============================================================================

/**
 * Configuration manager interface
 */
export interface ConfigManager {
  /** Get configuration */
  getConfig(screenId: string): Promise<ScreenConfig | null>
  
  /** Save configuration */
  saveConfig(config: ScreenConfig): Promise<ScreenConfig>
  
  /** Delete configuration */
  deleteConfig(screenId: string): Promise<boolean>
  
  /** List configurations */
  listConfigs(): Promise<ScreenConfig[]>
  
  /** Validate configuration */
  validateConfig(config: ScreenConfig): Promise<ConfigValidationResult>
  
  /** Get configuration template */
  getTemplate(templateId: string): Promise<ConfigTemplate | null>
  
  /** List templates */
  listTemplates(): Promise<ConfigTemplate[]>
  
  /** Create from template */
  createFromTemplate(templateId: string, variables: Record<string, any>): Promise<ScreenConfig>
  
  /** Export configuration */
  exportConfig(screenId: string): Promise<ConfigExport>
  
  /** Import configuration */
  importConfig(exportData: ConfigExport): Promise<ScreenConfig>
  
  /** Get configuration history */
  getConfigHistory(screenId: string): Promise<ConfigVersion[]>
  
  /** Restore configuration version */
  restoreConfigVersion(screenId: string, version: string): Promise<ScreenConfig>
}

/**
 * Configuration export
 */
export interface ConfigExport {
  /** Export version */
  version: string
  /** Export timestamp */
  timestamp: string
  /** Export metadata */
  metadata: {
    exportedBy: string
    exportReason?: string
    sourceVersion: string
  }
  /** Configuration data */
  config: ScreenConfig
  /** Dependencies */
  dependencies?: string[]
}

// ============================================================================
// CONFIGURATION EVENTS
// ============================================================================

/**
 * Configuration event types
 */
export type ConfigEventType = 
  | 'config-created'
  | 'config-updated'
  | 'config-deleted'
  | 'config-validated'
  | 'config-imported'
  | 'config-exported'
  | 'template-created'
  | 'template-updated'
  | 'template-deleted'

/**
 * Configuration event
 */
export interface ConfigEvent {
  /** Event type */
  type: ConfigEventType
  /** Event timestamp */
  timestamp: string
  /** Event data */
  data: any
  /** Screen ID */
  screenId?: string
  /** User ID */
  userId?: string
}

/**
 * Configuration event handler
 */
export type ConfigEventHandler = (event: ConfigEvent) => void

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Configuration merge strategy
 */
export type ConfigMergeStrategy = 'replace' | 'merge' | 'deep-merge' | 'custom'

/**
. Configuration merge options
 */
export interface ConfigMergeOptions {
  /** Merge strategy */
  strategy: ConfigMergeStrategy
  /** Custom merge function */
  customMerge?: (base: any, override: any) => any
  /** Properties to exclude from merge */
  exclude?: string[]
  /** Properties to include in merge */
  include?: string[]
}

/**
 * Configuration search options
 */
export interface ConfigSearchOptions {
  /** Search query */
  query: string
  /** Search fields */
  fields?: string[]
  /** Case sensitive */
  caseSensitive?: boolean
  /** Exact match */
  exactMatch?: boolean
  /** Limit results */
  limit?: number
  /** Offset results */
  offset?: number
}

/**
 * Configuration filter options
 */
export interface ConfigFilterOptions {
  /** Filter by tags */
  tags?: string[]
  /** Filter by category */
  category?: string
  /** Filter by theme */
  theme?: 'dark' | 'light'
  /** Filter by layout */
  layout?: string
  /** Filter by date range */
  dateRange?: {
    start: string
    end: string
  }
  /** Filter by author */
  author?: string
}
