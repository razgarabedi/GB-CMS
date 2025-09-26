'use client';

import { useState, useEffect } from 'react';

interface SaveScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (screenName: string, screenDescription: string) => void;
  currentLayout: any[];
  editingScreen?: any;
}

export default function SaveScreenModal({
  isOpen,
  onClose,
  onSave,
  currentLayout,
  editingScreen
}: SaveScreenModalProps) {
  const [screenName, setScreenName] = useState('');
  const [screenDescription, setScreenDescription] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editingScreen) {
        setScreenName(editingScreen.name || '');
        setScreenDescription(editingScreen.description || '');
      } else {
        setScreenName('');
        setScreenDescription('');
      }
    }
  }, [isOpen, editingScreen]);

  const handleSave = () => {
    if (!screenName.trim()) return;
    onSave(screenName.trim(), screenDescription.trim());
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && screenName.trim()) {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-white mb-4">
          {editingScreen ? `Update Screen: ${editingScreen.name}` : 'Save Screen'}
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
              onKeyDown={handleKeyDown}
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
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Enter screen description..."
              rows={3}
            />
          </div>

          <div className="bg-slate-700 rounded-lg p-3">
            <div className="text-sm text-slate-300 mb-2">Current Layout Preview:</div>
            <div className="text-xs text-slate-400">
              {currentLayout.length} widget{currentLayout.length !== 1 ? 's' : ''}
              {currentLayout.length > 0 && (
                <div className="mt-2 grid grid-cols-32 gap-1 h-16">
                  {currentLayout.slice(0, 6).map((item, index) => (
                    <div
                      key={index}
                      className="bg-blue-600/30 rounded-sm"
                      style={{
                        gridColumn: `span ${Math.min(item.w, 32)}`,
                        gridRow: `span ${Math.min(item.h, 3)}`
                      }}
                    />
                  ))}
                  {currentLayout.length > 6 && (
                    <div className="col-span-12 flex items-center justify-center text-xs text-slate-500">
                      +{currentLayout.length - 6} more widgets
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!screenName.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {editingScreen ? 'Update Screen' : 'Save Screen'}
          </button>
        </div>
      </div>
    </div>
  );
}
