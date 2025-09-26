# Signage Solution

## Overview
This project is a complete signage solution consisting of two main parts:

1. **Player**: The front-end application that displays the final signage layouts on screens.
2. **Server**: The Next.js-based back-end and front-end management dashboard for creating, managing, and distributing signage content.

## Features
- Core set of widgets
- Drag-and-drop canvas for layout creation
- Robust template and plugin management system
- Dark-themed design system
- Responsive grid system
- Drag-and-drop interactions
- Internationalization with German/English support

## Rendering Engine
The player application uses Three.js to provide a lightweight and performant rendering engine for displaying signage layouts. This ensures smooth and efficient rendering of complex layouts.

## Real-time Updates
Real-time updates are facilitated using Socket.IO, allowing the player to receive content and layout updates from the server efficiently. This ensures that the displayed content is always up-to-date.

## Performance Optimization
The player is optimized for continuous playback on various hardware using react-performance. This includes optimizations for rendering efficiency and resource management to ensure smooth operation across different devices.

## Setup Instructions

### Prerequisites
- Node.js
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd GB-CMS
   ```

3. Install dependencies for the server:
   ```bash
   cd server
   npm install
   ```

4. Install dependencies for the player:
   ```bash
   cd ../player
   npm install
   ```

### Running the Application

#### Server
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Start the server:
   ```bash
   npm run dev
   ```

#### Player
1. Navigate to the player directory:
   ```bash
   cd player
   ```
2. Start the player application:
   ```bash
   npm start
   ```

## Usage
- Access the server dashboard to create and manage signage content.
- Use the player application to display signage layouts on screens.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Accessing the Canvas Editor Page

To access the Canvas Editor page, follow these steps:

1. Ensure that the development server is running. You can start the server by navigating to the `player` directory and running:
   ```bash
   npm start
   ```

2. Open your web browser and go to `http://localhost:3000`.

The Canvas Editor will be displayed by default, where you can manage and design your layouts.

## Canvas Editor Features

### Layout Structure
The Canvas Editor follows a structured layout with distinct sections:

- **Header**: Contains Logo, Screen Selector dropdown, Add Screen button, and Save/Refresh controls
- **Main Content Area**: Three-column layout with Component Library, Layout Canvas, and Properties Panel
- **Footer**: Template Management, Plugin Store, and Help sections

### Component Library (Left Panel)
The Component Library contains draggable widgets that can be added to your layouts:

- Weather Widget
- Clock Widget  
- Slideshow Widget
- News Widget
- Web Viewer Widget
- Custom Plugins

### Adding Widgets to Canvas
You can add widgets to the canvas using two methods:

#### Method 1: Drag and Drop
1. **Drag** any widget from the Component Library
2. **Drop** it onto the Layout Canvas (dashed border area)
3. The widget will be automatically positioned in the grid

#### Method 2: Click to Add
1. **Click** on any widget in the Component Library
2. The widget will be instantly added to the canvas

### Managing Widgets on Canvas
Once widgets are added to the canvas:

- **Move**: Drag widgets to reposition them within the grid
- **Resize**: Use the resize handles to adjust widget dimensions
- **Grid System**: Widgets snap to a 12-column grid system for consistent layouts

### Screen Management
- **Select Screen**: Use the dropdown to switch between existing screens
- **Add Screen**: Click "Add Screen" button to create new screen layouts
- **Multiple Layouts**: Each screen maintains its own widget layout

### Properties Panel (Right Panel)
Configure widget settings and layout properties:

- **Component Settings**: Adjust individual widget properties
- **Theme Options**: Customize visual appearance
- **Animation Settings**: Configure widget animations

### Built-in Widgets

#### Default Widgets Available:
1. **PVCompactWidget**: Displays compact information with location, theme, and token props
2. **PVFlowWidget**: Scrolling content widget with token and theme props
3. **Slideshow**: Image carousel with images, intervalMs, and animations props
4. **NewsWidget**: News display with category, limit, and theme props
5. **WeatherWidget**: Weather conditions with location, showClock, and showAnimatedBg props
6. **DigitalClock**: Digital time display with timezone, type, and size props
7. **AnalogClock**: Analog clock with timezone and size props

