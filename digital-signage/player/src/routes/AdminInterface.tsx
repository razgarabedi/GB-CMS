/**
 * Admin Interface Route
 * Main entry point for the enhanced admin interface
 */

import { useState, useCallback, useEffect } from 'react';
import { EnhancedAdminInterface } from '../components/EnhancedAdminInterface';
import { useComponentLibrary, useTemplateManager, usePluginManager, useLayoutManager, useConfigManager, useAnalytics } from '../hooks/useAdminAPI';
import type { AdminInterface } from '../types/UITypes';

// Create a default admin interface configuration
const createDefaultAdminInterface = (): AdminInterface => ({
  currentScreen: null,
  currentTab: 'design',
  isFullscreen: false,
  theme: {
    mode: 'dark',
    primary: '#3b82f6',
    secondary: '#6b7280',
    background: '#111827',
    surface: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    border: '#374151',
    accent: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  },
  language: 'en',
  isDirty: false,
  lastSaved: null,
  autoSave: true,
  autoSaveInterval: 30000,
  notifications: [],
  shortcuts: [],
  help: {
    isVisible: false,
    currentTopic: null,
    searchQuery: '',
    favorites: [],
    recent: [],
    tutorials: [],
    faqs: [],
    documentation: []
  },
  componentLibrary: {
    items: [
      {
        id: 'weather-widget',
        name: 'Weather Widget',
        description: 'Displays current weather conditions',
        category: 'widget',
        icon: { name: 'weather', type: 'custom', data: '🌤️' },
        component: () => null,
        propsSchema: { type: 'object', properties: {} },
        defaultProps: {},
        tags: ['weather', 'widget', 'data'],
        status: 'available',
        isPlugin: false,
        version: '1.0.0',
        author: 'System'
      },
      {
        id: 'digital-clock',
        name: 'Digital Clock',
        description: 'Shows current time in digital format',
        category: 'widget',
        icon: { name: 'clock', type: 'custom', data: '🕐' },
        component: () => null,
        propsSchema: { type: 'object', properties: {} },
        defaultProps: {},
        tags: ['clock', 'time', 'widget'],
        status: 'available',
        isPlugin: false,
        version: '1.0.0',
        author: 'System'
      },
      {
        id: 'news-widget',
        name: 'News Widget',
        description: 'Displays news headlines and articles',
        category: 'widget',
        icon: { name: 'news', type: 'custom', data: '📰' },
        component: () => null,
        propsSchema: { type: 'object', properties: {} },
        defaultProps: {},
        tags: ['news', 'widget', 'content'],
        status: 'available',
        isPlugin: false,
        version: '1.0.0',
        author: 'System'
      }
    ],
    categories: ['widget', 'layout', 'utility', 'service', 'theme', 'integration', 'custom', 'plugin'],
    searchQuery: '',
    selectedCategory: 'all',
    sortBy: 'name',
    filterBy: {
      tags: [],
      status: [],
      isPlugin: null
    }
  },
  layoutCanvas: {
    id: 'main-canvas',
    name: 'Main Canvas',
    size: { width: 1920, height: 1080 },
    grid: {
      cellSize: 20,
      gap: 2,
      columns: 12,
      rows: 8
    },
    components: [],
    zones: [],
    selectedComponent: null,
    clipboard: [],
    history: [],
    historyIndex: -1,
    isDirty: false,
    snapToGrid: true,
    showGrid: true,
    showGuides: true,
    zoom: 1,
    pan: { x: 0, y: 0 }
  },
  propertiesPanel: {
    selectedComponent: null,
    fields: [],
    groups: [
      {
        id: 'basic',
        name: 'Basic Properties',
        collapsed: false,
        fields: [],
        order: 1
      },
      {
        id: 'appearance',
        name: 'Appearance',
        collapsed: false,
        fields: [],
        order: 2
      },
      {
        id: 'behavior',
        name: 'Behavior',
        collapsed: true,
        fields: [],
        order: 3
      }
    ],
    isCollapsed: false,
    searchQuery: '',
    showAdvanced: false
  },
  templateManager: {
    templates: [
      {
        id: 'business-template',
        name: 'Business Dashboard',
        description: 'Professional layout for business displays',
        category: 'business',
        thumbnail: '/templates/business-thumb.png',
        preview: '/templates/business-preview.png',
        components: [],
        zones: [],
        size: { width: 1920, height: 1080 },
        grid: { cellSize: 20, gap: 2, columns: 12, rows: 8 },
        tags: ['business', 'professional', 'dashboard'],
        author: 'System',
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: true,
        isBuiltIn: true,
        isCustom: false,
        downloads: 200,
        rating: 4.5,
        reviews: 15
      },
      {
        id: 'retail-template',
        name: 'Retail Display',
        description: 'Eye-catching layout for retail environments',
        category: 'retail',
        thumbnail: '/templates/retail-thumb.png',
        preview: '/templates/retail-preview.png',
        components: [],
        zones: [],
        size: { width: 1920, height: 1080 },
        grid: { cellSize: 20, gap: 2, columns: 12, rows: 8 },
        tags: ['retail', 'shopping', 'promotional'],
        author: 'System',
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: true,
        isBuiltIn: true,
        isCustom: false,
        downloads: 150,
        rating: 4.3,
        reviews: 8
      }
    ],
    selectedTemplate: null,
    searchQuery: '',
    selectedCategory: 'all',
    sortBy: 'name',
    filterBy: {
      tags: [],
      isPublic: null,
      isBuiltIn: null
    },
    isCreating: false,
    isImporting: false,
    isExporting: false
  },
  pluginManager: {
    plugins: [],
    selectedPlugin: null,
    searchQuery: '',
    selectedCategory: 'all',
    sortBy: 'name',
    filterBy: {
      status: [],
      isInstalled: null,
      isFree: null,
      category: []
    },
    isInstalling: false,
    isUninstalling: false,
    isUpdating: false,
    showStore: true,
    showInstalled: false
  },
  previewSystem: {
    config: {
      screenId: 'admin-preview',
      size: { width: 1920, height: 1080 },
      theme: {
        mode: 'dark',
        primary: '#3b82f6',
        secondary: '#6b7280',
        background: '#111827',
        surface: '#1f2937',
        text: '#f9fafb',
        textSecondary: '#9ca3af',
        border: '#374151',
        accent: '#8b5cf6',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      },
      layout: {
        id: 'preview-canvas',
        name: 'Preview Canvas',
        size: { width: 1920, height: 1080 },
        grid: {
          cellSize: 20,
          gap: 2,
          columns: 12,
          rows: 8
        },
        components: [],
        zones: [],
        selectedComponent: null,
        clipboard: [],
        history: [],
        historyIndex: -1,
        isDirty: false,
        snapToGrid: true,
        showGrid: true,
        showGuides: true,
        zoom: 1,
        pan: { x: 0, y: 0 }
      },
      components: [],
      isLive: true,
      refreshInterval: 5000,
      showDebugInfo: false,
      showGrid: true,
      showGuides: true,
      zoom: 1,
      deviceType: 'desktop'
    },
    isVisible: true,
    isFullscreen: false,
    isRecording: false,
    deviceType: 'desktop',
    refreshInterval: 5000,
    lastRefresh: new Date(),
    errors: [],
    performance: {
      renderTime: 0,
      memoryUsage: 0,
      componentCount: 0,
      errorCount: 0,
      warningCount: 0,
      lastUpdate: new Date()
    }
  }
});

