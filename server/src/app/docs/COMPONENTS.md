# GB-CMS Component Library Documentation

## Overview

The GB-CMS Component Library is a comprehensive collection of React components that form the foundation of the digital signage management system. This document provides detailed information about each component, its props, usage, and implementation details.

## Core Components

### LayoutCanvas

The main workspace component for designing and managing digital signage layouts.

#### Props
```typescript
interface LayoutCanvasProps {
  layout: LayoutItem[];
  onLayoutChange: (layout: LayoutItem[]) => void;
  selectedWidget: string | null;
  onWidgetSelect: (widgetId: string | null) => void;
}
```

#### Features
- **Drag & Drop**: Drag widgets from library to canvas
- **Grid System**: 12-column responsive grid
- **Widget Management**: Select, move, resize widgets
- **Visual Feedback**: Highlight selected widgets
- **Responsive Layout**: Adapt to different screen sizes

#### Usage
```tsx
<LayoutCanvas
  layout={layout}
  onLayoutChange={setLayout}
  selectedWidget={selectedWidget}
  onWidgetSelect={setSelectedWidget}
/>
```

### ComponentLibrary

Widget selection and management interface.

#### Props
```typescript
interface ComponentLibraryProps {
  onWidgetAdd: (componentName: string) => void;
}
```

#### Features
- **Widget Categories**: Organized by type and function
- **Search & Filter**: Find widgets quickly
- **Widget Information**: Detailed widget descriptions
- **Visual Icons**: SVG icons for each widget
- **Size Indicators**: Show widget space requirements

#### Widget Categories
- **Content**: Text, images, videos, slideshows
- **Data**: Weather, news, charts, feeds
- **Interactive**: QR codes, web viewers, social feeds
- **Media**: Audio, streams, galleries, calendars

### PropertiesPanel

Widget configuration and property management interface.

#### Props
```typescript
interface PropertiesPanelProps {
  selectedWidget: string | null;
  layout: LayoutItem[];
  onLayoutChange: (layout: LayoutItem[]) => void;
}
```

#### Features
- **Property Forms**: Dynamic form generation
- **Visual Editor**: Advanced styling controls
- **Real-time Preview**: Live property updates
- **Validation**: Input validation and error handling
- **Presets**: Predefined property configurations

### PreviewSystem

Live preview with device simulation and responsive testing.

#### Props
```typescript
interface PreviewSystemProps {
  layout: LayoutItem[];
  selectedWidget: string | null;
  onWidgetSelect: (widgetId: string | null) => void;
}
```

#### Features
- **Device Simulation**: Test on different screen sizes
- **Responsive Preview**: See how layouts adapt
- **Comparison Mode**: Side-by-side comparison
- **Zoom Controls**: Detailed inspection
- **Grid & Rulers**: Precise measurement tools

#### Device Breakpoints
- **Desktop**: 1920x1080 (Full HD)
- **Laptop**: 1366x768 (HD)
- **Tablet**: 768x1024 (Portrait)
- **Mobile**: 375x667 (Portrait)
- **Custom**: User-defined dimensions

## Widget Components

### ClockWidget

Displays current time and date with various formatting options.

#### Props
```typescript
interface ClockWidgetProps {
  timezone?: string;
  format?: '12-hour' | '24-hour';
  size?: 'small' | 'medium' | 'large';
  type?: 'digital' | 'analog';
}
```

#### Features
- **Multiple Formats**: 12-hour and 24-hour formats
- **Timezone Support**: Display different timezones
- **Analog/Digital**: Choose display type
- **Size Options**: Small, medium, large sizes
- **Real-time Updates**: Automatic time updates

#### Usage
```tsx
<ClockWidget
  timezone="America/New_York"
  format="12-hour"
  size="large"
  type="digital"
/>
```

### WeatherWidget

Displays weather information with animated backgrounds.