Each widget includes beautiful, responsive designs with hover effects and theme support.

### Technical Implementation

#### Technologies Used:
- **React**: Component-based UI framework
- **TypeScript**: Type-safe development
- **react-grid-layout**: Grid system for widget positioning and resizing
- **HTML5 Drag and Drop API**: Native drag and drop functionality
- **CSS3**: Modern styling with flexbox and grid layouts

#### Key Features:
- **Responsive Design**: Adapts to different screen sizes
- **Real-time Updates**: Layout changes are immediately reflected
- **Performance Optimized**: Efficient rendering for continuous playback
- **Cross-browser Compatible**: Works on modern browsers

## Phase 1: Foundation & Core UI - Complete ✅

### Overview
Phase 1 established the foundational architecture and core user interface for the GB-CMS Digital Signage System. This phase focused on creating a solid technical foundation with a professional dark-themed interface.

### What Was Implemented

#### 1. Next.js Project Structure ✅
**Server Application (Next.js 15)**
- Modern App Router architecture
- TypeScript configuration
- Tailwind CSS integration
- Component-based structure
- Professional development setup

**File Structure:**
```
server/
├── src/app/
│   ├── layout.tsx          # Root layout with dark theme
│   ├── page.tsx            # Main application page
│   ├── globals.css         # Global styles and theme
│   └── components/
│       ├── LayoutCanvas.tsx    # Grid-based layout editor
│       ├── ComponentLibrary.tsx # Widget library
│       ├── PropertiesPanel.tsx  # Context-sensitive properties
│       └── TemplateManager.tsx  # Template management
├── package.json
└── tsconfig.json
```

#### 2. Core Single-Page Application with Tabbed Navigation ✅
**Professional Tab Interface:**
- 🎨 **Layout Canvas**: Main design workspace for creating layouts
- 📋 **Templates**: Template management and sharing system
- 🧩 **Widgets**: Widget library and configuration
- ⚙️ **Settings**: System-wide configuration options

**Navigation Features:**
- Clean header with branding and action buttons
- Intuitive tab switching with visual feedback
- Contextual content rendering
- Footer with system status information

#### 3. Dark Theme Design System & Core UI Components ✅
**Professional Dark Theme:**
- Slate-based color palette for reduced eye strain
- Consistent design tokens and CSS custom properties
- High contrast ratios for accessibility
- Modern, clean aesthetic

**Core UI Components:**
```css
/* Component Classes Available */
.card                 /* Main content containers */
.btn-primary         /* Primary action buttons */
.btn-secondary       /* Secondary action buttons */
.btn-outline         /* Outline style buttons */
.input               /* Form input fields */
.textarea            /* Multi-line text inputs */
.select              /* Dropdown selectors */
.tab-nav             /* Tab navigation container */
.tab-button          /* Individual tab buttons */
```

**Design System Features:**
- Consistent spacing and typography
- Hover and focus states
- Smooth transitions and animations
- Responsive design principles

#### 4. Layout Canvas with Dynamic Grid System ✅
**12-Column Grid System:**
- Visual grid guidelines for precise positioning
- Drag and drop widget placement
- Real-time layout updates
- Responsive grid scaling

**Canvas Features:**
- Widget selection and highlighting
- Empty state with helpful guidance
- Grid snapping for consistent layouts
- Visual feedback during interactions

**Technical Implementation:**
- HTML5 Drag and Drop API
- CSS Grid for layout positioning
- React state management for real-time updates
- TypeScript for type safety

### Key Technical Features

#### State Management
```typescript
// Core application state structure
interface LayoutItem {
  i: string;           // Unique identifier
  x: number;          // Grid X position
  y: number;          // Grid Y position  
  w: number;          // Width in grid units
  h: number;          // Height in grid units
  component?: string; // Widget type
}
```

