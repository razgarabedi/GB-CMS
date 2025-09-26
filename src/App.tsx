import React, { useState } from 'react';
import GridLayout from 'react-grid-layout';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const App: React.FC = () => {
  const [previewSize, setPreviewSize] = useState('desktop');

  const layout = [
    { i: 'a', x: 0, y: 0, w: 2, h: 2 },
    { i: 'b', x: 2, y: 0, w: 2, h: 2 },
    { i: 'c', x: 4, y: 0, w: 2, h: 2 }
  ];

  const onDragEnd = (result: any) => {
    // Logic to handle drag and drop result
  };

  const handleSave = () => {
    console.log('Layout saved');
  };

  const handlePreview = () => {
    console.log('Previewing layout');
  };

  const handleManage = () => {
    console.log('Managing layout');
  };

  const handlePreviewSizeChange = (size: string) => {
    setPreviewSize(size);
  };

  return (
    <div className="App">
      <div className="toolbar">
        <button onClick={handleSave}>Save</button>
        <button onClick={handlePreview}>Preview</button>
        <button onClick={handleManage}>Manage</button>
        <button onClick={() => handlePreviewSizeChange('desktop')}>Desktop</button>
        <button onClick={() => handlePreviewSizeChange('tablet')}>Tablet</button>
        <button onClick={() => handlePreviewSizeChange('mobile')}>Mobile</button>
      </div>
      <div className={`preview-window ${previewSize}`}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                <GridLayout className="layout" layout={layout} cols={12} rowHeight={30} width={1200}>
                  <Draggable key="a" draggableId="a" index={0}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="grid-item">
                        A
                      </div>
                    )}
                  </Draggable>
                  <Draggable key="b" draggableId="b" index={1}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="grid-item">
                        B
                      </div>
                    )}
                  </Draggable>
                  <Draggable key="c" draggableId="c" index={2}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="grid-item">
                        C
                      </div>
                    )}
                  </Draggable>
                </GridLayout>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

export default App;
