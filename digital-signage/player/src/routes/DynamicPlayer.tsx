/**
 * Dynamic Player Component
 * Uses the layout engine to render components dynamically based on layout configuration
 */

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { LayoutEngine } from '../engine/LayoutEngine'
import { LayoutManager } from '../engine/LayoutManager'
import LayoutEditor from '../components/LayoutEditor'
import type { LayoutConfig, ComponentDefinition } from '../types/LayoutTypes'
import type { ComponentCategory } from '../types/ComponentInterfaces'

// Import all available components
import WeatherWidget from '../components/WeatherWidget'
import DigitalClock from '../components/DigitalClock'
// import AnalogClock from '../components/AnalogClock'
import NewsWidget from '../components/NewsWidget'
import Slideshow from '../components/Slideshow'
import WebViewer from '../components/WebViewer'
import PVFlowWidget from '../components/PVFlowWidget'
// import CompactWeather from '../components/CompactWeather'

interface DynamicPlayerProps {
  /** Whether to show the layout editor */
  showEditor?: boolean
  /** Initial layout ID to load */
  initialLayoutId?: string
}

export default function DynamicPlayer({ 
  showEditor = false, 
  initialLayoutId 
}: DynamicPlayerProps) {
  const { screenId = '' } = useParams()
  const [layoutEngine] = useState(() => new LayoutEngine({
    maxComponents: 20,
    gridConstraints: {
      minCols: 4,
      maxCols: 24,
      minRows: 4,
      maxRows: 24
    },
    dragDrop: {
      enabled: true,
      resizable: true,
      movable: true
    },
    validation: {
      validateOnChange: true,
      showErrors: true,
      preventInvalid: true
    }
  }))
  
  const [layoutManager] = useState(() => new LayoutManager())
  const [currentLayout, setCurrentLayout] = useState<LayoutConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Component registry
  const componentRegistry = useMemo(() => ({
    weather: WeatherWidget,
    clock: DigitalClock, // Default to digital clock
    news: NewsWidget,
    slideshow: Slideshow,
    web: WebViewer,
    pv: PVFlowWidget,
    custom: () => <div>Custom Component</div>
  }), [])

  // Available components for the editor
  const availableComponents: ComponentDefinition[] = useMemo(() => [
    {
      type: 'weather',
      name: 'Weather Widget',
      description: 'Display current weather and forecast',
      defaultConfig: {
        location: 'London',
        theme: 'dark',
        showClock: false,
        showAnimatedBg: false
      },
      defaultPosition: { x: 1, y: 1, w: 3, h: 4 },
      available: true
    },
    {
      type: 'clock',
      name: 'Digital Clock',
      description: 'Display current time',
      defaultConfig: {
        timezone: 'UTC',
        type: 'minimal',
        size: 64,
        color: '#fff'
      },
      defaultPosition: { x: 1, y: 1, w: 2, h: 1 },
      available: true
    },
    {
      type: 'news',
      name: 'News Widget',
      description: 'Display news headlines',
      defaultConfig: {
        category: 'wirtschaft',
        limit: 6,
        theme: 'dark',
        rotationMs: 8000,
        compact: false
      },
      defaultPosition: { x: 1, y: 1, w: 4, h: 3 },
      available: true
    },
    {
      type: 'slideshow',
      name: 'Image Slideshow',
      description: 'Display rotating images',
      defaultConfig: {
        images: [],
        intervalMs: 8000,
        animations: ['fade'],
        durationMs: 900,
        preloadNext: true
      },
      defaultPosition: { x: 1, y: 1, w: 6, h: 4 },
      available: true
    },
    {
      type: 'web',
      name: 'Web Viewer',
      description: 'Display web content',
      defaultConfig: {
        url: '',
        mode: 'iframe',
        refreshIntervalMs: 300000
      },
      defaultPosition: { x: 1, y: 1, w: 8, h: 6 },
      available: true
    },
    {
      type: 'pv',
      name: 'PV Flow Widget',
      description: 'Display solar panel data flow',
      defaultConfig: {
        token: '',
        theme: 'dark'
      },
      defaultPosition: { x: 1, y: 1, w: 4, h: 4 },
      available: true
    }
  ], [])

  // Load initial layout
  useEffect(() => {
    const loadLayout = async () => {
      try {
        setIsLoading(true)
        setError(null)

        let layout: LayoutConfig | null = null

        if (initialLayoutId) {
          layout = layoutManager.getLayout(initialLayoutId)
        } else if (screenId) {
          // Try to load layout for this screen
          layout = layoutManager.getLayout(`screen_${screenId}`)
        }

        if (!layout) {
          // Create default layout
          layout = layoutManager.createFromTemplate('default')
        }

        if (layout) {
          setCurrentLayout(layout)
          layoutEngine.setCurrentLayout(layout)
        } else {
          setError('Failed to load layout')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    loadLayout()
  }, [screenId, initialLayoutId, layoutManager, layoutEngine])

  // Handle layout changes from editor
  const handleLayoutChange = (newLayout: LayoutConfig) => {
    setCurrentLayout(newLayout)
    layoutEngine.setCurrentLayout(newLayout)
  }

  // Handle layout save
  const handleLayoutSave = (layout: LayoutConfig) => {
    layoutManager.saveLayout(layout)
  }

  // Render component based on type and configuration
  const renderComponent = (component: any) => {
    const Component = componentRegistry[component.type as ComponentCategory]
    if (!Component) {
      return (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          color: '#666',
          fontSize: '14px'
        }}>
          Unknown component: {component.type}
        </div>
      )
    }

    try {
      return <Component {...component.config} />
    } catch (error) {
      console.error(`Error rendering component ${component.id}:`, error)
      return (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          color: '#dc2626',
          fontSize: '14px'
        }}>
          Error rendering {component.type}
        </div>
      )
    }
  }

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#111827',
        color: '#f9fafb'
      }}>
        Loading layout...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#111827',
        color: '#f87171',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>Layout Error</div>
        <div style={{ fontSize: '14px' }}>{error}</div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  if (!currentLayout) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#111827',
        color: '#f9fafb'
      }}>
        No layout available
      </div>
    )
  }

  // Show layout editor if requested
  if (showEditor) {
    return (
      <LayoutEditor
        initialLayout={currentLayout}
        availableComponents={availableComponents}
        onLayoutChange={handleLayoutChange}
        onLayoutSave={handleLayoutSave}
        theme="dark"
        visible={true}
      />
    )
  }

  // Render the layout
  return (
    <div
      className="dynamic-player"
      style={{
        width: '100%',
        height: '100vh',
        display: 'grid',
        gridTemplateColumns: `repeat(${currentLayout.grid.cols}, 1fr)`,
        gridTemplateRows: `repeat(${currentLayout.grid.rows}, 1fr)`,
        gap: `${currentLayout.grid.gap || 2}px`,
        backgroundColor: '#000000',
        padding: '0',
        boxSizing: 'border-box'
      }}
    >
      {currentLayout.components.map((component) => {
        const pixelPos = {
          gridColumnStart: component.position.x,
          gridColumnEnd: component.position.x + component.position.w,
          gridRowStart: component.position.y,
          gridRowEnd: component.position.y + component.position.h
        }

        return (
          <div
            key={component.id}
            className={`layout-component layout-component-${component.type}`}
            style={{
              ...pixelPos,
              backgroundColor: '#1f2937',
              borderRadius: '8px',
              overflow: 'hidden',
              position: 'relative',
              zIndex: component.zIndex || 1,
              display: component.visible !== false ? 'block' : 'none'
            }}
          >
            {renderComponent(component)}
          </div>
        )
      })}
    </div>
  )
}