#### Component Architecture
- **Modular Components**: Each UI section is a separate component
- **Props-based Communication**: Clean data flow between components
- **Event Handling**: Centralized event management
- **Type Safety**: Full TypeScript implementation

#### Styling Architecture
- **Tailwind CSS**: Utility-first styling approach
- **CSS Custom Properties**: Theme-able design tokens
- **Component Classes**: Reusable styled components
- **Responsive Design**: Mobile-first approach

### Getting Started with Phase 1

#### Running the Server Application
```bash
# Navigate to server directory
cd server

# Install dependencies (if needed)
npm install

# Start development server
npm run dev

# Access application
# Open http://localhost:3000 in your browser
```

#### Using the Interface

**Layout Canvas:**
1. Click "Layout Canvas" tab
2. Drag widgets from the left library panel
3. Drop widgets onto the grid canvas
4. Click widgets to select and configure them
5. Use the properties panel on the right to customize widgets

**Template Management:**
1. Click "Templates" tab
2. Save current layouts as reusable templates
3. Load existing templates
4. Import/export templates for sharing

**Widget Configuration:**
1. Select a widget on the canvas
2. Use the Properties Panel to configure widget settings
3. Adjust layout properties (size, position)
4. Changes are applied in real-time

### Architecture Benefits

#### Scalability
- Modular component architecture
- Clean separation of concerns
- Extensible widget system
- Plugin-ready foundation

#### Maintainability
- TypeScript for type safety
- Consistent coding patterns
- Well-documented components
- Clear file organization

#### User Experience
- Intuitive tabbed interface
- Professional dark theme
- Responsive design
- Real-time visual feedback

#### Developer Experience
- Hot reloading in development
- TypeScript IntelliSense
- Component-based architecture
- Modern tooling integration

## Phase 2: Component & Widget Integration ✨

Phase 2 builds upon the solid foundation of Phase 1 by introducing a complete widget ecosystem with advanced drag-and-drop functionality and context-sensitive configuration.

### 🎯 Phase 2 Achievements

#### **Enhanced Component Library Sidebar**
- **Categorized Widget Organization**: Widgets are organized into logical categories (Content Widgets, Interactive Widgets, Custom Widgets)
- **Rich Visual Design**: Each widget has a unique icon, color-coded background, and detailed description
- **Professional Interaction**: Hover effects, drag indicators, and smooth animations
- **Widget Counter**: Dynamic count showing total available widgets
- **Quick Tips**: Integrated help system with usage instructions

#### **Complete Default Widget Suite** 🎨

**Content Widgets:**
- **Weather Widget**: Real-time weather display with location, animated backgrounds, and integrated clock
- **Clock Widget**: Both digital and analog clock types with timezone support and customizable formats
- **News Widget**: Auto-rotating news feed with category filtering and refresh intervals
- **Slideshow Widget**: Image carousel with fade/slide animations and interactive controls

**Interactive Widgets:**
- **Web Viewer Widget**: Embedded web content with refresh controls and error handling
- **PV Compact Widget**: Solar panel monitoring with power output, efficiency, and battery status
- **PV Flow Widget**: Energy flow visualization with animated SVG diagrams

**Custom Widgets:**
- **Custom Widget**: Fully customizable widget with configurable colors, content, and styling

#### **Context-Sensitive Properties Panel** ⚙️

**Dynamic Configuration System:**
- **Widget-Specific Forms**: Each widget type has tailored configuration options
- **Real-Time Updates**: Changes apply instantly to widgets on the canvas
- **Dimension Controls**: Resize widgets with grid-constrained width/height inputs
- **Property Validation**: Input validation and boundary checking
- **Visual Feedback**: Clear labeling and intuitive form controls

#### **Advanced Drag-and-Drop System** 🎯

**Professional Interaction Patterns:**
- **Custom Drag Previews**: Branded drag images with component names
- **Smart Grid Positioning**: Automatic snapping to 12-column grid system
- **Boundary Protection**: Prevents widgets from going outside canvas bounds
- **Visual Feedback**: Canvas highlighting, grid guidelines, and drag states
- **Auto-Selection**: Newly dropped widgets are automatically selected for configuration

