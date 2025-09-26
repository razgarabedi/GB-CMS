'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

// Advanced drag and drop types
export interface DragState {
  isDragging: boolean;
  draggedItem: string | null;
  dragType: 'new-widget' | 'existing-widget' | null;
  dragOffset: { x: number; y: number };
  currentPosition: { x: number; y: number };
  ghostPosition: { x: number; y: number };
  snapPosition: { x: number; y: number } | null;
  isValidDrop: boolean;
  draggedWidgetDimensions: { w: number; h: number } | null;
}

export interface DropZone {
  id: string;
  bounds: DOMRect;
  gridPosition: { x: number; y: number };
  occupied: boolean;
  canDrop: boolean;
}

export interface DragDropConfig {
  gridColumns: number;
  cellHeight: number;
  snapThreshold: number;
  animationDuration: number;
  enableCollisionDetection: boolean;
  enableSmartSnapping: boolean;
  showDropZones: boolean;
  showGhostPreview: boolean;
}

const defaultConfig: DragDropConfig = {
  gridColumns: 12,
  cellHeight: 60,
  snapThreshold: 20,
  animationDuration: 200,
  enableCollisionDetection: true,
  enableSmartSnapping: true,
  showDropZones: true,
  showGhostPreview: true
};

export class AdvancedDragDropManager {
  private config: DragDropConfig;
  private canvasRef: HTMLElement | null = null;
  private dropZones: Map<string, DropZone> = new Map();
  private occupiedCells: Set<string> = new Set();

  constructor(config: Partial<DragDropConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  setCanvas(element: HTMLElement) {
    this.canvasRef = element;
    this.updateDropZones();
  }

  updateDropZones() {
    if (!this.canvasRef) return;

    const bounds = this.canvasRef.getBoundingClientRect();
    const cellWidth = bounds.width / this.config.gridColumns;
    
    this.dropZones.clear();
    
    // Generate drop zones for each grid cell
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < this.config.gridColumns; x++) {
        const zoneId = `${x}-${y}`;
        const zoneBounds = new DOMRect(
          bounds.left + (x * cellWidth),
          bounds.top + (y * this.config.cellHeight),
          cellWidth,
          this.config.cellHeight
        );

        this.dropZones.set(zoneId, {
          id: zoneId,
          bounds: zoneBounds,
          gridPosition: { x, y },
          occupied: this.occupiedCells.has(zoneId),
          canDrop: true
        });
      }
    }
  }

  updateOccupiedCells(layout: any[]) {
    this.occupiedCells.clear();
    
    layout.forEach(item => {
      for (let y = item.y; y < item.y + item.h; y++) {
        for (let x = item.x; x < item.x + item.w; x++) {
          this.occupiedCells.add(`${x}-${y}`);
        }
      }
    });
    
    this.updateDropZones();
  }

  findBestDropPosition(
    mouseX: number, 
    mouseY: number, 
    widgetWidth: number, 
    widgetHeight: number
  ): { x: number; y: number; isValid: boolean } {
    if (!this.canvasRef) return { x: 0, y: 0, isValid: false };

    const bounds = this.canvasRef.getBoundingClientRect();
    const relativeX = mouseX - bounds.left;
    const relativeY = mouseY - bounds.top;
    
    // Calculate grid position
    const cellWidth = bounds.width / this.config.gridColumns;
    let gridX = Math.floor(relativeX / cellWidth);
    let gridY = Math.floor(relativeY / this.config.cellHeight);

    // Ensure within bounds
    gridX = Math.max(0, Math.min(gridX, this.config.gridColumns - widgetWidth));
    gridY = Math.max(0, gridY);

    // Check for collisions if enabled
    let isValid = true;
    if (this.config.enableCollisionDetection) {
      isValid = this.isPositionValid(gridX, gridY, widgetWidth, widgetHeight);
      
      // If invalid, try to find nearby valid position
      if (!isValid && this.config.enableSmartSnapping) {
        const nearbyPosition = this.findNearbyValidPosition(gridX, gridY, widgetWidth, widgetHeight);
        if (nearbyPosition) {
          gridX = nearbyPosition.x;
          gridY = nearbyPosition.y;
          isValid = true;
        }
      }
    }

    return { x: gridX, y: gridY, isValid };
  }

  private isPositionValid(x: number, y: number, w: number, h: number): boolean {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const cellId = `${x + dx}-${y + dy}`;
        if (this.occupiedCells.has(cellId)) {
          return false;
        }
      }
    }
    return true;
  }

  private findNearbyValidPosition(
    x: number, 
    y: number, 
    w: number, 
    h: number
  ): { x: number; y: number } | null {
    const searchRadius = 3;
    
    // Search in expanding circles
    for (let radius = 1; radius <= searchRadius; radius++) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const newX = x + dx;
          const newY = y + dy;
          
          if (newX >= 0 && newX <= this.config.gridColumns - w && newY >= 0) {
            if (this.isPositionValid(newX, newY, w, h)) {
              return { x: newX, y: newY };
            }
          }
        }
      }
    }
    
    return null;
  }

  getDropZonesInRange(x: number, y: number, w: number, h: number): DropZone[] {
    const zones: DropZone[] = [];
    
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const zoneId = `${x + dx}-${y + dy}`;
        const zone = this.dropZones.get(zoneId);
        if (zone) {
          zones.push(zone);
        }
      }
    }
    
    return zones;
  }
}

