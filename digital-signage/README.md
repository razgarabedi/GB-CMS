Digital Signage Monorepo

Monorepo containing:
- `server/`: Node 18+, Express, simple JSON file DB, optional weather proxy, WebSocket, and admin UI
- `player/`: React (Vite) SPA that runs fullscreen

Requirements
- Node 18+
- Docker (optional, for docker-compose flow)

Environment Variables
- `PORT` (default: `3000`) – port for the server
- `API_KEY` – required for write/admin endpoints (header `X-Api-Key`)
- `OPENWEATHER_API_KEY` – optional, for weather proxy in the server
- `VITE_SERVER_URL` – used by the player to reach the server (e.g., `http://localhost:3000` or `http://server:3000` in compose)

Quick Start (Local without Docker)

Terminal 1:
```bash
cd server
npm install
$env:API_KEY="your_admin_key"         # PowerShell
$env:OPENWEATHER_API_KEY="your_key"   # optional
npm run dev
```

Terminal 2:
```bash
cd player
npm install
# Point the player to the server
# PowerShell
$env:VITE_SERVER_URL="http://localhost:3000"
npm run dev
```

Quick Start (Docker Compose)

From repo root:
```bash
# Powershell
$env:OPENWEATHER_API_KEY="your_key_here"
$env:API_KEY="your_admin_key"

docker compose up --build
```
- Server: http://localhost:3000
- Admin UI: http://localhost:3000/admin
- Player: http://localhost:5173
  - If using the production Nginx player image from compose, player is on http://localhost:8080

Server Scripts (inside `server/`)
- `npm run start` – start Express
- `npm run dev` – start with nodemon

API
- `GET /health` – health check
- `GET /api/screens` – list all registered configs
- `GET /api/config/:screenId` – get a configuration object for a screen
- `POST /api/config/:screenId` – update configuration (header `X-Api-Key: $API_KEY`)
- `GET /api/weather/:location?units=metric` – proxy to OpenWeather (caches 10 minutes; requires `OPENWEATHER_API_KEY`)
- WebSocket: `ws://<host>/ws`
  - Client sends `{ "type": "identify", "screenId": "screen-1" }` once connected
  - Server may push `{ "type": "configUpdated", "screenId": "screen-1" }` or `{ "type": "refresh" }`
- Push endpoints (admin):
  - `POST /api/push/:screenId/refresh` (header `X-Api-Key`)
  - `POST /api/push/broadcast/refresh` (header `X-Api-Key`)

Security and API Key Rotation
- All write/admin endpoints require `X-Api-Key: $API_KEY`.
- Rotate keys by:
  1. Generate a new key and set it as `API_KEY` on the server (env var or secret manager).
  2. Restart/reload the server process (Docker compose up, systemd restart, or PM2 reload).
  3. Update any admin tools or scripts to use the new key.
  4. Remove the old key from all environments.
- Never commit API keys to source control. Prefer environment variables or a secret manager.

Player Scripts (inside `player/`)
- `npm run dev` – Vite dev server
- `npm run build` – build static assets
- `npm run serve` – preview the built app

The player is a fullscreen SPA that cycles through slides. Configure content via the server or admin UI.

Build and Deploy Player to TV (Kiosk)
- Build the player:
  - `cd player && npm install && npm run build`
  - Output is in `player/dist/` (served by Nginx in Docker build)
- Kiosk launch flags (Chrome/Chromium):
  - `--kiosk --start-fullscreen --incognito --noerrdialogs --disable-infobars --disable-translate --disable-session-crashed-bubble --autoplay-policy=no-user-gesture-required --app=http://<host>:8080/player/<screenId>`
- See `docs/kiosk.md` for Raspberry Pi, Android TV, and ChromeOS guidance.

Known Limitations
- Some sites block embedding in iframes via X-Frame-Options/Content-Security-Policy; in that case, WebViewer shows a fallback link.
- Weather data is proxied via OpenWeather; API quotas and network failures may apply.
- Admin API relies on a single `API_KEY` secret; rotate keys and keep them out of source control.

## 🚀 Modular Digital Signage System - Quick Setup Guide

The digital signage system has been enhanced with a comprehensive modular architecture that provides:

### ✨ New Features
- **Dynamic Layout Engine**: Drag-and-drop visual layout editor
- **Component Library**: Extensible component system with standardized interfaces
- **Advanced Template System**: Parameterized templates with conditional logic
- **Plugin Architecture**: Extensible plugin system with marketplace
- **Enhanced Admin Interface**: Modern, intuitive management interface
- **Configuration Management**: Advanced configuration with validation and migration

### 🏗️ Architecture Overview

The modular system consists of 6 core components:

1. **Component Interfaces** (`src/types/ComponentInterfaces.ts`)
   - Standardized interfaces for all components
   - Base props: `theme`, `location`, `onError`, `onDataUpdate`, `refreshIntervalMs`

2. **Layout Engine** (`src/engine/LayoutEngine.ts`)
   - Dynamic component positioning and collision detection
   - Drag-and-drop functionality with grid snapping
   - Layout validation and persistence

3. **Configuration Management** (`src/engine/ConfigManager.ts`)
   - Extensible configuration schema
   - Validation and migration system
   - Template-based configuration generation

4. **Template System** (`src/engine/AdvancedTemplateEngine.ts`)
   - Parameterized templates with variables
   - Conditional logic and data transformations
   - Template marketplace and sharing

5. **Plugin Architecture** (`src/engine/PluginRegistry.ts`)
   - Plugin lifecycle management
   - Sandboxed execution environment
   - Plugin store and validation

