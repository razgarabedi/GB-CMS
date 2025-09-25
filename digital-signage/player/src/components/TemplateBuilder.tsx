/**
 * Template Builder Component
 * Visual interface for creating and editing advanced templates
 */

import { useState, useEffect, useCallback } from 'react'
import type { AdvancedTemplate, TemplateComponent, TemplateVariable } from '../types/TemplateTypes'

interface TemplateBuilderProps {
  /** Initial template */
  initialTemplate?: AdvancedTemplate
  /** Available components */
  availableComponents?: any[]
  /** Callback when template changes */
  onTemplateChange?: (template: AdvancedTemplate) => void
  /** Callback when template is saved */
  onTemplateSave?: (template: AdvancedTemplate) => void
  /** Theme */
  theme?: 'dark' | 'light'
  /** Whether the builder is visible */
  visible?: boolean
}

interface BuilderState {
  activeTab: 'design' | 'components' | 'variables' | 'logic' | 'preview' | 'settings'
  selectedComponent: string | null
  draggedComponent: any | null
  gridSize: { cols: number; rows: number }
  zoom: number
}

export default function TemplateBuilder({
  initialTemplate,
  availableComponents: _availableComponents = [],
  onTemplateChange: _onTemplateChange,
  onTemplateSave,
  theme = 'dark',
  visible = true
}: TemplateBuilderProps) {
  const [template, setTemplate] = useState<AdvancedTemplate>(
    initialTemplate || {
      metadata: {
        id: `template_${Date.now()}`,
        name: 'New Template',
        description: 'A new template',
        version: '1.0.0',
        category: 'custom',
        tags: [],
        author: {
          id: 'user',
          name: 'User',
          email: 'user@example.com'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft',
        visibility: 'private'
      },
      config: {
        base: {},
        components: {},
        layout: {
          id: 'default',
          name: 'Default Layout',
          description: 'Standard layout',
          grid: { cols: 12, rows: 8, gap: 2, showGrid: false },
          components: [],
          metadata: { createdAt: new Date().toISOString(), version: '1.0.0' }
        },
        global: {},
        conditionals: [],
        overrides: []
      },
      variables: [],
      components: [],
      logic: {
        conditionals: [],
        eventHandlers: [],
        transformations: [],
        validationRules: [],
        businessRules: []
      },
      dependencies: []
    }
  )

  const [builderState, setBuilderState] = useState<BuilderState>({
    activeTab: 'design',
    selectedComponent: null,
    draggedComponent: null,
    gridSize: { cols: 12, rows: 8 },
    zoom: 1
  })

  const [isDirty, setIsDirty] = useState(false)

  // Update template when initial template changes
  useEffect(() => {
    if (initialTemplate) {
      setTemplate(initialTemplate)
      setIsDirty(false)
    }
  }, [initialTemplate])

  // Handle template changes
  const handleTemplateChange = useCallback((updates: Partial<AdvancedTemplate>) => {
    setTemplate(prev => ({ ...prev, ...updates, metadata: { ...prev.metadata, updatedAt: new Date().toISOString() } }))
    setIsDirty(true)
    _onTemplateChange?.(template)
  }, [template, _onTemplateChange])

  // Handle component addition
  const handleAddComponent = useCallback((componentType: string) => {
    const newComponent: TemplateComponent = {
      id: `component_${Date.now()}`,
      type: componentType,
      name: `${componentType} Component`,
      description: `A ${componentType} component`,
      category: 'widget',
      config: {
        properties: {},
        settings: {},
        dataSources: [],
        styling: {},
        animations: {},
        interactions: {}
      },
      position: {
        grid: { x: 1, y: 1, width: 2, height: 2 }
      },
      visibility: {
        default: true,
        conditionals: []
      },
      dependencies: [],
      conditions: []
    }

    setTemplate(prev => ({
      ...prev,
      components: [...prev.components, newComponent]
    }))
    setIsDirty(true)
  }, [])

  // Handle component selection
  const handleSelectComponent = useCallback((componentId: string) => {
    setBuilderState(prev => ({ ...prev, selectedComponent: componentId }))
  }, [])

  // Handle component update
  const handleUpdateComponent = useCallback((componentId: string, updates: Partial<TemplateComponent>) => {
    setTemplate(prev => ({
      ...prev,
      components: prev.components.map(comp =>
        comp.id === componentId ? { ...comp, ...updates } : comp
      )
    }))
    setIsDirty(true)
  }, [])

  // Handle component deletion
  const handleDeleteComponent = useCallback((componentId: string) => {
    setTemplate(prev => ({
      ...prev,
      components: prev.components.filter(comp => comp.id !== componentId)
    }))
    setIsDirty(true)
  }, [])

  // Handle variable addition
  const handleAddVariable = useCallback(() => {
    const newVariable: TemplateVariable = {
      name: `variable_${Date.now()}`,
      type: 'string',
      description: 'New variable',
      defaultValue: '',
      validation: { required: false }
    }

    setTemplate(prev => ({
      ...prev,
      variables: [...prev.variables, newVariable]
    }))
    setIsDirty(true)
  }, [])

  // Handle variable update
  const handleUpdateVariable = useCallback((index: number, updates: Partial<TemplateVariable>) => {
    setTemplate(prev => ({
      ...prev,
      variables: prev.variables.map((variable, i) =>
        i === index ? { ...variable, ...updates } : variable
      )
    }))
    setIsDirty(true)
  }, [])

  // Handle variable deletion
  const handleDeleteVariable = useCallback((index: number) => {
    setTemplate(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }))
    setIsDirty(true)
  }, [])

  // Handle save
  const handleSave = useCallback(() => {
    onTemplateSave?.(template)
    setIsDirty(false)
  }, [template, onTemplateSave])

  // Render tab content
  const renderTabContent = () => {
    switch (builderState.activeTab) {
      case 'design':
        return (
          <DesignTab
            template={template}
            builderState={builderState}
            onTemplateChange={handleTemplateChange}
            onAddComponent={handleAddComponent}
            onSelectComponent={handleSelectComponent}
            onUpdateComponent={handleUpdateComponent}
            onDeleteComponent={handleDeleteComponent}
            theme={theme}
          />
        )
      case 'components':
        return (
          <ComponentsTab
            template={template}
            onUpdateComponent={handleUpdateComponent}
            theme={theme}
          />
        )
      case 'variables':
        return (
          <VariablesTab
            template={template}
            onAddVariable={handleAddVariable}
            onUpdateVariable={handleUpdateVariable}
            onDeleteVariable={handleDeleteVariable}
            theme={theme}
          />
        )
      case 'logic':
        return (
          <LogicTab
            template={template}
            onTemplateChange={handleTemplateChange}
            theme={theme}
          />
        )
      case 'preview':
        return (
          <PreviewTab
            template={template}
            theme={theme}
          />
        )
      case 'settings':
        return (
          <SettingsTab
            template={template}
            onTemplateChange={handleTemplateChange}
            theme={theme}
          />
        )
      default:
        return null
    }
  }

  if (!visible) return null

  return (
    <div
      className="template-builder"
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
        className="builder-header"
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
            Template Builder
          </h2>
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: '14px',
              color: theme === 'light' ? '#6b7280' : '#9ca3af'
            }}
          >
            {template.metadata.name} {isDirty && '(Modified)'}
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
            Save Template
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="builder-tabs"
        style={{
          display: 'flex',
          borderBottom: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
          backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937'
        }}
      >
        {[
          { id: 'design', label: 'Design', icon: '🎨' },
          { id: 'components', label: 'Components', icon: '🧩' },
          { id: 'variables', label: 'Variables', icon: '📝' },
          { id: 'logic', label: 'Logic', icon: '⚡' },
          { id: 'preview', label: 'Preview', icon: '👁️' },
          { id: 'settings', label: 'Settings', icon: '⚙️' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setBuilderState(prev => ({ ...prev, activeTab: tab.id as any }))}
            style={{
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: 500,
              backgroundColor: builderState.activeTab === tab.id 
                ? (theme === 'light' ? '#f3f4f6' : '#374151')
                : 'transparent',
              color: builderState.activeTab === tab.id
                ? (theme === 'light' ? '#111827' : '#f9fafb')
                : (theme === 'light' ? '#6b7280' : '#9ca3af'),
              border: 'none',
              borderBottom: builderState.activeTab === tab.id
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
        className="builder-content"
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px'
        }}
      >
        {renderTabContent()}
      </div>
    </div>
  )
}

