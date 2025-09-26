import React from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './CanvasEditor.css'; // Import custom styles

const CanvasEditor: React.FC = () => {
  const layout = [
    { i: 'a', x: 0, y: 0, w: 2, h: 2 },
    { i: 'b', x: 2, y: 0, w: 2, h: 2 },
    { i: 'c', x: 4, y: 0, w: 2, h: 2 }
  ];

  const onLayoutChange = (layout: any) => {
    console.log('Layout changed:', layout);
  };

  return (
    <div className="canvas-editor">
      <header className="header">
        <div className="logo">Logo</div>
        <div className="screen-selector">Screen Selector</div>
        <div className="controls">
          <button>Save</button>
          <button>Refresh</button>
        </div>
      </header>
      <main className="main-content">
        <aside className="component-library">
          <h3>Component Library</h3>
          <ul>
            <li>Weather</li>
            <li>Clock</li>
            <li>Slideshow</li>
            <li>News</li>
            <li>Web Viewer</li>
            <li>Custom Plugins</li>
          </ul>
        </aside>
        <section className="layout-canvas">
          <GridLayout 
            className="layout" 
            layout={layout} 
            cols={12} 
            rowHeight={30} 
            width={800}
            onLayoutChange={onLayoutChange}
          >
            {layout.map((item) => (
              <div key={item.i} className="grid-item">
                {item.i.toUpperCase()}
              </div>
            ))}
          </GridLayout>
        </section>
        <aside className="properties-panel">
          <h3>Properties Panel</h3>
          <div>Component Settings</div>
          <div>Theme Options</div>
          <div>Animation Settings</div>
        </aside>
      </main>
      <footer className="footer">
        <div>Template Management</div>
        <div>Plugin Store</div>
        <div>Help</div>
      </footer>
    </div>
  );
};

export default CanvasEditor;
