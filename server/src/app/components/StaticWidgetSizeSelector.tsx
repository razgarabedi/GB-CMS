'use client';

import React from 'react';
import { StaticWidgetSize, STATIC_WIDGET_DIMENSIONS } from '../types/staticWidgets';

interface StaticWidgetSizeSelectorProps {
  widgetId: string;
  currentSize: StaticWidgetSize;
  availableSizes: StaticWidgetSize[];
  onSizeChange: (size: StaticWidgetSize) => void;
  disabled?: boolean;
}

const sizeLabels: Record<StaticWidgetSize, string> = {
  compact: 'Compact (4×4)',
  medium: 'Medium (7×6)',
  large: 'Large (8×7)',
  xlarge: 'X-Large (9×7)'
};

const sizeDescriptions: Record<StaticWidgetSize, string> = {
  compact: 'Minimal weather display with basic info',
  medium: 'Standard weather display with more details',
  large: 'Detailed weather display with comprehensive data',
  xlarge: 'Full weather display with all available information'
};

export default function StaticWidgetSizeSelector({
  widgetId,
  currentSize,
  availableSizes,
  onSizeChange,
  disabled = false
}: StaticWidgetSizeSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Widget Size
        </label>
        <p className="text-xs text-slate-400 mb-3">
          Select the size and layout for this widget. Size cannot be changed after placement.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {availableSizes.map((size) => {
          const dimensions = STATIC_WIDGET_DIMENSIONS[size];
          const isSelected = currentSize === size;
          const isDisabled = disabled && !isSelected;

          return (
            <button
              key={size}
              onClick={() => !isDisabled && onSizeChange(size)}
              disabled={isDisabled}
              className={`
                relative p-3 rounded-lg border-2 transition-all duration-200 text-left
                ${isSelected 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                }
                ${isDisabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer hover:bg-slate-600/50'
                }
              `}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white">
                  {sizeLabels[size]}
                </span>
                {isSelected && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
              
              <div className="text-xs text-slate-400 mb-2">
                Grid: {dimensions.w}×{dimensions.h}
              </div>
              
              <div className="text-xs text-slate-300">
                {sizeDescriptions[size]}
              </div>

              {/* Visual preview */}
              <div className="mt-2 flex space-x-1">
                {Array.from({ length: Math.min(dimensions.w, 6) }).map((_, i) => (
                  <div
                    key={i}
                    className={`
                      h-2 rounded-sm
                      ${isSelected ? 'bg-blue-400' : 'bg-slate-500'}
                    `}
                    style={{ width: `${Math.max(8, 16 - i * 2)}px` }}
                  />
                ))}
                {dimensions.w > 6 && (
                  <div className="text-xs text-slate-400">+{dimensions.w - 6}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {disabled && (
        <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="text-yellow-400">⚠️</div>
            <div className="text-xs text-yellow-300">
              Widget size cannot be changed after placement. Remove and re-add the widget to change size.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