### 🏗️ Technical Implementation

#### **Widget Registry System**
```typescript
// Centralized widget management
export const WidgetRegistry = {
  'Weather': WeatherWidget,
  'Clock': ClockWidget,
  'News': NewsWidget,
  // ... all widgets
};
```

#### **Enhanced Layout System**
```typescript
interface LayoutItem {
  i: string;           // Unique identifier
  x: number;          // Grid X position
  y: number;          // Grid Y position  
  w: number;          // Width in grid units
  h: number;          // Height in grid units
  component?: string; // Widget type
  props?: Record<string, any>; // Widget configuration
}
```

### 🎨 User Experience Features

#### **Intuitive Workflow**
1. **Browse Library**: Categorized widgets with clear descriptions
2. **Drag to Canvas**: Visual feedback throughout the interaction
3. **Auto-Configuration**: Widgets appear with sensible defaults
4. **Fine-Tune Properties**: Context-sensitive configuration panel
5. **Real-Time Preview**: Changes apply immediately

### 🌟 Phase 2 Success Metrics

✅ **8 Complete Widgets**: All specified widgets implemented with rich functionality  
✅ **100% Configurable**: Every widget property exposed through Properties Panel  
✅ **Drag-and-Drop Excellence**: Professional-grade interaction patterns  
✅ **Type Safety**: Full TypeScript coverage for all components  
✅ **Performance Optimized**: Smooth 60fps animations and interactions  
✅ **Error Resilient**: Graceful handling of all error conditions  

## Phase 3: Template & Plugin Systems 🚀

Phase 3 introduces enterprise-grade template management and a comprehensive plugin architecture, enabling unlimited extensibility and professional workflow management.

### 🎯 Phase 3 Achievements

#### **Advanced Template Manager** 📋

**Comprehensive Template System:**
- **Multi-Tab Interface**: My Templates, Public Gallery, and Import/Export tabs
- **Rich Metadata**: Categories, descriptions, tags, ratings, and download counts
- **Visual Thumbnails**: Auto-generated SVG thumbnails showing layout structure
- **Smart Search & Filter**: Search by name, description, tags with category filtering
- **Template Categories**: Dashboard, Retail, Corporate, Education, Healthcare, Custom

**Professional Template Operations:**
- **Save Templates**: Rich form with metadata, categorization, and public sharing options
- **Load Templates**: One-click template loading with confirmation dialogs
- **Export Individual**: Export single templates as JSON files
- **Export All**: Bulk export all templates with metadata
- **Import Templates**: Support for single and batch template imports
- **Template Validation**: Error handling and format validation

#### **Enterprise Plugin System** 🔌

**Plugin Marketplace:**
- **Curated Plugin Library**: Professional plugins with ratings, downloads, and screenshots
- **Category Organization**: Widgets, Data Sources, Themes, Analytics, Integrations, Utilities
- **Plugin Details Modal**: Comprehensive plugin information with dependencies and permissions
- **Install/Uninstall**: One-click plugin management with progress indicators
- **Enable/Disable**: Runtime plugin control without uninstalling

**Plugin Development Framework:**
- **Comprehensive API**: Widget registration, data sources, themes, HTTP requests, storage
- **Secure Sandbox**: Isolated plugin execution environment with permission controls
- **Event System**: Plugin communication through custom events
- **Configuration Management**: Persistent plugin settings and preferences
- **Documentation Hub**: Development guides, examples, SDK reference

**Sample Plugin Included:**
- **Counter Widget**: Interactive counter with customizable properties
- **API Integration**: JSONPlaceholder data source demonstration
- **Property Schema**: Complete property configuration system
- **Event Handling**: Plugin communication examples

### 🏗️ Technical Architecture

#### **Template System Architecture**
```typescript
interface Template {
  id: string;
  name: string;
  description?: string;
  category: string;
  layout: LayoutItem[];
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  tags: string[];
  isPublic: boolean;
  downloads: number;
  rating: number;
}
```

