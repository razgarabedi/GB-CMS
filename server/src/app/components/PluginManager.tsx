'use client';

import { useState, useEffect } from 'react';

interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: string;
  icon: string;
  isInstalled: boolean;
  isEnabled: boolean;
  isLoading: boolean;
  size: string;
  downloadUrl?: string;
  documentation?: string;
  screenshots: string[];
  tags: string[];
  rating: number;
  downloads: number;
  lastUpdated: string;
  dependencies: string[];
  permissions: string[];
  component?: React.ComponentType<any>;
}

interface PluginManagerProps {
  onPluginInstall: (plugin: Plugin) => void;
  onPluginUninstall: (pluginId: string) => void;
  onPluginToggle: (pluginId: string, enabled: boolean) => void;
}

export default function PluginManager({ 
  onPluginInstall, 
  onPluginUninstall, 
  onPluginToggle 
}: PluginManagerProps) {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [installedPlugins, setInstalledPlugins] = useState<Plugin[]>([]);
  const [activeTab, setActiveTab] = useState<'marketplace' | 'installed' | 'develop'>('marketplace');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [showInstallationSteps, setShowInstallationSteps] = useState(false);
  const [installingPlugin, setInstallingPlugin] = useState<Plugin | null>(null);
  const [installationStep, setInstallationStep] = useState(0);
  const [pluginConfig, setPluginConfig] = useState<Record<string, any>>({});
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configuringPlugin, setConfiguringPlugin] = useState<Plugin | null>(null);

  const categories = [
    { id: 'all', name: 'All Categories', icon: '📦' },
    { id: 'widgets', name: 'Widgets', icon: '🎛️' },
    { id: 'data-sources', name: 'Data Sources', icon: '🔗' },
    { id: 'themes', name: 'Themes', icon: '🎨' },
    { id: 'analytics', name: 'Analytics', icon: '📊' },
    { id: 'integrations', name: 'Integrations', icon: '🔌' },
    { id: 'utilities', name: 'Utilities', icon: '🛠️' }
  ];

  useEffect(() => {
    loadMarketplacePlugins();
    loadInstalledPlugins();
  }, []);

  const loadMarketplacePlugins = () => {
    // Simulate marketplace plugins
    const mockPlugins: Plugin[] = [
      {
        id: 'advanced-charts',
        name: 'Advanced Charts',
        version: '2.1.0',
        description: 'Professional chart widgets with real-time data visualization capabilities',
        author: 'ChartCorp',
        category: 'widgets',
        icon: '📈',
        isInstalled: false,
        isEnabled: false,
        isLoading: false,
        size: '2.4 MB',
        screenshots: ['chart1.jpg', 'chart2.jpg'],
        tags: ['charts', 'visualization', 'real-time'],
        rating: 4.8,
        downloads: 15420,
        lastUpdated: '2024-01-15',
        dependencies: ['react-charts', 'd3'],
        permissions: ['network', 'storage']
      },
      {
        id: 'social-feeds',
        name: 'Social Media Feeds',
        version: '1.5.2',
        description: 'Display live social media feeds from Twitter, Instagram, and Facebook',
        author: 'SocialTech',
        category: 'widgets',
        icon: '📱',
        isInstalled: true,
        isEnabled: true,
        isLoading: false,
        size: '1.8 MB',
        screenshots: ['social1.jpg', 'social2.jpg'],
        tags: ['social', 'feeds', 'twitter', 'instagram'],
        rating: 4.6,
        downloads: 8930,
        lastUpdated: '2024-01-10',
        dependencies: ['social-api'],
        permissions: ['network']
      },
      {
        id: 'weather-pro',
        name: 'Weather Pro',
        version: '3.0.1',
        description: 'Enhanced weather widget with 7-day forecasts and weather maps',
        author: 'WeatherLab',
        category: 'widgets',
        icon: '🌦️',
        isInstalled: false,
        isEnabled: false,
        isLoading: false,
        size: '3.1 MB',
        screenshots: ['weather1.jpg', 'weather2.jpg'],
        tags: ['weather', 'forecast', 'maps'],
        rating: 4.9,
        downloads: 22100,
        lastUpdated: '2024-01-20',
        dependencies: ['weather-api', 'maps-sdk'],
        permissions: ['location', 'network']
      },
      {
        id: 'database-connector',
        name: 'Database Connector',
        version: '1.2.0',
        description: 'Connect to MySQL, PostgreSQL, and MongoDB databases',
        author: 'DataBridge',
        category: 'data-sources',
        icon: '🗄️',
        isInstalled: false,
        isEnabled: false,
        isLoading: false,
        size: '4.2 MB',
        screenshots: ['db1.jpg', 'db2.jpg'],
        tags: ['database', 'mysql', 'postgresql', 'mongodb'],
        rating: 4.5,
        downloads: 5670,
        lastUpdated: '2024-01-05',
        dependencies: ['database-drivers'],
        permissions: ['network', 'storage']
      },
      {
        id: 'dark-theme-pro',
        name: 'Dark Theme Pro',
        version: '2.0.0',
        description: 'Premium dark theme with customizable accent colors',
        author: 'ThemeStudio',
        category: 'themes',
        icon: '🌙',
        isInstalled: false,
        isEnabled: false,
        isLoading: false,
        size: '500 KB',
        screenshots: ['theme1.jpg', 'theme2.jpg'],
        tags: ['theme', 'dark', 'customizable'],
        rating: 4.7,
        downloads: 12800,
        lastUpdated: '2024-01-18',
        dependencies: [],
        permissions: ['storage']
      }
    ];

    setPlugins(mockPlugins);
  };

  const loadInstalledPlugins = () => {
    const installed = localStorage.getItem('gb-cms-installed-plugins');
    if (installed) {
      setInstalledPlugins(JSON.parse(installed));
    }
  };

  const saveInstalledPlugins = (plugins: Plugin[]) => {
    localStorage.setItem('gb-cms-installed-plugins', JSON.stringify(plugins));
    setInstalledPlugins(plugins);
  };

  const installPlugin = async (plugin: Plugin) => {
    setInstallingPlugin(plugin);
    setShowInstallationSteps(true);
    setInstallationStep(0);

    // Step 1: Download plugin
    setInstallationStep(1);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 2: Validate dependencies
    setInstallationStep(2);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Step 3: Install dependencies
    setInstallationStep(3);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 4: Configure plugin
    setInstallationStep(4);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 5: Finalize installation
    setInstallationStep(5);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const installedPlugin = { ...plugin, isInstalled: true, isEnabled: true, isLoading: false };
    
    // Update marketplace plugins
    setPlugins(prev => prev.map(p => 
      p.id === plugin.id ? installedPlugin : p
    ));

    // Add to installed plugins
    const updatedInstalled = [...installedPlugins, installedPlugin];
    saveInstalledPlugins(updatedInstalled);

    onPluginInstall(installedPlugin);
    
    // Close installation steps
    setShowInstallationSteps(false);
    setInstallingPlugin(null);
    setInstallationStep(0);
  };

  const uninstallPlugin = (pluginId: string) => {
    if (confirm('Are you sure you want to uninstall this plugin?')) {
      // Update marketplace plugins
      setPlugins(prev => prev.map(p => 
        p.id === pluginId ? { ...p, isInstalled: false, isEnabled: false } : p
      ));

      // Remove from installed plugins
      const updatedInstalled = installedPlugins.filter(p => p.id !== pluginId);
      saveInstalledPlugins(updatedInstalled);

      onPluginUninstall(pluginId);
      alert('Plugin uninstalled successfully!');
    }
  };

  const togglePlugin = (pluginId: string, enabled: boolean) => {
    // Update installed plugins
    const updatedInstalled = installedPlugins.map(p => 
      p.id === pluginId ? { ...p, isEnabled: enabled } : p
    );
    saveInstalledPlugins(updatedInstalled);

    // Update marketplace plugins
    setPlugins(prev => prev.map(p => 
      p.id === pluginId ? { ...p, isEnabled: enabled } : p
    ));

    onPluginToggle(pluginId, enabled);
  };

  const configurePlugin = (plugin: Plugin) => {
    setConfiguringPlugin(plugin);
    setShowConfigModal(true);
    // Load existing configuration
    const config = localStorage.getItem(`gb-cms-plugin-config-${plugin.id}`);
    if (config) {
      setPluginConfig(JSON.parse(config));
    } else {
      setPluginConfig({});
    }
  };

  const savePluginConfig = () => {
    if (configuringPlugin) {
      localStorage.setItem(`gb-cms-plugin-config-${configuringPlugin.id}`, JSON.stringify(pluginConfig));
      setShowConfigModal(false);
      setConfiguringPlugin(null);
      setPluginConfig({});
    }
  };

  const getInstallationSteps = () => [
    {
      id: 1,
      title: 'Downloading Plugin',
      description: 'Downloading plugin files and verifying integrity...',
      icon: '📥',
      status: installationStep >= 1 ? 'completed' : installationStep === 0 ? 'current' : 'pending'
    },
    {
      id: 2,
      title: 'Validating Dependencies',
      description: 'Checking system requirements and dependencies...',
      icon: '🔍',
      status: installationStep >= 2 ? 'completed' : installationStep === 1 ? 'current' : 'pending'
    },
    {
      id: 3,
      title: 'Installing Dependencies',
      description: 'Installing required packages and libraries...',
      icon: '📦',
      status: installationStep >= 3 ? 'completed' : installationStep === 2 ? 'current' : 'pending'
    },
    {
      id: 4,
      title: 'Configuring Plugin',
      description: 'Setting up plugin configuration and permissions...',
      icon: '⚙️',
      status: installationStep >= 4 ? 'completed' : installationStep === 3 ? 'current' : 'pending'
    },
    {
      id: 5,
      title: 'Finalizing Installation',
      description: 'Completing installation and enabling plugin...',
      icon: '✅',
      status: installationStep >= 5 ? 'completed' : installationStep === 4 ? 'current' : 'pending'
    }
  ];

  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plugin.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderPluginCard = (plugin: Plugin) => (
    <div key={plugin.id} className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center text-2xl">
              {plugin.icon}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-white text-sm">{plugin.name}</h4>
              <p className="text-xs text-slate-400 mb-1">by {plugin.author} • v{plugin.version}</p>
              <div className="flex items-center space-x-3 text-xs text-slate-500">
                <span>⭐ {plugin.rating}</span>
                <span>📥 {plugin.downloads.toLocaleString()}</span>
                <span>📦 {plugin.size}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {plugin.isInstalled && (
              <div className={`w-2 h-2 rounded-full ${plugin.isEnabled ? 'bg-green-400' : 'bg-slate-500'}`} />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-sm text-slate-300 mb-3 line-clamp-2">
          {plugin.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {plugin.tags.slice(0, 4).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-slate-700 text-xs text-slate-400 rounded">
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          {!plugin.isInstalled ? (
            <button
              onClick={() => installPlugin(plugin)}
              disabled={plugin.isLoading}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm rounded transition-colors flex items-center justify-center"
            >
              {plugin.isLoading ? '⏳ Installing...' : '📥 Install'}
            </button>
          ) : (
            <>
              <button
                onClick={() => togglePlugin(plugin.id, !plugin.isEnabled)}
                className={`px-3 py-2 text-white text-sm rounded transition-colors ${
                  plugin.isEnabled 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {plugin.isEnabled ? '⏸️' : '▶️'}
              </button>
              <button
                onClick={() => configurePlugin(plugin)}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
                title="Configure Plugin"
              >
                ⚙️
              </button>
              <button
                onClick={() => uninstallPlugin(plugin.id)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                title="Uninstall"
              >
                🗑️
              </button>
            </>
          )}
          <button
            onClick={() => setSelectedPlugin(plugin)}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
            title="View Details"
          >
            ℹ️
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-slate-800/50 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Plugin Manager</h3>
        <div className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
          {installedPlugins.length} installed
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-slate-900 p-1 rounded-lg">
        {[
          { id: 'marketplace', label: 'Marketplace', icon: '🏪' },
          { id: 'installed', label: 'Installed', icon: '📦' },
          { id: 'develop', label: 'Develop', icon: '🔧' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {(activeTab === 'marketplace' || activeTab === 'installed') && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search plugins..."
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Plugins Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(activeTab === 'marketplace' ? filteredPlugins : installedPlugins.filter(p => {
              const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                   p.description.toLowerCase().includes(searchQuery.toLowerCase());
              const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
              return matchesSearch && matchesCategory;
            })).map(renderPluginCard)}
          </div>

          {filteredPlugins.length === 0 && (
            <div className="text-center text-slate-400 py-12">
              <div className="text-4xl mb-4">🔍</div>
              <div className="text-lg font-medium mb-2">No Plugins Found</div>
              <div className="text-sm">Try adjusting your search or filter criteria</div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'develop' && (
        <div className="space-y-6">
          {/* Quick Start Guide */}
          <div className="card">
            <div className="p-6">
              <h4 className="font-medium text-white mb-4 flex items-center space-x-2">
                <span>🚀</span>
                <span>Quick Start Guide</span>
              </h4>
              
              <div className="space-y-4">
                <div className="bg-slate-900 p-4 rounded-lg">
                  <h5 className="font-medium text-white mb-3">Step-by-Step Plugin Creation</h5>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">1</div>
                      <div>
                        <p className="text-sm text-slate-300 font-medium">Install the GB-CMS CLI tool</p>
                        <code className="block bg-slate-800 p-2 rounded text-green-400 mt-1 text-xs">
                          npm install -g @gb-cms/cli
                        </code>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">2</div>
                      <div>
                        <p className="text-sm text-slate-300 font-medium">Create a new plugin project</p>
                        <code className="block bg-slate-800 p-2 rounded text-green-400 mt-1 text-xs">
                          gb-cms create-plugin my-awesome-plugin
                        </code>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">3</div>
                      <div>
                        <p className="text-sm text-slate-300 font-medium">Develop your plugin using the SDK</p>
                        <code className="block bg-slate-800 p-2 rounded text-green-400 mt-1 text-xs">
                          cd my-awesome-plugin && npm run dev
                        </code>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">4</div>
                      <div>
                        <p className="text-sm text-slate-300 font-medium">Test and publish to marketplace</p>
                        <code className="block bg-slate-800 p-2 rounded text-green-400 mt-1 text-xs">
                          gb-cms publish --version 1.0.0
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Development Resources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <div className="p-6">
                <h4 className="font-medium text-white mb-4 flex items-center space-x-2">
                  <span>📚</span>
                  <span>Documentation</span>
                </h4>
                <div className="space-y-3">
                  <button className="w-full p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-left transition-colors">
                    <div className="font-medium text-white text-sm">Plugin API Reference</div>
                    <div className="text-xs text-slate-400">Complete API documentation and examples</div>
                  </button>
                  <button className="w-full p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-left transition-colors">
                    <div className="font-medium text-white text-sm">Widget Development Guide</div>
                    <div className="text-xs text-slate-400">How to create custom widgets</div>
                  </button>
                  <button className="w-full p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-left transition-colors">
                    <div className="font-medium text-white text-sm">Data Source Integration</div>
                    <div className="text-xs text-slate-400">Connect to external data sources</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="p-6">
                <h4 className="font-medium text-white mb-4 flex items-center space-x-2">
                  <span>🛠️</span>
                  <span>Development Tools</span>
                </h4>
                <div className="space-y-3">
                  <button className="w-full p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-left transition-colors">
                    <div className="font-medium text-white text-sm">Plugin Generator</div>
                    <div className="text-xs text-slate-400">Interactive plugin scaffolding tool</div>
                  </button>
                  <button className="w-full p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-left transition-colors">
                    <div className="font-medium text-white text-sm">Local Testing Environment</div>
                    <div className="text-xs text-slate-400">Test plugins in isolated environment</div>
                  </button>
                  <button className="w-full p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-left transition-colors">
                    <div className="font-medium text-white text-sm">Debug Console</div>
                    <div className="text-xs text-slate-400">Debug and monitor plugin behavior</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sample Plugin Code */}
          <div className="card">
            <div className="p-6">
              <h4 className="font-medium text-white mb-4 flex items-center space-x-2">
                <span>💻</span>
                <span>Sample Plugin Code</span>
              </h4>
              
              <div className="bg-slate-900 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-white text-sm">Basic Widget Plugin</h5>
                  <button className="text-xs text-blue-400 hover:text-blue-300">Copy Code</button>
                </div>
                <pre className="text-xs text-slate-300 overflow-x-auto">
{`// my-widget-plugin.js
import { registerWidget } from '@gb-cms/sdk';

const MyWidget = ({ title, content, color }) => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: color || '#1e293b',
      borderRadius: '8px' 
    }}>
      <h3>{title}</h3>
      <p>{content}</p>
    </div>
  );
};

registerWidget({
  id: 'my-widget',
  name: 'My Custom Widget',
  component: MyWidget,
  defaultProps: {
    title: 'Hello World',
    content: 'This is my custom widget!',
    color: '#3b82f6'
  },
  propertySchema: [
    { key: 'title', type: 'string', label: 'Title' },
    { key: 'content', type: 'text', label: 'Content' },
    { key: 'color', type: 'color', label: 'Background Color' }
  ]
});`}
                </pre>
              </div>
            </div>
          </div>

          {/* Publishing Guide */}
          <div className="card">
            <div className="p-6">
              <h4 className="font-medium text-white mb-4 flex items-center space-x-2">
                <span>📤</span>
                <span>Publishing Your Plugin</span>
              </h4>
              
              <div className="space-y-4">
                <div className="bg-slate-900 p-4 rounded-lg">
                  <h5 className="font-medium text-white mb-2">Before Publishing Checklist</h5>
                  <div className="space-y-2 text-sm text-slate-300">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded" />
                      <span>Plugin has been thoroughly tested</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded" />
                      <span>Documentation is complete and accurate</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded" />
                      <span>Plugin follows security best practices</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded" />
                      <span>Version number is updated</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm">
                    📤 Publish Plugin
                  </button>
                  <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors text-sm">
                    📋 Review Guidelines
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plugin Details Modal */}
      {selectedPlugin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center text-3xl">
                    {selectedPlugin.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{selectedPlugin.name}</h3>
                    <p className="text-slate-400">by {selectedPlugin.author} • v{selectedPlugin.version}</p>
                    <div className="flex items-center space-x-4 text-sm text-slate-500 mt-1">
                      <span>⭐ {selectedPlugin.rating} rating</span>
                      <span>📥 {selectedPlugin.downloads.toLocaleString()} downloads</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlugin(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-white mb-2">Description</h4>
                  <p className="text-slate-300">{selectedPlugin.description}</p>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Category:</span>
                      <span className="text-white ml-2">{selectedPlugin.category}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Size:</span>
                      <span className="text-white ml-2">{selectedPlugin.size}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Last Updated:</span>
                      <span className="text-white ml-2">{selectedPlugin.lastUpdated}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Status:</span>
                      <span className={`ml-2 ${selectedPlugin.isInstalled ? 'text-green-400' : 'text-slate-400'}`}>
                        {selectedPlugin.isInstalled ? 'Installed' : 'Not Installed'}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedPlugin.dependencies.length > 0 && (
                  <div>
                    <h4 className="font-medium text-white mb-2">Dependencies</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlugin.dependencies.map((dep, index) => (
                        <span key={index} className="px-2 py-1 bg-slate-700 text-xs text-slate-300 rounded">
                          {dep}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPlugin.permissions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-white mb-2">Permissions</h4>
                    <div className="space-y-1">
                      {selectedPlugin.permissions.map((permission, index) => (
                        <div key={index} className="text-sm text-slate-300">
                          • {permission}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4 border-t border-slate-700">
                  {!selectedPlugin.isInstalled ? (
                    <button
                      onClick={() => {
                        installPlugin(selectedPlugin);
                        setSelectedPlugin(null);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    >
                      Install Plugin
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          togglePlugin(selectedPlugin.id, !selectedPlugin.isEnabled);
                          setSelectedPlugin({ ...selectedPlugin, isEnabled: !selectedPlugin.isEnabled });
                        }}
                        className={`flex-1 px-4 py-2 text-white rounded-md transition-colors ${
                          selectedPlugin.isEnabled 
                            ? 'bg-orange-600 hover:bg-orange-700' 
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {selectedPlugin.isEnabled ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => {
                          uninstallPlugin(selectedPlugin.id);
                          setSelectedPlugin(null);
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                      >
                        Uninstall
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Installation Steps Modal */}
      {showInstallationSteps && installingPlugin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">Installing Plugin</h3>
                  <p className="text-slate-400 mt-1">{installingPlugin.name} v{installingPlugin.version}</p>
                </div>
                <div className="text-3xl">{installingPlugin.icon}</div>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {getInstallationSteps().map((step, index) => (
                  <div key={step.id} className="flex items-start space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.status === 'completed' ? 'bg-green-600 text-white' :
                      step.status === 'current' ? 'bg-blue-600 text-white' :
                      'bg-slate-700 text-slate-400'
                    }`}>
                      {step.status === 'completed' ? '✓' : step.id}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{step.icon}</span>
                        <h4 className={`font-medium ${
                          step.status === 'current' ? 'text-blue-400' : 'text-white'
                        }`}>
                          {step.title}
                        </h4>
                        {step.status === 'current' && (
                          <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 mt-1">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-400">
                    Step {installationStep} of 5
                  </div>
                  <div className="w-32 bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(installationStep / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plugin Configuration Modal */}
      {showConfigModal && configuringPlugin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center text-2xl">
                    {configuringPlugin.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{configuringPlugin.name} Configuration</h3>
                    <p className="text-slate-400">Configure plugin settings and preferences</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* API Configuration */}
              <div>
                <h4 className="font-medium text-white mb-3">API Configuration</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">API Endpoint</label>
                    <input
                      type="url"
                      value={pluginConfig.apiEndpoint || ''}
                      onChange={(e) => setPluginConfig({...pluginConfig, apiEndpoint: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://api.example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">API Key</label>
                    <input
                      type="password"
                      value={pluginConfig.apiKey || ''}
                      onChange={(e) => setPluginConfig({...pluginConfig, apiKey: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your API key"
                    />
                  </div>
                </div>
              </div>

              {/* Display Settings */}
              <div>
                <h4 className="font-medium text-white mb-3">Display Settings</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Refresh Interval (seconds)</label>
                    <input
                      type="number"
                      min="1"
                      max="3600"
                      value={pluginConfig.refreshInterval || 30}
                      onChange={(e) => setPluginConfig({...pluginConfig, refreshInterval: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showDebugInfo"
                      checked={pluginConfig.showDebugInfo || false}
                      onChange={(e) => setPluginConfig({...pluginConfig, showDebugInfo: e.target.checked})}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="showDebugInfo" className="text-sm text-slate-300">Show Debug Information</label>
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div>
                <h4 className="font-medium text-white mb-3">Advanced Settings</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Custom CSS</label>
                    <textarea
                      value={pluginConfig.customCSS || ''}
                      onChange={(e) => setPluginConfig({...pluginConfig, customCSS: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="/* Custom CSS for this plugin */"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Environment</label>
                    <select
                      value={pluginConfig.environment || 'production'}
                      onChange={(e) => setPluginConfig({...pluginConfig, environment: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="development">Development</option>
                      <option value="staging">Staging</option>
                      <option value="production">Production</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Plugin Info */}
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <h4 className="font-medium text-white mb-2">Plugin Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Version:</span>
                    <span className="text-white ml-2">{configuringPlugin.version}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Author:</span>
                    <span className="text-white ml-2">{configuringPlugin.author}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Category:</span>
                    <span className="text-white ml-2">{configuringPlugin.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Size:</span>
                    <span className="text-white ml-2">{configuringPlugin.size}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 border-t border-slate-700">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors"
              >
                Cancel
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={() => setPluginConfig({})}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-md transition-colors"
                >
                  Reset to Defaults
                </button>
                <button
                  onClick={savePluginConfig}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
