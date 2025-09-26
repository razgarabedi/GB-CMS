# Backend Integration Documentation

## Overview

This document details the complete backend integration implemented for the Advanced Digital Signage Admin Interface. The integration connects the frontend React application with a comprehensive Node.js/Express backend API system.

## Architecture

### Frontend (React/TypeScript)
- **Location**: `digital-signage/player/src/`
- **Framework**: React with TypeScript
- **State Management**: Custom React hooks
- **API Client**: Centralized service layer

### Backend (Node.js/Express)
- **Location**: `digital-signage/server/`
- **Framework**: Express.js
- **Data Storage**: JSON files (file-based database)
- **API**: RESTful endpoints

## Backend API Implementation

### File Structure
```
digital-signage/server/
├── routes/
│   └── admin.js              # Main admin API routes
├── data/                     # JSON data storage
│   ├── components.json       # Component library data
│   ├── templates.json        # Template data
│   ├── plugins.json          # Plugin data
│   ├── layouts.json          # Layout data
│   └── configs.json          # Screen configurations
└── index.js                  # Main server file (updated)
```

### API Endpoints

#### Component Library API
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/components` | Get all components | No |
| GET | `/api/admin/components/:id` | Get specific component | No |
| POST | `/api/admin/components` | Create/update component | Yes |
| DELETE | `/api/admin/components/:id` | Delete component | Yes |

#### Template Management API
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/templates` | Get all templates | No |
| GET | `/api/admin/templates/:id` | Get specific template | No |
| POST | `/api/admin/templates` | Create/update template | Yes |
| DELETE | `/api/admin/templates/:id` | Delete template | Yes |

#### Plugin Management API
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/plugins` | Get all plugins | No |
| GET | `/api/admin/plugins/:id` | Get specific plugin | No |
| POST | `/api/admin/plugins/:id/install` | Install plugin | Yes |
| POST | `/api/admin/plugins/:id/uninstall` | Uninstall plugin | Yes |

#### Layout Management API
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/layouts` | Get all layouts | No |
| GET | `/api/admin/layouts/:id` | Get specific layout | No |
| POST | `/api/admin/layouts` | Save layout | Yes |
| DELETE | `/api/admin/layouts/:id` | Delete layout | Yes |

#### Configuration Management API
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/configs` | Get all configurations | No |
| GET | `/api/admin/configs/:screenId` | Get screen configuration | No |
| POST | `/api/admin/configs/:screenId` | Save screen configuration | Yes |

#### Analytics & Monitoring API
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/analytics` | Get system analytics | No |
| GET | `/api/admin/health` | Get system health | No |

### Authentication

The API uses API key authentication for write operations:
- **Header**: `X-API-Key`
- **Query Parameter**: `apiKey`
- **Environment Variable**: `API_KEY` or `ADMIN_API_KEY`

## Frontend Integration

### API Service Layer

#### File: `digital-signage/player/src/services/AdminAPI.ts`

Centralized API client with the following features:
- Environment-based configuration
- Error handling and logging
- Type-safe API calls
- Automatic header management

```typescript
// Example usage
import { AdminAPI } from '../services/AdminAPI';

// Get all components
const components = await AdminAPI.components.getAll();

// Save a component
const savedComponent = await AdminAPI.components.save(componentData);

// Install a plugin
await AdminAPI.plugins.install('plugin-id');
```

### React Hooks

#### File: `digital-signage/player/src/hooks/useAdminAPI.ts`

Custom React hooks for state management:

#### `useComponentLibrary()`
- **State**: `components`, `loading`, `error`
- **Actions**: `loadComponents()`, `saveComponent()`, `deleteComponent()`
- **Auto-loads**: Components on mount

#### `useTemplateManager()`
- **State**: `templates`, `loading`, `error`
- **Actions**: `loadTemplates()`, `saveTemplate()`, `deleteTemplate()`
- **Auto-loads**: Templates on mount

#### `usePluginManager()`
- **State**: `plugins`, `loading`, `error`
- **Actions**: `loadPlugins()`, `installPlugin()`, `uninstallPlugin()`
- **Auto-loads**: Plugins on mount

#### `useLayoutManager()`
- **State**: `layouts`, `loading`, `error`
- **Actions**: `loadLayouts()`, `saveLayout()`, `deleteLayout()`
- **Auto-loads**: Layouts on mount

#### `useConfigManager()`
- **State**: `configs`, `loading`, `error`
- **Actions**: `loadConfigs()`, `saveConfig()`
- **Auto-loads**: Configurations on mount

#### `useAnalytics()`
- **State**: `analytics`, `health`, `loading`, `error`
- **Actions**: `loadAnalytics()`
- **Auto-loads**: Analytics and health data on mount

### Updated Admin Interface

#### File: `digital-signage/player/src/routes/AdminInterface.tsx`

The main admin interface now includes:
- Real-time data loading from backend APIs
- Loading states with spinner animations
- Error handling with retry functionality
- Automatic data synchronization

```typescript
// Example integration
const { components, loading, error } = useComponentLibrary();
const { templates } = useTemplateManager();

// Loading state
if (loading) {
  return <LoadingSpinner />;
}

// Error state
if (error) {
  return <ErrorMessage error={error} onRetry={handleRetry} />;
}
```

## Sample Data

