/**
 * Configuration Editor Component
 * Visual interface for editing digital signage configurations
 */

import React, { useState, useEffect, useCallback } from 'react'
import type { ScreenConfig, ConfigTemplate, ConfigValidationResult } from '../types/ConfigTypes'

interface ConfigEditorProps {
  /** Initial configuration */
  initialConfig?: ScreenConfig
  /** Available templates */
  templates?: ConfigTemplate[]
  /** Callback when configuration changes */
  onConfigChange?: (config: ScreenConfig) => void
  /** Callback when configuration is saved */
  onConfigSave?: (config: ScreenConfig) => void
  /** Theme */
  theme?: 'dark' | 'light'
  /** Whether the editor is visible */
  visible?: boolean
}

interface TabState {
  activeTab: 'general' | 'components' | 'layout' | 'schedule' | 'templates'
}

export default function ConfigEditor({
  initialConfig,
  templates = [],
  onConfigChange,
  onConfigSave,
  theme = 'dark',
  visible = true
}: ConfigEditorProps) {
  const [config, setConfig] = useState<ScreenConfig>(
    initialConfig || {
      version: '1.0.0',
      id: `config_${Date.now()}`,
      name: 'New Configuration',
      description: 'A new configuration',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      screenId: `screen_${Date.now()}`,
      theme: 'dark',
      timezone: 'UTC',
      layout: {
        id: 'default',
        name: 'Default Layout',
        description: 'Standard layout',
        grid: { cols: 12, rows: 8, gap: 2, showGrid: false },
        components: [],
        metadata: { createdAt: new Date().toISOString(), version: '1.0.0' }
      },
      components: {},
      global: {
        welcomeText: 'Herzlich Willkommen',
        welcomeTextColor: '#ffffff',
        hideCursor: false,
        autoRefresh: true,
        refreshIntervals: { contentMs: 30000, rotateMs: 8000 }
      },
      schedule: { rules: [], default: {}, timezone: 'UTC' },
      powerProfile: 'balanced',
      tags: [],
      metadata: {}
    }
  )

  const [tabState, setTabState] = useState<TabState>({ activeTab: 'general' })
  const [validation, setValidation] = useState<ConfigValidationResult | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ConfigTemplate | null>(null)

  // Update config when initial config changes
  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig)
      setIsDirty(false)
    }
  }, [initialConfig])

  // Handle configuration changes
  const handleConfigChange = useCallback((updates: Partial<ScreenConfig>) => {
    setConfig(prev => ({ ...prev, ...updates, updatedAt: new Date().toISOString() }))
    setIsDirty(true)
    onConfigChange?.(config)
  }, [config, onConfigChange])

  // Handle component configuration changes
  const handleComponentChange = useCallback((componentType: string, componentConfig: any) => {
    setConfig(prev => ({
      ...prev,
      components: {
        ...prev.components,
        [componentType]: componentConfig
      },
      updatedAt: new Date().toISOString()
    }))
    setIsDirty(true)
  }, [])

  // Handle global settings changes
  const handleGlobalChange = useCallback((globalSettings: any) => {
    setConfig(prev => ({
      ...prev,
      global: { ...prev.global, ...globalSettings },
      updatedAt: new Date().toISOString()
    }))
    setIsDirty(true)
  }, [])

  // Handle template selection
  const handleTemplateSelect = useCallback((template: ConfigTemplate) => {
    setSelectedTemplate(template)
    setTabState({ activeTab: 'templates' })
  }, [])

  // Handle save
  const handleSave = useCallback(() => {
    onConfigSave?.(config)
    setIsDirty(false)
  }, [config, onConfigSave])

  // Render tab content
  const renderTabContent = () => {
    switch (tabState.activeTab) {
      case 'general':
        return <GeneralTab config={config} onChange={handleConfigChange} theme={theme} />
      case 'components':
        return <ComponentsTab config={config} onChange={handleComponentChange} theme={theme} />
      case 'layout':
        return <LayoutTab config={config} onChange={handleConfigChange} theme={theme} />
      case 'schedule':
        return <ScheduleTab config={config} onChange={handleConfigChange} theme={theme} />
      case 'templates':
        return <TemplatesTab templates={templates} selectedTemplate={selectedTemplate} onSelect={handleTemplateSelect} theme={theme} />
      default:
        return null
    }
  }

  if (!visible) return null

  return (
    <div
      className="config-editor"
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
        className="editor-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          borderBottom: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
          backgroundColor: theme === 'light' ? '#f9fafb' : '#1f2937'
        }}
      >
        <div className="header-info">
          <h2
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 600,
              color: theme === 'light' ? '#111827' : '#f9fafb'
            }}
          >
            Configuration Editor
          </h2>
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: '14px',
              color: theme === 'light' ? '#6b7280' : '#9ca3af'
            }}
          >
            {config.name} {isDirty && '(Modified)'}
          </p>
        </div>
        <div className="header-actions">
          <button
            onClick={handleSave}
            disabled={!isDirty}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              backgroundColor: isDirty ? '#3b82f6' : '#6b7280',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: isDirty ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.2s ease'
            }}
          >
            Save Configuration
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="editor-tabs"
        style={{
          display: 'flex',
          borderBottom: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
          backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937'
        }}
      >
        {[
          { id: 'general', label: 'General' },
          { id: 'components', label: 'Components' },
          { id: 'layout', label: 'Layout' },
          { id: 'schedule', label: 'Schedule' },
          { id: 'templates', label: 'Templates' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setTabState({ activeTab: tab.id as any })}
            style={{
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: 500,
              backgroundColor: tabState.activeTab === tab.id 
                ? (theme === 'light' ? '#f3f4f6' : '#374151')
                : 'transparent',
              color: tabState.activeTab === tab.id
                ? (theme === 'light' ? '#111827' : '#f9fafb')
                : (theme === 'light' ? '#6b7280' : '#9ca3af'),
              border: 'none',
              borderBottom: tabState.activeTab === tab.id
                ? `2px solid ${theme === 'light' ? '#3b82f6' : '#60a5fa'}`
                : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div
        className="editor-content"
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px'
        }}
      >
        {renderTabContent()}
      </div>

      {/* Validation errors */}
      {validation && !validation.valid && (
        <div
          className="validation-errors"
          style={{
            padding: '16px',
            backgroundColor: '#fef2f2',
            borderTop: '1px solid #fecaca',
            color: '#dc2626'
          }}
        >
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
            Configuration Errors:
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {validation.errors.map((error, index) => (
              <li key={index} style={{ fontSize: '12px', marginBottom: '4px' }}>
                {error.path}: {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Tab Components
function GeneralTab({ config, onChange, theme }: { config: ScreenConfig; onChange: (updates: Partial<ScreenConfig>) => void; theme: string }) {
  return (
    <div className="general-tab" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="form-section">
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: theme === 'light' ? '#111827' : '#f9fafb' }}>
          Basic Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: theme === 'light' ? '#374151' : '#d1d5db' }}>
              Configuration Name
            </label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => onChange({ name: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}`,
                borderRadius: '4px',
                backgroundColor: theme === 'light' ? '#ffffff' : '#374151',
                color: theme === 'light' ? '#111827' : '#f9fafb'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: theme === 'light' ? '#374151' : '#d1d5db' }}>
              Screen ID
            </label>
            <input
              type="text"
              value={config.screenId}
              onChange={(e) => onChange({ screenId: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}`,
                borderRadius: '4px',
                backgroundColor: theme === 'light' ? '#ffffff' : '#374151',
                color: theme === 'light' ? '#111827' : '#f9fafb'
              }}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: theme === 'light' ? '#111827' : '#f9fafb' }}>
          Display Settings
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: theme === 'light' ? '#374151' : '#d1d5db' }}>
              Theme
            </label>
            <select
              value={config.theme}
              onChange={(e) => onChange({ theme: e.target.value as 'dark' | 'light' })}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}`,
                borderRadius: '4px',
                backgroundColor: theme === 'light' ? '#ffffff' : '#374151',
                color: theme === 'light' ? '#111827' : '#f9fafb'
              }}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: theme === 'light' ? '#374151' : '#d1d5db' }}>
              Timezone
            </label>
            <input
              type="text"
              value={config.timezone}
              onChange={(e) => onChange({ timezone: e.target.value })}
              placeholder="e.g., Europe/Berlin"
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}`,
                borderRadius: '4px',
                backgroundColor: theme === 'light' ? '#ffffff' : '#374151',
                color: theme === 'light' ? '#111827' : '#f9fafb'
              }}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: theme === 'light' ? '#111827' : '#f9fafb' }}>
          Performance
        </h3>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: theme === 'light' ? '#374151' : '#d1d5db' }}>
            Power Profile
          </label>
          <select
            value={config.powerProfile}
            onChange={(e) => onChange({ powerProfile: e.target.value as any })}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '14px',
              border: `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}`,
              borderRadius: '4px',
              backgroundColor: theme === 'light' ? '#ffffff' : '#374151',
              color: theme === 'light' ? '#111827' : '#f9fafb'
            }}
          >
            <option value="performance">Performance</option>
            <option value="balanced">Balanced</option>
            <option value="visual">Visual</option>
          </select>
        </div>
      </div>
    </div>
  )
}

