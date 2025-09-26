'use client';

import { useState, useEffect } from 'react';
import { WidgetRegistry, DefaultWidgetProps } from './widgets';

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
  const [isDragging, setIsDragging] = useState(false);
  const [dragWidget, setDragWidget] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    setIsDragging(true);
    setDragWidget(widgetId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', widgetId);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragWidget(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    e.dataTransfer.dropEffect = e.dataTransfer.getData('text/plain').startsWith('new-') ? 'copy' : 'move';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only set drag over to false if we're leaving the canvas entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate grid position
    const gridX = Math.floor((x / rect.width) * 12);
    const gridY = Math.floor(y / 60);
    
    const draggedData = e.dataTransfer.getData('text/plain');
    
    if (draggedData.startsWith('new-')) {
      // New component from library
      const componentName = draggedData.replace('new-', '');
      const newWidget = {
        i: `widget-${Date.now()}`,
        x: Math.max(0, Math.min(gridX, 10)), // Ensure within bounds
        y: Math.max(0, gridY),
        w: 2,
        h: 2,
        component: componentName
      };
      onLayoutChange([...layout, newWidget]);
      
      // Auto-select the new widget
      setTimeout(() => {
        onWidgetSelect(newWidget.i);
      }, 100);
      
    } else {
      // Existing widget being moved
      const updatedLayout = layout.map(item => {
        if (item.i === draggedData) {
          return {
            ...item,
            x: Math.max(0, Math.min(gridX, 12 - item.w)),
            y: Math.max(0, gridY)
          };
        }
        return item;
      });
      onLayoutChange(updatedLayout);
    }
  };

  const renderWidget = (item: LayoutItem) => {
    const isSelected = selectedWidget === item.i;
    const isDraggingThis = dragWidget === item.i;
    
    // Get the widget component and props
    const WidgetComponent = WidgetRegistry[item.component as keyof typeof WidgetRegistry];
    const defaultProps = DefaultWidgetProps[item.component as keyof typeof DefaultWidgetProps] || {};
    const widgetProps = { ...defaultProps, ...(item.props || {}) };
    
    return (
      <div
        key={item.i}
        className={`grid-item ${isSelected ? 'selected' : ''} ${isDraggingThis ? 'widget-dragging' : ''}`}
        style={{
          position: 'absolute',
          left: `${(item.x / 12) * 100}%`,
          top: `${item.y * 60}px`,
          width: `${(item.w / 12) * 100}%`,
          height: `${item.h * 60}px`,
          cursor: 'pointer'
        }}
        draggable
        onDragStart={(e) => handleDragStart(e, item.i)}
        onDragEnd={handleDragEnd}
        onClick={() => onWidgetSelect(item.i)}
      >
        {WidgetComponent ? (
          <WidgetComponent {...(widgetProps as any)} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-2 bg-slate-700 text-white rounded">
            <div className="text-lg font-bold mb-1">{item.component}</div>
            <div className="text-xs opacity-75">Widget not found</div>
          </div>
        )}
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
        className={`grid-canvas relative ${isDragOver ? 'drag-over' : ''}`}
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
        
        {/* Enhanced Grid Guidelines */}
        <div className="grid-guidelines">
          {[...Array(13)].map((_, i) => (
            <div
              key={`v-${i}`}
              className="grid-line-vertical"
              style={{ left: `${(i / 12) * 100}%` }}
            />
          ))}
          {[...Array(11)].map((_, i) => (
            <div
              key={`h-${i}`}
              className="grid-line-horizontal"
              style={{ top: `${i * 60}px` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
