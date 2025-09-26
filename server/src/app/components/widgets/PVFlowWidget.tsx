'use client';

import { useEffect, useState } from 'react';

interface PVFlowWidgetProps {
  token?: string;
  theme?: 'light' | 'dark';
  showAnimation?: boolean;
}

interface FlowData {
  solarGeneration: number;
  batteryLevel: number;
  gridConsumption: number;
  homeConsumption: number;
  flowDirection: {
    solarToBattery: boolean;
    solarToHome: boolean;
    solarToGrid: boolean;
    batteryToHome: boolean;
    gridToHome: boolean;
  };
}

export default function PVFlowWidget({
  token = 'demo-token',
  theme = 'dark',
  showAnimation = true
}: PVFlowWidgetProps) {
  const [flowData, setFlowData] = useState<FlowData>({
    solarGeneration: 0,
    batteryLevel: 0,
    gridConsumption: 0,
    homeConsumption: 0,
    flowDirection: {
      solarToBattery: false,
      solarToHome: false,
      solarToGrid: false,
      batteryToHome: false,
      gridToHome: false
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFlowData = () => {
      setIsLoading(true);
      setTimeout(() => {
        const hour = new Date().getHours();
        const isDaytime = hour >= 6 && hour <= 18;
        
        const solarGen = isDaytime ? Math.floor(Math.random() * 4000) + 1000 : 0;
        const homeConsump = Math.floor(Math.random() * 2000) + 800;
        const batteryLvl = Math.floor(Math.random() * 100);
        
        setFlowData({
          solarGeneration: solarGen,
          batteryLevel: batteryLvl,
          gridConsumption: Math.max(0, homeConsump - solarGen),
          homeConsumption: homeConsump,
          flowDirection: {
            solarToBattery: solarGen > homeConsump && batteryLvl < 95,
            solarToHome: solarGen > 0,
            solarToGrid: solarGen > homeConsump && batteryLvl > 95,
            batteryToHome: solarGen < homeConsump && batteryLvl > 20,
            gridToHome: solarGen + (batteryLvl > 20 ? 1000 : 0) < homeConsump
          }
        });
        setIsLoading(false);
      }, 1000);
    };

    fetchFlowData();
    const interval = setInterval(fetchFlowData, 15000);
    return () => clearInterval(interval);
  }, [token]);

  const FlowLine = ({ from, to, active, power }: { 
    from: string; 
    to: string; 
    active: boolean; 
    power?: number;
  }) => (
    <div className={`flow-line ${active ? 'active' : ''} ${showAnimation ? 'animated' : ''}`}>
      <div className="flow-indicator">
        {active && power && (
          <div className="power-label">
            {power > 1000 ? `${(power/1000).toFixed(1)}kW` : `${power}W`}
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="pv-flow-widget h-full w-full flex items-center justify-center bg-slate-800 rounded-lg">
        <div className="text-center text-slate-400">
          <div className="animate-spin text-2xl mb-2">🔄</div>
          <div className="text-sm">Loading energy flow...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pv-flow-widget h-full w-full bg-slate-800 rounded-lg overflow-hidden p-4">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-white text-sm">Energy Flow</h3>
          <div className="text-xs text-slate-400">
            Live Data
          </div>
        </div>

        {/* Flow diagram */}
        <div className="flex-1 relative">
          <svg className="w-full h-full" viewBox="0 0 300 200">
            {/* Solar Panel */}
            <g>
              <rect x="10" y="10" width="60" height="40" rx="5" fill="rgb(59, 130, 246)" />
              <text x="40" y="25" textAnchor="middle" fill="white" fontSize="8">☀️</text>
              <text x="40" y="35" textAnchor="middle" fill="white" fontSize="6">Solar</text>
              <text x="40" y="55" textAnchor="middle" fill="rgb(148, 163, 184)" fontSize="8">
                {(flowData.solarGeneration/1000).toFixed(1)}kW
              </text>
            </g>

            {/* Battery */}
            <g>
              <rect x="10" y="80" width="60" height="40" rx="5" fill="rgb(34, 197, 94)" />
              <text x="40" y="95" textAnchor="middle" fill="white" fontSize="8">🔋</text>
              <text x="40" y="105" textAnchor="middle" fill="white" fontSize="6">Battery</text>
              <text x="40" y="135" textAnchor="middle" fill="rgb(148, 163, 184)" fontSize="8">
                {flowData.batteryLevel}%
              </text>
            </g>

            {/* Home */}
            <g>
              <rect x="120" y="80" width="60" height="40" rx="5" fill="rgb(168, 85, 247)" />
              <text x="150" y="95" textAnchor="middle" fill="white" fontSize="8">🏠</text>
              <text x="150" y="105" textAnchor="middle" fill="white" fontSize="6">Home</text>
              <text x="150" y="135" textAnchor="middle" fill="rgb(148, 163, 184)" fontSize="8">
                {(flowData.homeConsumption/1000).toFixed(1)}kW
              </text>
            </g>

            {/* Grid */}
            <g>
              <rect x="230" y="80" width="60" height="40" rx="5" fill="rgb(239, 68, 68)" />
              <text x="260" y="95" textAnchor="middle" fill="white" fontSize="8">⚡</text>
              <text x="260" y="105" textAnchor="middle" fill="white" fontSize="6">Grid</text>
              <text x="260" y="135" textAnchor="middle" fill="rgb(148, 163, 184)" fontSize="8">
                {(flowData.gridConsumption/1000).toFixed(1)}kW
              </text>
            </g>

            {/* Flow lines */}
            {/* Solar to Home */}
            {flowData.flowDirection.solarToHome && (
              <g>
                <line x1="70" y1="30" x2="120" y2="100" stroke="rgb(34, 197, 94)" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <circle cx="95" cy="65" r="2" fill="rgb(34, 197, 94)">
                  {showAnimation && <animate attributeName="r" values="2;4;2" dur="1s" repeatCount="indefinite" />}
                </circle>
              </g>
            )}

            {/* Solar to Battery */}
            {flowData.flowDirection.solarToBattery && (
              <g>
                <line x1="40" y1="50" x2="40" y2="80" stroke="rgb(34, 197, 94)" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <circle cx="40" cy="65" r="2" fill="rgb(34, 197, 94)">
                  {showAnimation && <animate attributeName="r" values="2;4;2" dur="1s" repeatCount="indefinite" />}
                </circle>
              </g>
            )}

            {/* Battery to Home */}
            {flowData.flowDirection.batteryToHome && (
              <g>
                <line x1="70" y1="100" x2="120" y2="100" stroke="rgb(34, 197, 94)" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <circle cx="95" cy="100" r="2" fill="rgb(34, 197, 94)">
                  {showAnimation && <animate attributeName="r" values="2;4;2" dur="1s" repeatCount="indefinite" />}
                </circle>
              </g>
            )}

            {/* Grid to Home */}
            {flowData.flowDirection.gridToHome && (
              <g>
                <line x1="230" y1="100" x2="180" y2="100" stroke="rgb(239, 68, 68)" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <circle cx="205" cy="100" r="2" fill="rgb(239, 68, 68)">
                  {showAnimation && <animate attributeName="r" values="2;4;2" dur="1s" repeatCount="indefinite" />}
                </circle>
              </g>
            )}

            {/* Solar to Grid */}
            {flowData.flowDirection.solarToGrid && (
              <g>
                <line x1="70" y1="30" x2="230" y2="100" stroke="rgb(34, 197, 94)" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <circle cx="150" cy="65" r="2" fill="rgb(34, 197, 94)">
                  {showAnimation && <animate attributeName="r" values="2;4;2" dur="1s" repeatCount="indefinite" />}
                </circle>
              </g>
            )}

            {/* Arrow marker definition */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
              </marker>
            </defs>
          </svg>
        </div>

        {/* Status indicators */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-slate-300">Generating</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${flowData.batteryLevel > 50 ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
            <span className="text-slate-300">Battery OK</span>
          </div>
        </div>
      </div>
    </div>
  );
}