#### Props
```typescript
interface WeatherWidgetProps {
  location?: string;
  showClock?: boolean;
  showAnimatedBg?: boolean;
  theme?: 'light' | 'dark';
}
```

#### Features
- **Location-based**: Weather for specific locations
- **Animated Backgrounds**: Weather-based animations
- **Clock Integration**: Optional time display
- **Theme Support**: Light and dark themes
- **Real-time Data**: Live weather updates

#### Usage
```tsx
<WeatherWidget
  location="New York"
  showClock={true}
  showAnimatedBg={true}
  theme="dark"
/>
```

### NewsWidget

Displays news feeds and RSS content.

#### Props
```typescript
interface NewsWidgetProps {
  feedUrl?: string;
  maxItems?: number;
  showImages?: boolean;
  autoScroll?: boolean;
  scrollSpeed?: number;
}
```

#### Features
- **RSS Feeds**: Support for RSS and Atom feeds
- **Image Support**: Display news images
- **Auto-scroll**: Automatic content scrolling
- **Customizable**: Various display options
- **Real-time Updates**: Live feed updates

#### Usage
```tsx
<NewsWidget
  feedUrl="https://example.com/rss"
  maxItems={5}
  showImages={true}
  autoScroll={true}
  scrollSpeed={3000}
/>
```

## Help System Components

### OnboardingSystem

Interactive user onboarding and guided tours.

#### Props
```typescript
interface OnboardingSystemProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}
```

#### Features
- **Step-by-step Guidance**: Interactive tour steps
- **Visual Highlights**: Highlight interface elements
- **Progress Tracking**: Show tour progress
- **Skip Options**: Skip steps or entire tour
- **Responsive Positioning**: Smart positioning system

#### Tour Steps
1. **Welcome**: Introduction to GB-CMS
2. **Layout Canvas**: Main workspace overview
3. **Component Library**: Widget selection
4. **Properties Panel**: Widget configuration
5. **Preview System**: Live preview
6. **Templates**: Template management
7. **Plugins**: Plugin system
8. **Help**: Help and support

### HelpSystem

Comprehensive help documentation and search.

#### Props
```typescript
interface HelpSystemProps {
  isOpen: boolean;
  onClose: () => void;
}
```

#### Features
- **Search Functionality**: Search help content
- **Category Navigation**: Browse by topic
- **Contextual Help**: Relevant help content
- **Video Tutorials**: Embedded video help
- **Interactive Examples**: Hands-on examples

#### Help Categories
- **Getting Started**: Basic usage guide
- **Features**: Detailed feature explanations
- **Tutorials**: Step-by-step tutorials
- **FAQ**: Frequently asked questions
- **Troubleshooting**: Common issues and solutions

### TutorialSystem

Interactive tutorials and hands-on learning.

#### Props
```typescript
interface TutorialSystemProps {
  isOpen: boolean;
  onClose: () => void;
  tutorialId?: string;
}
```

#### Features
- **Interactive Steps**: Guided tutorials
- **Progress Tracking**: Track tutorial progress
- **Completion Rewards**: Tutorial completion certificates
- **Hands-on Practice**: Interactive learning
- **Multiple Tutorials**: Various tutorial topics

#### Tutorial Topics
- **Basic Usage**: Essential features
- **Advanced Features**: Complex functionality
- **Widget Creation**: Creating custom widgets
- **Template Design**: Template creation
- **Plugin Development**: Plugin creation

### TooltipSystem

Contextual tooltips and inline help.

#### Props
```typescript
interface TooltipSystemProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}
```

#### Features
- **Contextual Help**: Relevant help content
- **Positioning**: Smart positioning system
- **Delay Options**: Configurable delay
- **Rich Content**: Support for HTML content
- **Accessibility**: Screen reader support

## Utility Components

### DragDropSystem

Handles drag and drop functionality throughout the application.

#### Features
- **Widget Dragging**: Drag widgets from library
- **Visual Feedback**: Drag preview and drop zones
- **Grid Snapping**: Snap to grid positions
- **Validation**: Validate drop operations
- **Accessibility**: Keyboard navigation support

