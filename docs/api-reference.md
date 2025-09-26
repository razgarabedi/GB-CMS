# API Reference - Phase 4 Components

## PreviewSystem Component

### Props Interface

```tsx
interface PreviewSystemProps {
  layout: LayoutItem[];           // Array of widgets to preview
  selectedWidget?: string | null; // Currently selected widget ID
  onWidgetSelect?: (widgetId: string) => void; // Widget selection callback
}
```

### Layout Item Interface

```tsx
interface LayoutItem {
  i: string;                    // Unique widget identifier
  x: number;                    // Grid X position (0-11)
  y: number;                    // Grid Y position
  w: number;                    // Width in grid units (1-12)
  h: number;                    // Height in grid units
  component?: string;           // Widget component name
  props?: Record<string, any>;  // Widget-specific properties
}
```

### Viewport Configuration

```tsx
type ViewportSize = 'desktop' | 'tablet' | 'mobile';

interface ViewportConfig {
  name: string;    // Display name
  icon: string;    // Emoji icon
  width: number;   // Viewport width in pixels
  height: number;  // Viewport height in pixels
  scale: number;   // Scale factor for display
}
```

### Usage Example

```tsx
import PreviewSystem from './components/PreviewSystem';

function MyApp() {
  const [layout, setLayout] = useState([
    { i: 'widget-1', x: 0, y: 0, w: 2, h: 2, component: 'Weather' }
  ]);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);

  return (
    <PreviewSystem 
      layout={layout}
      selectedWidget={selectedWidget}
      onWidgetSelect={setSelectedWidget}
    />
  );
}
```

## Responsive Design Utilities

### CSS Classes Added

```css
/* Preview System */
.preview-container         /* Main preview container */
.preview-toolbar          /* Top toolbar with controls */
.preview-viewport         /* Scalable viewport area */
.preview-content          /* Content area with widgets */
.preview-overlay          /* Hover overlay effect */
.preview-controls         /* Viewport size buttons */
.preview-size-button      /* Individual size button */
.preview-refresh          /* Refresh button */

/* Responsive Breakpoints */
@media (max-width: 640px)  /* Mobile styles */
@media (max-width: 768px)  /* Tablet styles */
@media (max-width: 1024px) /* Small desktop styles */
@media (max-width: 1280px) /* Large desktop styles */
```

### Tailwind Classes Used

```tsx
// Responsive Layout
"flex flex-col lg:flex-row"           // Stack on mobile, row on desktop
"w-full lg:w-64"                      // Full width on mobile, fixed on desktop
"p-2 sm:p-4"                          // Smaller padding on mobile

// Responsive Text
"text-base sm:text-lg"                // Smaller text on mobile
"text-xs sm:text-sm"                  // Extra small text scaling

// Responsive Spacing
"space-x-2 sm:space-x-4"              // Smaller spacing on mobile
"gap-2 sm:gap-4"                      // Responsive gap

// Responsive Grid
"grid-cols-1 sm:grid-cols-2"          // Single column on mobile

// Responsive Display
"hidden sm:inline"                    // Hide on mobile, show on desktop
"sm:hidden"                           // Show on mobile, hide on desktop
```

## Component APIs

### ComponentLibrary Enhanced API

```tsx
interface ComponentLibraryProps {
  onWidgetAdd: (componentName: string) => void;
}

// Responsive features added:
// - Mobile-optimized widget cards
// - Touch-friendly drag handles
// - Compact descriptions on small screens
// - Responsive category headers
```

### PropertiesPanel Enhanced API

```tsx
interface PropertiesPanelProps {
  selectedWidget: string | null;
  layout: LayoutItem[];
  onLayoutChange: (layout: LayoutItem[]) => void;
}

// Responsive features added:
// - Single-column form layouts on mobile
// - Responsive input sizing
// - Touch-friendly form controls
// - Collapsible sections
```

### LayoutCanvas Enhanced API

