'use client';

import { useState, useEffect } from 'react';
import LayoutCanvas from './components/LayoutCanvas';
import ComponentLibrary from './components/ComponentLibrary';
import PropertiesPanel from './components/PropertiesPanel';
import TemplateManager from './components/TemplateManager';
import PluginManager from './components/PluginManager';
import PreviewSystem from './components/PreviewSystem';
import HelpManager from './components/HelpManager';
import ScreenManager from './components/ScreenManager';
import SaveScreenModal from './components/SaveScreenModal';
import { StaticWidgetSize, STATIC_WIDGET_DIMENSIONS } from './types/staticWidgets';

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  component?: string;
  props?: Record<string, any>;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('canvas');
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [layout, setLayout] = useState<LayoutItem[]>([]);
  const [widgetProperties, setWidgetProperties] = useState<any>({});
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [screens, setScreens] = useState<any[]>([]);
  const [editingScreen, setEditingScreen] = useState<any>(null);

  // Load screens from localStorage on component mount
  useEffect(() => {
    const savedScreens = localStorage.getItem('gb-cms-screens');
    if (savedScreens) {
      try {
        setScreens(JSON.parse(savedScreens));
      } catch (error) {
        console.error('Error loading screens:', error);
      }
    }
  }, []);

  // Save screens to localStorage whenever screens change
  useEffect(() => {
    localStorage.setItem('gb-cms-screens', JSON.stringify(screens));
  }, [screens]);

  const handleSaveScreen = (screenName: string, screenDescription: string) => {
    const now = new Date().toISOString();
    
    if (editingScreen) {
      // Update existing screen
      const updatedScreen = {
        ...editingScreen,
        name: screenName,
        description: screenDescription || undefined,
        layout: [...layout],
        updatedAt: now
      };

      setScreens(prev => prev.map(screen => 
        screen.id === editingScreen.id ? updatedScreen : screen
      ));
      setEditingScreen(null);
    } else {
      // Create new screen
      const newScreen = {
        id: `screen-${Date.now()}`,
        name: screenName,
        description: screenDescription || undefined,
        layout: [...layout],
        createdAt: now,
        updatedAt: now,
        isActive: false
      };

      setScreens(prev => [...prev, newScreen]);
    }

    setShowSaveModal(false);
  };

  const handleLoadScreen = (screen: any) => {
    setLayout(screen.layout);
    setSelectedWidget(null);
    setEditingScreen(screen);
    setActiveTab('canvas'); // Switch to canvas tab for editing
  };

  const handleDeleteScreen = (screenId: string) => {
    setScreens(prev => prev.filter(screen => screen.id !== screenId));
  };

  const handleNewScreen = () => {
    setEditingScreen(null);
    setLayout([]);
    setSelectedWidget(null);
  };

  const tabs = [
    { id: 'canvas', name: 'Layout Canvas', icon: '🎨' },
    { id: 'preview', name: 'Live Preview', icon: '📺' },
    { id: 'screens', name: 'Screens', icon: '🖥️' },
    { id: 'templates', name: 'Templates', icon: '📋' },
    { id: 'plugins', name: 'Plugins', icon: '🔌' },
    { id: 'widgets', name: 'Widgets', icon: '🧩' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'canvas':
        return (
          <div className="flex flex-col lg:flex-row h-full">
            <div 
              className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-slate-700 lg:h-full overflow-y-auto"
              data-tour="component-library"
            >
              <ComponentLibrary 
                onWidgetAdd={(componentName, size?: StaticWidgetSize) => {
                  let dimensions = { w: 4, h: 4 };
                  
                  // If it's a static widget with a size, use the predefined dimensions
                  if (size && componentName === 'Static Weather') {
                    dimensions = STATIC_WIDGET_DIMENSIONS[size];
                  }
                  
                  const newWidget = {
                    i: `widget-${Date.now()}`,
                    x: 0,
                    y: 0,
                    w: dimensions.w,
                    h: dimensions.h,
                    component: componentName,
                    props: size ? { size } : {}
                  };
                  setLayout([...layout, newWidget]);
                }}
              />
            </div>
            <div 
              className="flex-1 p-3 lg:p-6 min-h-0 flex items-center justify-center"
              data-tour="layout-canvas"
            >
              <LayoutCanvas
                layout={layout}
                onLayoutChange={setLayout}
                selectedWidget={selectedWidget}
                onWidgetSelect={setSelectedWidget}
                editingScreen={editingScreen}
              />
            </div>
            <div 
              className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-700 lg:h-full overflow-y-auto"
              data-tour="properties-panel"
            >
              <PropertiesPanel
                selectedWidget={selectedWidget}
                layout={layout}
                onLayoutChange={setLayout}
              />
            </div>
          </div>
        );
      case 'preview':
        return (
          <div className="h-full">
            <PreviewSystem 
              layout={layout}
              selectedWidget={selectedWidget}
              onWidgetSelect={setSelectedWidget}
            />
          </div>
        );
      case 'screens':
        return (
          <div className="h-full overflow-y-auto">
            <ScreenManager
              currentLayout={layout}
              screens={screens}
              onLoadScreen={handleLoadScreen}
              onSaveScreen={(screen) => {
                setScreens(prev => {
                  const existingIndex = prev.findIndex(s => s.id === screen.id);
                  if (existingIndex >= 0) {
                    // Update existing screen
                    return prev.map(s => s.id === screen.id ? screen : s);
                  } else {
                    // Add new screen
                    return [...prev, screen];
                  }
                });
              }}
              onDeleteScreen={handleDeleteScreen}
            />
          </div>
        );
      case 'templates':
        return (
          <div className="p-6">
            <TemplateManager 
              layout={layout}
              onLoadTemplate={(template) => {
                setLayout(template.layout);
                setSelectedWidget(null);
              }}
            />
          </div>
        );
      case 'plugins':
        return (
          <div className="p-6">
            <PluginManager 
              onPluginInstall={(plugin) => {
                console.log('Plugin installed:', plugin);
              }}
              onPluginUninstall={(pluginId) => {
                console.log('Plugin uninstalled:', pluginId);
              }}
              onPluginToggle={(pluginId, enabled) => {
                console.log('Plugin toggled:', pluginId, enabled);
              }}
            />
          </div>
        );
      case 'widgets':
        return (
          <div className="p-6">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Widget Library</h2>
              </div>
              <div className="card-content">
                <p className="text-slate-400">Manage and configure available widgets for your signage displays.</p>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">System Settings</h2>
              </div>
              <div className="card-content">
                <p className="text-slate-400">Configure system-wide settings and preferences.</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <HelpManager>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="border-b border-slate-700 bg-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <h1 className="text-xl sm:text-2xl font-bold text-white">GB-CMS</h1>
              <span className="text-xs sm:text-sm text-slate-400 hidden sm:inline">Digital Signage Server</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-end">
              <div className="relative group">
                <button 
                  onClick={() => window.open('/kiosk', '_blank')}
                  className="btn btn-outline flex-1 sm:flex-none"
                  title="Play current layout in kiosk mode"
                >
                  <span className="hidden sm:inline">▶️ Play</span>
                  <span className="sm:hidden">▶️</span>
                </button>
                {/* Kiosk mode dropdown */}
                <div className="absolute right-0 top-10 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 min-w-[200px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                  <button
                    onClick={() => window.open('/kiosk', '_blank')}
                    className="w-full px-3 py-2 text-left text-sm text-white hover:bg-slate-700 transition-colors duration-150 flex items-center space-x-2"
                  >
                    <span>📺</span>
                    <span>Kiosk Mode</span>
                  </button>
                  <button
                    onClick={() => window.open('/kiosk/rotate', '_blank')}
                    className="w-full px-3 py-2 text-left text-sm text-white hover:bg-slate-700 transition-colors duration-150 flex items-center space-x-2"
                  >
                    <span>🔄</span>
                    <span>Auto Rotate All</span>
                  </button>
                  <div className="h-px bg-slate-600 my-1"></div>
                  <div className="px-3 py-1 text-xs text-slate-400">
                    Kiosk URLs:
                  </div>
                  <div className="px-3 py-1 text-xs text-slate-500">
                    /kiosk - All screens<br/>
                    /kiosk?screen=ID - Specific screen<br/>
                    /kiosk/screen/name - By name<br/>
                    /kiosk/rotate - Auto rotate
                  </div>
                </div>
              </div>
              <button 
                onClick={handleNewScreen}
                className="btn btn-outline flex-1 sm:flex-none"
                title="Start a new screen"
              >
                <span className="hidden sm:inline">🆕 New</span>
                <span className="sm:hidden">🆕</span>
              </button>
              <button className="btn btn-outline flex-1 sm:flex-none">
                <span className="hidden sm:inline">🔄 Refresh</span>
                <span className="sm:hidden">🔄</span>
              </button>
              <button 
                onClick={() => setShowSaveModal(true)}
                className="btn btn-primary flex-1 sm:flex-none"
                title={editingScreen ? `Update screen: ${editingScreen.name}` : "Save current layout as screen"}
              >
                <span className="hidden sm:inline">
                  💾 {editingScreen ? `Update ${editingScreen.name}` : 'Save'}
                </span>
                <span className="sm:hidden">
                  💾 {editingScreen ? 'Update' : 'Save'}
                </span>
              </button>
            </div>
          </div>
        </header>

      {/* Tab Navigation */}
      <nav className="border-b border-slate-700 bg-slate-800/50">
        <div className="px-6">
          <div className="tab-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button ${
                  activeTab === tab.id ? 'tab-button-active' : ''
                }`}
                data-tour={tab.id === 'preview' ? 'preview-tab' : 
                          tab.id === 'templates' ? 'templates-tab' : 
                          tab.id === 'plugins' ? 'plugins-tab' : undefined}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {renderTabContent()}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-800 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>GB-CMS Digital Signage System v1.0</span>
          <span>{layout.length} widgets on canvas</span>
        </div>
      </footer>

      {/* Save Screen Modal */}
      <SaveScreenModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveScreen}
        currentLayout={layout}
        editingScreen={editingScreen}
      />
      </div>
    </HelpManager>
  );
}