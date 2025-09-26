'use client';

import { useState } from 'react';

interface WebViewerWidgetProps {
  url?: string;
  refreshInterval?: number;
  showControls?: boolean;
}

export default function WebViewerWidget({
  url = 'https://example.com',
  refreshInterval = 60000,
  showControls = true
}: WebViewerWidgetProps) {
  const [currentUrl, setCurrentUrl] = useState(url);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [key, setKey] = useState(0); // Force iframe reload

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    setKey(prev => prev + 1);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  if (!isValidUrl(currentUrl)) {
    return (
      <div className="web-viewer-widget h-full w-full flex items-center justify-center bg-slate-800 rounded-lg">
        <div className="text-center text-slate-400 p-4">
          <div className="text-2xl mb-2">🌐</div>
          <div className="text-sm mb-2">Invalid URL</div>
          <div className="text-xs text-slate-500">Please provide a valid web address</div>
        </div>
      </div>
    );
  }

  return (
    <div className="web-viewer-widget h-full w-full relative bg-slate-800 rounded-lg overflow-hidden group">
      {/* Controls */}
      {showControls && (
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex space-x-2">
            <button
              onClick={handleRefresh}
              className="w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded flex items-center justify-center transition-colors text-xs"
              title="Refresh"
            >
              🔄
            </button>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-800 flex items-center justify-center z-20">
          <div className="text-center text-slate-400">
            <div className="animate-spin text-2xl mb-2">🌐</div>
            <div className="text-sm">Loading webpage...</div>
            <div className="text-xs text-slate-500 mt-1">{currentUrl}</div>
          </div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-slate-800 flex items-center justify-center z-20">
          <div className="text-center text-slate-400 p-4">
            <div className="text-2xl mb-2">⚠️</div>
            <div className="text-sm mb-2">Failed to load webpage</div>
            <div className="text-xs text-slate-500 mb-3">{currentUrl}</div>
            <button
              onClick={handleRefresh}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* URL display */}
      <div className="absolute bottom-2 left-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-black/50 text-white px-2 py-1 rounded text-xs truncate">
          {currentUrl}
        </div>
      </div>

      {/* Iframe */}
      <iframe
        key={key}
        src={currentUrl}
        className="w-full h-full border-0"
        onLoad={handleLoad}
        onError={handleError}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        title="Web Content"
      />
    </div>
  );
}
