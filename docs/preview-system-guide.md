# Real-time Preview System Documentation

## 🎯 Overview

The Real-time Preview System is a comprehensive live visualization tool that provides accurate, multi-viewport previews of digital signage layouts with automatic updates and device-specific scaling.

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────┐
│           Preview System                │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐ │
│  │        Preview Toolbar              │ │
│  │  [Desktop] [Tablet] [Mobile] [🔄]   │ │
│  └─────────────────────────────────────┘ │
│  ┌─────────────────────────────────────┐ │
│  │        Preview Viewport             │ │
│  │  ┌─────────────────────────────┐    │ │
│  │  │     Scaled Content Area     │    │ │
│  │  │   [Widget1] [Widget2]       │    │ │
│  │  │   [Widget3] [Widget4]       │    │ │
│  │  └─────────────────────────────┘    │ │
│  └─────────────────────────────────────┘ │
│  ┌─────────────────────────────────────┐ │
│  │       Status Bar                    │ │
│  │  Last updated: 14:30:25             │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## 📱 Viewport System

### Viewport Configurations

**File:** `server/src/app/components/PreviewSystem.tsx`

```tsx
const viewportConfigs: Record<ViewportSize, ViewportConfig> = {
  desktop: {
    name: 'Desktop',
    icon: '🖥️',
    width: 1920,      // Full HD resolution
    height: 1080,     // 16:9 aspect ratio
    scale: 1          // 100% scale
  },
  tablet: {
    name: 'Tablet',
    icon: '📱',
    width: 1024,      // iPad landscape
    height: 768,      // 4:3 aspect ratio
    scale: 0.8        // 80% scale for fitting
  },
  mobile: {
    name: 'Mobile',
    icon: '📱',
    width: 375,       // iPhone viewport
    height: 667,      // 16:9 mobile aspect
    scale: 0.6        // 60% scale for visibility
  }
};
```

### Viewport Switching Logic

```tsx
const handleViewportChange = (size: ViewportSize) => {
  setViewportSize(size);
  
  // Trigger re-render with new viewport configuration
  const config = viewportConfigs[size];
  
  // Update preview container dimensions
  updatePreviewDimensions(config);
  
  // Recalculate widget positions and scaling
  recalculateWidgetLayout(config);
};
```

## 🔄 Real-time Update System

### Auto-refresh Mechanism

```tsx
// Auto-refresh every 30 seconds for live data widgets
useEffect(() => {
  intervalRef.current = setInterval(() => {
    setLastUpdate(Date.now());
    
    // Force re-render of all widgets with live data
    triggerWidgetRefresh();
  }, 30000);

  return () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
}, []);
```

### Layout Change Detection

```tsx
// Update when layout changes
useEffect(() => {
  setLastUpdate(Date.now());
  
  // Animate layout changes
  animateLayoutTransition();
  
  // Update preview immediately
  updatePreviewLayout(layout);
}, [layout]);
```

### Manual Refresh System

```tsx
const handleRefresh = () => {
  setIsRefreshing(true);
  setLastUpdate(Date.now());
  
  // Refresh all widgets
  layout.forEach(widget => {
    refreshWidget(widget.i);
  });
  
  // Visual feedback animation
  setTimeout(() => {
    setIsRefreshing(false);
  }, 1000);
};
```

## 🎨 Widget Rendering in Preview

### Responsive Widget Positioning

```tsx
const renderPreviewWidget = (item: LayoutItem) => {
  const config = viewportConfigs[viewportSize];
  const isSelected = selectedWidget === item.i;
  
  // Calculate responsive positioning
  const gridWidth = config.width;
  const gridHeight = config.height;
  const cellWidth = gridWidth / 12;
  const cellHeight = 60 * config.scale;
  
  // Widget positioning with scaling
  const widgetStyle = {
    position: 'absolute' as const,
    left: `${(item.x / 12) * 100}%`,
    top: `${item.y * cellHeight}px`,
    width: `${(item.w / 12) * 100}%`,
    height: `${item.h * cellHeight}px`,
    transform: `scale(${config.scale})`,
    transformOrigin: 'top left',
    zIndex: isSelected ? 10 : 1,
    transition: 'all 0.2s ease-in-out'
  };
  
  return (
    <div
      key={`${item.i}-${viewportSize}-${lastUpdate}`}
      className={`absolute transition-all duration-200 ${
        isSelected ? 'ring-2 ring-blue-400' : ''
      }`}
      style={widgetStyle}
      onClick={() => onWidgetSelect?.(item.i)}
    >
      <div className="w-full h-full overflow-hidden rounded-md">
        <WidgetComponent 
          {...widgetProps} 
          key={`${item.i}-${lastUpdate}`}
        />
      </div>
    </div>
  );
};
```

### Widget Lifecycle Management

