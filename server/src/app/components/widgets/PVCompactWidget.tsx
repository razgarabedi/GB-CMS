'use client';

import { useEffect, useState } from 'react';

interface PVCompactWidgetProps {
  location?: string;
  theme?: 'light' | 'dark';
  token?: string;
  showDetails?: boolean;
}

interface PVData {
  currentPower: number;
  dailyEnergy: number;
  totalEnergy: number;
  efficiency: number;
  status: 'active' | 'inactive' | 'maintenance';
}

export default function PVCompactWidget({
  location = 'Solar Array #1',
  theme = 'dark',
  token = 'demo-token',
  showDetails = true
}: PVCompactWidgetProps) {
  const [pvData, setPvData] = useState<PVData>({
    currentPower: 0,
    dailyEnergy: 0,
    totalEnergy: 0,
    efficiency: 0,
    status: 'inactive'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching PV data
    const fetchPVData = () => {
      setIsLoading(true);
      setTimeout(() => {
        // Simulate realistic solar data
        const hour = new Date().getHours();
        const isDaytime = hour >= 6 && hour <= 18;
        
        setPvData({
          currentPower: isDaytime ? Math.floor(Math.random() * 5000) + 1000 : 0,
          dailyEnergy: Math.floor(Math.random() * 25) + 15,
          totalEnergy: Math.floor(Math.random() * 10000) + 50000,
          efficiency: isDaytime ? Math.floor(Math.random() * 20) + 80 : 0,
          status: isDaytime ? 'active' : 'inactive'
        });
        setIsLoading(false);
      }, 1000);
    };

    fetchPVData();
    const interval = setInterval(fetchPVData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [token]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'inactive': return 'text-slate-400';
      case 'maintenance': return 'text-yellow-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🟢';
      case 'inactive': return '🔴';
      case 'maintenance': return '🟡';
      default: return '⚪';
    }
  };

  if (isLoading) {
    return (
      <div className="pv-compact-widget h-full w-full flex items-center justify-center bg-slate-800 rounded-lg">
        <div className="text-center text-slate-400">
          <div className="animate-spin text-2xl mb-2">☀️</div>
          <div className="text-sm">Loading solar data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pv-compact-widget h-full w-full bg-slate-800 rounded-lg overflow-hidden">
      <div className="h-full flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">☀️</span>
            <div>
              <h3 className="font-medium text-white text-sm">{location}</h3>
              <div className="flex items-center space-x-1 text-xs">
                <span>{getStatusIcon(pvData.status)}</span>
                <span className={getStatusColor(pvData.status)}>
                  {pvData.status.charAt(0).toUpperCase() + pvData.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Efficiency</div>
            <div className="text-sm font-medium text-white">{pvData.efficiency}%</div>
          </div>
        </div>

        {/* Main metrics */}
        <div className="flex-1 flex flex-col justify-center space-y-3">
          {/* Current Power */}
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {(pvData.currentPower / 1000).toFixed(1)} kW
            </div>
            <div className="text-xs text-slate-400">Current Power</div>
          </div>

          {showDetails && (
            <div className="grid grid-cols-2 gap-3 text-center">
              {/* Daily Energy */}
              <div className="bg-slate-700/50 rounded p-2">
                <div className="text-lg font-semibold text-blue-400">
                  {pvData.dailyEnergy} kWh
                </div>
                <div className="text-xs text-slate-400">Today</div>
              </div>

              {/* Total Energy */}
              <div className="bg-slate-700/50 rounded p-2">
                <div className="text-lg font-semibold text-green-400">
                  {(pvData.totalEnergy / 1000).toFixed(0)} MWh
                </div>
                <div className="text-xs text-slate-400">Total</div>
              </div>
            </div>
          )}
        </div>

        {/* Power indicator bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Power Output</span>
            <span>{pvData.currentPower}W</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((pvData.currentPower / 6000) * 100, 100)}%`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
