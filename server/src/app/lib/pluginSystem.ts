// Plugin System Core
// This module handles plugin loading, registration, and lifecycle management

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: string;
  main: string;
  dependencies: string[];
  permissions: string[];
  api_version: string;
  min_gb_cms_version: string;
}

export interface PluginAPI {
  // Core API methods available to plugins
  registerWidget: (widgetConfig: WidgetConfig) => void;
  registerDataSource: (dataSourceConfig: DataSourceConfig) => void;
  registerTheme: (themeConfig: ThemeConfig) => void;
  getConfig: (key: string) => any;
  setConfig: (key: string, value: any) => void;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (data?: any) => void) => void;
  off: (event: string, callback: (data?: any) => void) => void;
  http: {
    get: (url: string, options?: RequestInit) => Promise<Response>;
    post: (url: string, data: any, options?: RequestInit) => Promise<Response>;
    put: (url: string, data: any, options?: RequestInit) => Promise<Response>;
    delete: (url: string, options?: RequestInit) => Promise<Response>;
  };
  storage: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<void>;
    remove: (key: string) => Promise<void>;
    clear: () => Promise<void>;
  };
  ui: {
    showNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
    showModal: (content: React.ReactNode, options?: ModalOptions) => void;
    closeModal: () => void;
  };
}

export interface WidgetConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  component: React.ComponentType<any>;
  defaultProps: Record<string, any>;
  propertySchema: PropertySchema[];
  category: string;
  tags: string[];
}

export interface DataSourceConfig {
  id: string;
  name: string;
  description: string;
  configSchema: PropertySchema[];
  fetchData: (config: any) => Promise<any>;
  refreshInterval?: number;
}

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  colors: Record<string, string>;
  fonts: Record<string, string>;
  styles: Record<string, any>;
}

export interface PropertySchema {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'color' | 'file' | 'json';
  required?: boolean;
  default?: any;
  options?: Array<{ label: string; value: any }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface ModalOptions {
  title?: string;
  width?: string;
  height?: string;
  closable?: boolean;
}

export interface LoadedPlugin {
  manifest: PluginManifest;
  instance: any;
  isEnabled: boolean;
  api: PluginAPI;
}

class PluginSystemCore {
  private plugins: Map<string, LoadedPlugin> = new Map();
  private eventEmitter = new EventTarget();
  private widgetRegistry: Map<string, WidgetConfig> = new Map();
  private dataSourceRegistry: Map<string, DataSourceConfig> = new Map();
  private themeRegistry: Map<string, ThemeConfig> = new Map();

  constructor() {
    this.initializeAPI();
  }

  private initializeAPI() {
    // Initialize core API methods
  }

  // Plugin Loading and Management
  async loadPlugin(pluginCode: string, manifest: PluginManifest): Promise<boolean> {
    try {
      // Validate plugin manifest
      if (!this.validateManifest(manifest)) {
        throw new Error('Invalid plugin manifest');
      }

      // Check version compatibility
      if (!this.isVersionCompatible(manifest.min_gb_cms_version)) {
        throw new Error('Plugin requires newer version of GB-CMS');
      }

      // Create plugin sandbox
      const api = this.createPluginAPI(manifest.id);
      
      // Load plugin code in sandbox
      const pluginInstance = await this.executePluginCode(pluginCode, api, manifest);

      // Register plugin
      this.plugins.set(manifest.id, {
        manifest,
        instance: pluginInstance,
        isEnabled: true,
        api
      });

      // Initialize plugin
      if (pluginInstance.init) {
        await pluginInstance.init(api);
      }

      this.emit('plugin:loaded', { pluginId: manifest.id });
      return true;
    } catch (error) {
      console.error(`Failed to load plugin ${manifest.id}:`, error);
      return false;
    }
  }

  async unloadPlugin(pluginId: string): Promise<boolean> {
    try {
      const plugin = this.plugins.get(pluginId);
      if (!plugin) return false;

      // Cleanup plugin resources
      if (plugin.instance.cleanup) {
        await plugin.instance.cleanup();
      }

      // Remove registered components
      this.cleanupPluginComponents(pluginId);

      // Remove plugin
      this.plugins.delete(pluginId);

      this.emit('plugin:unloaded', { pluginId });
      return true;
    } catch (error) {
      console.error(`Failed to unload plugin ${pluginId}:`, error);
      return false;
    }
  }

  enablePlugin(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    plugin.isEnabled = true;
    this.emit('plugin:enabled', { pluginId });
    return true;
  }

  disablePlugin(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    plugin.isEnabled = false;
    this.emit('plugin:disabled', { pluginId });
    return true;
  }

