# API Reference Guide

## Quick Start

### Backend Server
```bash
cd digital-signage/server
npm start
# Server runs on http://localhost:3000
```

### Frontend Player
```bash
cd digital-signage/player
npm run dev
# Frontend runs on http://localhost:5173
```

### Admin Interface
```
http://localhost:5173/admin
```

## API Endpoints Quick Reference

### Components
```bash
# Get all components
GET /api/admin/components

# Get specific component
GET /api/admin/components/:id

# Create/update component
POST /api/admin/components
Headers: X-API-Key: your-api-key
Body: { "id": "component-id", "name": "Component Name", ... }

# Delete component
DELETE /api/admin/components/:id
Headers: X-API-Key: your-api-key
```

### Templates
```bash
# Get all templates
GET /api/admin/templates

# Get specific template
GET /api/admin/templates/:id

# Create/update template
POST /api/admin/templates
Headers: X-API-Key: your-api-key
Body: { "id": "template-id", "name": "Template Name", ... }

# Delete template
DELETE /api/admin/templates/:id
Headers: X-API-Key: your-api-key
```

### Plugins
```bash
# Get all plugins
GET /api/admin/plugins

# Install plugin
POST /api/admin/plugins/:id/install
Headers: X-API-Key: your-api-key

# Uninstall plugin
POST /api/admin/plugins/:id/uninstall
Headers: X-API-Key: your-api-key
```

### Layouts
```bash
# Get all layouts
GET /api/admin/layouts

# Save layout
POST /api/admin/layouts
Headers: X-API-Key: your-api-key
Body: { "id": "layout-id", "components": [...], ... }

# Delete layout
DELETE /api/admin/layouts/:id
Headers: X-API-Key: your-api-key
```

### Configurations
```bash
# Get all configurations
GET /api/admin/configs

# Get screen configuration
GET /api/admin/configs/:screenId

# Save screen configuration
POST /api/admin/configs/:screenId
Headers: X-API-Key: your-api-key
Body: { "screenId": "screen1", "theme": {...}, ... }
```

### Analytics
```bash
# Get system analytics
GET /api/admin/analytics

# Get system health
GET /api/admin/health
```

## Frontend Usage

### Using API Hooks
```typescript
import { useComponentLibrary, useTemplateManager } from '../hooks/useAdminAPI';

function MyComponent() {
  const { components, loading, error, saveComponent } = useComponentLibrary();
  const { templates, saveTemplate } = useTemplateManager();

  const handleSave = async () => {
    try {
      await saveComponent({
        id: 'new-component',
        name: 'New Component',
        category: 'widget'
      });
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {components.map(comp => (
        <div key={comp.id}>{comp.name}</div>
      ))}
    </div>
  );
}
```

### Using API Service Directly
```typescript
import { AdminAPI } from '../services/AdminAPI';

// Get all components
const components = await AdminAPI.components.getAll();

// Save a component
const saved = await AdminAPI.components.save({
  id: 'weather-widget',
  name: 'Weather Widget',
  category: 'widget'
});

// Install a plugin
await AdminAPI.plugins.install('social-media-plugin');
```

## Data Structures

### Component
```typescript
interface Component {
  id: string;
  name: string;
  description: string;
  category: 'widget' | 'layout' | 'utility' | 'service' | 'theme' | 'integration' | 'custom' | 'plugin';
  icon: {
    name: string;
    type: 'material' | 'fontawesome' | 'svg' | 'custom';
    data?: string;
  };
  component: string;
  propsSchema: JSONSchema;
  defaultProps: Record<string, any>;
  tags: string[];
  status: 'available' | 'installing' | 'error' | 'disabled';
  isPlugin: boolean;
  version: string;
  author: string;
}
```

### Template
```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail?: string;
  preview?: string;
  components: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    props: Record<string, any>;
  }>;
  zones: any[];
  size: { width: number; height: number };
  grid: {
    cellSize: number;
    gap: number;
    columns: number;
    rows: number;
  };
  tags: string[];
  author: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  isBuiltIn: boolean;
  isCustom: boolean;
  downloads: number;
  rating: number;
  reviews: number;
}
```

### Plugin
```typescript
interface Plugin {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  author: string;
  status: 'available' | 'installed' | 'error';
  isInstalled: boolean;
  isEnabled: boolean;
  icon: {
    name: string;
    type: 'material' | 'fontawesome' | 'svg' | 'custom';
    data?: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
  installedAt?: string;
}
```

## Environment Variables

### Backend (.env)
```bash
# API Authentication
API_KEY=your-secret-api-key
ADMIN_API_KEY=your-admin-api-key

# Server Configuration
PORT=3000

# Weather API (existing)
OPENWEATHER_API_KEY=your-openweather-key
```

### Frontend (.env)
```bash
# API Configuration
VITE_API_KEY=your-secret-api-key
```

## Error Handling

### Common Error Responses
```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

### Frontend Error Handling
```typescript
try {
  const result = await AdminAPI.components.save(component);
} catch (error) {
  console.error('API Error:', error.message);
  // Handle error (show notification, retry, etc.)
}
```

## Testing the API

### Using curl
```bash
# Get all components
curl http://localhost:3000/api/admin/components

# Save a component (requires API key)
curl -X POST http://localhost:3000/api/admin/components \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"id":"test-component","name":"Test Component","category":"widget"}'

# Get system health
curl http://localhost:3000/api/admin/health
```

### Using Postman
1. Import the API collection
2. Set base URL: `http://localhost:3000`
3. Add API key to headers: `X-API-Key: your-api-key`
4. Test endpoints

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend server is running
   - Check CORS configuration

2. **401 Unauthorized**
   - Verify API key is correct
   - Check environment variables

3. **Data Not Loading**
   - Check JSON data files exist
   - Verify file permissions
   - Check server logs

4. **Build Errors**
   - Run `npm run build` to see detailed errors
   - Check TypeScript configuration
   - Verify all imports are correct

### Debug Mode
```bash
# Enable debug logging
DEBUG=admin-api npm start
```

## File Locations

### Backend Files
- `server/routes/admin.js` - API routes
- `server/data/*.json` - Data storage
- `server/index.js` - Main server file

### Frontend Files
- `player/src/services/AdminAPI.ts` - API client
- `player/src/hooks/useAdminAPI.ts` - React hooks
- `player/src/routes/AdminInterface.tsx` - Main interface

### Documentation
- `docs/backend-integration.md` - Complete documentation
- `docs/api-reference.md` - This quick reference
