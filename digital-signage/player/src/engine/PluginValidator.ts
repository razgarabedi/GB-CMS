/**
 * Plugin Validator
 * Validation system for plugin compatibility and security
 */

import type {
  PluginValidator as IPluginValidator,
  PluginManifest,
  PluginComponent,
  PluginService,
  PluginSecurity,
  PluginDependency,
  PluginPermission,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ValidationInfo
} from '../types/PluginTypes'

export class PluginValidator implements IPluginValidator {
  private validationRules: Map<string, any> = new Map()

  constructor() {
    this.initializeValidationRules()
  }

  // ============================================================================
  // VALIDATION METHODS
  // ============================================================================

  /**
   * Validate manifest
   */
  async validateManifest(manifest: PluginManifest): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const info: ValidationInfo[] = []

    // Validate metadata
    this.validateMetadata(manifest.metadata, errors, warnings, info)

    // Validate configuration
    this.validateConfiguration(manifest.config, errors, warnings, info)

    // Validate capabilities
    this.validateCapabilities(manifest.capabilities, errors, warnings, info)

    // Validate dependencies
    this.validateDependencies(manifest.dependencies, errors, warnings, info)

    // Validate permissions
    this.validatePermissions(manifest.permissions, errors, warnings, info)

    // Validate security
    this.validateSecurity(manifest.security, errors, warnings, info)

