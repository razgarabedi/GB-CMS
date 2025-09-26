# Advanced Drag-and-Drop System Documentation

## 🎯 Overview

The Advanced Drag-and-Drop System provides a sophisticated, smooth, and intuitive interface for managing widgets in the GB-CMS Digital Signage System. This system includes collision detection, smart snapping, magnetic alignment, visual feedback, and accessibility features.

## 🏗️ System Architecture

### Core Components

```
┌─────────────────────────────────────────────────────┐
│              Advanced Drag-Drop System              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────┐  ┌─────────────────────────┐   │
│  │ DragDropSystem  │  │   Visual Feedback       │   │
│  │                 │  │                         │   │
│  │ • Collision     │  │ • Ghost Preview         │   │
│  │ • Smart Snap    │  │ • Snap Lines            │   │
│  │ • Grid Logic    │  │ • Drop Zones            │   │
│  └─────────────────┘  └─────────────────────────┘   │
│                                                     │
│  ┌─────────────────┐  ┌─────────────────────────┐   │
│  │ LayoutCanvas    │  │   ComponentLibrary      │   │
│  │                 │  │                         │   │
│  │ • Widget Render │  │ • Enhanced Cards        │   │
│  │ • Drop Handling │  │ • Drag Previews         │   │
│  │ • Animations    │  │ • Touch Support         │   │
│  └─────────────────┘  └─────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## 🔧 Core System (`DragDropSystem.tsx`)

### AdvancedDragDropManager Class

The central manager handles all drag-and-drop logic:

```tsx
class AdvancedDragDropManager {
  private config: DragDropConfig;
  private canvasRef: HTMLElement | null = null;
  private dropZones: Map<string, DropZone> = new Map();
  private occupiedCells: Set<string> = new Set();

  constructor(config: Partial<DragDropConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }
}
```

#### Configuration Options

```tsx
interface DragDropConfig {
  gridColumns: number;          // Grid system columns (default: 12)
  cellHeight: number;           // Height of each grid cell (default: 60px)
  snapThreshold: number;        // Snap sensitivity (default: 20px)
  animationDuration: number;    // Animation timing (default: 200ms)
  enableCollisionDetection: boolean;  // Collision detection (default: true)
  enableSmartSnapping: boolean;       // Smart positioning (default: true)
  showDropZones: boolean;             // Visual drop zones (default: true)
  showGhostPreview: boolean;          // Ghost preview (default: true)
}
```

#### Key Methods

**1. Collision Detection**
```tsx
findBestDropPosition(
  mouseX: number, 
  mouseY: number, 
  widgetWidth: number, 
  widgetHeight: number
): { x: number; y: number; isValid: boolean }
```

**2. Smart Snapping**
```tsx
private findNearbyValidPosition(
  x: number, 
  y: number, 
  w: number, 
  h: number
): { x: number; y: number } | null
```

**3. Drop Zone Management**
```tsx
updateDropZones(): void
updateOccupiedCells(layout: any[]): void
getDropZonesInRange(x: number, y: number, w: number, h: number): DropZone[]
```

### useAdvancedDragDrop Hook

Custom React hook that provides drag-and-drop functionality:

```tsx
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
```

#### Drag State Interface

```tsx
interface DragState {
  isDragging: boolean;
  draggedItem: string | null;
  dragType: 'new-widget' | 'existing-widget' | null;
  dragOffset: { x: number; y: number };
  currentPosition: { x: number; y: number };
  ghostPosition: { x: number; y: number };
  snapPosition: { x: number; y: number } | null;
  isValidDrop: boolean;
}
```

## 🎨 Visual Feedback System (`DragVisualFeedback.tsx`)

### DragGhost Component

Provides a floating preview that follows the cursor:

```tsx
<DragGhost dragState={dragState} canvasRef={canvasRef} />
```

**Features:**
- Smooth cursor following with 75ms update rate
- Contextual information (widget name, drag type)
- Fade-in/fade-out animations
- Responsive positioning

### SnapPreview Component

Shows where the widget will be placed:

```tsx
<SnapPreview dragState={dragState} canvasRef={canvasRef} />
```

**Features:**
- Green highlight for valid positions
- Red highlight for invalid positions
- Smooth scaling animations
- Real-time position updates

### MagneticSnapLines Component

Displays alignment guides when widgets align:

```tsx
<MagneticSnapLines dragState={dragState} layout={layout} canvasRef={canvasRef} />
```

**Features:**
- Vertical and horizontal alignment detection
- Animated snap lines with pulse effect
- 5-pixel snap threshold
- Automatic cleanup when drag ends

### CollisionOverlay Component

Highlights widgets that would collide:

```tsx
<CollisionOverlay
  layout={layout}
  draggedWidget={dragState.draggedItem}
  proposedPosition={proposedPosition}
