/**
 * Advanced Admin API Routes
 * 
 * Provides backend APIs for the new modular digital signage admin interface
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Middleware for API key validation
const requireApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  const validApiKey = process.env.API_KEY || process.env.ADMIN_API_KEY;
  
  if (!validApiKey || apiKey !== validApiKey) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }
  next();
};

// Data file paths
const dataDir = path.join(__dirname, '../data');
const componentsFile = path.join(dataDir, 'components.json');
const templatesFile = path.join(dataDir, 'templates.json');
const pluginsFile = path.join(dataDir, 'plugins.json');
const layoutsFile = path.join(dataDir, 'layouts.json');
const configsFile = path.join(dataDir, 'configs.json');

// Ensure data files exist
function ensureDataFiles() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const defaultData = {
    components: [],
    templates: [],
    plugins: [],
    layouts: [],
    configs: {}
  };
  
  Object.entries(defaultData).forEach(([key, value]) => {
    const filePath = path.join(dataDir, `${key}.json`);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
    }
  });
}

ensureDataFiles();

// Helper functions
function readJsonFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ============================================================================
// TEST ENDPOINT
// ============================================================================

// Test endpoint to verify API is working
router.get('/api/admin/test', (req, res) => {
  console.log('🧪 GET /api/admin/test - Test endpoint called');
  res.json({ 
    status: 'ok', 
    message: 'Admin API is working!',
    timestamp: new Date().toISOString(),
    dataFiles: {
      components: componentsFile,
      templates: templatesFile,
      plugins: pluginsFile,
      layouts: layoutsFile,
      configs: configsFile
    }
  });
});

// ============================================================================
// COMPONENT LIBRARY API
// ============================================================================

// Get all components
router.get('/api/admin/components', (req, res) => {
  console.log('🔗 GET /api/admin/components - Request received');
  console.log('📋 Headers:', req.headers);
  console.log('🔍 Query params:', req.query);
  
  try {
    console.log('📁 Reading components from file:', componentsFile);
    const components = readJsonFile(componentsFile);
    console.log('✅ Components loaded from file:', components.length, 'items');
    console.log('📦 Components data:', components);
    res.json(components);
  } catch (error) {
    console.error('❌ Error reading components file:', error);
    res.status(500).json({ error: 'Failed to fetch components' });
  }
});

// Get component by ID
router.get('/api/admin/components/:id', (req, res) => {
  try {
    const components = readJsonFile(componentsFile);
    const component = components.find(c => c.id === req.params.id);
    
    if (!component) {
      return res.status(404).json({ error: 'Component not found' });
    }
    
    res.json(component);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch component' });
  }
});

// Create or update component
router.post('/api/admin/components', requireApiKey, (req, res) => {
  try {
    const components = readJsonFile(componentsFile);
    const component = req.body;
    
    if (!component.id) {
      return res.status(400).json({ error: 'Component ID is required' });
    }
    
    const existingIndex = components.findIndex(c => c.id === component.id);
    
    if (existingIndex >= 0) {
      components[existingIndex] = { ...components[existingIndex], ...component };
    } else {
      components.push(component);
    }
    
    writeJsonFile(componentsFile, components);
    res.json(component);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save component' });
  }
});

// Delete component
router.delete('/api/admin/components/:id', requireApiKey, (req, res) => {
  try {
    const components = readJsonFile(componentsFile);
    const filteredComponents = components.filter(c => c.id !== req.params.id);
    
    writeJsonFile(componentsFile, filteredComponents);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete component' });
  }
});

// ============================================================================
// TEMPLATE MANAGEMENT API
// ============================================================================

// Get all templates
router.get('/api/admin/templates', (req, res) => {
  console.log('🔗 GET /api/admin/templates - Request received');
  console.log('📋 Headers:', req.headers);
  console.log('🔍 Query params:', req.query);
  
  try {
    console.log('📁 Reading templates from file:', templatesFile);
    const templates = readJsonFile(templatesFile);
    console.log('✅ Templates loaded from file:', templates.length, 'items');
    console.log('📦 Templates data:', templates);
    res.json(templates);
  } catch (error) {
    console.error('❌ Error reading templates file:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Get template by ID
router.get('/api/admin/templates/:id', (req, res) => {
  try {
    const templates = readJsonFile(templatesFile);
    const template = templates.find(t => t.id === req.params.id);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// Create or update template
router.post('/api/admin/templates', requireApiKey, (req, res) => {
  try {
    const templates = readJsonFile(templatesFile);
    const template = req.body;
    
    if (!template.id) {
      return res.status(400).json({ error: 'Template ID is required' });
    }
    
    const existingIndex = templates.findIndex(t => t.id === template.id);
    
    if (existingIndex >= 0) {
      templates[existingIndex] = { ...templates[existingIndex], ...template };
    } else {
      templates.push(template);
    }
    
    writeJsonFile(templatesFile, templates);
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save template' });
  }
});

// Delete template
router.delete('/api/admin/templates/:id', requireApiKey, (req, res) => {
  try {
    const templates = readJsonFile(templatesFile);
    const filteredTemplates = templates.filter(t => t.id !== req.params.id);
    
    writeJsonFile(templatesFile, filteredTemplates);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// ============================================================================
// PLUGIN MANAGEMENT API
// ============================================================================

// Get all plugins
router.get('/api/admin/plugins', (req, res) => {
  try {
    const plugins = readJsonFile(pluginsFile);
    res.json(plugins);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch plugins' });
  }
});

// Get plugin by ID
router.get('/api/admin/plugins/:id', (req, res) => {
  try {
    const plugins = readJsonFile(pluginsFile);
    const plugin = plugins.find(p => p.id === req.params.id);
    
    if (!plugin) {
      return res.status(404).json({ error: 'Plugin not found' });
    }
    
    res.json(plugin);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch plugin' });
  }
});

// Install plugin
router.post('/api/admin/plugins/:id/install', requireApiKey, (req, res) => {
  try {
    const plugins = readJsonFile(pluginsFile);
    const plugin = plugins.find(p => p.id === req.params.id);
    
    if (!plugin) {
      return res.status(404).json({ error: 'Plugin not found' });
    }
    
    plugin.status = 'installed';
    plugin.installedAt = new Date().toISOString();
    
    writeJsonFile(pluginsFile, plugins);
    res.json(plugin);
  } catch (error) {
    res.status(500).json({ error: 'Failed to install plugin' });
  }
});

// Uninstall plugin
router.post('/api/admin/plugins/:id/uninstall', requireApiKey, (req, res) => {
  try {
    const plugins = readJsonFile(pluginsFile);
    const plugin = plugins.find(p => p.id === req.params.id);
    
    if (!plugin) {
      return res.status(404).json({ error: 'Plugin not found' });
    }
    
    plugin.status = 'uninstalled';
    plugin.uninstalledAt = new Date().toISOString();
    
    writeJsonFile(pluginsFile, plugins);
    res.json(plugin);
  } catch (error) {
    res.status(500).json({ error: 'Failed to uninstall plugin' });
  }
});

// ============================================================================
// LAYOUT MANAGEMENT API
// ============================================================================

// Get all layouts
router.get('/api/admin/layouts', (req, res) => {
  try {
    const layouts = readJsonFile(layoutsFile);
    res.json(layouts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch layouts' });
  }
});

// Get layout by ID
router.get('/api/admin/layouts/:id', (req, res) => {
  try {
    const layouts = readJsonFile(layoutsFile);
    const layout = layouts.find(l => l.id === req.params.id);
    
    if (!layout) {
      return res.status(404).json({ error: 'Layout not found' });
    }
    
    res.json(layout);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch layout' });
  }
});

// Save layout
router.post('/api/admin/layouts', requireApiKey, (req, res) => {
  try {
    const layouts = readJsonFile(layoutsFile);
    const layout = req.body;
    
    if (!layout.id) {
      return res.status(400).json({ error: 'Layout ID is required' });
    }
    
    const existingIndex = layouts.findIndex(l => l.id === layout.id);
    
    if (existingIndex >= 0) {
      layouts[existingIndex] = { ...layouts[existingIndex], ...layout };
    } else {
      layouts.push(layout);
    }
    
    writeJsonFile(layoutsFile, layouts);
    res.json(layout);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save layout' });
  }
});

// Delete layout
router.delete('/api/admin/layouts/:id', requireApiKey, (req, res) => {
  try {
    const layouts = readJsonFile(layoutsFile);
    const filteredLayouts = layouts.filter(l => l.id !== req.params.id);
    
    writeJsonFile(layoutsFile, filteredLayouts);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete layout' });
  }
});

// ============================================================================
// CONFIGURATION MANAGEMENT API
// ============================================================================

// Get all configurations
router.get('/api/admin/configs', (req, res) => {
  try {
    const configs = readJsonFile(configsFile);
    res.json(configs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch configurations' });
  }
});

// Get configuration by screen ID
router.get('/api/admin/configs/:screenId', (req, res) => {
  try {
    const configs = readJsonFile(configsFile);
    const config = configs[req.params.screenId];
    
    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }
    
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

// Save configuration
router.post('/api/admin/configs/:screenId', requireApiKey, (req, res) => {
  try {
    const configs = readJsonFile(configsFile);
    const config = req.body;
    
    configs[req.params.screenId] = {
      ...config,
      screenId: req.params.screenId,
      updatedAt: new Date().toISOString()
    };
    
    writeJsonFile(configsFile, configs);
    res.json(configs[req.params.screenId]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save configuration' });
  }
});

// ============================================================================
// ANALYTICS AND MONITORING API
// ============================================================================

// Get system analytics
router.get('/api/admin/analytics', (req, res) => {
  try {
    const components = readJsonFile(componentsFile);
    const templates = readJsonFile(templatesFile);
    const plugins = readJsonFile(pluginsFile);
    const layouts = readJsonFile(layoutsFile);
    
    const analytics = {
      components: {
        total: components.length,
        byCategory: components.reduce((acc, comp) => {
          acc[comp.category] = (acc[comp.category] || 0) + 1;
          return acc;
        }, {})
      },
      templates: {
        total: templates.length,
        byCategory: templates.reduce((acc, template) => {
          acc[template.category] = (acc[template.category] || 0) + 1;
          return acc;
        }, {})
      },
      plugins: {
        total: plugins.length,
        installed: plugins.filter(p => p.status === 'installed').length,
        byStatus: plugins.reduce((acc, plugin) => {
          acc[plugin.status] = (acc[plugin.status] || 0) + 1;
          return acc;
        }, {})
      },
      layouts: {
        total: layouts.length
      },
      lastUpdated: new Date().toISOString()
    };
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get system health
router.get('/api/admin/health', (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        fileSystem: 'accessible',
        api: 'operational'
      },
      version: '1.0.0'
    };
    
    res.json(health);
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      error: 'Failed to check system health' 
    });
  }
});

module.exports = router;
