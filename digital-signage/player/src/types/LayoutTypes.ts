/**
 * Layout Engine Types
 * This file defines the types and interfaces for the dynamic layout engine
 * that supports drag-and-drop component arrangement and configuration.
 */

import type { ComponentCategory } from './ComponentInterfaces'

// ============================================================================
// LAYOUT ENGINE TYPES
// ============================================================================

/**
 * Grid position and size for a component
 */
export interface GridPosition {
  /** Grid column start (1-based) */
  x: number
  /** Grid row start (1-based) */
  y: number
  /** Number of columns to span */
  w: number
  /** Number of rows to span */
  h: number
  /** Minimum width in grid units */
  minW?: number
  /** Minimum height in grid units */
  minH?: number
  /** Maximum width in grid units */
  maxW?: number
  /** Maximum height in grid units */
  maxH?: number
  /** Whether the component can be resized */
  static?: boolean
}

/**
 * Component configuration within a layout
 */
export interface LayoutComponent {
  /** Unique identifier for this component instance */
  id: string
  /** Component type/category */
  type: ComponentCategory
  /** Grid position and size */
  position: GridPosition
  /** Component-specific configuration */
  config: Record<string, any>
  /** Whether the component is visible */
  visible?: boolean
  /** Z-index for layering */
  zIndex?: number
}

/**
 * Layout configuration
 */
export interface LayoutConfig {
  /** Unique layout identifier */
  id: string
  /** Layout name */
  name: string
  /** Layout description */
  description?: string
  /** Grid configuration */
  grid: {
    /** Number of columns in the grid */
    cols: number
    /** Number of rows in the grid */
    rows: number
    /** Gap between grid items in pixels */
    gap?: number
    /** Whether to show grid lines */
    showGrid?: boolean
  }
  /** Components in this layout */
  components: LayoutComponent[]
  /** Layout metadata */
  metadata?: {
    /** Creation timestamp */
    createdAt?: string
    /** Last modified timestamp */
    updatedAt?: string
    /** Layout version */
    version?: string
    /** Tags for categorization */
    tags?: string[]
  }
}

/**
 * Layout template for predefined layouts
 */
export interface LayoutTemplate {
  /** Template identifier */
  id: string
  /** Template name */
  name: string
  /** Template description */
  description: string
  /** Template category */
  category: 'default' | 'custom' | 'preset'
  /** Preview image URL */
  previewImage?: string
  /** Layout configuration */
  config: LayoutConfig
  /** Whether this template is built-in */
  builtIn?: boolean
}

/**
 * Drag and drop operation data
 */
export interface DragOperation {
  /** Component being dragged */
  componentId: string
  /** Source position */
  sourcePosition: GridPosition
  /** Target position */
  targetPosition: GridPosition
  /** Whether this is a resize operation */
  isResize?: boolean
  /** Resize handle used */
  resizeHandle?: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'
}

/**
 * Layout engine state
 */
export interface LayoutEngineState {
  /** Current layout configuration */
  currentLayout: LayoutConfig
  /** Available components */
  availableComponents: ComponentDefinition[]
  /** Whether drag mode is active */
  isDragMode: boolean
  /** Currently selected component */
  selectedComponent?: string
  /** Whether layout is being edited */
  isEditing: boolean
  /** Layout validation errors */
  errors: LayoutError[]
}

/**
 * Component definition for the component library
 */
export interface ComponentDefinition {
  /** Component type */
  type: ComponentCategory
  /** Component name */
  name: string
  /** Component description */
  description: string
  /** Default configuration */
  defaultConfig: Record<string, any>
  /** Default grid position */
  defaultPosition: GridPosition
  /** Component icon */
  icon?: string
  /** Whether component is available */
  available: boolean
  /** Component dependencies */
  dependencies?: string[]
}

/**
 * Layout validation error
 */
export interface LayoutError {
  /** Error type */
  type: 'collision' | 'overflow' | 'invalid' | 'missing'
  /** Error message */
  message: string
  /** Component ID if applicable */
  componentId?: string
  /** Error severity */
  severity: 'error' | 'warning' | 'info'
}

/**
 * Layout engine configuration
 */
