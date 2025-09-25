/**
 * Admin Interface Route
 * Main entry point for the enhanced admin interface
 */

import { useState, useCallback } from 'react';
import { EnhancedAdminInterface } from '../components/EnhancedAdminInterface';
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
    items: [],
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
    templates: [],
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
  const [adminInterface, setAdminInterface] = useState<AdminInterface>(createDefaultAdminInterface());

  const handleInterfaceChange = useCallback((newInterface: AdminInterface) => {
    setAdminInterface(newInterface);
  }, []);

  const handleSave = useCallback(() => {
    // Save the current configuration
    console.log('Saving admin interface configuration...', adminInterface);
    // Here you would typically save to localStorage or send to a server
    localStorage.setItem('adminInterface', JSON.stringify(adminInterface));
  }, [adminInterface]);

  const handleLoad = useCallback(() => {
    // Load saved configuration
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

  return (
    <div className="h-screen w-screen bg-gray-900 text-white overflow-hidden">
      <EnhancedAdminInterface
        adminInterface={adminInterface}
        onInterfaceChange={handleInterfaceChange}
        onSave={handleSave}
        onLoad={handleLoad}
        className="h-full w-full"
      />
    </div>
  );
}
    