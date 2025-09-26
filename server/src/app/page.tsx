'use client';

import { useState } from 'react';
import LayoutCanvas from './components/LayoutCanvas';
import ComponentLibrary from './components/ComponentLibrary';
import PropertiesPanel from './components/PropertiesPanel';
import TemplateManager from './components/TemplateManager';
import PluginManager from './components/PluginManager';
import PreviewSystem from './components/PreviewSystem';

export default function Home() {
  const [activeTab, setActiveTab] = useState('canvas');
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [layout, setLayout] = useState([
    { i: 'a', x: 0, y: 0, w: 2, h: 2, component: 'Weather' },
    { i: 'b', x: 2, y: 0, w: 2, h: 2, component: 'Clock' },
    { i: 'c', x: 4, y: 0, w: 2, h: 2, component: 'News' }
  ]);
  const [widgetProperties, setWidgetProperties] = useState<any>({});

  const tabs = [
    { id: 'canvas', name: 'Layout Canvas', icon: '🎨' },
    { id: 'preview', name: 'Live Preview', icon: '📺' },
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
            <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-slate-700 lg:h-full overflow-y-auto">
              <ComponentLibrary 
                onWidgetAdd={(componentName) => {
                  const newWidget = {
                    i: `widget-${Date.now()}`,
                    x: 0,
                    y: 0,
                    w: 2,
                    h: 2,
                    component: componentName
                  };
                  setLayout([...layout, newWidget]);
                }}
              />
            </div>
            <div className="flex-1 p-3 lg:p-6 min-h-0">
              <LayoutCanvas 
                layout={layout}
                onLayoutChange={setLayout}
                selectedWidget={selectedWidget}
                onWidgetSelect={setSelectedWidget}
              />
            </div>
            <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-700 lg:h-full overflow-y-auto">
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
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <h1 className="text-xl sm:text-2xl font-bold text-white">GB-CMS</h1>
            <span className="text-xs sm:text-sm text-slate-400 hidden sm:inline">Digital Signage Server</span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-end">
            <button className="btn btn-outline flex-1 sm:flex-none">
              <span className="hidden sm:inline">🔄 Refresh</span>
              <span className="sm:hidden">🔄</span>
            </button>
            <button className="btn btn-primary flex-1 sm:flex-none">
              <span className="hidden sm:inline">💾 Save</span>
              <span className="sm:hidden">💾</span>
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
    </div>
  );
}