  // Plugin API Creation
  private createPluginAPI(pluginId: string): PluginAPI {
    return {
      registerWidget: (config: WidgetConfig) => {
        config.id = `${pluginId}:${config.id}`;
        this.widgetRegistry.set(config.id, config);
        this.emit('widget:registered', config);
      },

      registerDataSource: (config: DataSourceConfig) => {
        config.id = `${pluginId}:${config.id}`;
        this.dataSourceRegistry.set(config.id, config);
        this.emit('datasource:registered', config);
      },

      registerTheme: (config: ThemeConfig) => {
        config.id = `${pluginId}:${config.id}`;
        this.themeRegistry.set(config.id, config);
        this.emit('theme:registered', config);
      },

      getConfig: (key: string) => {
        return this.getPluginConfig(pluginId, key);
      },

      setConfig: (key: string, value: any) => {
        this.setPluginConfig(pluginId, key, value);
      },

      emit: (event: string, data?: any) => {
        this.emit(`plugin:${pluginId}:${event}`, data);
      },

      on: (event: string, callback: (data?: any) => void) => {
        this.on(`plugin:${pluginId}:${event}`, callback);
      },

      off: (event: string, callback: (data?: any) => void) => {
        this.off(`plugin:${pluginId}:${event}`, callback);
      },

      http: {
        get: async (url: string, options?: RequestInit) => {
          return this.secureHttpRequest('GET', url, undefined, options, pluginId);
        },
        post: async (url: string, data: any, options?: RequestInit) => {
          return this.secureHttpRequest('POST', url, data, options, pluginId);
        },
        put: async (url: string, data: any, options?: RequestInit) => {
          return this.secureHttpRequest('PUT', url, data, options, pluginId);
        },
        delete: async (url: string, options?: RequestInit) => {
          return this.secureHttpRequest('DELETE', url, undefined, options, pluginId);
        }
      },

      storage: {
        get: async (key: string) => {
          return this.getPluginStorage(pluginId, key);
        },
        set: async (key: string, value: any) => {
          await this.setPluginStorage(pluginId, key, value);
        },
        remove: async (key: string) => {
          await this.removePluginStorage(pluginId, key);
        },
        clear: async () => {
          await this.clearPluginStorage(pluginId);
        }
      },

      ui: {
        showNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error') => {
          this.emit('ui:notification', { message, type, pluginId });
        },
        showModal: (content: React.ReactNode, options?: ModalOptions) => {
          this.emit('ui:modal:show', { content, options, pluginId });
        },
        closeModal: () => {
          this.emit('ui:modal:close', { pluginId });
        }
      }
    };
  }

  // Plugin Code Execution
  private async executePluginCode(code: string, api: PluginAPI, manifest: PluginManifest): Promise<any> {
    // Create secure execution context
    const context = {
      console: {
        log: (...args: any[]) => console.log(`[${manifest.id}]`, ...args),
        error: (...args: any[]) => console.error(`[${manifest.id}]`, ...args),
        warn: (...args: any[]) => console.warn(`[${manifest.id}]`, ...args)
      },
      api,
      React: (await import('react')),
      exports: {},
      module: { exports: {} }
    };

    // Execute plugin code
    const func = new Function(...Object.keys(context), code);
    func(...Object.values(context));

    return context.module.exports || context.exports;
  }

  // Validation and Security
  private validateManifest(manifest: PluginManifest): boolean {
    const required = ['id', 'name', 'version', 'main', 'api_version'];
    return required.every(field => manifest[field as keyof PluginManifest]);
  }

  private isVersionCompatible(minVersion: string): boolean {
    // Simple version comparison - in production, use proper semver
    const currentVersion = '1.0.0'; // GB-CMS version
    return minVersion <= currentVersion;
  }

  // Plugin Storage
  private async getPluginStorage(pluginId: string, key: string): Promise<any> {
    const storageKey = `plugin:${pluginId}:${key}`;
    const value = localStorage.getItem(storageKey);
    return value ? JSON.parse(value) : null;
  }

  private async setPluginStorage(pluginId: string, key: string, value: any): Promise<void> {
    const storageKey = `plugin:${pluginId}:${key}`;
    localStorage.setItem(storageKey, JSON.stringify(value));
  }

  private async removePluginStorage(pluginId: string, key: string): Promise<void> {
    const storageKey = `plugin:${pluginId}:${key}`;
    localStorage.removeItem(storageKey);
  }

  private async clearPluginStorage(pluginId: string): Promise<void> {
    const prefix = `plugin:${pluginId}:`;
    const keys = Object.keys(localStorage).filter(key => key.startsWith(prefix));
    keys.forEach(key => localStorage.removeItem(key));
  }