```tsx
interface LayoutCanvasProps {
  layout: LayoutItem[];
  onLayoutChange: (layout: LayoutItem[]) => void;
  selectedWidget: string | null;
  onWidgetSelect: (widgetId: string) => void;
}

// Responsive features added:
// - Adaptive grid sizing
// - Touch-optimized drag and drop
// - Mobile-friendly widget selection
// - Responsive grid guidelines
```

## Responsive Hooks

### useViewport Hook (Custom)

```tsx
// Custom hook for viewport detection
function useViewport() {
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  
  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      if (width < 640) setViewport('mobile');
      else if (width < 1024) setViewport('tablet');
      else setViewport('desktop');
    };
    
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);
  
  return viewport;
}
```

### useResponsiveLayout Hook (Custom)

```tsx
// Hook for responsive layout calculations
function useResponsiveLayout(baseLayout: LayoutItem[], viewport: ViewportSize) {
  return useMemo(() => {
    switch (viewport) {
      case 'mobile':
        // Stack widgets vertically on mobile
        return baseLayout.map((item, index) => ({
          ...item,
          x: 0,
          y: index * item.h,
          w: 12
        }));
      case 'tablet':
        // Optimize for tablet layout
        return baseLayout.map(item => ({
          ...item,
          w: Math.min(item.w * 1.5, 12)
        }));
      default:
        return baseLayout;
    }
  }, [baseLayout, viewport]);
}
```

## Event Handlers

### Preview System Events

```tsx
// Viewport size change
const handleViewportChange = (size: ViewportSize) => {
  setViewportSize(size);
  // Triggers re-render with new scaling
};

// Manual refresh
const handleRefresh = () => {
  setIsRefreshing(true);
  setLastUpdate(Date.now());
  setTimeout(() => setIsRefreshing(false), 1000);
};

// Widget selection in preview
const handlePreviewWidgetClick = (widgetId: string) => {
  onWidgetSelect?.(widgetId);
  // Synchronizes selection with main canvas
};
```

### Responsive Event Handlers

```tsx
// Touch-friendly drag start
const handleTouchDragStart = (e: TouchEvent, widgetId: string) => {
  e.preventDefault();
  // Handle touch-specific drag logic
};

// Responsive resize handler
const handleResponsiveResize = useCallback(() => {
  // Debounced resize handler for performance
  const timeoutId = setTimeout(() => {
    updateLayout();
  }, 150);
  
  return () => clearTimeout(timeoutId);
}, [updateLayout]);
```

## Performance Optimizations

### Memoization

```tsx
// Memoized widget rendering
const MemoizedWidget = memo(({ widget, ...props }) => {
  return <WidgetComponent {...props} />;
}, (prevProps, nextProps) => {
  // Custom comparison for optimal re-renders
  return prevProps.widget.i === nextProps.widget.i &&
         prevProps.lastUpdate === nextProps.lastUpdate;
});
```

### Lazy Loading

```tsx
// Lazy load preview system
const PreviewSystem = lazy(() => import('./components/PreviewSystem'));

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <PreviewSystem {...props} />
</Suspense>
```

### Virtual Scrolling (for large widget lists)

```tsx
// Virtual scrolling for component library
const VirtualizedWidgetList = ({ widgets }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  
  // Only render visible widgets
  return widgets.slice(visibleRange.start, visibleRange.end).map(renderWidget);
};
```

## Testing Utilities

### Responsive Testing Helpers

```tsx
// Mock viewport size for testing
const mockViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  window.dispatchEvent(new Event('resize'));
};

// Test responsive behavior
test('should stack layout on mobile', () => {
  mockViewport(375, 667);
  render(<ResponsiveComponent />);
  // Assert mobile layout
});
```

### Preview System Testing

```tsx
// Mock preview system props
const mockPreviewProps = {
  layout: [
    { i: 'test-1', x: 0, y: 0, w: 2, h: 2, component: 'Weather' }
  ],
  selectedWidget: null,
  onWidgetSelect: jest.fn()
};

test('should render preview correctly', () => {
  render(<PreviewSystem {...mockPreviewProps} />);
  expect(screen.getByText('Live Preview')).toBeInTheDocument();
});
```

This API reference provides comprehensive documentation for all the new responsive and preview system components added in Phase 4.
