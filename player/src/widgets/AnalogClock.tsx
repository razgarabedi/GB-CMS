import React from 'react';
import './AnalogClock.css';

interface AnalogClockProps {
  timezone: string;
  size: 'small' | 'medium' | 'large';
}

const AnalogClock: React.FC<AnalogClockProps> = ({ timezone, size }) => {
  return (
    <div className={`analog-clock ${size}`}>
      <div className="clock-face">
        <div className="hand hour-hand"></div>
        <div className="hand minute-hand"></div>
        <div className="hand second-hand"></div>
      </div>
      <p>Timezone: {timezone}</p>
    </div>
  );
};

export default AnalogClock;
