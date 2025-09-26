# GB-CMS API Reference

## Overview

The GB-CMS API provides a comprehensive set of interfaces and functions for managing digital signage layouts, widgets, templates, and plugins. This document covers all public APIs, their parameters, return values, and usage examples.

## Table of Contents

1. [Core Interfaces](#core-interfaces)
2. [Layout Management API](#layout-management-api)
3. [Widget System API](#widget-system-api)
4. [Template Management API](#template-management-api)
5. [Plugin System API](#plugin-system-api)
6. [Preview System API](#preview-system-api)
7. [Help System API](#help-system-api)
8. [Utility Functions](#utility-functions)

## Core Interfaces

### LayoutItem

Represents a single item in the layout grid.

```typescript
interface LayoutItem {
  i: string;                    // Unique identifier
  x: number;                    // X position (0-based)
  y: number;                    // Y position (0-based)
  w: number;                    // Width in grid units
  h: number;                    // Height in grid units
  component?: string;           // Component type identifier
  props?: Record<string, any>;  // Component-specific properties
}
```

### WidgetProps

Base interface for all widget properties.

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

### Template

Template data structure for saving and loading layouts.

```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  author: string;
  version: string;
  layout: LayoutItem[];
  thumbnail: string;
  createdAt: Date;
  updatedAt: Date;
  downloads: number;
  rating: number;
  size: {
    width: number;
    height: number;
  };
}
```

### Plugin

Plugin data structure for the plugin system.

```typescript
interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  icon: string;
  category: string;
  tags: string[];
  isInstalled: boolean;
  isEnabled: boolean;
  isLoading: boolean;
  dependencies: string[];
  configuration: Record<string, any>;
  widgets: string[];
  api: {
    endpoints: string[];
    permissions: string[];
  };
}
```

## Layout Management API

### LayoutCanvas Props

Main layout canvas component interface.

```typescript
interface LayoutCanvasProps {
  layout: LayoutItem[];
  onLayoutChange: (layout: LayoutItem[]) => void;
  selectedWidget: string | null;
  onWidgetSelect: (widgetId: string | null) => void;
}
```

#### Methods

##### addWidget(componentName: string): void
Adds a new widget to the layout.

```typescript
const addWidget = (componentName: string) => {
  const newWidget: LayoutItem = {
    i: `widget-${Date.now()}`,
    x: 0,
    y: 0,
    w: 2,
    h: 2,
    component: componentName
  };
  setLayout([...layout, newWidget]);
};
```

##### removeWidget(widgetId: string): void
Removes a widget from the layout.

```typescript
const removeWidget = (widgetId: string) => {
  setLayout(layout.filter(item => item.i !== widgetId));
};
```

##### updateWidget(widgetId: string, updates: Partial<LayoutItem>): void
Updates widget properties.

```typescript
const updateWidget = (widgetId: string, updates: Partial<LayoutItem>) => {
  setLayout(layout.map(item => 
    item.i === widgetId ? { ...item, ...updates } : item
  ));
};
```

##### selectWidget(widgetId: string | null): void
Selects a widget for editing.

```typescript
const selectWidget = (widgetId: string | null) => {
  setSelectedWidget(widgetId);
};
```

### Grid System

#### Grid Configuration
```typescript
interface GridConfig {
  columns: number;        // Number of grid columns (default: 12)
  rowHeight: number;      // Height of each row in pixels (default: 60)
  margin: [number, number]; // Grid margins [x, y] (default: [10, 10])
  containerPadding: [number, number]; // Container padding [x, y]
  isDraggable: boolean;   // Allow dragging (default: true)
  isResizable: boolean;   // Allow resizing (default: true)
  isBounded: boolean;     // Constrain to container (default: false)
}
```

#### Responsive Breakpoints
```typescript
interface Breakpoints {
  lg: number;  // Large screens (default: 1200)
  md: number;  // Medium screens (default: 996)
  sm: number;  // Small screens (default: 768)
  xs: number;  // Extra small screens (default: 480)
  xxs: number; // Extra extra small screens (default: 0)
}
```

## Widget System API

### Widget Registry

Central registry for managing available widgets.

```typescript
interface WidgetRegistry {
  registerWidget(widget: WidgetDefinition): void;
  unregisterWidget(widgetId: string): void;
  getWidget(widgetId: string): WidgetDefinition | undefined;
  getAllWidgets(): WidgetDefinition[];
  getWidgetsByCategory(category: string): WidgetDefinition[];
}
```

### Widget Definition

```typescript
interface WidgetDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  component: React.ComponentType<any>;
  defaultProps: Record<string, any>;
  propTypes: Record<string, PropType>;
  size: {
    minW: number;
    minH: number;
    maxW?: number;
    maxH?: number;
    defaultW: number;
    defaultH: number;
  };
  capabilities: string[];
  dependencies: string[];
}
```

### Widget Lifecycle

#### Creation
```typescript
interface WidgetCreationOptions {
  component: string;
  props?: Record<string, any>;
  position?: { x: number; y: number };
  size?: { w: number; h: number };
}

const createWidget = (options: WidgetCreationOptions): LayoutItem => {
  return {
    i: `widget-${Date.now()}`,
    x: options.position?.x || 0,
    y: options.position?.y || 0,
    w: options.size?.w || 2,
    h: options.size?.h || 2,
    component: options.component,
    props: options.props || {}
  };
};
```

#### Update
```typescript
interface WidgetUpdateOptions {
  id: string;
  props?: Record<string, any>;
  position?: { x: number; y: number };
  size?: { w: number; h: number };
}

const updateWidget = (options: WidgetUpdateOptions): void => {
  setLayout(layout.map(item => 
    item.i === options.id 
      ? { 
          ...item, 
          ...(options.position && { x: options.position.x, y: options.position.y }),
          ...(options.size && { w: options.size.w, h: options.size.h }),
          ...(options.props && { props: { ...item.props, ...options.props } })
        }
      : item
  ));
};
```

#### Destruction
```typescript
const destroyWidget = (widgetId: string): void => {
  setLayout(layout.filter(item => item.i !== widgetId));
};
```

### Built-in Widgets

#### ClockWidget
```typescript
interface ClockWidgetProps {
  timezone?: string;
  format?: '12-hour' | '24-hour';
  size?: 'small' | 'medium' | 'large';
  type?: 'digital' | 'analog';
}
```

#### WeatherWidget
```typescript
interface WeatherWidgetProps {
  location?: string;
  showClock?: boolean;
  showAnimatedBg?: boolean;
  theme?: 'light' | 'dark';
}
```

#### NewsWidget
```typescript
interface NewsWidgetProps {
  feedUrl?: string;
  maxItems?: number;
  showImages?: boolean;
  autoScroll?: boolean;
  scrollSpeed?: number;
}
```

## Template Management API

### TemplateManager Props

```typescript
interface TemplateManagerProps {
  layout: LayoutItem[];
  onLoadTemplate: (template: Template) => void;
}
```

### Template Operations

#### Save Template
```typescript
interface SaveTemplateOptions {
  name: string;
  description: string;
  category: string;
  tags: string[];
  layout: LayoutItem[];
}

const saveTemplate = async (options: SaveTemplateOptions): Promise<Template> => {
  const template: Template = {
    id: `template-${Date.now()}`,
    name: options.name,
    description: options.description,
    category: options.category,
    tags: options.tags,
    author: 'Current User',
    version: '1.0.0',
    layout: options.layout,
    thumbnail: generateThumbnail(options.layout),
    createdAt: new Date(),
    updatedAt: new Date(),
    downloads: 0,
    rating: 0,
    size: calculateLayoutSize(options.layout)
  };
  
  await saveTemplateToStorage(template);
  return template;
};
```

#### Load Template
```typescript
const loadTemplate = async (templateId: string): Promise<Template | null> => {
  const template = await getTemplateFromStorage(templateId);
  if (template) {
    onLoadTemplate(template);
  }
  return template;
};
```

#### Delete Template
```typescript
const deleteTemplate = async (templateId: string): Promise<boolean> => {
  try {
    await removeTemplateFromStorage(templateId);
    return true;
  } catch (error) {
    console.error('Failed to delete template:', error);
    return false;
  }
};
```

#### Search Templates
```typescript
interface SearchOptions {
  query?: string;
  category?: string;
  tags?: string[];
  author?: string;
  sortBy?: 'name' | 'date' | 'rating' | 'downloads';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

const searchTemplates = async (options: SearchOptions): Promise<Template[]> => {
  const templates = await getAllTemplatesFromStorage();
  
  let filtered = templates;
  
  if (options.query) {
    filtered = filtered.filter(t => 
      t.name.toLowerCase().includes(options.query!.toLowerCase()) ||
      t.description.toLowerCase().includes(options.query!.toLowerCase())
    );
  }
  
  if (options.category) {
    filtered = filtered.filter(t => t.category === options.category);
  }
  
  if (options.tags && options.tags.length > 0) {
    filtered = filtered.filter(t => 
      options.tags!.some(tag => t.tags.includes(tag))
    );
  }
  
  if (options.author) {
    filtered = filtered.filter(t => t.author === options.author);
  }
  
  // Sort
  if (options.sortBy) {
    filtered.sort((a, b) => {
      const aVal = a[options.sortBy!];
      const bVal = b[options.sortBy!];
      const order = options.sortOrder === 'desc' ? -1 : 1;
      return aVal < bVal ? -1 * order : aVal > bVal ? 1 * order : 0;
    });
  }
  
  // Pagination
  const offset = options.offset || 0;
  const limit = options.limit || 20;
  
  return filtered.slice(offset, offset + limit);
};
```

### Template Storage

#### Local Storage Operations
```typescript
const TEMPLATE_STORAGE_KEY = 'gb-cms-templates';

const saveTemplateToStorage = async (template: Template): Promise<void> => {
  const templates = await getTemplatesFromStorage();
  const updated = templates.filter(t => t.id !== template.id);
  updated.push(template);
  localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(updated));
};

const getTemplatesFromStorage = async (): Promise<Template[]> => {
  const stored = localStorage.getItem(TEMPLATE_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const removeTemplateFromStorage = async (templateId: string): Promise<void> => {
  const templates = await getTemplatesFromStorage();
  const filtered = templates.filter(t => t.id !== templateId);
  localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(filtered));
};
```

## Plugin System API

### PluginManager Props

```typescript
interface PluginManagerProps {
  onPluginInstall: (plugin: Plugin) => void;
  onPluginUninstall: (pluginId: string) => void;
  onPluginToggle: (pluginId: string, enabled: boolean) => void;
}
```

### Plugin Operations

#### Install Plugin
```typescript
interface InstallPluginOptions {
  pluginId: string;
  version?: string;
  configuration?: Record<string, any>;
}

const installPlugin = async (options: InstallPluginOptions): Promise<Plugin> => {
  const plugin = await downloadPlugin(options.pluginId, options.version);
  
  // Validate dependencies
  await validatePluginDependencies(plugin);
  
  // Install dependencies
  await installPluginDependencies(plugin);
  
  // Configure plugin
  if (options.configuration) {
    plugin.configuration = { ...plugin.configuration, ...options.configuration };
  }
  
  // Register plugin
  await registerPlugin(plugin);
  
  // Enable plugin
  plugin.isInstalled = true;
  plugin.isEnabled = true;
  
  onPluginInstall(plugin);
  return plugin;
};
```

#### Uninstall Plugin
```typescript
const uninstallPlugin = async (pluginId: string): Promise<boolean> => {
  try {
    const plugin = await getPlugin(pluginId);
    if (!plugin) return false;
    
    // Disable plugin
    plugin.isEnabled = false;
    
    // Unregister widgets
    plugin.widgets.forEach(widgetId => {
      unregisterWidget(widgetId);
    });
    
    // Remove from storage
    await removePluginFromStorage(pluginId);
    
    onPluginUninstall(pluginId);
    return true;
  } catch (error) {
    console.error('Failed to uninstall plugin:', error);
    return false;
  }
};
```

#### Configure Plugin
```typescript
interface PluginConfiguration {
  [key: string]: any;
}

const configurePlugin = async (
  pluginId: string, 
  configuration: PluginConfiguration
): Promise<boolean> => {
  try {
    const plugin = await getPlugin(pluginId);
    if (!plugin) return false;
    
    plugin.configuration = { ...plugin.configuration, ...configuration };
    await savePluginToStorage(plugin);
    
    return true;
  } catch (error) {
    console.error('Failed to configure plugin:', error);
    return false;
  }
};
```

### Plugin Registry

```typescript
interface PluginRegistry {
  registerPlugin(plugin: Plugin): void;
  unregisterPlugin(pluginId: string): void;
  getPlugin(pluginId: string): Plugin | undefined;
  getAllPlugins(): Plugin[];
  getInstalledPlugins(): Plugin[];
  getEnabledPlugins(): Plugin[];
  searchPlugins(query: string): Plugin[];
}
```

## Preview System API

### PreviewSystem Props

```typescript
interface PreviewSystemProps {
  layout: LayoutItem[];
  selectedWidget: string | null;
  onWidgetSelect: (widgetId: string | null) => void;
}
```

### Preview Operations

#### Device Simulation
```typescript
interface ViewportConfig {
  name: string;
  icon: string;
  width: number;
  height: number;
  scale: number;
  category: 'desktop' | 'tablet' | 'mobile';
  orientation?: 'portrait' | 'landscape';
  description: string;
}

const viewportConfigs: Record<string, ViewportConfig> = {
  desktop: {
    name: 'Desktop',
    icon: '🖥️',
    width: 1920,
    height: 1080,
    scale: 1,
    category: 'desktop',
    description: 'Full HD Desktop Display'
  },
  laptop: {
    name: 'Laptop',
    icon: '💻',
    width: 1366,
    height: 768,
    scale: 0.8,
    category: 'desktop',
    description: 'HD Laptop Display'
  },
  tablet: {
    name: 'Tablet',
    icon: '📱',
    width: 768,
    height: 1024,
    scale: 0.6,
    category: 'tablet',
    orientation: 'portrait',
    description: 'Tablet Portrait'
  },
  mobile: {
    name: 'Mobile',
    icon: '📱',
    width: 375,
    height: 667,
    scale: 0.4,
    category: 'mobile',
    orientation: 'portrait',
    description: 'Mobile Portrait'
  }
};
```

#### Responsive Layout Calculation
```typescript
const getResponsiveLayout = (layout: LayoutItem[], viewport: string): LayoutItem[] => {
  const config = viewportConfigs[viewport];
  const isMobile = config.category === 'mobile';
  const isTablet = config.category === 'tablet';
  
  return layout.map(item => {
    let responsiveItem = { ...item };
    
    // Mobile: Stack widgets vertically, full width
    if (isMobile) {
      responsiveItem.w = 12; // Full width
      responsiveItem.x = 0;  // Left aligned
      // Stack vertically based on original order
      const index = layout.findIndex(l => l.i === item.i);
      responsiveItem.y = index;
    }
    // Tablet: Adjust width for medium screens
    else if (isTablet) {
      if (item.w > 6) {
        responsiveItem.w = 12; // Full width for large widgets
      } else if (item.w > 3) {
        responsiveItem.w = 6;  // Half width for medium widgets
      }
      // Keep original positioning
    }
    
    return responsiveItem;
  });
};
```

#### Preview Modes
```typescript
type PreviewMode = 'normal' | 'responsive' | 'comparison';

const setPreviewMode = (mode: PreviewMode): void => {
  setPreviewMode(mode);
};

const toggleFullscreen = (): void => {
  setIsFullscreen(!isFullscreen);
};

const setZoomLevel = (level: number): void => {
  setZoomLevel(Math.max(25, Math.min(200, level)));
};
```

## Help System API

### OnboardingSystem Props

```typescript
interface OnboardingSystemProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}
```

### Onboarding Operations

#### Start Tour
```typescript
const startTour = (): void => {
  setIsOpen(true);
  setCurrentStep(0);
};

const nextStep = (): void => {
  if (currentStep < onboardingSteps.length - 1) {
    setCurrentStep(prev => prev + 1);
  } else {
    completeOnboarding();
  }
};

const prevStep = (): void => {
  if (currentStep > 0) {
    setCurrentStep(prev => prev - 1);
  }
};

const skipOnboarding = (): void => {
  setIsOpen(false);
  onClose();
};
```

#### Tour Steps
```typescript
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string;
  action?: {
    type: 'click' | 'focus' | 'scroll';
    element: string;
  };
  position: 'top' | 'bottom' | 'left' | 'right';
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to GB-CMS',
    description: 'Let\'s take a quick tour of the digital signage management system.',
    target: 'body',
    position: 'top'
  },
  {
    id: 'layout-canvas',
    title: 'Layout Canvas',
    description: 'This is your main workspace where you design and arrange your digital signage layouts.',
    target: '[data-tour="layout-canvas"]',
    action: {
      type: 'focus',
      element: '[data-tour="layout-canvas"]'
    },
    position: 'top'
  }
  // ... more steps
];
```

### HelpSystem Props

```typescript
interface HelpSystemProps {
  isOpen: boolean;
  onClose: () => void;
}
```

### Help Operations

#### Search Help
```typescript
interface HelpSearchOptions {
  query: string;
  category?: string;
  tags?: string[];
  limit?: number;
}

const searchHelp = (options: HelpSearchOptions): HelpTopic[] => {
  let results = helpTopics;
  
  if (options.query) {
    const query = options.query.toLowerCase();
    results = results.filter(topic => 
      topic.title.toLowerCase().includes(query) ||
      topic.content.toLowerCase().includes(query) ||
      topic.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }
  
  if (options.category) {
    results = results.filter(topic => topic.category === options.category);
  }
  
  if (options.tags && options.tags.length > 0) {
    results = results.filter(topic => 
      options.tags!.some(tag => topic.tags.includes(tag))
    );
  }
  
  return results.slice(0, options.limit || 20);
};
```

## Utility Functions

### Local Storage Helpers

```typescript
const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
};
```

### Validation Helpers

```typescript
const validateLayoutItem = (item: LayoutItem): boolean => {
  return (
    typeof item.i === 'string' &&
    typeof item.x === 'number' &&
    typeof item.y === 'number' &&
    typeof item.w === 'number' &&
    typeof item.h === 'number' &&
    item.w > 0 &&
    item.h > 0
  );
};

const validateTemplate = (template: Template): boolean => {
  return (
    typeof template.id === 'string' &&
    typeof template.name === 'string' &&
    typeof template.description === 'string' &&
    Array.isArray(template.layout) &&
    template.layout.every(validateLayoutItem)
  );
};
```

### Event Handlers

```typescript
const createEventHandler = <T extends Event>(
  handler: (event: T) => void
) => {
  return (event: T) => {
    event.preventDefault();
    event.stopPropagation();
    handler(event);
  };
};

const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T => {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
};
```

---

*This API reference provides comprehensive documentation for all GB-CMS APIs. For implementation details and examples, see the source code and component documentation.*
