# Drag-and-Drop Implementation Examples

## 🎯 Quick Start Examples

### Basic Drag-and-Drop Canvas

```tsx
import React, { useState } from 'react';
import { useAdvancedDragDrop } from './components/DragDropSystem';
import { DragGhost, SnapPreview } from './components/DragVisualFeedback';

const BasicCanvas = () => {
  const [layout, setLayout] = useState([]);
  
  const {
    dragState,
    canvasRef,
    startDrag,
    endDrag
  } = useAdvancedDragDrop(layout, setLayout);

  return (
    <div 
      ref={canvasRef}
      className="relative w-full h-96 border-2 border-dashed border-gray-300 rounded-lg"
    >
      {/* Visual feedback */}
      <DragGhost dragState={dragState} canvasRef={canvasRef} />
      <SnapPreview dragState={dragState} canvasRef={canvasRef} />
      
      {/* Widgets */}
      {layout.map(widget => (
        <div
          key={widget.i}
          className="absolute bg-blue-500 text-white p-4 rounded"
          style={{
            left: `${(widget.x / 12) * 100}%`,
            top: `${widget.y * 60}px`,
            width: `${(widget.w / 12) * 100}%`,
            height: `${widget.h * 60}px`
          }}
          draggable
          onDragStart={(e) => startDrag(e, widget.i, 'existing-widget')}
          onDragEnd={endDrag}
        >
          {widget.component}
        </div>
      ))}
    </div>
  );
};
```

### Enhanced Widget Library

