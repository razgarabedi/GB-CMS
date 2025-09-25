/**
 * Layout Canvas Component
 * Interactive drag-and-drop layout editor for digital signage components
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import type { LayoutConfig, LayoutComponent, GridPosition } from '../types/LayoutTypes'
import type { ComponentCategory } from '../types/ComponentInterfaces'

interface LayoutCanvasProps {
  /** Current layout configuration */
  layout: LayoutConfig
  /** Whether editing mode is enabled */
  isEditing?: boolean
  /** Whether drag mode is enabled */
  isDragMode?: boolean
  /** Callback when layout changes */
  onLayoutChange?: (layout: LayoutConfig) => void
  /** Callback when component is selected */
  onComponentSelect?: (componentId: string | null) => void
  /** Callback when component is moved */
  onComponentMove?: (componentId: string, position: GridPosition) => void
  /** Callback when component is resized */
  onComponentResize?: (componentId: string, position: GridPosition) => void
  /** Available components for drag and drop */
  availableComponents?: Array<{
    type: ComponentCategory
    name: string
    description: string
    defaultConfig: Record<string, any>
    defaultPosition: GridPosition
  }>
  /** Theme */
  theme?: 'dark' | 'light'
}

interface DragState {
  isDragging: boolean
  isResizing: boolean
  componentId: string | null
  startPosition: GridPosition | null
  currentPosition: GridPosition | null
  dragOffset: { x: number; y: number } | null
  resizeHandle: string | null
}

