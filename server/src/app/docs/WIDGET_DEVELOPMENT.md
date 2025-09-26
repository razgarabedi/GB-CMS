# Widget Development Guide

## Overview

This guide covers everything you need to know about developing custom widgets for GB-CMS. Widgets are the building blocks of digital signage layouts, and this guide will help you create, test, and deploy your own widgets.

## Table of Contents

1. [Widget Architecture](#widget-architecture)
2. [Creating Your First Widget](#creating-your-first-widget)
3. [Widget Properties and Configuration](#widget-properties-and-configuration)
4. [Advanced Widget Features](#advanced-widget-features)
5. [Testing Widgets](#testing-widgets)
6. [Widget Best Practices](#widget-best-practices)
7. [Publishing Widgets](#publishing-widgets)

## Widget Architecture

### Widget Structure

A GB-CMS widget consists of several key components:

```
MyWidget/
├── MyWidget.tsx           # Main widget component
├── MyWidget.types.ts      # TypeScript type definitions
├── MyWidget.config.ts     # Widget configuration
├── MyWidget.test.tsx      # Unit tests
├── MyWidget.stories.tsx   # Storybook stories
└── README.md              # Widget documentation
```

### Widget Lifecycle

Widgets follow a specific lifecycle:

1. **Registration**: Widget is registered in the system
2. **Instantiation**: Widget instance is created
3. **Mounting**: Widget is mounted to the DOM
4. **Updates**: Widget receives prop updates
5. **Unmounting**: Widget is removed from the DOM

### Widget Interface

All widgets must implement the base widget interface:

```typescript
interface WidgetComponent {
  (props: WidgetProps): JSX.Element;
  displayName?: string;
  defaultProps?: Partial<WidgetProps>;
  propTypes?: Record<string, PropType>;
}
```

## Creating Your First Widget

### Step 1: Widget Component

Create a new widget component file:

```tsx
// MyWidget.tsx
'use client';

import React from 'react';
import { WidgetProps } from '../types';

interface MyWidgetProps extends WidgetProps {
  title?: string;
  content?: string;
  color?: string;
  fontSize?: number;
}

const MyWidget: React.FC<MyWidgetProps> = ({
  title = 'My Widget',
  content = 'This is my custom widget',
  color = '#333333',
  fontSize = 16,
  ...props
}) => {
  return (
    <div 
      className="my-widget h-full w-full flex flex-col items-center justify-center bg-slate-800 rounded-lg p-4"
      style={{ color, fontSize: `${fontSize}px` }}
    >
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-center">{content}</p>
    </div>
  );
};

export default MyWidget;
```

### Step 2: Type Definitions

Create type definitions for your widget:

```typescript
// MyWidget.types.ts
export interface MyWidgetProps {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title?: string;
  content?: string;
  color?: string;
  fontSize?: number;
}

export interface MyWidgetConfig {
  title: string;
  content: string;
  color: string;
  fontSize: number;
}
```

### Step 3: Widget Configuration

Create configuration for your widget:

```typescript
// MyWidget.config.ts
import { WidgetDefinition } from '../types';
import MyWidget from './MyWidget';

export const myWidgetConfig: WidgetDefinition = {
  id: 'my-widget',
  name: 'My Custom Widget',
  description: 'A simple custom widget example',
  category: 'content',
  icon: '📝',
  component: MyWidget,
  defaultProps: {
    title: 'My Widget',
    content: 'This is my custom widget',
    color: '#333333',
    fontSize: 16
  },
  propTypes: {
    title: 'string',
    content: 'string',
    color: 'string',
    fontSize: 'number'
  },
  size: {
    minW: 2,
    minH: 2,
    maxW: 6,
    maxH: 4,
    defaultW: 3,
    defaultH: 2
  },
  capabilities: ['text', 'styling'],
  dependencies: []
};
```

### Step 4: Register Widget

Register your widget in the system:

```typescript
// widgets/index.ts
import { myWidgetConfig } from './MyWidget/MyWidget.config';
import { WidgetRegistry } from '../types';

const registerWidgets = (registry: WidgetRegistry) => {
  registry.registerWidget(myWidgetConfig);
};

export { registerWidgets };
```

## Widget Properties and Configuration

### Property Types

GB-CMS supports various property types for widget configuration:

#### Basic Types
```typescript
interface BasicTypes {
  // String properties
  title: string;
  description: string;
  
  // Number properties
  fontSize: number;
  opacity: number;
  
  // Boolean properties
  visible: boolean;
  enabled: boolean;
  
  // Array properties
  items: string[];
  tags: string[];
  
  // Object properties
  style: Record<string, any>;
  config: Record<string, any>;
}
```

#### Advanced Types
```typescript
interface AdvancedTypes {
  // Color properties
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  
  // Size properties
  width: number;
  height: number;
  padding: number;
  margin: number;
  
  // Position properties
  x: number;
  y: number;
  zIndex: number;
  
  // Animation properties
  animation: 'fade' | 'slide' | 'zoom' | 'none';
  duration: number;
  delay: number;
}
```

### Property Configuration

Configure how properties appear in the properties panel:

```typescript
// Property configuration
const propertyConfig = {
  title: {
    type: 'string',
    label: 'Title',
    placeholder: 'Enter widget title',
    required: true,
    validation: {
      minLength: 1,
      maxLength: 100
    }
  },
  fontSize: {
    type: 'number',
    label: 'Font Size',
    min: 8,
    max: 72,
    step: 1,
    unit: 'px'
  },
  color: {
    type: 'color',
    label: 'Text Color',
    default: '#333333'
  },
  visible: {
    type: 'boolean',
    label: 'Visible',
    default: true
  },
  items: {
    type: 'array',
    label: 'Items',
    itemType: 'string',
    maxItems: 10
  }
};
```

### Dynamic Properties

Create properties that change based on other properties:

```typescript
const getDynamicProperties = (currentProps: Record<string, any>) => {
  const properties = { ...baseProperties };
  
  if (currentProps.showAdvanced) {
    properties.advancedOption = {
      type: 'string',
      label: 'Advanced Option',
      placeholder: 'Enter advanced option'
    };
  }
  
  if (currentProps.type === 'image') {
    properties.imageUrl = {
      type: 'url',
      label: 'Image URL',
      placeholder: 'https://example.com/image.jpg'
    };
  }
  
  return properties;
};
```

## Advanced Widget Features

### Data Binding

Connect widgets to external data sources:

```tsx
// Data-bound widget
const DataWidget: React.FC<DataWidgetProps> = ({
  dataSource,
  dataField,
  format,
  ...props
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(dataSource);
        const result = await response.json();
        setData(result[dataField]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (dataSource) {
      fetchData();
    }
  }, [dataSource, dataField]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data</div>;

  return (
    <div className="data-widget">
      {format === 'json' ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <div>{String(data)}</div>
      )}
    </div>
  );
};
```

### Real-time Updates

Implement real-time data updates:

```tsx
// Real-time widget
const RealTimeWidget: React.FC<RealTimeWidgetProps> = ({
  updateInterval = 1000,
  ...props
}) => {
  const [data, setData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      // Update data
      setData(getCurrentData());
      setLastUpdate(Date.now());
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  return (
    <div className="real-time-widget">
      <div className="data">{data}</div>
      <div className="last-update">
        Last updated: {new Date(lastUpdate).toLocaleTimeString()}
      </div>
    </div>
  );
};
```

### Interactive Widgets

Create widgets that respond to user interaction:

```tsx
// Interactive widget
const InteractiveWidget: React.FC<InteractiveWidgetProps> = ({
  onClick,
  onHover,
  interactive = true,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    if (interactive && onClick) {
      onClick();
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 200);
    }
  };

  const handleMouseEnter = () => {
    if (interactive && onHover) {
      onHover(true);
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (interactive && onHover) {
      onHover(false);
      setIsHovered(false);
    }
  };

  return (
    <div
      className={`interactive-widget ${isHovered ? 'hovered' : ''} ${isClicked ? 'clicked' : ''}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        cursor: interactive ? 'pointer' : 'default',
        transform: isClicked ? 'scale(0.95)' : 'scale(1)',
        transition: 'transform 0.1s ease'
      }}
    >
      {/* Widget content */}
    </div>
  );
};
```

### Responsive Widgets

Create widgets that adapt to different screen sizes:

```tsx
// Responsive widget
const ResponsiveWidget: React.FC<ResponsiveWidgetProps> = ({
  breakpoints = {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  },
  ...props
}) => {
  const [screenSize, setScreenSize] = useState('desktop');

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < breakpoints.mobile) {
        setScreenSize('mobile');
      } else if (width < breakpoints.tablet) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, [breakpoints]);

  const getResponsiveStyles = () => {
    switch (screenSize) {
      case 'mobile':
        return {
          fontSize: '14px',
          padding: '8px',
          columns: 1
        };
      case 'tablet':
        return {
          fontSize: '16px',
          padding: '12px',
          columns: 2
        };
      default:
        return {
          fontSize: '18px',
          padding: '16px',
          columns: 3
        };
    }
  };

  const styles = getResponsiveStyles();

  return (
    <div 
      className="responsive-widget"
      style={{
        fontSize: styles.fontSize,
        padding: styles.padding,
        columnCount: styles.columns
      }}
    >
      {/* Widget content */}
    </div>
  );
};
```

## Testing Widgets

### Unit Tests

Create comprehensive unit tests for your widgets:

```tsx
// MyWidget.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyWidget from './MyWidget';

describe('MyWidget', () => {
  const defaultProps = {
    id: 'test-widget',
    x: 0,
    y: 0,
    w: 3,
    h: 2
  };

  it('renders with default props', () => {
    render(<MyWidget {...defaultProps} />);
    expect(screen.getByText('My Widget')).toBeInTheDocument();
    expect(screen.getByText('This is my custom widget')).toBeInTheDocument();
  });

  it('renders with custom props', () => {
    render(
      <MyWidget
        {...defaultProps}
        title="Custom Title"
        content="Custom Content"
        color="#ff0000"
        fontSize={20}
      />
    );
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
  });

  it('applies custom styles', () => {
    render(
      <MyWidget
        {...defaultProps}
        color="#ff0000"
        fontSize={20}
      />
    );
    const widget = screen.getByText('My Widget').closest('div');
    expect(widget).toHaveStyle({
      color: '#ff0000',
      fontSize: '20px'
    });
  });

  it('handles prop updates', () => {
    const { rerender } = render(<MyWidget {...defaultProps} />);
    
    rerender(
      <MyWidget
        {...defaultProps}
        title="Updated Title"
        content="Updated Content"
      />
    );
    
    expect(screen.getByText('Updated Title')).toBeInTheDocument();
    expect(screen.getByText('Updated Content')).toBeInTheDocument();
  });
});
```

### Integration Tests

Test widget integration with the layout system:

```tsx
// MyWidget.integration.test.tsx
import { render, screen } from '@testing-library/react';
import { LayoutCanvas } from '../LayoutCanvas';
import { MyWidget } from './MyWidget';

describe('MyWidget Integration', () => {
  it('renders in layout canvas', () => {
    const layout = [
      {
        i: 'test-widget',
        x: 0,
        y: 0,
        w: 3,
        h: 2,
        component: 'MyWidget',
        props: {
          title: 'Test Widget',
          content: 'Test Content'
        }
      }
    ];

    render(
      <LayoutCanvas
        layout={layout}
        onLayoutChange={() => {}}
        selectedWidget={null}
        onWidgetSelect={() => {}}
      />
    );

    expect(screen.getByText('Test Widget')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
```

### Visual Regression Tests

Test visual appearance with Storybook:

```tsx
// MyWidget.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import MyWidget from './MyWidget';

const meta: Meta<typeof MyWidget> = {
  title: 'Widgets/MyWidget',
  component: MyWidget,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    content: { control: 'text' },
    color: { control: 'color' },
    fontSize: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'default-widget',
    x: 0,
    y: 0,
    w: 3,
    h: 2,
  },
};

export const CustomContent: Story = {
  args: {
    id: 'custom-widget',
    x: 0,
    y: 0,
    w: 3,
    h: 2,
    title: 'Custom Title',
    content: 'This is custom content for the widget',
    color: '#ff0000',
    fontSize: 20,
  },
};

export const LargeWidget: Story = {
  args: {
    id: 'large-widget',
    x: 0,
    y: 0,
    w: 6,
    h: 4,
    title: 'Large Widget',
    content: 'This is a larger widget with more content',
  },
};
```

## Widget Best Practices

### Performance Optimization

#### Memoization
```tsx
// Memoize expensive calculations
const MyWidget: React.FC<MyWidgetProps> = ({ data, ...props }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      processed: expensiveCalculation(item)
    }));
  }, [data]);

  return <div>{/* Render processed data */}</div>;
};
```

#### Lazy Loading
```tsx
// Lazy load heavy components
const MyWidget: React.FC<MyWidgetProps> = ({ showHeavyComponent, ...props }) => {
  const HeavyComponent = lazy(() => import('./HeavyComponent'));

  return (
    <div>
      {/* Light content */}
      {showHeavyComponent && (
        <Suspense fallback={<div>Loading...</div>}>
          <HeavyComponent />
        </Suspense>
      )}
    </div>
  );
};
```

### Error Handling

#### Error Boundaries
```tsx
// Error boundary for widgets
class WidgetErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Widget error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="widget-error">
          <h3>Widget Error</h3>
          <p>Something went wrong with this widget.</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### Graceful Degradation
