# Implementation Steps for Modularity

## Step 1: Define Component Interfaces
- **Objective**: Establish interfaces for all components, including the slider, welcome text, website viewer, and clock components.
- **Details**: Define props and expected outputs for each component to ensure consistency and interoperability.
- **Progress**:
  - Identified existing interfaces and props for key components:
    - **PVCompactWidget**: Props include `location`, `theme`, and `token`.
    - **PVFlowWidget**: Props include `token` and `theme`.
    - **Slideshow**: Props include `images`, `intervalMs`, `animations`, `durationMs`, and `preloadNext`.
    - **NewsWidget**: Props include `category`, `limit`, `theme`, `rotationMs`, and `compact`.
    - **WeatherWidget**: Props include `location`, `theme`, `showClock`, and `showAnimatedBg`.
    - **DigitalClock**: Props include `timezone`, `type`, `size`, and `color`.
    - **AnalogClock**: Props include `timezone`, `size`, and `theme`.
  - **Clock Components**: Found separate independent clock components (`DigitalClock.tsx` and `AnalogClock.tsx`) that are already modular.
  - **Clock Integration**: The `WeatherWidget` also includes clock functionality via the `showClock` prop, which could be refactored to use the independent clock components.
  - Plan to create a base interface for common props like `theme` and `location`.
  - Next steps include documenting these interfaces and refactoring components to adhere to them.

## Step 2: Develop the Layout Engine
- **Objective**: Implement a layout engine that supports dynamic component arrangement.
- **Details**: Describe the layout engine's architecture, libraries used, and integration with existing components.
- **Progress**:
  - **Current Layout System Analysis**:
    - **CSS Grid-Based**: The current system uses CSS Grid with predefined layouts
    - **Layout Types**: 
      - `default`: 2x2 grid (weather sidebar, main viewer, slideshow bottom)
      - `slideshow`: Similar to default but smaller bottom area (18vh vs 28vh)
      - `vertical-3`: 3-column vertical layout (22% | 48% | 30%)
      - `news`: Weather sidebar with main viewer and bottom widget
      - `pv`: Matches news layout structure
    - **Grid Areas**: Uses CSS Grid template areas for component positioning
    - **Responsive Design**: Media queries for different screen sizes (1200px, 992px, 768px, 480px)
  
  - **Current Architecture**:
    - **Player.tsx**: Main component that renders different layouts based on config
    - **Preview.tsx**: Similar structure for preview mode
    - **CSS Classes**: `.grid`, `.grid-vertical-3`, `.grid-slideshow`, `.grid-news`
    - **Component Positioning**: Fixed grid areas with predefined cell classes
  
  - **Limitations Identified**:
    - **Static Layouts**: Only predefined layouts available, no dynamic arrangement
    - **Hard-coded Grid Areas**: Components are bound to specific grid areas
    - **No Drag & Drop**: No user interface for customizing layouts
    - **Limited Flexibility**: Cannot resize or reposition components dynamically
  
  - **Next Steps for Layout Engine**:
    - Research and evaluate layout libraries (react-grid-layout, react-dnd, etc.)
    - Design a dynamic grid system that can accommodate different component sizes
    - Create a layout configuration system that can be saved/loaded
    - Implement drag-and-drop functionality for component arrangement
    - Maintain backward compatibility with existing layouts