// Hook for using the advanced drag drop system
export function useAdvancedDragDrop(
  layout: any[],
  onLayoutChange: (layout: any[]) => void,
  config: Partial<DragDropConfig> = {}
) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedItem: null,
    dragType: null,
    dragOffset: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    ghostPosition: { x: 0, y: 0 },
    snapPosition: null,
    isValidDrop: false,
    draggedWidgetDimensions: null
  });

  const managerRef = useRef(new AdvancedDragDropManager(config));
  const canvasRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Update occupied cells when layout changes
  useEffect(() => {
    managerRef.current.updateOccupiedCells(layout);
  }, [layout]);

  // Set canvas reference
  useEffect(() => {
    if (canvasRef.current) {
      managerRef.current.setCanvas(canvasRef.current);
    }
  }, []);

  const startDrag = useCallback((
    e: React.DragEvent | React.MouseEvent,
    itemId: string,
    dragType: 'new-widget' | 'existing-widget',
    initialOffset?: { x: number; y: number },
    widgetDimensions?: { w: number; h: number }
  ) => {
    const clientX = 'clientX' in e ? e.clientX : 0;
    const clientY = 'clientY' in e ? e.clientY : 0;

    // Get widget dimensions from layout if it's an existing widget
    let dimensions = widgetDimensions;
    if (dragType === 'existing-widget' && !dimensions) {
      const widget = layout.find(item => item.i === itemId);
      dimensions = widget ? { w: widget.w, h: widget.h } : { w: 2, h: 2 };
    }

    setDragState({
      isDragging: true,
      draggedItem: itemId,
      dragType,
      dragOffset: initialOffset || { x: 0, y: 0 },
      currentPosition: { x: clientX, y: clientY },
      ghostPosition: { x: clientX, y: clientY },
      snapPosition: null,
      isValidDrop: false,
      draggedWidgetDimensions: dimensions || { w: 2, h: 2 }
    });

    // Set up mouse move listener for smooth tracking
    const handleMouseMove = (e: MouseEvent) => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        updateDragPosition(e.clientX, e.clientY);
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  const updateDragPosition = useCallback((x: number, y: number) => {
    setDragState(prev => {
      // Only update if position has actually changed (with small threshold to avoid micro-movements)
      const threshold = 2;
      const xDiff = Math.abs(prev.currentPosition.x - x);
      const yDiff = Math.abs(prev.currentPosition.y - y);
      
      if (xDiff < threshold && yDiff < threshold) {
        return prev;
      }
      
      const widgetWidth = prev.draggedWidgetDimensions?.w || 2;
      const widgetHeight = prev.draggedWidgetDimensions?.h || 2;
      
      const dropPosition = managerRef.current.findBestDropPosition(x, y, widgetWidth, widgetHeight);
      
      // Only update if snap position or validity has changed
      const snapChanged = !prev.snapPosition || 
        prev.snapPosition.x !== dropPosition.x || 
        prev.snapPosition.y !== dropPosition.y;
      const validityChanged = prev.isValidDrop !== dropPosition.isValid;
      
      if (!snapChanged && !validityChanged && xDiff < threshold && yDiff < threshold) {
        return prev;
      }
      
      return {
        ...prev,
        currentPosition: { x, y },
        ghostPosition: { x, y },
        snapPosition: dropPosition.isValid ? dropPosition : null,
        isValidDrop: dropPosition.isValid
      };
    });
  }, []);

  const endDrag = useCallback((e: React.DragEvent) => {
    if (!dragState.isDragging) return;

    const widgetWidth = dragState.draggedWidgetDimensions?.w || 2;
    const widgetHeight = dragState.draggedWidgetDimensions?.h || 2;

    const dropPosition = managerRef.current.findBestDropPosition(
      e.clientX,
      e.clientY,
      widgetWidth,
      widgetHeight
    );

    if (dropPosition.isValid && dragState.draggedItem) {
      if (dragState.dragType === 'new-widget') {
        // Add new widget
        const newWidget = {
          i: `widget-${Date.now()}`,
          x: dropPosition.x,
          y: dropPosition.y,
          w: widgetWidth,
          h: widgetHeight,
          component: dragState.draggedItem
        };
        onLayoutChange([...layout, newWidget]);
      } else {
        // Move existing widget
        const updatedLayout = layout.map(item => {
          if (item.i === dragState.draggedItem) {
            return {
              ...item,
              x: dropPosition.x,
              y: dropPosition.y
            };
          }
          return item;
        });
        onLayoutChange(updatedLayout);
      }
    }

    setDragState({
      isDragging: false,
      draggedItem: null,
      dragType: null,
      dragOffset: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      ghostPosition: { x: 0, y: 0 },
      snapPosition: null,
      isValidDrop: false,
      draggedWidgetDimensions: null
    });
  }, [dragState, layout, onLayoutChange]);

  return {
    dragState,
    canvasRef,
    startDrag,
    endDrag,
    updateDragPosition,
    manager: managerRef.current
  };
}
