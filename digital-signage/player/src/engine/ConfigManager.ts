/**
 * Configuration Manager
 * Manages configuration storage, validation, templates, and versioning
 */

import type {
  ScreenConfig,
  ConfigTemplate,
  ConfigValidationResult,
  ConfigExport,
  ConfigVersion,
  ConfigManager as IConfigManager,
  ConfigEvent,
  ConfigEventType,
  ConfigEventHandler,
  ConfigVariable,
  ConfigMergeOptions,
  ConfigSearchOptions,
  ConfigFilterOptions
} from '../types/ConfigTypes'
import { ConfigurationValidator } from './ConfigValidator'

export class ConfigManager implements IConfigManager {
  private validator: ConfigurationValidator
  private eventHandlers: Map<ConfigEventType, ConfigEventHandler[]> = new Map()
  private configs: Map<string, ScreenConfig> = new Map()
  private templates: Map<string, ConfigTemplate> = new Map()
  private configHistory: Map<string, ConfigVersion[]> = new Map()

  constructor() {
    this.validator = new ConfigurationValidator()
    this.initializeDefaultTemplates()
    this.loadFromStorage()
  }

  // ============================================================================
  // CONFIGURATION MANAGEMENT
  // ============================================================================

  /**
   * Get configuration by screen ID
   */
  async getConfig(screenId: string): Promise<ScreenConfig | null> {
    return this.configs.get(screenId) || null
  }

  /**
   * Save configuration
   */
  async saveConfig(config: ScreenConfig): Promise<ScreenConfig> {
    // Validate configuration
    const validation = await this.validateConfig(config)
    if (!validation.valid) {
      throw new Error(`Configuration validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
    }

    // Create version history entry
    const existingConfig = this.configs.get(config.screenId)
    if (existingConfig) {
      await this.createVersionHistory(config.screenId, existingConfig, config)
    }

    // Save configuration
    const savedConfig = {
      ...config,
      updatedAt: new Date().toISOString()
    }

    this.configs.set(config.screenId, savedConfig)
    this.persistToStorage()

    // Emit event
    this.emit('config-updated', {
      type: 'config-updated',
      timestamp: new Date().toISOString(),
      data: savedConfig,
      screenId: config.screenId
    })

    return savedConfig
  }

  /**
   * Delete configuration
   */
  async deleteConfig(screenId: string): Promise<boolean> {
    const deleted = this.configs.delete(screenId)
    if (deleted) {
      this.persistToStorage()
      this.emit('config-deleted', {
        type: 'config-deleted',
        timestamp: new Date().toISOString(),
        data: { screenId },
        screenId
      })
    }
    return deleted
  }

  /**
   * List all configurations
   */
  async listConfigs(): Promise<ScreenConfig[]> {
    return Array.from(this.configs.values())
  }

  /**
   * Validate configuration
   */
  async validateConfig(config: ScreenConfig): Promise<ConfigValidationResult> {
    return this.validator.validate(config)
  }

  // ============================================================================
  // TEMPLATE MANAGEMENT
  // ============================================================================

  /**
   * Get configuration template
   */
  async getTemplate(templateId: string): Promise<ConfigTemplate | null> {
    return this.templates.get(templateId) || null
  }

  /**
   * List all templates
   */
  async listTemplates(): Promise<ConfigTemplate[]> {
    return Array.from(this.templates.values())
  }

  /**
   * Create configuration from template
   */
  async createFromTemplate(templateId: string, variables: Record<string, any>): Promise<ScreenConfig> {
    const template = await this.getTemplate(templateId)
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }

    // Create configuration from template
    const config = this.applyTemplateVariables(template.config, variables)
    
    // Ensure required fields
    const screenConfig: ScreenConfig = {
      version: '1.0.0',
      id: `config_${Date.now()}`,
      name: config.name || template.name,
      description: config.description || template.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      screenId: variables.screenId || `screen_${Date.now()}`,
      theme: config.theme || 'dark',
      timezone: config.timezone || 'UTC',
      layout: config.layout || this.getDefaultLayout(),
      components: config.components || {},
      global: config.global || this.getDefaultGlobalSettings(),
      schedule: config.schedule || this.getDefaultSchedule(),
      powerProfile: config.powerProfile || 'balanced',
      tags: config.tags || [],
      metadata: config.metadata || {}
    }

    // Validate and save
    await this.saveConfig(screenConfig)

    this.emit('config-created', {
      type: 'config-created',
      timestamp: new Date().toISOString(),
      data: screenConfig,
      screenId: screenConfig.screenId
    })

    return screenConfig
  }

  /**
   * Save configuration as template
   */
  async saveAsTemplate(configId: string, templateName: string, description?: string): Promise<ConfigTemplate> {
    const config = this.configs.get(configId)
    if (!config) {
      throw new Error(`Configuration not found: ${configId}`)
    }

    const template: ConfigTemplate = {
      version: '1.0.0',
      id: `template_${Date.now()}`,
      name: templateName,
      description: description || `Template based on ${config.name}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: 'custom',
      config: { ...config },
      variables: this.extractTemplateVariables(config),
      tags: ['custom'],
      metadata: {
        sourceConfigId: configId,
        sourceConfigName: config.name
      }
    }

    this.templates.set(template.id, template)
    this.persistTemplatesToStorage()

    this.emit('template-created', {
      type: 'template-created',
      timestamp: new Date().toISOString(),
      data: template
    })

    return template
  }

  // ============================================================================
  // IMPORT/EXPORT
  // ============================================================================

  /**
   * Export configuration
   */
  async exportConfig(screenId: string): Promise<ConfigExport> {
    const config = await this.getConfig(screenId)
    if (!config) {
      throw new Error(`Configuration not found: ${screenId}`)
    }

    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      metadata: {
        exportedBy: 'ConfigManager',
        exportReason: 'Manual export',
        sourceVersion: config.version
      },
      config: { ...config },
      dependencies: this.extractDependencies(config)
    }
  }

