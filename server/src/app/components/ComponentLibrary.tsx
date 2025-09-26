'use client';

interface ComponentLibraryProps {
  onWidgetAdd: (componentName: string) => void;
}

export default function ComponentLibrary({ onWidgetAdd }: ComponentLibraryProps) {
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

  const handleDragStart = (e: React.DragEvent, componentName: string) => {
    e.dataTransfer.setData('text/plain', `new-${componentName}`);
    e.dataTransfer.effectAllowed = 'copy';
    
    // Create a custom drag image
    const dragImage = document.createElement('div');
    dragImage.className = 'drag-preview';
    dragImage.style.cssText = `
      position: absolute;
      top: -1000px;
      background: rgb(59, 130, 246);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    dragImage.textContent = `+ ${componentName}`;
    document.body.appendChild(dragImage);
    
    e.dataTransfer.setDragImage(dragImage, 50, 25);
    
    // Clean up drag image after drag starts
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  return (
    <div className="h-full bg-slate-800/50 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Widget Library</h3>
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
                  className="group relative bg-slate-800 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-700 hover:border-slate-600 transition-all duration-200"
                  draggable
                  onDragStart={(e) => handleDragStart(e, widget.name)}
                  onClick={() => onWidgetAdd(widget.name)}
                  title={`Drag to canvas or click to add ${widget.name}`}
                >
                  <div className="p-3">
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 ${widget.color} rounded-lg flex items-center justify-center text-white text-lg shrink-0`}>
                        {widget.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white group-hover:text-blue-300 transition-colors">
                          {widget.name}
                        </div>
                        <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {widget.description}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Drag indicator */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-slate-400 text-xs">
                      ⋮⋮
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
