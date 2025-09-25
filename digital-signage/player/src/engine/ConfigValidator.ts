/**
 * Configuration Validator
 * Validates configuration objects against schemas and business rules
 */

import type {
  ScreenConfig,
  ConfigValidationResult,
  ConfigValidationError,
  ConfigValidator,
  WeatherConfig,
  ClockConfig,
  NewsConfig,
  SlideshowConfig,
  WebViewerConfig,
  PVConfig,
  GlobalSettings,
  ScheduleConfig
} from '../types/ConfigTypes'

export class ConfigurationValidator implements ConfigValidator {
  name = 'ConfigurationValidator'
  version = '1.0.0'

  /**
   * Validate configuration
   */
  validate(config: ScreenConfig): ConfigValidationResult {
    const errors: ConfigValidationError[] = []
    const warnings: ConfigValidationError[] = []
    const info: ConfigValidationError[] = []

    // Validate base configuration
    this.validateBaseConfig(config, errors, warnings, info)

    // Validate component configurations
    if (config.components) {
      this.validateComponentConfigs(config.components, errors, warnings, info)
    }

    // Validate global settings
    if (config.global) {
      this.validateGlobalSettings(config.global, errors, warnings, info)
    }

    // Validate schedule configuration
    if (config.schedule) {
      this.validateScheduleConfig(config.schedule, errors, warnings, info)
    }

    // Validate layout configuration
    if (config.layout) {
      this.validateLayoutConfig(config.layout, errors, warnings, info)
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info
    }
  }