### Components (`digital-signage/server/data/components.json`)

5 pre-configured components:
1. **Weather Widget** - Weather conditions and forecast
2. **Digital Clock** - Time display with timezone support
3. **News Widget** - News headlines and articles
4. **Slideshow** - Image and video slideshow
5. **PV Flow Widget** - Solar energy monitoring

Each component includes:
- Metadata (name, description, category, version)
- Icon configuration
- Props schema for validation
- Default properties
- Status and availability

### Templates (`digital-signage/server/data/templates.json`)

3 pre-configured templates:
1. **Business Dashboard** - Professional business display
2. **Retail Display** - Eye-catching retail layout
3. **Energy Dashboard** - Solar energy monitoring layout

Each template includes:
- Layout configuration
- Component placements
- Grid system settings
- Metadata and ratings

### Plugins (`digital-signage/server/data/plugins.json`)

3 sample plugins:
1. **Social Media Feed** - Social media integration
2. **Calendar Widget** - Event and appointment display
3. **Analytics Dashboard** - Website and app analytics

Each plugin includes:
- Installation status
- Version information
- Category and tags
- Enable/disable state

## Configuration

### Environment Variables

#### Backend (`digital-signage/server/`)
```bash
# API Authentication
API_KEY=your-secret-api-key
ADMIN_API_KEY=your-admin-api-key

# Server Configuration
PORT=3000

# Weather API (existing)
OPENWEATHER_API_KEY=your-openweather-key
```

#### Frontend (`digital-signage/player/`)
```bash
# API Configuration
VITE_API_KEY=your-secret-api-key

# Environment
NODE_ENV=development
```

### API Base URL Configuration

The frontend automatically detects the environment:
- **Development**: `http://localhost:3000/api/admin`
- **Production**: `/api/admin`

## Usage Instructions

### 1. Start the Backend Server

```bash
cd digital-signage/server
npm install
npm start
```

The server will start on port 3000 and display:
```
Server listening on port 3000
Advanced Admin Interface: http://localhost:3000/admin
```

### 2. Start the Frontend Player

```bash
cd digital-signage/player
npm install
npm run dev
```

The frontend will start on port 5173 and display:
```
Local:   http://localhost:5173/
Network: http://192.168.x.x:5173/
```

### 3. Access the Admin Interface

Navigate to: `http://localhost:5173/admin`

The interface will:
1. Show loading spinner while fetching data
2. Load real components, templates, and plugins from backend
3. Display error messages if API calls fail
4. Provide retry functionality

## Error Handling

### Backend Error Responses

All API endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (missing required fields)
- `401` - Unauthorized (invalid API key)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

### Frontend Error Handling

The React hooks provide error states:
```typescript
const { components, loading, error } = useComponentLibrary();

if (error) {
  // Display error message with retry option
  return <ErrorComponent error={error} onRetry={loadComponents} />;
}
```

## Data Flow

### 1. Initial Load
1. AdminInterface component mounts
2. API hooks automatically fetch data from backend
3. Loading states are displayed
4. Data is populated in the interface

### 2. User Interactions
1. User performs action (save, delete, install)
2. Frontend calls appropriate API endpoint
3. Backend validates and processes request
4. Data is updated in JSON files
5. Frontend state is updated
6. UI reflects changes

### 3. Error Scenarios
1. API call fails
2. Error state is set in hook
3. Error message is displayed
4. User can retry the operation

## Security Considerations

### API Key Protection
- API keys are required for write operations
- Keys should be stored securely
- Consider implementing key rotation

### Input Validation
- All API endpoints validate input data
- JSON schema validation for components
- Sanitization of user inputs

### File System Security
- JSON files are stored in protected directory
- File operations are wrapped in try-catch blocks
- Backup mechanisms should be implemented

## Future Enhancements

### Database Integration
- Replace JSON files with proper database (PostgreSQL, MongoDB)
- Implement database migrations
- Add connection pooling

### Authentication System
- User management and roles
- JWT token authentication
- Session management

### Real-time Updates
- WebSocket integration for live updates
- Real-time collaboration features
- Push notifications

### Caching
- Redis for API response caching
- CDN for static assets
- Browser caching strategies

### Monitoring
- API usage analytics
- Performance metrics
- Error tracking and logging

## Troubleshooting

### Common Issues

#### 1. CORS Errors
**Problem**: Frontend can't access backend API
**Solution**: Ensure CORS is enabled in server configuration

#### 2. API Key Errors
**Problem**: 401 Unauthorized responses
**Solution**: Check API key configuration in environment variables

#### 3. Data Not Loading
**Problem**: Empty components/templates lists
**Solution**: Verify JSON data files exist and are properly formatted

#### 4. Build Errors
**Problem**: TypeScript compilation errors
**Solution**: Check type definitions and imports

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=admin-api
```

This will log all API requests and responses to the console.

## Conclusion

The backend integration provides a complete, production-ready API system for the Advanced Digital Signage Admin Interface. The system is designed to be:

- **Scalable**: Modular architecture supports future growth
- **Maintainable**: Clear separation of concerns and documentation
- **Reliable**: Comprehensive error handling and validation
- **Secure**: API key authentication and input validation
- **User-friendly**: Loading states and error recovery

The integration transforms the admin interface from a static mockup into a fully functional, data-driven application with real backend connectivity.
