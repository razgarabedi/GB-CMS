/**
 * Plugin Manager UI Component
 * 
 * Provides a comprehensive interface for managing plugins,
 * including installation, configuration, and marketplace integration.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  PluginManagerUI, 
  PluginUI, 
  PluginStatus,
  ComponentCategory
} from '../types/UITypes';

interface PluginManagerUIProps {
  manager: PluginManagerUI;
  onManagerChange: (manager: PluginManagerUI) => void;
  onPluginInstall: (pluginId: string) => void;
  onPluginUninstall: (pluginId: string) => void;
  onPluginEnable: (pluginId: string) => void;
  onPluginDisable: (pluginId: string) => void;
  onPluginUpdate: (pluginId: string) => void;
  onPluginConfigure: (pluginId: string) => void;
  className?: string;
}

export const PluginManagerUI: React.FC<PluginManagerUIProps> = ({
  manager,
  onManagerChange,
  onPluginInstall,
  onPluginUninstall,
  onPluginEnable,
  onPluginDisable,
  onPluginUpdate,
  onPluginConfigure,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(manager.searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | 'all'>(manager.selectedCategory);
  const [sortBy, setSortBy] = useState(manager.sortBy);
  const [viewMode, setViewMode] = useState<'store' | 'installed'>('store');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null);

  // Filter and sort plugins
  const filteredPlugins = useMemo(() => {
    let filtered = manager.plugins;

    // Filter by view mode
    if (viewMode === 'installed') {
      filtered = filtered.filter(plugin => plugin.isInstalled);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(plugin => 
        plugin.name.toLowerCase().includes(query) ||
        plugin.description.toLowerCase().includes(query) ||
        plugin.author.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(plugin => plugin.category === selectedCategory);
    }

    // Filter by status
    if (manager.filterBy.status.length > 0) {
      filtered = filtered.filter(plugin => manager.filterBy.status.includes(plugin.status));
    }

    // Filter by installation status
    if (manager.filterBy.isInstalled !== null) {
      filtered = filtered.filter(plugin => plugin.isInstalled === manager.filterBy.isInstalled);
    }

    // Filter by free/paid
    if (manager.filterBy.isFree !== null) {
      filtered = filtered.filter(plugin => plugin.isFree === manager.filterBy.isFree);
    }

    // Filter by category
    if (manager.filterBy.category.length > 0) {
      filtered = filtered.filter(plugin => manager.filterBy.category.includes(plugin.category));
    }

    // Sort plugins
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'popularity':
          return b.downloads - a.downloads;
        case 'recent':
          // This would need timestamp data
          return 0;
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          return a.price - b.price;
        default:
          return 0;
      }
    });

    return filtered;
  }, [manager.plugins, viewMode, searchQuery, selectedCategory, manager.filterBy, sortBy]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    onManagerChange({
      ...manager,
      searchQuery: query
    });
  }, [manager, onManagerChange]);

  // Handle category change
  const handleCategoryChange = useCallback((category: ComponentCategory | 'all') => {
    setSelectedCategory(category);
    onManagerChange({
      ...manager,
      selectedCategory: category
    });
  }, [manager, onManagerChange]);

  // Handle sort change
  const handleSortChange = useCallback((sort: typeof sortBy) => {
    setSortBy(sort);
    onManagerChange({
      ...manager,
      sortBy: sort
    });
  }, [manager, onManagerChange]);

  // Handle plugin action
  const handlePluginAction = useCallback((pluginId: string, action: string) => {
    switch (action) {
      case 'install':
        onPluginInstall(pluginId);
        break;
      case 'uninstall':
        onPluginUninstall(pluginId);
        break;
      case 'enable':
        onPluginEnable(pluginId);
        break;
      case 'disable':
        onPluginDisable(pluginId);
        break;
      case 'update':
        onPluginUpdate(pluginId);
        break;
      case 'configure':
        onPluginConfigure(pluginId);
        break;
    }
  }, [onPluginInstall, onPluginUninstall, onPluginEnable, onPluginDisable, onPluginUpdate, onPluginConfigure]);

  // Get status color
  const getStatusColor = (status: PluginStatus) => {
    switch (status) {
      case 'available':
        return 'text-green-400';
      case 'installing':
        return 'text-blue-400';
      case 'installed':
        return 'text-green-400';
      case 'enabled':
        return 'text-green-400';
      case 'disabled':
        return 'text-yellow-400';
      case 'updating':
        return 'text-blue-400';
      case 'error':
        return 'text-red-400';
      case 'uninstalling':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  // Get status icon
  const getStatusIcon = (status: PluginStatus) => {
    switch (status) {
      case 'available':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case 'installing':
      case 'updating':
        return (
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        );
      case 'installed':
      case 'enabled':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'disabled':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Render plugin card
  const renderPluginCard = (plugin: PluginUI) => {
    const isSelected = selectedPlugin === plugin.id;
    
    return (
      <div
        key={plugin.id}
        className={`relative bg-gray-900 border rounded-lg overflow-hidden transition-all duration-200 ${
          isSelected 
            ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' 
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onClick={() => setSelectedPlugin(plugin.id)}
      >
        {/* Header */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                {plugin.icon.type === 'material' && (
                  <span className="material-icons text-blue-400">{plugin.icon.name}</span>
                )}
                {plugin.icon.type === 'fontawesome' && (
                  <i className={`fa fa-${plugin.icon.name} text-blue-400`}></i>
                )}
                {plugin.icon.type === 'svg' && (
                  <div dangerouslySetInnerHTML={{ __html: plugin.icon.data || '' }} />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-white truncate">
                  {plugin.name}
                </h3>
                <p className="text-xs text-gray-400">
                  by {plugin.author}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Status */}
              <div className={`flex items-center space-x-1 ${getStatusColor(plugin.status)}`}>
                {getStatusIcon(plugin.status)}
                <span className="text-xs capitalize">{plugin.status}</span>
              </div>
              
              {/* Price */}
              {!plugin.isFree && (
                <div className="text-xs text-green-400 font-medium">
                  ${plugin.price}
                </div>
              )}
            </div>
          </div>
          
          <p className="text-xs text-gray-400 mb-3 line-clamp-2">
            {plugin.description}
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{plugin.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{plugin.downloads}</span>
              </div>
            </div>
            
            <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
              {plugin.category}
            </span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {plugin.isInstalled ? (
                <>
                  {plugin.isEnabled ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePluginAction(plugin.id, 'disable');
                      }}
                      className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                    >
                      Disable
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePluginAction(plugin.id, 'enable');
                      }}
                      className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      Enable
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePluginAction(plugin.id, 'configure');
                    }}
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Configure
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePluginAction(plugin.id, 'uninstall');
                    }}
                    className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Uninstall
                  </button>
                </>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePluginAction(plugin.id, 'install');
                  }}
                  disabled={plugin.status === 'installing'}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {plugin.status === 'installing' ? 'Installing...' : 'Install'}
                </button>
              )}
            </div>
            
            {plugin.isInstalled && plugin.status === 'updating' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePluginAction(plugin.id, 'update');
                }}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Update
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-gray-800 flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Plugin Manager</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onManagerChange({
                ...manager,
                showStore: !manager.showStore
              })}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                manager.showStore
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              Store
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-4">
          <button
            onClick={() => setViewMode('store')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              viewMode === 'store'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Plugin Store
          </button>
          <button
            onClick={() => setViewMode('installed')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              viewMode === 'installed'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Installed ({manager.plugins.filter(p => p.isInstalled).length})
          </button>
        </div>
        
        {/* Search and Filters */}
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search plugins..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-3 py-2 pl-10 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value as ComponentCategory | 'all')}
                className="px-3 py-1 text-sm bg-gray-900 border border-gray-600 rounded text-white"
              >
                <option value="all">All Categories</option>
                <option value="widget">Widgets</option>
                <option value="layout">Layouts</option>
                <option value="utility">Utilities</option>
                <option value="service">Services</option>
                <option value="theme">Themes</option>
                <option value="integration">Integrations</option>
                <option value="custom">Custom</option>
                <option value="plugin">Plugins</option>
              </select>
              
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as typeof sortBy)}
                className="px-3 py-1 text-sm bg-gray-900 border border-gray-600 rounded text-white"
              >
                <option value="name">Name</option>
                <option value="popularity">Popularity</option>
                <option value="recent">Recent</option>
                <option value="rating">Rating</option>
                <option value="price">Price</option>
              </select>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 border-b border-gray-700 bg-gray-900">
          <h3 className="text-sm font-medium text-white mb-3">Filters</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">Status</label>
              <div className="flex flex-wrap gap-2">
                {['available', 'installing', 'installed', 'enabled', 'disabled', 'updating', 'error'].map(status => (
                  <label key={status} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={manager.filterBy.status.includes(status as PluginStatus)}
                      onChange={(e) => {
                        const newStatus = e.target.checked
                          ? [...manager.filterBy.status, status as PluginStatus]
                          : manager.filterBy.status.filter(s => s !== status);
                        onManagerChange({
                          ...manager,
                          filterBy: { ...manager.filterBy, status: newStatus }
                        });
                      }}
                      className="mr-1"
                    />
                    <span className="text-xs text-gray-300 capitalize">{status}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Type Filter */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">Type</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="typeFilter"
                    checked={manager.filterBy.isInstalled === null}
                    onChange={() => onManagerChange({
                      ...manager,
                      filterBy: { ...manager.filterBy, isInstalled: null }
                    })}
                    className="mr-2"
                  />
                  <span className="text-xs text-gray-300">All</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="typeFilter"
                    checked={manager.filterBy.isInstalled === true}
                    onChange={() => onManagerChange({
                      ...manager,
                      filterBy: { ...manager.filterBy, isInstalled: true }
                    })}
                    className="mr-2"
                  />
                  <span className="text-xs text-gray-300">Installed</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="typeFilter"
                    checked={manager.filterBy.isFree === true}
                    onChange={() => onManagerChange({
                      ...manager,
                      filterBy: { ...manager.filterBy, isFree: true }
                    })}
                    className="mr-2"
                  />
                  <span className="text-xs text-gray-300">Free</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="typeFilter"
                    checked={manager.filterBy.isFree === false}
                    onChange={() => onManagerChange({
                      ...manager,
                      filterBy: { ...manager.filterBy, isFree: false }
                    })}
                    className="mr-2"
                  />
                  <span className="text-xs text-gray-300">Paid</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plugins List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredPlugins.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-lg font-medium mb-2">No plugins found</p>
            <p className="text-sm text-gray-500 mb-4">
              {viewMode === 'store' 
                ? 'Try adjusting your search or filters'
                : 'Install plugins from the store to see them here'
              }
            </p>
            {viewMode === 'installed' && (
              <button
                onClick={() => setViewMode('store')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Browse Plugin Store
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlugins.map(renderPluginCard)}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 bg-gray-900">
        <div className="text-xs text-gray-400 text-center">
          {filteredPlugins.length} of {manager.plugins.length} plugins
        </div>
      </div>
    </div>
  );
};

export default PluginManagerUI;
