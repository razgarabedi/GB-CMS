'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { WidgetRegistry, DefaultWidgetProps, DefaultWidgetDimensions } from './widgets';
import { useAdvancedDragDrop } from './DragDropSystem';
import { isStaticWidget } from '../utils/staticWidgetUtils';
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
  editingScreen?: any;
}

export default function LayoutCanvas({
  layout,
  onLayoutChange,
  selectedWidget,
  onWidgetSelect,
  editingScreen
}: LayoutCanvasProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedFromLibrary, setDraggedFromLibrary] = useState<string | null>(null);
  const [showCollisionWarning, setShowCollisionWarning] = useState(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [keyboardMovementEnabled, setKeyboardMovementEnabled] = useState(true);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; widgetId: string } | null>(null);

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
    const dimensions = widget ? { w: widget.w, h: widget.h } : { w: 4, h: 4 };
    
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

  // Keyboard movement handler
  const moveWidgetWithKeyboard = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!selectedWidget || !keyboardMovementEnabled) return;

    const selectedItem = layout.find(item => item.i === selectedWidget);
    if (!selectedItem) return;

    const step = 1; // Move by 1 grid cell
    let newX = selectedItem.x;
    let newY = selectedItem.y;

    switch (direction) {
      case 'up':
        newY = Math.max(0, selectedItem.y - step);
        break;
      case 'down':
        newY = Math.min(18 - selectedItem.h, selectedItem.y + step);
        break;
      case 'left':
        newX = Math.max(0, selectedItem.x - step);
        break;
      case 'right':
        newX = Math.min(32 - selectedItem.w, selectedItem.x + step);
        break;
    }

    // Check for collisions
    const isCollision = layout.some(item => {
      if (item.i === selectedWidget) return false;
      
      return (
        newX < item.x + item.w &&
        newX + selectedItem.w > item.x &&
        newY < item.y + item.h &&
        newY + selectedItem.h > item.y
      );
    });

    if (isCollision) {
      // Show collision warning
      setShowCollisionWarning(true);
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = setTimeout(() => {
        setShowCollisionWarning(false);
      }, 1500);
      return;
    }

    // Update layout
    const updatedLayout = layout.map(item => {
      if (item.i === selectedWidget) {
        return {
          ...item,
          x: newX,
          y: newY
        };
      }
      return item;
    });

    onLayoutChange(updatedLayout);

    // Add keyboard move animation
    const widgetElement = document.querySelector(`[data-widget-id="${selectedWidget}"]`);
    if (widgetElement) {
      widgetElement.classList.add('widget-keyboard-move');
      setTimeout(() => {
        widgetElement.classList.remove('widget-keyboard-move');
      }, 200);
    }
  }, [selectedWidget, layout, onLayoutChange, keyboardMovementEnabled]);

  // Keyboard event handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!selectedWidget) return;

    // Check if we're in an input field or textarea
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.contentEditable === 'true'
    )) {
      return;
    }

    // Handle arrow keys for movement
    if (keyboardMovementEnabled && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      
      switch (e.key) {
        case 'ArrowUp':
          moveWidgetWithKeyboard('up');
          break;
        case 'ArrowDown':
          moveWidgetWithKeyboard('down');
          break;
        case 'ArrowLeft':
          moveWidgetWithKeyboard('left');
          break;
        case 'ArrowRight':
          moveWidgetWithKeyboard('right');
          break;
      }
      return;
    }

    // Handle other keyboard shortcuts
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      
      // Delete selected widget
      const updatedLayout = layout.filter(item => item.i !== selectedWidget);
      onLayoutChange(updatedLayout);
      
      // Clear selection
      onWidgetSelect('');
      
      // Show deletion feedback
      setShowCollisionWarning(true);
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = setTimeout(() => {
        setShowCollisionWarning(false);
      }, 1000);
    }

    // Handle Escape key to deselect
    if (e.key === 'Escape') {
      e.preventDefault();
      onWidgetSelect('');
    }

    // Handle Ctrl+D for duplicate
    if (e.key === 'd' && e.ctrlKey) {
      e.preventDefault();
      
      const selectedItem = layout.find(item => item.i === selectedWidget);
      if (selectedItem) {
        const newWidget = {
          ...selectedItem,
          i: `widget-${Date.now()}`,
          x: Math.min(32 - selectedItem.w, selectedItem.x + 1), // Move slightly to the right
          y: Math.min(18 - selectedItem.h, selectedItem.y + 1) // Move slightly down
        };
        
        onLayoutChange([...layout, newWidget]);
        onWidgetSelect(newWidget.i);
        
        // Add entrance animation
        setTimeout(() => {
          const widgetElement = document.querySelector(`[data-widget-id="${newWidget.i}"]`);
          if (widgetElement) {
            widgetElement.classList.add('widget-entrance-animation');
            setTimeout(() => {
              widgetElement.classList.remove('widget-entrance-animation');
            }, 500);
          }
        }, 100);
      }
    }
  }, [selectedWidget, moveWidgetWithKeyboard, keyboardMovementEnabled, layout, onLayoutChange, onWidgetSelect]);

  // Set up keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
    };

    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [contextMenu]);

  // Context menu handler
  const handleWidgetRightClick = (e: React.MouseEvent, widgetId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      widgetId
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    
    // Only update isDragOver state if it's not already true
    if (!isDragOver) {
      setIsDragOver(true);
    }
    
    const draggedData = e.dataTransfer.getData('text/plain');
    e.dataTransfer.dropEffect = draggedData.startsWith('new-') ? 'copy' : 'move';
    
    // Check if dragging from library and set up drag state
    if (draggedData.startsWith('new-')) {
      const componentName = draggedData.replace('new-', '');
      
      // Only update draggedFromLibrary if it's different
      if (draggedFromLibrary !== componentName) {
        setDraggedFromLibrary(componentName);
      }
      
      // Set up drag state with correct dimensions if not already dragging
      if (!dragState.isDragging) {
        const defaultDimensions = DefaultWidgetDimensions[componentName as keyof typeof DefaultWidgetDimensions] || { w: 4, h: 4 };
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
    const isStatic = isStaticWidget(item.component || '');
    
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
          left: `${(item.x / 32) * 100}%`,
          top: `${(item.y / 18) * 100}%`,
          width: `${(item.w / 32) * 100}%`,
          height: `${(item.h / 18) * 100}%`,
          cursor: isDraggingThis ? 'grabbing' : 'grab',
          zIndex: isSelected ? 10 : isDraggingThis ? 50 : 1
        }}
        draggable
        onDragStart={(e) => handleWidgetDragStart(e, item.i)}
        onDragEnd={handleWidgetDragEnd}
        onClick={() => onWidgetSelect(item.i)}
        onContextMenu={(e) => handleWidgetRightClick(e, item.i)}
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

        {/* Resize handles - only for non-static widgets */}
        {!isStatic && isSelected && (
          <>
            {/* Corner resize handles */}
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            
            {/* Edge resize handles */}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-n-resize opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-s-resize opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-w-resize opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-e-resize opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </>
        )}

        {/* Static widget indicator */}
        {isStatic && isSelected && (
          <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-lg">
            Static
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="canvas-container h-full">
      <div className="canvas-wrapper">
        <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-semibold text-white">Layout Canvas</h2>
          {editingScreen && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-lg">
              <span className="text-blue-400 text-sm">✏️</span>
              <span className="text-blue-300 text-sm font-medium">
                Editing: {editingScreen.name}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <span>32-column grid</span>
            <span>•</span>
            <span>{layout.length} widgets</span>
            {selectedWidget && (
              <>
                <span>•</span>
                <span className="text-blue-400">Selected</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setKeyboardMovementEnabled(!keyboardMovementEnabled)}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-200
                ${keyboardMovementEnabled 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }
              `}
              title={keyboardMovementEnabled ? 'Disable keyboard movement' : 'Enable keyboard movement'}
            >
              ⌨️ {keyboardMovementEnabled ? 'On' : 'Off'}
            </button>
            {selectedWidget && (
              <>
                <div className="h-6 w-px bg-slate-600"></div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const updatedLayout = layout.filter(item => item.i !== selectedWidget);
                      onLayoutChange(updatedLayout);
                      onWidgetSelect('');
                      
                      // Show deletion feedback
                      setShowCollisionWarning(true);
                      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
                      animationTimeoutRef.current = setTimeout(() => {
                        setShowCollisionWarning(false);
                      }, 1000);
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
                    title="Delete selected widget (Delete key)"
                  >
                    🗑️ Delete
                  </button>
                  <button
                    onClick={() => {
                      const selectedItem = layout.find(item => item.i === selectedWidget);
                      if (selectedItem) {
                        const newWidget = {
                          ...selectedItem,
                          i: `widget-${Date.now()}`,
                          x: Math.min(32 - selectedItem.w, selectedItem.x + 1),
                          y: Math.min(18 - selectedItem.h, selectedItem.y + 1)
                        };
                        
                        onLayoutChange([...layout, newWidget]);
                        onWidgetSelect(newWidget.i);
                        
                        // Add entrance animation
                        setTimeout(() => {
                          const widgetElement = document.querySelector(`[data-widget-id="${newWidget.i}"]`);
                          if (widgetElement) {
                            widgetElement.classList.add('widget-entrance-animation');
                            setTimeout(() => {
                              widgetElement.classList.remove('widget-entrance-animation');
                            }, 500);
                          }
                        }, 100);
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors duration-200"
                    title="Duplicate selected widget (Ctrl+D)"
                  >
                    📋 Duplicate
                  </button>
                  <button
                    onClick={() => onWidgetSelect('')}
                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-600 text-white hover:bg-slate-700 transition-colors duration-200"
                    title="Deselect widget (Escape key)"
                  >
                    ✕ Deselect
                  </button>
                </div>
                <div className="text-xs text-slate-500">
                  Use arrow keys to move
                </div>
              </>
            )}
          </div>
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
        style={{ 
          width: '100%',
          height: '100%',
          aspectRatio: '16/9'
        }}
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
          {[...Array(33)].map((_, i) => (
            <div
              key={`v-${i}`}
              className="grid-line-vertical bg-blue-400/30 w-px"
              style={{ left: `${(i / 32) * 100}%` }}
            />
          ))}
          {[...Array(19)].map((_, i) => (
            <div
              key={`h-${i}`}
              className="grid-line-horizontal bg-blue-400/30 h-px"
              style={{ top: `${(i / 18) * 100}%` }}
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
              <span className="font-medium">Cannot move widget - collision detected!</span>
            </div>
          </div>
        )}

        {/* Context Menu */}
        {contextMenu && (
          <div
            className="fixed bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50 py-1 min-w-[160px]"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                onWidgetSelect(contextMenu.widgetId);
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-700 transition-colors duration-150 flex items-center space-x-2"
            >
              <span>✓</span>
              <span>Select</span>
            </button>
            <button
              onClick={() => {
                const selectedItem = layout.find(item => item.i === contextMenu.widgetId);
                if (selectedItem) {
                  const newWidget = {
                    ...selectedItem,
                    i: `widget-${Date.now()}`,
                    x: Math.min(32 - selectedItem.w, selectedItem.x + 1),
                    y: Math.min(18 - selectedItem.h, selectedItem.y + 1)
                  };
                  
                  onLayoutChange([...layout, newWidget]);
                  onWidgetSelect(newWidget.i);
                  
                  // Add entrance animation
                  setTimeout(() => {
                    const widgetElement = document.querySelector(`[data-widget-id="${newWidget.i}"]`);
                    if (widgetElement) {
                      widgetElement.classList.add('widget-entrance-animation');
                      setTimeout(() => {
                        widgetElement.classList.remove('widget-entrance-animation');
                      }, 500);
                    }
                  }, 100);
                }
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-700 transition-colors duration-150 flex items-center space-x-2"
            >
              <span>📋</span>
              <span>Duplicate</span>
            </button>
            <div className="h-px bg-slate-600 my-1"></div>
            <button
              onClick={() => {
                const updatedLayout = layout.filter(item => item.i !== contextMenu.widgetId);
                onLayoutChange(updatedLayout);
                onWidgetSelect('');
                
                // Show deletion feedback
                setShowCollisionWarning(true);
                if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
                animationTimeoutRef.current = setTimeout(() => {
                  setShowCollisionWarning(false);
                }, 1000);
                
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-900/20 transition-colors duration-150 flex items-center space-x-2"
            >
              <span>🗑️</span>
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
