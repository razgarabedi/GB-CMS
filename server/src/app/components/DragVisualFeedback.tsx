'use client';

import { useEffect, useState } from 'react';
import { DragState, DropZone } from './DragDropSystem';

interface DragVisualFeedbackProps {
  dragState: DragState;
  dropZones?: DropZone[];
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

// Ghost preview component that follows the cursor
export function DragGhost({ dragState, canvasRef }: DragVisualFeedbackProps) {
  const [ghostPosition, setGhostPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (dragState.isDragging && canvasRef.current) {
      const canvasBounds = canvasRef.current.getBoundingClientRect();
      setGhostPosition({
        x: dragState.currentPosition.x - canvasBounds.left,
        y: dragState.currentPosition.y - canvasBounds.top
      });
    }
  }, [dragState.currentPosition, dragState.isDragging, canvasRef]);

  if (!dragState.isDragging) return null;

  return (
    <div
      className="absolute pointer-events-none z-50 transition-all duration-75 ease-out"
      style={{
        left: ghostPosition.x - 50,
        top: ghostPosition.y - 30,
        transform: 'scale(0.8)',
        opacity: 0.8
      }}
    >
      <div className="bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg border-2 border-blue-400">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-sm font-medium">
            {dragState.dragType === 'new-widget' ? 'Adding' : 'Moving'} {dragState.draggedItem}
          </span>
        </div>
      </div>
    </div>
  );
}

