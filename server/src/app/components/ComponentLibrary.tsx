'use client';

import { useRef, useEffect } from 'react';

interface ComponentLibraryProps {
  onWidgetAdd: (componentName: string) => void;
}

export default function ComponentLibrary({ onWidgetAdd }: ComponentLibraryProps) {
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dragElementRef = useRef<HTMLElement | null>(null);
  
  const widgetCategories = [
    {
      name: 'Content Widgets',
      widgets: [
        { name: 'Weather', icon: '🌤️', description: 'Weather information with location and animations', color: 'bg-blue-600' },
        { name: 'Clock', icon: '🕐', description: 'Digital or analog clock display', color: 'bg-green-600' },
        { name: 'News', icon: '📰', description: 'Live news feed from various sources', color: 'bg-red-600' },
        { name: 'Slideshow', icon: '🖼️', description: 'Image carousel with transitions', color: 'bg-purple-600' }
      ]
    },
    {
      name: 'Interactive Widgets',
      widgets: [
        { name: 'Web Viewer', icon: '🌐', description: 'Embed web content and pages', color: 'bg-indigo-600' },
        { name: 'PV Compact', icon: '📊', description: 'Compact data visualization', color: 'bg-cyan-600' },
        { name: 'PV Flow', icon: '📈', description: 'Flowing data presentation', color: 'bg-teal-600' }
      ]
    },
    {
      name: 'Custom Widgets',
      widgets: [
        { name: 'Custom', icon: '🔧', description: 'Build your own custom widget', color: 'bg-gray-600' }
      ]
    }
  ];

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

  return (
    <div className="h-full bg-slate-800/50 p-2 sm:p-4 overflow-y-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
        <h3 className="text-base sm:text-lg font-semibold text-white">Widget Library</h3>
        <div className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
          {widgetCategories.reduce((total, cat) => total + cat.widgets.length, 0)} widgets
        </div>
      </div>
      
      <div className="space-y-6">
        {widgetCategories.map((category) => (
          <div key={category.name} className="space-y-3">
            <h4 className="text-sm font-medium text-slate-300 uppercase tracking-wide">
              {category.name}
            </h4>
            <div className="space-y-2">
              {category.widgets.map((widget) => (
                <div
                  key={widget.name}
                  className="group relative bg-slate-800 border border-slate-700 rounded-lg cursor-grab active:cursor-grabbing hover:bg-slate-700 hover:border-slate-600 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 hover:scale-[1.02] active:scale-95"
                  draggable
                  onDragStart={(e) => handleDragStart(e, widget.name, widget)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onWidgetAdd(widget.name)}
                  title={`Drag to canvas or click to add ${widget.name}`}
                >
                  <div className="p-2 sm:p-3">
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 ${widget.color} rounded-lg flex items-center justify-center text-white text-base sm:text-lg shrink-0`}>
                        {widget.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm sm:text-base font-medium text-white group-hover:text-blue-300 transition-colors">
                          {widget.name}
                        </div>
                        <div className="text-xs text-slate-400 mt-1 leading-relaxed hidden sm:block">
                          {widget.description}
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
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
        <div className="text-sm text-slate-400 text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <span>💡</span>
            <span className="font-medium">Quick Tips</span>
          </div>
          <div className="text-xs leading-relaxed">
            • Drag widgets to the canvas for precise placement<br />
            • Click to add widgets to the center<br />
            • Select widgets to configure properties
          </div>
        </div>
      </div>
    </div>
  );
}