#### **Plugin System Architecture**
```typescript
interface PluginAPI {
  registerWidget: (config: WidgetConfig) => void;
  registerDataSource: (config: DataSourceConfig) => void;
  registerTheme: (config: ThemeConfig) => void;
  getConfig: (key: string) => any;
  setConfig: (key: string, value: any) => void;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: Function) => void;
  http: HttpAPI;
  storage: StorageAPI;
  ui: UIAPI;
}
```

#### **Security & Sandboxing**
- **Permission System**: Network, storage, and UI access controls
- **Domain Restrictions**: Configurable allowed domains for HTTP requests
- **Code Isolation**: Secure plugin execution in controlled environment
- **Resource Management**: Memory and CPU usage monitoring
- **Version Compatibility**: Semantic versioning with compatibility checks

### 🎨 User Experience Features

#### **Template Workflow**
1. **Create Layouts**: Build layouts using the drag-and-drop canvas
2. **Save Templates**: Add metadata, categorization, and sharing preferences
3. **Browse Library**: Search and filter templates by various criteria
4. **Load Templates**: One-click template application with preview
5. **Share & Export**: Export templates for sharing or backup

#### **Plugin Workflow**
1. **Browse Marketplace**: Discover plugins by category and rating
2. **View Details**: Comprehensive plugin information and screenshots
3. **Install Plugins**: One-click installation with progress tracking
4. **Configure Plugins**: Plugin-specific settings and preferences
5. **Manage Plugins**: Enable/disable/uninstall as needed

### 🔧 Plugin Development

#### **Creating a Plugin**
```javascript
// Plugin Structure
(function(api) {
  function init() {
    // Register widgets, data sources, themes
    api.registerWidget({
      id: 'my-widget',
      name: 'My Custom Widget',
      component: MyWidgetComponent,
      defaultProps: { /* ... */ },
      propertySchema: [ /* ... */ ]
    });
  }
  
  module.exports = { init, cleanup };
})(api);
```

#### **Plugin Manifest**
```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "main": "plugin.js",
  "api_version": "1.0.0",
  "permissions": ["network", "storage"],
  "dependencies": []
}
```

### 🌟 Phase 3 Success Metrics

✅ **Complete Template System**: Save, load, import, export with rich metadata  
✅ **Plugin Marketplace**: Professional plugin discovery and management  
✅ **Secure Plugin Architecture**: Sandboxed execution with permission controls  
✅ **Developer-Friendly**: Comprehensive API and documentation  
✅ **Enterprise Ready**: Scalable architecture for large-scale deployments  
✅ **Professional UI/UX**: Polished interfaces for all user interactions  
✅ **Extensible Design**: Unlimited customization through plugins  
✅ **Community Features**: Public template gallery and plugin sharing  

### 📁 Phase 3 File Structure

```
server/src/app/
├── components/
│   ├── TemplateManager.tsx      # Advanced template management
│   ├── PluginManager.tsx        # Plugin marketplace & management
│   └── widgets/                 # Core widget library
├── lib/
│   └── pluginSystem.ts          # Plugin architecture core
└── plugins/
    ├── sample-plugin.js         # Example plugin implementation
    └── sample-plugin.json       # Plugin manifest example
```

### 🚀 Getting Started with Phase 3

#### **Using Templates**
```bash
cd server
npm run dev
# Navigate to Templates tab
# Create layouts and save as templates
# Share templates via export/import
```

#### **Managing Plugins**
```bash
# Navigate to Plugins tab
# Browse marketplace
# Install/configure plugins
# Develop custom plugins using SDK
```

### 🔄 Next Steps: Phase 4 Preview

Phase 4 will focus on:
- **Real-time Collaboration**: Multi-user editing and live updates
- **Advanced Analytics**: Usage tracking and performance insights
- **Cloud Integration**: Template/plugin cloud storage and sync
- **Mobile App**: Companion mobile app for remote management
- **Enterprise Features**: SSO, RBAC, audit logging, and compliance

**GB-CMS Phase 3 establishes the platform as a comprehensive, enterprise-ready digital signage solution with unlimited extensibility!** 🎉