  // Plugin Configuration
  private getPluginConfig(pluginId: string, key: string): any {
    const configKey = `plugin-config:${pluginId}:${key}`;
    const value = localStorage.getItem(configKey);
    return value ? JSON.parse(value) : null;
  }

  private setPluginConfig(pluginId: string, key: string, value: any): void {
    const configKey = `plugin-config:${pluginId}:${key}`;
    localStorage.setItem(configKey, JSON.stringify(value));
  }

  // Secure HTTP Requests
  private async secureHttpRequest(
    method: string,
    url: string,
    data?: any,
    options?: RequestInit,
    pluginId?: string
  ): Promise<Response> {
    // Implement security checks and request filtering
    const allowedDomains = this.getAllowedDomains(pluginId);
    const urlObj = new URL(url);
    
    if (!allowedDomains.includes('*') && !allowedDomains.includes(urlObj.hostname)) {
      throw new Error(`Plugin ${pluginId} is not allowed to access ${urlObj.hostname}`);
    }

    const requestOptions: RequestInit = {
      method,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      requestOptions.body = JSON.stringify(data);
    }

    return fetch(url, requestOptions);
  }

  private getAllowedDomains(pluginId?: string): string[] {
    // Return allowed domains for plugin - implement based on plugin permissions
    return ['*']; // Allow all for now - implement proper security
  }

  // Component Cleanup
  private cleanupPluginComponents(pluginId: string): void {
    // Remove widgets
    for (const [id, widget] of this.widgetRegistry.entries()) {
      if (id.startsWith(`${pluginId}:`)) {
        this.widgetRegistry.delete(id);
        this.emit('widget:unregistered', { id });
      }
    }

    // Remove data sources
    for (const [id, dataSource] of this.dataSourceRegistry.entries()) {
      if (id.startsWith(`${pluginId}:`)) {
        this.dataSourceRegistry.delete(id);
        this.emit('datasource:unregistered', { id });
      }
    }

    // Remove themes
    for (const [id, theme] of this.themeRegistry.entries()) {
      if (id.startsWith(`${pluginId}:`)) {
        this.themeRegistry.delete(id);
        this.emit('theme:unregistered', { id });
      }
    }
  }

  // Event System
  private emit(event: string, data?: any): void {
    this.eventEmitter.dispatchEvent(new CustomEvent(event, { detail: data }));
  }

  private on(event: string, callback: (data?: any) => void): void {
    this.eventEmitter.addEventListener(event, (e) => {
      callback((e as CustomEvent).detail);
    });
  }

  private off(event: string, callback: (data?: any) => void): void {
    this.eventEmitter.removeEventListener(event, callback as EventListener);
  }

  // Public API
  getLoadedPlugins(): LoadedPlugin[] {
    return Array.from(this.plugins.values());
  }

  getEnabledPlugins(): LoadedPlugin[] {
    return Array.from(this.plugins.values()).filter(p => p.isEnabled);
  }

  getRegisteredWidgets(): WidgetConfig[] {
    return Array.from(this.widgetRegistry.values());
  }

  getRegisteredDataSources(): DataSourceConfig[] {
    return Array.from(this.dataSourceRegistry.values());
  }

  getRegisteredThemes(): ThemeConfig[] {
    return Array.from(this.themeRegistry.values());
  }

  isPluginLoaded(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  isPluginEnabled(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId);
    return plugin ? plugin.isEnabled : false;
  }
}

// Singleton instance
export const pluginSystem = new PluginSystemCore();

// Hook for React components
export function usePluginSystem() {
  return {
    loadPlugin: pluginSystem.loadPlugin.bind(pluginSystem),
    unloadPlugin: pluginSystem.unloadPlugin.bind(pluginSystem),
    enablePlugin: pluginSystem.enablePlugin.bind(pluginSystem),
    disablePlugin: pluginSystem.disablePlugin.bind(pluginSystem),
    getLoadedPlugins: pluginSystem.getLoadedPlugins.bind(pluginSystem),
    getEnabledPlugins: pluginSystem.getEnabledPlugins.bind(pluginSystem),
    getRegisteredWidgets: pluginSystem.getRegisteredWidgets.bind(pluginSystem),
    isPluginLoaded: pluginSystem.isPluginLoaded.bind(pluginSystem),
    isPluginEnabled: pluginSystem.isPluginEnabled.bind(pluginSystem),
    on: pluginSystem.on.bind(pluginSystem),
    off: pluginSystem.off.bind(pluginSystem)
  };
}
