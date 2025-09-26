'use client';

import { useState, useEffect } from 'react';
import './VisualPropertyEditor.css';

interface VisualPropertyEditorProps {
  selectedWidget: string | null;
  widgetProps: Record<string, any>;
  onPropertyChange: (property: string, value: any) => void;
  onStyleChange: (style: Record<string, any>) => void;
}

interface ColorPalette {
  name: string;
  colors: string[];
}

const colorPalettes: ColorPalette[] = [
  {
    name: 'Default',
    colors: ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8']
  },
  {
    name: 'Blue',
    colors: ['#1e3a8a', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa']
  },
  {
    name: 'Green',
    colors: ['#14532d', '#166534', '#16a34a', '#22c55e', '#4ade80']
  },
  {
    name: 'Purple',
    colors: ['#581c87', '#7c3aed', '#8b5cf6', '#a855f7', '#c084fc']
  },
  {
    name: 'Red',
    colors: ['#7f1d1d', '#dc2626', '#ef4444', '#f87171', '#fca5a5']
  },
  {
    name: 'Orange',
    colors: ['#9a3412', '#ea580c', '#f97316', '#fb923c', '#fdba74']
  },
  {
    name: 'Gray',
    colors: ['#111827', '#374151', '#6b7280', '#9ca3af', '#d1d5db']
  },
  {
    name: 'Pink',
    colors: ['#831843', '#be185d', '#ec4899', '#f472b6', '#f9a8d4']
  }
];

const fontFamilies = [
  { name: 'System Default', value: 'system-ui, -apple-system, sans-serif' },
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Open Sans', value: 'Open Sans, sans-serif' },
  { name: 'Lato', value: 'Lato, sans-serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Poppins', value: 'Poppins, sans-serif' },
  { name: 'Source Sans Pro', value: 'Source Sans Pro, sans-serif' },
  { name: 'Nunito', value: 'Nunito, sans-serif' },
  { name: 'Playfair Display', value: 'Playfair Display, serif' },
  { name: 'Merriweather', value: 'Merriweather, serif' },
  { name: 'Lora', value: 'Lora, serif' },
  { name: 'Fira Code', value: 'Fira Code, monospace' },
  { name: 'JetBrains Mono', value: 'JetBrains Mono, monospace' },
  { name: 'Courier New', value: 'Courier New, monospace' }
];

const fontSizes = [
  { name: 'XS', value: '0.75rem', px: '12px' },
  { name: 'SM', value: '0.875rem', px: '14px' },
  { name: 'Base', value: '1rem', px: '16px' },
  { name: 'LG', value: '1.125rem', px: '18px' },
  { name: 'XL', value: '1.25rem', px: '20px' },
  { name: '2XL', value: '1.5rem', px: '24px' },
  { name: '3XL', value: '1.875rem', px: '30px' },
  { name: '4XL', value: '2.25rem', px: '36px' },
  { name: '5XL', value: '3rem', px: '48px' },
  { name: '6XL', value: '3.75rem', px: '60px' }
];

const spacingValues = [
  { name: '0', value: '0' },
  { name: '1', value: '0.25rem' },
  { name: '2', value: '0.5rem' },
  { name: '3', value: '0.75rem' },
  { name: '4', value: '1rem' },
  { name: '5', value: '1.25rem' },
  { name: '6', value: '1.5rem' },
  { name: '8', value: '2rem' },
  { name: '10', value: '2.5rem' },
  { name: '12', value: '3rem' },
  { name: '16', value: '4rem' },
  { name: '20', value: '5rem' },
  { name: '24', value: '6rem' }
];

const borderRadiusValues = [
  { name: 'None', value: '0' },
  { name: 'SM', value: '0.125rem' },
  { name: 'Base', value: '0.25rem' },
  { name: 'MD', value: '0.375rem' },
  { name: 'LG', value: '0.5rem' },
  { name: 'XL', value: '0.75rem' },
  { name: '2XL', value: '1rem' },
  { name: '3XL', value: '1.5rem' },
  { name: 'Full', value: '9999px' }
];

export default function VisualPropertyEditor({ 
  selectedWidget, 
  widgetProps, 
  onPropertyChange, 
  onStyleChange 
}: VisualPropertyEditorProps) {
  const [activeTab, setActiveTab] = useState('colors');
  const [customColors, setCustomColors] = useState<Record<string, string>>({});
  const [previewMode, setPreviewMode] = useState(true);

  const tabs = [
    { id: 'colors', name: 'Colors', icon: '🎨' },
    { id: 'typography', name: 'Typography', icon: '📝' },
    { id: 'spacing', name: 'Spacing', icon: '📏' },
    { id: 'borders', name: 'Borders', icon: '🔲' },
    { id: 'effects', name: 'Effects', icon: '✨' }
  ];

  const currentStyles = {
    backgroundColor: widgetProps.backgroundColor || '#1e293b',
    textColor: widgetProps.textColor || '#ffffff',
    accentColor: widgetProps.accentColor || '#3b82f6',
    fontFamily: widgetProps.fontFamily || 'system-ui, -apple-system, sans-serif',
    fontSize: widgetProps.fontSize || '1rem',
    fontWeight: widgetProps.fontWeight || '400',
    lineHeight: widgetProps.lineHeight || '1.5',
    padding: widgetProps.padding || '1rem',
    margin: widgetProps.margin || '0',
    borderRadius: widgetProps.borderRadius || '0.5rem',
    borderWidth: widgetProps.borderWidth || '0',
    borderColor: widgetProps.borderColor || '#374151',
    boxShadow: widgetProps.boxShadow || 'none',
    opacity: widgetProps.opacity || '1',
    transform: widgetProps.transform || 'none'
  };

  const handleColorChange = (colorType: string, color: string) => {
    onPropertyChange(colorType, color);
    onStyleChange({ [colorType]: color });
  };

  const handleStyleChange = (property: string, value: string) => {
    onPropertyChange(property, value);
    onStyleChange({ [property]: value });
  };

  const renderColorTab = () => (
    <div className="space-y-6">
      {/* Background Color */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Background Color</label>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={currentStyles.backgroundColor}
              onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
              className="w-12 h-12 rounded-lg border-2 border-slate-600 cursor-pointer"
            />
            <input
              type="text"
              value={currentStyles.backgroundColor}
              onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm font-mono"
              placeholder="#000000"
            />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {colorPalettes.map((palette) => (
              <div key={palette.name} className="space-y-1">
                <div className="text-xs text-slate-400 text-center">{palette.name}</div>
                <div className="flex space-x-1">
                  {palette.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => handleColorChange('backgroundColor', color)}
                      className={`w-6 h-6 rounded border-2 ${
                        currentStyles.backgroundColor === color ? 'border-white' : 'border-slate-600'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Text Color */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Text Color</label>
        <div className="flex items-center space-x-3">
          <input
            type="color"
            value={currentStyles.textColor}
            onChange={(e) => handleColorChange('textColor', e.target.value)}
            className="w-12 h-12 rounded-lg border-2 border-slate-600 cursor-pointer"
          />
          <input
            type="text"
            value={currentStyles.textColor}
            onChange={(e) => handleColorChange('textColor', e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm font-mono"
            placeholder="#ffffff"
          />
        </div>
      </div>

      {/* Accent Color */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Accent Color</label>
        <div className="flex items-center space-x-3">
          <input
            type="color"
            value={currentStyles.accentColor}
            onChange={(e) => handleColorChange('accentColor', e.target.value)}
            className="w-12 h-12 rounded-lg border-2 border-slate-600 cursor-pointer"
          />
          <input
            type="text"
            value={currentStyles.accentColor}
            onChange={(e) => handleColorChange('accentColor', e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm font-mono"
            placeholder="#3b82f6"
          />
        </div>
      </div>
    </div>
  );

  const renderTypographyTab = () => (
    <div className="space-y-6">
      {/* Font Family */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Font Family</label>
        <select
          value={currentStyles.fontFamily}
          onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {fontFamilies.map((font) => (
            <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
              {font.name}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Font Size</label>
        <div className="grid grid-cols-2 gap-3">
          <select
            value={currentStyles.fontSize}
            onChange={(e) => handleStyleChange('fontSize', e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {fontSizes.map((size) => (
              <option key={size.value} value={size.value}>
                {size.name} ({size.px})
              </option>
            ))}
          </select>
          <input
            type="text"
            value={currentStyles.fontSize}
            onChange={(e) => handleStyleChange('fontSize', e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="1rem"
          />
        </div>
      </div>

      {/* Font Weight */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Font Weight</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { name: 'Light', value: '300' },
            { name: 'Normal', value: '400' },
            { name: 'Medium', value: '500' },
            { name: 'Semibold', value: '600' },
            { name: 'Bold', value: '700' },
            { name: 'Extrabold', value: '800' }
          ].map((weight) => (
            <button
              key={weight.value}
              onClick={() => handleStyleChange('fontWeight', weight.value)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentStyles.fontWeight === weight.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              style={{ fontWeight: weight.value }}
            >
              {weight.name}
            </button>
          ))}
        </div>
      </div>

      {/* Line Height */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Line Height</label>
        <div className="grid grid-cols-4 gap-2">
          {['1', '1.25', '1.5', '1.75', '2'].map((height) => (
            <button
              key={height}
              onClick={() => handleStyleChange('lineHeight', height)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentStyles.lineHeight === height
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {height}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSpacingTab = () => (
    <div className="space-y-6">
      {/* Padding */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Padding</label>
        <div className="grid grid-cols-2 gap-3">
          <select
            value={currentStyles.padding}
            onChange={(e) => handleStyleChange('padding', e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {spacingValues.map((spacing) => (
              <option key={spacing.value} value={spacing.value}>
                {spacing.name} ({spacing.value})
              </option>
            ))}
          </select>
          <input
            type="text"
            value={currentStyles.padding}
            onChange={(e) => handleStyleChange('padding', e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="1rem"
          />
        </div>
      </div>

      {/* Margin */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Margin</label>
        <div className="grid grid-cols-2 gap-3">
          <select
            value={currentStyles.margin}
            onChange={(e) => handleStyleChange('margin', e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {spacingValues.map((spacing) => (
              <option key={spacing.value} value={spacing.value}>
                {spacing.name} ({spacing.value})
              </option>
            ))}
          </select>
          <input
            type="text"
            value={currentStyles.margin}
            onChange={(e) => handleStyleChange('margin', e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );

  const renderBordersTab = () => (
    <div className="space-y-6">
      {/* Border Radius */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Border Radius</label>
        <div className="grid grid-cols-3 gap-2">
          {borderRadiusValues.map((radius) => (
            <button
              key={radius.value}
              onClick={() => handleStyleChange('borderRadius', radius.value)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentStyles.borderRadius === radius.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {radius.name}
            </button>
          ))}
        </div>
      </div>

      {/* Border Width */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Border Width</label>
        <div className="grid grid-cols-4 gap-2">
          {['0', '1px', '2px', '4px', '8px'].map((width) => (
            <button
              key={width}
              onClick={() => handleStyleChange('borderWidth', width)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentStyles.borderWidth === width
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {width}
            </button>
          ))}
        </div>
      </div>

      {/* Border Color */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Border Color</label>
        <div className="flex items-center space-x-3">
          <input
            type="color"
            value={currentStyles.borderColor}
            onChange={(e) => handleStyleChange('borderColor', e.target.value)}
            className="w-12 h-12 rounded-lg border-2 border-slate-600 cursor-pointer"
          />
          <input
            type="text"
            value={currentStyles.borderColor}
            onChange={(e) => handleStyleChange('borderColor', e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm font-mono"
            placeholder="#374151"
          />
        </div>
      </div>
    </div>
  );

  const renderEffectsTab = () => (
    <div className="space-y-6">
      {/* Box Shadow */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Box Shadow</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: 'None', value: 'none' },
            { name: 'Small', value: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
            { name: 'Medium', value: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
            { name: 'Large', value: '0 10px 15px -3px rgb(0 0 0 / 0.1)' },
            { name: 'XL', value: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }
          ].map((shadow) => (
            <button
              key={shadow.value}
              onClick={() => handleStyleChange('boxShadow', shadow.value)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentStyles.boxShadow === shadow.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {shadow.name}
            </button>
          ))}
        </div>
      </div>

      {/* Opacity */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Opacity</label>
        <div className="flex items-center space-x-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={currentStyles.opacity}
            onChange={(e) => handleStyleChange('opacity', e.target.value)}
            className="flex-1"
          />
          <span className="text-sm text-slate-300 w-12 text-right">
            {Math.round(parseFloat(currentStyles.opacity) * 100)}%
          </span>
        </div>
      </div>

      {/* Transform */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Transform</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: 'None', value: 'none' },
            { name: 'Scale 0.9', value: 'scale(0.9)' },
            { name: 'Scale 1.1', value: 'scale(1.1)' },
            { name: 'Rotate 5°', value: 'rotate(5deg)' },
            { name: 'Rotate -5°', value: 'rotate(-5deg)' },
            { name: 'Skew 5°', value: 'skew(5deg)' }
          ].map((transform) => (
            <button
              key={transform.value}
              onClick={() => handleStyleChange('transform', transform.value)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentStyles.transform === transform.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {transform.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'colors':
        return renderColorTab();
      case 'typography':
        return renderTypographyTab();
      case 'spacing':
        return renderSpacingTab();
      case 'borders':
        return renderBordersTab();
      case 'effects':
        return renderEffectsTab();
      default:
        return null;
    }
  };

  if (!selectedWidget) {
    return (
      <div className="h-full bg-slate-800/50 p-4 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <div className="text-4xl mb-4">🎨</div>
          <div className="text-lg font-medium mb-2">Visual Editor</div>
          <div className="text-sm">Select a widget to customize its appearance</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-800/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Visual Editor</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                previewMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {previewMode ? '👁️ Preview On' : '👁️ Preview Off'}
            </button>
          </div>
        </div>

        {/* Live Preview */}
        {previewMode && (
          <div className="mb-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
            <div className="text-xs text-slate-400 mb-2">Live Preview:</div>
            <div
              className="p-4 rounded-lg border-2 border-dashed border-slate-600"
              style={{
                backgroundColor: currentStyles.backgroundColor,
                color: currentStyles.textColor,
                fontFamily: currentStyles.fontFamily,
                fontSize: currentStyles.fontSize,
                fontWeight: currentStyles.fontWeight,
                lineHeight: currentStyles.lineHeight,
                padding: currentStyles.padding,
                margin: currentStyles.margin,
                borderRadius: currentStyles.borderRadius,
                borderWidth: currentStyles.borderWidth,
                borderColor: currentStyles.borderColor,
                borderStyle: 'solid',
                boxShadow: currentStyles.boxShadow,
                opacity: currentStyles.opacity,
                transform: currentStyles.transform
              }}
            >
              <div className="font-medium mb-2">Sample Widget</div>
              <div className="text-sm opacity-90">
                This is how your widget will look with the current styling applied.
              </div>
            </div>
          </div>
        )}

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
      <div className="flex-1 overflow-y-auto p-4">
        {renderTabContent()}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-slate-700 bg-slate-800/50">
        <div className="flex space-x-3">
          <button
            onClick={() => {
              // Reset to defaults
              const defaults = {
                backgroundColor: '#1e293b',
                textColor: '#ffffff',
                accentColor: '#3b82f6',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '1rem',
                fontWeight: '400',
                lineHeight: '1.5',
                padding: '1rem',
                margin: '0',
                borderRadius: '0.5rem',
                borderWidth: '0',
                borderColor: '#374151',
                boxShadow: 'none',
                opacity: '1',
                transform: 'none'
              };
              Object.entries(defaults).forEach(([key, value]) => {
                handleStyleChange(key, value);
              });
            }}
            className="px-4 py-2 bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600 transition-colors text-sm font-medium"
          >
            Reset to Defaults
          </button>
          <button
            onClick={() => {
              // Copy styles to clipboard
              const styles = Object.entries(currentStyles)
                .map(([key, value]) => `${key}: ${value};`)
                .join('\n');
              navigator.clipboard.writeText(styles);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Copy CSS
          </button>
        </div>
      </div>
    </div>
  );
}