6. **Enhanced UI** (`src/components/EnhancedAdminInterface.tsx`)
   - Visual layout editor
   - Component library sidebar
   - Properties panel for configuration
   - Real-time preview system

### 🚀 Quick Start - Modular System

#### Prerequisites
- Node.js 18+
- npm or yarn
- Modern web browser

#### 1. Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install player dependencies
cd ../player
npm install
```

#### 2. Set Environment Variables
```bash
# PowerShell
$env:API_KEY="your_admin_key"
$env:OPENWEATHER_API_KEY="your_weather_key"  # Optional
$env:VITE_SERVER_URL="http://localhost:3000"
```

#### 3. Start the System
```bash
# Terminal 1: Start the server
cd server
npm run dev

# Terminal 2: Start the player
cd player
npm run dev
```

#### 4. Access the Interfaces
- **Admin Interface**: http://localhost:3000/admin
- **Player**: http://localhost:5173
- **Enhanced Admin**: http://localhost:5173/admin (New modular interface)

### 🎨 Using the Enhanced Admin Interface

#### Creating a New Layout
1. Navigate to the **Design** tab
2. Drag components from the **Component Library** to the **Layout Canvas**
3. Configure component properties in the **Properties Panel**
4. Save your layout as a template

#### Managing Templates
1. Go to the **Templates** tab
2. Create new templates with variables and conditional logic
3. Import/export templates for sharing
4. Use the template marketplace for community templates

#### Installing Plugins
1. Access the **Plugins** tab
2. Browse the plugin store
3. Install and configure plugins
4. Monitor plugin health and performance

#### Preview and Testing
1. Use the **Preview** tab to test layouts
2. Simulate different device types
3. Monitor performance metrics
4. Test real-time updates

### 🔧 Development

#### Adding New Components
1. Create component in `src/components/`
2. Implement the interface from `ComponentInterfaces.ts`
3. Add to component library in `ComponentLibrary.tsx`
4. Register in the layout engine

#### Creating Plugins
1. Define plugin manifest in `PluginTypes.ts`
2. Implement plugin lifecycle methods
3. Add to plugin registry
4. Test in sandbox environment

#### Extending Templates
1. Define template variables and logic
2. Implement conditional rendering
3. Add to template engine
4. Create template builder UI

### 📁 Key Files and Directories

```
digital-signage/
├── player/src/
│   ├── types/
│   │   ├── ComponentInterfaces.ts    # Component interfaces
│   │   ├── LayoutTypes.ts           # Layout engine types
│   │   ├── ConfigTypes.ts           # Configuration types
│   │   ├── TemplateTypes.ts         # Template system types
│   │   ├── PluginTypes.ts           # Plugin architecture types
│   │   └── UITypes.ts               # UI component types
│   ├── engine/
│   │   ├── LayoutEngine.ts          # Dynamic layout engine
│   │   ├── ConfigManager.ts         # Configuration management
│   │   ├── AdvancedTemplateEngine.ts # Template system
│   │   ├── PluginRegistry.ts        # Plugin management
│   │   └── ...
│   ├── components/
│   │   ├── EnhancedAdminInterface.tsx # Main admin interface
│   │   ├── EnhancedLayoutCanvas.tsx   # Visual layout editor
│   │   ├── ComponentLibrary.tsx       # Component palette
│   │   ├── PropertiesPanel.tsx        # Component configuration
│   │   ├── TemplateManager.tsx        # Template management
│   │   ├── PluginManagerUI.tsx        # Plugin interface
│   │   └── PreviewSystem.tsx          # Real-time preview
│   └── routes/
│       └── DynamicPlayer.tsx         # New modular player
└── docs/
    ├── step-1.md                     # Component interfaces
    ├── step-2.md                     # Layout engine
    ├── step-3.md                     # Configuration management
    ├── step-4.md                     # Template system
    ├── step-5.md                     # Plugin architecture
    └── step-6.md                     # Enhanced UI
```

### 🐛 Troubleshooting

#### Common Issues
1. **TypeScript Errors**: Run `npm run build` to check for type issues
2. **Component Not Loading**: Verify component implements required interfaces
3. **Layout Not Saving**: Check localStorage permissions and disk space
4. **Plugin Errors**: Check plugin manifest and sandbox logs

#### Debug Mode
```bash
# Enable debug logging
$env:DEBUG="signage:*"
npm run dev
```

### 🔄 Migration from Legacy System

The modular system is backward compatible with existing configurations:

1. **Automatic Migration**: Existing `db.json` configurations are automatically migrated
2. **Legacy Support**: Old layout types (`grid`, `grid-slideshow`, etc.) still work
3. **Gradual Adoption**: Mix old and new components in the same layout

### 📚 Documentation

- **Step 1**: Component Interfaces - `docs/step-1.md`
- **Step 2**: Layout Engine - `docs/step-2.md`
- **Step 3**: Configuration Management - `docs/step-3.md`
- **Step 4**: Template System - `docs/step-4.md`
- **Step 5**: Plugin Architecture - `docs/step-5.md`
- **Step 6**: Enhanced UI - `docs/step-6.md`

### 🚀 Next Steps & Advanced Features
- Playlist scheduling by time/day, calendar-based overrides.
- Multiple layout zones and templates per screen.
- Asset management and offline cache for resilience.
- Telemetry/analytics: uptime, last check-in, error rates, content impressions.
- Role-based admin auth and audit logging.
- Advanced plugin marketplace with monetization
- Real-time collaboration on layouts
- AI-powered layout suggestions
- Advanced analytics and reporting


