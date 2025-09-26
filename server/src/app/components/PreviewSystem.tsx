'use client';

import { useState, useEffect, useRef } from 'react';
import { WidgetRegistry, DefaultWidgetProps } from './widgets';

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  component?: string;
  props?: Record<string, any>;
}

interface PreviewSystemProps {
  layout: LayoutItem[];
  selectedWidget?: string | null;
  onWidgetSelect?: (widgetId: string) => void;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

interface ViewportConfig {
  name: string;
  icon: string;
  width: number;
  height: number;
  scale: number;
}

const viewportConfigs: Record<ViewportSize, ViewportConfig> = {
  desktop: {
    name: 'Desktop',
    icon: '🖥️',
    width: 1920,
    height: 1080,
    scale: 1
  },
  tablet: {
    name: 'Tablet',
    icon: '📱',
    width: 1024,
    height: 768,
    scale: 0.8
  },
  mobile: {
    name: 'Mobile',
    icon: '📱',
    width: 375,
    height: 667,
    scale: 0.6
  }
};

export default function PreviewSystem({
  layout,
  selectedWidget,
  onWidgetSelect
}: PreviewSystemProps) {
  const [viewportSize, setViewportSize] = useState<ViewportSize>('desktop');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const previewRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-refresh every 30 seconds for live data widgets
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setLastUpdate(Date.now());
    }, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Update when layout changes
  useEffect(() => {
    setLastUpdate(Date.now());
  }, [layout]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setLastUpdate(Date.now());
    
    // Simulate refresh animation
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleViewportChange = (size: ViewportSize) => {
    setViewportSize(size);
  };

  const renderPreviewWidget = (item: LayoutItem) => {
    const config = viewportConfigs[viewportSize];
    const isSelected = selectedWidget === item.i;
    
    // Get the widget component and props
    const WidgetComponent = WidgetRegistry[item.component as keyof typeof WidgetRegistry];
    const defaultProps = DefaultWidgetProps[item.component as keyof typeof DefaultWidgetProps] || {};
    
    // Prepare widget props without the key prop (React doesn't allow key in spread)
    const allProps = { 
      ...defaultProps, 
      ...(item.props || {})
    };
    
    // Extract key prop separately to avoid React warning
    const widgetKey = `${item.i}-${lastUpdate}`;
    const { key, ...widgetProps } = allProps as any;

    // Calculate position and size based on viewport
    const gridWidth = config.width;
    const gridHeight = config.height;
    const cellWidth = gridWidth / 12;
    const cellHeight = 60 * config.scale;

    return (
      <div
        key={`${item.i}-${viewportSize}`}
        className={`absolute transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-400' : ''}`}
        style={{
          left: `${(item.x / 12) * 100}%`,
          top: `${item.y * cellHeight}px`,
          width: `${(item.w / 12) * 100}%`,
          height: `${item.h * cellHeight}px`,
          transform: `scale(${config.scale})`,
          transformOrigin: 'top left',
          cursor: onWidgetSelect ? 'pointer' : 'default',
          zIndex: isSelected ? 10 : 1
        }}
        onClick={() => onWidgetSelect?.(item.i)}
      >
        {WidgetComponent ? (
          <div className="w-full h-full overflow-hidden rounded-md">
            <WidgetComponent key={widgetKey} {...widgetProps} />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-slate-700 text-white rounded-md">
            <div className="text-sm font-bold mb-1">{item.component}</div>
            <div className="text-xs opacity-75">Widget not found</div>
          </div>
        )}
      </div>
    );
  };

  const config = viewportConfigs[viewportSize];

  return (
    <div className="h-full flex flex-col">
      {/* Preview Header */}
      <div className="preview-toolbar">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-white">Live Preview</h3>
          <div className="text-sm text-slate-400">
            {layout.length} widget{layout.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Viewport Size Controls */}
          <div className="preview-controls">
            {(Object.keys(viewportConfigs) as ViewportSize[]).map((size) => (
              <button
                key={size}
                onClick={() => handleViewportChange(size)}
                className={`preview-size-button ${viewportSize === size ? 'active' : ''}`}
                title={`Switch to ${viewportConfigs[size].name} view`}
              >
                <span className="mr-1">{viewportConfigs[size].icon}</span>
                <span className="hidden sm:inline">{viewportConfigs[size].name}</span>
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`preview-refresh ${isRefreshing ? 'animate-spin' : ''}`}
            title="Refresh preview"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 p-6 bg-slate-900">
        <div className="preview-container">
          <div 
            ref={previewRef}
            className={`preview-viewport ${viewportSize} relative`}
            style={{
              maxWidth: '100%',
              maxHeight: 'calc(100vh - 200px)'
            }}
          >
            {/* Preview Content Area */}
            <div 
              className="preview-content bg-black relative"
              style={{
                width: `${config.width}px`,
                height: `${config.height}px`,
                transform: `scale(${Math.min(
                  (previewRef.current?.clientWidth || config.width) / config.width,
                  (previewRef.current?.clientHeight || config.height) / config.height
                ) * 0.9})`,
                transformOrigin: 'top left'
              }}
            >
              {layout.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📺</div>
                    <div className="text-lg font-medium mb-2">Empty Display</div>
                    <div className="text-sm">Add widgets to see the preview</div>
                  </div>
                </div>
              ) : (
                layout.map(renderPreviewWidget)
              )}
              
              {/* Preview Overlay */}
              <div className="preview-overlay" />
            </div>

            {/* Viewport Info */}
            <div className="absolute -bottom-6 left-0 text-xs text-slate-400">
              {config.width} × {config.height}px
              {config.scale !== 1 && ` (${Math.round(config.scale * 100)}%)`}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Status */}
      <div className="border-t border-slate-700 bg-slate-800/50 px-6 py-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            Last updated: {new Date(lastUpdate).toLocaleTimeString()}
          </span>
          <span>
            Auto-refresh: 30s
          </span>
        </div>
      </div>
    </div>
  );
}
