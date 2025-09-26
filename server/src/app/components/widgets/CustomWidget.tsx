'use client';

import { useState } from 'react';

interface CustomWidgetProps {
  title?: string;
  content?: string;
  backgroundColor?: string;
  textColor?: string;
  showBorder?: boolean;
}

export default function CustomWidget({
  title = 'Custom Widget',
  content = 'This is a customizable widget. Configure its properties to match your needs.',
  backgroundColor = '#1e293b',
  textColor = '#ffffff',
  showBorder = true
}: CustomWidgetProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div 
      className={`custom-widget h-full w-full rounded-lg overflow-hidden relative group ${showBorder ? 'border border-slate-600' : ''}`}
      style={{ backgroundColor }}
    >
      <div className="h-full flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-sm" style={{ color: textColor }}>
            {title}
          </h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 bg-black/20 hover:bg-black/40 rounded flex items-center justify-center text-xs"
            style={{ color: textColor }}
            title="Edit widget"
          >
            ⚙️
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center">
          {isEditing ? (
            <div className="text-center space-y-2">
              <div className="text-2xl">🔧</div>
              <div className="text-sm" style={{ color: textColor }}>
                Edit Mode
              </div>
              <div className="text-xs opacity-75" style={{ color: textColor }}>
                Configure properties in the Properties Panel
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-sm leading-relaxed" style={{ color: textColor }}>
                {content}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 text-center">
          <div className="text-xs opacity-50" style={{ color: textColor }}>
            Custom Widget
          </div>
        </div>
      </div>

      {/* Configuration hint */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="text-xs bg-black/50 px-2 py-1 rounded" style={{ color: textColor }}>
          Click ⚙️ to configure
        </div>
      </div>
    </div>
  );
}
