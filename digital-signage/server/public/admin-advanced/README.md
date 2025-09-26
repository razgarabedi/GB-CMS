# Advanced Digital Signage Admin Interface

This is the advanced admin interface for the Digital Signage system, now hosted on the server backend.

## Features

- **Component Library**: Browse and manage available components
- **Template Management**: Create and manage layout templates
- **Plugin System**: Install and manage plugins
- **Layout Canvas**: Drag-and-drop interface for creating layouts
- **Preview System**: Real-time preview of your designs
- **Settings**: System configuration and management

## Access

- **URL**: `http://localhost:3000/admin-advanced`
- **Basic Admin**: `http://localhost:3000/admin` (legacy interface)

## Architecture

This interface is built as a standalone React application that runs in the browser and communicates with the server's API endpoints:

- **Frontend**: React 18 with Tailwind CSS
- **Backend**: Node.js/Express API endpoints
- **Data**: JSON files in `/server/data/`

## API Endpoints

The interface communicates with these server endpoints:

- `GET /api/admin/components` - Get all components
- `GET /api/admin/templates` - Get all templates  
- `GET /api/admin/plugins` - Get all plugins
- `GET /api/admin/layouts` - Get all layouts
- `GET /api/admin/analytics` - Get system analytics
- `GET /api/admin/health` - Get system health

## Development

The interface is self-contained in a single HTML file with embedded React components. No build process is required - it runs directly in the browser.

## Migration from Player

The admin interface has been moved from the player application to the server to:

1. **Separate concerns**: Player focuses on display, server handles administration
2. **Better performance**: Admin interface doesn't need to be bundled with player
3. **Easier maintenance**: Admin interface can be updated independently
4. **Centralized management**: All admin functions are now in one place

## Player Integration

The player now redirects admin requests to the server:
- `/admin` in player → redirects to `http://localhost:3000/admin-advanced`
- Player focuses purely on content display
- Admin interface is completely separate
