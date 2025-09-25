/**
 * Layout Engine Implementation
 * Dynamic layout system with drag-and-drop functionality for digital signage components
 */

import type {
  LayoutConfig,
  LayoutComponent,
  GridPosition,
  LayoutEngineState,
  LayoutEngineConfig,
  LayoutEngineEvent,
  LayoutEngineEventType,
  LayoutEngineEventHandler,
  LayoutError,
  ComponentDefinition,
  LayoutTemplate
} from '../types/LayoutTypes'

export class LayoutEngine {
  private state: LayoutEngineState
  private config: LayoutEngineConfig
  private eventHandlers: Map<LayoutEngineEventType, LayoutEngineEventHandler[]> = new Map()
  private templates: LayoutTemplate[] = []
  private availableComponents: ComponentDefinition[] = []

  constructor(config: LayoutEngineConfig) {
    this.config = config
    this.state = {
      currentLayout: this.createEmptyLayout(),
      availableComponents: [],
      isDragMode: false,
      isEditing: false,
      errors: []
    }
    
    this.initializeDefaultComponents()
    this.initializeDefaultTemplates()
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  /**
   * Get current layout configuration
   */
  getCurrentLayout(): LayoutConfig {
    return { ...this.state.currentLayout }
  }

  /**
   * Set current layout configuration
   */
  setCurrentLayout(layout: LayoutConfig): void {
    this.state.currentLayout = { ...layout }
    if (this.config.validation.validateOnChange) {
      this.validateLayout()
    }
    this.emit('layout-loaded', { layout })
  }

  /**
   * Add component to layout
   */
  addComponent(component: LayoutComponent): void {
    // Check max components limit
    if (this.config.maxComponents && this.state.currentLayout.components.length >= this.config.maxComponents) {
      this.addError({
        type: 'invalid',
        message: `Maximum number of components (${this.config.maxComponents}) reached`,
        severity: 'error'
      })
      return
    }

    // Validate component position
    if (!this.isValidPosition(component.position)) {
      this.addError({
        type: 'invalid',
        message: `Invalid position for component ${component.id}`,
        componentId: component.id,
        severity: 'error'
      })
      return
    }

    // Check for collisions
    if (this.hasCollision(component.id, component.position)) {
      this.addError({
        type: 'collision',
        message: `Component ${component.id} collides with existing components`,
        componentId: component.id,
        severity: 'error'
      })
      return
    }

    this.state.currentLayout.components.push({ ...component })
    this.emit('component-added', { component })
    this.emit('layout-changed', { layout: this.state.currentLayout })
  }

  /**
   * Remove component from layout
   */
  removeComponent(componentId: string): void {
    const index = this.state.currentLayout.components.findIndex(c => c.id === componentId)
    if (index !== -1) {
      const component = this.state.currentLayout.components[index]
      this.state.currentLayout.components.splice(index, 1)
      this.emit('component-removed', { component })
      this.emit('layout-changed', { layout: this.state.currentLayout })
    }
  }

  /**
   * Update component configuration
   */
  updateComponent(componentId: string, updates: Partial<LayoutComponent>): void {
    const component = this.state.currentLayout.components.find(c => c.id === componentId)
    if (component) {
      Object.assign(component, updates)
      this.emit('component-moved', { componentId, updates })
      this.emit('layout-changed', { layout: this.state.currentLayout })
    }
  }

  /**
   * Move component to new position
   */
  moveComponent(componentId: string, position: GridPosition): void {
    if (!this.config.dragDrop.movable) {
      this.addError({
        type: 'invalid',
        message: 'Component movement is disabled',
        componentId,
        severity: 'error'
      })
      return
    }

    const component = this.state.currentLayout.components.find(c => c.id === componentId)
    if (component) {
      // Validate new position
      if (!this.isValidPosition(position)) {
        this.addError({
          type: 'invalid',
          message: `Invalid position for component ${componentId}`,
          componentId,
          severity: 'error'
        })
        return
      }

      // Check for collisions (excluding self)
      if (this.hasCollision(componentId, position)) {
        this.addError({
          type: 'collision',
          message: `Cannot move component ${componentId} - position occupied`,
          componentId,
          severity: 'error'
        })
        return
      }

      component.position = { ...position }
      this.emit('component-moved', { componentId, position })
      this.emit('layout-changed', { layout: this.state.currentLayout })
    }
  }

  /**
   * Resize component
   */
  resizeComponent(componentId: string, position: GridPosition): void {
    if (!this.config.dragDrop.resizable) {
      this.addError({
        type: 'invalid',
        message: 'Component resizing is disabled',
        componentId,
        severity: 'error'
      })
      return
    }

    const component = this.state.currentLayout.components.find(c => c.id === componentId)
    if (component) {
      // Validate new size
      if (!this.isValidPosition(position)) {
        this.addError({
          type: 'invalid',
          message: `Invalid size for component ${componentId}`,
          componentId,
          severity: 'error'
        })
        return
      }

      // Check for collisions (excluding self)
      if (this.hasCollision(componentId, position)) {
        this.addError({
          type: 'collision',
          message: `Cannot resize component ${componentId} - would collide with other components`,
          componentId,
          severity: 'error'
        })
        return
      }

      component.position = { ...position }
      this.emit('component-resized', { componentId, position })
      this.emit('layout-changed', { layout: this.state.currentLayout })
    }
  }

  /**
   * Select component
   */
  selectComponent(componentId: string): void {
    this.state.selectedComponent = componentId
    this.emit('component-selected', { componentId })
  }

  /**
   * Deselect all components
   */
  deselectAll(): void {
    this.state.selectedComponent = undefined
    this.emit('component-selected', { componentId: undefined })
  }

  /**
   * Validate current layout
   */
  validateLayout(): LayoutError[] {
    const errors: LayoutError[] = []
    
    // Check for component collisions
    for (let i = 0; i < this.state.currentLayout.components.length; i++) {
      for (let j = i + 1; j < this.state.currentLayout.components.length; j++) {
        const comp1 = this.state.currentLayout.components[i]
        const comp2 = this.state.currentLayout.components[j]
        
        if (this.positionsOverlap(comp1.position, comp2.position)) {
          errors.push({
            type: 'collision',
            message: `Components ${comp1.id} and ${comp2.id} overlap`,
            componentId: comp1.id,
            severity: 'error'
          })
        }
      }
    }

    // Check for grid overflow
    for (const component of this.state.currentLayout.components) {
      if (component.position.x + component.position.w > this.state.currentLayout.grid.cols + 1) {
        errors.push({
          type: 'overflow',
          message: `Component ${component.id} extends beyond grid columns`,
          componentId: component.id,
          severity: 'error'
        })
      }
      
      if (component.position.y + component.position.h > this.state.currentLayout.grid.rows + 1) {
        errors.push({
          type: 'overflow',
          message: `Component ${component.id} extends beyond grid rows`,
          componentId: component.id,
          severity: 'error'
        })
      }
    }

    // Check grid constraints
    const { grid } = this.state.currentLayout
    const { gridConstraints } = this.config
    
    if (grid.cols < gridConstraints.minCols || grid.cols > gridConstraints.maxCols) {
      errors.push({
        type: 'invalid',
        message: `Grid columns (${grid.cols}) must be between ${gridConstraints.minCols} and ${gridConstraints.maxCols}`,
        severity: 'error'
      })
    }
    
    if (grid.rows < gridConstraints.minRows || grid.rows > gridConstraints.maxRows) {
      errors.push({
        type: 'invalid',
        message: `Grid rows (${grid.rows}) must be between ${gridConstraints.minRows} and ${gridConstraints.maxRows}`,
        severity: 'error'
      })
    }

    this.state.errors = errors
    if (errors.length > 0 && this.config.validation.showErrors) {
      this.emit('validation-error', { errors })
    }

    return errors
  }

  /**
   * Save layout
   */
  saveLayout(name?: string): void {
    const layout = this.getCurrentLayout()
    if (name) {
      layout.name = name
    }
    
    // In a real implementation, this would save to a backend
    localStorage.setItem(`layout_${layout.id}`, JSON.stringify(layout))
    this.emit('layout-saved', { layout })
  }

  /**
   * Load layout
   */
  loadLayout(layoutId: string): void {
    const saved = localStorage.getItem(`layout_${layoutId}`)
    if (saved) {
      try {
        const layout = JSON.parse(saved) as LayoutConfig
        this.setCurrentLayout(layout)
      } catch (error) {
        this.addError({
          type: 'invalid',
          message: `Failed to load layout ${layoutId}`,
          severity: 'error'
        })
      }
    }
  }

  /**
   * Get available components
   */
  getAvailableComponents(): ComponentDefinition[] {
    return [...this.availableComponents]
  }

  /**
   * Get current engine configuration
   */
  getConfig(): LayoutEngineConfig {
    return { ...this.config }
  }

  /**
   * Register event handler
   */
  on(event: LayoutEngineEventType, handler: LayoutEngineEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event)!.push(handler)
  }