  /**
   * Validate base configuration
   */
  private validateBaseConfig(
    config: ScreenConfig,
    errors: ConfigValidationError[],
    warnings: ConfigValidationError[],
    info: ConfigValidationError[]
  ): void {
    // Required fields
    if (!config.id) {
      errors.push({
        path: 'id',
        message: 'Configuration ID is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    }

    if (!config.screenId) {
      errors.push({
        path: 'screenId',
        message: 'Screen ID is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    }

    if (!config.name) {
      errors.push({
        path: 'name',
        message: 'Configuration name is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    }

    // Theme validation
    if (config.theme && !['dark', 'light'].includes(config.theme)) {
      errors.push({
        path: 'theme',
        message: 'Theme must be either "dark" or "light"',
        code: 'INVALID_VALUE',
        severity: 'error',
        suggestion: 'Use "dark" or "light"'
      })
    }

    // Timezone validation
    if (config.timezone) {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: config.timezone })
      } catch {
        errors.push({
          path: 'timezone',
          message: 'Invalid timezone format',
          code: 'INVALID_TIMEZONE',
          severity: 'error',
          suggestion: 'Use valid IANA timezone (e.g., "Europe/Berlin")'
        })
      }
    }

    // Power profile validation
    if (config.powerProfile && !['performance', 'balanced', 'visual'].includes(config.powerProfile)) {
      errors.push({
        path: 'powerProfile',
        message: 'Power profile must be "performance", "balanced", or "visual"',
        code: 'INVALID_VALUE',
        severity: 'error'
      })
    }

    // Version validation
    if (config.version && !this.isValidVersion(config.version)) {
      warnings.push({
        path: 'version',
        message: 'Version format should follow semantic versioning',
        code: 'INVALID_VERSION_FORMAT',
        severity: 'warning',
        suggestion: 'Use format like "1.0.0"'
      })
    }
  }

  /**
   * Validate component configurations
   */
  private validateComponentConfigs(
    components: any,
    errors: ConfigValidationError[],
    warnings: ConfigValidationError[],
    info: ConfigValidationError[]
  ): void {
    // Weather configuration
    if (components.weather) {
      this.validateWeatherConfig(components.weather, errors, warnings, info)
    }

    // Clock configuration
    if (components.clock) {
      this.validateClockConfig(components.clock, errors, warnings, info)
    }

    // News configuration
    if (components.news) {
      this.validateNewsConfig(components.news, errors, warnings, info)
    }

    // Slideshow configuration
    if (components.slideshow) {
      this.validateSlideshowConfig(components.slideshow, errors, warnings, info)
    }

    // Web viewer configuration
    if (components.webViewer) {
      this.validateWebViewerConfig(components.webViewer, errors, warnings, info)
    }

    // PV configuration
    if (components.pv) {
      this.validatePVConfig(components.pv, errors, warnings, info)
    }
  }

  /**
   * Validate weather configuration
   */
  private validateWeatherConfig(
    config: WeatherConfig,
    errors: ConfigValidationError[],
    warnings: ConfigValidationError[],
    info: ConfigValidationError[]
  ): void {
    if (!config.location) {
      errors.push({
        path: 'components.weather.location',
        message: 'Weather location is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    }

    if (config.refreshIntervalMs && config.refreshIntervalMs < 60000) {
      warnings.push({
        path: 'components.weather.refreshIntervalMs',
        message: 'Weather refresh interval is very short',
        code: 'SHORT_REFRESH_INTERVAL',
        severity: 'warning',
        suggestion: 'Consider using at least 60000ms (1 minute)'
      })
    }

    if (config.provider && !['openweather', 'openmeteo'].includes(config.provider)) {
      errors.push({
        path: 'components.weather.provider',
        message: 'Invalid weather provider',
        code: 'INVALID_VALUE',
        severity: 'error',
        suggestion: 'Use "openweather" or "openmeteo"'
      })
    }
  }

  /**
   * Validate clock configuration
   */
  private validateClockConfig(
    config: ClockConfig,
    errors: ConfigValidationError[],
    warnings: ConfigValidationError[],
    info: ConfigValidationError[]
  ): void {
    if (!config.type || !['analog', 'digital'].includes(config.type)) {
      errors.push({
        path: 'components.clock.type',
        message: 'Clock type must be "analog" or "digital"',
        code: 'INVALID_VALUE',
        severity: 'error'
      })
    }

    if (config.style) {
      const validStyles = ['classic', 'mono', 'glass', 'minimal', 'neon', 'flip']
      if (!validStyles.includes(config.style)) {
        errors.push({
          path: 'components.clock.style',
          message: `Invalid clock style. Must be one of: ${validStyles.join(', ')}`,
          code: 'INVALID_VALUE',
          severity: 'error'
        })
      }
    }

    if (config.size && (config.size < 10 || config.size > 1000)) {
      warnings.push({
        path: 'components.clock.size',
        message: 'Clock size should be between 10 and 1000 pixels',
        code: 'INVALID_SIZE',
        severity: 'warning'
      })
    }

    if (config.color && !this.isValidColor(config.color)) {
      errors.push({
        path: 'components.clock.color',
        message: 'Invalid color format',
        code: 'INVALID_COLOR',
        severity: 'error',
        suggestion: 'Use hex format like "#ffffff" or "rgb(255,255,255)"'
      })
    }
  }

  /**
   * Validate news configuration
   */
  private validateNewsConfig(
    config: NewsConfig,
    errors: ConfigValidationError[],
    warnings: ConfigValidationError[],
    info: ConfigValidationError[]
  ): void {
    if (!config.category || !['wirtschaft', 'top', 'sport', 'politik'].includes(config.category)) {
      errors.push({
        path: 'components.news.category',
        message: 'Invalid news category',
        code: 'INVALID_VALUE',
        severity: 'error',
        suggestion: 'Use "wirtschaft", "top", "sport", or "politik"'
      })
    }

    if (config.limit && (config.limit < 1 || config.limit > 50)) {
      warnings.push({
        path: 'components.news.limit',
        message: 'News limit should be between 1 and 50',
        code: 'INVALID_LIMIT',
        severity: 'warning'
      })
    }

    if (config.rotationMs && config.rotationMs < 1000) {
      warnings.push({
        path: 'components.news.rotationMs',
        message: 'News rotation interval is very short',
        code: 'SHORT_ROTATION_INTERVAL',
        severity: 'warning',
        suggestion: 'Consider using at least 1000ms'
      })
    }

    if (config.rssUrl && !this.isValidUrl(config.rssUrl)) {
      errors.push({
        path: 'components.news.rssUrl',
        message: 'Invalid RSS URL format',
        code: 'INVALID_URL',
        severity: 'error'
      })
    }
  }

  /**
   * Validate slideshow configuration
   */
  private validateSlideshowConfig(
    config: SlideshowConfig,
    errors: ConfigValidationError[],
    warnings: ConfigValidationError[],
    info: ConfigValidationError[]
  ): void {
    if (!Array.isArray(config.images)) {
      errors.push({
        path: 'components.slideshow.images',
        message: 'Images must be an array',
        code: 'INVALID_TYPE',
        severity: 'error'
      })
    } else if (config.images.length === 0) {
      warnings.push({
        path: 'components.slideshow.images',
        message: 'No images configured for slideshow',
        code: 'EMPTY_IMAGES',
        severity: 'warning'
      })
    } else {
      // Validate image URLs
      config.images.forEach((image, index) => {
        if (!this.isValidUrl(image) && !image.startsWith('/')) {
          errors.push({
            path: `components.slideshow.images[${index}]`,
            message: 'Invalid image URL',
            code: 'INVALID_URL',
            severity: 'error'
          })
        }
      })
    }

    if (config.intervalMs && config.intervalMs < 1000) {
      warnings.push({
        path: 'components.slideshow.intervalMs',
        message: 'Slideshow interval is very short',
        code: 'SHORT_INTERVAL',
        severity: 'warning',
        suggestion: 'Consider using at least 1000ms'
      })
    }

    if (config.animations && Array.isArray(config.animations)) {
      const validAnimations = ['fade', 'cut', 'wipe']
      config.animations.forEach((animation, index) => {
        if (!validAnimations.includes(animation)) {
          errors.push({
            path: `components.slideshow.animations[${index}]`,
            message: `Invalid animation type: ${animation}`,
            code: 'INVALID_ANIMATION',
            severity: 'error',
            suggestion: `Use one of: ${validAnimations.join(', ')}`
          })
        }
      })
    }

    if (config.durationMs && (config.durationMs < 100 || config.durationMs > 10000)) {
      warnings.push({
        path: 'components.slideshow.durationMs',
        message: 'Animation duration should be between 100ms and 10000ms',
        code: 'INVALID_DURATION',
        severity: 'warning'
      })
    }
  }

  /**
   * Validate web viewer configuration
   */
  private validateWebViewerConfig(
    config: WebViewerConfig,
    errors: ConfigValidationError[],
    warnings: ConfigValidationError[],
    info: ConfigValidationError[]
  ): void {
    if (!config.url) {
      errors.push({
        path: 'components.webViewer.url',
        message: 'Web viewer URL is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    } else if (!this.isValidUrl(config.url)) {
      errors.push({
        path: 'components.webViewer.url',
        message: 'Invalid web viewer URL',
        code: 'INVALID_URL',
        severity: 'error'
      })
    }

    if (config.mode && !['iframe', 'snapshot'].includes(config.mode)) {
      errors.push({
        path: 'components.webViewer.mode',
        message: 'Web viewer mode must be "iframe" or "snapshot"',
        code: 'INVALID_VALUE',
        severity: 'error'
      })
    }

    if (config.snapshotRefreshMs && config.snapshotRefreshMs < 30000) {
      warnings.push({
        path: 'components.webViewer.snapshotRefreshMs',
        message: 'Snapshot refresh interval is very short',
        code: 'SHORT_REFRESH_INTERVAL',
        severity: 'warning',
        suggestion: 'Consider using at least 30000ms (30 seconds)'
      })
    }

    if (config.autoScrollDistancePct && (config.autoScrollDistancePct < 1 || config.autoScrollDistancePct > 100)) {
      errors.push({
        path: 'components.webViewer.autoScrollDistancePct',
        message: 'Auto-scroll distance must be between 1 and 100 percent',
        code: 'INVALID_PERCENTAGE',
        severity: 'error'
      })
    }
  }

  /**
   * Validate PV configuration
   */
  private validatePVConfig(
    config: PVConfig,
    errors: ConfigValidationError[],
    warnings: ConfigValidationError[],
    info: ConfigValidationError[]
  ): void {
    if (!config.token) {
      errors.push({
        path: 'components.pv.token',
        message: 'PV token is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    }

    if (config.mode && !['flow', 'compact', 'detailed'].includes(config.mode)) {
      errors.push({
        path: 'components.pv.mode',
        message: 'PV mode must be "flow", "compact", or "detailed"',
        code: 'INVALID_VALUE',
        severity: 'error'
      })
    }

    if (config.refreshIntervalMs && config.refreshIntervalMs < 30000) {
      warnings.push({
        path: 'components.pv.refreshIntervalMs',
        message: 'PV refresh interval is very short',
        code: 'SHORT_REFRESH_INTERVAL',
        severity: 'warning',
        suggestion: 'Consider using at least 30000ms (30 seconds)'
      })
    }
  }

  /**
   * Validate global settings
   */
  private validateGlobalSettings(
    settings: GlobalSettings,
    errors: ConfigValidationError[],
    warnings: ConfigValidationError[],
    info: ConfigValidationError[]
  ): void {
    if (settings.welcomeTextColor && !this.isValidColor(settings.welcomeTextColor)) {
      errors.push({
        path: 'global.welcomeTextColor',
        message: 'Invalid welcome text color',
        code: 'INVALID_COLOR',
        severity: 'error'
      })
    }

    if (settings.bottomWidgetsBgColor && !this.isValidColor(settings.bottomWidgetsBgColor)) {
      errors.push({
        path: 'global.bottomWidgetsBgColor',
        message: 'Invalid bottom widgets background color',
        code: 'INVALID_COLOR',
        severity: 'error'
      })
    }

    if (settings.bottomWidgetsBgImage && !this.isValidUrl(settings.bottomWidgetsBgImage) && !settings.bottomWidgetsBgImage.startsWith('/')) {
      errors.push({
        path: 'global.bottomWidgetsBgImage',
        message: 'Invalid bottom widgets background image URL',
        code: 'INVALID_URL',
        severity: 'error'
      })
    }

    if (settings.refreshIntervals) {
      if (settings.refreshIntervals.contentMs && settings.refreshIntervals.contentMs < 10000) {
        warnings.push({
          path: 'global.refreshIntervals.contentMs',
          message: 'Content refresh interval is very short',
          code: 'SHORT_REFRESH_INTERVAL',
          severity: 'warning',
          suggestion: 'Consider using at least 10000ms (10 seconds)'
        })
      }

      if (settings.refreshIntervals.rotateMs && settings.refreshIntervals.rotateMs < 1000) {
        warnings.push({
          path: 'global.refreshIntervals.rotateMs',
          message: 'Rotation interval is very short',
          code: 'SHORT_ROTATION_INTERVAL',
          severity: 'warning',
          suggestion: 'Consider using at least 1000ms'
        })
      }
    }
  }

  /**
   * Validate schedule configuration
   */
  private validateScheduleConfig(
    schedule: ScheduleConfig,
    errors: ConfigValidationError[],
    warnings: ConfigValidationError[],
    info: ConfigValidationError[]
  ): void {
    if (schedule.rules && Array.isArray(schedule.rules)) {
      schedule.rules.forEach((rule, index) => {
        this.validateScheduleRule(rule, index, errors, warnings, info)
      })
    }
  }

  /**
   * Validate schedule rule
   */
  private validateScheduleRule(
    rule: any,
    index: number,
    errors: ConfigValidationError[],
    warnings: ConfigValidationError[],
    info: ConfigValidationError[]
  ): void {
    const basePath = `schedule.rules[${index}]`

    if (!rule.id) {
      errors.push({
        path: `${basePath}.id`,
        message: 'Schedule rule ID is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    }

    if (!rule.name) {
      errors.push({
        path: `${basePath}.name`,
        message: 'Schedule rule name is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    }

    if (!Array.isArray(rule.days) || rule.days.length === 0) {
      errors.push({
        path: `${basePath}.days`,
        message: 'Schedule rule must have at least one day',
        code: 'INVALID_DAYS',
        severity: 'error'
      })
    } else {
      rule.days.forEach((day: any, dayIndex: number) => {
        if (typeof day !== 'number' || day < 0 || day > 6) {
          errors.push({
            path: `${basePath}.days[${dayIndex}]`,
            message: 'Day must be a number between 0 (Sunday) and 6 (Saturday)',
            code: 'INVALID_DAY',
            severity: 'error'
          })
        }
      })
    }

    if (!rule.startTime || !this.isValidTime(rule.startTime)) {
      errors.push({
        path: `${basePath}.startTime`,
        message: 'Invalid start time format',
        code: 'INVALID_TIME',
        severity: 'error',
        suggestion: 'Use HH:MM format (e.g., "09:00")'
      })
    }

    if (!rule.endTime || !this.isValidTime(rule.endTime)) {
      errors.push({
        path: `${basePath}.endTime`,
        message: 'Invalid end time format',
        code: 'INVALID_TIME',
        severity: 'error',
        suggestion: 'Use HH:MM format (e.g., "17:00")'
      })
    }

    if (rule.priority && (rule.priority < 0 || rule.priority > 1000)) {
      warnings.push({
        path: `${basePath}.priority`,
        message: 'Priority should be between 0 and 1000',
        code: 'INVALID_PRIORITY',
        severity: 'warning'
      })
    }
  }

  /**
   * Validate layout configuration
   */
  private validateLayoutConfig(
    layout: any,
    errors: ConfigValidationError[],
    warnings: ConfigValidationError[],
    info: ConfigValidationError[]
  ): void {
    if (!layout.id) {
      errors.push({
        path: 'layout.id',
        message: 'Layout ID is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    }

    if (!layout.name) {
      errors.push({
        path: 'layout.name',
        message: 'Layout name is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    }

    if (layout.grid) {
      if (layout.grid.cols && (layout.grid.cols < 1 || layout.grid.cols > 24)) {
        errors.push({
          path: 'layout.grid.cols',
          message: 'Grid columns must be between 1 and 24',
          code: 'INVALID_GRID_SIZE',
          severity: 'error'
        })
      }

      if (layout.grid.rows && (layout.grid.rows < 1 || layout.grid.rows > 24)) {
        errors.push({
          path: 'layout.grid.rows',
          message: 'Grid rows must be between 1 and 24',
          code: 'INVALID_GRID_SIZE',
          severity: 'error'
        })
      }
    }

    if (layout.components && Array.isArray(layout.components)) {
      layout.components.forEach((component: any, index: number) => {
        this.validateLayoutComponent(component, index, errors, warnings, info)
      })
    }
  }

  /**
   * Validate layout component
   */
  private validateLayoutComponent(
    component: any,
    index: number,
    errors: ConfigValidationError[],
    warnings: ConfigValidationError[],
    info: ConfigValidationError[]
  ): void {
    const basePath = `layout.components[${index}]`

    if (!component.id) {
      errors.push({
        path: `${basePath}.id`,
        message: 'Component ID is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    }

    if (!component.type) {
      errors.push({
        path: `${basePath}.type`,
        message: 'Component type is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    }

    if (component.position) {
      const { x, y, w, h } = component.position
      if (typeof x !== 'number' || x < 1) {
        errors.push({
          path: `${basePath}.position.x`,
          message: 'Component X position must be a number >= 1',
          code: 'INVALID_POSITION',
          severity: 'error'
        })
      }

      if (typeof y !== 'number' || y < 1) {
        errors.push({
          path: `${basePath}.position.y`,
          message: 'Component Y position must be a number >= 1',
          code: 'INVALID_POSITION',
          severity: 'error'
        })
      }

      if (typeof w !== 'number' || w < 1) {
        errors.push({
          path: `${basePath}.position.w`,
          message: 'Component width must be a number >= 1',
          code: 'INVALID_SIZE',
          severity: 'error'
        })
      }

      if (typeof h !== 'number' || h < 1) {
        errors.push({
          path: `${basePath}.position.h`,
          message: 'Component height must be a number >= 1',
          code: 'INVALID_SIZE',
          severity: 'error'
        })
      }
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if version is valid semantic version
   */
  private isValidVersion(version: string): boolean {
    const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/
    return semverRegex.test(version)
  }

  /**
   * Check if color is valid
   */
  private isValidColor(color: string): boolean {
    // Check hex color
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      return true
    }

    // Check rgb/rgba color
    if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/.test(color)) {
      return true
    }

    // Check named colors (basic set)
    const namedColors = [
      'black', 'white', 'red', 'green', 'blue', 'yellow', 'orange', 'purple',
      'pink', 'brown', 'gray', 'grey', 'cyan', 'magenta', 'lime', 'navy',
      'olive', 'maroon', 'teal', 'silver', 'aqua', 'fuchsia'
    ]
    return namedColors.includes(color.toLowerCase())
  }

  /**
   * Check if URL is valid
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Check if time is valid (HH:MM format)
   */
  private isValidTime(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(time)
  }
}