    // Validate lifecycle
    this.validateLifecycle(manifest.lifecycle, errors, warnings, info)

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info
    }
  }

  /**
   * Validate component
   */
  async validateComponent(component: PluginComponent): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const info: ValidationInfo[] = []

    // Validate component ID
    if (!component.id) {
      errors.push({
        path: 'component.id',
        message: 'Component ID is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    } else if (!this.isValidId(component.id)) {
      errors.push({
        path: 'component.id',
        message: 'Component ID must be a valid identifier',
        code: 'INVALID_ID',
        severity: 'error'
      })
    }

    // Validate component name
    if (!component.name) {
      errors.push({
        path: 'component.name',
        message: 'Component name is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    }

    // Validate component type
    if (!component.type) {
      errors.push({
        path: 'component.type',
        message: 'Component type is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    } else if (!this.isValidComponentType(component.type)) {
      errors.push({
        path: 'component.type',
        message: 'Invalid component type',
        code: 'INVALID_TYPE',
        severity: 'error'
      })
    }

    // Validate component category
    if (!component.category) {
      errors.push({
        path: 'component.category',
        message: 'Component category is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    } else if (!this.isValidComponentCategory(component.category)) {
      errors.push({
        path: 'component.category',
        message: 'Invalid component category',
        code: 'INVALID_CATEGORY',
        severity: 'error'
      })
    }

    // Validate props schema
    if (!component.propsSchema) {
      warnings.push({
        path: 'component.propsSchema',
        message: 'Component props schema should be defined',
        code: 'MISSING_SCHEMA',
        severity: 'warning'
      })
    } else {
      this.validateJSONSchema(component.propsSchema, 'component.propsSchema', errors, warnings, info)
    }

    // Validate default props
    if (component.defaultProps && component.propsSchema) {
      this.validatePropsAgainstSchema(component.defaultProps, component.propsSchema, 'component.defaultProps', errors, warnings, info)
    }

    // Validate component version
    if (!component.version) {
      warnings.push({
        path: 'component.version',
        message: 'Component version should be specified',
        code: 'MISSING_VERSION',
        severity: 'warning'
      })
    } else if (!this.isValidVersion(component.version)) {
      errors.push({
        path: 'component.version',
        message: 'Invalid version format',
        code: 'INVALID_VERSION',
        severity: 'error'
      })
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info
    }
  }

  /**
   * Validate service
   */
  async validateService(service: PluginService): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const info: ValidationInfo[] = []

    // Validate service ID
    if (!service.id) {
      errors.push({
        path: 'service.id',
        message: 'Service ID is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    } else if (!this.isValidId(service.id)) {
      errors.push({
        path: 'service.id',
        message: 'Service ID must be a valid identifier',
        code: 'INVALID_ID',
        severity: 'error'
      })
    }

    // Validate service name
    if (!service.name) {
      errors.push({
        path: 'service.name',
        message: 'Service name is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    }

    // Validate service type
    if (!service.type) {
      errors.push({
        path: 'service.type',
        message: 'Service type is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    } else if (!this.isValidServiceType(service.type)) {
      errors.push({
        path: 'service.type',
        message: 'Invalid service type',
        code: 'INVALID_TYPE',
        severity: 'error'
      })
    }

    // Validate service implementation
    if (!service.implementation) {
      errors.push({
        path: 'service.implementation',
        message: 'Service implementation is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    } else if (typeof service.implementation !== 'function') {
      errors.push({
        path: 'service.implementation',
        message: 'Service implementation must be a function',
        code: 'INVALID_IMPLEMENTATION',
        severity: 'error'
      })
    }

    // Validate service version
    if (!service.version) {
      warnings.push({
        path: 'service.version',
        message: 'Service version should be specified',
        code: 'MISSING_VERSION',
        severity: 'warning'
      })
    } else if (!this.isValidVersion(service.version)) {
      errors.push({
        path: 'service.version',
        message: 'Invalid version format',
        code: 'INVALID_VERSION',
        severity: 'error'
      })
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info
    }
  }

  /**
   * Validate security
   */
  async validateSecurity(security: PluginSecurity): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const info: ValidationInfo[] = []

    // Validate security level
    if (!security.level) {
      errors.push({
        path: 'security.level',
        message: 'Security level is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    } else if (!this.isValidSecurityLevel(security.level)) {
      errors.push({
        path: 'security.level',
        message: 'Invalid security level',
        code: 'INVALID_SECURITY_LEVEL',
        severity: 'error'
      })
    }

    // Validate sandbox mode
    if (typeof security.sandbox !== 'boolean') {
      errors.push({
        path: 'security.sandbox',
        message: 'Sandbox mode must be a boolean',
        code: 'INVALID_SANDBOX',
        severity: 'error'
      })
    }

    // Validate allowed origins
    if (!Array.isArray(security.allowedOrigins)) {
      errors.push({
        path: 'security.allowedOrigins',
        message: 'Allowed origins must be an array',
        code: 'INVALID_ORIGINS',
        severity: 'error'
      })
    } else {
      security.allowedOrigins.forEach((origin, index) => {
        if (!this.isValidOrigin(origin)) {
          errors.push({
            path: `security.allowedOrigins[${index}]`,
            message: 'Invalid origin format',
            code: 'INVALID_ORIGIN',
            severity: 'error'
          })
        }
      })
    }

    // Validate allowed APIs
    if (!Array.isArray(security.allowedAPIs)) {
      errors.push({
        path: 'security.allowedAPIs',
        message: 'Allowed APIs must be an array',
        code: 'INVALID_APIS',
        severity: 'error'
      })
    } else {
      security.allowedAPIs.forEach((api, index) => {
        if (!this.isValidAPI(api)) {
          errors.push({
            path: `security.allowedAPIs[${index}]`,
            message: 'Invalid API format',
            code: 'INVALID_API',
            severity: 'error'
          })
        }
      })
    }

    // Validate CSP
    if (security.csp && !this.isValidCSP(security.csp)) {
      warnings.push({
        path: 'security.csp',
        message: 'Invalid Content Security Policy format',
        code: 'INVALID_CSP',
        severity: 'warning'
      })
    }

    // Validate code signing
    if (security.codeSigning) {
      this.validateCodeSigning(security.codeSigning, 'security.codeSigning', errors, warnings, info)
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info
    }
  }

  /**
   * Validate dependencies
   */
  async validateDependencies(dependencies: PluginDependency[]): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const info: ValidationInfo[] = []

    if (!Array.isArray(dependencies)) {
      errors.push({
        path: 'dependencies',
        message: 'Dependencies must be an array',
        code: 'INVALID_DEPENDENCIES',
        severity: 'error'
      })
      return { valid: false, errors, warnings, info }
    }

    dependencies.forEach((dependency, index) => {
      const basePath = `dependencies[${index}]`

      // Validate dependency ID
      if (!dependency.id) {
        errors.push({
          path: `${basePath}.id`,
          message: 'Dependency ID is required',
          code: 'REQUIRED_FIELD',
          severity: 'error'
        })
      } else if (!this.isValidId(dependency.id)) {
        errors.push({
          path: `${basePath}.id`,
          message: 'Dependency ID must be a valid identifier',
          code: 'INVALID_ID',
          severity: 'error'
        })
      }

      // Validate dependency name
      if (!dependency.name) {
        errors.push({
          path: `${basePath}.name`,
          message: 'Dependency name is required',
          code: 'REQUIRED_FIELD',
          severity: 'error'
        })
      }

      // Validate dependency version
      if (!dependency.version) {
        warnings.push({
          path: `${basePath}.version`,
          message: 'Dependency version should be specified',
          code: 'MISSING_VERSION',
          severity: 'warning'
        })
      } else if (!this.isValidVersion(dependency.version)) {
        errors.push({
          path: `${basePath}.version`,
          message: 'Invalid version format',
          code: 'INVALID_VERSION',
          severity: 'error'
        })
      }

      // Validate dependency type
      if (!dependency.type) {
        errors.push({
          path: `${basePath}.type`,
          message: 'Dependency type is required',
          code: 'REQUIRED_FIELD',
          severity: 'error'
        })
      } else if (!this.isValidDependencyType(dependency.type)) {
        errors.push({
          path: `${basePath}.type`,
          message: 'Invalid dependency type',
          code: 'INVALID_TYPE',
          severity: 'error'
        })
      }

      // Validate dependency source
      if (!dependency.source) {
        errors.push({
          path: `${basePath}.source`,
          message: 'Dependency source is required',
          code: 'REQUIRED_FIELD',
          severity: 'error'
        })
      } else if (!this.isValidSource(dependency.source)) {
        errors.push({
          path: `${basePath}.source`,
          message: 'Invalid dependency source',
          code: 'INVALID_SOURCE',
          severity: 'error'
        })
      }
    })

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info
    }
  }

  /**
   * Validate permissions
   */
  async validatePermissions(permissions: PluginPermission[]): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const info: ValidationInfo[] = []

    if (!Array.isArray(permissions)) {
      errors.push({
        path: 'permissions',
        message: 'Permissions must be an array',
        code: 'INVALID_PERMISSIONS',
        severity: 'error'
      })
      return { valid: false, errors, warnings, info }
    }

    permissions.forEach((permission, index) => {
      const basePath = `permissions[${index}]`

      // Validate permission ID
      if (!permission.id) {
        errors.push({
          path: `${basePath}.id`,
          message: 'Permission ID is required',
          code: 'REQUIRED_FIELD',
          severity: 'error'
        })
      } else if (!this.isValidId(permission.id)) {
        errors.push({
          path: `${basePath}.id`,
          message: 'Permission ID must be a valid identifier',
          code: 'INVALID_ID',
          severity: 'error'
        })
      }

      // Validate permission name
      if (!permission.name) {
        errors.push({
          path: `${basePath}.name`,
          message: 'Permission name is required',
          code: 'REQUIRED_FIELD',
          severity: 'error'
        })
      }

      // Validate permission description
      if (!permission.description) {
        warnings.push({
          path: `${basePath}.description`,
          message: 'Permission description should be provided',
          code: 'MISSING_DESCRIPTION',
          severity: 'warning'
        })
      }

      // Validate permission type
      if (!permission.type) {
        errors.push({
          path: `${basePath}.type`,
          message: 'Permission type is required',
          code: 'REQUIRED_FIELD',
          severity: 'error'
        })
      } else if (!this.isValidPermissionType(permission.type)) {
        errors.push({
          path: `${basePath}.type`,
          message: 'Invalid permission type',
          code: 'INVALID_TYPE',
          severity: 'error'
        })
      }

      // Validate permission scope
      if (!permission.scope) {
        errors.push({
          path: `${basePath}.scope`,
          message: 'Permission scope is required',
          code: 'REQUIRED_FIELD',
          severity: 'error'
        })
      } else if (!this.isValidPermissionScope(permission.scope)) {
        errors.push({
          path: `${basePath}.scope`,
          message: 'Invalid permission scope',
          code: 'INVALID_SCOPE',
          severity: 'error'
        })
      }
    })

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info
    }
  }

  // ============================================================================
  // PRIVATE VALIDATION METHODS
  // ============================================================================

  /**
   * Initialize validation rules
   */
  private initializeValidationRules(): void {
    // Implementation for validation rules initialization
  }

  /**
   * Validate metadata
   */
  private validateMetadata(metadata: any, errors: ValidationError[], warnings: ValidationWarning[], info: ValidationInfo[]): void {
    if (!metadata.id) {
      errors.push({
        path: 'metadata.id',
        message: 'Plugin ID is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    } else if (!this.isValidId(metadata.id)) {
      errors.push({
        path: 'metadata.id',
        message: 'Plugin ID must be a valid identifier',
        code: 'INVALID_ID',
        severity: 'error'
      })
    }

    if (!metadata.name) {
      errors.push({
        path: 'metadata.name',
        message: 'Plugin name is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    }

    if (!metadata.version) {
      warnings.push({
        path: 'metadata.version',
        message: 'Plugin version should be specified',
        code: 'MISSING_VERSION',
        severity: 'warning'
      })
    } else if (!this.isValidVersion(metadata.version)) {
      errors.push({
        path: 'metadata.version',
        message: 'Invalid version format',
        code: 'INVALID_VERSION',
        severity: 'error'
      })
    }

    if (!metadata.author) {
      errors.push({
        path: 'metadata.author',
        message: 'Plugin author is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    } else {
      this.validateAuthor(metadata.author, 'metadata.author', errors, warnings, info)
    }

    if (!metadata.category) {
      errors.push({
        path: 'metadata.category',
        message: 'Plugin category is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    } else if (!this.isValidCategory(metadata.category)) {
      errors.push({
        path: 'metadata.category',
        message: 'Invalid plugin category',
        code: 'INVALID_CATEGORY',
        severity: 'error'
      })
    }
  }

  /**
   * Validate configuration
   */
  private validateConfiguration(config: any, errors: ValidationError[], warnings: ValidationWarning[], info: ValidationInfo[]): void {
    if (!config.entry) {
      errors.push({
        path: 'config.entry',
        message: 'Plugin entry point is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    }

    if (!config.components || config.components.length === 0) {
      warnings.push({
        path: 'config.components',
        message: 'Plugin should have at least one component',
        code: 'NO_COMPONENTS',
        severity: 'warning'
      })
    }
  }

  /**
   * Validate capabilities
   */
  private validateCapabilities(capabilities: any, errors: ValidationError[], warnings: ValidationWarning[], info: ValidationInfo[]): void {
    // Implementation for capability validation
  }

  /**
   * Validate lifecycle
   */
  private validateLifecycle(lifecycle: any, errors: ValidationError[], warnings: ValidationWarning[], info: ValidationInfo[]): void {
    // Implementation for lifecycle validation
  }

  /**
   * Validate author
   */
  private validateAuthor(author: any, path: string, errors: ValidationError[], warnings: ValidationWarning[], info: ValidationInfo[]): void {
    if (!author.id) {
      errors.push({
        path: `${path}.id`,
        message: 'Author ID is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    }

    if (!author.name) {
      errors.push({
        path: `${path}.name`,
        message: 'Author name is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    }

    if (author.email && !this.isValidEmail(author.email)) {
      errors.push({
        path: `${path}.email`,
        message: 'Invalid email format',
        code: 'INVALID_EMAIL',
        severity: 'error'
      })
    }
  }

  /**
   * Validate JSON schema
   */
  private validateJSONSchema(schema: any, path: string, errors: ValidationError[], warnings: ValidationWarning[], info: ValidationInfo[]): void {
    if (!schema.type) {
      errors.push({
        path: `${path}.type`,
        message: 'Schema type is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    }
  }

  /**
   * Validate props against schema
   */
  private validatePropsAgainstSchema(props: any, schema: any, path: string, errors: ValidationError[], warnings: ValidationWarning[], info: ValidationInfo[]): void {
    // Implementation for props validation against schema
  }

  /**
   * Validate code signing
   */
  private validateCodeSigning(codeSigning: any, path: string, errors: ValidationError[], warnings: ValidationWarning[], info: ValidationInfo[]): void {
    if (!codeSigning.certificate) {
      errors.push({
        path: `${path}.certificate`,
        message: 'Code signing certificate is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    }

    if (!codeSigning.signature) {
      errors.push({
        path: `${path}.signature`,
        message: 'Code signing signature is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    }
  }

  // ============================================================================
  // VALIDATION HELPERS
  // ============================================================================

  /**
   * Check if ID is valid
   */
  private isValidId(id: string): boolean {
    return /^[a-zA-Z0-9_-]+$/.test(id)
  }

  /**
   * Check if version is valid
   */
  private isValidVersion(version: string): boolean {
    return /^\d+\.\d+\.\d+/.test(version)
  }

  /**
   * Check if email is valid
   */
  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  /**
   * Check if component type is valid
   */
  private isValidComponentType(type: string): boolean {
    const validTypes = ['widget', 'layout', 'utility', 'service', 'middleware', 'theme', 'locale']
    return validTypes.includes(type)
  }

  /**
   * Check if component category is valid
   */
  private isValidComponentCategory(category: string): boolean {
    const validCategories = ['display', 'interaction', 'data', 'media', 'navigation', 'form', 'chart', 'map', 'calendar', 'custom']
    return validCategories.includes(category)
  }

  /**
   * Check if service type is valid
   */
  private isValidServiceType(type: string): boolean {
    const validTypes = ['api', 'database', 'cache', 'queue', 'websocket', 'scheduler', 'notification', 'analytics', 'security', 'custom']
    return validTypes.includes(type)
  }

  /**
   * Check if security level is valid
   */
  private isValidSecurityLevel(level: string): boolean {
    const validLevels = ['low', 'medium', 'high', 'critical']
    return validLevels.includes(level)
  }

  /**
   * Check if origin is valid
   */
  private isValidOrigin(origin: string): boolean {
    try {
      new URL(origin)
      return true
    } catch {
      return false
    }
  }

  /**
   * Check if API is valid
   */
  private isValidAPI(api: string): boolean {
    return /^[a-zA-Z0-9_.-]+$/.test(api)
  }

  /**
   * Check if CSP is valid
   */
  private isValidCSP(csp: string): boolean {
    // Basic CSP validation
    return typeof csp === 'string' && csp.length > 0
  }

  /**
   * Check if dependency type is valid
   */
  private isValidDependencyType(type: string): boolean {
    const validTypes = ['plugin', 'library', 'service']
    return validTypes.includes(type)
  }

  /**
   * Check if source is valid
   */
  private isValidSource(source: string): boolean {
    try {
      new URL(source)
      return true
    } catch {
      return false
    }
  }

  /**
   * Check if permission type is valid
   */
  private isValidPermissionType(type: string): boolean {
    const validTypes = ['read', 'write', 'execute', 'delete', 'admin', 'custom']
    return validTypes.includes(type)
  }

  /**
   * Check if permission scope is valid
   */
  private isValidPermissionScope(scope: string): boolean {
    const validScopes = ['global', 'user', 'organization', 'team', 'plugin', 'component', 'service', 'custom']
    return validScopes.includes(scope)
  }

  /**
   * Check if category is valid
   */
  private isValidCategory(category: string): boolean {
    const validCategories = ['widget', 'layout', 'utility', 'theme', 'service', 'integration', 'analytics', 'security', 'custom']
    return validCategories.includes(category)
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.validationRules.clear()
  }
}