## Step 3: Create Configuration Management
- **Objective**: Implement a system for loading, saving, and applying configuration files.
- **Details**: Explain the configuration file structure, interaction with components, and customization examples.
- **Progress**:
  - **Current Configuration System Analysis**:
    - **Storage Format**: JSON-based configuration stored in `db.json`
    - **Database Structure**: 
      - Root level: `playlists`, `slides`, `updatedAt`, `screens`
      - Screen configs: Stored under `screens[screenId]` with individual screen configurations
    - **API Endpoints**:
      - `GET /api/config/:screenId`: Load configuration for a specific screen
      - `POST /api/config/:screenId`: Save/update configuration (requires API key)
    - **Default Configuration**: `defaultConfig()` function provides fallback values
  
  - **Configuration Structure**:
    - **Screen Identity**: `screenId`, `updatedAt`
    - **Layout Settings**: `layout`, `theme`, `timezone`
    - **Component Configs**: `weatherLocation`, `webViewerUrl`, `webViewerMode`, `clockType`, `clockStyle`
    - **Visual Settings**: `welcomeText`, `welcomeTextColor`, `bottomWidgetsBgColor`, `bottomWidgetsBgImage`
    - **Animation Settings**: `slideshowAnimations`, `slideshowAnimationDurationMs`, `powerProfile`
    - **Data Sources**: `slides` (array of image URLs), `schedule` (time-based overrides)
    - **Behavior Settings**: `autoScrollEnabled`, `refreshIntervals`, `newsCategory`
  
  - **Current Strengths**:
    - **Centralized Storage**: All configurations in single JSON file
    - **API-based Access**: RESTful endpoints for CRUD operations
    - **Default Fallbacks**: Graceful handling of missing configurations
    - **Real-time Updates**: WebSocket notifications for config changes
    - **Admin Interface**: HTML-based admin panel for configuration management
  
  - **Limitations Identified**:
    - **Static Schema**: Configuration structure is hard-coded, not extensible
    - **No Versioning**: No configuration version management or migration system
    - **Limited Validation**: Minimal validation of configuration values
    - **No Templates**: No predefined configuration templates for common use cases
    - **No Import/Export**: No bulk configuration management capabilities
  
  - **Next Steps for Enhanced Configuration Management**:
    - Design extensible configuration schema with component-specific sections
    - Implement configuration validation and error handling
    - Create configuration templates and presets
    - Add configuration versioning and migration system
    - Implement bulk import/export functionality
    - Add configuration backup and restore capabilities
    - Create configuration inheritance system for common settings

## Step 4: Build the Template System
- **Objective**: Develop a library of templates for common layouts.
- **Details**: Provide a guide on using templates, including exporting and importing options.
- **Progress**:
  - **Current Template System Analysis**:
    - **Existing Layout Templates**: 5 predefined layout types currently implemented
    - **Template Structure**: Each layout is a conditional render block with specific component arrangements
    - **Template Implementation**: Hard-coded in Player.tsx and Preview.tsx with conditional rendering
  
  - **Current Layout Templates**:
    1. **Default Layout** (`layout === 'default'`):
       - **Grid Structure**: 2x2 grid (weather sidebar, main viewer, slideshow bottom)
       - **Components**: WeatherWidget, WebViewer, Slideshow, Clock overlay
       - **CSS Class**: `.grid`
       - **Use Case**: General purpose with weather, web content, and image slideshow
    
    2. **Slideshow Layout** (`layout === 'slideshow'`):
       - **Grid Structure**: Similar to default but smaller bottom area (18vh vs 28vh)
       - **Components**: WeatherWidget, Slideshow (main area), Bottom widgets (clock + welcome text)
       - **CSS Class**: `.grid-slideshow`
       - **Use Case**: Focus on image slideshow with minimal bottom widgets
    
    3. **PV Layout** (`layout === 'pv'`):
       - **Grid Structure**: 3-column layout with complex sidebar (NewsWidget, PVFlowWidget, CompactWeather)
       - **Components**: NewsWidget, PVFlowWidget, CompactWeather, Slideshow, Welcome text
       - **CSS Class**: `.grid-news`
       - **Use Case**: Energy monitoring with news, PV data, and weather
    
    4. **News Layout** (`layout === 'news'`):
       - **Grid Structure**: NewsWidget + WeatherWidget in sidebar, Slideshow in main, Welcome text in bottom
       - **Components**: NewsWidget, WeatherWidget (with clock), Slideshow, Welcome text
       - **CSS Class**: `.grid-news`
       - **Use Case**: News-focused display with weather and slideshow
    
    5. **Vertical-3 Layout** (`layout === 'vertical-3'`):
       - **Grid Structure**: 3 equal columns (22% | 48% | 30%)
       - **Components**: WeatherWidget + Clock, Slideshow, WebViewer
       - **CSS Class**: `.grid-vertical-3`
       - **Use Case**: Balanced 3-column layout for multiple content types
  
  - **Current Template Strengths**:
    - **Diverse Layouts**: Covers different use cases (general, slideshow, energy, news, balanced)
    - **Component Reusability**: Same components used across different layouts
    - **Responsive Design**: CSS media queries for different screen sizes
    - **Consistent Styling**: Unified theme and styling system
  
  - **Current Template Limitations**:
    - **Hard-coded Templates**: Templates are embedded in code, not configurable
    - **No Template Management**: No system for creating, saving, or sharing templates
    - **Limited Customization**: Cannot modify component arrangements within templates
    - **No Template Library**: No predefined template collection for users
    - **No Import/Export**: Cannot save or share custom template configurations
  
  - **Next Steps for Template System**:
    - Create template configuration format (JSON-based template definitions)
    - Implement template registry system for storing and retrieving templates
    - Design template editor interface for creating custom templates
    - Add template import/export functionality
    - Create template library with common use case templates
    - Implement template validation and error handling
    - Add template versioning and migration system
    - Create template sharing and collaboration features

