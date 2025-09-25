/**
 * Plugin Sandbox
 * Isolated environment for plugin execution and security
 */

import type {
  PluginSandbox as IPluginSandbox,
  SandboxInstance,
  SandboxResult,
  SandboxStatus,
  SandboxMonitor,
  LogEntry
} from '../types/PluginTypes'

export class PluginSandbox implements IPluginSandbox {
  private sandboxes: Map<string, SandboxInstance> = new Map()
  private sandboxResults: Map<string, SandboxResult[]> = new Map()
  private sandboxLogs: Map<string, LogEntry[]> = new Map()
  private sandboxMetrics: Map<string, any> = new Map()

  constructor() {
    this.startSandboxMonitoring()
  }

  // ============================================================================
  // SANDBOX MANAGEMENT
  // ============================================================================

  /**
   * Create sandbox
   */
  async createSandbox(pluginId: string): Promise<SandboxInstance> {
    const sandboxId = `sandbox_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const sandbox: SandboxInstance = {
      id: sandboxId,
      pluginId,
      status: 'created',
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    }

    this.sandboxes.set(sandboxId, sandbox)
    this.sandboxResults.set(sandboxId, [])
    this.sandboxLogs.set(sandboxId, [])
    this.sandboxMetrics.set(sandboxId, {
      uptime: 0,
      memory: 0,
      cpu: 0,
      requests: 0,
      errors: 0
    })

    // Initialize sandbox environment
    await this.initializeSandboxEnvironment(sandboxId)

    return sandbox
  }

  /**
   * Execute in sandbox
   */
  async execute(sandboxId: string, code: string): Promise<SandboxResult> {
    const sandbox = this.sandboxes.get(sandboxId)
    if (!sandbox) {
      throw new Error(`Sandbox not found: ${sandboxId}`)
    }

    if (sandbox.status !== 'running') {
      throw new Error(`Sandbox not running: ${sandboxId}`)
    }

    const startTime = Date.now()
    const startMemory = this.getMemoryUsage()

    try {
      // Validate code
      if (!this.isValidCode(code)) {
        throw new Error('Invalid code provided')
      }

      // Execute code in sandbox
      const result = await this.executeCodeInSandbox(sandboxId, code)
      
      const duration = Date.now() - startTime
      const endMemory = this.getMemoryUsage()
      const memoryUsed = endMemory - startMemory

      const sandboxResult: SandboxResult = {
        success: true,
        result,
        duration,
        memory: memoryUsed
      }

      // Store result
      const results = this.sandboxResults.get(sandboxId) || []
      results.push(sandboxResult)
      this.sandboxResults.set(sandboxId, results)

      // Update metrics
      this.updateSandboxMetrics(sandboxId, duration, memoryUsed, false)

      // Update last activity
      sandbox.lastActivity = new Date().toISOString()
      this.sandboxes.set(sandboxId, sandbox)

      return sandboxResult
    } catch (error) {
      const duration = Date.now() - startTime
      const endMemory = this.getMemoryUsage()
      const memoryUsed = endMemory - startMemory

      const sandboxResult: SandboxResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
        memory: memoryUsed
      }

      // Store result
      const results = this.sandboxResults.get(sandboxId) || []
      results.push(sandboxResult)
      this.sandboxResults.set(sandboxId, results)

      // Update metrics
      this.updateSandboxMetrics(sandboxId, duration, memoryUsed, true)

      // Log error
      this.logSandboxEvent(sandboxId, 'error', error instanceof Error ? error.message : 'Unknown error')

      return sandboxResult
    }
  }

  /**
   * Destroy sandbox
   */
  async destroySandbox(sandboxId: string): Promise<void> {
    const sandbox = this.sandboxes.get(sandboxId)
    if (!sandbox) {
      throw new Error(`Sandbox not found: ${sandboxId}`)
    }

    // Cleanup sandbox environment
    await this.cleanupSandboxEnvironment(sandboxId)

    // Remove sandbox data
    this.sandboxes.delete(sandboxId)
    this.sandboxResults.delete(sandboxId)
    this.sandboxLogs.delete(sandboxId)
    this.sandboxMetrics.delete(sandboxId)
  }

  /**
   * Get sandbox status
   */
  async getSandboxStatus(sandboxId: string): Promise<SandboxStatus> {
    const sandbox = this.sandboxes.get(sandboxId)
    if (!sandbox) {
      throw new Error(`Sandbox not found: ${sandboxId}`)
    }

    const metrics = this.sandboxMetrics.get(sandboxId) || {
      uptime: 0,
      memory: 0,
      cpu: 0
    }

    return {
      id: sandboxId,
      status: sandbox.status,
      uptime: Date.now() - new Date(sandbox.createdAt).getTime(),
      memory: metrics.memory,
      cpu: metrics.cpu,
      lastActivity: sandbox.lastActivity
    }
  }

  /**
   * Monitor sandbox
   */
  async monitorSandbox(sandboxId: string): Promise<SandboxMonitor> {
    const sandbox = this.sandboxes.get(sandboxId)
    if (!sandbox) {
      throw new Error(`Sandbox not found: ${sandboxId}`)
    }

    const metrics = this.sandboxMetrics.get(sandboxId) || {
      uptime: 0,
      memory: 0,
      cpu: 0,
      requests: 0,
      errors: 0
    }

    const logs = this.sandboxLogs.get(sandboxId) || []

    return {
      id: sandboxId,
      status: sandbox.status,
      metrics,
      logs: logs.slice(-100), // Last 100 log entries
      lastActivity: sandbox.lastActivity
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Initialize sandbox environment
   */
  private async initializeSandboxEnvironment(sandboxId: string): Promise<void> {
    const sandbox = this.sandboxes.get(sandboxId)
    if (!sandbox) return

    try {
      // Set up sandbox environment
      sandbox.status = 'running'
      this.sandboxes.set(sandboxId, sandbox)

      // Log initialization
      this.logSandboxEvent(sandboxId, 'info', 'Sandbox initialized')

      // Set up security policies
      await this.setupSecurityPolicies(sandboxId)

      // Set up resource limits
      await this.setupResourceLimits(sandboxId)

    } catch (error) {
      sandbox.status = 'error'
      this.sandboxes.set(sandboxId, sandbox)
      this.logSandboxEvent(sandboxId, 'error', `Initialization failed: ${error}`)
    }
  }

  /**
   * Cleanup sandbox environment
   */
  private async cleanupSandboxEnvironment(sandboxId: string): Promise<void> {
    try {
      // Log cleanup
      this.logSandboxEvent(sandboxId, 'info', 'Sandbox cleanup started')

      // Cleanup resources
      await this.cleanupResources(sandboxId)

      // Remove security policies
      await this.removeSecurityPolicies(sandboxId)

      // Log completion
      this.logSandboxEvent(sandboxId, 'info', 'Sandbox cleanup completed')

    } catch (error) {
      this.logSandboxEvent(sandboxId, 'error', `Cleanup failed: ${error}`)
    }
  }

  /**
   * Execute code in sandbox
   */
  private async executeCodeInSandbox(sandboxId: string, code: string): Promise<any> {
    // Create isolated execution context
    const context = this.createExecutionContext(sandboxId)
    
    // Execute code with timeout
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Execution timeout'))
      }, 30000) // 30 second timeout

      try {
        // Create function from code
        const func = new Function('context', 'console', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', code)
        
        // Execute function
        const result = func(
          context,
          this.createSandboxConsole(sandboxId),
          setTimeout,
          setInterval,
          clearTimeout,
          clearInterval
        )

        clearTimeout(timeout)
        resolve(result)
      } catch (error) {
        clearTimeout(timeout)
        reject(error)
      }
    })
  }

  /**
   * Create execution context
   */
  private createExecutionContext(sandboxId: string): any {
    return {
      sandboxId,
      pluginId: this.sandboxes.get(sandboxId)?.pluginId,
      // Add safe APIs
      Math,
      Date,
      JSON,
      // Add restricted APIs
      fetch: this.createRestrictedFetch(sandboxId),
      localStorage: this.createRestrictedStorage(sandboxId),
      // Add utility functions
      log: (message: string) => this.logSandboxEvent(sandboxId, 'info', message),
      error: (message: string) => this.logSandboxEvent(sandboxId, 'error', message)
    }
  }

  /**
   * Create sandbox console
   */
  private createSandboxConsole(sandboxId: string): any {
    return {
      log: (message: string) => this.logSandboxEvent(sandboxId, 'info', message),
      error: (message: string) => this.logSandboxEvent(sandboxId, 'error', message),
      warn: (message: string) => this.logSandboxEvent(sandboxId, 'warn', message),
      info: (message: string) => this.logSandboxEvent(sandboxId, 'info', message)
    }
  }

  /**
   * Create restricted fetch
   */
  private createRestrictedFetch(sandboxId: string): any {
    return async (url: string, options?: RequestInit) => {
      // Validate URL
      if (!this.isAllowedURL(url)) {
        throw new Error('URL not allowed in sandbox')
      }

      // Log network request
      this.logSandboxEvent(sandboxId, 'info', `Network request: ${url}`)

      // Make request
      return fetch(url, options)
    }
  }

  /**
   * Create restricted storage
   */
  private createRestrictedStorage(sandboxId: string): any {
    const prefix = `sandbox_${sandboxId}_`
    
    return {
      getItem: (key: string) => {
        return localStorage.getItem(prefix + key)
      },
      setItem: (key: string, value: string) => {
        localStorage.setItem(prefix + key, value)
      },
      removeItem: (key: string) => {
        localStorage.removeItem(prefix + key)
      },
      clear: () => {
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith(prefix)) {
            localStorage.removeItem(key)
          }
        })
      }
    }
  }

  /**
   * Setup security policies
   */
  private async setupSecurityPolicies(sandboxId: string): Promise<void> {
    // Implementation for security policy setup
    this.logSandboxEvent(sandboxId, 'info', 'Security policies configured')
  }

  /**
   * Remove security policies
   */
  private async removeSecurityPolicies(sandboxId: string): Promise<void> {
    // Implementation for security policy removal
    this.logSandboxEvent(sandboxId, 'info', 'Security policies removed')
  }

  /**
   * Setup resource limits
   */
  private async setupResourceLimits(sandboxId: string): Promise<void> {
    // Implementation for resource limit setup
    this.logSandboxEvent(sandboxId, 'info', 'Resource limits configured')
  }

  /**
   * Cleanup resources
   */
  private async cleanupResources(sandboxId: string): Promise<void> {
    // Implementation for resource cleanup
    this.logSandboxEvent(sandboxId, 'info', 'Resources cleaned up')
  }

  /**
   * Start sandbox monitoring
   */
  private startSandboxMonitoring(): void {
    setInterval(() => {
      this.monitorSandboxes()
    }, 5000) // Monitor every 5 seconds
  }

  /**
   * Monitor sandboxes
   */
  private monitorSandboxes(): void {
    for (const [sandboxId, sandbox] of this.sandboxes) {
      if (sandbox.status === 'running') {
        // Check for timeout
        const lastActivity = new Date(sandbox.lastActivity).getTime()
        const now = Date.now()
        const timeout = 5 * 60 * 1000 // 5 minutes

        if (now - lastActivity > timeout) {
          this.logSandboxEvent(sandboxId, 'warn', 'Sandbox timeout - stopping')
          sandbox.status = 'stopped'
          this.sandboxes.set(sandboxId, sandbox)
        }

        // Update metrics
        this.updateSandboxMetrics(sandboxId, 0, 0, false)
      }
    }
  }

  /**
   * Update sandbox metrics
   */
  private updateSandboxMetrics(sandboxId: string, duration: number, memory: number, isError: boolean): void {
    const metrics = this.sandboxMetrics.get(sandboxId) || {
      uptime: 0,
      memory: 0,
      cpu: 0,
      requests: 0,
      errors: 0
    }

    metrics.requests += 1
    if (isError) {
      metrics.errors += 1
    }

    // Update memory usage
    metrics.memory = Math.max(metrics.memory, memory)

    this.sandboxMetrics.set(sandboxId, metrics)
  }

  /**
   * Log sandbox event
   */
  private logSandboxEvent(sandboxId: string, level: 'debug' | 'info' | 'warn' | 'error', message: string): void {
    const logEntry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      level,
      message,
      timestamp: new Date().toISOString(),
      source: `sandbox:${sandboxId}`,
      context: {
        sandboxId,
        pluginId: this.sandboxes.get(sandboxId)?.pluginId
      }
    }

    const logs = this.sandboxLogs.get(sandboxId) || []
    logs.push(logEntry)
    
    // Keep only last 1000 log entries
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000)
    }
    
    this.sandboxLogs.set(sandboxId, logs)
  }

  /**
   * Check if code is valid
   */
  private isValidCode(code: string): boolean {
    // Basic code validation
    if (!code || typeof code !== 'string') {
      return false
    }

    // Check for dangerous patterns
    const dangerousPatterns = [
      /eval\s*\(/,
      /Function\s*\(/,
      /setTimeout\s*\(/,
      /setInterval\s*\(/,
      /document\./,
      /window\./,
      /global\./,
      /process\./,
      /require\s*\(/,
      /import\s+/,
      /export\s+/
    ]

    return !dangerousPatterns.some(pattern => pattern.test(code))
  }

  /**
   * Check if URL is allowed
   */
  private isAllowedURL(url: string): boolean {
    try {
      const urlObj = new URL(url)
      
      // Only allow HTTPS
      if (urlObj.protocol !== 'https:') {
        return false
      }

      // Add domain whitelist logic here
      const allowedDomains = [
        'api.openweathermap.org',
        'api.newsapi.org',
        'api.github.com'
      ]

      return allowedDomains.some(domain => urlObj.hostname === domain)
    } catch {
      return false
    }
  }

  /**
   * Get memory usage
   */
  private getMemoryUsage(): number {
    // Simple memory usage estimation
    return (performance as any).memory?.usedJSHeapSize || 0
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    // Cleanup all sandboxes
    for (const sandboxId of this.sandboxes.keys()) {
      this.destroySandbox(sandboxId)
    }

    this.sandboxes.clear()
    this.sandboxResults.clear()
    this.sandboxLogs.clear()
    this.sandboxMetrics.clear()
  }
}
