# GB-CMS System Architecture

## Overview

GB-CMS (Giant Board Content Management System) is a modern, React-based digital signage management platform built with TypeScript and Next.js. The system follows a component-based architecture with a focus on modularity, scalability, and user experience.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GB-CMS System                            │
├─────────────────────────────────────────────────────────────┤
│  Frontend Layer (React/Next.js)                            │
│  ├── User Interface Components                             │
│  ├── Layout Management System                              │
│  ├── Widget System                                         │
│  ├── Preview System                                        │
│  └── Help & Onboarding System                             │
├─────────────────────────────────────────────────────────────┤
│  State Management Layer                                    │
│  ├── React Context API                                     │
│  ├── Local Storage                                         │
│  └── Component State                                       │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                │
│  ├── Template Storage                                      │
│  ├── Widget Registry                                       │
│  ├── Plugin System                                         │
│  └── Configuration Management                              │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Layout System
- **LayoutCanvas**: Main workspace for designing layouts
- **ComponentLibrary**: Widget selection and management
- **PropertiesPanel**: Widget configuration interface
- **VisualPropertyEditor**: Advanced styling controls

### 2. Widget System
- **WidgetRegistry**: Central registry for all widgets
- **DefaultWidgetProps**: Default configuration for widgets
- **Widget Components**: Individual widget implementations
- **Widget Lifecycle**: Creation, update, and destruction

### 3. Preview System
- **PreviewSystem**: Live preview with device simulation
- **ResponsivePreview**: Multi-device testing
- **DeviceSimulation**: Different screen size testing
- **Real-time Updates**: Live preview updates

### 4. Template System
- **TemplateManager**: Template CRUD operations
- **TemplateStorage**: Local storage management
- **TemplateImportExport**: Template sharing
- **TemplateMarketplace**: Template discovery

### 5. Plugin System
- **PluginManager**: Plugin lifecycle management
- **PluginRegistry**: Plugin discovery and loading
- **PluginAPI**: Plugin development interface
- **PluginMarketplace**: Plugin distribution

### 6. Help System
- **OnboardingSystem**: User onboarding flow
- **HelpSystem**: Contextual help and documentation
- **TutorialSystem**: Interactive tutorials
- **TooltipSystem**: Inline help and hints

## File Structure

```
server/src/app/
├── components/                 # React components
│   ├── LayoutCanvas.tsx       # Main layout workspace
│   ├── ComponentLibrary.tsx   # Widget library
│   ├── PropertiesPanel.tsx    # Property editor
│   ├── PreviewSystem.tsx      # Live preview
│   ├── TemplateManager.tsx    # Template management
│   ├── PluginManager.tsx      # Plugin management
│   ├── HelpManager.tsx        # Help system coordinator
│   ├── OnboardingSystem.tsx   # User onboarding
│   ├── HelpSystem.tsx         # Help documentation
│   ├── TutorialSystem.tsx     # Interactive tutorials
│   ├── TooltipSystem.tsx      # Contextual tooltips
│   ├── VisualPropertyEditor.tsx # Advanced styling
│   ├── DragDropSystem.tsx     # Drag and drop functionality
│   ├── DragVisualFeedback.tsx # Visual feedback components
│   └── widgets/               # Widget implementations
│       ├── ClockWidget.tsx
│       ├── WeatherWidget.tsx
│       ├── NewsWidget.tsx
│       └── ...
├── hooks/                     # Custom React hooks
│   └── useHydration.ts        # SSR hydration handling
├── docs/                      # Documentation
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── USER_GUIDE.md
│   └── ...
└── page.tsx                   # Main application entry point
```

## Data Flow

### 1. Layout Creation Flow
```
User Action → ComponentLibrary → LayoutCanvas → PropertiesPanel → PreviewSystem
     ↓              ↓                ↓              ↓              ↓
  Widget Add → State Update → Visual Update → Property Edit → Live Preview
```

### 2. Template Management Flow
```
Template Save → TemplateManager → LocalStorage → TemplateManager → Template Load
     ↓              ↓                ↓              ↓              ↓
  Layout Data → Validation → Persistence → Retrieval → Layout Restore
```