export default function AdminInterface() {
  console.log('🚀 AdminInterface component initializing...');
  const [adminInterface, setAdminInterface] = useState<AdminInterface>(createDefaultAdminInterface());

  // Use API hooks
  console.log('🔗 Initializing API hooks...');
  const { components, loading: componentsLoading, error: componentsError } = useComponentLibrary();
  const { templates, loading: templatesLoading, error: templatesError } = useTemplateManager();
  const { plugins, loading: pluginsLoading, error: pluginsError } = usePluginManager();
  const { layouts, loading: layoutsLoading, error: layoutsError } = useLayoutManager();
  const { loading: configsLoading, error: configsError } = useConfigManager();
  const { loading: analyticsLoading, error: analyticsError } = useAnalytics();

  console.log('📊 API Hook States:', {
    components: { count: components.length, loading: componentsLoading, error: componentsError },
    templates: { count: templates.length, loading: templatesLoading, error: templatesError },
    plugins: { count: plugins.length, loading: pluginsLoading, error: pluginsError },
    layouts: { count: layouts.length, loading: layoutsLoading, error: layoutsError },
    configs: { loading: configsLoading, error: configsError },
    analytics: { loading: analyticsLoading, error: analyticsError }
  });

  // Test API connection on mount
  useEffect(() => {
    const testAPI = async () => {
      console.log('🧪 Testing API connection...');
      try {
        const response = await fetch('http://localhost:3000/api/admin/test', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // Add timeout
          signal: AbortSignal.timeout(5000)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ API test successful:', data);
      } catch (error) {
        console.error('❌ API test failed:', error);
        // Don't show error to user immediately, let the individual hooks handle it
      }
    };
    testAPI();
  }, []);

  // Update admin interface with real data
  useEffect(() => {
    console.log('🔄 Updating admin interface with real data...');
    console.log('📦 Data to update:', {
      components: components.length,
      templates: templates.length,
      plugins: plugins.length,
      layouts: layouts.length
    });
    
    setAdminInterface(prev => {
      const updated = {
        ...prev,
        componentLibrary: {
          ...prev.componentLibrary,
          items: components,
        },
        templateManager: {
          ...prev.templateManager,
          templates: templates,
        },
        pluginManager: {
          ...prev.pluginManager,
          plugins: plugins,
        },
        layoutCanvas: {
          ...prev.layoutCanvas,
          components: layouts,
        },
      };
      console.log('✅ Admin interface updated with real data');
      return updated;
    });
  }, [components, templates, plugins, layouts]);

  const handleInterfaceChange = useCallback((newInterface: AdminInterface) => {
    setAdminInterface(newInterface);
  }, []);

  const handleSave = useCallback(async () => {
    console.log('💾 Starting save operation...');
    console.log('📦 Admin interface data to save:', adminInterface);
    
    try {
      console.log('🔄 Saving admin interface configuration...');
      
      // Save to backend APIs
      // Note: In a real implementation, you would save each component of the interface
      // to the appropriate backend endpoints using the API hooks
      
      // For now, save to localStorage as fallback
      console.log('💾 Saving to localStorage as fallback...');
      localStorage.setItem('adminInterface', JSON.stringify(adminInterface));
      
      console.log('✅ Configuration saved successfully to localStorage');
    } catch (error) {
      console.error('❌ Failed to save configuration:', error);
    }
  }, [adminInterface]);

  const handleLoad = useCallback(() => {
    const saved = localStorage.getItem('adminInterface');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAdminInterface(parsed);
      } catch (error) {
        console.error('Failed to load admin interface configuration:', error);
      }
    }
  }, []);

  // Show loading state if any API is loading
  const isLoading = componentsLoading || templatesLoading || pluginsLoading || layoutsLoading || configsLoading || analyticsLoading;
  const hasError = componentsError || templatesError || pluginsError || layoutsError || configsError || analyticsError;
  
  // If all APIs have finished loading and we have no data, show a message instead of error
  const allAPIsLoaded = !componentsLoading && !templatesLoading && !pluginsLoading && !layoutsLoading && !configsLoading && !analyticsLoading;
  const hasNoData = allAPIsLoaded && components.length === 0 && templates.length === 0 && plugins.length === 0 && layouts.length === 0;

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading admin interface...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="h-screen w-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-lg mb-2">Failed to load admin interface</p>
          <p className="text-sm text-gray-400 mb-4">
            {componentsError || templatesError || pluginsError || layoutsError || configsError || analyticsError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show message if no data is available but no errors
  if (hasNoData) {
    return (
      <div className="h-screen w-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-yellow-500 text-4xl mb-4">ℹ️</div>
          <p className="text-lg mb-2">No data available</p>
          <p className="text-sm text-gray-400 mb-4">
            The backend server might not be running or no data has been configured yet.
          </p>
          <div className="space-x-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => {
                // Use default data
                setAdminInterface(createDefaultAdminInterface());
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Use Demo Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <EnhancedAdminInterface
      adminInterface={adminInterface}
      onInterfaceChange={handleInterfaceChange}
      onSave={handleSave}
      onLoad={handleLoad}
      className="h-screen w-screen"
    />
  );
}