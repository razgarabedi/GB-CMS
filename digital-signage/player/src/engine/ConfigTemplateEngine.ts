/**
 * Configuration Template Engine
 * Manages configuration templates, presets, and template-based configuration creation
 */

import type {
  ConfigTemplate,
  ConfigVariable,
  ScreenConfig,
  ConfigValidationResult
} from '../types/ConfigTypes'
import { ConfigurationValidator } from './ConfigValidator'

export class ConfigTemplateEngine {
  private templates: Map<string, ConfigTemplate> = new Map()
  private validator: ConfigurationValidator

  constructor() {
    this.validator = new ConfigurationValidator()
    this.initializeDefaultTemplates()
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): ConfigTemplate | null {
    return this.templates.get(templateId) || null
  }

  /**
   * Get all templates
   */
  getAllTemplates(): ConfigTemplate[] {
    return Array.from(this.templates.values())
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: string): ConfigTemplate[] {
    return this.getAllTemplates().filter(template => template.category === category)
  }

  /**
   * Create configuration from template
   */
  createFromTemplate(
    templateId: string,
    variables: Record<string, any>,
    options: {
      validate?: boolean
      mergeWithDefaults?: boolean
    } = {}
  ): ScreenConfig {
    const template = this.getTemplate(templateId)
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }

    // Validate variables
    const validationResult = this.validateTemplateVariables(template, variables)
    if (!validationResult.valid) {
      throw new Error(`Template variable validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`)
    }

    // Create base configuration
    let config = this.applyTemplateVariables(template.config, variables)