## Step 5: Establish Plugin Architecture
- **Objective**: Define a plugin architecture for easy integration of new components.
- **Details**: Outline the plugin API, lifecycle methods, and examples for third-party developers.
- **Progress**:
  - **Current Component Architecture Analysis**:
    - **Component Structure**: All components are React functional components with TypeScript interfaces
    - **Import Pattern**: Components are statically imported at the top of Player.tsx and Preview.tsx
    - **Integration Method**: Components are directly instantiated in JSX with props passed from configuration
    - **Component Interfaces**: Each component has a well-defined TypeScript interface for props
  
  - **Current Component Patterns**:
    1. **Props Interface**: Each component exports a TypeScript interface (e.g., `WeatherWidgetProps`, `PVFlowWidgetProps`)
    2. **Theme Support**: Most components support `theme?: 'dark' | 'light'` prop
    3. **Data Fetching**: Components use `useEffect` hooks for data fetching with cleanup
    4. **Error Handling**: Components implement error states and loading states
    5. **API Integration**: Components use `computeApiBase()` function for API endpoint resolution
    6. **Responsive Design**: Components are designed to work within grid layouts
  
  - **Current Integration Limitations**:
    - **Static Imports**: All components must be imported at build time
    - **Hard-coded Usage**: Components are manually placed in layout templates
    - **No Dynamic Loading**: Cannot load components at runtime
    - **No Plugin System**: No mechanism for third-party component integration
    - **Limited Extensibility**: Adding new components requires code changes
  
  - **Plugin Architecture Design Requirements**:
    1. **Dynamic Component Loading**: Ability to load components at runtime
    2. **Plugin Registry**: System for registering and discovering plugins
    3. **Plugin API**: Standardized interface for plugin components
    4. **Configuration Integration**: Plugins should work with existing configuration system
    5. **Theme Compatibility**: Plugins should support the theme system
    6. **Error Boundaries**: Safe handling of plugin errors
    7. **Plugin Lifecycle**: Load, initialize, render, and cleanup phases
  
  - **Proposed Plugin Architecture**:
    ```typescript
    // Plugin Interface
    interface SignagePlugin {
      id: string;
      name: string;
      version: string;
      description: string;
      author: string;
      component: React.ComponentType<PluginProps>;
      propsSchema: JSONSchema;
      defaultProps: Record<string, any>;
      category: 'widget' | 'layout' | 'utility';
      dependencies?: string[];
    }
    
    // Plugin Props Interface
    interface PluginProps {
      theme?: 'dark' | 'light';
      config: Record<string, any>;
      onError?: (error: Error) => void;
      onDataUpdate?: (data: any) => void;
    }
    ```
  
  - **Plugin System Components**:
    1. **Plugin Registry**: Central registry for managing available plugins
    2. **Plugin Loader**: Dynamic loading system for plugin components
    3. **Plugin Manager**: Admin interface for installing/removing plugins
    4. **Plugin Store**: Repository for sharing and discovering plugins
    5. **Plugin Validator**: Validation system for plugin compatibility
    6. **Plugin Sandbox**: Isolated environment for plugin execution
  
  - **Next Steps for Plugin Architecture**:
    - Design plugin manifest format and validation
    - Implement plugin registry and loading system
    - Create plugin development SDK and documentation
    - Build plugin management interface
    - Establish plugin security and sandboxing
    - Create plugin store and distribution system
    - Implement plugin versioning and update mechanism
    - Add plugin testing and validation tools

