/**
 * Layout Manager
 * Manages layout configurations, templates, and persistence
 */

import type { LayoutConfig, LayoutTemplate, LayoutExport } from '../types/LayoutTypes'

export class LayoutManager {
  private layouts: Map<string, LayoutConfig> = new Map()
  private templates: Map<string, LayoutTemplate> = new Map()
  private currentLayoutId: string | null = null

  constructor() {
    this.loadFromStorage()
    this.initializeDefaultTemplates()
  }

  // ============================================================================
  // LAYOUT MANAGEMENT
  // ============================================================================

  /**
   * Get all available layouts
   */
  getAllLayouts(): LayoutConfig[] {
    return Array.from(this.layouts.values())
  }

  /**
   * Get layout by ID
   */
  getLayout(layoutId: string): LayoutConfig | null {
    return this.layouts.get(layoutId) || null
  }

  /**
   * Save layout
   */
  saveLayout(layout: LayoutConfig): void {
    this.layouts.set(layout.id, { ...layout })
    this.persistToStorage()
  }

  /**
   * Delete layout
   */
  deleteLayout(layoutId: string): boolean {
    const deleted = this.layouts.delete(layoutId)
    if (deleted) {
      this.persistToStorage()
    }
    return deleted
  }

  /**
   * Duplicate layout
   */
  duplicateLayout(layoutId: string, newName?: string): LayoutConfig | null {
    const original = this.getLayout(layoutId)
    if (!original) return null

    const duplicated: LayoutConfig = {
      ...original,
      id: `layout_${Date.now()}`,
      name: newName || `${original.name} (Copy)`,
      metadata: {
        ...original.metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }

    this.saveLayout(duplicated)
    return duplicated
  }

  /**
   * Set current layout
   */
  setCurrentLayout(layoutId: string): boolean {
    if (this.layouts.has(layoutId)) {
      this.currentLayoutId = layoutId
      return true
    }
    return false
  }

  /**
   * Get current layout
   */
  getCurrentLayout(): LayoutConfig | null {
    if (this.currentLayoutId) {
      return this.getLayout(this.currentLayoutId)
    }
    return null
  }

  // ============================================================================
  // TEMPLATE MANAGEMENT
  // ============================================================================

  /**
   * Get all templates
   */
  getAllTemplates(): LayoutTemplate[] {
    return Array.from(this.templates.values())
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): LayoutTemplate | null {
    return this.templates.get(templateId) || null
  }

  /**
   * Create layout from template
   */
  createFromTemplate(templateId: string, customName?: string): LayoutConfig | null {
    const template = this.getTemplate(templateId)
    if (!template) return null

    const layout: LayoutConfig = {
      ...template.config,
      id: `layout_${Date.now()}`,
      name: customName || `${template.name} Layout`,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0'
      }
    }

    this.saveLayout(layout)
    return layout
  }

  /**
   * Save layout as template
   */
  saveAsTemplate(layoutId: string, templateName: string, description?: string): LayoutTemplate | null {
    const layout = this.getLayout(layoutId)
    if (!layout) return null

    const template: LayoutTemplate = {
      id: `template_${Date.now()}`,
      name: templateName,
      description: description || `Template based on ${layout.name}`,
      category: 'custom',
      config: { ...layout },
      builtIn: false
    }

    this.templates.set(template.id, template)
    this.persistTemplatesToStorage()
    return template
  }

  // ============================================================================
  // EXPORT/IMPORT
  // ============================================================================

