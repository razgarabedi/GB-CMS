import React from 'react';
import './PVCompactWidget.css';

interface PVCompactWidgetProps {
  location: string;
  theme: 'light' | 'dark';
  token: string;
}

const PVCompactWidget: React.FC<PVCompactWidgetProps> = ({ location, theme, token }) => {
  return (
    <div className={`pv-compact-widget ${theme}`}>
      <h3>Compact View</h3>
      <p>Location: {location}</p>
      <p>Token: {token}</p>
    </div>
  );
};

export default PVCompactWidget;