## Step 6: Design the User Interface
- **Objective**: Create a user-friendly interface for component customization.
- **Details**: Detail the UI design process, user testing results, and final interface features.
- **Progress**:
  - **Current Admin Interface Analysis**:
    - **Design System**: Dark theme with modern, clean aesthetic
    - **Layout Structure**: Single-page application with tabbed navigation
    - **UI Components**: Cards, forms, buttons, dropdowns, and preview areas
    - **Responsive Design**: Mobile-friendly with media queries
    - **Internationalization**: German/English language support
  
  - **Current UI Patterns**:
    1. **Card-based Layout**: Content organized in cards with gradients and shadows
    2. **Tabbed Navigation**: Organized sections (General, Theme & Layout, News, Slideshow, Web Viewer, Uploads)
    3. **Form Controls**: Consistent input styling with dark theme
    4. **Grid Layout**: Two-column responsive grid for form fields
    5. **Preview System**: Live preview of clock and player components
    6. **Toolbar**: Screen selection and save controls at the top
    7. **Color Scheme**: Dark blue/gray palette (#0f172a, #0b1220, #1e293b)
  
  - **Current Interface Strengths**:
    - **Clean Design**: Modern, professional appearance
    - **Intuitive Navigation**: Clear tab structure and logical grouping
    - **Live Preview**: Real-time preview of changes
    - **Responsive**: Works on different screen sizes
    - **Internationalization**: Multi-language support
    - **Consistent Styling**: Unified design system
  
  - **Current Interface Limitations**:
    - **Static Layout**: No drag-and-drop or dynamic arrangement
    - **Limited Customization**: Cannot modify component positions or sizes
    - **No Visual Editor**: Text-based configuration only
    - **No Template Management**: Cannot save or load custom layouts
    - **No Plugin Interface**: No UI for managing plugins
    - **Limited Preview**: Only shows individual components, not full layouts
  
  - **Enhanced UI Design Requirements**:
    1. **Visual Layout Editor**: Drag-and-drop interface for component arrangement
    2. **Component Library**: Visual palette of available components
    3. **Template Management**: Save, load, and share layout templates
    4. **Plugin Management**: Interface for installing and configuring plugins
    5. **Real-time Preview**: Full layout preview with live updates
    6. **Component Properties Panel**: Visual property editor for selected components
    7. **Responsive Preview**: Preview on different screen sizes
  
  - **Proposed Enhanced UI Architecture**:
    ```
    ┌─────────────────────────────────────────────────────────────┐
    │ Header: Logo, Screen Selector, Save/Refresh Controls        │
    ├─────────────────────────────────────────────────────────────┤
    │ Main Content Area                                           │
    │ ┌─────────────────┬─────────────────────────────────────┐   │
    │ │ Component       │ Layout Canvas                       │   │
    │ │ Library         │ ┌─────────────────────────────────┐ │   │
    │ │ - Weather       │ │ Drag & Drop Area                │ │   │
    │ │ - Clock         │ │ with Grid Guidelines            │ │   │
    │ │ - Slideshow     │ │                                 │ │   │
    │ │ - News          │ │                                 │ │   │
    │ │ - Web Viewer    │ │                                 │ │   │
    │ │ - Custom        │ │                                 │ │   │
    │ │   Plugins       │ │                                 │ │   │
    │ └─────────────────┼─────────────────────────────────────┤   │
    │                   │ Properties Panel                    │   │
    │                   │ - Component Settings                │   │
    │                   │ - Theme Options                     │   │
    │                   │ - Animation Settings                │   │
    │                   └─────────────────────────────────────┘   │
    ├─────────────────────────────────────────────────────────────┤
    │ Footer: Template Management, Plugin Store, Help             │
    └─────────────────────────────────────────────────────────────┘
    ```
  
  - **UI Components for Enhanced Interface**:
    1. **Layout Canvas**: Main drag-and-drop area with grid system
    2. **Component Library**: Sidebar with draggable component tiles
    3. **Properties Panel**: Context-sensitive property editor
    4. **Template Manager**: Save/load/share layout templates
    5. **Plugin Manager**: Install, configure, and manage plugins
    6. **Preview Window**: Real-time preview of the layout
    7. **Toolbar**: Quick actions and screen management
  
  - **Next Steps for Enhanced UI**:
    - Design drag-and-drop interaction patterns
    - Create component library interface
    - Implement visual property editor
    - Build template management system
    - Add plugin management interface
    - Implement responsive preview system
    - Create user onboarding and help system
    - Conduct user testing and iteration

## Conclusion
This document will be updated as each step is completed, providing a comprehensive record of the modularity implementation process.