// Snap preview that shows where the widget will be placed
export function SnapPreview({ dragState, canvasRef }: DragVisualFeedbackProps) {
  const [previewStyle, setPreviewStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (dragState.isDragging && dragState.snapPosition && canvasRef.current) {
      const canvasBounds = canvasRef.current.getBoundingClientRect();
      const cellWidth = canvasBounds.width / 12;
      const cellHeight = 60;

      // Use actual widget dimensions from dragState
      const widgetWidth = dragState.draggedWidgetDimensions?.w || 2;
      const widgetHeight = dragState.draggedWidgetDimensions?.h || 2;

      setPreviewStyle({
        left: `${(dragState.snapPosition.x / 12) * 100}%`,
        top: `${dragState.snapPosition.y * cellHeight}px`,
        width: `${(widgetWidth / 12) * 100}%`,
        height: `${widgetHeight * cellHeight}px`,
        opacity: dragState.isValidDrop ? 0.7 : 0.3
      });
    }
  }, [dragState.snapPosition, dragState.isDragging, dragState.isValidDrop, dragState.draggedWidgetDimensions, canvasRef]);

  if (!dragState.isDragging || !dragState.snapPosition) return null;

  return (
    <div
      className={`absolute pointer-events-none rounded-lg border-2 transition-all duration-150 ease-out ${
        dragState.isValidDrop
          ? 'bg-green-500/20 border-green-400 shadow-lg'
          : 'bg-red-500/20 border-red-400'
      }`}
      style={previewStyle}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`text-xs font-medium px-2 py-1 rounded ${
          dragState.isValidDrop 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {dragState.isValidDrop ? '✓ Valid' : '✗ Invalid'}
        </div>
      </div>
    </div>
  );
}

// Drop zones visualization
export function DropZoneOverlay({ dragState, dropZones = [], canvasRef }: DragVisualFeedbackProps) {
  if (!dragState.isDragging || dropZones.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {dropZones.map((zone) => (
        <div
          key={zone.id}
          className={`absolute transition-all duration-150 ${
            zone.canDrop && !zone.occupied
              ? 'bg-blue-500/10 border border-blue-400/30'
              : 'bg-red-500/10 border border-red-400/30'
          }`}
          style={{
            left: `${(zone.gridPosition.x / 12) * 100}%`,
            top: `${zone.gridPosition.y * 60}px`,
            width: `${(1 / 12) * 100}%`,
            height: '60px'
          }}
        />
      ))}
    </div>
  );
}

// Enhanced drag cursor that changes based on drag state
export function DragCursor({ dragState }: { dragState: DragState }) {
  useEffect(() => {
    if (dragState.isDragging) {
      document.body.style.cursor = dragState.isValidDrop ? 'copy' : 'not-allowed';
    } else {
      document.body.style.cursor = 'default';
    }

    return () => {
      document.body.style.cursor = 'default';
    };
  }, [dragState.isDragging, dragState.isValidDrop]);

  return null;
}

// Animated drop zone highlights
export function DropZoneHighlight({ 
  isActive, 
  isValid, 
  position 
}: { 
  isActive: boolean; 
  isValid: boolean; 
  position: { x: number; y: number; w: number; h: number } 
}) {
  if (!isActive) return null;

  return (
    <div
      className={`absolute pointer-events-none rounded-lg transition-all duration-200 ${
        isValid 
          ? 'bg-gradient-to-br from-green-400/20 to-blue-400/20 border-2 border-green-400/50 shadow-lg animate-pulse'
          : 'bg-gradient-to-br from-red-400/20 to-orange-400/20 border-2 border-red-400/50'
      }`}
      style={{
        left: `${(position.x / 12) * 100}%`,
        top: `${position.y * 60}px`,
        width: `${(position.w / 12) * 100}%`,
        height: `${position.h * 60}px`,
        zIndex: 30
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`text-sm font-bold px-3 py-1 rounded-full ${
          isValid 
            ? 'bg-green-500 text-white shadow-lg'
            : 'bg-red-500 text-white'
        }`}>
          {isValid ? '✓ Drop Here' : '✗ Invalid'}
        </div>
      </div>
    </div>
  );
}

// Collision detection visualization
export function CollisionOverlay({ 
  layout, 
  draggedWidget, 
  proposedPosition 
}: { 
  layout: any[]; 
  draggedWidget: string | null; 
  proposedPosition: { x: number; y: number; w: number; h: number } | null 
}) {
  if (!proposedPosition || !draggedWidget) return null;

  const collisions = layout.filter(widget => {
    if (widget.i === draggedWidget) return false;
    
    return !(
      proposedPosition.x + proposedPosition.w <= widget.x ||
      widget.x + widget.w <= proposedPosition.x ||
      proposedPosition.y + proposedPosition.h <= widget.y ||
      widget.y + widget.h <= proposedPosition.y
    );
  });

  return (
    <>
      {collisions.map(widget => (
        <div
          key={`collision-${widget.i}`}
          className="absolute pointer-events-none bg-red-500/30 border-2 border-red-500 rounded-lg animate-pulse"
          style={{
            left: `${(widget.x / 12) * 100}%`,
            top: `${widget.y * 60}px`,
            width: `${(widget.w / 12) * 100}%`,
            height: `${widget.h * 60}px`,
            zIndex: 25
          }}
        >
          <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded">
            Collision!
          </div>
        </div>
      ))}
    </>
  );
}

// Magnetic snap lines that appear when widgets align
export function MagneticSnapLines({ 
  dragState, 
  layout, 
  canvasRef 
}: { 
  dragState: DragState; 
  layout: any[]; 
  canvasRef: React.RefObject<HTMLDivElement | null> 
}) {
  const [snapLines, setSnapLines] = useState<{
    vertical: number[];
    horizontal: number[];
  }>({ vertical: [], horizontal: [] });

  useEffect(() => {
    if (!dragState.isDragging || !dragState.snapPosition || !canvasRef.current) {
      setSnapLines({ vertical: [], horizontal: [] });
      return;
    }

    const vertical: number[] = [];
    const horizontal: number[] = [];
    const snapThreshold = 5; // pixels

    layout.forEach(widget => {
      if (widget.i === dragState.draggedItem) return;

      const canvasBounds = canvasRef.current!.getBoundingClientRect();
      const cellWidth = canvasBounds.width / 12;

      // Get actual widget dimensions
      const dragWidth = dragState.draggedWidgetDimensions?.w || 2;
      const dragHeight = dragState.draggedWidgetDimensions?.h || 2;

      // Check for vertical alignment
      const widgetLeft = widget.x * cellWidth;
      const widgetRight = (widget.x + widget.w) * cellWidth;
      const dragLeft = dragState.snapPosition!.x * cellWidth;
      const dragRight = (dragState.snapPosition!.x + dragWidth) * cellWidth;

      if (Math.abs(widgetLeft - dragLeft) < snapThreshold) {
        vertical.push(widgetLeft);
      }
      if (Math.abs(widgetRight - dragRight) < snapThreshold) {
        vertical.push(widgetRight);
      }

      // Check for horizontal alignment
      const widgetTop = widget.y * 60;
      const widgetBottom = (widget.y + widget.h) * 60;
      const dragTop = dragState.snapPosition!.y * 60;
      const dragBottom = (dragState.snapPosition!.y + dragHeight) * 60;

      if (Math.abs(widgetTop - dragTop) < snapThreshold) {
        horizontal.push(widgetTop);
      }
      if (Math.abs(widgetBottom - dragBottom) < snapThreshold) {
        horizontal.push(widgetBottom);
      }
    });

    setSnapLines({ vertical, horizontal });
  }, [dragState, layout, canvasRef]);

  if (!dragState.isDragging) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Vertical snap lines */}
      {snapLines.vertical.map((x, index) => (
        <div
          key={`v-${index}`}
          className="absolute bg-blue-400 opacity-75 animate-pulse"
          style={{
            left: x,
            top: 0,
            width: '2px',
            height: '100%',
            zIndex: 40
          }}
        />
      ))}
      
      {/* Horizontal snap lines */}
      {snapLines.horizontal.map((y, index) => (
        <div
          key={`h-${index}`}
          className="absolute bg-blue-400 opacity-75 animate-pulse"
          style={{
            left: 0,
            top: y,
            width: '100%',
            height: '2px',
            zIndex: 40
          }}
        />
      ))}
    </div>
  );
}
