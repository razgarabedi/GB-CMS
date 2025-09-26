/**
 * Admin API Hook
 * 
 * React hook for managing API state and operations in the admin interface
 */

import { useState, useEffect, useCallback } from 'react';
import { AdminAPI } from '../services/AdminAPI';

// ============================================================================
// COMPONENT LIBRARY HOOK
// ============================================================================

export function useComponentLibrary() {
  const [components, setComponents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComponents = useCallback(async () => {
    console.log('🔄 Loading components...');
    try {
      setLoading(true);
      setError(null);
      console.log('📡 Calling AdminAPI.components.getAll()');
      const data = await AdminAPI.components.getAll();
      console.log('✅ Components loaded successfully:', data);
      setComponents(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load components';
      console.error('❌ Failed to load components:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log('🏁 Component loading finished');
    }
  }, []);

  const saveComponent = useCallback(async (component: any) => {
    console.log('💾 Saving component:', component);
    try {
      console.log('📡 Calling AdminAPI.components.save()');
      const saved = await AdminAPI.components.save(component);
      console.log('✅ Component saved successfully:', saved);
      setComponents(prev => {
        const existing = prev.find(c => c.id === component.id);
        if (existing) {
          console.log('🔄 Updating existing component in state');
          return prev.map(c => c.id === component.id ? saved : c);
        } else {
          console.log('➕ Adding new component to state');
          return [...prev, saved];
        }
      });
      return saved;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save component';
      console.error('❌ Failed to save component:', err);
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteComponent = useCallback(async (id: string) => {
    try {
      await AdminAPI.components.delete(id);
      setComponents(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete component');
      throw err;
    }
  }, []);

  useEffect(() => {
    loadComponents();
  }, [loadComponents]);

  return {
    components,
    loading,
    error,
    loadComponents,
    saveComponent,
    deleteComponent,
  };
}

// ============================================================================
// TEMPLATE MANAGEMENT HOOK
// ============================================================================

export function useTemplateManager() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    console.log('🔄 Loading templates...');
    try {
      setLoading(true);
      setError(null);
      console.log('📡 Calling AdminAPI.templates.getAll()');
      const data = await AdminAPI.templates.getAll();
      console.log('✅ Templates loaded successfully:', data);
      setTemplates(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load templates';
      console.error('❌ Failed to load templates:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log('🏁 Template loading finished');
    }
  }, []);

  const saveTemplate = useCallback(async (template: any) => {
    try {
      const saved = await AdminAPI.templates.save(template);
      setTemplates(prev => {
        const existing = prev.find(t => t.id === template.id);
        if (existing) {
          return prev.map(t => t.id === template.id ? saved : t);
        } else {
          return [...prev, saved];
        }
      });
      return saved;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template');
      throw err;
    }
  }, []);

  const deleteTemplate = useCallback(async (id: string) => {
    try {
      await AdminAPI.templates.delete(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
      throw err;
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return {
    templates,
    loading,
    error,
    loadTemplates,
    saveTemplate,
    deleteTemplate,
  };
}

// ============================================================================
// PLUGIN MANAGEMENT HOOK
// ============================================================================

export function usePluginManager() {
  const [plugins, setPlugins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlugins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AdminAPI.plugins.getAll();
      setPlugins(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plugins');
    } finally {
      setLoading(false);
    }
  }, []);

  const installPlugin = useCallback(async (id: string) => {
    try {
      const updated = await AdminAPI.plugins.install(id);
      setPlugins(prev => prev.map(p => p.id === id ? updated : p));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to install plugin');
      throw err;
    }
  }, []);

  const uninstallPlugin = useCallback(async (id: string) => {
    try {
      const updated = await AdminAPI.plugins.uninstall(id);
      setPlugins(prev => prev.map(p => p.id === id ? updated : p));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to uninstall plugin');
      throw err;
    }
  }, []);

  useEffect(() => {
    loadPlugins();
  }, [loadPlugins]);

  return {
    plugins,
    loading,
    error,
    loadPlugins,
    installPlugin,
    uninstallPlugin,
  };
}

// ============================================================================
// LAYOUT MANAGEMENT HOOK
// ============================================================================

export function useLayoutManager() {
  const [layouts, setLayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLayouts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AdminAPI.layouts.getAll();
      setLayouts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load layouts');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveLayout = useCallback(async (layout: any) => {
    try {
      const saved = await AdminAPI.layouts.save(layout);
      setLayouts(prev => {
        const existing = prev.find(l => l.id === layout.id);
        if (existing) {
          return prev.map(l => l.id === layout.id ? saved : l);
        } else {
          return [...prev, saved];
        }
      });
      return saved;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save layout');
      throw err;
    }
  }, []);

  const deleteLayout = useCallback(async (id: string) => {
    try {
      await AdminAPI.layouts.delete(id);
      setLayouts(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete layout');
      throw err;
    }
  }, []);

  useEffect(() => {
    loadLayouts();
  }, [loadLayouts]);

  return {
    layouts,
    loading,
    error,
    loadLayouts,
    saveLayout,
    deleteLayout,
  };
}

// ============================================================================
// CONFIGURATION MANAGEMENT HOOK
// ============================================================================

export function useConfigManager() {
  const [configs, setConfigs] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfigs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AdminAPI.configs.getAll();
      setConfigs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configurations');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveConfig = useCallback(async (screenId: string, config: any) => {
    try {
      const saved = await AdminAPI.configs.save(screenId, config);
      setConfigs(prev => ({
        ...prev,
        [screenId]: saved,
      }));
      return saved;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
      throw err;
    }
  }, []);

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  return {
    configs,
    loading,
    error,
    loadConfigs,
    saveConfig,
  };
}

// ============================================================================
// ANALYTICS HOOK
// ============================================================================

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [analyticsData, healthData] = await Promise.all([
        AdminAPI.analytics.getAnalytics(),
        AdminAPI.analytics.getHealth(),
      ]);
      setAnalytics(analyticsData);
      setHealth(healthData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return {
    analytics,
    health,
    loading,
    error,
    loadAnalytics,
  };
}