```tsx
// Graceful degradation for missing data
const MyWidget: React.FC<MyWidgetProps> = ({ data, ...props }) => {
  if (!data) {
    return (
      <div className="widget-loading">
        <div>Loading data...</div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="widget-error">
        <div>Failed to load data: {data.error}</div>
      </div>
    );
  }

  return (
    <div className="widget-content">
      {/* Render data */}
    </div>
  );
};
```

### Accessibility

#### ARIA Support
```tsx
// Accessible widget
const MyWidget: React.FC<MyWidgetProps> = ({ 
  title, 
  content, 
  interactive,
  ...props 
}) => {
  return (
    <div
      className="my-widget"
      role={interactive ? 'button' : 'region'}
      aria-label={title}
      tabIndex={interactive ? 0 : -1}
      onKeyDown={interactive ? handleKeyDown : undefined}
    >
      <h2 className="widget-title" aria-hidden="true">
        {title}
      </h2>
      <div className="widget-content" aria-live="polite">
        {content}
      </div>
    </div>
  );
};
```

#### Keyboard Navigation
```tsx
// Keyboard navigation support
const MyWidget: React.FC<MyWidgetProps> = ({ interactive, ...props }) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!interactive) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleClick();
        break;
      case 'Escape':
        handleEscape();
        break;
    }
  };

  return (
    <div
      className="my-widget"
      tabIndex={interactive ? 0 : -1}
      onKeyDown={handleKeyDown}
    >
      {/* Widget content */}
    </div>
  );
};
```

