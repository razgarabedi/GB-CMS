/**
 * Configuration Migration System
 * Handles configuration versioning and migration between different schema versions
 */

import type { ScreenConfig, ConfigMigration, ConfigVersion } from '../types/ConfigTypes'

export class ConfigMigrationEngine {
  private migrations: Map<string, ConfigMigration> = new Map()
  private versionHistory: ConfigVersion[] = []

  constructor() {
    this.initializeMigrations()
  }

  /**
   * Migrate configuration to target version
   */
  migrateConfig(config: ScreenConfig, targetVersion: string): ScreenConfig {
    const currentVersion = config.version || '1.0.0'
    
    if (currentVersion === targetVersion) {
      return config
    }

    // Get migration path
    const migrationPath = this.getMigrationPath(currentVersion, targetVersion)
    
    let migratedConfig = { ...config }
    
    // Apply migrations in sequence
    for (const migration of migrationPath) {
      const migrationFn = this.migrations.get(migration)
      if (migrationFn) {
        migratedConfig = migrationFn.migrate(migratedConfig)
        migratedConfig.version = migration
      }
    }

    return migratedConfig
  }

  /**
   * Register migration
   */
  registerMigration(version: string, migration: ConfigMigration): void {
    this.migrations.set(version, migration)
  }

  /**
   * Get available versions
   */
  getAvailableVersions(): string[] {
    return Array.from(this.migrations.keys()).sort(this.compareVersions)
  }

  /**
   * Get migration path between versions
   */
  private getMigrationPath(fromVersion: string, toVersion: string): string[] {
    const versions = this.getAvailableVersions()
    const fromIndex = versions.indexOf(fromVersion)
    const toIndex = versions.indexOf(toVersion)

    if (fromIndex === -1 || toIndex === -1) {
      throw new Error(`Version not found: ${fromVersion} -> ${toVersion}`)
    }

    if (fromIndex === toIndex) {
      return []
    }

    if (fromIndex < toIndex) {
      // Forward migration
      return versions.slice(fromIndex + 1, toIndex + 1)
    } else {
      // Backward migration (not supported in this implementation)
      throw new Error(`Backward migration not supported: ${fromVersion} -> ${toVersion}`)
    }
  }

  /**
   * Compare version strings
   */
  private compareVersions(a: string, b: string): number {
    const aParts = a.split('.').map(Number)
    const bParts = b.split('.').map(Number)
    
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0
      const bPart = bParts[i] || 0
      
      if (aPart < bPart) return -1
      if (aPart > bPart) return 1
    }
    
