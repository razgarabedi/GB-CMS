/**
 * Layout Editor Component
 * Complete layout editing interface with drag-and-drop functionality
 */

import React, { useState, useCallback, useEffect } from 'react'
import LayoutCanvas from './LayoutCanvas'
import ComponentLibrary from './ComponentLibrary'
import type { LayoutConfig, LayoutComponent, GridPosition, ComponentDefinition } from '../types/LayoutTypes'

interface LayoutEditorProps {
  /** Initial layout configuration */
  initialLayout?: LayoutConfig
  /** Available components */
  availableComponents?: ComponentDefinition[]
  /** Callback when layout changes */
  onLayoutChange?: (layout: LayoutConfig) => void
  /** Callback when layout is saved */
  onLayoutSave?: (layout: LayoutConfig) => void
  /** Theme */
  theme?: 'dark' | 'light'
  /** Whether the editor is visible */
  visible?: boolean
}

export default function LayoutEditor({
  initialLayout,
  availableComponents = [],
  onLayoutChange,
  onLayoutSave,
  theme = 'dark',
  visible = true
}: LayoutEditorProps) {
  const [currentLayout, setCurrentLayout] = useState<LayoutConfig>(
    initialLayout || {
      id: `layout_${Date.now()}`,
      name: 'New Layout',
      description: 'A new layout',
      grid: { cols: 12, rows: 8, gap: 2, showGrid: true },
      components: [],
      metadata: { createdAt: new Date().toISOString(), version: '1.0.0' }
    }
  )
  
  const [isEditing, setIsEditing] = useState(false)
  const [isDragMode, setIsDragMode] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [selectedLibraryComponent, setSelectedLibraryComponent] = useState<ComponentDefinition | null>(null)
  const [showGrid, setShowGrid] = useState(true)
  const [errors, _setErrors] = useState<string[]>([])

  // Update layout when initial layout changes
  useEffect(() => {
    if (initialLayout) {
      setCurrentLayout(initialLayout)
    }
  }, [initialLayout])

  // Handle layout changes
  const handleLayoutChange = useCallback((newLayout: LayoutConfig) => {
    setCurrentLayout(newLayout)
    onLayoutChange?.(newLayout)
  }, [onLayoutChange])

  // Handle component selection from library
  const handleLibraryComponentSelect = useCallback((component: ComponentDefinition) => {
    setSelectedLibraryComponent(component)
    
    // If in drag mode, we could start a drag operation here
    // For now, we'll just select the component
  }, [])

  // Handle adding component to layout
  const handleAddComponent = useCallback((component: ComponentDefinition, position?: GridPosition) => {
    const newComponent: LayoutComponent = {
      id: `${component.type}_${Date.now()}`,
      type: component.type,
      position: position || component.defaultPosition,
      config: { ...component.defaultConfig },
      visible: true
    }

    const newLayout = {
      ...currentLayout,
      components: [...currentLayout.components, newComponent]
    }

    handleLayoutChange(newLayout)
  }, [currentLayout, handleLayoutChange])

  // Handle component move
  const handleComponentMove = useCallback((componentId: string, position: GridPosition) => {
    const newLayout = {
      ...currentLayout,
      components: currentLayout.components.map(comp =>
        comp.id === componentId ? { ...comp, position } : comp
      )
    }

    handleLayoutChange(newLayout)
  }, [currentLayout, handleLayoutChange])

  // Handle component resize
  const handleComponentResize = useCallback((componentId: string, position: GridPosition) => {
    const newLayout = {
      ...currentLayout,
      components: currentLayout.components.map(comp =>
        comp.id === componentId ? { ...comp, position } : comp
      )
    }

    handleLayoutChange(newLayout)
  }, [currentLayout, handleLayoutChange])

  // Handle component selection
  const handleComponentSelect = useCallback((componentId: string | null) => {
    setSelectedComponent(componentId)
  }, [])

  // Handle canvas click (add component at position)
  const _handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (selectedLibraryComponent && isEditing) {
      // Calculate grid position from click coordinates
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      // Convert to grid coordinates (simplified)
      const cellWidth = rect.width / currentLayout.grid.cols
      const cellHeight = rect.height / currentLayout.grid.rows
      const gridX = Math.floor(x / cellWidth) + 1
      const gridY = Math.floor(y / cellHeight) + 1
      
      const position: GridPosition = {
        x: Math.max(1, Math.min(currentLayout.grid.cols, gridX)),
        y: Math.max(1, Math.min(currentLayout.grid.rows, gridY)),
        w: selectedLibraryComponent.defaultPosition.w,
        h: selectedLibraryComponent.defaultPosition.h
      }

      handleAddComponent(selectedLibraryComponent, position)
    }
  }, [selectedLibraryComponent, isEditing, currentLayout.grid, handleAddComponent])

  // Handle save layout
  const handleSaveLayout = useCallback(() => {
    onLayoutSave?.(currentLayout)
  }, [currentLayout, onLayoutSave])

  // Handle delete selected component
  const handleDeleteComponent = useCallback(() => {
    if (selectedComponent) {
      const newLayout = {
        ...currentLayout,
        components: currentLayout.components.filter(comp => comp.id !== selectedComponent)
      }
      handleLayoutChange(newLayout)
      setSelectedComponent(null)
    }
  }, [selectedComponent, currentLayout, handleLayoutChange])

  // Toggle grid visibility
  const toggleGrid = useCallback(() => {
    setShowGrid(!showGrid)
    const newLayout = {
      ...currentLayout,
      grid: { ...currentLayout.grid, showGrid: !showGrid }
    }
    handleLayoutChange(newLayout)
  }, [showGrid, currentLayout, handleLayoutChange])

  if (!visible) return null

  return (
    <div
      className="layout-editor"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme === 'light' ? '#ffffff' : '#111827'
      }}
    >
      {/* Toolbar */}
      <div
        className="editor-toolbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
          backgroundColor: theme === 'light' ? '#f9fafb' : '#1f2937'
        }}
      >
        {/* Left side - Layout info */}
        <div className="layout-info" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 600,
              color: theme === 'light' ? '#111827' : '#f9fafb'
            }}
          >
            {currentLayout.name}
          </h2>
          <span
            style={{
              fontSize: '12px',
              color: theme === 'light' ? '#6b7280' : '#9ca3af'
            }}
          >
            {currentLayout.components.length} components
          </span>
        </div>

        {/* Center - Controls */}
        <div className="editor-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsEditing(!isEditing)}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: isEditing ? '#dc2626' : '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
          >
            {isEditing ? 'Exit Edit' : 'Edit Layout'}
          </button>

          {isEditing && (
            <>
              <button
                onClick={() => setIsDragMode(!isDragMode)}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 500,
                  backgroundColor: isDragMode ? '#dc2626' : '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
              >
                {isDragMode ? 'Exit Drag' : 'Drag Mode'}
              </button>

              <button
                onClick={toggleGrid}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 500,
                  backgroundColor: showGrid ? '#059669' : '#6b7280',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
              >
                {showGrid ? 'Hide Grid' : 'Show Grid'}
              </button>

              {selectedComponent && (
                <button
                  onClick={handleDeleteComponent}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 500,
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  Delete
                </button>
              )}
            </>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="editor-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleSaveLayout}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
          >
            Save Layout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div
        className="editor-content"
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden'
        }}
      >
        {/* Component Library */}
        <ComponentLibrary
          components={availableComponents}
          visible={isEditing}
          onComponentSelect={handleLibraryComponentSelect}
          theme={theme}
          isDragMode={isDragMode}
        />

        {/* Layout Canvas */}
        <div
          className="canvas-container"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <LayoutCanvas
            layout={currentLayout}
            isEditing={isEditing}
            isDragMode={isDragMode}
            onLayoutChange={handleLayoutChange}
            onComponentSelect={handleComponentSelect}
            onComponentMove={handleComponentMove}
            onComponentResize={handleComponentResize}
            availableComponents={availableComponents}
            theme={theme}
          />

          {/* Status bar */}
          <div
            className="status-bar"
            style={{
              padding: '8px 16px',
              borderTop: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
              backgroundColor: theme === 'light' ? '#f9fafb' : '#1f2937',
              fontSize: '12px',
              color: theme === 'light' ? '#6b7280' : '#9ca3af',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              Grid: {currentLayout.grid.cols}×{currentLayout.grid.rows} | 
              Components: {currentLayout.components.length} |
              {selectedComponent && ` Selected: ${selectedComponent}`}
            </div>
            <div>
              {isEditing ? 'Edit Mode' : 'View Mode'} | 
              {isDragMode ? 'Drag Enabled' : 'Drag Disabled'}
            </div>
          </div>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div
          className="error-panel"
          style={{
            padding: '12px 16px',
            backgroundColor: '#fef2f2',
            borderTop: '1px solid #fecaca',
            color: '#dc2626',
            fontSize: '14px'
          }}
        >
          {errors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </div>
      )}
    </div>
  )
}