/>
```

**Features:**
- Red overlay on conflicting widgets
- Collision warning labels
- Pulse animation for attention
- Real-time collision detection

## 🖱️ Enhanced Widget Interactions

### Widget Drag Handling

**Smooth Drag Initiation:**
```tsx
const handleWidgetDragStart = (e: React.DragEvent, widgetId: string) => {
  // Calculate precise drag offset
  const rect = e.currentTarget.getBoundingClientRect();
  const offset = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
  
  startDrag(e, widgetId, 'existing-widget', offset);
  e.currentTarget.classList.add('dragging-smooth');
};
```

**Enhanced Visual States:**
```tsx
className={`
  grid-item group relative transition-all duration-200 ease-out
  ${isSelected ? 'selected ring-2 ring-blue-400' : ''}
  ${isDraggingThis ? 'widget-dragging opacity-50 scale-95 z-50' : 'hover:scale-[1.02]'}
  ${!isDraggingThis && dragState.isDragging ? 'hover:shadow-blue-500/20' : ''}
`}
```

### Component Library Enhancements

**Enhanced Drag Previews:**
```tsx
const handleDragStart = (e: React.DragEvent, componentName: string, widget: any) => {
  // Create rich drag preview with icon and gradient
  const dragImage = document.createElement('div');
  dragImage.style.cssText = `
    background: linear-gradient(135deg, ${widget.color}, rgba(59, 130, 246, 0.9));
    border-radius: 12px;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  `;
  // ... enhanced styling
};
```

**Interactive Widget Cards:**
```tsx
<div className="group relative bg-slate-800 border border-slate-700 rounded-lg cursor-grab active:cursor-grabbing hover:bg-slate-700 hover:border-slate-600 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 hover:scale-[1.02] active:scale-95">
  {/* Enhanced hover effects */}
  <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
       style={{ 
         background: `linear-gradient(135deg, ${widget.color}0.1, transparent)`,
         boxShadow: `0 0 20px ${widget.color}0.2`
       }} />
</div>
```

## 🎭 Animation System

### CSS Keyframe Animations

**Library Drag Animation:**
```css
.dragging-from-library {
  animation: libraryDragPulse 0.6s ease-in-out infinite;
}

@keyframes libraryDragPulse {
  0%, 100% { transform: scale(0.95); opacity: 0.75; }
  50% { transform: scale(0.98); opacity: 0.9; }
}
```

**Widget Entrance Animation:**
```css
.widget-entrance-animation {
  animation: widgetEntrance 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes widgetEntrance {
  0% { transform: scale(0.8) translateY(-20px); opacity: 0; }
  50% { transform: scale(1.1) translateY(-5px); opacity: 0.8; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
```

**Smooth Drag Animation:**
```css
.dragging-smooth {
  animation: smoothDrag 0.3s ease-out;
}

@keyframes smoothDrag {
  0% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.05) rotate(2deg); }
  100% { transform: scale(1.02) rotate(0deg); }
}
```

### JavaScript Animations

**Entrance Animation Trigger:**
```tsx
// Add entrance animation after widget creation
setTimeout(() => {
  const widgetElement = document.querySelector(`[data-widget-id="${newWidget.i}"]`);
  if (widgetElement) {
    widgetElement.classList.add('widget-entrance-animation');
    setTimeout(() => {
      widgetElement.classList.remove('widget-entrance-animation');
    }, 500);
  }
}, 100);
```

## 📱 Touch and Mobile Support

### Touch-Optimized Interactions

**Touch-Friendly Cursors:**
```css
.widget-card {
  cursor: grab;
}

.widget-card:active {
  cursor: grabbing;
}
```

**Responsive Touch Targets:**
```css
@media (max-width: 768px) {
  .drag-indicator {
    min-width: 44px;
    min-height: 44px;
  }
}
```

**Touch Event Handling:**
```tsx
// Enhanced touch support in drag handlers
const handleTouchStart = (e: TouchEvent) => {
  const touch = e.touches[0];
  startDrag(e, widgetId, 'existing-widget', {
    x: touch.clientX,
    y: touch.clientY
  });
};
```

## ♿ Accessibility Features

### Keyboard Navigation

**Focus Management:**
```css
.grid-item:focus-visible,
.widget-card:focus-visible {
  @apply outline-none ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900;
}
```

**Keyboard Shortcuts:**
```tsx
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'Enter':
    case ' ':
      // Activate drag mode
      break;
    case 'Escape':
      // Cancel drag operation
      break;
    case 'ArrowUp':
    case 'ArrowDown':
    case 'ArrowLeft':
    case 'ArrowRight':
      // Move widget with keyboard
      break;
  }
};
```

### Screen Reader Support

**ARIA Labels:**
```tsx
<div
  role="button"
  tabIndex={0}
  aria-label={`Drag ${widget.name} widget to canvas`}
  aria-describedby={`widget-help-${widget.name}`}
>
  {/* Widget content */}
</div>
```

**Status Announcements:**
```tsx
// Announce drag state changes
const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};
```

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  .dragging-from-library,
  .dragging-smooth,
  .widget-entrance-animation,
  .widget-move-animation,
  .magnetic-snap-line,
  .drop-zone-highlight,
  .drag-preview-enhanced {
    animation: none !important;
  }
  
  .grid-item,
  .widget-card,
  .grid-canvas {
    transition: none !important;
  }
}
```

