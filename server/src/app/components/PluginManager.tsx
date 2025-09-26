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
    setPlugins(prev => prev.map(p => 
      p.id === plugin.id ? { ...p, isLoading: true } : p
    ));

    // Simulate installation delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const installedPlugin = { ...plugin, isInstalled: true, isEnabled: true, isLoading: false };
    
    // Update marketplace plugins
    setPlugins(prev => prev.map(p => 
      p.id === plugin.id ? installedPlugin : p
    ));

    // Add to installed plugins
    const updatedInstalled = [...installedPlugins, installedPlugin];
    saveInstalledPlugins(updatedInstalled);

    onPluginInstall(installedPlugin);
    alert(`Plugin "${plugin.name}" installed successfully!`);
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
                className={`flex-1 px-3 py-2 text-white text-sm rounded transition-colors ${
                  plugin.isEnabled 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {plugin.isEnabled ? '⏸️ Disable' : '▶️ Enable'}
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
          <div className="card">
            <div className="p-6">
              <h4 className="font-medium text-white mb-4 flex items-center space-x-2">
                <span>🔧</span>
                <span>Plugin Development</span>
              </h4>
              
              <div className="space-y-4">
                <div className="bg-slate-900 p-4 rounded-lg">
                  <h5 className="font-medium text-white mb-2">Quick Start</h5>
                  <div className="text-sm text-slate-300 space-y-2">
                    <p>1. Create a new plugin using our CLI tool:</p>
                    <code className="block bg-slate-800 p-2 rounded text-green-400">
                      npx gb-cms-cli create-plugin my-awesome-plugin
                    </code>
                    <p>2. Develop your plugin using our SDK</p>
                    <p>3. Test locally and publish to the marketplace</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-left transition-colors">
                    <div className="text-lg mb-1">📚</div>
                    <div className="font-medium text-white text-sm">Documentation</div>
                    <div className="text-xs text-slate-400">Plugin development guide</div>
                  </button>
                  
                  <button className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-left transition-colors">
                    <div className="text-lg mb-1">🎯</div>
                    <div className="font-medium text-white text-sm">Examples</div>
                    <div className="text-xs text-slate-400">Sample plugin code</div>
                  </button>
                  
                  <button className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-left transition-colors">
                    <div className="text-lg mb-1">🛠️</div>
                    <div className="font-medium text-white text-sm">SDK Reference</div>
                    <div className="text-xs text-slate-400">API documentation</div>
                  </button>
                  
                  <button className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-left transition-colors">
                    <div className="text-lg mb-1">📤</div>
                    <div className="font-medium text-white text-sm">Publish</div>
                    <div className="text-xs text-slate-400">Submit to marketplace</div>
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
    </div>
  );
}
