import React from 'react';
import './DigitalClock.css';

interface DigitalClockProps {
  timezone: string;
  type: '12-hour' | '24-hour';
  size: 'small' | 'medium' | 'large';
}

const DigitalClock: React.FC<DigitalClockProps> = ({ timezone, type, size }) => {
  const getTime = () => {
    const date = new Date();
    return type === '12-hour' ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className={`digital-clock ${size}`}>
      <p>{getTime()}</p>
      <p>Timezone: {timezone}</p>
    </div>
  );
};

export default DigitalClock;
