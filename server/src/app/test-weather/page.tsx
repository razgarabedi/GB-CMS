'use client';

import WeatherWidget from '../components/widgets/WeatherWidget';

export default function TestWeatherPage() {
  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Weather Widget Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Test 1: Default New York */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Default (New York)</h2>
            <div className="h-64">
              <WeatherWidget />
            </div>
          </div>

          {/* Test 2: London */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-white mb-4">London</h2>
            <div className="h-64">
              <WeatherWidget location="London" />
            </div>
          </div>

          {/* Test 3: Tokyo with coordinates */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Tokyo (Coordinates)</h2>
            <div className="h-64">
              <WeatherWidget 
                location="Tokyo"
                latitude={35.6762}
                longitude={139.6503}
              />
            </div>
          </div>

          {/* Test 4: With details */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Paris with Details</h2>
            <div className="h-64">
              <WeatherWidget 
                location="Paris"
                showDetails={true}
                showClock={true}
              />
            </div>
          </div>

          {/* Test 5: Light theme */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Berlin (Light Theme)</h2>
            <div className="h-64">
              <WeatherWidget 
                location="Berlin"
                theme="light"
                showAnimatedBg={true}
              />
            </div>
          </div>

          {/* Test 6: Fast refresh */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Madrid (1 min refresh)</h2>
            <div className="h-64">
              <WeatherWidget 
                location="Madrid"
                refreshInterval={60000} // 1 minute
                showDetails={true}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-slate-800 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Debug Information</h2>
          <p className="text-slate-300 text-sm">
            Check the browser console for debug logs. The weather widget should:
          </p>
          <ul className="text-slate-300 text-sm mt-2 list-disc list-inside">
            <li>Show "Initializing..." briefly on first load</li>
            <li>Display real weather data from Open-Meteo API</li>
            <li>Show appropriate weather icons</li>
            <li>Update automatically based on refresh interval</li>
            <li>Handle errors gracefully</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
