'use client';

import { useState, useEffect, useRef } from 'react';
import { WidgetRegistry, DefaultWidgetProps, DefaultWidgetDimensions } from './widgets';
import { useAdvancedDragDrop } from './DragDropSystem';
import { 
  DragGhost, 
  SnapPreview, 
  DropZoneHighlight, 
  CollisionOverlay, 
  MagneticSnapLines,
  DragCursor 
} from './DragVisualFeedback';

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  component?: string;
  props?: Record<string, any>;
}

interface LayoutCanvasProps {
  layout: LayoutItem[];
  onLayoutChange: (layout: LayoutItem[]) => void;
  selectedWidget: string | null;
  onWidgetSelect: (widgetId: string) => void;
}

export default function LayoutCanvas({
  layout,
  onLayoutChange,
  selectedWidget,
  onWidgetSelect
}: LayoutCanvasProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedFromLibrary, setDraggedFromLibrary] = useState<string | null>(null);
  const [showCollisionWarning, setShowCollisionWarning] = useState(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use the advanced drag-drop system
  const {
    dragState,
    canvasRef,
    startDrag,
    endDrag,
    updateDragPosition,
    manager
  } = useAdvancedDragDrop(layout, onLayoutChange, {
    enableCollisionDetection: true,
    enableSmartSnapping: true,
    showDropZones: true,
    showGhostPreview: true,
    animationDuration: 250
  });

  const handleWidgetDragStart = (e: React.DragEvent, widgetId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', widgetId);
    
    // Calculate drag offset for smooth dragging
    const rect = e.currentTarget.getBoundingClientRect();
    const offset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    // Get widget dimensions from layout
    const widget = layout.find(item => item.i === widgetId);
    const dimensions = widget ? { w: widget.w, h: widget.h } : { w: 2, h: 2 };
    
    startDrag(e, widgetId, 'existing-widget', offset, dimensions);
    
    // Add smooth drag animation class
    e.currentTarget.classList.add('dragging-smooth');
  };

  const handleWidgetDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging-smooth');
    endDrag(e);
    
    // Smooth animation back to position if drag was cancelled
    if (!dragState.isValidDrop) {
      const target = e.currentTarget as HTMLElement;
      target.style.transition = 'transform 0.3s cubic-bezier(0.2, 0, 0.2, 1)';
      target.style.transform = 'scale(1)';
      
      setTimeout(() => {
        target.style.transition = '';
        target.style.transform = '';
      }, 300);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    
    const draggedData = e.dataTransfer.getData('text/plain');
    e.dataTransfer.dropEffect = draggedData.startsWith('new-') ? 'copy' : 'move';
    
    // Check if dragging from library and set up drag state
    if (draggedData.startsWith('new-')) {
      const componentName = draggedData.replace('new-', '');
      setDraggedFromLibrary(componentName);
      
      // Set up drag state with correct dimensions if not already dragging
      if (!dragState.isDragging) {
        const defaultDimensions = DefaultWidgetDimensions[componentName as keyof typeof DefaultWidgetDimensions] || { w: 2, h: 2 };
        startDrag(e, componentName, 'new-widget', { x: 0, y: 0 }, defaultDimensions);
      }
    }
    
    // Update drag position for visual feedback
    updateDragPosition(e.clientX, e.clientY);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only set drag over to false if we're leaving the canvas entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
      setDraggedFromLibrary(null);
      
      // Clean up drag state if dragging from library
      if (dragState.dragType === 'new-widget') {
        // Create a synthetic drag end event to clean up the drag state
        const syntheticEvent = {
          preventDefault: () => {},
          clientX: 0,
          clientY: 0
        } as React.DragEvent;
        endDrag(syntheticEvent);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setDraggedFromLibrary(null);
    
    const draggedData = e.dataTransfer.getData('text/plain');
    
    // Get widget dimensions from drag state or default to 2x2
    const widgetWidth = dragState.draggedWidgetDimensions?.w || 2;
    const widgetHeight = dragState.draggedWidgetDimensions?.h || 2;
    
    const dropPosition = manager.findBestDropPosition(e.clientX, e.clientY, widgetWidth, widgetHeight);
    
    if (!dropPosition.isValid) {
      // Show collision warning with animation
      setShowCollisionWarning(true);
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = setTimeout(() => {
        setShowCollisionWarning(false);
      }, 2000);
      return;
    }

    if (draggedData.startsWith('new-')) {
      // New component from library with smooth entrance animation
      const componentName = draggedData.replace('new-', '');
      const newWidget = {
        i: `widget-${Date.now()}`,
        x: dropPosition.x,
        y: dropPosition.y,
        w: widgetWidth,
        h: widgetHeight,
        component: componentName
      };
      
      onLayoutChange([...layout, newWidget]);
      
      // Auto-select with animation delay
      setTimeout(() => {
        onWidgetSelect(newWidget.i);
        
        // Add entrance animation
        const widgetElement = document.querySelector(`[data-widget-id="${newWidget.i}"]`);
        if (widgetElement) {
          widgetElement.classList.add('widget-entrance-animation');
          setTimeout(() => {
            widgetElement.classList.remove('widget-entrance-animation');
          }, 500);
        }
      }, 100);
      
    } else {
      // Existing widget being moved with smooth transition
      const updatedLayout = layout.map(item => {
        if (item.i === draggedData) {
          return {
            ...item,
            x: dropPosition.x,
            y: dropPosition.y,
            // Keep existing dimensions, only update position
            w: item.w,
            h: item.h
          };
        }
        return item;
      });
      
      onLayoutChange(updatedLayout);
      
      // Add move animation
      const widgetElement = document.querySelector(`[data-widget-id="${draggedData}"]`);
      if (widgetElement) {
        widgetElement.classList.add('widget-move-animation');
        setTimeout(() => {
          widgetElement.classList.remove('widget-move-animation');
        }, 300);
      }
    }
  };

  const renderWidget = (item: LayoutItem) => {
    const isSelected = selectedWidget === item.i;
    const isDraggingThis = dragState.draggedItem === item.i && dragState.isDragging;
    
    // Get the widget component and props
    const WidgetComponent = WidgetRegistry[item.component as keyof typeof WidgetRegistry];
    const defaultProps = DefaultWidgetProps[item.component as keyof typeof DefaultWidgetProps] || {};
    const widgetProps = { ...defaultProps, ...(item.props || {}) };
    
    return (
      <div
        key={item.i}
        data-widget-id={item.i}
        className={`
          grid-item group relative transition-all duration-200 ease-out
          ${isSelected ? 'selected ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900' : ''}
          ${isDraggingThis ? 'widget-dragging opacity-50 scale-95 z-50' : 'hover:scale-[1.02] hover:shadow-lg'}
          ${!isDraggingThis && dragState.isDragging ? 'hover:shadow-blue-500/20' : ''}
        `}
        style={{
          position: 'absolute',
          left: `${(item.x / 12) * 100}%`,
          top: `${item.y * 60}px`,
          width: `${(item.w / 12) * 100}%`,
          height: `${item.h * 60}px`,
          cursor: isDraggingThis ? 'grabbing' : 'grab',
          zIndex: isSelected ? 10 : isDraggingThis ? 50 : 1
        }}
        draggable
        onDragStart={(e) => handleWidgetDragStart(e, item.i)}
        onDragEnd={handleWidgetDragEnd}
        onClick={() => onWidgetSelect(item.i)}
        onMouseEnter={(e) => {
          if (!dragState.isDragging) {
            const target = e.currentTarget as HTMLElement;
            target.style.transform = 'scale(1.02)';
          }
        }}
        onMouseLeave={(e) => {
          if (!dragState.isDragging) {
            const target = e.currentTarget as HTMLElement;
            target.style.transform = '';
          }
        }}
      >
        {/* Drag handle indicator */}
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-slate-700/80 text-slate-300 px-1.5 py-0.5 rounded text-xs font-medium backdrop-blur-sm">
            ⋮⋮
          </div>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute -top-2 -left-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-lg">
            Selected
          </div>
        )}

        {/* Widget content */}
        <div className="h-full w-full overflow-hidden rounded-lg">
          {WidgetComponent ? (
            <WidgetComponent {...(widgetProps as any)} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-2 bg-slate-700 text-white rounded-lg">
              <div className="text-lg font-bold mb-1">{item.component}</div>
              <div className="text-xs opacity-75">Widget not found</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Layout Canvas</h2>
        <div className="flex items-center space-x-2 text-sm text-slate-400">
          <span>12-column grid</span>
          <span>•</span>
          <span>{layout.length} widgets</span>
        </div>
      </div>
      
      <div 
        ref={canvasRef}
        className={`
          grid-canvas relative transition-all duration-300 ease-out
          ${isDragOver ? 'drag-over bg-blue-500/5 border-blue-400/50' : ''}
          ${dragState.isDragging ? 'cursor-crosshair' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ minHeight: '600px' }}
      >
        {layout.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <div className="text-4xl mb-4">🎨</div>
              <div className="text-lg font-medium mb-2">Empty Canvas</div>
              <div className="text-sm">Drag widgets from the library to start building your layout</div>
            </div>
          </div>
        ) : (
          layout.map(renderWidget)
        )}
        
        {/* Enhanced Grid Guidelines with improved visibility */}
        <div className={`grid-guidelines transition-opacity duration-200 ${
          dragState.isDragging || isDragOver ? 'opacity-100' : 'opacity-0 hover:opacity-30'
        }`}>
          {[...Array(13)].map((_, i) => (
            <div
              key={`v-${i}`}
              className="grid-line-vertical bg-blue-400/30 w-px"
              style={{ left: `${(i / 12) * 100}%` }}
            />
          ))}
          {[...Array(11)].map((_, i) => (
            <div
              key={`h-${i}`}
              className="grid-line-horizontal bg-blue-400/30 h-px"
              style={{ top: `${i * 60}px` }}
            />
          ))}
        </div>

        {/* Advanced Visual Feedback Components */}
        <DragGhost dragState={dragState} canvasRef={canvasRef} dropZones={[]} />
        <SnapPreview dragState={dragState} canvasRef={canvasRef} dropZones={[]} />
        <MagneticSnapLines dragState={dragState} layout={layout} canvasRef={canvasRef as React.RefObject<HTMLDivElement | null>} />
        <DragCursor dragState={dragState} />
        
        {/* Drop zone highlight for new widgets */}
        {draggedFromLibrary && dragState.snapPosition && (
          <DropZoneHighlight
            isActive={true}
            isValid={dragState.isValidDrop}
            position={{
              x: dragState.snapPosition.x,
              y: dragState.snapPosition.y,
              w: dragState.draggedWidgetDimensions?.w || 2,
              h: dragState.draggedWidgetDimensions?.h || 2
            }}
          />
        )}

        {/* Collision detection overlay */}
        {dragState.isDragging && dragState.snapPosition && (
          <CollisionOverlay
            layout={layout}
            draggedWidget={dragState.draggedItem}
            proposedPosition={dragState.snapPosition ? {
              x: dragState.snapPosition.x,
              y: dragState.snapPosition.y,
              w: dragState.draggedWidgetDimensions?.w || 2,
              h: dragState.draggedWidgetDimensions?.h || 2
            } : null}
          />
        )}

        {/* Collision warning notification */}
        {showCollisionWarning && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce z-50">
            <div className="flex items-center space-x-2">
              <span>⚠️</span>
              <span className="font-medium">Cannot place widget here - collision detected!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
