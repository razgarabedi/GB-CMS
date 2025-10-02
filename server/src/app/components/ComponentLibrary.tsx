'use client';

import { useRef, useEffect, useState } from 'react';
import { widgetIcons } from './icons/WidgetIcons';
import { DefaultWidgetDimensions } from './widgets';
import StaticWidgetSizeModal from './StaticWidgetSizeModal';
import { StaticWidgetSize } from '../types/staticWidgets';

interface ComponentLibraryProps {
  onWidgetAdd: (componentName: string, size?: StaticWidgetSize) => void;
}

export default function ComponentLibrary({ onWidgetAdd }: ComponentLibraryProps) {
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dragElementRef = useRef<HTMLElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedStaticWidget, setSelectedStaticWidget] = useState<string | null>(null);
  
  const widgetCategories = [
    {
      name: 'Content & Media',
      description: 'Display content, images, and media',
      widgets: [
        { 
          name: 'Weather', 
          icon: 'weather', 
          description: 'Real-time weather with location and animated backgrounds', 
          color: 'bg-blue-600',
          tags: ['weather', 'location', 'animated'],
          size: 'medium'
        },
        { 
          name: 'Static Weather', 
          icon: 'weather', 
          description: 'Weather widget with predefined sizes and optimized layouts', 
          color: 'bg-blue-500',
          tags: ['weather', 'static', 'predefined-sizes'],
          size: 'compact',
          isStatic: true
        },
        { 
          name: 'Clock', 
          icon: 'clock', 
          description: 'Digital or analog clock with timezone support', 
          color: 'bg-green-600',
          tags: ['time', 'digital', 'analog'],
          size: 'small'
        },
        { 
          name: 'News', 
          icon: 'news', 
          description: 'Live news feed with category filtering', 
          color: 'bg-red-600',
          tags: ['news', 'feed', 'auto-rotate'],
          size: 'large'
        },
        { 
          name: 'Slideshow', 
          icon: 'slideshow', 
          description: 'Image carousel with fade/slide animations', 
          color: 'bg-purple-600',
          tags: ['images', 'carousel', 'gallery'],
          size: 'large'
        },
        { 
          name: 'Video Player', 
          icon: 'video-player', 
          description: 'Embedded video player with controls', 
          color: 'bg-pink-600',
          tags: ['video', 'media', 'player'],
          size: 'large'
        },
        { 
          name: 'Image Gallery', 
          icon: 'image-gallery', 
          description: 'Grid-based image gallery with lightbox', 
          color: 'bg-indigo-600',
          tags: ['images', 'gallery', 'grid'],
          size: 'large'
        }
      ]
    },
    {
      name: 'Data & Analytics',
      description: 'Visualize data and analytics',
      widgets: [
        { 
          name: 'PV Compact', 
          icon: 'chart', 
          description: 'Solar panel monitoring with power output', 
          color: 'bg-cyan-600',
          tags: ['solar', 'energy', 'monitoring'],
          size: 'medium'
        },
        { 
          name: 'PV Flow', 
          icon: 'chart', 
          description: 'Energy flow visualization with animated diagrams', 
          color: 'bg-teal-600',
          tags: ['energy', 'flow', 'animated'],
          size: 'large'
        },
        { 
          name: 'Chart Widget', 
          icon: 'chart', 
          description: 'Interactive charts and graphs', 
          color: 'bg-orange-600',
          tags: ['charts', 'data', 'visualization'],
          size: 'large'
        },
        { 
          name: 'KPI Dashboard', 
          icon: 'kpi', 
          description: 'Key performance indicators display', 
          color: 'bg-emerald-600',
          tags: ['kpi', 'metrics', 'dashboard'],
          size: 'medium'
        },
        { 
          name: 'Counter Widget', 
          icon: 'counter', 
          description: 'Animated counter with custom formatting', 
          color: 'bg-violet-600',
          tags: ['counter', 'numbers', 'animated'],
          size: 'small'
        }
      ]
    },
    {
      name: 'Interactive & Web',
      description: 'Interactive widgets and web content',
      widgets: [
        { 
          name: 'Web Viewer', 
          icon: 'web-viewer', 
          description: 'Embed web content and pages with refresh controls', 
          color: 'bg-indigo-600',
          tags: ['web', 'iframe', 'content'],
          size: 'large'
        },
        { 
          name: 'QR Code', 
          icon: 'qr-code', 
          description: 'Generate and display QR codes', 
          color: 'bg-slate-600',
          tags: ['qr', 'code', 'mobile'],
          size: 'small'
        },
        { 
          name: 'Social Feed', 
          icon: 'social-feed', 
          description: 'Social media feed integration', 
          color: 'bg-blue-500',
          tags: ['social', 'feed', 'twitter'],
          size: 'medium'
        },
        { 
          name: 'Live Chat', 
          icon: 'live-chat', 
          description: 'Live chat widget for customer support', 
          color: 'bg-green-500',
          tags: ['chat', 'support', 'live'],
          size: 'medium'
        }
      ]
    },
    {
      name: 'Information & Text',
      description: 'Text-based information displays',
      widgets: [
        { 
          name: 'Text Display', 
          icon: 'text-display', 
          description: 'Custom text with rich formatting options', 
          color: 'bg-gray-600',
          tags: ['text', 'custom', 'formatting'],
          size: 'small'
        },
        { 
          name: 'Announcement', 
          icon: 'announcement', 
          description: 'Scrolling announcement ticker', 
          color: 'bg-yellow-600',
          tags: ['announcement', 'ticker', 'scrolling'],
          size: 'medium'
        },
        { 
          name: 'Calendar', 
          icon: 'calendar', 
          description: 'Event calendar with date display', 
          color: 'bg-blue-700',
          tags: ['calendar', 'events', 'dates'],
          size: 'medium'
        },
        { 
          name: 'Quote Display', 
          icon: 'quote', 
          description: 'Rotating inspirational quotes', 
          color: 'bg-purple-700',
          tags: ['quotes', 'inspiration', 'rotating'],
          size: 'medium'
        }
      ]
    },
    {
      name: 'Custom & Advanced',
      description: 'Customizable and advanced widgets',
      widgets: [
        { 
          name: 'Custom', 
          icon: 'custom', 
          description: 'Fully customizable widget with configurable properties', 
          color: 'bg-gray-600',
          tags: ['custom', 'configurable', 'flexible'],
          size: 'medium'
        },
        { 
          name: 'HTML Widget', 
          icon: 'html', 
          description: 'Custom HTML content with CSS styling', 
          color: 'bg-slate-700',
          tags: ['html', 'css', 'custom'],
          size: 'large'
        },
        { 
          name: 'API Data', 
          icon: 'api', 
          description: 'Display data from external APIs', 
          color: 'bg-orange-700',
          tags: ['api', 'data', 'external'],
          size: 'medium'
        },
        { 
          name: 'Plugin Widget', 
          icon: 'plugin', 
          description: 'Third-party plugin integration', 
          color: 'bg-pink-700',
          tags: ['plugin', 'third-party', 'extensible'],
          size: 'medium'
        }
      ]
    }
  ];

  // Filter widgets based on search query, category, and size
  const filteredCategories = widgetCategories.map(category => ({
    ...category,
    widgets: category.widgets.filter(widget => {
      const matchesSearch = searchQuery === '' || 
        widget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        widget.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        widget.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === null || category.name === selectedCategory;
      const matchesSize = selectedSize === null || widget.size === selectedSize;
      
      return matchesSearch && matchesCategory && matchesSize;
    })
  })).filter(category => category.widgets.length > 0);

  const totalWidgets = filteredCategories.reduce((total, cat) => total + cat.widgets.length, 0);

  const handleDragStart = (e: React.DragEvent, componentName: string, widget: any) => {
    e.dataTransfer.setData('text/plain', `new-${componentName}`);
    e.dataTransfer.effectAllowed = 'copy';
    
    // Store reference to the current target to prevent null reference errors
    const currentTarget = e.currentTarget as HTMLElement;
    dragElementRef.current = currentTarget;
    
    // Clear any existing timeout
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }
    
    // Enhanced custom drag image with widget info
    const dragImage = document.createElement('div');
    dragImage.className = 'drag-preview-enhanced';
    dragImage.style.cssText = `
      position: absolute;
      top: -1000px;
      background: linear-gradient(135deg, ${widget.color.replace('bg-', 'rgb(')}, rgba(59, 130, 246, 0.9));
      color: white;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      border: 2px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    
    // Add icon and text
    const iconSpan = document.createElement('span');
    iconSpan.textContent = widget.icon;
    iconSpan.style.fontSize = '18px';
    
    const textSpan = document.createElement('span');
    textSpan.textContent = `+ ${componentName}`;
    
    dragImage.appendChild(iconSpan);
    dragImage.appendChild(textSpan);
    document.body.appendChild(dragImage);
    
    e.dataTransfer.setDragImage(dragImage, 75, 30);
    
    // Add dragging class to source element
    if (currentTarget && currentTarget.classList) {
      currentTarget.classList.add('dragging-from-library');
    }
    
    // Clean up drag image
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    }, 0);
    
    // Reset dragging class after a short delay with robust null checks
    dragTimeoutRef.current = setTimeout(() => {
      const element = dragElementRef.current;
      if (element && element.classList && element.classList.contains('dragging-from-library')) {
        try {
          element.classList.remove('dragging-from-library');
        } catch (error) {
          // Silently handle any DOM manipulation errors
          console.warn('Could not remove dragging class:', error);
        }
      }
      dragElementRef.current = null;
      dragTimeoutRef.current = null;
    }, 300);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Clear timeout if drag ends early
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }
    
    const currentTarget = e.currentTarget as HTMLElement;
    if (currentTarget && currentTarget.classList && currentTarget.classList.contains('dragging-from-library')) {
      try {
        currentTarget.classList.remove('dragging-from-library');
      } catch (error) {
        // Silently handle any DOM manipulation errors
        console.warn('Could not remove dragging class on drag end:', error);
      }
    }
    
    dragElementRef.current = null;
  };

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clear any pending timeouts when component unmounts
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
      
      // Clear any dragging classes from stored element
      if (dragElementRef.current && dragElementRef.current.classList) {
        try {
          dragElementRef.current.classList.remove('dragging-from-library');
        } catch (error) {
          // Silently handle cleanup errors
        }
      }
    };
  }, []);

  const handleWidgetClick = (widget: any) => {
    if (widget.isStatic) {
      setSelectedStaticWidget(widget.name);
      setShowSizeModal(true);
    } else {
      onWidgetAdd(widget.name);
    }
  };

  const handleSizeSelect = (size: StaticWidgetSize) => {
    if (selectedStaticWidget) {
      onWidgetAdd(selectedStaticWidget, size);
    }
    setShowSizeModal(false);
    setSelectedStaticWidget(null);
  };

  const handleCloseModal = () => {
    setShowSizeModal(false);
    setSelectedStaticWidget(null);
  };

  return (
    <div className="h-full bg-slate-800/50 p-2 sm:p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
        <h3 className="text-base sm:text-lg font-semibold text-white">Widget Library</h3>
        <div className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
          {totalWidgets} widgets
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3 mb-6">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search widgets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 pl-10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
            🔍
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {widgetCategories.map(category => (
              <option key={category.name} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Size Filter */}
          <select
            value={selectedSize || ''}
            onChange={(e) => setSelectedSize(e.target.value || null)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Sizes</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>

          {/* Clear Filters */}
          {(searchQuery || selectedCategory || selectedSize) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
                setSelectedSize(null);
              }}
              className="bg-slate-600 hover:bg-slate-500 border border-slate-500 rounded-lg px-3 py-1 text-sm text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-6">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">No widgets found</h3>
            <p className="text-slate-400 text-sm">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div key={category.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-slate-300 uppercase tracking-wide">
                  {category.name}
                </h4>
                <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded">
                  {category.widgets.length} widget{category.widgets.length !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">{category.description}</p>
              <div className="space-y-2">
                {category.widgets.map((widget) => (
                <div
                  key={widget.name}
                  className="group relative bg-slate-800 border border-slate-700 rounded-lg cursor-grab active:cursor-grabbing hover:bg-slate-700 hover:border-slate-600 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 hover:scale-[1.02] active:scale-95"
                  draggable
                  onDragStart={(e) => handleDragStart(e, widget.name, widget)}
                  onDragEnd={handleDragEnd}
                  onClick={() => handleWidgetClick(widget)}
                  title={`Drag to canvas or click to add ${widget.name}`}
                >
                  <div className="p-3">
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 ${widget.color} rounded-lg flex items-center justify-center text-white shrink-0 shadow-lg`}>
                        {(() => {
                          const IconComponent = widgetIcons[widget.name as keyof typeof widgetIcons];
                          return IconComponent ? <IconComponent className="w-6 h-6" /> : <span className="text-lg">{widget.icon}</span>;
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">
                            {widget.name}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              widget.size === 'small' ? 'bg-green-900 text-green-300' :
                              widget.size === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                              'bg-red-900 text-red-300'
                            }`}>
                              {widget.size}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400 mb-2 leading-relaxed">
                          {widget.description}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {widget.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                          {widget.tags.length > 3 && (
                            <span className="text-xs text-slate-500">
                              +{widget.tags.length - 3} more
                            </span>
                          )}
                        </div>
                        {/* Widget Preview Thumbnail */}
                        <div className="mt-2 p-2 bg-slate-900/50 rounded border border-slate-600">
                          <div className="text-xs text-slate-500 mb-1">Preview:</div>
                          <div className={`w-full h-16 ${widget.color} rounded flex items-center justify-center text-white text-xs font-medium`}>
                            {(() => {
                              const IconComponent = widgetIcons[widget.name as keyof typeof widgetIcons];
                              return IconComponent ? <IconComponent className="w-4 h-4" /> : <span className="text-sm">{widget.icon}</span>;
                            })()}
                            <span className="ml-2 text-xs">{widget.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced drag indicator */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:scale-110">
                    <div className="bg-slate-600/80 text-slate-300 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm flex items-center space-x-1">
                      <span>⋮⋮</span>
                      <span className="hidden sm:inline">Drag</span>
                    </div>
                  </div>
                  
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                       style={{ 
                         background: `linear-gradient(135deg, ${widget.color.replace('bg-', 'rgba(')}0.1, transparent)`,
                         boxShadow: `0 0 20px ${widget.color.replace('bg-', 'rgba(')}0.2`
                       }} />
                  
                  {/* Click indicator */}
                  <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-slate-700/90 text-slate-300 px-2 py-1 rounded text-xs backdrop-blur-sm">
                      Click to add
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
        )}
      </div>
      
      <div className="mt-8 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
        <div className="text-sm text-slate-400 text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <span>💡</span>
            <span className="font-medium">Quick Tips</span>
          </div>
          <div className="text-xs leading-relaxed space-y-1">
            <div>• Drag widgets to the canvas for precise placement</div>
            <div>• Click to add widgets to the center</div>
            <div>• Use search and filters to find specific widgets</div>
            <div>• Widget size indicators help with layout planning</div>
            <div>• Select widgets to configure properties</div>
          </div>
        </div>
      </div>

      {/* Static Widget Size Selection Modal */}
      <StaticWidgetSizeModal
        isOpen={showSizeModal}
        onClose={handleCloseModal}
        widgetId="static-weather"
        widgetName={selectedStaticWidget || ''}
        onSizeSelect={handleSizeSelect}
      />
    </div>
  );
}