```tsx
const WidgetLibrary = ({ onAddWidget }) => {
  const widgets = [
    { name: 'Clock', icon: '🕐', color: 'bg-blue-600' },
    { name: 'Weather', icon: '🌤️', color: 'bg-green-600' },
    { name: 'News', icon: '📰', color: 'bg-red-600' }
  ];

  const handleDragStart = (e, widget) => {
    e.dataTransfer.setData('text/plain', `new-${widget.name}`);
    
    // Create enhanced drag image
    const dragImage = document.createElement('div');
    dragImage.style.cssText = `
      position: absolute;
      top: -1000px;
      background: linear-gradient(135deg, ${widget.color}, #3b82f6);
      color: white;
      padding: 12px 16px;
      border-radius: 12px;
      font-weight: 600;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    
    dragImage.innerHTML = `
      <span style="font-size: 18px">${widget.icon}</span>
      <span>+ ${widget.name}</span>
    `;
    
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 75, 30);
    
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  return (
    <div className="space-y-2">
      {widgets.map(widget => (
        <div
          key={widget.name}
          className="p-3 bg-slate-800 rounded-lg cursor-grab hover:bg-slate-700 transition-all duration-200 hover:scale-105"
          draggable
          onDragStart={(e) => handleDragStart(e, widget)}
          onClick={() => onAddWidget(widget.name)}
        >
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${widget.color} rounded-lg flex items-center justify-center text-white text-lg`}>
              {widget.icon}
            </div>
            <span className="text-white font-medium">{widget.name}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
```

## 🎨 Advanced Visual Feedback Examples

### Custom Drag Ghost

```tsx
const CustomDragGhost = ({ dragState, canvasRef }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (dragState.isDragging && canvasRef.current) {
      const bounds = canvasRef.current.getBoundingClientRect();
      setPosition({
        x: dragState.currentPosition.x - bounds.left,
        y: dragState.currentPosition.y - bounds.top
      });
    }
  }, [dragState.currentPosition, dragState.isDragging]);

  if (!dragState.isDragging) return null;

  return (
    <div
      className="absolute pointer-events-none z-50 transition-all duration-75"
      style={{
        left: position.x - 60,
        top: position.y - 40,
        transform: 'scale(0.9)',
        opacity: 0.9
      }}
    >
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-xl shadow-2xl border-2 border-white/20 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
          <div className="flex flex-col">
            <span className="text-sm font-bold">
              {dragState.dragType === 'new-widget' ? 'Adding' : 'Moving'}
            </span>
            <span className="text-xs opacity-90">{dragState.draggedItem}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### Smart Snap Preview

```tsx
const SmartSnapPreview = ({ dragState, canvasRef }) => {
  const [previewStyle, setPreviewStyle] = useState({});
  const [snapInfo, setSnapInfo] = useState(null);

  useEffect(() => {
    if (dragState.snapPosition && canvasRef.current) {
      const bounds = canvasRef.current.getBoundingClientRect();
      const cellWidth = bounds.width / 12;
      
      setPreviewStyle({
        left: `${(dragState.snapPosition.x / 12) * 100}%`,
        top: `${dragState.snapPosition.y * 60}px`,
        width: `${(2 / 12) * 100}%`,
        height: `${2 * 60}px`,
        opacity: dragState.isValidDrop ? 0.8 : 0.4
      });

      setSnapInfo({
        gridX: dragState.snapPosition.x,
        gridY: dragState.snapPosition.y,
        isValid: dragState.isValidDrop
      });
    }
  }, [dragState.snapPosition, dragState.isValidDrop]);

  if (!dragState.isDragging || !dragState.snapPosition) return null;

  return (
    <div
      className={`absolute pointer-events-none rounded-xl border-3 transition-all duration-200 ${
        dragState.isValidDrop
          ? 'bg-emerald-500/20 border-emerald-400 shadow-lg shadow-emerald-500/25'
          : 'bg-red-500/20 border-red-400 shadow-lg shadow-red-500/25'
      }`}
      style={previewStyle}
    >
      {/* Grid position indicator */}
      <div className="absolute -top-8 left-0 bg-slate-900 text-white text-xs px-2 py-1 rounded font-mono">
        {snapInfo?.gridX},{snapInfo?.gridY}
      </div>
      
      {/* Validity indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
          dragState.isValidDrop 
            ? 'bg-emerald-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {dragState.isValidDrop ? '✓ Valid Position' : '✗ Invalid Position'}
        </div>
      </div>
      
      {/* Corner indicators */}
      <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
    </div>
  );
};
```

## 🎯 Collision Detection Examples

### Advanced Collision Overlay

```tsx
const AdvancedCollisionOverlay = ({ layout, draggedWidget, proposedPosition }) => {
  const [collisions, setCollisions] = useState([]);
  const [collisionSeverity, setCollisionSeverity] = useState('none');

  useEffect(() => {
    if (!proposedPosition || !draggedWidget) {
      setCollisions([]);
      setCollisionSeverity('none');
      return;
    }

    const conflicts = layout.filter(widget => {
      if (widget.i === draggedWidget) return false;
      
      // Calculate overlap area
      const overlapX = Math.max(0, Math.min(
        proposedPosition.x + proposedPosition.w, 
        widget.x + widget.w
      ) - Math.max(proposedPosition.x, widget.x));
      
      const overlapY = Math.max(0, Math.min(
        proposedPosition.y + proposedPosition.h, 
        widget.y + widget.h
      ) - Math.max(proposedPosition.y, widget.y));

      const overlapArea = overlapX * overlapY;
      const totalArea = proposedPosition.w * proposedPosition.h;
      const overlapPercentage = (overlapArea / totalArea) * 100;

      if (overlapPercentage > 0) {
        widget.overlapPercentage = overlapPercentage;
        return true;
      }
      return false;
    });

    setCollisions(conflicts);
    
    // Determine severity
    const maxOverlap = Math.max(...conflicts.map(c => c.overlapPercentage || 0));
    if (maxOverlap > 75) setCollisionSeverity('severe');
    else if (maxOverlap > 25) setCollisionSeverity('moderate');
    else if (maxOverlap > 0) setCollisionSeverity('minor');
    else setCollisionSeverity('none');

  }, [layout, draggedWidget, proposedPosition]);

  return (
    <>
      {collisions.map(widget => (
        <div
          key={`collision-${widget.i}`}
          className={`absolute pointer-events-none rounded-lg border-2 ${
            collisionSeverity === 'severe' 
              ? 'bg-red-500/40 border-red-500 animate-pulse' 
              : collisionSeverity === 'moderate'
              ? 'bg-orange-500/30 border-orange-500 animate-bounce'
              : 'bg-yellow-500/20 border-yellow-500'
          }`}
          style={{
            left: `${(widget.x / 12) * 100}%`,
            top: `${widget.y * 60}px`,
            width: `${(widget.w / 12) * 100}%`,
            height: `${widget.h * 60}px`,
            zIndex: 30
          }}
        >
          {/* Collision severity indicator */}
          <div className={`absolute -top-6 left-0 px-2 py-1 rounded text-xs font-bold text-white ${
            collisionSeverity === 'severe' ? 'bg-red-500' :
            collisionSeverity === 'moderate' ? 'bg-orange-500' : 'bg-yellow-500'
          }`}>
            {Math.round(widget.overlapPercentage)}% overlap
          </div>
          
          {/* Collision icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-2xl">
              {collisionSeverity === 'severe' ? '🚫' : 
               collisionSeverity === 'moderate' ? '⚠️' : '⚡'}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};
```

## 🎨 Animation Examples

### Entrance Animation Variants

```tsx
const AnimationVariants = {
  // Bounce entrance
  bounceIn: {
    keyframes: `
      @keyframes bounceIn {
        0% { transform: scale(0.3) translateY(-50px); opacity: 0; }
        50% { transform: scale(1.1) translateY(-10px); opacity: 0.8; }
        70% { transform: scale(0.9) translateY(5px); opacity: 0.9; }
        100% { transform: scale(1) translateY(0); opacity: 1; }
      }
    `,
    className: 'animate-bounceIn',
    duration: '0.6s'
  },

  // Slide entrance
  slideIn: {
    keyframes: `
      @keyframes slideIn {
        0% { transform: translateX(-100px) scale(0.8); opacity: 0; }
        100% { transform: translateX(0) scale(1); opacity: 1; }
      }
    `,
    className: 'animate-slideIn',
    duration: '0.4s'
  },

  // Fade scale entrance
  fadeScale: {
    keyframes: `
      @keyframes fadeScale {
        0% { transform: scale(0.5); opacity: 0; filter: blur(10px); }
        100% { transform: scale(1); opacity: 1; filter: blur(0px); }
      }
    `,
    className: 'animate-fadeScale',
    duration: '0.5s'
  }
};

const AnimatedWidgetEntrance = ({ widget, animationType = 'bounceIn' }) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const animation = AnimationVariants[animationType];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, parseFloat(animation.duration) * 1000);

    return () => clearTimeout(timer);
  }, [animation.duration]);

  return (
    <div
      className={`widget ${isAnimating ? animation.className : ''}`}
      style={{
        animation: isAnimating ? `${animationType} ${animation.duration} cubic-bezier(0.68, -0.55, 0.265, 1.55)` : 'none'
      }}
    >
      {/* Widget content */}
    </div>
  );
};
```

### Magnetic Snap Lines with Physics

```tsx
const PhysicsMagneticLines = ({ dragState, layout, canvasRef }) => {
  const [snapLines, setSnapLines] = useState([]);
  const [magnetStrength, setMagnetStrength] = useState(0);

  useEffect(() => {
    if (!dragState.isDragging || !dragState.snapPosition) {
      setSnapLines([]);
      setMagnetStrength(0);
      return;
    }

    const lines = [];
    let maxMagnetism = 0;

    layout.forEach(widget => {
      if (widget.i === dragState.draggedItem) return;

      const distance = Math.abs(widget.x - dragState.snapPosition.x);
      if (distance <= 2) { // Within 2 grid units
        const magnetism = Math.max(0, 1 - (distance / 2));
        maxMagnetism = Math.max(maxMagnetism, magnetism);
        
        lines.push({
          type: 'vertical',
          position: widget.x,
          strength: magnetism,
          id: `v-${widget.i}`
        });
      }

      const verticalDistance = Math.abs(widget.y - dragState.snapPosition.y);
      if (verticalDistance <= 2) {
        const magnetism = Math.max(0, 1 - (verticalDistance / 2));
        maxMagnetism = Math.max(maxMagnetism, magnetism);
        
        lines.push({
          type: 'horizontal',
          position: widget.y,
          strength: magnetism,
          id: `h-${widget.i}`
        });
      }
    });

    setSnapLines(lines);
    setMagnetStrength(maxMagnetism);
  }, [dragState, layout]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {snapLines.map(line => (
        <div
          key={line.id}
          className={`absolute transition-all duration-200 ${
            line.type === 'vertical' ? 'w-0.5 h-full' : 'h-0.5 w-full'
          }`}
          style={{
            [line.type === 'vertical' ? 'left' : 'top']: 
              line.type === 'vertical' 
                ? `${(line.position / 12) * 100}%`
                : `${line.position * 60}px`,
            backgroundColor: `rgba(59, 130, 246, ${0.3 + (line.strength * 0.7)})`,
            boxShadow: `0 0 ${10 + (line.strength * 20)}px rgba(59, 130, 246, ${line.strength})`,
            transform: `scale(${0.5 + (line.strength * 0.5)})`,
            zIndex: 40
          }}
        >
          {/* Magnetic field indicator */}
          <div 
            className="absolute inset-0 animate-pulse"
            style={{
              backgroundColor: `rgba(59, 130, 246, ${line.strength * 0.2})`,
              width: line.type === 'vertical' ? '20px' : '100%',
              height: line.type === 'horizontal' ? '20px' : '100%',
              left: line.type === 'vertical' ? '-10px' : '0',
              top: line.type === 'horizontal' ? '-10px' : '0'
            }}
          />
        </div>
      ))}
      
      {/* Magnetism strength indicator */}
      {magnetStrength > 0.3 && (
        <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
          🧲 Magnetic Snap: {Math.round(magnetStrength * 100)}%
        </div>
      )}
    </div>
  );
};
```

## 🎯 Performance Optimization Examples

### Virtualized Large Layout

```tsx
const VirtualizedCanvas = ({ layout, onLayoutChange }) => {
  const [visibleWidgets, setVisibleWidgets] = useState([]);
  const [viewportBounds, setViewportBounds] = useState({ top: 0, bottom: 1000 });
  
  const canvasRef = useRef(null);
  
  // Update visible widgets based on viewport
  useEffect(() => {
    const updateVisibleWidgets = () => {
      if (!canvasRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const scrollTop = canvasRef.current.scrollTop;
      const viewportHeight = rect.height;
      
      const visible = layout.filter(widget => {
        const widgetTop = widget.y * 60;
        const widgetBottom = widgetTop + (widget.h * 60);
        
        return widgetBottom >= scrollTop && widgetTop <= scrollTop + viewportHeight;
      });
      
      setVisibleWidgets(visible);
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('scroll', updateVisibleWidgets);
      updateVisibleWidgets(); // Initial update
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('scroll', updateVisibleWidgets);
      }
    };
  }, [layout]);

  const {
    dragState,
    startDrag,
    endDrag
  } = useAdvancedDragDrop(layout, onLayoutChange, {
    enableCollisionDetection: true,
    enableSmartSnapping: true
  });

  return (
    <div 
      ref={canvasRef}
      className="relative w-full h-96 overflow-auto border border-gray-300"
      style={{ height: '600px' }}
    >
      {/* Render only visible widgets */}
      {visibleWidgets.map(widget => (
        <VirtualizedWidget
          key={widget.i}
          widget={widget}
          dragState={dragState}
          onDragStart={startDrag}
          onDragEnd={endDrag}
        />
      ))}
      
      {/* Placeholder for total height */}
      <div 
        style={{ 
          height: `${Math.max(...layout.map(w => (w.y + w.h) * 60))}px`,
          width: '1px',
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none'
        }} 
      />
    </div>
  );
};
```

### Debounced Drag Updates

```tsx
const useDebouncedDrag = (layout, onLayoutChange, delay = 100) => {
  const [pendingUpdates, setPendingUpdates] = useState([]);
  const timeoutRef = useRef(null);

  const debouncedUpdate = useCallback((updates) => {
    setPendingUpdates(prev => [...prev, ...updates]);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setPendingUpdates(current => {
        if (current.length > 0) {
          // Apply all pending updates
          const newLayout = layout.map(item => {
            const update = current.find(u => u.id === item.i);
            return update ? { ...item, ...update.changes } : item;
          });
          onLayoutChange(newLayout);
        }
        return [];
      });
    }, delay);
  }, [layout, onLayoutChange, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { debouncedUpdate, hasPendingUpdates: pendingUpdates.length > 0 };
};
```

These examples demonstrate the flexibility and power of the advanced drag-and-drop system, showing how to customize and extend it for various use cases while maintaining performance and user experience.
