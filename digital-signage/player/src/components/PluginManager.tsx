/**
 * Plugin Manager Component
 * Interface for managing plugins, installation, and configuration
 */

import React, { useState, useEffect, useCallback } from 'react'
import type { PluginManifest, PluginState } from '../types/PluginTypes'

interface PluginManagerProps {
  /** Available plugins */
  plugins?: PluginManifest[]
  /** Plugin states */
  pluginStates?: Map<string, PluginState>
  /** Callback when plugin is installed */
  onPluginInstall?: (plugin: PluginManifest) => void
  /** Callback when plugin is uninstalled */
  onPluginUninstall?: (pluginId: string) => void
  /** Callback when plugin is activated */
  onPluginActivate?: (pluginId: string) => void
  /** Callback when plugin is deactivated */
  onPluginDeactivate?: (pluginId: string) => void
  /** Theme */
  theme?: 'dark' | 'light'
  /** Whether the manager is visible */
  visible?: boolean
}

interface ManagerState {
  activeTab: 'installed' | 'store' | 'development' | 'analytics'
  selectedPlugin: string | null
  searchQuery: string
  selectedCategory: string
  sortBy: 'name' | 'version' | 'status' | 'updatedAt'
  sortDirection: 'asc' | 'desc'
}

export default function PluginManager({
  plugins = [],
  pluginStates = new Map(),
  onPluginInstall,
  onPluginUninstall,
  onPluginActivate,
  onPluginDeactivate,
  theme = 'dark',
  visible = true
}: PluginManagerProps) {
  const [managerState, setManagerState] = useState<ManagerState>({
    activeTab: 'installed',
    selectedPlugin: null,
    searchQuery: '',
    selectedCategory: 'all',
    sortBy: 'name',
    sortDirection: 'asc'
  })

  const [filteredPlugins, setFilteredPlugins] = useState<PluginManifest[]>(plugins)

  // Filter and sort plugins
  useEffect(() => {
    let filtered = [...plugins]

    // Search filter
    if (managerState.searchQuery) {
      const query = managerState.searchQuery.toLowerCase()
      filtered = filtered.filter(plugin =>
        plugin.metadata.name.toLowerCase().includes(query) ||
        plugin.metadata.description.toLowerCase().includes(query) ||
        plugin.metadata.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Category filter
    if (managerState.selectedCategory !== 'all') {
      filtered = filtered.filter(plugin => plugin.metadata.category === managerState.selectedCategory)
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (managerState.sortBy) {
        case 'name':
          aValue = a.metadata.name
          bValue = b.metadata.name
          break
        case 'version':
          aValue = a.metadata.version
          bValue = b.metadata.version
          break
        case 'status':
          aValue = pluginStates.get(a.metadata.id)?.status || 'unknown'
          bValue = pluginStates.get(b.metadata.id)?.status || 'unknown'
          break
        case 'updatedAt':
          aValue = new Date(a.metadata.updatedAt)
          bValue = new Date(b.metadata.updatedAt)
          break
        default:
          aValue = a.metadata.name
          bValue = b.metadata.name
      }

      if (managerState.sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredPlugins(filtered)
  }, [plugins, pluginStates, managerState])

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setManagerState(prev => ({ ...prev, searchQuery: query }))
  }, [])

  // Handle category change
  const handleCategoryChange = useCallback((category: string) => {
    setManagerState(prev => ({ ...prev, selectedCategory: category }))
  }, [])

  // Handle sort change
  const handleSortChange = useCallback((sortBy: string, direction: 'asc' | 'desc') => {
    setManagerState(prev => ({ ...prev, sortBy: sortBy as any, sortDirection: direction }))
  }, [])

  // Handle plugin selection
  const handlePluginSelect = useCallback((pluginId: string) => {
    setManagerState(prev => ({ ...prev, selectedPlugin: pluginId }))
  }, [])

  // Handle plugin installation
  const handlePluginInstall = useCallback((plugin: PluginManifest) => {
    onPluginInstall?.(plugin)
  }, [onPluginInstall])

  // Handle plugin uninstallation
  const handlePluginUninstall = useCallback((pluginId: string) => {
    onPluginUninstall?.(pluginId)
  }, [onPluginUninstall])

  // Handle plugin activation
  const handlePluginActivate = useCallback((pluginId: string) => {
    onPluginActivate?.(pluginId)
  }, [onPluginActivate])

  // Handle plugin deactivation
  const handlePluginDeactivate = useCallback((pluginId: string) => {
    onPluginDeactivate?.(pluginId)
  }, [onPluginDeactivate])

  // Get categories
  const categories = ['all', ...Array.from(new Set(plugins.map(p => p.metadata.category)))]

  if (!visible) return null

  return (
    <div
      className="plugin-manager"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme === 'light' ? '#ffffff' : '#111827'
      }}
    >
      {/* Header */}
      <div
        className="manager-header"
        style={{
          padding: '24px',
          borderBottom: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
          backgroundColor: theme === 'light' ? '#f9fafb' : '#1f2937'
        }}
      >
        <h1
          style={{
            margin: '0 0 16px 0',
            fontSize: '28px',
            fontWeight: 700,
            color: theme === 'light' ? '#111827' : '#f9fafb'
          }}
        >
          Plugin Manager
        </h1>
        <p
          style={{
            margin: '0 0 24px 0',
            fontSize: '16px',
            color: theme === 'light' ? '#6b7280' : '#9ca3af'
          }}
        >
          Manage plugins, install new ones, and configure your digital signage system
        </p>

        {/* Search and Filters */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: '300px' }}>
            <input
              type="text"
              placeholder="Search plugins..."
              value={managerState.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                border: `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}`,
                borderRadius: '8px',
                backgroundColor: theme === 'light' ? '#ffffff' : '#374151',
                color: theme === 'light' ? '#111827' : '#f9fafb'
              }}
            />
          </div>

          {/* Category Filter */}
          <select
            value={managerState.selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            style={{
              padding: '12px 16px',
              fontSize: '16px',
              border: `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}`,
              borderRadius: '8px',
              backgroundColor: theme === 'light' ? '#ffffff' : '#374151',
              color: theme === 'light' ? '#111827' : '#f9fafb',
              minWidth: '150px'
            }}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={`${managerState.sortBy}-${managerState.sortDirection}`}
            onChange={(e) => {
              const [sortBy, sortDirection] = e.target.value.split('-')
              handleSortChange(sortBy, sortDirection as 'asc' | 'desc')
            }}
            style={{
              padding: '12px 16px',
              fontSize: '16px',
              border: `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}`,
              borderRadius: '8px',
              backgroundColor: theme === 'light' ? '#ffffff' : '#374151',
              color: theme === 'light' ? '#111827' : '#f9fafb',
              minWidth: '150px'
            }}
          >
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="version-desc">Latest Version</option>
            <option value="status-asc">Status</option>
            <option value="updatedAt-desc">Recently Updated</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="manager-tabs"
        style={{
          display: 'flex',
          borderBottom: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
          backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937'
        }}
      >
        {[
          { id: 'installed', label: 'Installed', icon: '📦' },
          { id: 'store', label: 'Store', icon: '🛒' },
          { id: 'development', label: 'Development', icon: '🛠️' },
          { id: 'analytics', label: 'Analytics', icon: '📊' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setManagerState(prev => ({ ...prev, activeTab: tab.id as any }))}
            style={{
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: 500,
              backgroundColor: managerState.activeTab === tab.id 
                ? (theme === 'light' ? '#f3f4f6' : '#374151')
                : 'transparent',
              color: managerState.activeTab === tab.id
                ? (theme === 'light' ? '#111827' : '#f9fafb')
                : (theme === 'light' ? '#6b7280' : '#9ca3af'),
              border: 'none',
              borderBottom: managerState.activeTab === tab.id
                ? `2px solid ${theme === 'light' ? '#3b82f6' : '#60a5fa'}`
                : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div
        className="manager-content"
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden'
        }}
      >
        {/* Plugin List */}
        <div
          className="plugin-list"
          style={{
            flex: 1,
            padding: '24px',
            overflow: 'auto'
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px'
            }}
          >
            {filteredPlugins.map(plugin => (
              <PluginCard
                key={plugin.metadata.id}
                plugin={plugin}
                pluginState={pluginStates.get(plugin.metadata.id)}
                isSelected={managerState.selectedPlugin === plugin.metadata.id}
                onSelect={() => handlePluginSelect(plugin.metadata.id)}
                onInstall={() => handlePluginInstall(plugin)}
                onUninstall={() => handlePluginUninstall(plugin.metadata.id)}
                onActivate={() => handlePluginActivate(plugin.metadata.id)}
                onDeactivate={() => handlePluginDeactivate(plugin.metadata.id)}
                theme={theme}
              />
            ))}
          </div>

          {filteredPlugins.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 24px',
                color: theme === 'light' ? '#6b7280' : '#9ca3af'
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600 }}>
                No plugins found
              </h3>
              <p style={{ margin: 0, fontSize: '14px' }}>
                Try adjusting your search criteria or install some plugins
              </p>
            </div>
          )}
        </div>

        {/* Plugin Details Sidebar */}
        {managerState.selectedPlugin && (
          <div
            className="plugin-details"
            style={{
              width: '400px',
              borderLeft: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
              backgroundColor: theme === 'light' ? '#f9fafb' : '#1f2937',
              overflow: 'auto'
            }}
          >
            <PluginDetails
              plugin={filteredPlugins.find(p => p.metadata.id === managerState.selectedPlugin)!}
              pluginState={pluginStates.get(managerState.selectedPlugin)}
              onInstall={() => handlePluginInstall(filteredPlugins.find(p => p.metadata.id === managerState.selectedPlugin)!)}
              onUninstall={() => handlePluginUninstall(managerState.selectedPlugin!)}
              onActivate={() => handlePluginActivate(managerState.selectedPlugin!)}
              onDeactivate={() => handlePluginDeactivate(managerState.selectedPlugin!)}
              theme={theme}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Plugin Card Component
function PluginCard({
  plugin,
  pluginState,
  isSelected,
  onSelect,
  onInstall,
  onUninstall,
  onActivate,
  onDeactivate,
  theme
}: {
  plugin: PluginManifest
  pluginState?: PluginState
  isSelected: boolean
  onSelect: () => void
  onInstall: () => void
  onUninstall: () => void
  onActivate: () => void
  onDeactivate: () => void
  theme: string
}) {
  const status = pluginState?.status || 'unknown'
  const health = pluginState?.health

  return (
    <div
      onClick={onSelect}
      style={{
        border: `2px solid ${isSelected ? '#3b82f6' : (theme === 'light' ? '#e5e7eb' : '#374151')}`,
        borderRadius: '12px',
        backgroundColor: theme === 'light' ? '#ffffff' : '#374151',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = theme === 'light' ? '#d1d5db' : '#6b7280'
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = theme === 'light' ? '#e5e7eb' : '#374151'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }
      }}
    >
      {/* Header */}
      <div style={{ padding: '16px 16px 0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <h3
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 600,
              color: theme === 'light' ? '#111827' : '#f9fafb',
              lineHeight: 1.2
            }}
          >
            {plugin.metadata.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Status Badge */}
            <span
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                fontWeight: 500,
                backgroundColor: getStatusColor(status),
                color: '#ffffff',
                borderRadius: '4px'
              }}
            >
              {status}
            </span>
            {/* Health Indicator */}
            {health && (
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: getHealthColor(health.status)
                }}
              />
            )}
          </div>
        </div>

        {/* Description */}
        <p
          style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            color: theme === 'light' ? '#6b7280' : '#9ca3af',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {plugin.metadata.description}
        </p>

        {/* Version and Author */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
          <span style={{ fontSize: '12px', color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
            v{plugin.metadata.version}
          </span>
          <span style={{ fontSize: '12px', color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
            by {plugin.metadata.author.name}
          </span>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {plugin.metadata.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              style={{
                padding: '2px 8px',
                fontSize: '12px',
                backgroundColor: theme === 'light' ? '#f3f4f6' : '#6b7280',
                color: theme === 'light' ? '#374151' : '#d1d5db',
                borderRadius: '12px'
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '0 16px 16px 16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {status === 'installed' ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onUninstall()
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: 500,
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Uninstall
              </button>
              {status === 'active' ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeactivate()
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: 500,
                    backgroundColor: '#f59e0b',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Deactivate
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onActivate()
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: 500,
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Activate
                </button>
              )}
            </>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onInstall()
              }}
              style={{
                width: '100%',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 500,
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Install Plugin
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Plugin Details Component
function PluginDetails({
  plugin,
  pluginState,
  onInstall,
  onUninstall,
  onActivate,
  onDeactivate,
  theme
}: {
  plugin: PluginManifest
  pluginState?: PluginState
  onInstall: () => void
  onUninstall: () => void
  onActivate: () => void
  onDeactivate: () => void
  theme: string
}) {
  const status = pluginState?.status || 'unknown'
  const health = pluginState?.health
  const metrics = pluginState?.metrics

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2
          style={{
            margin: '0 0 8px 0',
            fontSize: '20px',
            fontWeight: 600,
            color: theme === 'light' ? '#111827' : '#f9fafb'
          }}
        >
          {plugin.metadata.name}
        </h2>
        <p
          style={{
            margin: '0 0 16px 0',
            fontSize: '14px',
            color: theme === 'light' ? '#6b7280' : '#9ca3af',
            lineHeight: 1.5
          }}
        >
          {plugin.metadata.description}
        </p>

        {/* Status and Health */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                padding: '6px 12px',
                fontSize: '14px',
                fontWeight: 500,
                backgroundColor: getStatusColor(status),
                color: '#ffffff',
                borderRadius: '6px'
              }}
            >
              {status}
            </span>
            {health && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: getHealthColor(health.status)
                  }}
                />
                <span style={{ fontSize: '12px', color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                  {health.status}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Plugin Information */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: theme === 'light' ? '#111827' : '#f9fafb' }}>
          Plugin Information
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 500, color: theme === 'light' ? '#374151' : '#d1d5db' }}>
              Version:
            </span>
            <span style={{ fontSize: '14px', color: theme === 'light' ? '#6b7280' : '#9ca3af', marginLeft: '8px' }}>
              {plugin.metadata.version}
            </span>
          </div>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 500, color: theme === 'light' ? '#374151' : '#d1d5db' }}>
              Author:
            </span>
            <span style={{ fontSize: '14px', color: theme === 'light' ? '#6b7280' : '#9ca3af', marginLeft: '8px' }}>
              {plugin.metadata.author.name}
            </span>
          </div>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 500, color: theme === 'light' ? '#374151' : '#d1d5db' }}>
              Category:
            </span>
            <span style={{ fontSize: '14px', color: theme === 'light' ? '#6b7280' : '#9ca3af', marginLeft: '8px' }}>
              {plugin.metadata.category}
            </span>
          </div>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 500, color: theme === 'light' ? '#374151' : '#d1d5db' }}>
              Components:
            </span>
            <span style={{ fontSize: '14px', color: theme === 'light' ? '#6b7280' : '#9ca3af', marginLeft: '8px' }}>
              {plugin.config.components.length}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: theme === 'light' ? '#111827' : '#f9fafb' }}>
          Actions
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {status === 'installed' ? (
            <>
              {status === 'active' ? (
                <button
                  onClick={onDeactivate}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: 500,
                    backgroundColor: '#f59e0b',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Deactivate Plugin
                </button>
              ) : (
                <button
                  onClick={onActivate}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: 500,
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Activate Plugin
                </button>
              )}
              <button
                onClick={onUninstall}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: 500,
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Uninstall Plugin
              </button>
            </>
          ) : (
            <button
              onClick={onInstall}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                fontWeight: 600,
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Install Plugin
            </button>
          )}
        </div>
      </div>

      {/* Tags */}
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: theme === 'light' ? '#111827' : '#f9fafb' }}>
          Tags
        </h3>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {plugin.metadata.tags.map(tag => (
            <span
              key={tag}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                backgroundColor: theme === 'light' ? '#f3f4f6' : '#6b7280',
                color: theme === 'light' ? '#374151' : '#d1d5db',
                borderRadius: '12px'
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// Helper functions
function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return '#10b981'
    case 'inactive':
      return '#6b7280'
    case 'error':
      return '#dc2626'
    case 'installed':
      return '#3b82f6'
    default:
      return '#6b7280'
  }
}

function getHealthColor(health: string): string {
  switch (health) {
    case 'healthy':
      return '#10b981'
    case 'warning':
      return '#f59e0b'
    case 'error':
      return '#dc2626'
    default:
      return '#6b7280'
  }
}