### Documentation

#### Widget Documentation
```markdown
# My Widget

A custom widget for displaying text content with styling options.

## Features

- Customizable title and content
- Color and font size options
- Responsive design
- Accessibility support

## Usage

```tsx
<MyWidget
  title="My Title"
  content="My Content"
  color="#333333"
  fontSize={16}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | string | 'My Widget' | Widget title |
| content | string | 'This is my custom widget' | Widget content |
| color | string | '#333333' | Text color |
| fontSize | number | 16 | Font size in pixels |

## Examples

### Basic Usage
```tsx
<MyWidget title="Hello" content="World" />
```

### Styled Widget
```tsx
<MyWidget
  title="Styled Widget"
  content="With custom styling"
  color="#ff0000"
  fontSize={20}
/>
```
```

## Publishing Widgets

### Widget Package

Create a widget package for distribution:

```json
// package.json
{
  "name": "@gb-cms/my-widget",
  "version": "1.0.0",
  "description": "A custom widget for GB-CMS",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "keywords": [
    "gb-cms",
    "widget",
    "digital-signage"
  ],
  "author": "Your Name",
  "license": "MIT",
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "typescript": "^4.9.0"
  }
}
```

### Build Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "declaration": true,
    "outDir": "dist"
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

### Publishing Process

1. **Build the Widget**
   ```bash
   npm run build
   ```

2. **Test the Widget**
   ```bash
   npm run test
   npm run test:coverage
   ```

3. **Publish to NPM**
   ```bash
   npm publish
   ```

4. **Register with GB-CMS**
   ```typescript
   // Register widget in GB-CMS
   import { MyWidget } from '@gb-cms/my-widget';
   import { myWidgetConfig } from '@gb-cms/my-widget';

   // Register with widget registry
   widgetRegistry.registerWidget(myWidgetConfig);
   ```

---

*This widget development guide provides comprehensive information for creating custom widgets for GB-CMS. For additional help, see the component documentation or contact the development team.*
