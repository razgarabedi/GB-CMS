/**
 * Component Library
 * Draggable component palette for the layout editor
 */

import React, { useState } from 'react'
import type { ComponentDefinition } from '../types/LayoutTypes'
import type { ComponentCategory } from '../types/ComponentInterfaces'

interface ComponentLibraryProps {
  /** Available components */
  components: ComponentDefinition[]
  /** Whether the library is visible */
  visible?: boolean
  /** Callback when component is selected for adding */
  onComponentSelect?: (component: ComponentDefinition) => void
  /** Theme */
  theme?: 'dark' | 'light'
  /** Whether drag mode is enabled */
  isDragMode?: boolean
}

interface DragState {
  isDragging: boolean
  component: ComponentDefinition | null
  dragOffset: { x: number; y: number } | null
}

export default function ComponentLibrary({
  components,
  visible = true,
  onComponentSelect,
  theme = 'dark',
  isDragMode = false
}: ComponentLibraryProps) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    component: null,
    dragOffset: null
  })
  const [selectedComponent, setSelectedComponent] = useState<ComponentDefinition | null>(null)

  // Component icons mapping
  const getComponentIcon = (type: ComponentCategory): string => {
    const icons: Record<ComponentCategory, string> = {
      weather: '🌤️',
      clock: '🕐',
      news: '📰',
      slideshow: '🖼️',
      web: '🌐',
      pv: '⚡',
      custom: '🔧'
    }
    return icons[type] || '📦'
  }

  // Component category colors
  const getComponentColor = (type: ComponentCategory): string => {
    const colors: Record<ComponentCategory, string> = {
      weather: '#3b82f6',
      clock: '#10b981',
      news: '#f59e0b',
      slideshow: '#8b5cf6',
      web: '#06b6d4',
      pv: '#ef4444',
      custom: '#6b7280'
    }
    return colors[type] || '#6b7280'
  }

  // Handle component drag start
  const handleDragStart = (e: React.DragEvent, component: ComponentDefinition) => {
    if (!isDragMode) return

    e.dataTransfer.setData('application/json', JSON.stringify(component))
    e.dataTransfer.effectAllowed = 'copy'
    
    setDragState({
      isDragging: true,
      component,
      dragOffset: { x: 0, y: 0 }
    })
  }

  // Handle component click
  const handleComponentClick = (component: ComponentDefinition) => {
    setSelectedComponent(component)
    onComponentSelect?.(component)
  }

  // Group components by category
  const groupedComponents = components.reduce((groups, component) => {
    const category = component.type
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(component)
    return groups
  }, {} as Record<ComponentCategory, ComponentDefinition[]>)

  if (!visible) return null

  return (
    <div
      className="component-library"
      style={{
        width: '280px',
        height: '100%',
        backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937',
        borderRight: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div
        className="library-header"
        style={{
          padding: '16px',
          borderBottom: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
          backgroundColor: theme === 'light' ? '#f9fafb' : '#111827'
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: 600,
            color: theme === 'light' ? '#111827' : '#f9fafb'
          }}
        >
          Component Library
        </h3>
        <p
          style={{
            margin: '4px 0 0 0',
            fontSize: '12px',
            color: theme === 'light' ? '#6b7280' : '#9ca3af'
          }}
        >
          Drag components to the canvas
        </p>
      </div>

      {/* Components list */}
      <div
        className="components-list"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px'
        }}
      >
        {Object.entries(groupedComponents).map(([category, categoryComponents]) => (
          <div key={category} className="component-category">
            {/* Category header */}
            <div
              className="category-header"
              style={{
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 600,
                color: theme === 'light' ? '#6b7280' : '#9ca3af',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                borderBottom: `1px solid ${theme === 'light' ? '#f3f4f6' : '#374151'}`,
                marginBottom: '8px'
              }}
            >
              {category}
            </div>

            {/* Category components */}
            <div className="category-components" style={{ marginBottom: '16px' }}>
              {categoryComponents.map((component) => (
                <div
                  key={component.type}
                  className={`component-item ${selectedComponent?.type === component.type ? 'selected' : ''} ${!component.available ? 'disabled' : ''}`}
                  draggable={isDragMode && component.available}
                  onDragStart={(e) => handleDragStart(e, component)}
                  onClick={() => component.available && handleComponentClick(component)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    marginBottom: '4px',
                    backgroundColor: selectedComponent?.type === component.type
                      ? (theme === 'light' ? '#eff6ff' : '#1e3a8a')
                      : (theme === 'light' ? '#ffffff' : '#374151'),
                    border: `1px solid ${
                      selectedComponent?.type === component.type
                        ? getComponentColor(component.type)
                        : (theme === 'light' ? '#e5e7eb' : '#4b5563')
                    }`,
                    borderRadius: '6px',
                    cursor: component.available && isDragMode ? 'grab' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: component.available ? 1 : 0.5,
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (component.available) {
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = theme === 'light'
                        ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        : '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Component icon */}
                  <div
                    className="component-icon"
                    style={{
                      fontSize: '20px',
                      marginRight: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      backgroundColor: `${getComponentColor(component.type)}20`,
                      borderRadius: '6px',
                      border: `1px solid ${getComponentColor(component.type)}40`
                    }}
                  >
                    {getComponentIcon(component.type)}
                  </div>

                  {/* Component info */}
                  <div className="component-info" style={{ flex: 1 }}>
                    <div
                      className="component-name"
                      style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: theme === 'light' ? '#111827' : '#f9fafb',
                        marginBottom: '2px'
                      }}
                    >
                      {component.name}
                    </div>
                    <div
                      className="component-description"
                      style={{
                        fontSize: '12px',
                        color: theme === 'light' ? '#6b7280' : '#9ca3af',
                        lineHeight: 1.4
                      }}
                    >
                      {component.description}
                    </div>
                  </div>

                  {/* Drag indicator */}
                  {isDragMode && component.available && (
                    <div
                      className="drag-indicator"
                      style={{
                        fontSize: '12px',
                        color: theme === 'light' ? '#9ca3af' : '#6b7280',
                        marginLeft: '8px'
                      }}
                    >
                      ⋮⋮
                    </div>
                  )}

                  {/* Unavailable indicator */}
                  {!component.available && (
                    <div
                      className="unavailable-indicator"
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        fontSize: '10px',
                        color: theme === 'light' ? '#ef4444' : '#f87171',
                        backgroundColor: theme === 'light' ? '#fef2f2' : '#1f2937',
                        padding: '2px 4px',
                        borderRadius: '3px',
                        border: `1px solid ${theme === 'light' ? '#fecaca' : '#374151'}`
                      }}
                    >
                      Unavailable
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="library-footer"
        style={{
          padding: '12px 16px',
          borderTop: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
          backgroundColor: theme === 'light' ? '#f9fafb' : '#111827'
        }}
      >
        <div
          style={{
            fontSize: '11px',
            color: theme === 'light' ? '#6b7280' : '#9ca3af',
            textAlign: 'center'
          }}
        >
          {isDragMode ? 'Drag & Drop Mode' : 'Click to Select Mode'}
        </div>
      </div>
    </div>
  )
}
