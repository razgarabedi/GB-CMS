import React, { useState } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './CanvasEditor.css';

const CanvasEditor: React.FC = () => {
  const [screens, setScreens] = useState(['Screen 1', 'Screen 2']);
  const [selectedScreen, setSelectedScreen] = useState(screens[0]);
  const [layout, setLayout] = useState([
    { i: 'a', x: 0, y: 0, w: 2, h: 2, component: 'Weather' },
    { i: 'b', x: 2, y: 0, w: 2, h: 2, component: 'Clock' },
    { i: 'c', x: 4, y: 0, w: 2, h: 2, component: 'News' }
  ]);
  const [widgets, setWidgets] = useState(['a', 'b', 'c']);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [widgetProperties, setWidgetProperties] = useState<any>({});
  const [templates, setTemplates] = useState<any[]>([]);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const onLayoutChange = (newLayout: any) => {
    setLayout(newLayout);
    console.log('Layout changed:', newLayout);
  };

  const handleWidgetClick = (componentName: string) => {
    const newWidget = {
      i: `widget-${Date.now()}`,
      x: 0,
      y: 0,
      w: 2,
      h: 2,
      component: componentName
    };
    
    setLayout([...layout, newWidget]);
    setWidgets([...widgets, newWidget.i]);
    console.log(`Added ${componentName} to canvas`);
  };

  const handleDragStart = (e: React.DragEvent, componentName: string) => {
    e.dataTransfer.setData('text/plain', componentName);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const componentName = e.dataTransfer.getData('text/plain');
    
    if (componentName) {
      const newWidget = {
        i: `widget-${Date.now()}`,
        x: 0,
        y: 0,
        w: 2,
        h: 2,
        component: componentName
      };
      
      setLayout([...layout, newWidget]);
      setWidgets([...widgets, newWidget.i]);
      console.log(`Dropped ${componentName} to canvas`);
    }
  };

  const handleScreenChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedScreen(event.target.value);
  };

  const handleAddScreen = () => {
    const newScreen = `Screen ${screens.length + 1}`;
    setScreens([...screens, newScreen]);
    setSelectedScreen(newScreen);
  };

  const handleWidgetSelect = (widgetId: string) => {
    setSelectedWidget(widgetId);
    const widget = layout.find(item => item.i === widgetId);
    if (widget) {
      // Initialize default properties based on component type
      const defaultProps = getDefaultProperties(widget.component);
      setWidgetProperties({ ...defaultProps, ...widgetProperties[widgetId] });
    }
  };

  const getDefaultProperties = (componentType: string) => {
    const defaults: any = {
      Weather: {
        location: 'New York',
        showClock: true,
        showAnimatedBg: false,
        theme: 'light'
      },
      Clock: {
        timezone: 'UTC',
        type: '12-hour',
        size: 'medium'
      },
      Slideshow: {
        images: ['image1.jpg', 'image2.jpg'],
        intervalMs: 3000,
        animations: 'fade'
      },
      News: {
        category: 'general',
        limit: 5,
        theme: 'light'
      },
      'Web Viewer': {
        url: 'https://example.com',
        refreshInterval: 60000
      },
      'Custom Plugins': {
        pluginName: 'Custom Widget',
        config: '{}'
      }
    };
    return defaults[componentType] || {};
  };

  const updateWidgetProperty = (property: string, value: any) => {
    if (selectedWidget) {
      setWidgetProperties({
        ...widgetProperties,
        [selectedWidget]: {
          ...widgetProperties[selectedWidget],
          [property]: value
        }
      });
    }
  };

  const saveTemplate = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    const template = {
      id: Date.now().toString(),
      name: templateName,
      layout: layout,
      widgetProperties: widgetProperties,
      createdAt: new Date().toISOString()
    };

    const updatedTemplates = [...templates, template];
    setTemplates(updatedTemplates);
    localStorage.setItem('signage-templates', JSON.stringify(updatedTemplates));
    
    setTemplateName('');
    setShowTemplateManager(false);
    alert(`Template "${templateName}" saved successfully!`);
  };

  const loadTemplate = (template: any) => {
    setLayout(template.layout);
    setWidgetProperties(template.widgetProperties);
    setSelectedWidget(null);
    setShowTemplateManager(false);
    console.log(`Loaded template: ${template.name}`);
  };

  const deleteTemplate = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      const updatedTemplates = templates.filter(t => t.id !== templateId);
      setTemplates(updatedTemplates);
      localStorage.setItem('signage-templates', JSON.stringify(updatedTemplates));
    }
  };

  const loadTemplatesFromStorage = () => {
    const savedTemplates = localStorage.getItem('signage-templates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  };

  const exportTemplate = (template: any) => {
    const exportData = {
      ...template,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_template.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportAllTemplates = () => {
    if (templates.length === 0) {
      alert('No templates to export');
      return;
    }

    const exportData = {
      templates: templates,
      exportedAt: new Date().toISOString(),
      version: '1.0',
      totalTemplates: templates.length
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `signage_templates_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        
        // Check if it's a single template or multiple templates
        if (importData.templates) {
          // Multiple templates
          const newTemplates = importData.templates.map((template: any) => ({
            ...template,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: `${template.name} (Imported)`,
            importedAt: new Date().toISOString()
          }));
          
          const updatedTemplates = [...templates, ...newTemplates];
          setTemplates(updatedTemplates);
          localStorage.setItem('signage-templates', JSON.stringify(updatedTemplates));
          alert(`Successfully imported ${newTemplates.length} templates!`);
        } else {
          // Single template
          const newTemplate = {
            ...importData,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: `${importData.name} (Imported)`,
            importedAt: new Date().toISOString()
          };
          
          const updatedTemplates = [...templates, newTemplate];
          setTemplates(updatedTemplates);
          localStorage.setItem('signage-templates', JSON.stringify(updatedTemplates));
          alert(`Successfully imported template "${newTemplate.name}"!`);
        }
      } catch (error) {
        alert('Error importing template. Please check the file format.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  // Load templates on component mount
  React.useEffect(() => {
    loadTemplatesFromStorage();
  }, []);

  const renderPropertyForm = () => {
    if (!selectedWidget) return null;

    const widget = layout.find(item => item.i === selectedWidget);
    if (!widget) return null;

    const currentProps = widgetProperties[selectedWidget] || getDefaultProperties(widget.component);

    switch (widget.component) {
      case 'Weather':
        return (
          <div className="property-fields">
            <div className="field">
              <label>Location:</label>
              <input
                type="text"
                value={currentProps.location || ''}
                onChange={(e) => updateWidgetProperty('location', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Show Clock:</label>
              <input
                type="checkbox"
                checked={currentProps.showClock || false}
                onChange={(e) => updateWidgetProperty('showClock', e.target.checked)}
              />
            </div>
            <div className="field">
              <label>Animated Background:</label>
              <input
                type="checkbox"
                checked={currentProps.showAnimatedBg || false}
                onChange={(e) => updateWidgetProperty('showAnimatedBg', e.target.checked)}
              />
            </div>
            <div className="field">
              <label>Theme:</label>
              <select
                value={currentProps.theme || 'light'}
                onChange={(e) => updateWidgetProperty('theme', e.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        );

      case 'Clock':
        return (
          <div className="property-fields">
            <div className="field">
              <label>Timezone:</label>
              <input
                type="text"
                value={currentProps.timezone || ''}
                onChange={(e) => updateWidgetProperty('timezone', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Type:</label>
              <select
                value={currentProps.type || '12-hour'}
                onChange={(e) => updateWidgetProperty('type', e.target.value)}
              >
                <option value="12-hour">12 Hour</option>
                <option value="24-hour">24 Hour</option>
              </select>
            </div>
            <div className="field">
              <label>Size:</label>
              <select
                value={currentProps.size || 'medium'}
                onChange={(e) => updateWidgetProperty('size', e.target.value)}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        );

      case 'News':
        return (
          <div className="property-fields">
            <div className="field">
              <label>Category:</label>
              <select
                value={currentProps.category || 'general'}
                onChange={(e) => updateWidgetProperty('category', e.target.value)}
              >
                <option value="general">General</option>
                <option value="technology">Technology</option>
                <option value="sports">Sports</option>
                <option value="business">Business</option>
              </select>
            </div>
            <div className="field">
              <label>Limit:</label>
              <input
                type="number"
                min="1"
                max="20"
                value={currentProps.limit || 5}
                onChange={(e) => updateWidgetProperty('limit', parseInt(e.target.value))}
              />
            </div>
            <div className="field">
              <label>Theme:</label>
              <select
                value={currentProps.theme || 'light'}
                onChange={(e) => updateWidgetProperty('theme', e.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        );

      case 'Slideshow':
        return (
          <div className="property-fields">
            <div className="field">
              <label>Images (comma separated):</label>
              <textarea
                value={currentProps.images?.join(', ') || ''}
                onChange={(e) => updateWidgetProperty('images', e.target.value.split(', '))}
                rows={3}
              />
            </div>
            <div className="field">
              <label>Interval (ms):</label>
              <input
                type="number"
                min="1000"
                value={currentProps.intervalMs || 3000}
                onChange={(e) => updateWidgetProperty('intervalMs', parseInt(e.target.value))}
              />
            </div>
            <div className="field">
              <label>Animation:</label>
              <select
                value={currentProps.animations || 'fade'}
                onChange={(e) => updateWidgetProperty('animations', e.target.value)}
              >
                <option value="fade">Fade</option>
                <option value="slide">Slide</option>
              </select>
            </div>
          </div>
        );

      case 'Web Viewer':
        return (
          <div className="property-fields">
            <div className="field">
              <label>URL:</label>
              <input
                type="url"
                value={currentProps.url || ''}
                onChange={(e) => updateWidgetProperty('url', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Refresh Interval (ms):</label>
              <input
                type="number"
                min="5000"
                value={currentProps.refreshInterval || 60000}
                onChange={(e) => updateWidgetProperty('refreshInterval', parseInt(e.target.value))}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="property-fields">
            <div className="field">
              <label>No properties available for this widget type.</label>
            </div>
          </div>
        );
    }
  };

  const renderWidget = (item: any) => {
    const isSelected = selectedWidget === item.i;
    return (
      <div 
        key={item.i} 
        className={`grid-item ${isSelected ? 'selected' : ''}`}
        onClick={() => handleWidgetSelect(item.i)}
      >
        {item.component || item.i.toUpperCase()}
      </div>
    );
  };

  return (
    <div className="canvas-editor">
      <header className="header">
        <div className="logo">Logo</div>
        <div className="screen-selector">
          <select value={selectedScreen} onChange={handleScreenChange}>
            {screens.map((screen) => (
              <option key={screen} value={screen}>{screen}</option>
            ))}
          </select>
          <button onClick={handleAddScreen}>Add Screen</button>
        </div>
        <div className="controls">
          <button onClick={() => setShowTemplateManager(true)}>Templates</button>
          <button>Save</button>
          <button>Refresh</button>
        </div>
      </header>
      <main className="main-content">
        <aside className="component-library">
          <h3>Component Library</h3>
          <ul>
            {['Weather', 'Clock', 'Slideshow', 'News', 'Web Viewer', 'Custom Plugins'].map((component, index) => (
              <li 
                key={component}
                className="draggable-tile"
                draggable={true}
                onDragStart={(e) => handleDragStart(e, component)}
                onClick={() => handleWidgetClick(component)}
                title={`Drag to canvas or click to add ${component}`}
              >
                - {component}
              </li>
            ))}
          </ul>
        </aside>
        <section className="layout-canvas">
          <div 
            className="grid-area"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <GridLayout 
              className="layout" 
              layout={layout} 
              cols={12} 
              rowHeight={30} 
              width={800}
              onLayoutChange={onLayoutChange}
              isDraggable={true}
              isResizable={true}
            >
              {layout.map(renderWidget)}
            </GridLayout>
          </div>
        </section>
        <aside className="properties-panel">
          <h3>Properties Panel</h3>
          {selectedWidget ? (
            <div className="property-form">
              <h4>{layout.find(item => item.i === selectedWidget)?.component || 'Widget'} Properties</h4>
              {renderPropertyForm()}
            </div>
          ) : (
            <div className="no-selection">
              <p>Select a widget on the canvas to edit its properties</p>
            </div>
          )}
        </aside>
      </main>
      <footer className="footer">
        <div onClick={() => setShowTemplateManager(true)}>Template Management</div>
        <div>Plugin Store</div>
        <div>Help</div>
      </footer>

      {showTemplateManager && (
        <div className="template-manager-overlay">
          <div className="template-manager">
            <div className="template-manager-header">
              <h3>Template Manager</h3>
              <button 
                className="close-btn"
                onClick={() => setShowTemplateManager(false)}
              >
                ×
              </button>
            </div>
            
            <div className="template-manager-content">
              <div className="save-template-section">
                <h4>Save Current Layout as Template</h4>
                <div className="save-template-form">
                  <input
                    type="text"
                    placeholder="Enter template name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && saveTemplate()}
                  />
                  <button onClick={saveTemplate}>Save Template</button>
                </div>
              </div>

              <div className="import-export-section">
                <h4>Import/Export Templates</h4>
                <div className="import-export-controls">
                  <div className="import-controls">
                    <input
                      type="file"
                      accept=".json"
                      onChange={importTemplate}
                      style={{ display: 'none' }}
                      id="template-import"
                    />
                    <label htmlFor="template-import" className="import-btn">
                      📁 Import Templates
                    </label>
                  </div>
                  <div className="export-controls">
                    <button 
                      onClick={exportAllTemplates}
                      className="export-all-btn"
                      disabled={templates.length === 0}
                    >
                      📤 Export All Templates
                    </button>
                  </div>
                </div>
              </div>

              <div className="load-template-section">
                <h4>Load Existing Templates</h4>
                {templates.length === 0 ? (
                  <p className="no-templates">No templates saved yet</p>
                ) : (
                  <div className="template-list">
                    {templates.map((template) => (
                      <div key={template.id} className="template-item">
                        <div className="template-info">
                          <h5>{template.name}</h5>
                          <p>Created: {new Date(template.createdAt).toLocaleDateString()}</p>
                          <p>Widgets: {template.layout.length}</p>
                        </div>
                        <div className="template-actions">
                          <button 
                            className="load-btn"
                            onClick={() => loadTemplate(template)}
                          >
                            Load
                          </button>
                          <button 
                            className="export-btn"
                            onClick={() => exportTemplate(template)}
                            title="Export this template"
                          >
                            📤 Export
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => deleteTemplate(template.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasEditor;
