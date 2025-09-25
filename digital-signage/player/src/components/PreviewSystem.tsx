/**
 * Preview System Component
 * 
 * Provides real-time preview of digital signage layouts with
 * device simulation, performance monitoring, and error tracking.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { 
  PreviewSystem as PreviewSystemType, 
  PreviewConfig, 
  DeviceType,
  PreviewError,
  PreviewPerformance
} from '../types/UITypes';

interface PreviewSystemProps {
  system: PreviewSystemType;
  onSystemChange: (system: PreviewSystemType) => void;
  onConfigChange: (config: PreviewConfig) => void;
  className?: string;
}

export const PreviewSystem: React.FC<PreviewSystemProps> = ({
  system,
  onSystemChange,
  onConfigChange,
  className = ''
}) => {
  const [isFullscreen, setIsFullscreen] = useState(system.isFullscreen);
  const [isRecording, setIsRecording] = useState(system.isRecording);
  const [deviceType, setDeviceType] = useState<DeviceType>(system.deviceType);
  const [showDebugInfo, setShowDebugInfo] = useState(system.config.showDebugInfo);
  const [showGrid, setShowGrid] = useState(system.config.showGrid);
  const [showGuides, setShowGuides] = useState(system.config.showGuides);
  const [zoom, setZoom] = useState(system.config.zoom);
  
  const previewRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const performanceRef = useRef<PreviewPerformance>(system.performance);

  // Device dimensions
  const deviceDimensions = {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 1024, height: 768 },
    mobile: { width: 375, height: 667 },
    tv: { width: 3840, height: 2160 },
    custom: { width: system.config.size.width, height: system.config.size.height }
  };

  // Get current device dimensions
  const currentDimensions = deviceDimensions[deviceType];

  // Handle device type change
  const handleDeviceChange = useCallback((newDeviceType: DeviceType) => {
    setDeviceType(newDeviceType);
    const newConfig = {
      ...system.config,
      deviceType: newDeviceType,
      size: deviceDimensions[newDeviceType]
    };
    onConfigChange(newConfig);
    onSystemChange({
      ...system,
      deviceType: newDeviceType,
      config: newConfig
    });
  }, [system, onConfigChange, onSystemChange, deviceDimensions]);

  // Handle zoom change
  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
    const newConfig = {
      ...system.config,
      zoom: newZoom
    };
    onConfigChange(newConfig);
    onSystemChange({
      ...system,
      config: newConfig
    });
  }, [system, onConfigChange, onSystemChange]);

  // Handle fullscreen toggle
  const handleFullscreenToggle = useCallback(() => {
    const newFullscreen = !isFullscreen;
    setIsFullscreen(newFullscreen);
    onSystemChange({
      ...system,
      isFullscreen: newFullscreen
    });
  }, [isFullscreen, system, onSystemChange]);

  // Handle recording toggle
  const handleRecordingToggle = useCallback(() => {
    const newRecording = !isRecording;
    setIsRecording(newRecording);
    onSystemChange({
      ...system,
      isRecording: newRecording
    });
  }, [isRecording, system, onSystemChange]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
    onSystemChange({
      ...system,
      lastRefresh: new Date()
    });
  }, [system, onSystemChange]);

  // Simulate performance monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const renderTime = Math.random() * 16; // Simulate render time
      const memoryUsage = Math.random() * 100; // Simulate memory usage
      
      performanceRef.current = {
        renderTime,
        memoryUsage,
        componentCount: system.config.components.length,
        errorCount: system.errors.length,
        warningCount: system.errors.filter(e => e.type === 'warning').length,
        lastUpdate: now
      };
    }, 1000);

    return () => clearInterval(interval);
  }, [system.config.components.length, system.errors.length]);

  // Simulate error generation
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance of error
        const newError: PreviewError = {
          id: `error-${Date.now()}`,
          componentId: `component-${Math.floor(Math.random() * 5)}`,
          message: 'Simulated error for testing',
          type: Math.random() > 0.5 ? 'error' : 'warning',
          timestamp: new Date(),
          stack: 'Error: Simulated error\n    at Component.render (Component.tsx:123:45)'
        };
        
        onSystemChange({
          ...system,
          errors: [...system.errors, newError]
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [system, onSystemChange]);

  // Render device selector
  const renderDeviceSelector = () => {
    const devices = [
      { type: 'desktop' as DeviceType, label: 'Desktop', icon: '🖥️' },
      { type: 'tablet' as DeviceType, label: 'Tablet', icon: '📱' },
      { type: 'mobile' as DeviceType, label: 'Mobile', icon: '📱' },
      { type: 'tv' as DeviceType, label: 'TV', icon: '📺' },
      { type: 'custom' as DeviceType, label: 'Custom', icon: '⚙️' }
    ];

    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-400">Device:</span>
        <div className="flex border border-gray-600 rounded">
          {devices.map(device => (
            <button
              key={device.type}
              onClick={() => handleDeviceChange(device.type)}
              className={`px-3 py-1 text-sm flex items-center space-x-1 ${
                deviceType === device.type
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              <span>{device.icon}</span>
              <span>{device.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Render zoom controls
  const renderZoomControls = () => {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-400">Zoom:</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleZoomChange(Math.max(0.25, zoom - 0.25))}
            className="px-2 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            -
          </button>
          <span className="text-sm text-white w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => handleZoomChange(Math.min(2, zoom + 0.25))}
            className="px-2 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            +
          </button>
        </div>
      </div>
    );
  };

  // Render performance metrics
  const renderPerformanceMetrics = () => {
    const perf = performanceRef.current;
    
    return (
      <div className="flex items-center space-x-4 text-xs text-gray-400">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>Render: {perf.renderTime.toFixed(1)}ms</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <span>Memory: {perf.memoryUsage.toFixed(1)}%</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
          <span>Components: {perf.componentCount}</span>
        </div>
        {perf.errorCount > 0 && (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span>Errors: {perf.errorCount}</span>
          </div>
        )}
      </div>
    );
  };

  // Render error list
  const renderErrorList = () => {
    if (system.errors.length === 0) return null;

    return (
      <div className="absolute top-4 right-4 w-80 bg-gray-900 border border-gray-600 rounded-lg shadow-lg z-10">
        <div className="p-3 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">Errors & Warnings</h3>
            <button
              onClick={() => onSystemChange({
                ...system,
                errors: []
              })}
              className="text-xs text-gray-400 hover:text-white"
            >
              Clear All
            </button>
          </div>
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          {system.errors.map(error => (
            <div
              key={error.id}
              className={`p-3 border-b border-gray-700 last:border-b-0 ${
                error.type === 'error' ? 'bg-red-900 bg-opacity-20' : 'bg-yellow-900 bg-opacity-20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${
                      error.type === 'error' ? 'bg-red-400' : 'bg-yellow-400'
                    }`}></div>
                    <span className="text-xs font-medium text-white">
                      {error.componentId}
                    </span>
                    <span className="text-xs text-gray-400">
                      {error.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300">{error.message}</p>
                </div>
                <button
                  onClick={() => onSystemChange({
                    ...system,
                    errors: system.errors.filter(e => e.id !== error.id)
                  })}
                  className="text-xs text-gray-400 hover:text-white ml-2"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render debug info
  const renderDebugInfo = () => {
    if (!showDebugInfo) return null;

    return (
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs font-mono">
        <div>Screen ID: {system.config.screenId}</div>
        <div>Device: {deviceType} ({currentDimensions.width}×{currentDimensions.height})</div>
        <div>Zoom: {Math.round(zoom * 100)}%</div>
        <div>Components: {system.config.components.length}</div>
        <div>Last Refresh: {system.lastRefresh.toLocaleTimeString()}</div>
        <div>Grid: {showGrid ? 'ON' : 'OFF'}</div>
        <div>Guides: {showGuides ? 'ON' : 'OFF'}</div>
      </div>
    );
  };

  // Render grid overlay
  const renderGridOverlay = () => {
    if (!showGrid) return null;

    const gridSize = 20;
    const lines = [];

    // Vertical lines
    for (let i = 0; i <= currentDimensions.width; i += gridSize) {
      lines.push(
        <line
          key={`v-${i}`}
          x1={i}
          y1={0}
          x2={i}
          y2={currentDimensions.height}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
        />
      );
    }

    // Horizontal lines
    for (let i = 0; i <= currentDimensions.height; i += gridSize) {
      lines.push(
        <line
          key={`h-${i}`}
          x1={0}
          y1={i}
          x2={currentDimensions.width}
          y2={i}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
        />
      );
    }

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        width={currentDimensions.width}
        height={currentDimensions.height}
        style={{ zIndex: 1 }}
      >
        {lines}
      </svg>
    );
  };

  return (
    <div className={`bg-gray-900 flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Preview</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                showDebugInfo
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              Debug
            </button>
            <button
              onClick={handleRecordingToggle}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                isRecording
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {isRecording ? 'Stop Recording' : 'Record'}
            </button>
            <button
              onClick={handleFullscreenToggle}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {renderDeviceSelector()}
            {renderZoomControls()}
            <div className="flex items-center space-x-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-400">Grid</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showGuides}
                  onChange={(e) => setShowGuides(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-400">Guides</span>
              </label>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {renderPerformanceMetrics()}
            <button
              onClick={handleRefresh}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gray-800">
        <div
          ref={previewRef}
          className="relative bg-black border border-gray-600 rounded-lg overflow-hidden shadow-lg"
          style={{
            width: currentDimensions.width * zoom,
            height: currentDimensions.height * zoom,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left'
          }}
        >
          {/* Grid Overlay */}
          {renderGridOverlay()}
          
          {/* Preview Content */}
          <iframe
            ref={iframeRef}
            src={`/player/${system.config.screenId}`}
            className="w-full h-full border-0"
            style={{
              width: currentDimensions.width,
              height: currentDimensions.height
            }}
            title="Preview"
          />
          
          {/* Debug Info */}
          {renderDebugInfo()}
          
          {/* Error List */}
          {renderErrorList()}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div>
            Last updated: {system.lastRefresh.toLocaleString()}
          </div>
          <div className="flex items-center space-x-4">
            <span>Refresh interval: {system.refreshInterval}ms</span>
            <span>Device: {deviceType}</span>
            <span>Zoom: {Math.round(zoom * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewSystem;