  /**
   * Unregister event handler
   */
  off(event: LayoutEngineEventType, handler: LayoutEngineEventHandler): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index !== -1) {
        handlers.splice(index, 1)
      }
    }
  }

  /**
   * Enable/disable drag mode
   */
  setDragMode(enabled: boolean): void {
    if (this.config.dragDrop.enabled) {
      this.state.isDragMode = enabled
    }
  }

  /**
   * Get layout templates
   */
  getTemplates(): LayoutTemplate[] {
    return [...this.templates]
  }

  /**
   * Create layout from template
   */
  createFromTemplate(templateId: string): void {
    const template = this.templates.find(t => t.id === templateId)
    if (template) {
      this.setCurrentLayout({ ...template.config })
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Create empty layout
   */
  private createEmptyLayout(): LayoutConfig {
    return {
      id: `layout_${Date.now()}`,
      name: 'New Layout',
      description: 'A new layout',
      grid: {
        cols: 12,
        rows: 8,
        gap: 2,
        showGrid: false
      },
      components: [],
      metadata: {
        createdAt: new Date().toISOString(),
        version: '1.0.0'
      }
    }
  }

  /**
   * Check if position is valid
   */
  private isValidPosition(position: GridPosition): boolean {
    const { grid } = this.state.currentLayout
    const { gridConstraints } = this.config
    
    return (
      position.x >= 1 &&
      position.y >= 1 &&
      position.w > 0 &&
      position.h > 0 &&
      position.x + position.w <= grid.cols + 1 &&
      position.y + position.h <= grid.rows + 1 &&
      grid.cols >= gridConstraints.minCols &&
      grid.cols <= gridConstraints.maxCols &&
      grid.rows >= gridConstraints.minRows &&
      grid.rows <= gridConstraints.maxRows
    )
  }

  /**
   * Check if component has collision with others
   */
  private hasCollision(excludeId: string, position: GridPosition): boolean {
    return this.state.currentLayout.components.some(component => 
      component.id !== excludeId && 
      this.positionsOverlap(component.position, position)
    )
  }

  /**
   * Check if two positions overlap
   */
  private positionsOverlap(pos1: GridPosition, pos2: GridPosition): boolean {
    return !(
      pos1.x + pos1.w <= pos2.x ||
      pos2.x + pos2.w <= pos1.x ||
      pos1.y + pos1.h <= pos2.y ||
      pos2.y + pos2.h <= pos1.y
    )
  }

  /**
   * Add error to state
   */
  private addError(error: LayoutError): void {
    this.state.errors.push(error)
    this.emit('validation-error', { error })
  }

  /**
   * Emit event to handlers
   */
  private emit(event: LayoutEngineEventType, data: any): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      const eventData: LayoutEngineEvent = {
        type: event,
        timestamp: new Date().toISOString(),
        data,
        sourceId: data.componentId
      }
      
      handlers.forEach(handler => {
        try {
          handler(eventData)
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error)
        }
      })
    }
  }

  /**
   * Initialize default components
   */
  private initializeDefaultComponents(): void {
    this.availableComponents = [
      {
        type: 'weather',
        name: 'Weather Widget',
        description: 'Display current weather and forecast',
        defaultConfig: {
          location: 'London',
          theme: 'dark',
          showClock: false,
          showAnimatedBg: false
        },
        defaultPosition: { x: 1, y: 1, w: 3, h: 4 },
        available: true
      },
      {
        type: 'clock',
        name: 'Digital Clock',
        description: 'Display current time',
        defaultConfig: {
          timezone: 'UTC',
          type: 'minimal',
          size: 64,
          color: '#fff'
        },
        defaultPosition: { x: 1, y: 1, w: 2, h: 1 },
        available: true
      },
      {
        type: 'news',
        name: 'News Widget',
        description: 'Display news headlines',
        defaultConfig: {
          category: 'wirtschaft',
          limit: 6,
          theme: 'dark',
          rotationMs: 8000,
          compact: false
        },
        defaultPosition: { x: 1, y: 1, w: 4, h: 3 },
        available: true
      },
      {
        type: 'slideshow',
        name: 'Image Slideshow',
        description: 'Display rotating images',
        defaultConfig: {
          images: [],
          intervalMs: 8000,
          animations: ['fade'],
          durationMs: 900,
          preloadNext: true
        },
        defaultPosition: { x: 1, y: 1, w: 6, h: 4 },
        available: true
      },
      {
        type: 'web',
        name: 'Web Viewer',
        description: 'Display web content',
        defaultConfig: {
          url: '',
          mode: 'iframe',
          refreshIntervalMs: 300000
        },
        defaultPosition: { x: 1, y: 1, w: 8, h: 6 },
        available: true
      },
      {
        type: 'pv',
        name: 'PV Flow Widget',
        description: 'Display solar panel data flow',
        defaultConfig: {
          token: '',
          theme: 'dark'
        },
        defaultPosition: { x: 1, y: 1, w: 4, h: 4 },
        available: true
      }
    ]
  }

  /**
   * Initialize default templates
   */
  private initializeDefaultTemplates(): void {
    this.templates = [
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
          grid: { cols: 12, rows: 8, gap: 2 },
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
        description: 'Layout focused on news and weather',
        category: 'default',
        builtIn: true,
        config: {
          id: 'news',
          name: 'News Layout',
          description: 'Layout focused on news and weather',
          grid: { cols: 12, rows: 8, gap: 2 },
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
        description: 'Layout for solar panel monitoring',
        category: 'default',
        builtIn: true,
        config: {
          id: 'pv',
          name: 'PV Layout',
          description: 'Layout for solar panel monitoring',
          grid: { cols: 12, rows: 8, gap: 2 },
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
  }
}