function ComponentsTab({ config, onChange, theme }: { config: ScreenConfig; onChange: (componentType: string, componentConfig: any) => void; theme: string }) {
  return (
    <div className="components-tab" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: theme === 'light' ? '#111827' : '#f9fafb' }}>
        Component Configuration
      </h3>
      <p style={{ margin: 0, fontSize: '14px', color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
        Configure individual components for your digital signage display.
      </p>
      {/* Component configuration forms would go here */}
    </div>
  )
}

function LayoutTab({ config, onChange, theme }: { config: ScreenConfig; onChange: (updates: Partial<ScreenConfig>) => void; theme: string }) {
  return (
    <div className="layout-tab" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: theme === 'light' ? '#111827' : '#f9fafb' }}>
        Layout Configuration
      </h3>
      <p style={{ margin: 0, fontSize: '14px', color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
        Configure the layout and positioning of components.
      </p>
      {/* Layout configuration forms would go here */}
    </div>
  )
}

function ScheduleTab({ config, onChange, theme }: { config: ScreenConfig; onChange: (updates: Partial<ScreenConfig>) => void; theme: string }) {
  return (
    <div className="schedule-tab" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: theme === 'light' ? '#111827' : '#f9fafb' }}>
        Schedule Configuration
      </h3>
      <p style={{ margin: 0, fontSize: '14px', color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
        Configure time-based schedule rules for your display.
      </p>
      {/* Schedule configuration forms would go here */}
    </div>
  )
}

