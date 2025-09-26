import React from 'react';
import './WeatherWidget.css';

interface WeatherWidgetProps {
  location: string;
  showClock: boolean;
  showAnimatedBg: boolean;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ location, showClock, showAnimatedBg }) => {
  return (
    <div className={`weather-widget ${showAnimatedBg ? 'animated-bg' : ''}`}>
      <h3>Weather in {location}</h3>
      <p>Temperature: 25°C</p>
      <p>Condition: Sunny</p>
      {showClock && <p>Clock: 12:00 PM</p>}
    </div>
  );
};

export default WeatherWidget;