    return 0
  }

  /**
   * Initialize default migrations
   */
  private initializeMigrations(): void {
    // Migration from 1.0.0 to 1.1.0
    this.registerMigration('1.1.0', {
      migrate: (config: any) => {
        const migrated = { ...config }
        
        // Add new fields with defaults
        if (!migrated.components) {
          migrated.components = {}
        }

        // Migrate weather configuration
        if (migrated.weatherLocation && !migrated.components.weather) {
          migrated.components.weather = {
            location: migrated.weatherLocation,
            showClock: false,
            showAnimatedBg: false,
            refreshIntervalMs: 600000
          }
        }

        // Migrate clock configuration
        if (migrated.clockType && !migrated.components.clock) {
          migrated.components.clock = {
            type: migrated.clockType,
            style: migrated.clockStyle || 'classic',
            showSeconds: true,
            format24h: true
          }
        }

        // Migrate slideshow configuration
        if (migrated.slides && !migrated.components.slideshow) {
          migrated.components.slideshow = {
            images: migrated.slides,
            intervalMs: migrated.refreshIntervals?.rotateMs || 8000,
            animations: migrated.slideshowAnimations || ['fade'],
            durationMs: migrated.slideshowAnimationDurationMs || 900,
            preloadNext: migrated.slideshowPreloadNext ?? true
          }
        }

        // Migrate web viewer configuration
        if (migrated.webViewerUrl && !migrated.components.webViewer) {
          migrated.components.webViewer = {
            url: migrated.webViewerUrl,
            mode: migrated.webViewerMode || 'iframe',
            snapshotRefreshMs: migrated.snapshotRefreshMs || 300000,
            autoScrollEnabled: migrated.autoScrollEnabled ?? false,
            autoScrollMs: migrated.autoScrollMs || 30000,
            autoScrollDistancePct: migrated.autoScrollDistancePct || 25,
            autoScrollStartDelayMs: migrated.autoScrollStartDelayMs || 0
          }
        }

        // Migrate news configuration
        if (migrated.newsCategory && !migrated.components.news) {
          migrated.components.news = {
            category: migrated.newsCategory,
            limit: migrated.newsLimit || 8,
            rotationMs: migrated.newsRotationMs || 8000,
            compact: false,
            refreshIntervalMs: 300000
          }
        }

        // Create global settings
        if (!migrated.global) {
          migrated.global = {
            welcomeText: migrated.welcomeText || 'Herzlich Willkommen',
            welcomeTextColor: migrated.welcomeTextColor || '#ffffff',
            bottomWidgetsBgColor: migrated.bottomWidgetsBgColor,
            bottomWidgetsBgImage: migrated.bottomWidgetsBgImage,
            hideCursor: migrated.hideCursor ?? false,
            autoRefresh: true,
            refreshIntervals: migrated.refreshIntervals || {
              contentMs: 30000,
              rotateMs: 8000
            }
          }
        }

        // Create schedule configuration
        if (!migrated.schedule) {
          migrated.schedule = {
            rules: migrated.schedule || [],
            default: {},
            timezone: migrated.timezone || 'UTC'
          }
        }

        // Create layout configuration
        if (!migrated.layout) {
          migrated.layout = {
            id: `layout_${Date.now()}`,
            name: 'Migrated Layout',
            description: 'Layout migrated from legacy configuration',
            grid: { cols: 12, rows: 8, gap: 2, showGrid: false },
            components: [],
            metadata: {
              createdAt: new Date().toISOString(),
              version: '1.0.0',
              migrated: true
            }
          }
        }

        // Clean up legacy fields
        delete migrated.weatherLocation
        delete migrated.clockType
        delete migrated.clockStyle
        delete migrated.slides
        delete migrated.webViewerUrl
        delete migrated.webViewerMode
        delete migrated.snapshotRefreshMs
        delete migrated.autoScrollEnabled
        delete migrated.autoScrollMs
        delete migrated.autoScrollDistancePct
        delete migrated.autoScrollStartDelayMs
        delete migrated.newsCategory
        delete migrated.newsLimit
        delete migrated.newsRotationMs
        delete migrated.slideshowAnimations
        delete migrated.slideshowAnimationDurationMs
        delete migrated.slideshowPreloadNext
        delete migrated.welcomeText
        delete migrated.welcomeTextColor
        delete migrated.bottomWidgetsBgColor
        delete migrated.bottomWidgetsBgImage
        delete migrated.hideCursor
        delete migrated.refreshIntervals

        return migrated
      },
      validate: (config: any) => {
        return config.components && config.global && config.schedule && config.layout
      }
    })

    // Migration from 1.1.0 to 1.2.0
    this.registerMigration('1.2.0', {
      migrate: (config: any) => {
        const migrated = { ...config }

        // Add new component configurations
        if (!migrated.components.pv) {
          migrated.components.pv = {
            token: '',
            mode: 'flow',
            refreshIntervalMs: 300000
          }
        }

        // Add configuration inheritance support
        if (!migrated.inheritance) {
          migrated.inheritance = {
            inherited: [],
            overridden: [],
            level: 0
          }
        }

        // Add metadata if missing
        if (!migrated.metadata) {
          migrated.metadata = {}
        }

        migrated.metadata.migratedTo = '1.2.0'
        migrated.metadata.migrationDate = new Date().toISOString()

        return migrated
      },
      validate: (config: any) => {
        return config.components.pv && config.inheritance
      }
    })

    // Migration from 1.2.0 to 1.3.0
    this.registerMigration('1.3.0', {
      migrate: (config: any) => {
        const migrated = { ...config }

        // Add enhanced validation
        if (!migrated.metadata.validation) {
          migrated.metadata.validation = {
            lastValidated: new Date().toISOString(),
            validationVersion: '1.3.0',
            errors: [],
            warnings: []
          }
        }

        // Add configuration tags if missing
        if (!migrated.tags) {
          migrated.tags = ['migrated']
        }

        // Add configuration description if missing
        if (!migrated.description) {
          migrated.description = `Configuration migrated from version ${config.version}`
        }

        migrated.metadata.migratedTo = '1.3.0'
        migrated.metadata.migrationDate = new Date().toISOString()

        return migrated
      },
      validate: (config: any) => {
        return config.metadata?.validation && config.tags && config.description
      }
    })
  }

  /**
   * Get migration information
   */
  getMigrationInfo(fromVersion: string, toVersion: string): {
    path: string[]
    description: string
    breakingChanges: string[]
    newFeatures: string[]
  } {
    const path = this.getMigrationPath(fromVersion, toVersion)
    
    const info = {
      path,
      description: `Migration from ${fromVersion} to ${toVersion}`,
      breakingChanges: [] as string[],
      newFeatures: [] as string[]
    }

    // Add version-specific information
    if (path.includes('1.1.0')) {
      info.breakingChanges.push('Legacy configuration fields removed')
      info.newFeatures.push('Component-based configuration structure')
      info.newFeatures.push('Enhanced global settings')
      info.newFeatures.push('Schedule configuration system')
    }

    if (path.includes('1.2.0')) {
      info.newFeatures.push('PV component configuration')
      info.newFeatures.push('Configuration inheritance system')
    }

    if (path.includes('1.3.0')) {
      info.newFeatures.push('Enhanced validation system')
      info.newFeatures.push('Configuration metadata')
      info.newFeatures.push('Tag-based organization')
    }

    return info
  }

  /**
   * Validate configuration compatibility
   */
  validateCompatibility(config: ScreenConfig, targetVersion: string): {
    compatible: boolean
    issues: string[]
    suggestions: string[]
  } {
    const issues: string[] = []
    const suggestions: string[] = []

    // Check if configuration can be migrated
    try {
      this.getMigrationPath(config.version || '1.0.0', targetVersion)
    } catch (error) {
      issues.push(`Cannot migrate from ${config.version} to ${targetVersion}`)
      return { compatible: false, issues, suggestions }
    }

    // Check for potential issues
    if (!config.components && (config.version || '1.0.0') < '1.1.0') {
      suggestions.push('Configuration will be restructured to use component-based architecture')
    }

    if (!config.global && (config.version || '1.0.0') < '1.1.0') {
      suggestions.push('Global settings will be extracted from legacy configuration')
    }

    if (!config.schedule && (config.version || '1.0.0') < '1.1.0') {
      suggestions.push('Schedule configuration will be created from legacy schedule data')
    }

    return {
      compatible: true,
      issues,
      suggestions
    }
  }

  /**
   * Create migration preview
   */
  createMigrationPreview(config: ScreenConfig, targetVersion: string): {
    original: ScreenConfig
    migrated: ScreenConfig
    changes: Array<{
      type: 'added' | 'modified' | 'removed'
      path: string
      oldValue?: any
      newValue?: any
      description: string
    }>
  } {
    const original = { ...config }
    const migrated = this.migrateConfig(config, targetVersion)
    const changes: any[] = []

    // Detect changes
    this.detectConfigurationChanges(original, migrated, '', changes)

    return {
      original,
      migrated,
      changes
    }
  }

  /**
   * Detect configuration changes
   */
  private detectConfigurationChanges(
    original: any,
    migrated: any,
    path: string,
    changes: any[]
  ): void {
    const allKeys = new Set([...Object.keys(original), ...Object.keys(migrated)])

    for (const key of allKeys) {
      const currentPath = path ? `${path}.${key}` : key
      const originalValue = original[key]
      const migratedValue = migrated[key]

      if (!(key in original)) {
        // Added
        changes.push({
          type: 'added',
          path: currentPath,
          newValue: migratedValue,
          description: `Added ${key}`
        })
      } else if (!(key in migrated)) {
        // Removed
        changes.push({
          type: 'removed',
          path: currentPath,
          oldValue: originalValue,
          description: `Removed ${key}`
        })
      } else if (typeof originalValue === 'object' && typeof migratedValue === 'object' && 
                 originalValue !== null && migratedValue !== null) {
        // Recursively check nested objects
        this.detectConfigurationChanges(originalValue, migratedValue, currentPath, changes)
      } else if (originalValue !== migratedValue) {
        // Modified
        changes.push({
          type: 'modified',
          path: currentPath,
          oldValue: originalValue,
          newValue: migratedValue,
          description: `Modified ${key}`
        })
      }
    }
  }
}