  /**
   * Export layout
   */
  exportLayout(layoutId: string, reason?: string): LayoutExport | null {
    const layout = this.getLayout(layoutId)
    if (!layout) return null

    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      layout: { ...layout },
      metadata: {
        exportedBy: 'LayoutManager',
        exportReason: reason
      }
    }
  }

  /**
   * Import layout
   */
  importLayout(exportData: LayoutExport, customName?: string): LayoutConfig | null {
    try {
      const layout: LayoutConfig = {
        ...exportData.layout,
        id: `layout_${Date.now()}`,
        name: customName || exportData.layout.name,
        metadata: {
          ...exportData.layout.metadata,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }

      this.saveLayout(layout)
      return layout
    } catch (error) {
      console.error('Failed to import layout:', error)
      return null
    }
  }

  /**
   * Export all layouts
   */
  exportAllLayouts(): LayoutExport[] {
    return this.getAllLayouts().map(layout => this.exportLayout(layout.id, 'Bulk export')).filter(Boolean) as LayoutExport[]
  }

  // ============================================================================
  // VALIDATION
  // ============================================================================

  /**
   * Validate layout configuration
   */
  validateLayout(layout: LayoutConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check required fields
    if (!layout.id) errors.push('Layout ID is required')
    if (!layout.name) errors.push('Layout name is required')
    if (!layout.grid) errors.push('Grid configuration is required')
    if (!layout.components) errors.push('Components array is required')

    // Validate grid configuration
    if (layout.grid) {
      if (layout.grid.cols < 1 || layout.grid.cols > 24) {
        errors.push('Grid columns must be between 1 and 24')
      }
      if (layout.grid.rows < 1 || layout.grid.rows > 24) {
        errors.push('Grid rows must be between 1 and 24')
      }
    }

    // Validate components
    if (layout.components) {
      const componentIds = new Set<string>()
      
      for (const component of layout.components) {
        // Check for duplicate IDs
        if (componentIds.has(component.id)) {
          errors.push(`Duplicate component ID: ${component.id}`)
        }
        componentIds.add(component.id)

        // Validate component position
        if (component.position) {
          const { x, y, w, h } = component.position
          if (x < 1 || y < 1 || w < 1 || h < 1) {
            errors.push(`Invalid position for component ${component.id}`)
          }
          if (x + w > (layout.grid?.cols || 12) + 1) {
            errors.push(`Component ${component.id} extends beyond grid columns`)
          }
          if (y + h > (layout.grid?.rows || 8) + 1) {
            errors.push(`Component ${component.id} extends beyond grid rows`)
          }
        }
      }

      // Check for component collisions
      for (let i = 0; i < layout.components.length; i++) {
        for (let j = i + 1; j < layout.components.length; j++) {
          const comp1 = layout.components[i]
          const comp2 = layout.components[j]
          
          if (this.positionsOverlap(comp1.position, comp2.position)) {
            errors.push(`Components ${comp1.id} and ${comp2.id} overlap`)
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Check if two positions overlap
   */
  private positionsOverlap(pos1: any, pos2: any): boolean {
    if (!pos1 || !pos2) return false
    
    return !(
      pos1.x + pos1.w <= pos2.x ||
      pos2.x + pos2.w <= pos1.x ||
      pos1.y + pos1.h <= pos2.y ||
      pos2.y + pos2.h <= pos1.y
    )
  }

  /**
   * Load layouts from localStorage
   */
  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('signage_layouts')
      if (saved) {
        const layouts = JSON.parse(saved) as LayoutConfig[]
        layouts.forEach(layout => {
          this.layouts.set(layout.id, layout)
        })
      }
    } catch (error) {
      console.error('Failed to load layouts from storage:', error)
    }
  }

  /**
   * Persist layouts to localStorage
   */
  private persistToStorage(): void {
    try {
      const layouts = Array.from(this.layouts.values())
      localStorage.setItem('signage_layouts', JSON.stringify(layouts))
    } catch (error) {
      console.error('Failed to persist layouts to storage:', error)
    }
  }

  /**
   * Load templates from localStorage
   */
  private loadTemplatesFromStorage(): void {
    try {
      const saved = localStorage.getItem('signage_templates')
      if (saved) {
        const templates = JSON.parse(saved) as LayoutTemplate[]
        templates.forEach(template => {
          this.templates.set(template.id, template)
        })
      }
    } catch (error) {
      console.error('Failed to load templates from storage:', error)
    }
  }

  /**
   * Persist templates to localStorage
   */
  private persistTemplatesToStorage(): void {
    try {
      const templates = Array.from(this.templates.values())
      localStorage.setItem('signage_templates', JSON.stringify(templates))
    } catch (error) {
      console.error('Failed to persist templates to storage:', error)
    }
  }

  /**
   * Initialize default templates
   */
  private initializeDefaultTemplates(): void {
    const defaultTemplates: LayoutTemplate[] = [
      {
        id: 'default',
        name: 'Default Layout',
        description: 'Standard layout with weather, web viewer, and slideshow',
        category: 'default',
        builtIn: true,
        config: {
          id: 'default',
          name: 'Default Layout',
          description: 'Standard layout with weather, web viewer, and slideshow',
          grid: { cols: 12, rows: 8, gap: 2, showGrid: false },
          components: [
            {
              id: 'weather-1',
              type: 'weather',
              position: { x: 1, y: 1, w: 3, h: 4 },
              config: { location: 'London', theme: 'dark' }
            },
            {
              id: 'webviewer-1',
              type: 'web',
              position: { x: 4, y: 1, w: 8, h: 4 },
              config: { url: '', mode: 'iframe' }
            },
            {
              id: 'slideshow-1',
              type: 'slideshow',
              position: { x: 1, y: 5, w: 12, h: 3 },
              config: { images: [], intervalMs: 8000 }
            }
          ]
        }
      },
      {
        id: 'news',
        name: 'News Layout',
        description: 'Layout focused on news and weather information',
        category: 'default',
        builtIn: true,
        config: {
          id: 'news',
          name: 'News Layout',
          description: 'Layout focused on news and weather information',
          grid: { cols: 12, rows: 8, gap: 2, showGrid: false },
          components: [
            {
              id: 'news-1',
              type: 'news',
              position: { x: 1, y: 1, w: 3, h: 4 },
              config: { category: 'wirtschaft', limit: 8 }
            },
            {
              id: 'weather-1',
              type: 'weather',
              position: { x: 1, y: 5, w: 3, h: 3 },
              config: { location: 'London', theme: 'dark', showClock: true }
            },
            {
              id: 'slideshow-1',
              type: 'slideshow',
              position: { x: 4, y: 1, w: 8, h: 7 },
              config: { images: [], intervalMs: 8000 }
            }
          ]
        }
      },
      {
        id: 'pv',
        name: 'PV Layout',
        description: 'Layout for solar panel monitoring and energy data',
        category: 'default',
        builtIn: true,
        config: {
          id: 'pv',
          name: 'PV Layout',
          description: 'Layout for solar panel monitoring and energy data',
          grid: { cols: 12, rows: 8, gap: 2, showGrid: false },
          components: [
            {
              id: 'news-1',
              type: 'news',
              position: { x: 1, y: 1, w: 3, h: 2 },
              config: { category: 'wirtschaft', limit: 6, compact: true }
            },
            {
              id: 'pv-1',
              type: 'pv',
              position: { x: 1, y: 3, w: 3, h: 3 },
              config: { token: '', theme: 'dark' }
            },
            {
              id: 'weather-1',
              type: 'weather',
              position: { x: 1, y: 6, w: 3, h: 2 },
              config: { location: 'London', theme: 'dark' }
            },
            {
              id: 'slideshow-1',
              type: 'slideshow',
              position: { x: 4, y: 1, w: 8, h: 7 },
              config: { images: [], intervalMs: 8000 }
            }
          ]
        }
      }
    ]

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template)
    })

    // Load custom templates from storage
    this.loadTemplatesFromStorage()
  }
}