export interface LayoutEngineConfig {
  /** Maximum number of components per layout */
  maxComponents?: number
  /** Grid constraints */
  gridConstraints: {
    /** Minimum number of columns */
    minCols: number
    /** Maximum number of columns */
    maxCols: number
    /** Minimum number of rows */
    minRows: number
    /** Maximum number of rows */
    maxRows: number
  }
  /** Drag and drop settings */
  dragDrop: {
    /** Whether drag and drop is enabled */
    enabled: boolean
    /** Drag handle selector */
    dragHandle?: string
    /** Whether components can be resized */
    resizable: boolean
    /** Whether components can be moved */
    movable: boolean
  }
  /** Validation settings */
  validation: {
    /** Whether to validate on every change */
    validateOnChange: boolean
    /** Whether to show validation errors */
    showErrors: boolean
    /** Whether to prevent invalid operations */
    preventInvalid: boolean
  }
}

// ============================================================================
// LAYOUT ENGINE EVENTS
// ============================================================================

/**
 * Layout engine event types
 */
export type LayoutEngineEventType = 
  | 'layout-changed'
  | 'component-added'
  | 'component-removed'
  | 'component-moved'
  | 'component-resized'
  | 'component-selected'
  | 'layout-saved'
  | 'layout-loaded'
  | 'validation-error'

/**
 * Layout engine event data
 */
export interface LayoutEngineEvent {
  /** Event type */
  type: LayoutEngineEventType
  /** Event timestamp */
  timestamp: string
  /** Event data */
  data: any
  /** Source component ID if applicable */
  sourceId?: string
}

/**
 * Layout engine event handler
 */
export type LayoutEngineEventHandler = (event: LayoutEngineEvent) => void

// ============================================================================
// LAYOUT ENGINE API
// ============================================================================

/**
 * Layout engine API interface
 */
export interface LayoutEngineAPI {
  /** Get current layout */
  getCurrentLayout(): LayoutConfig
  
  /** Set current layout */
  setCurrentLayout(layout: LayoutConfig): void
  
  /** Add component to layout */
  addComponent(component: LayoutComponent): void
  
  /** Remove component from layout */
  removeComponent(componentId: string): void
  
  /** Update component configuration */
  updateComponent(componentId: string, updates: Partial<LayoutComponent>): void
  
  /** Move component to new position */
  moveComponent(componentId: string, position: GridPosition): void
  
  /** Resize component */
  resizeComponent(componentId: string, position: GridPosition): void
  
  /** Select component */
  selectComponent(componentId: string): void
  
  /** Deselect all components */
  deselectAll(): void
  
  /** Validate current layout */
  validateLayout(): LayoutError[]
  
  /** Save layout */
  saveLayout(name?: string): void
  
  /** Load layout */
  loadLayout(layoutId: string): void
  
  /** Get available components */
  getAvailableComponents(): ComponentDefinition[]
  
  /** Register event handler */
  on(event: LayoutEngineEventType, handler: LayoutEngineEventHandler): void
  
  /** Unregister event handler */
  off(event: LayoutEngineEventType, handler: LayoutEngineEventHandler): void
  
  /** Enable/disable drag mode */
  setDragMode(enabled: boolean): void
  
  /** Get layout templates */
  getTemplates(): LayoutTemplate[]
  
  /** Create layout from template */
  createFromTemplate(templateId: string): void
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Grid breakpoint configuration
 */
export interface GridBreakpoint {
  /** Breakpoint name */
  name: string
  /** Minimum width in pixels */
  minWidth: number
  /** Grid configuration for this breakpoint */
  grid: {
    cols: number
    rows: number
    gap?: number
  }
}

/**
 * Responsive layout configuration
 */
export interface ResponsiveLayoutConfig extends LayoutConfig {
  /** Breakpoint configurations */
  breakpoints: GridBreakpoint[]
}

/**
 * Layout export/import format
 */
export interface LayoutExport {
  /** Export version */
  version: string
  /** Export timestamp */
  timestamp: string
  /** Layout configuration */
  layout: LayoutConfig
  /** Metadata */
  metadata: {
    exportedBy: string
    exportReason?: string
  }
}
