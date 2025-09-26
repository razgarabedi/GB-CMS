'use client';

import { useState, useEffect } from 'react';

export interface Screen {
  id: string;
  name: string;
  description?: string;
  layout: any[];
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}

interface ScreenManagerProps {
  currentLayout: any[];
  screens: Screen[];
  onLoadScreen: (screen: Screen) => void;
  onSaveScreen: (screen: Screen) => void;
  onDeleteScreen: (screenId: string) => void;
}

export default function ScreenManager({
  currentLayout,
  screens,
  onLoadScreen,
  onSaveScreen,
  onDeleteScreen
}: ScreenManagerProps) {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [editingScreen, setEditingScreen] = useState<Screen | null>(null);
  const [screenName, setScreenName] = useState('');
  const [screenDescription, setScreenDescription] = useState('');

  const handleSaveScreen = () => {
    if (!screenName.trim()) return;

    const now = new Date().toISOString();
    const newScreen: Screen = {
      id: editingScreen?.id || `screen-${Date.now()}`,
      name: screenName.trim(),
      description: screenDescription.trim() || undefined,
      layout: [...currentLayout],
      createdAt: editingScreen?.createdAt || now,
      updatedAt: now,
      isActive: editingScreen?.isActive || false
    };

    onSaveScreen(newScreen);
    setShowSaveModal(false);
    setEditingScreen(null);
    setScreenName('');
    setScreenDescription('');
  };

  const handleLoadScreen = (screen: Screen) => {
    onLoadScreen(screen);
    setShowLoadModal(false);
  };

  const handleDeleteScreen = (screenId: string) => {
    if (window.confirm('Are you sure you want to delete this screen?')) {
      onDeleteScreen(screenId);
    }
  };

  const handleEditScreen = (screen: Screen) => {
    setEditingScreen(screen);
    setScreenName(screen.name);
    setScreenDescription(screen.description || '');
    setShowSaveModal(true);
  };

  const openSaveModal = () => {
    setEditingScreen(null);
    setScreenName('');
    setScreenDescription('');
    setShowSaveModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Screen Management</h2>
          <p className="text-slate-400 mt-1">Save and manage your digital signage screens</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowLoadModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <span>📂</span>
            <span>Load Screen</span>
          </button>
          <button
            onClick={openSaveModal}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <span>💾</span>
            <span>Save Screen</span>
          </button>
        </div>
      </div>

      {/* Screens Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {screens.map((screen) => (
          <div
            key={screen.id}
            className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">{screen.name}</h3>
                {screen.description && (
                  <p className="text-sm text-slate-400 mb-2">{screen.description}</p>
                )}
                <div className="flex items-center space-x-4 text-xs text-slate-500">
                  <span>{screen.layout.length} widgets</span>
                  <span>•</span>
                  <span>{new Date(screen.updatedAt).toLocaleDateString()}</span>
                  {screen.isActive && (
                    <>
                      <span>•</span>
                      <span className="text-green-400 font-medium">Active</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleLoadScreen(screen)}
                  className="p-1.5 text-blue-400 hover:bg-blue-900/20 rounded transition-colors duration-150"
                  title="Load screen"
                >
                  📂
                </button>
                <div className="relative group">
                  <button
                    onClick={() => window.open(`/kiosk?screen=${screen.id}`, '_blank')}
                    className="p-1.5 text-green-400 hover:bg-green-900/20 rounded transition-colors duration-150"
                    title="Play in kiosk mode"
                  >
                    ▶️
                  </button>
                  {/* Dropdown menu for different kiosk modes */}
                  <div className="absolute right-0 top-8 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 min-w-[200px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    <button
                      onClick={() => window.open(`/kiosk?screen=${screen.id}`, '_blank')}
                      className="w-full px-3 py-2 text-left text-sm text-white hover:bg-slate-700 transition-colors duration-150 flex items-center space-x-2"
                    >
                      <span>📺</span>
                      <span>Kiosk Mode</span>
                    </button>
                    <button
                      onClick={() => window.open(`/kiosk/preview?screen=${screen.id}`, '_blank')}
                      className="w-full px-3 py-2 text-left text-sm text-white hover:bg-slate-700 transition-colors duration-150 flex items-center space-x-2"
                    >
                      <span>👁️</span>
                      <span>Preview Mode</span>
                    </button>
                    <button
                      onClick={() => window.open(`/kiosk/screen/${screen.name.toLowerCase().replace(/\s+/g, '-')}`, '_blank')}
                      className="w-full px-3 py-2 text-left text-sm text-white hover:bg-slate-700 transition-colors duration-150 flex items-center space-x-2"
                    >
                      <span>🔗</span>
                      <span>By Name URL</span>
                    </button>
                    <div className="h-px bg-slate-600 my-1"></div>
                    <button
                      onClick={() => window.open('/kiosk/rotate', '_blank')}
                      className="w-full px-3 py-2 text-left text-sm text-white hover:bg-slate-700 transition-colors duration-150 flex items-center space-x-2"
                    >
                      <span>🔄</span>
                      <span>Auto Rotate All</span>
                    </button>
                    <button
                      onClick={() => window.open('/kiosk/preview?rotate=true', '_blank')}
                      className="w-full px-3 py-2 text-left text-sm text-white hover:bg-slate-700 transition-colors duration-150 flex items-center space-x-2"
                    >
                      <span>🔄</span>
                      <span>Preview Rotate</span>
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => handleEditScreen(screen)}
                  className="p-1.5 text-yellow-400 hover:bg-yellow-900/20 rounded transition-colors duration-150"
                  title="Edit screen"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteScreen(screen.id)}
                  className="p-1.5 text-red-400 hover:bg-red-900/20 rounded transition-colors duration-150"
                  title="Delete screen"
                >
                  🗑️
                </button>
              </div>
            </div>
            
            {/* Screen Preview */}
            <div className="bg-slate-900 rounded border border-slate-700 p-2 h-24 overflow-hidden">
              <div className="grid grid-cols-12 gap-1 h-full">
                {screen.layout.slice(0, 6).map((item, index) => (
                  <div
                    key={index}
                    className="bg-blue-600/30 rounded-sm"
                    style={{
                      gridColumn: `span ${Math.min(item.w, 12)}`,
                      gridRow: `span ${Math.min(item.h, 3)}`
                    }}
                  />
                ))}
                {screen.layout.length > 6 && (
                  <div className="col-span-12 flex items-center justify-center text-xs text-slate-500">
                    +{screen.layout.length - 6} more widgets
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {screens.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-4xl mb-4">📺</div>
            <h3 className="text-lg font-medium text-white mb-2">No screens saved yet</h3>
            <p className="text-slate-400 mb-4">Create your first screen layout and save it to get started</p>
            <button
              onClick={openSaveModal}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              Save Current Layout
            </button>
          </div>
        )}
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingScreen ? 'Edit Screen' : 'Save Screen'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Screen Name *
                </label>
                <input
                  type="text"
                  value={screenName}
                  onChange={(e) => setScreenName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter screen name..."
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={screenDescription}
                  onChange={(e) => setScreenDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Enter screen description..."
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveScreen}
                disabled={!screenName.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {editingScreen ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Load Screen</h3>
            
            {screens.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📺</div>
                <p className="text-slate-400">No screens available to load</p>
              </div>
            ) : (
              <div className="space-y-3">
                {screens.map((screen) => (
                  <div
                    key={screen.id}
                    className="flex items-center justify-between p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors duration-200"
                  >
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{screen.name}</h4>
                      {screen.description && (
                        <p className="text-sm text-slate-400">{screen.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1">
                        <span>{screen.layout.length} widgets</span>
                        <span>•</span>
                        <span>Updated {new Date(screen.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleLoadScreen(screen)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => {
                          window.open(`/kiosk?screen=${screen.id}`, '_blank');
                          setShowLoadModal(false);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                      >
                        Play
                      </button>
                      <button
                        onClick={() => {
                          window.open(`/kiosk/screen/${screen.name.toLowerCase().replace(/\s+/g, '-')}`, '_blank');
                          setShowLoadModal(false);
                        }}
                        className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm"
                        title="Play by name URL"
                      >
                        🔗
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowLoadModal(false)}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
