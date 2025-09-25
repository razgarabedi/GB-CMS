/**
 * Enhanced Layout Canvas Component
 * 
 * Provides a visual drag-and-drop interface for designing digital signage layouts.
 * Features grid-based positioning, component management, and real-time preview.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  LayoutCanvas, 
  CanvasComponent, 
  CanvasZone, 
  UIPosition, 
  UISize, 
  UIBounds,
  DragState,
  DragItem,
  DropTarget,
  CanvasSelection,
  CanvasEvent
} from '../types/UITypes';

interface EnhancedLayoutCanvasProps {
  canvas: LayoutCanvas;
  onCanvasChange: (canvas: LayoutCanvas) => void;
  onComponentSelect: (componentId: string | null) => void;
  onComponentMove: (componentId: string, position: UIPosition) => void;
  onComponentResize: (componentId: string, size: UISize) => void;
  onComponentDelete: (componentId: string) => void;
  onComponentDuplicate: (componentId: string) => void;
  onDrop: (item: DragItem, position: UIPosition) => void;
  showGrid?: boolean;
  showGuides?: boolean;
  snapToGrid?: boolean;
  zoom?: number;
  className?: string;
}

export const EnhancedLayoutCanvas: React.FC<EnhancedLayoutCanvasProps> = ({
  canvas,
  onCanvasChange,
  onComponentSelect,
  onComponentMove,
  onComponentResize,
  onComponentDelete,
  onComponentDuplicate,
  onDrop,
  showGrid = true,
  showGuides = true,
  snapToGrid = true,
  zoom = 1,
  className = ''
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragItem: null,
    dropTarget: null,
    position: { x: 0, y: 0 },
    isValid: false,
    preview: null
  });
  const [selection, setSelection] = useState<CanvasSelection>({
    componentIds: [],
    bounds: { x: 0, y: 0, width: 0, height: 0 },
    isMultiSelect: false
  });
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

  // Grid calculations
  const gridSize = canvas.grid.cellSize * zoom;
  const gridGap = canvas.grid.gap * zoom;

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenPos: UIPosition): UIPosition => {
    if (!canvasRef.current) return screenPos;
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (screenPos.x - rect.left - canvas.pan.x) / zoom,
      y: (screenPos.y - rect.top - canvas.pan.y) / zoom
    };
  }, [canvas.pan, zoom]);

  // Convert canvas coordinates to screen coordinates
  const canvasToScreen = useCallback((canvasPos: UIPosition): UIPosition => {
    return {
      x: canvasPos.x * zoom + canvas.pan.x,
      y: canvasPos.y * zoom + canvas.pan.y
    };
  }, [canvas.pan, zoom]);

  // Snap position to grid
  const snapToGridPosition = useCallback((position: UIPosition): UIPosition => {
    if (!snapToGrid) return position;
    return {
      x: Math.round(position.x / canvas.grid.cellSize) * canvas.grid.cellSize,
      y: Math.round(position.y / canvas.grid.cellSize) * canvas.grid.cellSize
    };
  }, [snapToGrid, canvas.grid.cellSize]);

  // Get component bounds
  const getComponentBounds = useCallback((component: CanvasComponent): UIBounds => {
    const screenPos = canvasToScreen(component.position);
    return {
      x: screenPos.x,
      y: screenPos.y,
      width: component.size.width * zoom,
      height: component.size.height * zoom
    };
  }, [canvasToScreen, zoom]);

  // Check if position is within bounds
  const isWithinBounds = useCallback((position: UIPosition, bounds: UIBounds): boolean => {
    return position.x >= bounds.x && 
           position.x <= bounds.x + bounds.width &&
           position.y >= bounds.y && 
           position.y <= bounds.y + bounds.height;
  }, []);

  // Find component at position
  const findComponentAt = useCallback((position: UIPosition): CanvasComponent | null => {
    const canvasPos = screenToCanvas(position);
    for (let i = canvas.components.length - 1; i >= 0; i--) {
      const component = canvas.components[i];
      if (!component.visible) continue;
      
      const bounds = {
        x: component.position.x,
        y: component.position.y,
        width: component.size.width,
        height: component.size.height
      };
      
      if (isWithinBounds(canvasPos, bounds)) {
        return component;
      }
    }
    return null;
  }, [canvas.components, screenToCanvas, isWithinBounds]);

  // Handle mouse down on component
  const handleComponentMouseDown = useCallback((e: React.MouseEvent, component: CanvasComponent) => {
    e.stopPropagation();
    
    if (e.ctrlKey || e.metaKey) {
      // Multi-select
      setSelection(prev => ({
        componentIds: prev.componentIds.includes(component.id) 
          ? prev.componentIds.filter(id => id !== component.id)
          : [...prev.componentIds, component.id],
        bounds: { x: 0, y: 0, width: 0, height: 0 },
        isMultiSelect: true
      }));
    } else {
      // Single select
      setSelection({
        componentIds: [component.id],
        bounds: getComponentBounds(component),
        isMultiSelect: false
      });
      onComponentSelect(component.id);
    }
  }, [onComponentSelect, getComponentBounds]);

  // Handle mouse down on canvas
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelection({
        componentIds: [],
        bounds: { x: 0, y: 0, width: 0, height: 0 },
        isMultiSelect: false
      });
      onComponentSelect(null);
    }
  }, [onComponentSelect]);

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, item: DragItem) => {
    setDragState({
      isDragging: true,
      dragItem: item,
      dropTarget: null,
      position: { x: e.clientX, y: e.clientY },
      isValid: false,
      preview: null
    });
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    
    const position = screenToCanvas({ x: e.clientX, y: e.clientY });
    const snappedPosition = snapToGridPosition(position);
    
    setDragState(prev => ({
      ...prev,
      position: { x: e.clientX, y: e.clientY },
      isValid: true
    }));
  }, [screenToCanvas, snapToGridPosition]);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    if (!dragState.dragItem) return;
    
    const position = screenToCanvas({ x: e.clientX, y: e.clientY });
    const snappedPosition = snapToGridPosition(position);
    
    onDrop(dragState.dragItem, snappedPosition);
    
    setDragState({
      isDragging: false,
      dragItem: null,
      dropTarget: null,
      position: { x: 0, y: 0 },
      isValid: false,
      preview: null
    });
  }, [dragState.dragItem, screenToCanvas, snapToGridPosition, onDrop]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      dragItem: null,
      dropTarget: null,
      position: { x: 0, y: 0 },
      isValid: false,
      preview: null
    });
  }, []);

  // Handle component move
  const handleComponentMove = useCallback((componentId: string, newPosition: UIPosition) => {
    const snappedPosition = snapToGridPosition(newPosition);
    onComponentMove(componentId, snappedPosition);
  }, [snapToGridPosition, onComponentMove]);

  // Handle component resize
  const handleComponentResize = useCallback((componentId: string, newSize: UISize) => {
    onComponentResize(componentId, newSize);
  }, [onComponentResize]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selection.componentIds.length === 0) return;
      
      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          selection.componentIds.forEach(id => onComponentDelete(id));
          break;
        case 'd':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            selection.componentIds.forEach(id => onComponentDuplicate(id));
          }
          break;
        case 'Escape':
          setSelection({
            componentIds: [],
            bounds: { x: 0, y: 0, width: 0, height: 0 },
            isMultiSelect: false
          });
          onComponentSelect(null);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selection.componentIds, onComponentDelete, onComponentDuplicate, onComponentSelect]);

  // Render grid
  const renderGrid = () => {
    if (!showGrid) return null;
    
    const gridLines = [];
    const { columns, rows, cellSize } = canvas.grid;
    
    // Vertical lines
    for (let i = 0; i <= columns; i++) {
      const x = i * cellSize * zoom + canvas.pan.x;
      gridLines.push(
        <line
          key={`v-${i}`}
          x1={x}
          y1={canvas.pan.y}
          x2={x}
          y2={canvas.pan.y + rows * cellSize * zoom}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
        />
      );
    }
    
    // Horizontal lines
    for (let i = 0; i <= rows; i++) {
      const y = i * cellSize * zoom + canvas.pan.y;
      gridLines.push(
        <line
          key={`h-${i}`}
          x1={canvas.pan.x}
          y1={y}
          x2={canvas.pan.x + columns * cellSize * zoom}
          y2={y}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
        />
      );
    }
    
    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      >
        {gridLines}
      </svg>
    );
  };

  // Render zones
  const renderZones = () => {
    return canvas.zones.map(zone => {
      const screenBounds = {
        x: zone.bounds.x * zoom + canvas.pan.x,
        y: zone.bounds.y * zoom + canvas.pan.y,
        width: zone.bounds.width * zoom,
        height: zone.bounds.height * zoom
      };
      
      return (
        <div
          key={zone.id}
          className="absolute border-2 border-dashed border-blue-400 bg-blue-400 bg-opacity-10"
          style={{
            left: screenBounds.x,
            top: screenBounds.y,
            width: screenBounds.width,
            height: screenBounds.height,
            zIndex: 2
          }}
        >
          <div className="absolute top-1 left-1 text-xs text-blue-400 bg-black bg-opacity-50 px-1 rounded">
            {zone.name}
          </div>
        </div>
      );
    });
  };

  // Render components
  const renderComponents = () => {
    return canvas.components
      .filter(component => component.visible)
      .sort((a, b) => a.zIndex - b.zIndex)
      .map(component => {
        const bounds = getComponentBounds(component);
        const isSelected = selection.componentIds.includes(component.id);
        
        return (
          <div
            key={component.id}
            className={`absolute border-2 cursor-move ${
              isSelected 
                ? 'border-blue-500 bg-blue-500 bg-opacity-20' 
                : 'border-gray-400 bg-gray-400 bg-opacity-10'
            }`}
            style={{
              left: bounds.x,
              top: bounds.y,
              width: bounds.width,
              height: bounds.height,
              zIndex: 10 + component.zIndex
            }}
            onMouseDown={(e) => handleComponentMouseDown(e, component)}
            draggable
            onDragStart={(e) => handleDragStart(e, {
              id: component.id,
              type: 'component',
              data: component,
              source: 'canvas',
              position: component.position,
              size: component.size
            })}
          >
            <div className="w-full h-full flex items-center justify-center text-white text-sm font-medium">
              {component.name}
            </div>
            
            {/* Resize handles */}
            {isSelected && (
              <>
                <div
                  className="absolute top-0 left-0 w-2 h-2 bg-blue-500 cursor-nw-resize"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setIsResizing(component.id);
                    setResizeHandle('nw');
                  }}
                />
                <div
                  className="absolute top-0 right-0 w-2 h-2 bg-blue-500 cursor-ne-resize"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setIsResizing(component.id);
                    setResizeHandle('ne');
                  }}
                />
                <div
                  className="absolute bottom-0 left-0 w-2 h-2 bg-blue-500 cursor-sw-resize"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setIsResizing(component.id);
                    setResizeHandle('sw');
                  }}
                />
                <div
                  className="absolute bottom-0 right-0 w-2 h-2 bg-blue-500 cursor-se-resize"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setIsResizing(component.id);
                    setResizeHandle('se');
                  }}
                />
              </>
            )}
          </div>
        );
      });
  };

  // Render drag preview
  const renderDragPreview = () => {
    if (!dragState.isDragging || !dragState.dragItem) return null;
    
    const position = screenToCanvas(dragState.position);
    const snappedPosition = snapToGridPosition(position);
    const screenPos = canvasToScreen(snappedPosition);
    
    return (
      <div
        className="absolute border-2 border-dashed border-green-500 bg-green-500 bg-opacity-20 pointer-events-none"
        style={{
          left: screenPos.x,
          top: screenPos.y,
          width: 200 * zoom,
          height: 100 * zoom,
          zIndex: 1000
        }}
      >
        <div className="w-full h-full flex items-center justify-center text-green-500 text-sm font-medium">
          {dragState.dragItem.data.name || 'New Component'}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={canvasRef}
      className={`relative bg-gray-900 overflow-hidden ${className}`}
      style={{
        width: canvas.size.width * zoom,
        height: canvas.size.height * zoom,
        transform: `translate(${canvas.pan.x}px, ${canvas.pan.y}px)`
      }}
      onMouseDown={handleCanvasMouseDown}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
    >
      {/* Grid */}
      {renderGrid()}
      
      {/* Zones */}
      {showGuides && renderZones()}
      
      {/* Components */}
      {renderComponents()}
      
      {/* Drag Preview */}
      {renderDragPreview()}
      
      {/* Canvas Info */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-black bg-opacity-50 px-2 py-1 rounded">
        {canvas.size.width} × {canvas.size.height} | Zoom: {Math.round(zoom * 100)}%
      </div>
    </div>
  );
};

export default EnhancedLayoutCanvas;