  /**
   * Import configuration
   */
  async importConfig(exportData: ConfigExport): Promise<ScreenConfig> {
    // Validate export data
    if (!exportData.config) {
      throw new Error('Invalid export data: missing configuration')
    }

    // Create new configuration with unique ID
    const importedConfig: ScreenConfig = {
      ...exportData.config,
      id: `config_${Date.now()}`,
      screenId: `screen_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        ...exportData.config.metadata,
        importedAt: new Date().toISOString(),
        importedFrom: exportData.metadata.exportedBy,
        originalVersion: exportData.metadata.sourceVersion
      }
    }

    // Validate and save
    await this.saveConfig(importedConfig)

    this.emit('config-imported', {
      type: 'config-imported',
      timestamp: new Date().toISOString(),
      data: importedConfig,
      screenId: importedConfig.screenId
    })

    return importedConfig
  }

  // ============================================================================
  // VERSION MANAGEMENT
  // ============================================================================

  /**
   * Get configuration history
   */
  async getConfigHistory(screenId: string): Promise<ConfigVersion[]> {
    return this.configHistory.get(screenId) || []
  }

  /**
   * Restore configuration version
   */
  async restoreConfigVersion(screenId: string, version: string): Promise<ScreenConfig> {
    const history = await this.getConfigHistory(screenId)
    const versionEntry = history.find(v => v.version === version)
    
    if (!versionEntry) {
      throw new Error(`Version not found: ${version}`)
    }

    // Find the configuration at that version
    const config = this.configs.get(screenId)
    if (!config) {
      throw new Error(`Configuration not found: ${screenId}`)
    }

    // Apply migration if needed
    let restoredConfig = { ...config }
    if (versionEntry.migration) {
      restoredConfig = versionEntry.migration.migrate(restoredConfig)
    }

    // Save restored configuration
    await this.saveConfig(restoredConfig)

    return restoredConfig
  }

  // ============================================================================
  // SEARCH AND FILTER
  // ============================================================================

  /**
   * Search configurations
   */
  async searchConfigs(options: ConfigSearchOptions): Promise<ScreenConfig[]> {
    const configs = await this.listConfigs()
    const query = options.caseSensitive ? options.query : options.query.toLowerCase()

    return configs.filter(config => {
      const searchFields = options.fields || ['name', 'description', 'screenId']
      
      return searchFields.some(field => {
        const value = this.getNestedValue(config, field)
        if (typeof value !== 'string') return false
        
        const searchValue = options.caseSensitive ? value : value.toLowerCase()
        
        if (options.exactMatch) {
          return searchValue === query
        } else {
          return searchValue.includes(query)
        }
      })
    }).slice(options.offset || 0, (options.offset || 0) + (options.limit || 100))
  }

  /**
   * Filter configurations
   */
  async filterConfigs(options: ConfigFilterOptions): Promise<ScreenConfig[]> {
    const configs = await this.listConfigs()

    return configs.filter(config => {
      // Filter by tags
      if (options.tags && options.tags.length > 0) {
        const configTags = config.tags || []
        if (!options.tags.some(tag => configTags.includes(tag))) {
          return false
        }
      }

      // Filter by theme
      if (options.theme && config.theme !== options.theme) {
        return false
      }

      // Filter by layout
      if (options.layout && config.layout?.name !== options.layout) {
        return false
      }

      // Filter by date range
      if (options.dateRange) {
        const configDate = new Date(config.updatedAt)
        const startDate = new Date(options.dateRange.start)
        const endDate = new Date(options.dateRange.end)
        
        if (configDate < startDate || configDate > endDate) {
          return false
        }
      }

      return true
    })
  }

  // ============================================================================
  // CONFIGURATION MERGING
  // ============================================================================

  /**
   * Merge configurations
   */
  async mergeConfigs(
    baseConfig: ScreenConfig,
    overrideConfig: Partial<ScreenConfig>,
    options: ConfigMergeOptions = { strategy: 'merge' }
  ): Promise<ScreenConfig> {
    let mergedConfig: ScreenConfig

    switch (options.strategy) {
      case 'replace':
        mergedConfig = { ...baseConfig, ...overrideConfig }
        break
      
      case 'merge':
        mergedConfig = { ...baseConfig, ...overrideConfig }
        break
      
      case 'deep-merge':
        mergedConfig = this.deepMerge(baseConfig, overrideConfig)
        break
      
      case 'custom':
        if (!options.customMerge) {
          throw new Error('Custom merge function required for custom strategy')
        }
        mergedConfig = options.customMerge(baseConfig, overrideConfig)
        break
      
      default:
        throw new Error(`Unknown merge strategy: ${options.strategy}`)
    }

    // Apply include/exclude filters
    if (options.include || options.exclude) {
      mergedConfig = this.applyMergeFilters(mergedConfig, options)
    }

    return mergedConfig
  }

  // ============================================================================
  // EVENT SYSTEM
  // ============================================================================

  /**
   * Register event handler
   */
  on(event: ConfigEventType, handler: ConfigEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event)!.push(handler)
  }

  /**
   * Unregister event handler
   */
  off(event: ConfigEventType, handler: ConfigEventHandler): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index !== -1) {
        handlers.splice(index, 1)
      }
    }
  }

  /**
   * Emit event
   */
  private emit(event: ConfigEventType, data: ConfigEvent): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error(`Error in config event handler for ${event}:`, error)
        }
      })
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Initialize default templates
   */
  private initializeDefaultTemplates(): void {
    const defaultTemplates: ConfigTemplate[] = [
      {
        version: '1.0.0',
        id: 'default',
        name: 'Default Configuration',
        description: 'Standard digital signage configuration',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: 'default',
        config: {
          theme: 'dark',
          timezone: 'UTC',
          layout: this.getDefaultLayout(),
          components: {
            weather: {
              location: 'London',
              showClock: false,
              showAnimatedBg: false,
              refreshIntervalMs: 600000
            },
            clock: {
              type: 'analog',
              style: 'classic',
              showSeconds: true,
              format24h: true
            },
            slideshow: {
              images: [],
              intervalMs: 8000,
              animations: ['fade'],
              durationMs: 900,
              preloadNext: true
            }
          },
          global: this.getDefaultGlobalSettings(),
          schedule: this.getDefaultSchedule(),
          powerProfile: 'balanced'
        },
        variables: [
          {
            name: 'screenId',
            type: 'string',
            description: 'Screen identifier',
            defaultValue: 'screen_1',
            validation: { required: true }
          },
          {
            name: 'weatherLocation',
            type: 'string',
            description: 'Weather location',
            defaultValue: 'London',
            validation: { required: true }
          },
          {
            name: 'timezone',
            type: 'string',
            description: 'Timezone',
            defaultValue: 'UTC',
            validation: { required: true }
          }
        ],
        tags: ['default', 'basic']
      },
      {
        version: '1.0.0',
        id: 'news-focused',
        name: 'News-Focused Configuration',
        description: 'Configuration optimized for news display',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: 'preset',
        config: {
          theme: 'dark',
          timezone: 'UTC',
          layout: this.getDefaultLayout(),
          components: {
            news: {
              category: 'wirtschaft',
              limit: 8,
              rotationMs: 8000,
              compact: false,
              refreshIntervalMs: 300000
            },
            weather: {
              location: 'London',
              showClock: true,
              showAnimatedBg: true,
              refreshIntervalMs: 600000
            },
            slideshow: {
              images: [],
              intervalMs: 10000,
              animations: ['fade', 'wipe'],
              durationMs: 1200,
              preloadNext: true
            }
          },
          global: this.getDefaultGlobalSettings(),
          schedule: this.getDefaultSchedule(),
          powerProfile: 'visual'
        },
        variables: [
          {
            name: 'screenId',
            type: 'string',
            description: 'Screen identifier',
            defaultValue: 'news_screen',
            validation: { required: true }
          },
          {
            name: 'newsCategory',
            type: 'select',
            description: 'News category',
            defaultValue: 'wirtschaft',
            options: [
              { value: 'wirtschaft', label: 'Economy' },
              { value: 'top', label: 'Top News' },
              { value: 'sport', label: 'Sports' },
              { value: 'politik', label: 'Politics' }
            ],
            validation: { required: true }
          }
        ],
        tags: ['news', 'preset']
      }
    ]

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template)
    })
  }

  /**
   * Get default layout
   */
  private getDefaultLayout(): any {
    return {
      id: 'default',
      name: 'Default Layout',
      description: 'Standard layout',
      grid: { cols: 12, rows: 8, gap: 2, showGrid: false },
      components: [],
      metadata: { createdAt: new Date().toISOString(), version: '1.0.0' }
    }
  }

  /**
   * Get default global settings
   */
  private getDefaultGlobalSettings(): any {
    return {
      welcomeText: 'Herzlich Willkommen',
      welcomeTextColor: '#ffffff',
      hideCursor: false,
      autoRefresh: true,
      refreshIntervals: {
        contentMs: 30000,
        rotateMs: 8000
      }
    }
  }

  /**
   * Get default schedule
   */
  private getDefaultSchedule(): any {
    return {
      rules: [],
      default: {},
      timezone: 'UTC'
    }
  }

  /**
   * Apply template variables
   */
  private applyTemplateVariables(config: any, variables: Record<string, any>): any {
    let configStr = JSON.stringify(config)
    
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      configStr = configStr.replace(new RegExp(placeholder, 'g'), JSON.stringify(value))
    })

    return JSON.parse(configStr)
  }

  /**
   * Extract template variables from configuration
   */
  private extractTemplateVariables(config: ScreenConfig): ConfigVariable[] {
    const variables: ConfigVariable[] = []

    // Extract common variables
    if (config.components?.weather?.location) {
      variables.push({
        name: 'weatherLocation',
        type: 'string',
        description: 'Weather location',
        defaultValue: config.components.weather.location,
        validation: { required: true }
      })
    }

    if (config.timezone) {
      variables.push({
        name: 'timezone',
        type: 'string',
        description: 'Timezone',
        defaultValue: config.timezone,
        validation: { required: true }
      })
    }

    return variables
  }

  /**
   * Extract dependencies from configuration
   */
  private extractDependencies(config: ScreenConfig): string[] {
    const dependencies: string[] = []

    // Add layout dependency
    if (config.layout?.id) {
      dependencies.push(`layout:${config.layout.id}`)
    }

    // Add component dependencies
    if (config.components) {
      Object.keys(config.components).forEach(componentType => {
        dependencies.push(`component:${componentType}`)
      })
    }

    return dependencies
  }

  /**
   * Create version history entry
   */
  private async createVersionHistory(screenId: string, oldConfig: ScreenConfig, newConfig: ScreenConfig): Promise<void> {
    const history = this.configHistory.get(screenId) || []
    
    const version: ConfigVersion = {
      version: newConfig.version,
      description: `Configuration updated`,
      timestamp: new Date().toISOString(),
      author: 'system',
      changes: this.detectChanges(oldConfig, newConfig)
    }

    history.unshift(version)
    
    // Keep only last 10 versions
    if (history.length > 10) {
      history.splice(10)
    }

    this.configHistory.set(screenId, history)
  }

  /**
   * Detect changes between configurations
   */
  private detectChanges(oldConfig: ScreenConfig, newConfig: ScreenConfig): any[] {
    const changes: any[] = []
    
    // Simple change detection - in a real implementation, this would be more sophisticated
    if (oldConfig.name !== newConfig.name) {
      changes.push({
        type: 'modified',
        path: 'name',
        description: 'Configuration name changed',
        oldValue: oldConfig.name,
        newValue: newConfig.name
      })
    }

    if (oldConfig.theme !== newConfig.theme) {
      changes.push({
        type: 'modified',
        path: 'theme',
        description: 'Theme changed',
        oldValue: oldConfig.theme,
        newValue: newConfig.theme
      })
    }

    return changes
  }

  /**
   * Deep merge objects
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target }
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }
    
    return result
  }

  /**
   * Apply merge filters
   */
  private applyMergeFilters(config: ScreenConfig, options: ConfigMergeOptions): ScreenConfig {
    if (options.include) {
      const filtered: any = {}
      options.include.forEach(key => {
        if (key in config) {
          filtered[key] = config[key as keyof ScreenConfig]
        }
      })
      return filtered as ScreenConfig
    }

    if (options.exclude) {
      const filtered = { ...config }
      options.exclude.forEach(key => {
        delete filtered[key as keyof ScreenConfig]
      })
      return filtered
    }

    return config
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  /**
   * Load configurations from storage
   */
  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('signage_configs')
      if (saved) {
        const configs = JSON.parse(saved) as ScreenConfig[]
        configs.forEach(config => {
          this.configs.set(config.screenId, config)
        })
      }
    } catch (error) {
      console.error('Failed to load configurations from storage:', error)
    }
  }

  /**
   * Persist configurations to storage
   */
  private persistToStorage(): void {
    try {
      const configs = Array.from(this.configs.values())
      localStorage.setItem('signage_configs', JSON.stringify(configs))
    } catch (error) {
      console.error('Failed to persist configurations to storage:', error)
    }
  }

  /**
   * Persist templates to storage
   */
  private persistTemplatesToStorage(): void {
    try {
      const templates = Array.from(this.templates.values())
      localStorage.setItem('signage_templates', JSON.stringify(templates))
    } catch (error) {
      console.error('Failed to persist templates to storage:', error)
    }
  }
}
