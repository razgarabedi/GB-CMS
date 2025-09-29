'use client';

import { useState, useEffect } from 'react';
import { DefaultWidgetProps } from './widgets';
import VisualPropertyEditor from './VisualPropertyEditor';

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  component?: string;
  props?: Record<string, any>;
}

interface PropertiesPanelProps {
  selectedWidget: string | null;
  layout: LayoutItem[];
  onLayoutChange: (layout: LayoutItem[]) => void;
}

export default function PropertiesPanel({ 
  selectedWidget, 
  layout, 
  onLayoutChange 
}: PropertiesPanelProps) {
  const [widgetProps, setWidgetProps] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState('properties');

  const selectedWidgetData = layout.find(item => item.i === selectedWidget);

  useEffect(() => {
    if (selectedWidgetData) {
      const defaultProps = DefaultWidgetProps[selectedWidgetData.component as keyof typeof DefaultWidgetProps] || {};
      setWidgetProps({ ...defaultProps, ...(selectedWidgetData.props || {}) });
    }
  }, [selectedWidget, selectedWidgetData]);

  const updateWidgetProperty = (property: string, value: any) => {
    if (!selectedWidget || !selectedWidgetData) return;

    const newProps = { ...widgetProps, [property]: value };
    setWidgetProps(newProps);

    // Update layout with new props
    const updatedLayout = layout.map(item => {
      if (item.i === selectedWidget) {
        return { ...item, props: newProps };
      }
      return item;
    });
    onLayoutChange(updatedLayout);
  };

  const updateWidgetDimensions = (property: 'w' | 'h', value: number) => {
    if (!selectedWidget || !selectedWidgetData) return;

    const updatedLayout = layout.map(item => {
      if (item.i === selectedWidget) {
        return { ...item, [property]: Math.max(1, Math.min(property === 'w' ? 32 : 18, value)) };
      }
      return item;
    });
    onLayoutChange(updatedLayout);
  };

  const renderPropertyForm = () => {
    if (!selectedWidgetData) return null;

    const componentType = selectedWidgetData.component;

    switch (componentType) {
      case 'Weather':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
              <input
                type="text"
                value={widgetProps.location || ''}
                onChange={(e) => updateWidgetProperty('location', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter city name (e.g., New York, London)"
              />
              <p className="text-xs text-slate-400 mt-1">Or use coordinates below for precise location</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={widgetProps.latitude || ''}
                  onChange={(e) => updateWidgetProperty('latitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="40.7128"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={widgetProps.longitude || ''}
                  onChange={(e) => updateWidgetProperty('longitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="-74.0060"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Refresh Interval (minutes)</label>
              <select
                value={widgetProps.refreshInterval ? widgetProps.refreshInterval / 60000 : 5}
                onChange={(e) => updateWidgetProperty('refreshInterval', parseInt(e.target.value) * 60000)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 minute</option>
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showClock"
                  checked={widgetProps.showClock || false}
                  onChange={(e) => updateWidgetProperty('showClock', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="showClock" className="text-sm text-slate-300">Show Clock</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showAnimatedBg"
                  checked={widgetProps.showAnimatedBg || false}
                  onChange={(e) => updateWidgetProperty('showAnimatedBg', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="showAnimatedBg" className="text-sm text-slate-300">Animated Background</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showDetails"
                  checked={widgetProps.showDetails || false}
                  onChange={(e) => updateWidgetProperty('showDetails', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="showDetails" className="text-sm text-slate-300">Show Details (humidity, wind, etc.)</label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Theme</label>
              <select
                value={widgetProps.theme || 'dark'}
                onChange={(e) => updateWidgetProperty('theme', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
          </div>
        );

      case 'Clock':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Timezone</label>
              <input
                type="text"
                value={widgetProps.timezone || ''}
                onChange={(e) => updateWidgetProperty('timezone', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="UTC"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Format</label>
              <select
                value={widgetProps.format || '12-hour'}
                onChange={(e) => updateWidgetProperty('format', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="12-hour">12 Hour</option>
                <option value="24-hour">24 Hour</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
              <select
                value={widgetProps.type || 'digital'}
                onChange={(e) => updateWidgetProperty('type', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="digital">Digital</option>
                <option value="analog">Analog</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Size</label>
              <select
                value={widgetProps.size || 'medium'}
                onChange={(e) => updateWidgetProperty('size', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
              <select
                value={widgetProps.category || 'general'}
                onChange={(e) => updateWidgetProperty('category', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">General</option>
                <option value="technology">Technology</option>
                <option value="business">Business</option>
                <option value="sports">Sports</option>
                <option value="science">Science</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Articles Limit</label>
              <input
                type="number"
                min="1"
                max="20"
                value={widgetProps.limit || 5}
                onChange={(e) => updateWidgetProperty('limit', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'Slideshow':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Images (one per line)</label>
              <textarea
                value={widgetProps.images?.join('\n') || ''}
                onChange={(e) => updateWidgetProperty('images', e.target.value.split('\n').filter(Boolean))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Enter image URLs, one per line"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Interval (ms)</label>
              <input
                type="number"
                min="1000"
                value={widgetProps.intervalMs || 5000}
                onChange={(e) => updateWidgetProperty('intervalMs', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Animation</label>
              <select
                value={widgetProps.animations || 'fade'}
                onChange={(e) => updateWidgetProperty('animations', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="fade">Fade</option>
                <option value="slide">Slide</option>
              </select>
            </div>
          </div>
        );

      case 'Web Viewer':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">URL</label>
              <input
                type="url"
                value={widgetProps.url || ''}
                onChange={(e) => updateWidgetProperty('url', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Refresh Interval (ms)</label>
              <input
                type="number"
                min="5000"
                value={widgetProps.refreshInterval || 60000}
                onChange={(e) => updateWidgetProperty('refreshInterval', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'PV Compact':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
              <input
                type="text"
                value={widgetProps.location || ''}
                onChange={(e) => updateWidgetProperty('location', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Solar Array #1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">API Token</label>
              <input
                type="text"
                value={widgetProps.token || ''}
                onChange={(e) => updateWidgetProperty('token', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter API token"
              />
            </div>
          </div>
        );

      case 'PV Flow':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">API Token</label>
              <input
                type="text"
                value={widgetProps.token || ''}
                onChange={(e) => updateWidgetProperty('token', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter API token"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showAnimation"
                checked={widgetProps.showAnimation || true}
                onChange={(e) => updateWidgetProperty('showAnimation', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="showAnimation" className="text-sm text-slate-300">Show Animations</label>
            </div>
          </div>
        );

      case 'Custom':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
              <input
                type="text"
                value={widgetProps.title || ''}
                onChange={(e) => updateWidgetProperty('title', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Widget title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Content</label>
              <textarea
                value={widgetProps.content || ''}
                onChange={(e) => updateWidgetProperty('content', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Widget content"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Background Color</label>
              <input
                type="color"
                value={widgetProps.backgroundColor || '#1e293b'}
                onChange={(e) => updateWidgetProperty('backgroundColor', e.target.value)}
                className="w-full h-10 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Text Color</label>
              <input
                type="color"
                value={widgetProps.textColor || '#ffffff'}
                onChange={(e) => updateWidgetProperty('textColor', e.target.value)}
                className="w-full h-10 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-slate-400 py-4">
            <div className="text-sm">No properties available for this widget type</div>
          </div>
        );
    }
  };

  const tabs = [
    { id: 'properties', name: 'Properties', icon: '⚙️' },
    { id: 'visual', name: 'Visual Editor', icon: '🎨' }
  ];

  return (
    <div className="h-full bg-slate-800/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Properties</h3>
        
        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-700/50 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-600 text-white'
                  : 'text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {selectedWidget && selectedWidgetData ? (
          activeTab === 'properties' ? (
            <div className="p-4 space-y-6">
              {/* Widget Info */}
              <div className="card">
                <div className="p-4">
                  <h4 className="font-medium text-white mb-3 flex items-center space-x-2">
                    <span>📐</span>
                    <span>{selectedWidgetData.component} Widget</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Width</label>
                      <input
                        type="number"
                        min="1"
                        max="32"
                        value={selectedWidgetData.w}
                        onChange={(e) => updateWidgetDimensions('w', parseInt(e.target.value))}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Height</label>
                      <input
                        type="number"
                        min="1"
                        max="18"
                        value={selectedWidgetData.h}
                        onChange={(e) => updateWidgetDimensions('h', parseInt(e.target.value))}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Widget-specific Properties */}
              <div className="card">
                <div className="p-4">
                  <h4 className="font-medium text-white mb-3 flex items-center space-x-2">
                    <span>⚙️</span>
                    <span>Widget Settings</span>
                  </h4>
                  {renderPropertyForm()}
                </div>
              </div>
            </div>
          ) : (
            <VisualPropertyEditor
              selectedWidget={selectedWidget}
              widgetProps={widgetProps}
              onPropertyChange={updateWidgetProperty}
              onStyleChange={(styles) => {
                Object.entries(styles).forEach(([key, value]) => {
                  updateWidgetProperty(key, value);
                });
              }}
            />
          )
        ) : (
          <div className="p-4 flex items-center justify-center h-full">
            <div className="text-center text-slate-400">
              <div className="text-4xl mb-4">⚙️</div>
              <div className="text-lg font-medium mb-2">No Widget Selected</div>
              <div className="text-sm">Click on a widget to edit its properties</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}