### 3. Plugin Management Flow
```
Plugin Install → PluginManager → PluginRegistry → WidgetRegistry → ComponentLibrary
     ↓              ↓                ↓              ↓              ↓
  Plugin Load → Validation → Registration → Widget Add → UI Update
```

## State Management

### 1. Component State
- **Local State**: Component-specific data using `useState`
- **Props**: Data passed between components
- **Context**: Shared state across component tree

### 2. Persistent State
- **LocalStorage**: Templates, settings, and user preferences
- **SessionStorage**: Temporary data and session state
- **IndexedDB**: Large data and offline support (future)

### 3. State Patterns
- **Lifting State Up**: Shared state moved to common parent
- **State Composition**: Complex state broken into smaller pieces
- **State Normalization**: Consistent data structure across components

## Component Architecture

### 1. Component Hierarchy
```
App
├── HelpManager
│   ├── OnboardingSystem
│   ├── HelpSystem
│   └── TutorialSystem
├── LayoutCanvas
│   ├── Widget Components
│   └── DragDropSystem
├── ComponentLibrary
│   └── Widget Cards
├── PropertiesPanel
│   ├── Property Forms
│   └── VisualPropertyEditor
├── PreviewSystem
│   └── Device Simulators
└── TemplateManager
    └── Template Cards
```

### 2. Component Communication
- **Props Down**: Data passed from parent to child
- **Events Up**: Actions passed from child to parent
- **Context**: Shared state across component tree
- **Refs**: Direct component access when needed

## Performance Considerations

### 1. Rendering Optimization
- **React.memo**: Prevent unnecessary re-renders
- **useMemo**: Memoize expensive calculations
- **useCallback**: Memoize event handlers
- **Lazy Loading**: Load components on demand

### 2. Memory Management
- **Cleanup**: Proper cleanup in useEffect
- **Event Listeners**: Remove listeners on unmount
- **Timers**: Clear intervals and timeouts
- **References**: Avoid memory leaks

### 3. Bundle Optimization
- **Code Splitting**: Split code by routes/features
- **Tree Shaking**: Remove unused code
- **Dynamic Imports**: Load modules on demand
- **Asset Optimization**: Optimize images and assets

## Security Considerations

### 1. Input Validation
- **Sanitization**: Clean user inputs
- **Validation**: Validate data types and formats
- **XSS Prevention**: Prevent script injection
- **CSRF Protection**: Cross-site request forgery prevention

### 2. Data Protection
- **Local Storage**: Sensitive data encryption
- **API Security**: Secure API endpoints
- **Authentication**: User authentication system
- **Authorization**: Role-based access control

## Scalability

### 1. Horizontal Scaling
- **Stateless Components**: No server-side state
- **CDN Integration**: Static asset delivery
- **Load Balancing**: Distribute traffic
- **Microservices**: Break into smaller services

### 2. Vertical Scaling
- **Performance Monitoring**: Track performance metrics
- **Resource Optimization**: Optimize CPU and memory usage
- **Caching**: Implement caching strategies
- **Database Optimization**: Optimize queries and indexes

## Future Enhancements

### 1. Planned Features
- **Real-time Collaboration**: Multi-user editing
- **Cloud Storage**: Cloud-based template storage
- **Advanced Analytics**: Usage analytics and insights
- **Mobile App**: Mobile companion app

### 2. Technical Improvements
- **Server-Side Rendering**: Full SSR implementation
- **Progressive Web App**: PWA capabilities
- **Offline Support**: Offline functionality
- **Performance Monitoring**: Real-time performance tracking

## Development Guidelines

### 1. Code Standards
- **TypeScript**: Strict type checking
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality checks

### 2. Testing Strategy
- **Unit Tests**: Component testing
- **Integration Tests**: Feature testing
- **E2E Tests**: End-to-end testing
- **Visual Regression**: UI testing

### 3. Documentation
- **Code Comments**: Inline documentation
- **API Documentation**: Comprehensive API docs
- **User Guides**: User-facing documentation
- **Developer Guides**: Technical documentation

---

*This architecture document provides a comprehensive overview of the GB-CMS system structure and design principles.*