// Tab Components
function DesignTab({
  template,
  builderState,
  onTemplateChange: _onTemplateChange,
  onAddComponent,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent,
  theme
}: {
  template: AdvancedTemplate
  builderState: BuilderState
  onTemplateChange: (updates: Partial<AdvancedTemplate>) => void
  onAddComponent: (componentType: string) => void
  onSelectComponent: (componentId: string) => void
  onUpdateComponent: (componentId: string, updates: Partial<TemplateComponent>) => void
  onDeleteComponent: (componentId: string) => void
  theme: string
}) {
  return (
    <div className="design-tab" style={{ display: 'flex', gap: '24px', height: '100%' }}>
      {/* Component Library */}
      <div
        className="component-library"
        style={{
          width: '300px',
          border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
          borderRadius: '8px',
          padding: '16px',
          backgroundColor: theme === 'light' ? '#ffffff' : '#374151'
        }}
      >
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: theme === 'light' ? '#111827' : '#f9fafb' }}>
          Component Library
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {['WeatherWidget', 'NewsWidget', 'Slideshow', 'Clock', 'WebViewer', 'PVWidget'].map(componentType => (
            <button
              key={componentType}
              onClick={() => onAddComponent(componentType)}
              style={{
                padding: '12px',
                border: `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}`,
                borderRadius: '4px',
                backgroundColor: theme === 'light' ? '#ffffff' : '#4b5563',
                color: theme === 'light' ? '#111827' : '#f9fafb',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'light' ? '#f3f4f6' : '#6b7280'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'light' ? '#ffffff' : '#4b5563'
              }}
            >
              {componentType}
            </button>
          ))}
        </div>
      </div>

      {/* Design Canvas */}
      <div
        className="design-canvas"
        style={{
          flex: 1,
          border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
          borderRadius: '8px',
          padding: '16px',
          backgroundColor: theme === 'light' ? '#ffffff' : '#374151',
          position: 'relative'
        }}
      >
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: theme === 'light' ? '#111827' : '#f9fafb' }}>
          Design Canvas
        </h3>
        
        {/* Grid */}
        <div
          className="grid-container"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${builderState.gridSize.cols}, 1fr)`,
            gridTemplateRows: `repeat(${builderState.gridSize.rows}, 1fr)`,
            gap: '2px',
            height: '400px',
            backgroundColor: theme === 'light' ? '#f3f4f6' : '#4b5563',
            padding: '8px',
            borderRadius: '4px'
          }}
        >
          {Array.from({ length: builderState.gridSize.cols * builderState.gridSize.rows }).map((_, index) => (
            <div
              key={index}
              style={{
                backgroundColor: theme === 'light' ? '#ffffff' : '#6b7280',
                border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
                borderRadius: '2px'
              }}
            />
          ))}
        </div>

        {/* Components */}
        {template.components.map(component => (
          <div
            key={component.id}
            onClick={() => onSelectComponent(component.id)}
            style={{
              position: 'absolute',
              left: `${(component.position.grid.x - 1) * (100 / builderState.gridSize.cols)}%`,
              top: `${(component.position.grid.y - 1) * (100 / builderState.gridSize.rows)}%`,
              width: `${component.position.grid.width * (100 / builderState.gridSize.cols)}%`,
              height: `${component.position.grid.height * (100 / builderState.gridSize.rows)}%`,
              backgroundColor: builderState.selectedComponent === component.id 
                ? (theme === 'light' ? '#dbeafe' : '#1e40af')
                : (theme === 'light' ? '#f3f4f6' : '#6b7280'),
              border: `2px solid ${builderState.selectedComponent === component.id 
                ? (theme === 'light' ? '#3b82f6' : '#60a5fa')
                : (theme === 'light' ? '#d1d5db' : '#4b5563')}`,
              borderRadius: '4px',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 500,
              color: theme === 'light' ? '#111827' : '#f9fafb'
            }}
          >
            {component.name}
          </div>
        ))}
      </div>

      {/* Properties Panel */}
      {builderState.selectedComponent && (
        <div
          className="properties-panel"
          style={{
            width: '300px',
            border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: theme === 'light' ? '#ffffff' : '#374151'
          }}
        >
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: theme === 'light' ? '#111827' : '#f9fafb' }}>
            Properties
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500, color: theme === 'light' ? '#374151' : '#d1d5db' }}>
                Component Name
              </label>
              <input
                type="text"
                value={template.components.find(c => c.id === builderState.selectedComponent)?.name || ''}
                onChange={(e) => onUpdateComponent(builderState.selectedComponent!, { name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '14px',
                  border: `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}`,
                  borderRadius: '4px',
                  backgroundColor: theme === 'light' ? '#ffffff' : '#4b5563',
                  color: theme === 'light' ? '#111827' : '#f9fafb'
                }}
              />
            </div>
            <button
              onClick={() => onDeleteComponent(builderState.selectedComponent!)}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 500,
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Delete Component
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ComponentsTab({ template, onUpdateComponent, theme }: { template: AdvancedTemplate; onUpdateComponent: (componentId: string, updates: Partial<TemplateComponent>) => void; theme: string }) {
  return (
    <div className="components-tab" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: theme === 'light' ? '#111827' : '#f9fafb' }}>
        Component Configuration
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {template.components.map(component => (
          <div
            key={component.id}
            style={{
              padding: '16px',
              border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
              borderRadius: '8px',
              backgroundColor: theme === 'light' ? '#ffffff' : '#374151'
            }}
          >
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: theme === 'light' ? '#111827' : '#f9fafb' }}>
              {component.name}
            </h4>
            <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
              {component.type}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500, color: theme === 'light' ? '#374151' : '#d1d5db' }}>
                  Description
                </label>
                <input
                  type="text"
                  value={component.description || ''}
                  onChange={(e) => onUpdateComponent(component.id, { description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: '12px',
                    border: `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}`,
                    borderRadius: '4px',
                    backgroundColor: theme === 'light' ? '#ffffff' : '#4b5563',
                    color: theme === 'light' ? '#111827' : '#f9fafb'
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function VariablesTab({
  template,
  onAddVariable,
  onUpdateVariable,
  onDeleteVariable,
  theme
}: {
  template: AdvancedTemplate
  onAddVariable: () => void
  onUpdateVariable: (index: number, updates: Partial<TemplateVariable>) => void
  onDeleteVariable: (index: number) => void
  theme: string
}) {
  return (
    <div className="variables-tab" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: theme === 'light' ? '#111827' : '#f9fafb' }}>
          Template Variables
        </h3>
        <button
          onClick={onAddVariable}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 500,
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Add Variable
        </button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {template.variables.map((variable, index) => (
          <div
            key={index}
            style={{
              padding: '16px',
              border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
              borderRadius: '8px',
              backgroundColor: theme === 'light' ? '#ffffff' : '#374151'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500, color: theme === 'light' ? '#374151' : '#d1d5db' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={variable.name}
                  onChange={(e) => onUpdateVariable(index, { name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '14px',
                    border: `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}`,
                    borderRadius: '4px',
                    backgroundColor: theme === 'light' ? '#ffffff' : '#4b5563',
                    color: theme === 'light' ? '#111827' : '#f9fafb'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500, color: theme === 'light' ? '#374151' : '#d1d5db' }}>
                  Type
                </label>
                <select
                  value={variable.type}
                  onChange={(e) => onUpdateVariable(index, { type: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '14px',
                    border: `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}`,
                    borderRadius: '4px',
                    backgroundColor: theme === 'light' ? '#ffffff' : '#4b5563',
                    color: theme === 'light' ? '#111827' : '#f9fafb'
                  }}
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="select">Select</option>
                  <option value="color">Color</option>
                  <option value="url">URL</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500, color: theme === 'light' ? '#374151' : '#d1d5db' }}>
                  Default Value
                </label>
                <input
                  type="text"
                  value={variable.defaultValue || ''}
                  onChange={(e) => onUpdateVariable(index, { defaultValue: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '14px',
                    border: `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}`,
                    borderRadius: '4px',
                    backgroundColor: theme === 'light' ? '#ffffff' : '#4b5563',
                    color: theme === 'light' ? '#111827' : '#f9fafb'
                  }}
                />
              </div>
              <button
                onClick={() => onDeleteVariable(index)}
                style={{
                  padding: '8px 12px',
                  fontSize: '14px',
                  fontWeight: 500,
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
            <div style={{ marginTop: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500, color: theme === 'light' ? '#374151' : '#d1d5db' }}>
                Description
              </label>
              <input
                type="text"
                value={variable.description || ''}
                onChange={(e) => onUpdateVariable(index, { description: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '14px',
                  border: `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}`,
                  borderRadius: '4px',
                  backgroundColor: theme === 'light' ? '#ffffff' : '#4b5563',
                  color: theme === 'light' ? '#111827' : '#f9fafb'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LogicTab({ template: _template, onTemplateChange: _onTemplateChange, theme }: { template: AdvancedTemplate; onTemplateChange: (updates: Partial<AdvancedTemplate>) => void; theme: string }) {
  return (
    <div className="logic-tab" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: theme === 'light' ? '#111827' : '#f9fafb' }}>
        Template Logic
      </h3>
      <p style={{ margin: 0, fontSize: '14px', color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
        Configure conditional logic, event handlers, and business rules for your template.
      </p>
      {/* Logic configuration forms would go here */}
    </div>
  )
}

function PreviewTab({ template: _template, theme }: { template: AdvancedTemplate; theme: string }) {
  return (
    <div className="preview-tab" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: theme === 'light' ? '#111827' : '#f9fafb' }}>
        Template Preview
      </h3>
      <p style={{ margin: 0, fontSize: '14px', color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
        Preview how your template will look with sample data.
      </p>
      {/* Preview implementation would go here */}
    </div>
  )
}

function SettingsTab({ template, onTemplateChange, theme }: { template: AdvancedTemplate; onTemplateChange: (updates: Partial<AdvancedTemplate>) => void; theme: string }) {
  return (
    <div className="settings-tab" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: theme === 'light' ? '#111827' : '#f9fafb' }}>
        Template Settings
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, color: theme === 'light' ? '#111827' : '#f9fafb' }}>
            Basic Information
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: theme === 'light' ? '#374151' : '#d1d5db' }}>
                Template Name
              </label>
              <input
                type="text"
                value={template.metadata.name}
                onChange={(e) => onTemplateChange({ metadata: { ...template.metadata, name: e.target.value } })}
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
                Description
              </label>
              <textarea
                value={template.metadata.description}
                onChange={(e) => onTemplateChange({ metadata: { ...template.metadata, description: e.target.value } })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}`,
                  borderRadius: '4px',
                  backgroundColor: theme === 'light' ? '#ffffff' : '#374151',
                  color: theme === 'light' ? '#111827' : '#f9fafb',
                  resize: 'vertical'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: theme === 'light' ? '#374151' : '#d1d5db' }}>
                Category
              </label>
              <select
                value={template.metadata.category}
                onChange={(e) => onTemplateChange({ metadata: { ...template.metadata, category: e.target.value as any } })}
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
                <option value="default">Default</option>
                <option value="business">Business</option>
                <option value="education">Education</option>
                <option value="healthcare">Healthcare</option>
                <option value="retail">Retail</option>
                <option value="hospitality">Hospitality</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
        </div>
        
        <div>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, color: theme === 'light' ? '#111827' : '#f9fafb' }}>
            Template Properties
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: theme === 'light' ? '#374151' : '#d1d5db' }}>
                Status
              </label>
              <select
                value={template.metadata.status}
                onChange={(e) => onTemplateChange({ metadata: { ...template.metadata, status: e.target.value as any } })}
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
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
                <option value="deprecated">Deprecated</option>
                <option value="beta">Beta</option>
                <option value="stable">Stable</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: theme === 'light' ? '#374151' : '#d1d5db' }}>
                Visibility
              </label>
              <select
                value={template.metadata.visibility}
                onChange={(e) => onTemplateChange({ metadata: { ...template.metadata, visibility: e.target.value as any } })}
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
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="unlisted">Unlisted</option>
                <option value="organization">Organization</option>
                <option value="team">Team</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: theme === 'light' ? '#374151' : '#d1d5db' }}>
                Tags
              </label>
              <input
                type="text"
                value={template.metadata.tags.join(', ')}
                onChange={(e) => onTemplateChange({ metadata: { ...template.metadata, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) } })}
                placeholder="Enter tags separated by commas"
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
      </div>
    </div>
  )
}