export default function LayoutCanvas({
  layout,
  isEditing = false,
  isDragMode = false,
  onLayoutChange: _onLayoutChange,
  onComponentSelect,
  onComponentMove,
  onComponentResize,
  availableComponents: _availableComponents = [],
  theme = 'dark'
}: LayoutCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    isResizing: false,
    componentId: null,
    startPosition: null,
    currentPosition: null,
    dragOffset: null,
    resizeHandle: null
  })
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null)

  // Calculate grid cell size based on canvas dimensions
  const [cellSize, setCellSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateCellSize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        const cellWidth = (rect.width - (layout.grid.gap || 2) * (layout.grid.cols - 1)) / layout.grid.cols
        const cellHeight = (rect.height - (layout.grid.gap || 2) * (layout.grid.rows - 1)) / layout.grid.rows
        setCellSize({ width: cellWidth, height: cellHeight })
      }
    }

    updateCellSize()
    window.addEventListener('resize', updateCellSize)
    return () => window.removeEventListener('resize', updateCellSize)
  }, [layout.grid])

  // Convert pixel coordinates to grid coordinates
  const pixelToGrid = useCallback((x: number, y: number): GridPosition => {
    const gap = layout.grid.gap || 2
    const gridX = Math.floor((x + gap / 2) / (cellSize.width + gap)) + 1
    const gridY = Math.floor((y + gap / 2) / (cellSize.height + gap)) + 1
    
    return {
      x: Math.max(1, Math.min(layout.grid.cols, gridX)),
      y: Math.max(1, Math.min(layout.grid.rows, gridY)),
      w: 1,
      h: 1
    }
  }, [cellSize, layout.grid])

  // Convert grid coordinates to pixel coordinates
  const gridToPixel = useCallback((position: GridPosition) => {
    const gap = layout.grid.gap || 2
    const x = (position.x - 1) * (cellSize.width + gap)
    const y = (position.y - 1) * (cellSize.height + gap)
    const width = position.w * cellSize.width + (position.w - 1) * gap
    const height = position.h * cellSize.height + (position.h - 1) * gap
    
    return { x, y, width, height }
  }, [cellSize, layout.grid])

  // Handle mouse down on component
  const handleMouseDown = useCallback((e: React.MouseEvent, componentId: string, isResize = false, handle?: string) => {
    if (!isEditing || !isDragMode) return

    e.preventDefault()
    e.stopPropagation()

    const component = layout.components.find(c => c.id === componentId)
    if (!component) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    setDragState({
      isDragging: !isResize,
      isResizing: isResize,
      componentId,
      startPosition: { ...component.position },
      currentPosition: { ...component.position },
      dragOffset: {
        x: mouseX - gridToPixel(component.position).x,
        y: mouseY - gridToPixel(component.position).y
      },
      resizeHandle: handle || null
    })

    setSelectedComponent(componentId)
    onComponentSelect?.(componentId)
  }, [isEditing, isDragMode, layout.components, gridToPixel, onComponentSelect])

  // Handle mouse move during drag/resize
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging && !dragState.isResizing) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect || !dragState.dragOffset) return

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    if (dragState.isDragging) {
      // Handle drag
      const newX = mouseX - dragState.dragOffset.x
      const newY = mouseY - dragState.dragOffset.y
      const newGridPos = pixelToGrid(newX, newY)
      
      setDragState(prev => ({
        ...prev,
        currentPosition: {
          ...prev.currentPosition!,
          x: newGridPos.x,
          y: newGridPos.y
        }
      }))
    } else if (dragState.isResizing) {
      // Handle resize
      const component = layout.components.find(c => c.id === dragState.componentId)
      if (!component) return

      const startPixel = gridToPixel(dragState.startPosition!)
      const newWidth = mouseX - startPixel.x
      const newHeight = mouseY - startPixel.y
      
      const newGridPos = {
        ...dragState.startPosition!,
        w: Math.max(1, Math.floor(newWidth / (cellSize.width + (layout.grid.gap || 2))) + 1),
        h: Math.max(1, Math.floor(newHeight / (cellSize.height + (layout.grid.gap || 2))) + 1)
      }

      setDragState(prev => ({
        ...prev,
        currentPosition: newGridPos
      }))
    }
  }, [dragState, pixelToGrid, gridToPixel, cellSize, layout.grid.gap, layout.components])

  // Handle mouse up to end drag/resize
  const handleMouseUp = useCallback(() => {
    if (!dragState.isDragging && !dragState.isResizing) return

    if (dragState.isDragging && dragState.currentPosition && dragState.startPosition) {
      // Check if position actually changed
      if (dragState.currentPosition.x !== dragState.startPosition.x || 
          dragState.currentPosition.y !== dragState.startPosition.y) {
        onComponentMove?.(dragState.componentId!, dragState.currentPosition)
      }
    } else if (dragState.isResizing && dragState.currentPosition && dragState.startPosition) {
      // Check if size actually changed
      if (dragState.currentPosition.w !== dragState.startPosition.w || 
          dragState.currentPosition.h !== dragState.startPosition.h) {
        onComponentResize?.(dragState.componentId!, dragState.currentPosition)
      }
    }

    setDragState({
      isDragging: false,
      isResizing: false,
      componentId: null,
      startPosition: null,
      currentPosition: null,
      dragOffset: null,
      resizeHandle: null
    })
  }, [dragState, onComponentMove, onComponentResize])

  // Add global mouse event listeners
  useEffect(() => {
    if (dragState.isDragging || dragState.isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [dragState.isDragging, dragState.isResizing, handleMouseMove, handleMouseUp])

  // Render grid background
  const renderGrid = () => {
    if (!layout.grid.showGrid && !isEditing) return null

    const gridLines = []
    const gap = layout.grid.gap || 2

    // Vertical lines
    for (let i = 0; i <= layout.grid.cols; i++) {
      const x = i * (cellSize.width + gap)
      gridLines.push(
        <div
          key={`v-${i}`}
          className="grid-line grid-line-vertical"
          style={{
            position: 'absolute',
            left: x,
            top: 0,
            width: 1,
            height: '100%',
            backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
            pointerEvents: 'none'
          }}
        />
      )
    }

    // Horizontal lines
    for (let i = 0; i <= layout.grid.rows; i++) {
      const y = i * (cellSize.height + gap)
      gridLines.push(
        <div
          key={`h-${i}`}
          className="grid-line grid-line-horizontal"
          style={{
            position: 'absolute',
            left: 0,
            top: y,
            width: '100%',
            height: 1,
            backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
            pointerEvents: 'none'
          }}
        />
      )
    }

    return gridLines
  }

  // Render component
  const renderComponent = (component: LayoutComponent) => {
    const pixelPos = gridToPixel(component.position)
    const isSelected = selectedComponent === component.id
    const isHovered = hoveredComponent === component.id
    const isDragging = dragState.componentId === component.id && dragState.isDragging
    const isResizing = dragState.componentId === component.id && dragState.isResizing

    // Use current position during drag/resize
    const displayPos = (isDragging || isResizing) && dragState.currentPosition 
      ? gridToPixel(dragState.currentPosition)
      : pixelPos

    return (
      <div
        key={component.id}
        className={`layout-component ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''}`}
        style={{
          position: 'absolute',
          left: displayPos.x,
          top: displayPos.y,
          width: displayPos.width,
          height: displayPos.height,
          backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
          border: isSelected ? '2px solid #007bff' : '1px solid rgba(255,255,255,0.2)',
          borderRadius: '4px',
          cursor: isEditing && isDragMode ? 'move' : 'default',
          zIndex: isSelected ? 10 : 1,
          transition: isDragging || isResizing ? 'none' : 'all 0.2s ease',
          opacity: isDragging ? 0.8 : 1
        }}
        onMouseDown={(e) => handleMouseDown(e, component.id)}
        onMouseEnter={() => setHoveredComponent(component.id)}
        onMouseLeave={() => setHoveredComponent(null)}
      >
        {/* Component content placeholder */}
        <div className="component-content" style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: theme === 'light' ? '#333' : '#fff',
          textAlign: 'center',
          padding: '8px',
          boxSizing: 'border-box'
        }}>
          {component.type}
        </div>

        {/* Resize handles */}
        {isEditing && isDragMode && isSelected && (
          <>
            {['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map(handle => (
              <div
                key={handle}
                className={`resize-handle resize-handle-${handle}`}
                style={{
                  position: 'absolute',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#007bff',
                  border: '1px solid #fff',
                  cursor: `${handle}-resize`,
                  ...getResizeHandlePosition(handle)
                }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  handleMouseDown(e, component.id, true, handle)
                }}
              />
            ))}
          </>
        )}

        {/* Component label */}
        {isEditing && (
          <div className="component-label" style={{
            position: 'absolute',
            top: '-20px',
            left: 0,
            fontSize: '10px',
            color: theme === 'light' ? '#333' : '#fff',
            backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
            padding: '2px 4px',
            borderRadius: '2px',
            whiteSpace: 'nowrap'
          }}>
            {component.id}
          </div>
        )}
      </div>
    )
  }

  // Get resize handle position
  const getResizeHandlePosition = (handle: string) => {
    const positions: Record<string, React.CSSProperties> = {
      n: { top: '-4px', left: '50%', transform: 'translateX(-50%)' },
      s: { bottom: '-4px', left: '50%', transform: 'translateX(-50%)' },
      e: { right: '-4px', top: '50%', transform: 'translateY(-50%)' },
      w: { left: '-4px', top: '50%', transform: 'translateY(-50%)' },
      ne: { top: '-4px', right: '-4px' },
      nw: { top: '-4px', left: '-4px' },
      se: { bottom: '-4px', right: '-4px' },
      sw: { bottom: '-4px', left: '-4px' }
    }
    return positions[handle] || {}
  }

  return (
    <div
      ref={canvasRef}
      className="layout-canvas"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: theme === 'light' ? '#f5f5f5' : '#1a1a1a',
        overflow: 'hidden',
        userSelect: 'none'
      }}
      onClick={() => {
        setSelectedComponent(null)
        onComponentSelect?.(null)
      }}
    >
      {/* Grid background */}
      {renderGrid()}

      {/* Components */}
      {layout.components.map(renderComponent)}

      {/* Drop zones for new components */}
      {isEditing && isDragMode && (
        <div className="drop-zones" style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none'
        }}>
          {/* This would show drop zones when dragging components from the library */}
        </div>
      )}
    </div>
  )
}
