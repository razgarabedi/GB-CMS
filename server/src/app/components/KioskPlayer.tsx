'use client';

import { useState, useEffect } from 'react';
import { WidgetRegistry, DefaultWidgetProps } from './widgets';
import { Screen } from './ScreenManager';

interface KioskPlayerProps {
  screenId?: string;
  onScreenChange?: (screen: Screen) => void;
  showScreenSelector?: boolean;
  autoRotate?: boolean;
  rotationInterval?: number; // in milliseconds
  kioskMode?: boolean; // true = no UI, just content
}

export default function KioskPlayer({ 
  screenId, 
  onScreenChange, 
  showScreenSelector = true,
  autoRotate = false,
  rotationInterval = 30000,
  kioskMode = true
}: KioskPlayerProps) {
  const [currentScreen, setCurrentScreen] = useState<Screen | null>(null);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [rotationTimer, setRotationTimer] = useState<NodeJS.Timeout | null>(null);

  // Load screens from localStorage
  useEffect(() => {
    const loadScreens = () => {
      try {
        const savedScreens = localStorage.getItem('gb-cms-screens');
        if (savedScreens) {
          const parsedScreens = JSON.parse(savedScreens);
          setScreens(parsedScreens);
          
          if (screenId) {
            const screenIndex = parsedScreens.findIndex((s: Screen) => s.id === screenId);
            if (screenIndex >= 0) {
              setCurrentScreen(parsedScreens[screenIndex]);
              setCurrentScreenIndex(screenIndex);
              onScreenChange?.(parsedScreens[screenIndex]);
            } else {
              setError(`Screen with ID "${screenId}" not found`);
            }
          } else if (parsedScreens.length > 0) {
            // Load the first screen by default
            setCurrentScreen(parsedScreens[0]);
            setCurrentScreenIndex(0);
            onScreenChange?.(parsedScreens[0]);
          }
        } else {
          setError('No screens found. Please create a screen in the CMS first.');
        }
      } catch (error) {
        console.error('Error loading screens:', error);
        setError('Failed to load screens');
      } finally {
        setIsLoading(false);
      }
    };

    loadScreens();
  }, [screenId, onScreenChange]);

  // Auto-rotation effect
  useEffect(() => {
    if (autoRotate && screens.length > 1) {
      const timer = setInterval(() => {
        setCurrentScreenIndex(prev => {
          const nextIndex = (prev + 1) % screens.length;
          const nextScreen = screens[nextIndex];
          setCurrentScreen(nextScreen);
          onScreenChange?.(nextScreen);
          return nextIndex;
        });
      }, rotationInterval);

      setRotationTimer(timer);

      return () => {
        clearInterval(timer);
        setRotationTimer(null);
      };
    }
  }, [autoRotate, screens, rotationInterval, onScreenChange]);

  // Cleanup rotation timer on unmount
  useEffect(() => {
    return () => {
      if (rotationTimer) {
        clearInterval(rotationTimer);
      }
    };
  }, [rotationTimer]);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle escape key to exit fullscreen and keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      } else if (!kioskMode && e.key === 'ArrowLeft' && screens.length > 1) {
        // Previous screen - only in non-kiosk mode
        e.preventDefault();
        const prevIndex = (currentScreenIndex - 1 + screens.length) % screens.length;
        setCurrentScreenIndex(prevIndex);
        setCurrentScreen(screens[prevIndex]);
        onScreenChange?.(screens[prevIndex]);
      } else if (!kioskMode && e.key === 'ArrowRight' && screens.length > 1) {
        // Next screen - only in non-kiosk mode
        e.preventDefault();
        const nextIndex = (currentScreenIndex + 1) % screens.length;
        setCurrentScreenIndex(nextIndex);
        setCurrentScreen(screens[nextIndex]);
        onScreenChange?.(screens[nextIndex]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, screens, currentScreenIndex, onScreenChange, kioskMode]);

  // Manual screen selection
  const selectScreen = (index: number) => {
    if (index >= 0 && index < screens.length) {
      setCurrentScreenIndex(index);
      setCurrentScreen(screens[index]);
      onScreenChange?.(screens[index]);
    }
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const renderWidget = (item: any) => {
    const WidgetComponent = WidgetRegistry[item.component as keyof typeof WidgetRegistry];
    const defaultProps = DefaultWidgetProps[item.component as keyof typeof DefaultWidgetProps] || {};
    const widgetProps = { ...defaultProps, ...(item.props || {}) };

    return (
      <div
        key={item.i}
        className="absolute overflow-hidden rounded-lg"
        style={{
          left: `${(item.x / 12) * 100}%`,
          top: `${item.y * 60}px`,
          width: `${(item.w / 12) * 100}%`,
          height: `${item.h * 60}px`,
        }}
      >
        {WidgetComponent ? (
          <WidgetComponent {...(widgetProps as any)} />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-slate-700 text-white rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold mb-1">{item.component}</div>
              <div className="text-xs opacity-75">Widget not found</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading screen...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Screen Not Found</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Go to CMS
          </button>
        </div>
      </div>
    );
  }

  if (!currentScreen) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">📺</div>
          <h2 className="text-2xl font-bold text-white mb-2">No Screen Selected</h2>
          <p className="text-slate-400 mb-6">Please select a screen to display</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Go to CMS
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-900 relative overflow-hidden">
      {/* Screen Header - only show if not in kiosk mode */}
      {!kioskMode && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-slate-800/90 backdrop-blur-sm border-b border-slate-700">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold text-white">{currentScreen.name}</h1>
              {currentScreen.description && (
                <span className="text-sm text-slate-400">{currentScreen.description}</span>
              )}
              {screens.length > 1 && (
                <span className="text-xs text-slate-500">
                  ({currentScreenIndex + 1} of {screens.length})
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-slate-400">
                {currentScreen.layout.length} widgets
              </div>
              {autoRotate && (
                <div className="flex items-center space-x-1 text-xs text-green-400">
                  <span>🔄</span>
                  <span>Auto-rotating</span>
                </div>
              )}
              <button
                onClick={toggleFullscreen}
                className="px-3 py-1.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors duration-200 text-sm"
              >
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
              >
                Edit Screen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screen Content */}
      <div 
        className={`relative w-full h-full ${!kioskMode ? 'pt-16' : ''}`}
        style={{ minHeight: kioskMode ? '100vh' : '600px' }}
      >
        {currentScreen.layout.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">🎨</div>
              <div className="text-lg font-medium text-white mb-2">Empty Screen</div>
              <div className="text-slate-400">This screen has no widgets</div>
            </div>
          </div>
        ) : (
          currentScreen.layout.map(renderWidget)
        )}
      </div>

      {/* Screen Navigation (if multiple screens) - only show if not in kiosk mode */}
      {!kioskMode && screens.length > 1 && showScreenSelector && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex space-x-2 bg-slate-800/90 backdrop-blur-sm rounded-lg p-2 border border-slate-700">
            {screens.map((screen, index) => (
              <button
                key={screen.id}
                onClick={() => selectScreen(index)}
                className={`px-3 py-1.5 rounded text-sm transition-colors duration-200 ${
                  currentScreenIndex === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
                title={screen.description || screen.name}
              >
                {screen.name}
              </button>
            ))}
          </div>
          <div className="text-center mt-2 text-xs text-slate-500">
            Use ← → arrow keys to navigate
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      <div className="absolute inset-0 bg-slate-900 flex items-center justify-center z-50 hidden">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading...</div>
        </div>
      </div>
    </div>
  );
}
