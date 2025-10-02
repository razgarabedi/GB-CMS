'use client';

import React, { useState } from 'react';
import { StaticWidgetSize, STATIC_WIDGET_DIMENSIONS } from '../types/staticWidgets';
import { getStaticWidgetConfig, getAvailableSizes } from './widgets/staticWidgetRegistry';

interface StaticWidgetSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgetId: string;
  widgetName: string;
  onSizeSelect: (size: StaticWidgetSize) => void;
}

const sizeLabels: Record<StaticWidgetSize, string> = {
  compact: 'Compact (4×4)',
  medium: 'Medium (6×4)', 
  large: 'Large (8×7)',
  xlarge: 'X-Large (9×7)'
};

const sizeDescriptions: Record<StaticWidgetSize, string> = {
  compact: 'Minimal display with essential weather info',
  medium: 'Standard display with 3-day forecast and dynamic backgrounds',
  large: 'Comprehensive display with full weather details',
  xlarge: 'Complete display with all weather information'
};

// Preview component for Static Weather Widget
const WeatherWidgetPreview: React.FC<{ size: StaticWidgetSize; isSelected: boolean }> = ({ size, isSelected }) => {
  const dimensions = STATIC_WIDGET_DIMENSIONS[size];
  
  const getPreviewContent = () => {
    switch (size) {
      case 'compact':
        return (
          <div className="p-2 h-full flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1">
                <span className="text-xs">🌤️</span>
                <div>
                  <div className="text-xs font-medium text-white">New York</div>
                  <div className="text-xs text-slate-300">Sunny</div>
                </div>
              </div>
              <div className="text-xs text-white">12:34</div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-light text-white">25°</div>
                <div className="text-xs text-slate-300">💧 60% | 💨 15 km/h</div>
              </div>
            </div>
          </div>
        );
      case 'medium':
        return (
          <div className="p-3 h-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm">🌤️</span>
                <div>
                  <div className="text-sm font-medium text-white">New York</div>
                  <div className="text-xs text-slate-300">Sunny</div>
                </div>
              </div>
              <div className="text-sm text-white">12:34</div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-light text-white mb-1">25°</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div>💧 60%</div>
                  <div>💨 15 km/h</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'large':
        return (
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-lg">🌤️</span>
                <div>
                  <div className="text-base font-medium text-white">New York</div>
                  <div className="text-sm text-slate-300">Sunny</div>
                </div>
              </div>
              <div className="text-base text-white">12:34</div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center w-full">
                <div className="text-3xl font-light text-white mb-2">25°</div>
                <div className="grid grid-cols-3 gap-3 text-sm text-slate-300">
                  <div className="bg-slate-700/30 rounded p-2">
                    <div className="text-lg">💧</div>
                    <div className="font-semibold">60%</div>
                    <div className="text-xs">Humidity</div>
                  </div>
                  <div className="bg-slate-700/30 rounded p-2">
                    <div className="text-lg">💨</div>
                    <div className="font-semibold">15 km/h</div>
                    <div className="text-xs">Wind</div>
                  </div>
                  <div className="bg-slate-700/30 rounded p-2">
                    <div className="text-lg">📊</div>
                    <div className="font-semibold">1013 hPa</div>
                    <div className="text-xs">Pressure</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'xlarge':
        return (
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <span className="text-xl">🌤️</span>
                <div>
                  <div className="text-lg font-medium text-white">New York</div>
                  <div className="text-base text-slate-300">Sunny</div>
                </div>
              </div>
              <div className="text-lg text-white">12:34</div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center w-full">
                <div className="text-4xl font-light text-white mb-3">25°</div>
                <div className="grid grid-cols-4 gap-4 text-base text-slate-300">
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <div className="text-xl mb-1">💧</div>
                    <div className="font-bold text-lg">60%</div>
                    <div className="text-sm">Humidity</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <div className="text-xl mb-1">💨</div>
                    <div className="font-bold text-lg">15 km/h</div>
                    <div className="text-sm">Wind Speed</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <div className="text-xl mb-1">📊</div>
                    <div className="font-bold text-lg">1013 hPa</div>
                    <div className="text-sm">Pressure</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <div className="text-xl mb-1">☀️</div>
                    <div className="font-bold text-lg">5</div>
                    <div className="text-sm">UV Index</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`
      relative bg-slate-800 rounded-lg overflow-hidden border-2 transition-all duration-200
      ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-600 hover:border-slate-500'}
    `}>
      <div className="absolute top-1 right-1 text-xs text-slate-400">
        {dimensions.w}×{dimensions.h}
      </div>
      {getPreviewContent()}
    </div>
  );
};

export default function StaticWidgetSizeModal({
  isOpen,
  onClose,
  widgetId,
  widgetName,
  onSizeSelect
}: StaticWidgetSizeModalProps) {
  const [selectedSize, setSelectedSize] = useState<StaticWidgetSize>('compact');
  
  const widgetConfig = getStaticWidgetConfig(widgetId);
  const availableSizes = widgetConfig ? getAvailableSizes(widgetId) : [];

  if (!isOpen || !widgetConfig) return null;

  const handleSizeSelect = () => {
    onSizeSelect(selectedSize);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Choose Widget Size</h2>
            <p className="text-sm text-slate-400 mt-1">
              Select the size and layout for your {widgetName} widget
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableSizes.map((size) => {
              const dimensions = STATIC_WIDGET_DIMENSIONS[size];
              const isSelected = selectedSize === size;
              
              return (
                <div
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`
                    cursor-pointer transition-all duration-200
                    ${isSelected ? 'scale-105' : 'hover:scale-102'}
                  `}
                >
                  {/* Size Info */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-white">
                        {sizeLabels[size]}
                      </h3>
                      <div className="text-sm text-slate-400">
                        {dimensions.w} × {dimensions.h} grid
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 mt-1">
                      {sizeDescriptions[size]}
                    </p>
                  </div>

                  {/* Preview */}
                  <div className="relative">
                    <div 
                      className="w-full"
                      style={{ 
                        aspectRatio: `${dimensions.w}/${dimensions.h}`,
                        maxHeight: '200px'
                      }}
                    >
                      <WeatherWidgetPreview size={size} isSelected={isSelected} />
                    </div>
                    
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                        Selected
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSizeSelect}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Add {sizeLabels[selectedSize]} Widget
          </button>
        </div>
      </div>
    </div>
  );
}
