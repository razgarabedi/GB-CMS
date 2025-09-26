/**
 * Enhanced Admin Interface Component
 * 
 * The main interface that combines all enhanced UI components into a
 * comprehensive digital signage management system.
 */

import React, { useState, useCallback, useEffect } from 'react';
import type { 
  AdminInterface, 
  AdminTab,
  ComponentLibrary as ComponentLibraryType,
  // LayoutCanvas as LayoutCanvasType,
  PropertiesPanel as PropertiesPanelType,
  TemplateManager as TemplateManagerType,
  PluginManagerUI as PluginManagerUIType,
  PreviewSystem as PreviewSystemType,
  Notification
} from '../types/UITypes';

// Import all the enhanced components
import { ComponentLibrary } from './ComponentLibrary';
import { PropertiesPanel } from './PropertiesPanel';
import { TemplateManager } from './TemplateManager';
import { PluginManagerUI } from './PluginManagerUI';
import { PreviewSystem } from './PreviewSystem';

interface EnhancedAdminInterfaceProps {
  adminInterface: AdminInterface;
  onInterfaceChange: (adminInterface: AdminInterface) => void;
  onSave: () => void;
  onLoad: () => void;
  className?: string;
}

export const EnhancedAdminInterface: React.FC<EnhancedAdminInterfaceProps> = ({
  adminInterface,
  onInterfaceChange,
  onSave,
  onLoad,
  className = ''
}) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>(adminInterface.currentTab);
  const [isFullscreen, setIsFullscreen] = useState(adminInterface.isFullscreen);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);

  // Handle tab change
  const handleTabChange = useCallback((tab: AdminTab) => {
    setCurrentTab(tab);
    onInterfaceChange({
      ...adminInterface,
      currentTab: tab
    });
  }, [adminInterface, onInterfaceChange]);

  // Handle save
  const handleSave = useCallback(() => {
    onSave();
    onInterfaceChange({
      ...adminInterface,
      lastSaved: new Date(),
      isDirty: false
    });
    
    // Show notification
    const notification: Notification = {
      id: `save-${Date.now()}`,
      type: 'success',
      title: 'Saved',
      message: 'Configuration saved successfully',
      timestamp: new Date(),
      duration: 3000,
      isRead: false
    };
    
    onInterfaceChange({
      ...adminInterface,
      notifications: [...adminInterface.notifications, notification]
    });
  }, [adminInterface, onInterfaceChange, onSave]);

  // Handle load
  const handleLoad = useCallback(() => {
    onLoad();
    onInterfaceChange({
      ...adminInterface,
      isDirty: false
    });
  }, [adminInterface, onInterfaceChange, onLoad]);

  // Handle fullscreen toggle
  const handleFullscreenToggle = useCallback(() => {
    const newFullscreen = !isFullscreen;
    setIsFullscreen(newFullscreen);
    onInterfaceChange({
      ...adminInterface,
      isFullscreen: newFullscreen
    });
  }, [isFullscreen, adminInterface, onInterfaceChange]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for keyboard shortcuts
      const shortcut = adminInterface.shortcuts.find(s => 
        s.key === e.key &&
        s.ctrl === e.ctrlKey &&
        s.shift === e.shiftKey &&
        s.alt === e.altKey
      );
      
      if (shortcut) {
        e.preventDefault();
        switch (shortcut.action) {
          case 'save':
            handleSave();
            break;
          case 'load':
            handleLoad();
            break;
          case 'fullscreen':
            handleFullscreenToggle();
            break;
          case 'help':
            setShowHelp(!showHelp);
            break;
          case 'design':
            handleTabChange('design');
            break;
          case 'preview':
            handleTabChange('preview');
            break;
          case 'templates':
            handleTabChange('templates');
            break;
          case 'plugins':
            handleTabChange('plugins');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [adminInterface.shortcuts, handleSave, handleLoad, handleFullscreenToggle, handleTabChange, showHelp]);

  // Auto-save functionality
  useEffect(() => {
    if (adminInterface.autoSave && adminInterface.isDirty) {
      const interval = setInterval(() => {
        handleSave();
      }, adminInterface.autoSaveInterval);
      
      return () => clearInterval(interval);
    }
  }, [adminInterface.autoSave, adminInterface.isDirty, adminInterface.autoSaveInterval, handleSave]);

  // Render header
  const renderHeader = () => {
    return (
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-lg font-bold text-white">Digital Signage Admin</h1>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">Screen:</span>
              <select
                value={adminInterface.currentScreen || ''}
                onChange={(e) => onInterfaceChange({
                  ...adminInterface,
                  currentScreen: e.target.value
                })}
                className="px-2 py-1 bg-gray-900 border border-gray-600 rounded text-white text-xs"
              >
                <option value="">Select Screen</option>
                <option value="screen1">Screen 1</option>
                <option value="screen2">Screen 2</option>
                <option value="screen3">Screen 3</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Save Status */}
            <div className="flex items-center space-x-2">
              {adminInterface.isDirty && (
                <div className="flex items-center space-x-1 text-yellow-400">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-sm">Unsaved changes</span>
                </div>
              )}
              {adminInterface.lastSaved && (
                <span className="text-xs text-gray-400">
                  Last saved: {adminInterface.lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
            
            {/* Actions */}
            <button
              onClick={handleLoad}
              className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Load
            </button>
            <button
              onClick={handleSave}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleFullscreenToggle}
              className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              {isFullscreen ? 'Exit' : 'Fullscreen'}
            </button>
          </div>
        </div>
      </header>
    );
  };

  // Render navigation tabs
  const renderNavigation = () => {
    const tabs = [
      { id: 'design' as AdminTab, label: 'Design', icon: '🎨' },
      { id: 'components' as AdminTab, label: 'Components', icon: '🧩' },
      { id: 'templates' as AdminTab, label: 'Templates', icon: '📋' },
      { id: 'plugins' as AdminTab, label: 'Plugins', icon: '🔌' },
      { id: 'preview' as AdminTab, label: 'Preview', icon: '👁️' },
      { id: 'settings' as AdminTab, label: 'Settings', icon: '⚙️' },
      { id: 'help' as AdminTab, label: 'Help', icon: '❓' }
    ];

    return (
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="flex items-center justify-between px-4 py-1">
          <div className="flex space-x-0.5 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center space-x-1 px-2 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                  currentTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span className="text-xs">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 19.5L9 15l4.5 4.5L9 24l-4.5-4.5z" />
              </svg>
              {adminInterface.notifications.filter(n => !n.isRead).length > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              )}
            </button>
            
            {/* Help */}
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    );
  };

  // Render main content
  const renderMainContent = () => {
    switch (currentTab) {
      case 'design':
        return (
          <div className="flex h-full">
            {/* Left Sidebar - Component Library */}
            {showLeftSidebar && (
              <div className="w-64 lg:w-80 border-r border-gray-700">
                <div className="flex items-center justify-between p-2 border-b border-gray-700">
                  <h3 className="text-sm font-medium text-white">Components</h3>
                  <button
                    onClick={() => setShowLeftSidebar(false)}
                    className="text-gray-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>
                <ComponentLibrary
                  library={adminInterface.componentLibrary}
                  onLibraryChange={(library: ComponentLibraryType) => onInterfaceChange({
                    ...adminInterface,
                    componentLibrary: library
                  })}
                  onDragStart={() => {}}
                  onDragEnd={() => {}}
                />
              </div>
            )}
            
            {/* Main Canvas Area */}
            <div className="flex-1 flex flex-col">
              {/* Canvas Toolbar */}
              <div className="flex items-center justify-between p-2 border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  {!showLeftSidebar && (
                    <button
                      onClick={() => setShowLeftSidebar(true)}
                      className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Components
                    </button>
                  )}
                  <span className="text-xs text-gray-400">Canvas</span>
                </div>
                <div className="flex items-center space-x-2">
                  {!showRightSidebar && (
                    <button
                      onClick={() => setShowRightSidebar(true)}
                      className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Properties
                    </button>
                  )}
                </div>
              </div>
              
                      {/* Canvas */}
                      <div className="flex-1 bg-gray-800 border border-gray-600 rounded-lg m-2">
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-white mb-4">Layout Canvas</h3>
                          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 min-h-96 flex items-center justify-center">
                            <div className="text-center text-gray-400">
                              <div className="text-4xl mb-4">🎨</div>
                              <p className="text-lg mb-2">Drag components here to build your layout</p>
                              <p className="text-sm">Use the Components panel to add widgets</p>
                            </div>
                          </div>
                        </div>
                      </div>
            </div>
            
            {/* Right Sidebar - Properties Panel */}
            {showRightSidebar && (
              <div className="w-64 lg:w-80 border-l border-gray-700">
                <div className="flex items-center justify-between p-2 border-b border-gray-700">
                  <h3 className="text-sm font-medium text-white">Properties</h3>
                  <button
                    onClick={() => setShowRightSidebar(false)}
                    className="text-gray-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>
                <PropertiesPanel
                  panel={adminInterface.propertiesPanel}
                  onPanelChange={(panel: PropertiesPanelType) => onInterfaceChange({
                    ...adminInterface,
                    propertiesPanel: panel
                  })}
                  onFieldChange={() => {}}
                  onValidation={() => {}}
                />
              </div>
            )}
          </div>
        );
        
              case 'components':
                return (
                  <div className="h-full p-2">
                    <div className="max-w-6xl mx-auto">
                      <h2 className="text-lg font-bold text-white mb-3">Component Library</h2>
                      <div className="bg-gray-800 border border-gray-700 rounded-lg">
                        <ComponentLibrary
                          library={adminInterface.componentLibrary}
                          onLibraryChange={(library: ComponentLibraryType) => onInterfaceChange({
                            ...adminInterface,
                            componentLibrary: library
                          })}
                          onDragStart={() => {}}
                          onDragEnd={() => {}}
                        />
                      </div>
                    </div>
                  </div>
                );
        
      case 'templates':
        return (
          <div className="h-full p-2">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-lg font-bold text-white mb-3">Template Manager</h2>
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <TemplateManager
                  manager={adminInterface.templateManager}
                  onManagerChange={(manager: TemplateManagerType) => onInterfaceChange({
                    ...adminInterface,
                    templateManager: manager
                  })}
                  onTemplateSelect={() => {}}
                  onTemplateCreate={() => {}}
                  onTemplateSave={() => {}}
                  onTemplateDelete={() => {}}
                  onTemplateExport={() => {}}
                  onTemplateImport={() => {}}
                  onTemplateLoad={() => {}}
                />
              </div>
            </div>
          </div>
        );
        
      case 'plugins':
        return (
          <div className="h-full p-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6">Plugin Manager</h2>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <PluginManagerUI
                  manager={adminInterface.pluginManager}
                  onManagerChange={(manager: PluginManagerUIType) => onInterfaceChange({
                    ...adminInterface,
                    pluginManager: manager
                  })}
                  onPluginInstall={() => {}}
                  onPluginUninstall={() => {}}
                  onPluginEnable={() => {}}
                  onPluginDisable={() => {}}
                  onPluginUpdate={() => {}}
                  onPluginConfigure={() => {}}
                />
              </div>
            </div>
          </div>
        );
        
      case 'preview':
        return (
          <div className="h-full p-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6">Preview System</h2>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <PreviewSystem
                  system={adminInterface.previewSystem}
                  onSystemChange={(system: PreviewSystemType) => onInterfaceChange({
                    ...adminInterface,
                    previewSystem: system
                  })}
                  onConfigChange={() => {}}
                />
              </div>
            </div>
          </div>
        );
        
      case 'settings':
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
              
              <div className="space-y-6">
                {/* General Settings */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">General</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Language</label>
                      <select
                        value={adminInterface.language}
                        onChange={(e) => onInterfaceChange({
                          ...adminInterface,
                          language: e.target.value
                        })}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                      >
                        <option value="en">English</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={adminInterface.autoSave}
                          onChange={(e) => onInterfaceChange({
                            ...adminInterface,
                            autoSave: e.target.checked
                          })}
                          className="mr-2"
                        />
                        <span className="text-sm text-white">Auto-save</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Theme Settings */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Theme</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Theme Mode</label>
                      <select
                        value={adminInterface.theme.mode}
                        onChange={(e) => onInterfaceChange({
                          ...adminInterface,
                          theme: {
                            ...adminInterface.theme,
                            mode: e.target.value as 'light' | 'dark'
                          }
                        })}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                      >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'help':
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6">Help & Documentation</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Keyboard Shortcuts</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {adminInterface.shortcuts.map(shortcut => (
                      <div key={shortcut.key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">{shortcut.description}</span>
                        <kbd className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                          {shortcut.ctrl && 'Ctrl+'}
                          {shortcut.shift && 'Shift+'}
                          {shortcut.alt && 'Alt+'}
                          {shortcut.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Getting Started</h3>
                  <div className="space-y-4 text-sm text-gray-300">
                    <p>Welcome to the Enhanced Digital Signage Admin Interface!</p>
                    <p>This interface provides a comprehensive set of tools for designing and managing your digital signage displays.</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Use the <strong>Design</strong> tab to create layouts with drag-and-drop</li>
                      <li>Browse and install components in the <strong>Components</strong> tab</li>
                      <li>Save and load templates in the <strong>Templates</strong> tab</li>
                      <li>Install and manage plugins in the <strong>Plugins</strong> tab</li>
                      <li>Preview your designs in real-time in the <strong>Preview</strong> tab</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="h-full p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
                <div className="text-4xl mb-6">🎯</div>
                <h2 className="text-2xl font-bold text-white mb-4">Welcome to Digital Signage Admin</h2>
                <p className="text-lg text-gray-300 mb-6">Select a tab from the navigation above to get started</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-xl mb-2">🎨</div>
                    <div className="font-semibold text-white">Design</div>
                    <div className="text-gray-400">Create layouts</div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-xl mb-2">🧩</div>
                    <div className="font-semibold text-white">Components</div>
                    <div className="text-gray-400">Manage widgets</div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-xl mb-2">📋</div>
                    <div className="font-semibold text-white">Templates</div>
                    <div className="text-gray-400">Save layouts</div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-xl mb-2">🔌</div>
                    <div className="font-semibold text-white">Plugins</div>
                    <div className="text-gray-400">Add features</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  // Render notifications panel
  const renderNotifications = () => {
    if (!showNotifications) return null;

    return (
      <div className="absolute top-16 right-4 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">Notifications</h3>
            <button
              onClick={() => setShowNotifications(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          {adminInterface.notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            adminInterface.notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 border-b border-gray-700 last:border-b-0 ${
                  notification.type === 'error' ? 'bg-red-900 bg-opacity-20' :
                  notification.type === 'warning' ? 'bg-yellow-900 bg-opacity-20' :
                  notification.type === 'success' ? 'bg-green-900 bg-opacity-20' :
                  'bg-blue-900 bg-opacity-20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-white">{notification.title}</h4>
                    <p className="text-xs text-gray-300 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    onClick={() => onInterfaceChange({
                      ...adminInterface,
                      notifications: adminInterface.notifications.filter(n => n.id !== notification.id)
                    })}
                    className="text-gray-400 hover:text-white ml-2"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-gray-900 text-white flex flex-col h-full ${className}`}>
      {renderHeader()}
      {renderNavigation()}
      <main className="flex-1 overflow-hidden">
        {renderMainContent()}
      </main>
      {renderNotifications()}
    </div>
  );
};

export default EnhancedAdminInterface;