```tsx
// Widget registration and cleanup
const WidgetManager = {
  register: (widgetId: string, component: React.ComponentType) => {
    activeWidgets.set(widgetId, {
      component,
      lastUpdate: Date.now(),
      refreshInterval: null
    });
  },
  
  unregister: (widgetId: string) => {
    const widget = activeWidgets.get(widgetId);
    if (widget?.refreshInterval) {
      clearInterval(widget.refreshInterval);
    }
    activeWidgets.delete(widgetId);
  },
  
  refresh: (widgetId: string) => {
    const widget = activeWidgets.get(widgetId);
    if (widget) {
      widget.lastUpdate = Date.now();
      forceUpdate();
    }
  }
};
```

## 🎛️ Preview Controls

### Viewport Size Controls

```tsx
// Responsive viewport controls
<div className="preview-controls">
  {(Object.keys(viewportConfigs) as ViewportSize[]).map((size) => (
    <button
      key={size}
      onClick={() => handleViewportChange(size)}
      className={`preview-size-button ${viewportSize === size ? 'active' : ''}`}
      title={`Switch to ${viewportConfigs[size].name} view`}
      aria-pressed={viewportSize === size}
    >
      <span className="mr-1" aria-hidden="true">
        {viewportConfigs[size].icon}
      </span>
      <span className="hidden sm:inline">
        {viewportConfigs[size].name}
      </span>
    </button>
  ))}
</div>
```

### Refresh Control

```tsx
// Manual refresh button with loading state
<button
  onClick={handleRefresh}
  disabled={isRefreshing}
  className={`preview-refresh ${isRefreshing ? 'animate-spin' : ''}`}
  title="Refresh preview"
  aria-label="Refresh preview content"
>
  🔄
</button>
```

## 🎨 Styling and Visual Effects

### Preview Container CSS

**File:** `server/src/app/globals.css`

```css
/* Main preview container */
.preview-container {
  @apply relative overflow-hidden rounded-lg border border-slate-600 bg-slate-900;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

/* Toolbar styling */
.preview-toolbar {
  @apply flex items-center justify-between p-3 bg-slate-800 border-b border-slate-700;
  backdrop-filter: blur(10px);
}

/* Viewport area with smooth transitions */
.preview-viewport {
  @apply relative bg-black transition-all duration-300 ease-in-out;
  border-radius: 8px;
  overflow: hidden;
}

/* Viewport size-specific styling */
.preview-viewport.desktop {
  @apply w-full aspect-video;
  max-width: 100%;
}

.preview-viewport.tablet {
  @apply w-3/4 mx-auto aspect-[4/3];
  border-radius: 12px; /* Tablet-like rounded corners */
}

.preview-viewport.mobile {
  @apply w-96 max-w-full mx-auto aspect-[9/16];
  border-radius: 20px; /* Phone-like rounded corners */
  border: 2px solid #374151; /* Phone bezel effect */
}
```

### Interactive Effects

```css
/* Hover overlay effect */
.preview-overlay {
  @apply absolute inset-0 pointer-events-none border-2 border-blue-500/50 rounded;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
  background: linear-gradient(45deg, transparent 49%, rgba(59, 130, 246, 0.1) 50%, transparent 51%);
}

.preview-container:hover .preview-overlay {
  opacity: 1;
}

/* Widget selection highlighting */
.preview-widget.selected {
  @apply ring-2 ring-blue-400 ring-offset-2 ring-offset-black;
  transform: scale(1.02);
  z-index: 10;
}

/* Loading animation */
.preview-refresh.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### Responsive Preview Adjustments

```css
/* Mobile preview adjustments */
@media (max-width: 768px) {
  .preview-toolbar {
    @apply flex-col space-y-2 items-stretch;
  }
  
  .preview-controls {
    @apply justify-center flex-wrap gap-2;
  }
  
  /* All viewports use full width on mobile */
  .preview-viewport.desktop,
  .preview-viewport.tablet,
  .preview-viewport.mobile {
    @apply w-full aspect-video;
    max-height: 50vh;
  }
}