### VisualPropertyEditor

Advanced visual styling controls for widgets.

#### Features
- **Color Pickers**: Background, text, and accent colors
- **Typography**: Font family, size, weight, alignment
- **Spacing**: Padding, margin, border controls
- **Effects**: Shadows, opacity, blur, animations
- **Real-time Preview**: Live property updates

#### Color Controls
- **Background Color**: Widget background
- **Text Color**: Text color
- **Border Color**: Border color
- **Accent Color**: Accent color for highlights

#### Typography Controls
- **Font Family**: Text font selection
- **Font Size**: Text size
- **Font Weight**: Bold, normal, light
- **Text Alignment**: Left, center, right, justify

#### Spacing Controls
- **Padding**: Internal spacing
- **Margin**: External spacing
- **Border Width**: Border thickness
- **Border Radius**: Corner rounding

## Component Patterns

### LayoutItem Interface

Standard interface for layout items across the system.

```typescript
interface LayoutItem {
  i: string;                    // Unique identifier
  x: number;                    // X position
  y: number;                    // Y position
  w: number;                    // Width
  h: number;                    // Height
  component?: string;           // Component type
  props?: Record<string, any>;  // Component properties
}
```

### Widget Props Interface

Standard interface for widget properties.

```typescript
interface WidgetProps {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  [key: string]: any;
}
```

### Component State Management

Components use React hooks for state management:

- **useState**: Local component state
- **useEffect**: Side effects and lifecycle
- **useCallback**: Memoized event handlers
- **useMemo**: Memoized calculations
- **useRef**: DOM references

## Styling and Theming

### CSS Classes

Components use Tailwind CSS for styling:

- **Utility Classes**: Tailwind utility classes
- **Custom Classes**: Component-specific styles
- **Responsive Classes**: Mobile-first responsive design
- **Dark Mode**: Dark theme support

### Theme System

- **Color Palette**: Consistent color scheme
- **Typography**: Font family and sizing
- **Spacing**: Consistent spacing scale
- **Shadows**: Elevation and depth
- **Animations**: Smooth transitions

## Performance Considerations

### Optimization Techniques

- **React.memo**: Prevent unnecessary re-renders
- **useMemo**: Memoize expensive calculations
- **useCallback**: Memoize event handlers
- **Lazy Loading**: Load components on demand
- **Code Splitting**: Split code by features

### Memory Management

- **Cleanup**: Proper cleanup in useEffect
- **Event Listeners**: Remove listeners on unmount
- **Timers**: Clear intervals and timeouts
- **References**: Avoid memory leaks

## Accessibility

### ARIA Support

- **Labels**: Proper labeling for screen readers
- **Roles**: Semantic HTML roles
- **States**: Component state announcements
- **Navigation**: Keyboard navigation support

### Keyboard Navigation

- **Tab Order**: Logical tab sequence
- **Arrow Keys**: Navigation within components
- **Enter/Space**: Activate interactive elements
- **Escape**: Cancel or close modals

## Testing

### Component Testing

- **Unit Tests**: Individual component testing
- **Integration Tests**: Component interaction testing
- **Visual Regression**: UI consistency testing
- **Accessibility Tests**: Screen reader compatibility

### Test Utilities

- **Render Helpers**: Custom render functions
- **Mock Data**: Test data generation
- **Event Simulation**: User interaction simulation
- **Assertion Helpers**: Custom assertions

## Development Guidelines

### Code Standards

- **TypeScript**: Strict type checking
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality checks

### Component Design

- **Single Responsibility**: One purpose per component
- **Composition**: Build complex components from simple ones
- **Props Interface**: Clear prop definitions
- **Default Props**: Sensible defaults
- **Error Boundaries**: Graceful error handling

---

*This component documentation provides comprehensive information about the GB-CMS component library. For implementation details, see the source code and API documentation.*