function TemplatesTab({ templates, selectedTemplate, onSelect, theme }: { templates: ConfigTemplate[]; selectedTemplate: ConfigTemplate | null; onSelect: (template: ConfigTemplate) => void; theme: string }) {
  return (
    <div className="templates-tab" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: theme === 'light' ? '#111827' : '#f9fafb' }}>
        Configuration Templates
      </h3>
      <p style={{ margin: 0, fontSize: '14px', color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
        Choose from predefined configuration templates to get started quickly.
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {templates.map(template => (
          <div
            key={template.id}
            onClick={() => onSelect(template)}
            style={{
              padding: '16px',
              border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
              borderRadius: '8px',
              backgroundColor: theme === 'light' ? '#ffffff' : '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = theme === 'light' ? '#3b82f6' : '#60a5fa'
              e.currentTarget.style.backgroundColor = theme === 'light' ? '#f8fafc' : '#4b5563'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme === 'light' ? '#e5e7eb' : '#374151'
              e.currentTarget.style.backgroundColor = theme === 'light' ? '#ffffff' : '#374151'
            }}
          >
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600, color: theme === 'light' ? '#111827' : '#f9fafb' }}>
              {template.name}
            </h4>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
              {template.description}
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {template.tags.map(tag => (
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
        ))}
      </div>
    </div>
  )
}