@media (max-width: 1280px) {
  .preview-viewport.tablet {
    @apply w-full;
  }
  
  .preview-viewport.mobile {
    @apply w-80;
  }
}
```

## ⚡ Performance Optimizations

### Efficient Re-rendering

```tsx
// Memoized widget rendering to prevent unnecessary re-renders
const MemoizedPreviewWidget = memo(({ 
  widget, 
  viewport, 
  lastUpdate, 
  isSelected 
}) => {
  const WidgetComponent = WidgetRegistry[widget.component];
  
  return (
    <div className={`preview-widget ${isSelected ? 'selected' : ''}`}>
      <WidgetComponent {...widget.props} />
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for optimal re-renders
  return (
    prevProps.widget.i === nextProps.widget.i &&
    prevProps.viewport === nextProps.viewport &&
    prevProps.lastUpdate === nextProps.lastUpdate &&
    prevProps.isSelected === nextProps.isSelected
  );
});
```

### Viewport Transition Optimization

```tsx
// Optimized viewport switching with requestAnimationFrame
const optimizedViewportChange = useCallback((newViewport: ViewportSize) => {
  // Batch DOM updates
  requestAnimationFrame(() => {
    setViewportSize(newViewport);
    
    // Defer heavy calculations
    setTimeout(() => {
      recalculateLayout(newViewport);
    }, 0);
  });
}, []);
```

### Memory Management

```tsx
// Cleanup intervals and event listeners
useEffect(() => {
  return () => {
    // Clear all widget refresh intervals
    activeWidgets.forEach((widget, id) => {
      if (widget.refreshInterval) {
        clearInterval(widget.refreshInterval);
      }
    });
    
    // Clear main refresh interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Clear any pending timeouts
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
  };
}, []);
```

## 🔗 Integration with Canvas Editor

### Synchronized Selection

```tsx
// Bidirectional selection synchronization
const handlePreviewWidgetClick = (widgetId: string) => {
  // Update preview selection
  setSelectedWidget(widgetId);
  
  // Notify parent component (canvas editor)
  onWidgetSelect?.(widgetId);
  
  // Scroll to widget in properties panel
  scrollToWidget(widgetId);
};
```

### Layout Synchronization

```tsx
// Real-time layout updates from canvas
useEffect(() => {
  if (layout !== previousLayout.current) {
    // Animate layout changes
    animateLayoutTransition(previousLayout.current, layout);
    
    // Update preview
    updatePreviewLayout(layout);
    
    // Store previous layout for comparison
    previousLayout.current = layout;
  }
}, [layout]);
```

## 🧪 Testing the Preview System

### Unit Tests

```tsx
// Preview system component tests
describe('PreviewSystem', () => {
  const mockProps = {
    layout: [
      { i: 'test-1', x: 0, y: 0, w: 2, h: 2, component: 'Weather' }
    ],
    selectedWidget: null,
    onWidgetSelect: jest.fn()
  };

  test('renders preview with correct viewport', () => {
    render(<PreviewSystem {...mockProps} />);
    
    expect(screen.getByText('Live Preview')).toBeInTheDocument();
    expect(screen.getByText('Desktop')).toBeInTheDocument();
    expect(screen.getByText('Tablet')).toBeInTheDocument();
    expect(screen.getByText('Mobile')).toBeInTheDocument();
  });

  test('switches viewport correctly', () => {
    render(<PreviewSystem {...mockProps} />);
    
    const tabletButton = screen.getByText('Tablet');
    fireEvent.click(tabletButton);
    
    expect(tabletButton).toHaveClass('active');
  });

  test('refreshes preview on button click', () => {
    render(<PreviewSystem {...mockProps} />);
    
    const refreshButton = screen.getByTitle('Refresh preview');
    fireEvent.click(refreshButton);
    
    expect(refreshButton).toHaveClass('animate-spin');
  });
});
```

### Integration Tests

```tsx
// Preview system integration tests
describe('PreviewSystem Integration', () => {
  test('synchronizes with canvas editor selection', () => {
    const onWidgetSelect = jest.fn();
    render(
      <PreviewSystem 
        layout={mockLayout}
        selectedWidget="widget-1"
        onWidgetSelect={onWidgetSelect}
      />
    );
    
    const widget = screen.getByTestId('preview-widget-1');
    fireEvent.click(widget);
    
    expect(onWidgetSelect).toHaveBeenCalledWith('widget-1');
  });

  test('updates preview when layout changes', () => {
    const { rerender } = render(
      <PreviewSystem layout={initialLayout} />
    );
    
    rerender(<PreviewSystem layout={updatedLayout} />);
    
    expect(screen.getByTestId('preview-widget-2')).toBeInTheDocument();
  });
});
```

## 📊 Performance Metrics

### Target Performance

- **Viewport Switch Time**: < 150ms
- **Widget Render Time**: < 100ms per widget
- **Layout Update Time**: < 50ms
- **Refresh Animation**: 60fps smooth animation
- **Memory Usage**: < 100MB for 50+ widgets

### Monitoring

```tsx
// Performance monitoring hooks
const usePreviewPerformance = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    layoutUpdateTime: 0,
    memoryUsage: 0
  });

  const measureRenderTime = useCallback((callback: () => void) => {
    const start = performance.now();
    callback();
    const end = performance.now();
    
    setMetrics(prev => ({
      ...prev,
      renderTime: end - start
    }));
  }, []);

  return { metrics, measureRenderTime };
};
```

## 🚀 Advanced Features

### Custom Viewport Presets

```tsx
// Extensible viewport system
const customViewports = {
  ultrawide: {
    name: 'Ultrawide',
    icon: '📺',
    width: 3440,
    height: 1440,
    scale: 0.3
  },
  square: {
    name: 'Square',
    icon: '⬜',
    width: 1080,
    height: 1080,
    scale: 0.7
  }
};

// Merge with default viewports
const allViewports = { ...viewportConfigs, ...customViewports };
```

### Preview Export

```tsx
// Export preview as image
const exportPreview = async () => {
  const canvas = await html2canvas(previewRef.current, {
    width: viewportConfigs[viewportSize].width,
    height: viewportConfigs[viewportSize].height,
    scale: 1
  });
  
  const link = document.createElement('a');
  link.download = `preview-${viewportSize}-${Date.now()}.png`;
  link.href = canvas.toDataURL();
  link.click();
};
```

This comprehensive documentation covers all aspects of the real-time preview system, providing developers with detailed information for maintenance, testing, and future enhancements.
