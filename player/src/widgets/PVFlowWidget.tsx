import React from 'react';
import './PVFlowWidget.css';

interface PVFlowWidgetProps {
  token: string;
  theme: 'light' | 'dark';
}

const PVFlowWidget: React.FC<PVFlowWidgetProps> = ({ token, theme }) => {
  return (
    <div className={`pv-flow-widget ${theme}`}>
      <h3>Flowing Content</h3>
      <p>Token: {token}</p>
    </div>
  );
};

export default PVFlowWidget;