## 🚀 Performance Optimizations

### Hardware Acceleration

```css
.grid-item,
.widget-card,
.drag-preview-enhanced {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
  will-change: transform, box-shadow;
}
```

### Efficient Re-rendering

**RequestAnimationFrame Optimization:**
```tsx
const updateDragPosition = useCallback((x: number, y: number) => {
  if (animationFrameRef.current) {
    cancelAnimationFrame(animationFrameRef.current);
  }

  animationFrameRef.current = requestAnimationFrame(() => {
    updateDragPosition(x, y);
  });
}, []);
```

**Memoized Components:**
```tsx
const MemoizedWidget = memo(({ widget, dragState }) => {
  return <WidgetComponent {...widget} />;
}, (prevProps, nextProps) => {
  return (
    prevProps.widget.i === nextProps.widget.i &&
    prevProps.dragState.isDragging === nextProps.dragState.isDragging
  );
});
```

### Memory Management

```tsx
useEffect(() => {
  return () => {
    // Cleanup intervals and event listeners
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // Remove global event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
}, []);
```

## 🧪 Testing Strategies

### Unit Tests

```tsx
describe('AdvancedDragDropManager', () => {
  let manager: AdvancedDragDropManager;

  beforeEach(() => {
    manager = new AdvancedDragDropManager({
      enableCollisionDetection: true,
      enableSmartSnapping: true
    });
  });

  test('should detect collisions correctly', () => {
    const layout = [
      { i: 'widget1', x: 0, y: 0, w: 2, h: 2 }
    ];
    manager.updateOccupiedCells(layout);
    
    const position = manager.findBestDropPosition(50, 50, 2, 2);
    expect(position.isValid).toBe(false);
  });

  test('should find valid nearby positions', () => {
    const layout = [
      { i: 'widget1', x: 0, y: 0, w: 2, h: 2 }
    ];
    manager.updateOccupiedCells(layout);
    
    const position = manager.findBestDropPosition(100, 50, 2, 2);
    expect(position.isValid).toBe(true);
    expect(position.x).toBeGreaterThan(1);
  });
});
```

### Integration Tests

```tsx
describe('Drag and Drop Integration', () => {
  test('should complete full drag operation', () => {
    const onLayoutChange = jest.fn();
    render(
      <LayoutCanvas
        layout={[]}
        onLayoutChange={onLayoutChange}
        selectedWidget={null}
        onWidgetSelect={jest.fn()}
      />
    );

    // Simulate drag from library
    const libraryWidget = screen.getByText('Weather');
    fireEvent.dragStart(libraryWidget);
    
    // Simulate drop on canvas
    const canvas = screen.getByRole('region');
    fireEvent.dragOver(canvas);
    fireEvent.drop(canvas);

    expect(onLayoutChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          component: 'Weather'
        })
      ])
    );
  });
});
```

### Performance Tests

```tsx
describe('Performance', () => {
  test('should handle 50+ widgets without lag', () => {
    const startTime = performance.now();
    
    const layout = Array.from({ length: 50 }, (_, i) => ({
      i: `widget-${i}`,
      x: i % 12,
      y: Math.floor(i / 12),
      w: 1,
      h: 1,
      component: 'Test'
    }));

    render(
      <LayoutCanvas
        layout={layout}
        onLayoutChange={jest.fn()}
        selectedWidget={null}
        onWidgetSelect={jest.fn()}
      />
    );

    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(100); // Should render in < 100ms
  });
});
```

## 🎯 Best Practices

### Implementation Guidelines

1. **Always Use the Hook**: Use `useAdvancedDragDrop` instead of implementing custom logic
2. **Enable All Features**: Use collision detection and smart snapping for best UX
3. **Provide Visual Feedback**: Include all visual feedback components
4. **Handle Edge Cases**: Always check for null refs and invalid positions
5. **Optimize Performance**: Use memoization and requestAnimationFrame

### Common Patterns

**Basic Implementation:**
```tsx
const MyDragDropCanvas = () => {
  const {
    dragState,
    canvasRef,
    startDrag,
    endDrag
  } = useAdvancedDragDrop(layout, onLayoutChange);

  return (
    <div ref={canvasRef} className="canvas">
      {/* Visual feedback components */}
      <DragGhost dragState={dragState} canvasRef={canvasRef} />
      <SnapPreview dragState={dragState} canvasRef={canvasRef} />
      
      {/* Widget rendering */}
      {layout.map(renderWidget)}
    </div>
  );
};
```

**Custom Configuration:**
```tsx
const customConfig = {
  gridColumns: 16,
  cellHeight: 40,
  snapThreshold: 15,
  enableCollisionDetection: true,
  enableSmartSnapping: true
};

const { dragState, canvasRef } = useAdvancedDragDrop(
  layout, 
  onLayoutChange, 
  customConfig
);
```

This advanced drag-and-drop system provides a smooth, professional, and accessible user experience while maintaining high performance and extensive customization options.
