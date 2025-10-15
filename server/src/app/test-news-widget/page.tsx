'use client';

import { useState } from 'react';
import NewsWidget from '../components/widgets/NewsWidget';

export default function TestNewsWidgetPage() {
  const [widgetSize, setWidgetSize] = useState({ width: 400, height: 300 });

  const sizePresets = [
    { name: 'Small', width: 300, height: 200 },
    { name: 'Medium', width: 600, height: 400 },
    { name: 'Large', width: 800, height: 600 },
    { name: 'Extra Large', width: 1000, height: 800 }
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">News Widget Test - Tagesschau Background Images</h1>
        
        {/* Size Controls */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Widget Size Controls</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {sizePresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setWidgetSize({ width: preset.width, height: preset.height })}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  widgetSize.width === preset.width && widgetSize.height === preset.height
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {preset.name}
                <div className="text-xs text-gray-400">
                  {preset.width} × {preset.height}
                </div>
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Width</label>
              <input
                type="number"
                value={widgetSize.width}
                onChange={(e) => setWidgetSize(prev => ({ ...prev, width: parseInt(e.target.value) || 400 }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Height</label>
              <input
                type="number"
                value={widgetSize.height}
                onChange={(e) => setWidgetSize(prev => ({ ...prev, height: parseInt(e.target.value) || 300 }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Current Widget */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Current Widget ({widgetSize.width} × {widgetSize.height})</h2>
          <div className="flex justify-center">
            <div 
              className="border-2 border-dashed border-gray-600 rounded-lg p-4"
              style={{ width: widgetSize.width + 40, height: widgetSize.height + 40 }}
            >
              <NewsWidget
                category="general"
                limit={5}
                theme="dark"
                newsSource="tagesschau"
                showHeader={true}
                cyclingInterval={5}
                width={widgetSize.width}
                height={widgetSize.height}
              />
            </div>
          </div>
        </div>

        {/* Multiple Widgets for Comparison */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Multiple Widgets - Different Sizes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sizePresets.map((preset) => (
              <div key={preset.name} className="text-center">
                <h3 className="text-white font-medium mb-2">{preset.name} Widget</h3>
                <div 
                  className="border-2 border-dashed border-gray-600 rounded-lg p-2 mx-auto"
                  style={{ width: preset.width + 20, height: preset.height + 20 }}
                >
                  <NewsWidget
                    category="general"
                    limit={3}
                    theme="dark"
                    newsSource="tagesschau"
                    showHeader={true}
                    cyclingInterval={8}
                    width={preset.width}
                    height={preset.height}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Debug Information */}
        <div className="bg-gray-800 rounded-lg p-6 mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Debug Information</h2>
          <div className="text-gray-300 text-sm space-y-2">
            <p>• Check browser console for detailed image extraction logs</p>
            <p>• Widget area: {widgetSize.width * widgetSize.height} pixels</p>
            <p>• Optimal image size: {widgetSize.width * widgetSize.height >= 800000 ? '16x9-1920' : 
                                      widgetSize.width * widgetSize.height >= 400000 ? '16x9-1280' :
                                      widgetSize.width * widgetSize.height >= 200000 ? '16x9-840' :
                                      widgetSize.width * widgetSize.height >= 100000 ? '16x9-640' : '16x9-480'}</p>
            <p>• If no background images appear, check network tab for failed image requests</p>
          </div>
        </div>
      </div>
    </div>
  );
}
