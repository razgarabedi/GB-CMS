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

type ViewportSize = 'desktop' | 'laptop' | 'tablet' | 'mobile' | 'custom';

interface ViewportConfig {
  name: string;
  icon: string;
  width: number;
  height: number;
  scale: number;
  category: 'desktop' | 'tablet' | 'mobile';
  orientation?: 'portrait' | 'landscape';
  description: string;
}

const viewportConfigs: Record<ViewportSize, ViewportConfig> = {
  desktop: {
    name: 'Desktop',
    icon: '🖥️',
    width: 1920,
    height: 1080,
    scale: 1,
    category: 'desktop',
    orientation: 'landscape',
    description: 'Large desktop displays'
  },
  laptop: {
    name: 'Laptop',
    icon: '💻',
    width: 1366,
    height: 768,
    scale: 0.85,
    category: 'desktop',
    orientation: 'landscape',
    description: 'Standard laptop screens'
  },
  tablet: {
    name: 'Tablet',
    icon: '📱',
    width: 1024,
    height: 768,
    scale: 0.7,
    category: 'tablet',
    orientation: 'landscape',
    description: 'iPad and Android tablets'
  },
  mobile: {
    name: 'Mobile',
    icon: '📱',
    width: 375,
    height: 667,
    scale: 0.5,
    category: 'mobile',
    orientation: 'portrait',
    description: 'iPhone and Android phones'
  },
  custom: {
    name: 'Custom',
    icon: '🔧',
    width: 1200,
    height: 800,
    scale: 0.8,
    category: 'desktop',
    orientation: 'landscape',
    description: 'Custom viewport size'
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
  const [customWidth, setCustomWidth] = useState(1200);
  const [customHeight, setCustomHeight] = useState(800);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'normal' | 'responsive' | 'comparison'>('normal');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'desktop' | 'tablet' | 'mobile'>('all');
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
    if (size === 'custom') {
      // Update custom viewport config
      viewportConfigs.custom.width = customWidth;
      viewportConfigs.custom.height = customHeight;
    }
  };

  const handleCustomSizeChange = (width: number, height: number) => {
    setCustomWidth(width);
    setCustomHeight(height);
    if (viewportSize === 'custom') {
      viewportConfigs.custom.width = width;
      viewportConfigs.custom.height = height;
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const resetZoom = () => {
    setZoomLevel(100);
  };

  const adjustZoom = (delta: number) => {
    setZoomLevel(prev => Math.max(25, Math.min(300, prev + delta)));
  };

  // Calculate responsive layout for different viewports
  const getResponsiveLayout = (viewport: ViewportSize) => {
    const config = viewportConfigs[viewport];
    const isMobile = config.category === 'mobile';
    const isTablet = config.category === 'tablet';
    
    return layout.map(item => {
      let responsiveItem = { ...item };
      
      // Mobile: Stack widgets vertically, full width
      if (isMobile) {
        responsiveItem.w = 12; // Full width
        responsiveItem.x = 0; // Left aligned
        // Stack vertically based on original order
        const index = layout.findIndex(l => l.i === item.i);
        responsiveItem.y = index;
      }
      // Tablet: Adjust width for medium screens
      else if (isTablet) {
        if (item.w > 6) {
          responsiveItem.w = 12; // Full width for large widgets
        } else if (item.w > 3) {
          responsiveItem.w = 6; // Half width for medium widgets
        }
        // Keep original positioning
      }
      
      return responsiveItem;
    });
  };

  // Get filtered viewport configs based on category
  const getFilteredViewports = () => {
    if (selectedCategory === 'all') {
      return Object.keys(viewportConfigs) as ViewportSize[];
    }
    return (Object.keys(viewportConfigs) as ViewportSize[]).filter(
      size => viewportConfigs[size as ViewportSize].category === selectedCategory
    );
  };

  const renderPreviewWidget = (item: LayoutItem, useResponsive = false) => {
    const config = viewportConfigs[viewportSize];
    const isSelected = selectedWidget === item.i;
    
    // Use responsive layout if enabled
    const displayItem = useResponsive ? getResponsiveLayout(viewportSize).find(l => l.i === item.i) || item : item;
    
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
        key={`${item.i}-${viewportSize}-${useResponsive ? 'responsive' : 'normal'}`}
        className={`absolute transition-all duration-300 ${isSelected ? 'ring-2 ring-blue-400' : ''} ${
          showGrid ? 'border border-blue-300/30' : ''
        }`}
        style={{
          left: `${(displayItem.x / 12) * 100}%`,
          top: `${displayItem.y * cellHeight}px`,
          width: `${(displayItem.w / 12) * 100}%`,
          height: `${displayItem.h * cellHeight}px`,
          transform: `scale(${config.scale * (zoomLevel / 100)})`,
          transformOrigin: 'top left',
          cursor: onWidgetSelect ? 'pointer' : 'default',
          zIndex: isSelected ? 10 : 1
        }}
        onClick={() => onWidgetSelect?.(item.i)}
      >
        {WidgetComponent ? (
          <div className="w-full h-full overflow-hidden rounded-md bg-slate-800">
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
  const filteredViewports = getFilteredViewports();

  return (
    <div className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900' : ''}`}>
      {/* Enhanced Preview Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-white">Responsive Preview</h3>
            <div className="text-sm text-slate-400">
              {layout.length} widget{layout.length !== 1 ? 's' : ''}
            </div>
            <div className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded">
              {config.width} × {config.height}px
            </div>
          </div>
          
          {/* Right Section - Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Preview Mode Toggle */}
            <div className="flex bg-slate-700 rounded-lg p-1">
              {[
                { id: 'normal', label: 'Normal', icon: '👁️' },
                { id: 'responsive', label: 'Responsive', icon: '📱' },
                { id: 'comparison', label: 'Compare', icon: '⚖️' }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setPreviewMode(mode.id as any)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    previewMode === mode.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <span className="mr-1">{mode.icon}</span>
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Device Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Devices</option>
              <option value="desktop">Desktop</option>
              <option value="tablet">Tablet</option>
              <option value="mobile">Mobile</option>
            </select>

            {/* Viewport Controls */}
            <div className="flex bg-slate-700 rounded-lg p-1">
              {filteredViewports.map((size) => (
                <button
                  key={size}
                  onClick={() => handleViewportChange(size)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewportSize === size
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-600'
                  }`}
                  title={viewportConfigs[size].description}
                >
                  <span className="mr-1">{viewportConfigs[size].icon}</span>
                  <span className="hidden sm:inline">{viewportConfigs[size].name}</span>
                </button>
              ))}
            </div>

            {/* Custom Size Inputs */}
            {viewportSize === 'custom' && (
              <div className="flex items-center space-x-2 bg-slate-700 rounded-lg p-2">
                <input
                  type="number"
                  value={customWidth}
                  onChange={(e) => handleCustomSizeChange(parseInt(e.target.value), customHeight)}
                  className="w-20 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                  placeholder="Width"
                />
                <span className="text-slate-400">×</span>
                <input
                  type="number"
                  value={customHeight}
                  onChange={(e) => handleCustomSizeChange(customWidth, parseInt(e.target.value))}
                  className="w-20 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                  placeholder="Height"
                />
              </div>
            )}

            {/* Zoom Controls */}
            <div className="flex items-center space-x-2 bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => adjustZoom(-25)}
                className="px-2 py-1 text-slate-300 hover:bg-slate-600 rounded text-sm"
                title="Zoom Out"
              >
                🔍-
              </button>
              <span className="px-2 py-1 text-white text-sm min-w-[3rem] text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={() => adjustZoom(25)}
                className="px-2 py-1 text-slate-300 hover:bg-slate-600 rounded text-sm"
                title="Zoom In"
              >
                🔍+
              </button>
              <button
                onClick={resetZoom}
                className="px-2 py-1 text-slate-300 hover:bg-slate-600 rounded text-sm"
                title="Reset Zoom"
              >
                🎯
              </button>
            </div>

            {/* Tool Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  showGrid ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
                title="Toggle Grid"
              >
                ⊞
              </button>
              <button
                onClick={() => setShowRulers(!showRulers)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  showRulers ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
                title="Toggle Rulers"
              >
                📏
              </button>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  isRefreshing ? 'bg-slate-600 cursor-not-allowed' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
                title="Refresh Preview"
              >
                {isRefreshing ? '⏳' : '🔄'}
              </button>
              <button
                onClick={toggleFullscreen}
                className="px-3 py-1 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded text-sm transition-colors"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? '⤓' : '⤢'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 p-6 bg-slate-900 overflow-auto">
        <div className="flex justify-center">
          <div 
            ref={previewRef}
            className={`relative ${showRulers ? 'border-l-4 border-t-4 border-slate-600' : ''}`}
            style={{
              maxWidth: '100%',
              maxHeight: 'calc(100vh - 200px)'
            }}
          >
            {/* Rulers */}
            {showRulers && (
              <>
                <div className="absolute -top-4 left-0 w-full h-4 bg-slate-800 border-b border-slate-600 flex items-center text-xs text-slate-400">
                  {Array.from({ length: Math.ceil(config.width / 100) }, (_, i) => (
                    <div key={i} className="absolute" style={{ left: `${i * 100}px` }}>
                      {i * 100}
                    </div>
                  ))}
                </div>
                <div className="absolute -left-4 top-0 w-4 h-full bg-slate-800 border-r border-slate-600 flex flex-col items-center text-xs text-slate-400">
                  {Array.from({ length: Math.ceil(config.height / 100) }, (_, i) => (
                    <div key={i} className="absolute" style={{ top: `${i * 100}px` }}>
                      {i * 100}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Preview Content Area */}
            <div 
              className="bg-black relative overflow-hidden"
              style={{
                width: `${config.width}px`,
                height: `${config.height}px`,
                transform: `scale(${Math.min(
                  (previewRef.current?.clientWidth || config.width) / config.width,
                  (previewRef.current?.clientHeight || config.height) / config.height
                ) * 0.9 * (zoomLevel / 100)})`,
                transformOrigin: 'top left'
              }}
            >
              {/* Grid Overlay */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: 12 }, (_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 border-r border-blue-300/20"
                      style={{ left: `${(i / 12) * 100}%` }}
                    />
                  ))}
                  {Array.from({ length: Math.ceil(config.height / 60) }, (_, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 border-b border-blue-300/20"
                      style={{ top: `${i * 60}px` }}
                    />
                  ))}
                </div>
              )}

              {layout.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📺</div>
                    <div className="text-lg font-medium mb-2">Empty Display</div>
                    <div className="text-sm">Add widgets to see the preview</div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Normal Layout */}
                  {previewMode === 'normal' && layout.map(item => renderPreviewWidget(item, false))}
                  
                  {/* Responsive Layout */}
                  {previewMode === 'responsive' && layout.map(item => renderPreviewWidget(item, true))}
                  
                  {/* Comparison Mode */}
                  {previewMode === 'comparison' && (
                    <div className="flex h-full">
                      <div className="w-1/2 border-r border-slate-600">
                        <div className="p-2 text-xs text-slate-400 bg-slate-800">Normal Layout</div>
                        {layout.map(item => renderPreviewWidget(item, false))}
                      </div>
                      <div className="w-1/2">
                        <div className="p-2 text-xs text-slate-400 bg-slate-800">Responsive Layout</div>
                        {layout.map(item => renderPreviewWidget(item, true))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Viewport Info */}
            <div className="absolute -bottom-6 left-0 text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
              {config.name}: {config.width} × {config.height}px
              {config.scale !== 1 && ` (${Math.round(config.scale * 100)}%)`}
              {zoomLevel !== 100 && ` • Zoom: ${zoomLevel}%`}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Preview Status */}
      <div className="border-t border-slate-700 bg-slate-800/50 px-6 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <span>
              Last updated: {new Date(lastUpdate).toLocaleTimeString()}
            </span>
            <span>
              Auto-refresh: 30s
            </span>
            {previewMode === 'responsive' && (
              <span className="text-blue-400">
                📱 Responsive mode active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span>
              Mode: {previewMode.charAt(0).toUpperCase() + previewMode.slice(1)}
            </span>
            <span>
              Category: {selectedCategory}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