    // Merge with defaults if requested
    if (options.mergeWithDefaults) {
      config = this.mergeWithDefaults(config)
    }

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
      metadata: {
        ...config.metadata,
        templateId: template.id,
        templateName: template.name,
        templateVersion: template.version,
        createdFromTemplate: true,
        templateVariables: variables
      }
    }

    // Validate configuration if requested
    if (options.validate) {
      const configValidation = this.validator.validate(screenConfig)
      if (!configValidation.valid) {
        throw new Error(`Generated configuration is invalid: ${configValidation.errors.map(e => e.message).join(', ')}`)
      }
    }

    return screenConfig
  }

  /**
   * Save template
   */
  saveTemplate(template: ConfigTemplate): void {
    this.templates.set(template.id, template)
    this.persistTemplatesToStorage()
  }

  /**
   * Delete template
   */
  deleteTemplate(templateId: string): boolean {
    const deleted = this.templates.delete(templateId)
    if (deleted) {
      this.persistTemplatesToStorage()
    }
    return deleted
  }

  /**
   * Update template
   */
  updateTemplate(templateId: string, updates: Partial<ConfigTemplate>): ConfigTemplate | null {
    const template = this.getTemplate(templateId)
    if (!template) {
      return null
    }

    const updatedTemplate = {
      ...template,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    this.templates.set(templateId, updatedTemplate)
    this.persistTemplatesToStorage()
    return updatedTemplate
  }

  /**
   * Validate template variables
   */
  validateTemplateVariables(template: ConfigTemplate, variables: Record<string, any>): ConfigValidationResult {
    const errors: any[] = []
    const warnings: any[] = []
    const info: any[] = []

    // Check required variables
    template.variables.forEach(variable => {
      if (variable.validation?.required && !(variable.name in variables)) {
        errors.push({
          path: `variables.${variable.name}`,
          message: `Required variable '${variable.name}' is missing`,
          code: 'REQUIRED_VARIABLE',
          severity: 'error'
        })
      }
    })

    // Validate variable values
    Object.entries(variables).forEach(([name, value]) => {
      const variable = template.variables.find(v => v.name === name)
      if (variable) {
        this.validateVariableValue(variable, value, errors, warnings, info)
      } else {
        warnings.push({
          path: `variables.${name}`,
          message: `Unknown variable '${name}'`,
          code: 'UNKNOWN_VARIABLE',
          severity: 'warning'
        })
      }
    })

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info
    }
  }

  /**
   * Apply template variables to configuration
   */
  private applyTemplateVariables(config: any, variables: Record<string, any>): any {
    let configStr = JSON.stringify(config)

    // Replace variable placeholders
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      const replacement = typeof value === 'string' ? value : JSON.stringify(value)
      configStr = configStr.replace(new RegExp(placeholder, 'g'), replacement)
    })

    // Replace default placeholders
    this.templates.forEach(template => {
      template.variables.forEach(variable => {
        if (!(variable.name in variables)) {
          const placeholder = `{{${variable.name}}}`
          const defaultValue = typeof variable.defaultValue === 'string' 
            ? variable.defaultValue 
            : JSON.stringify(variable.defaultValue)
          configStr = configStr.replace(new RegExp(placeholder, 'g'), defaultValue)
        }
      })
    })

    return JSON.parse(configStr)
  }

  /**
   * Validate variable value
   */
  private validateVariableValue(
    variable: ConfigVariable,
    value: any,
    errors: any[],
    warnings: any[],
    info: any[]
  ): void {
    const { validation } = variable

    if (!validation) return

    // Type validation
    if (variable.type === 'string' && typeof value !== 'string') {
      errors.push({
        path: `variables.${variable.name}`,
        message: `Variable '${variable.name}' must be a string`,
        code: 'INVALID_TYPE',
        severity: 'error'
      })
    } else if (variable.type === 'number' && typeof value !== 'number') {
      errors.push({
        path: `variables.${variable.name}`,
        message: `Variable '${variable.name}' must be a number`,
        code: 'INVALID_TYPE',
        severity: 'error'
      })
    } else if (variable.type === 'boolean' && typeof value !== 'boolean') {
      errors.push({
        path: `variables.${variable.name}`,
        message: `Variable '${variable.name}' must be a boolean`,
        code: 'INVALID_TYPE',
        severity: 'error'
      })
    }

    // Range validation for numbers
    if (variable.type === 'number' && typeof value === 'number') {
      if (validation.min !== undefined && value < validation.min) {
        errors.push({
          path: `variables.${variable.name}`,
          message: `Variable '${variable.name}' must be >= ${validation.min}`,
          code: 'VALUE_TOO_SMALL',
          severity: 'error'
        })
      }
      if (validation.max !== undefined && value > validation.max) {
        errors.push({
          path: `variables.${variable.name}`,
          message: `Variable '${variable.name}' must be <= ${validation.max}`,
          code: 'VALUE_TOO_LARGE',
          severity: 'error'
        })
      }
    }

    // Pattern validation for strings
    if (variable.type === 'string' && typeof value === 'string' && validation.pattern) {
      const regex = new RegExp(validation.pattern)
      if (!regex.test(value)) {
        errors.push({
          path: `variables.${variable.name}`,
          message: `Variable '${variable.name}' does not match required pattern`,
          code: 'PATTERN_MISMATCH',
          severity: 'error'
        })
      }
    }

    // Select validation
    if (variable.type === 'select' && variable.options) {
      const validValues = variable.options.map(opt => opt.value)
      if (!validValues.includes(value)) {
        errors.push({
          path: `variables.${variable.name}`,
          message: `Variable '${variable.name}' must be one of: ${validValues.join(', ')}`,
          code: 'INVALID_SELECT_VALUE',
          severity: 'error'
        })
      }
    }

    // Custom validation
    if (validation.custom) {
      const result = validation.custom(value)
      if (result !== true) {
        const message = typeof result === 'string' ? result : `Custom validation failed for '${variable.name}'`
        errors.push({
          path: `variables.${variable.name}`,
          message,
          code: 'CUSTOM_VALIDATION_FAILED',
          severity: 'error'
        })
      }
    }
  }

  /**
   * Merge configuration with defaults
   */
  private mergeWithDefaults(config: any): any {
    const defaults = this.getDefaultConfiguration()
    return this.deepMerge(defaults, config)
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
   * Get default configuration
   */
  private getDefaultConfiguration(): any {
    return {
      theme: 'dark',
      timezone: 'UTC',
      powerProfile: 'balanced',
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
      layout: this.getDefaultLayout()
    }
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
   * Initialize default templates
   */
  private initializeDefaultTemplates(): void {
    const defaultTemplates: ConfigTemplate[] = [
      {
        version: '1.0.0',
        id: 'default',
        name: 'Default Configuration',
        description: 'Standard digital signage configuration with weather, clock, and slideshow',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: 'default',
        config: {
          theme: 'dark',
          timezone: '{{timezone}}',
          layout: this.getDefaultLayout(),
          components: {
            weather: {
              location: '{{weatherLocation}}',
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
        description: 'Configuration optimized for news display with enhanced news widget',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: 'preset',
        config: {
          theme: 'dark',
          timezone: '{{timezone}}',
          layout: this.getDefaultLayout(),
          components: {
            news: {
              category: '{{newsCategory}}',
              limit: 8,
              rotationMs: 8000,
              compact: false,
              refreshIntervalMs: 300000
            },
            weather: {
              location: '{{weatherLocation}}',
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
        tags: ['news', 'preset']
      },
      {
        version: '1.0.0',
        id: 'pv-monitoring',
        name: 'PV Monitoring Configuration',
        description: 'Configuration for solar panel monitoring with PV flow widget',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: 'preset',
        config: {
          theme: 'dark',
          timezone: '{{timezone}}',
          layout: this.getDefaultLayout(),
          components: {
            pv: {
              token: '{{pvToken}}',
              mode: 'flow',
              refreshIntervalMs: 300000
            },
            weather: {
              location: '{{weatherLocation}}',
              showClock: false,
              showAnimatedBg: true,
              refreshIntervalMs: 600000
            },
            news: {
              category: 'wirtschaft',
              limit: 6,
              rotationMs: 10000,
              compact: true,
              refreshIntervalMs: 300000
            },
            slideshow: {
              images: [],
              intervalMs: 12000,
              animations: ['fade'],
              durationMs: 1000,
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
            defaultValue: 'pv_screen',
            validation: { required: true }
          },
          {
            name: 'pvToken',
            type: 'string',
            description: 'SolarWeb PV token',
            defaultValue: '',
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
        tags: ['pv', 'monitoring', 'preset']
      },
      {
        version: '1.0.0',
        id: 'web-focused',
        name: 'Web-Focused Configuration',
        description: 'Configuration optimized for web content display',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: 'preset',
        config: {
          theme: 'dark',
          timezone: '{{timezone}}',
          layout: this.getDefaultLayout(),
          components: {
            webViewer: {
              url: '{{webUrl}}',
              mode: '{{webMode}}',
              snapshotRefreshMs: 300000,
              autoScrollEnabled: true,
              autoScrollMs: 30000,
              autoScrollDistancePct: 25,
              autoScrollStartDelayMs: 0
            },
            weather: {
              location: '{{weatherLocation}}',
              showClock: true,
              showAnimatedBg: false,
              refreshIntervalMs: 600000
            }
          },
          global: this.getDefaultGlobalSettings(),
          schedule: this.getDefaultSchedule(),
          powerProfile: 'performance'
        },
        variables: [
          {
            name: 'screenId',
            type: 'string',
            description: 'Screen identifier',
            defaultValue: 'web_screen',
            validation: { required: true }
          },
          {
            name: 'webUrl',
            type: 'url',
            description: 'Web URL to display',
            defaultValue: 'https://example.com',
            validation: { required: true }
          },
          {
            name: 'webMode',
            type: 'select',
            description: 'Web display mode',
            defaultValue: 'iframe',
            options: [
              { value: 'iframe', label: 'Iframe' },
              { value: 'snapshot', label: 'Snapshot' }
            ],
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
        tags: ['web', 'preset']
      }
    ]

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template)
    })

    // Load custom templates from storage
    this.loadTemplatesFromStorage()
  }

  /**
   * Load templates from storage
   */
  private loadTemplatesFromStorage(): void {
    try {
      const saved = localStorage.getItem('signage_custom_templates')
      if (saved) {
        const templates = JSON.parse(saved) as ConfigTemplate[]
        templates.forEach(template => {
          this.templates.set(template.id, template)
        })
      }
    } catch (error) {
      console.error('Failed to load custom templates from storage:', error)
    }
  }

  /**
   * Persist templates to storage
   */
  private persistTemplatesToStorage(): void {
    try {
      const customTemplates = Array.from(this.templates.values())
        .filter(template => template.category === 'custom')
      localStorage.setItem('signage_custom_templates', JSON.stringify(customTemplates))
    } catch (error) {
      console.error('Failed to persist custom templates to storage:', error)
    }
  }
}
