/**
 * Plugin Manager
 * High-level plugin management interface with store integration
 */

import type {
  PluginManager as IPluginManager,
  PluginManifest,
  PluginInstallResult,
  PluginUninstallResult,
  PluginActivateResult,
  PluginDeactivateResult,
  PluginUpdateResult,
  PluginListOptions,
  PluginSearchOptions,
  PluginValidationResult,
  PluginTestResult,
  PluginAnalytics
} from '../types/PluginTypes'
import { PluginRegistry } from './PluginRegistry'
import { PluginStore } from './PluginStore'
import { PluginValidator } from './PluginValidator'
import { PluginSandbox } from './PluginSandbox'

export class PluginManager implements IPluginManager {
  private registry: PluginRegistry
  private store: PluginStore
  private validator: PluginValidator
  private sandbox: PluginSandbox

  constructor() {
    this.registry = new PluginRegistry()
    this.store = new PluginStore()
    this.validator = new PluginValidator()
    this.sandbox = new PluginSandbox()
  }

  // ============================================================================
  // PLUGIN MANAGEMENT
  // ============================================================================

  /**
   * Install plugin
   */
  async install(plugin: PluginManifest): Promise<PluginInstallResult> {
    try {
      // Validate plugin
      const validation = await this.validatePlugin(plugin)
      if (!validation.valid) {
        return {
          success: false,
          pluginId: plugin.metadata.id,
          message: 'Plugin validation failed',
          errors: validation.errors.map(e => e.message)
        }
      }

      // Install plugin in registry
      const result = await this.registry.install(plugin)
      
      if (result.success) {
        // Update store analytics
        await this.store.updatePluginAnalytics(plugin.metadata.id, {
          installations: 1
        })
      }

      return result
    } catch (error) {
      return {
        success: false,
        pluginId: plugin.metadata.id,
        message: 'Installation failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  /**
   * Uninstall plugin
   */
  async uninstall(pluginId: string): Promise<PluginUninstallResult> {
    try {
      const result = await this.registry.uninstall(pluginId)
      
      if (result.success) {
        // Update store analytics
        await this.store.updatePluginAnalytics(pluginId, {
          uninstalls: 1
        })
      }

      return result
    } catch (error) {
      return {
        success: false,
        pluginId,
        message: 'Uninstallation failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  /**
   * Activate plugin
   */
  async activate(pluginId: string): Promise<PluginActivateResult> {
    try {
      const result = await this.registry.activate(pluginId)
      
      if (result.success) {
        // Update store analytics
        await this.store.updatePluginAnalytics(pluginId, {
          activations: 1
        })
      }

      return result
    } catch (error) {
      return {
        success: false,
        pluginId,
        message: 'Activation failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  /**
   * Deactivate plugin
   */
  async deactivate(pluginId: string): Promise<PluginDeactivateResult> {
    try {
      const result = await this.registry.deactivate(pluginId)
      
      if (result.success) {
        // Update store analytics
        await this.store.updatePluginAnalytics(pluginId, {
          deactivations: 1
        })
      }

      return result
    } catch (error) {
      return {
        success: false,
        pluginId,
        message: 'Deactivation failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  /**
   * Update plugin
   */
  async update(pluginId: string, version: string): Promise<PluginUpdateResult> {
    try {
      const result = await this.registry.update(pluginId, version)
      
      if (result.success) {
        // Update store analytics
        await this.store.updatePluginAnalytics(pluginId, {
          updates: 1
        })
      }

      return result
    } catch (error) {
      return {
        success: false,
        pluginId,
        oldVersion: '',
        newVersion: version,
        message: 'Update failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  /**
   * Get plugin
   */
  async getPlugin(pluginId: string): Promise<PluginManifest | null> {
    return this.registry.getPlugin(pluginId)
  }

  /**
   * List plugins
   */
  async listPlugins(options?: PluginListOptions): Promise<PluginManifest[]> {
    return this.registry.listPlugins(options)
  }

  /**
   * Search plugins
   */
  async searchPlugins(query: string, options?: PluginSearchOptions): Promise<PluginManifest[]> {
    return this.registry.searchPlugins(query, options)
  }

  /**
   * Validate plugin
   */
  async validatePlugin(plugin: PluginManifest): Promise<PluginValidationResult> {
    return this.validator.validateManifest(plugin)
  }

  /**
   * Test plugin
   */
  async testPlugin(pluginId: string): Promise<PluginTestResult> {
    return this.registry.testPlugin(pluginId)
  }

  /**
   * Get plugin analytics
   */
  async getPluginAnalytics(pluginId: string): Promise<PluginAnalytics> {
    return this.registry.getPluginAnalytics(pluginId)
  }

  // ============================================================================
  // STORE INTEGRATION
  // ============================================================================

  /**
   * Browse store plugins
   */
  async browseStorePlugins(options?: any): Promise<any[]> {
    return this.store.browsePlugins(options)
  }

  /**
   * Search store plugins
   */
  async searchStorePlugins(query: string, options?: any): Promise<any[]> {
    return this.store.searchPlugins(query, options)
  }

  /**
   * Get store plugin details
   */
  async getStorePluginDetails(pluginId: string): Promise<any> {
    return this.store.getPluginDetails(pluginId)
  }

  /**
   * Install plugin from store
   */
  async installFromStore(pluginId: string): Promise<any> {
    try {
      // Get plugin details from store
      const storePlugin = await this.store.getPluginDetails(pluginId)
      if (!storePlugin) {
        throw new Error('Plugin not found in store')
      }

      // Convert store plugin to manifest
      const manifest = await this.convertStorePluginToManifest(storePlugin)

      // Install plugin
      const result = await this.install(manifest)

      if (result.success) {
        // Update store analytics
        await this.store.updatePluginAnalytics(pluginId, {
          installations: 1
        })
      }

      return result
    } catch (error) {
      return {
        success: false,
        pluginId,
        message: 'Store installation failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  /**
   * Rate plugin in store
   */
  async ratePlugin(pluginId: string, rating: number, review?: string): Promise<void> {
    await this.store.ratePlugin(pluginId, rating, review)
  }

  /**
   * Get plugin reviews from store
   */
  async getPluginReviews(pluginId: string): Promise<any[]> {
    return this.store.getPluginReviews(pluginId)
  }

  /**
   * Get store plugin analytics
   */
  async getStorePluginAnalytics(pluginId: string): Promise<any> {
    return this.store.getPluginAnalytics(pluginId)
  }

  // ============================================================================
  // PLUGIN DEVELOPMENT
  // ============================================================================

  /**
   * Create plugin from template
   */
  async createPluginFromTemplate(templateId: string, config: any): Promise<PluginManifest> {
    // Implementation for creating plugin from template
    throw new Error('Not implemented')
  }

  /**
   * Validate plugin manifest
   */
  async validatePluginManifest(manifest: any): Promise<PluginValidationResult> {
    return this.validator.validateManifest(manifest)
  }

  /**
   * Test plugin in sandbox
   */
  async testPluginInSandbox(pluginId: string): Promise<any> {
    const sandbox = await this.sandbox.createSandbox(pluginId)
    const result = await this.sandbox.execute(sandbox.id, 'test()')
    await this.sandbox.destroySandbox(sandbox.id)
    return result
  }

  /**
   * Package plugin for distribution
   */
  async packagePlugin(pluginId: string): Promise<any> {
    // Implementation for plugin packaging
    throw new Error('Not implemented')
  }

  /**
   * Publish plugin to store
   */
  async publishPluginToStore(pluginId: string, storeConfig: any): Promise<any> {
    // Implementation for plugin publishing
    throw new Error('Not implemented')
  }

  // ============================================================================
  // PLUGIN MONITORING
  // ============================================================================

  /**
   * Get plugin health status
   */
  async getPluginHealth(pluginId: string): Promise<any> {
    const plugin = await this.getPlugin(pluginId)
    if (!plugin) {
      throw new Error('Plugin not found')
    }

    return this.registry.states.get(pluginId)?.health
  }

  /**
   * Get plugin metrics
   */
  async getPluginMetrics(pluginId: string): Promise<any> {
    const plugin = await this.getPlugin(pluginId)
    if (!plugin) {
      throw new Error('Plugin not found')
    }

    return this.registry.states.get(pluginId)?.metrics
  }

  /**
   * Get plugin errors
   */
  async getPluginErrors(pluginId: string): Promise<any[]> {
    const plugin = await this.getPlugin(pluginId)
    if (!plugin) {
      throw new Error('Plugin not found')
    }

    return this.registry.states.get(pluginId)?.errors || []
  }

  /**
   * Get plugin warnings
   */
  async getPluginWarnings(pluginId: string): Promise<any[]> {
    const plugin = await this.getPlugin(pluginId)
    if (!plugin) {
      throw new Error('Plugin not found')
    }

    return this.registry.states.get(pluginId)?.warnings || []
  }

  /**
   * Clear plugin errors
   */
  async clearPluginErrors(pluginId: string): Promise<void> {
    const state = this.registry.states.get(pluginId)
    if (state) {
      state.errors = []
      state.lastUpdated = new Date().toISOString()
      this.registry.states.set(pluginId, state)
    }
  }

  /**
   * Clear plugin warnings
   */
  async clearPluginWarnings(pluginId: string): Promise<void> {
    const state = this.registry.states.get(pluginId)
    if (state) {
      state.warnings = []
      state.lastUpdated = new Date().toISOString()
      this.registry.states.set(pluginId, state)
    }
  }

  // ============================================================================
  // PLUGIN EVENTS
  // ============================================================================

  /**
   * Subscribe to plugin events
   */
  onPluginEvent(event: string, callback: (data?: any) => void): () => void {
    return this.registry.events.on(event, callback)
  }

  /**
   * Emit plugin event
   */
  emitPluginEvent(event: string, data?: any): void {
    this.registry.events.emit(event, data)
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Convert store plugin to manifest
   */
  private async convertStorePluginToManifest(storePlugin: any): Promise<PluginManifest> {
    // Implementation for converting store plugin to manifest
    throw new Error('Not implemented')
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.registry.destroy()
    this.store.destroy()
    this.validator.destroy()
    this.sandbox.destroy()
  }
}
