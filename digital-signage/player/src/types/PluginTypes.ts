/**
 * Plugin Architecture Types
 * Comprehensive plugin system with security, validation, and management
 */

import type { ReactNode } from 'react'

// ============================================================================
// CORE PLUGIN TYPES
// ============================================================================

/**
 * Plugin manifest interface
 */
export interface PluginManifest {
  /** Plugin metadata */
  metadata: PluginMetadata
  /** Plugin configuration */
  config: PluginConfig
  /** Plugin capabilities */
  capabilities: PluginCapabilities
  /** Plugin dependencies */
  dependencies: PluginDependency[]
  /** Plugin permissions */
  permissions: PluginPermission[]
  /** Plugin lifecycle hooks */
  lifecycle: PluginLifecycle
  /** Plugin security */
  security: PluginSecurity
}

/**
 * Plugin metadata
 */
export interface PluginMetadata {
  /** Plugin ID */
  id: string
  /** Plugin name */
  name: string
  /** Plugin description */
  description: string
  /** Plugin version */
  version: string
  /** Plugin author */
  author: PluginAuthor
  /** Plugin category */
  category: PluginCategory
  /** Plugin tags */
  tags: string[]
  /** Plugin license */
  license: PluginLicense
  /** Plugin homepage */
  homepage?: string
  /** Plugin repository */
  repository?: string
  /** Plugin documentation */
  documentation?: string
  /** Plugin support */
  support?: PluginSupport
  /** Plugin changelog */
  changelog?: ChangelogEntry[]
  /** Plugin preview */
  preview?: PluginPreview
  /** Plugin status */
  status: PluginStatus
  /** Plugin visibility */
  visibility: PluginVisibility
  /** Plugin created date */
  createdAt: string
  /** Plugin updated date */
  updatedAt: string
}

/**
 * Plugin configuration
 */
export interface PluginConfig {
  /** Plugin entry point */
  entry: string
  /** Plugin components */
  components: PluginComponent[]
  /** Plugin services */
  services: PluginService[]
  /** Plugin routes */
  routes: PluginRoute[]
  /** Plugin assets */
  assets: PluginAsset[]
  /** Plugin settings */
  settings: PluginSetting[]
  /** Plugin hooks */
  hooks: PluginHook[]
  /** Plugin middleware */
  middleware: PluginMiddleware[]
  /** Plugin themes */
  themes: PluginTheme[]
  /** Plugin locales */
  locales: PluginLocale[]
}

/**
 * Plugin capabilities
 */
export interface PluginCapabilities {
  /** UI capabilities */
  ui: UICapabilities
  /** Data capabilities */
  data: DataCapabilities
  /** Network capabilities */
  network: NetworkCapabilities
  /** Storage capabilities */
  storage: StorageCapabilities
  /** System capabilities */
  system: SystemCapabilities
  /** Custom capabilities */
  custom: Record<string, any>
}

/**
 * Plugin dependency
 */
export interface PluginDependency {
  /** Dependency ID */
  id: string
  /** Dependency name */
  name: string
  /** Dependency version */
  version: string
  /** Dependency type */
  type: 'plugin' | 'library' | 'service'
  /** Dependency source */
  source: string
  /** Dependency required */
  required: boolean
  /** Dependency description */
  description?: string
}

/**
 * Plugin permission
 */
export interface PluginPermission {
  /** Permission ID */
  id: string
  /** Permission name */
  name: string
  /** Permission description */
  description: string
  /** Permission type */
  type: PermissionType
  /** Permission scope */
  scope: PermissionScope
  /** Permission required */
  required: boolean
  /** Permission granted */
  granted: boolean
}

/**
 * Plugin lifecycle
 */
export interface PluginLifecycle {
  /** Installation hook */
  install?: () => Promise<void>
  /** Activation hook */
  activate?: () => Promise<void>
  /** Deactivation hook */
  deactivate?: () => Promise<void>
  /** Uninstallation hook */
  uninstall?: () => Promise<void>
  /** Update hook */
  update?: (oldVersion: string, newVersion: string) => Promise<void>
  /** Health check hook */
  healthCheck?: () => Promise<PluginHealth>
}

/**
 * Plugin security
 */
export interface PluginSecurity {
  /** Security level */
  level: SecurityLevel
  /** Sandbox mode */
  sandbox: boolean
  /** Allowed origins */
  allowedOrigins: string[]
  /** Allowed APIs */
  allowedAPIs: string[]
  /** Content Security Policy */
  csp: string
  /** Code signing */
  codeSigning?: CodeSigning
  /** Security audit */
  audit?: SecurityAudit
}

// ============================================================================
// PLUGIN COMPONENT TYPES
// ============================================================================

/**
 * Plugin component
 */
export interface PluginComponent {
  /** Component ID */
  id: string
  /** Component name */
  name: string
  /** Component type */
  type: ComponentType
  /** Component description */
  description?: string
  /** Component category */
  category: ComponentCategory
  /** Component props schema */
  propsSchema: JSONSchema
  /** Component default props */
  defaultProps: Record<string, any>
  /** Component component */
  component: React.ComponentType<PluginComponentProps>
  /** Component permissions */
  permissions: string[]
  /** Component dependencies */
  dependencies: string[]
  /** Component version */
  version: string
  /** Component status */
  status: ComponentStatus
}

/**
 * Plugin component props
 */
export interface PluginComponentProps {
  /** Theme */
  theme?: 'dark' | 'light'
  /** Configuration */
  config: Record<string, any>
  /** Error handler */
  onError?: (error: Error) => void
  /** Data update handler */
  onDataUpdate?: (data: any) => void
  /** Event handler */
  onEvent?: (event: PluginEvent) => void
  /** Plugin context */
  context: PluginContext
  /** Plugin API */
  api: PluginAPI
}

/**
 * Plugin service
 */
export interface PluginService {
  /** Service ID */
  id: string
  /** Service name */
  name: string
  /** Service description */
  description?: string
  /** Service type */
  type: ServiceType
  /** Service implementation */
  implementation: ServiceImplementation
  /** Service dependencies */
  dependencies: string[]
  /** Service version */
  version: string
  /** Service status */
  status: ServiceStatus
}

/**
 * Plugin route
 */
export interface PluginRoute {
  /** Route path */
  path: string
  /** Route component */
  component: React.ComponentType<any>
  /** Route permissions */
  permissions: string[]
  /** Route metadata */
  metadata: RouteMetadata
}

/**
 * Plugin asset
 */
export interface PluginAsset {
  /** Asset ID */
  id: string
  /** Asset type */
  type: AssetType
  /** Asset path */
  path: string
  /** Asset size */
  size: number
  /** Asset metadata */
  metadata: AssetMetadata
}

/**
 * Plugin setting
 */
export interface PluginSetting {
  /** Setting key */
  key: string
  /** Setting name */
  name: string
  /** Setting description */
  description?: string
  /** Setting type */
  type: SettingType
  /** Setting default value */
  defaultValue: any
  /** Setting validation */
  validation?: SettingValidation
  /** Setting options */
  options?: SettingOption[]
}

/**
 * Plugin hook
 */
export interface PluginHook {
  /** Hook name */
  name: string
  /** Hook type */
  type: HookType
  /** Hook implementation */
  implementation: HookImplementation
  /** Hook priority */
  priority: number
  /** Hook dependencies */
  dependencies: string[]
}

/**
 * Plugin middleware
 */
export interface PluginMiddleware {
  /** Middleware name */
  name: string
  /** Middleware type */
  type: MiddlewareType
  /** Middleware implementation */
  implementation: MiddlewareImplementation
  /** Middleware order */
  order: number
  /** Middleware conditions */
  conditions: MiddlewareCondition[]
}

/**
 * Plugin theme
 */
export interface PluginTheme {
  /** Theme ID */
  id: string
  /** Theme name */
  name: string
  /** Theme description */
  description?: string
  /** Theme variables */
  variables: Record<string, any>
  /** Theme styles */
  styles: Record<string, any>
  /** Theme assets */
  assets: string[]
}

/**
 * Plugin locale
 */
export interface PluginLocale {
  /** Locale code */
  code: string
  /** Locale name */
  name: string
  /** Locale translations */
  translations: Record<string, string>
}

// ============================================================================
// PLUGIN SYSTEM TYPES
// ============================================================================

/**
 * Plugin registry
 */
export interface PluginRegistry {
  /** Registered plugins */
  plugins: Map<string, PluginManifest>
  /** Plugin states */
  states: Map<string, PluginState>
  /** Plugin instances */
  instances: Map<string, PluginInstance>
  /** Plugin events */
  events: PluginEventEmitter
}

/**
 * Plugin state
 */
export interface PluginState {
  /** Plugin ID */
  pluginId: string
  /** Plugin status */
  status: PluginStatus
  /** Plugin health */
  health: PluginHealth
  /** Plugin metrics */
  metrics: PluginMetrics
  /** Plugin errors */
  errors: PluginError[]
  /** Plugin warnings */
  warnings: PluginWarning[]
  /** Plugin last updated */
  lastUpdated: string
}

/**
 * Plugin instance
 */
export interface PluginInstance {
  /** Instance ID */
  instanceId: string
  /** Plugin ID */
  pluginId: string
  /** Instance configuration */
  config: Record<string, any>
  /** Instance state */
  state: Record<string, any>
  /** Instance context */
  context: PluginContext
  /** Instance API */
  api: PluginAPI
  /** Instance lifecycle */
  lifecycle: PluginInstanceLifecycle
}

/**
 * Plugin context
 */
export interface PluginContext {
  /** Plugin ID */
  pluginId: string
  /** Instance ID */
  instanceId: string
  /** User context */
  user: UserContext
  /** System context */
  system: SystemContext
  /** Plugin context */
  plugin: PluginContextData
}

/**
 * Plugin API
 */
export interface PluginAPI {
  /** Data API */
  data: DataAPI
  /** UI API */
  ui: UIAPI
  /** Storage API */
  storage: StorageAPI
  /** Network API */
  network: NetworkAPI
  /** System API */
  system: SystemAPI
  /** Event API */
  events: EventAPI
  /** Utility API */
  utils: UtilityAPI
}

/**
 * Plugin event
 */
export interface PluginEvent {
  /** Event type */
  type: string
  /** Event data */
  data: any
  /** Event source */
  source: string
  /** Event timestamp */
  timestamp: string
  /** Event ID */
  id: string
}

/**
 * Plugin health
 */
export interface PluginHealth {
  /** Health status */
  status: 'healthy' | 'warning' | 'error' | 'unknown'
  /** Health score */
  score: number
  /** Health checks */
  checks: HealthCheck[]
  /** Health metrics */
  metrics: HealthMetrics
  /** Health last checked */
  lastChecked: string
}

/**
 * Plugin metrics
 */
export interface PluginMetrics {
  /** Performance metrics */
  performance: PerformanceMetrics
  /** Usage metrics */
  usage: UsageMetrics
  /** Error metrics */
  errors: ErrorMetrics
  /** Resource metrics */
  resources: ResourceMetrics
}

// ============================================================================
// PLUGIN MANAGEMENT TYPES
// ============================================================================

/**
 * Plugin manager
 */
export interface PluginManager {
  /** Install plugin */
  install(plugin: PluginManifest): Promise<PluginInstallResult>
  /** Uninstall plugin */
  uninstall(pluginId: string): Promise<PluginUninstallResult>
  /** Activate plugin */
  activate(pluginId: string): Promise<PluginActivateResult>
  /** Deactivate plugin */
  deactivate(pluginId: string): Promise<PluginDeactivateResult>
  /** Update plugin */
  update(pluginId: string, version: string): Promise<PluginUpdateResult>
  /** Get plugin */
  getPlugin(pluginId: string): Promise<PluginManifest | null>
  /** List plugins */
  listPlugins(options?: PluginListOptions): Promise<PluginManifest[]>
  /** Search plugins */
  searchPlugins(query: string, options?: PluginSearchOptions): Promise<PluginManifest[]>
  /** Validate plugin */
  validatePlugin(plugin: PluginManifest): Promise<PluginValidationResult>
  /** Test plugin */
  testPlugin(pluginId: string): Promise<PluginTestResult>
  /** Get plugin analytics */
  getPluginAnalytics(pluginId: string): Promise<PluginAnalytics>
}

/**
 * Plugin store
 */
export interface PluginStore {
  /** Browse plugins */
  browsePlugins(options?: StoreBrowseOptions): Promise<StorePlugin[]>
  /** Search plugins */
  searchPlugins(query: string, options?: StoreSearchOptions): Promise<StorePlugin[]>
  /** Get plugin details */
  getPluginDetails(pluginId: string): Promise<StorePluginDetails | null>
  /** Install plugin */
  installPlugin(pluginId: string): Promise<StoreInstallResult>
  /** Rate plugin */
  ratePlugin(pluginId: string, rating: number, review?: string): Promise<void>
  /** Get plugin reviews */
  getPluginReviews(pluginId: string): Promise<StoreReview[]>
  /** Get plugin analytics */
  getPluginAnalytics(pluginId: string): Promise<StoreAnalytics>
}

/**
 * Plugin validator
 */
export interface PluginValidator {
  /** Validate manifest */
  validateManifest(manifest: PluginManifest): Promise<ValidationResult>
  /** Validate component */
  validateComponent(component: PluginComponent): Promise<ValidationResult>
  /** Validate service */
  validateService(service: PluginService): Promise<ValidationResult>
  /** Validate security */
  validateSecurity(security: PluginSecurity): Promise<ValidationResult>
  /** Validate dependencies */
  validateDependencies(dependencies: PluginDependency[]): Promise<ValidationResult>
  /** Validate permissions */
  validatePermissions(permissions: PluginPermission[]): Promise<ValidationResult>
}

/**
 * Plugin sandbox
 */
export interface PluginSandbox {
  /** Create sandbox */
  createSandbox(pluginId: string): Promise<SandboxInstance>
  /** Execute in sandbox */
  execute(sandboxId: string, code: string): Promise<SandboxResult>
  /** Destroy sandbox */
  destroySandbox(sandboxId: string): Promise<void>
  /** Get sandbox status */
  getSandboxStatus(sandboxId: string): Promise<SandboxStatus>
  /** Monitor sandbox */
  monitorSandbox(sandboxId: string): Promise<SandboxMonitor>
}

// ============================================================================
// ENUMERATIONS
// ============================================================================

export type PluginCategory = 
  | 'widget'
  | 'layout'
  | 'utility'
  | 'theme'
  | 'service'
  | 'integration'
  | 'analytics'
  | 'security'
  | 'custom'

export type PluginStatus = 
  | 'installed'
  | 'active'
  | 'inactive'
  | 'error'
  | 'updating'
  | 'uninstalling'

export type PluginVisibility = 
  | 'public'
  | 'private'
  | 'unlisted'
  | 'organization'
  | 'team'

export type ComponentType = 
  | 'widget'
  | 'layout'
  | 'utility'
  | 'service'
  | 'middleware'
  | 'theme'
  | 'locale'

export type ComponentCategory = 
  | 'display'
  | 'interaction'
  | 'data'
  | 'media'
  | 'navigation'
  | 'form'
  | 'chart'
  | 'map'
  | 'calendar'
  | 'custom'

export type ComponentStatus = 
  | 'active'
  | 'inactive'
  | 'error'
  | 'loading'
  | 'updating'

export type ServiceType = 
  | 'api'
  | 'database'
  | 'cache'
  | 'queue'
  | 'websocket'
  | 'scheduler'
  | 'notification'
  | 'analytics'
  | 'security'
  | 'custom'

export type ServiceStatus = 
  | 'running'
  | 'stopped'
  | 'error'
  | 'starting'
  | 'stopping'

export type AssetType = 
  | 'image'
  | 'video'
  | 'audio'
  | 'font'
  | 'icon'
  | 'style'
  | 'script'
  | 'document'
  | 'data'
  | 'other'

export type SettingType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'color'
  | 'date'
  | 'time'
  | 'file'
  | 'json'
  | 'custom'

export type HookType = 
  | 'action'
  | 'filter'
  | 'event'
  | 'middleware'
  | 'route'
  | 'component'
  | 'service'
  | 'custom'

export type MiddlewareType = 
  | 'request'
  | 'response'
  | 'error'
  | 'authentication'
  | 'authorization'
  | 'logging'
  | 'caching'
  | 'rate-limiting'
  | 'custom'

export type PermissionType = 
  | 'read'
  | 'write'
  | 'execute'
  | 'delete'
  | 'admin'
  | 'custom'

export type PermissionScope = 
  | 'global'
  | 'user'
  | 'organization'
  | 'team'
  | 'plugin'
  | 'component'
  | 'service'
  | 'custom'

export type SecurityLevel = 
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface JSONSchema {
  type: string
  properties?: Record<string, any>
  required?: string[]
  additionalProperties?: boolean
}

export interface PluginAuthor {
  id: string
  name: string
  email?: string
  website?: string
  avatar?: string
  bio?: string
  organization?: string
  social?: Record<string, string>
}

export interface PluginLicense {
  type: string
  text?: string
  url?: string
  commercialUse: boolean
  modification: boolean
  distribution: boolean
  attribution: boolean
}

export interface PluginSupport {
  email?: string
  url?: string
  documentation?: string
  forum?: string
  issues?: string
}

export interface ChangelogEntry {
  version: string
  date: string
  changes: string[]
  type: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security'
}

export interface PluginPreview {
  images: string[]
  videos?: string[]
  liveUrl?: string
  description?: string
}

export interface UICapabilities {
  components: boolean
  layouts: boolean
  themes: boolean
  animations: boolean
  interactions: boolean
  responsive: boolean
  accessibility: boolean
}

export interface DataCapabilities {
  read: boolean
  write: boolean
  delete: boolean
  query: boolean
  aggregate: boolean
  realtime: boolean
  caching: boolean
}

export interface NetworkCapabilities {
  http: boolean
  websocket: boolean
  sse: boolean
  cors: boolean
  proxy: boolean
  ssl: boolean
  authentication: boolean
}

export interface StorageCapabilities {
  local: boolean
  session: boolean
  indexeddb: boolean
  websql: boolean
  filesystem: boolean
  cloud: boolean
  encryption: boolean
}

export interface SystemCapabilities {
  filesystem: boolean
  processes: boolean
  network: boolean
  hardware: boolean
  notifications: boolean
  clipboard: boolean
  geolocation: boolean
}

export interface CodeSigning {
  certificate: string
  signature: string
  timestamp: string
  algorithm: string
}

export interface SecurityAudit {
  score: number
  vulnerabilities: SecurityVulnerability[]
  recommendations: SecurityRecommendation[]
  lastAudited: string
}

export interface SecurityVulnerability {
  id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  cve?: string
  fix?: string
}

export interface SecurityRecommendation {
  id: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  description: string
  implementation?: string
}

export interface RouteMetadata {
  title: string
  description?: string
  permissions: string[]
  middleware: string[]
  cache?: boolean
  rateLimit?: number
}

export interface AssetMetadata {
  name: string
  description?: string
  mimeType: string
  hash: string
  lastModified: string
}

export interface SettingValidation {
  required?: boolean
  min?: number
  max?: number
  pattern?: string
  custom?: (value: any) => boolean | string
}

export interface SettingOption {
  value: any
  label: string
  description?: string
}

export interface HookImplementation {
  (context: PluginContext, ...args: any[]): any
}

export interface MiddlewareImplementation {
  (context: PluginContext, next: () => Promise<any>): Promise<any>
}

export interface MiddlewareCondition {
  type: string
  value: any
  operator: 'equals' | 'notEquals' | 'contains' | 'regex'
}

export interface ServiceImplementation {
  (context: PluginContext): Promise<any>
}

export interface UserContext {
  id: string
  name: string
  email: string
  roles: string[]
  permissions: string[]
  preferences: Record<string, any>
}

export interface SystemContext {
  version: string
  platform: string
  environment: string
  features: string[]
  limits: Record<string, any>
}

export interface PluginContextData {
  id: string
  version: string
  config: Record<string, any>
  state: Record<string, any>
  metadata: Record<string, any>
}

export interface DataAPI {
  get(key: string): Promise<any>
  set(key: string, value: any): Promise<void>
  delete(key: string): Promise<void>
  query(filter: any): Promise<any[]>
  subscribe(key: string, callback: (value: any) => void): () => void
}

export interface UIAPI {
  showNotification(message: string, type?: 'info' | 'success' | 'warning' | 'error'): void
  showModal(component: React.ComponentType<any>, props?: any): void
  hideModal(): void
  navigate(path: string): void
  refresh(): void
}

export interface StorageAPI {
  get(key: string): Promise<any>
  set(key: string, value: any): Promise<void>
  remove(key: string): Promise<void>
  clear(): Promise<void>
  keys(): Promise<string[]>
}

export interface NetworkAPI {
  request(url: string, options?: RequestInit): Promise<Response>
  get(url: string, options?: RequestInit): Promise<Response>
  post(url: string, data?: any, options?: RequestInit): Promise<Response>
  put(url: string, data?: any, options?: RequestInit): Promise<Response>
  delete(url: string, options?: RequestInit): Promise<Response>
}

export interface SystemAPI {
  getInfo(): Promise<SystemInfo>
  getMetrics(): Promise<SystemMetrics>
  getLogs(): Promise<LogEntry[]>
  restart(): Promise<void>
  shutdown(): Promise<void>
}

export interface EventAPI {
  emit(event: string, data?: any): void
  on(event: string, callback: (data?: any) => void): () => void
  off(event: string, callback: (data?: any) => void): void
  once(event: string, callback: (data?: any) => void): void
}

export interface UtilityAPI {
  formatDate(date: Date, format?: string): string
  formatNumber(number: number, options?: Intl.NumberFormatOptions): string
  formatCurrency(amount: number, currency?: string): string
  debounce<T extends (...args: any[]) => any>(func: T, delay: number): T
  throttle<T extends (...args: any[]) => any>(func: T, delay: number): T
  uuid(): string
  hash(data: string): string
}

export interface PluginInstanceLifecycle {
  created: string
  started: string
  stopped?: string
  destroyed?: string
}

export interface PluginError {
  id: string
  type: string
  message: string
  stack?: string
  timestamp: string
  context: Record<string, any>
}

export interface PluginWarning {
  id: string
  type: string
  message: string
  timestamp: string
  context: Record<string, any>
}

export interface HealthCheck {
  name: string
  status: 'pass' | 'fail' | 'warn'
  message?: string
  duration: number
  timestamp: string
}

export interface HealthMetrics {
  uptime: number
  memoryUsage: number
  cpuUsage: number
  errorRate: number
  responseTime: number
}

export interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage: number
  cpuUsage: number
  networkUsage: number
}

export interface UsageMetrics {
  requests: number
  users: number
  sessions: number
  errors: number
  warnings: number
}

export interface ErrorMetrics {
  total: number
  rate: number
  types: Record<string, number>
  trends: ErrorTrend[]
}

export interface ErrorTrend {
  date: string
  count: number
  type: string
}

export interface ResourceMetrics {
  memory: number
  cpu: number
  disk: number
  network: number
  database: number
}

export interface PluginEventEmitter {
  emit(event: string, data?: any): void
  on(event: string, callback: (data?: any) => void): () => void
  off(event: string, callback: (data?: any) => void): void
  once(event: string, callback: (data?: any) => void): void
}

export interface PluginInstallResult {
  success: boolean
  pluginId: string
  message: string
  errors?: string[]
  warnings?: string[]
}

export interface PluginUninstallResult {
  success: boolean
  pluginId: string
  message: string
  errors?: string[]
}

export interface PluginActivateResult {
  success: boolean
  pluginId: string
  message: string
  errors?: string[]
}

export interface PluginDeactivateResult {
  success: boolean
  pluginId: string
  message: string
  errors?: string[]
}

export interface PluginUpdateResult {
  success: boolean
  pluginId: string
  oldVersion: string
  newVersion: string
  message: string
  errors?: string[]
}

export interface PluginListOptions {
  category?: PluginCategory
  status?: PluginStatus
  visibility?: PluginVisibility
  author?: string
  sort?: PluginSortOptions
  pagination?: PaginationOptions
}

export interface PluginSortOptions {
  field: 'name' | 'version' | 'createdAt' | 'updatedAt' | 'rating' | 'downloads'
  direction: 'asc' | 'desc'
}

export interface PaginationOptions {
  page: number
  size: number
  total?: number
}

export interface PluginSearchOptions {
  fields?: string[]
  filters?: Record<string, any>
  sort?: PluginSortOptions
  pagination?: PaginationOptions
}

export interface PluginValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  info: ValidationInfo[]
}

export interface PluginTestResult {
  success: boolean
  results: TestResult[]
  coverage: TestCoverage
  errors: TestError[]
  duration: number
}

export interface PluginAnalytics {
  usage: UsageAnalytics
  performance: PerformanceAnalytics
  errors: ErrorAnalytics
  feedback: FeedbackAnalytics
}

export interface ValidationError {
  path: string
  message: string
  code: string
  severity: 'error' | 'warning' | 'info'
}

export interface ValidationWarning {
  path: string
  message: string
  code: string
  severity: 'warning' | 'info'
}

export interface ValidationInfo {
  path: string
  message: string
  code: string
  severity: 'info'
}

export interface TestResult {
  name: string
  status: 'pass' | 'fail' | 'skip'
  duration: number
  message?: string
}

export interface TestCoverage {
  statements: number
  branches: number
  functions: number
  lines: number
}

export interface TestError {
  name: string
  message: string
  stack?: string
  type: 'error' | 'timeout' | 'assertion'
}

export interface UsageAnalytics {
  installations: number
  activations: number
  deactivations: number
  updates: number
  uninstalls: number
  trends: UsageTrend[]
}

export interface PerformanceAnalytics {
  averageLoadTime: number
  averageRenderTime: number
  memoryUsage: number
  cpuUsage: number
  errorRate: number
  trends: PerformanceTrend[]
}

export interface ErrorAnalytics {
  totalErrors: number
  errorRate: number
  errorTypes: Record<string, number>
  trends: ErrorTrend[]
}

export interface FeedbackAnalytics {
  totalReviews: number
  averageRating: number
  ratingDistribution: Record<number, number>
  sentiment: {
    positive: number
    neutral: number
    negative: number
  }
}

export interface UsageTrend {
  date: string
  value: number
  type: 'installations' | 'activations' | 'deactivations'
}

export interface PerformanceTrend {
  date: string
  loadTime: number
  renderTime: number
  memoryUsage: number
  cpuUsage: number
}

export interface StoreBrowseOptions {
  category?: PluginCategory
  featured?: boolean
  trending?: boolean
  new?: boolean
  sort?: StoreSortOptions
  pagination?: PaginationOptions
}

export interface StoreSearchOptions {
  category?: PluginCategory
  price?: 'free' | 'paid' | 'all'
  rating?: number
  sort?: StoreSortOptions
  pagination?: PaginationOptions
}

export interface StoreSortOptions {
  field: 'name' | 'rating' | 'downloads' | 'price' | 'createdAt' | 'updatedAt'
  direction: 'asc' | 'desc'
}

export interface StorePlugin {
  id: string
  name: string
  description: string
  version: string
  author: PluginAuthor
  category: PluginCategory
  tags: string[]
  rating: number
  downloads: number
  price: StorePrice
  preview: PluginPreview
  featured: boolean
  trending: boolean
  new: boolean
  createdAt: string
  updatedAt: string
}

export interface StorePluginDetails extends StorePlugin {
  changelog: ChangelogEntry[]
  documentation: string
  support: PluginSupport
  reviews: StoreReview[]
  analytics: StoreAnalytics
  dependencies: PluginDependency[]
  permissions: PluginPermission[]
  security: PluginSecurity
}

export interface StorePrice {
  type: 'free' | 'paid' | 'subscription'
  amount: number
  currency: string
  period?: 'monthly' | 'yearly' | 'lifetime'
  trial?: {
    duration: number
    period: 'days' | 'weeks' | 'months'
  }
}

export interface StoreReview {
  id: string
  userId: string
  userName: string
  rating: number
  title: string
  content: string
  date: string
  helpful: number
  verified: boolean
}

export interface StoreAnalytics {
  views: number
  downloads: number
  installations: number
  ratings: number
  reviews: number
  revenue: number
  trends: StoreTrend[]
}

export interface StoreTrend {
  date: string
  views: number
  downloads: number
  installations: number
  revenue: number
}

export interface StoreInstallResult {
  success: boolean
  pluginId: string
  message: string
  errors?: string[]
}

export interface SystemInfo {
  version: string
  platform: string
  architecture: string
  nodeVersion: string
  memory: {
    total: number
    free: number
    used: number
  }
  cpu: {
    cores: number
    usage: number
  }
  disk: {
    total: number
    free: number
    used: number
  }
}

export interface SystemMetrics {
  uptime: number
  memory: {
    used: number
    free: number
    total: number
  }
  cpu: {
    usage: number
    cores: number
  }
  disk: {
    used: number
    free: number
    total: number
  }
  network: {
    bytesIn: number
    bytesOut: number
    packetsIn: number
    packetsOut: number
  }
}

export interface LogEntry {
  id: string
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  timestamp: string
  source: string
  context: Record<string, any>
}

export interface SandboxInstance {
  id: string
  pluginId: string
  status: 'created' | 'running' | 'stopped' | 'error'
  createdAt: string
  lastActivity: string
}

export interface SandboxResult {
  success: boolean
  result?: any
  error?: string
  duration: number
  memory: number
}

export interface SandboxStatus {
  id: string
  status: 'created' | 'running' | 'stopped' | 'error'
  uptime: number
  memory: number
  cpu: number
  lastActivity: string
}

export interface SandboxMonitor {
  id: string
  status: 'created' | 'running' | 'stopped' | 'error'
  metrics: {
    uptime: number
    memory: number
    cpu: number
    requests: number
    errors: number
  }
  logs: LogEntry[]
  lastActivity: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  info: ValidationInfo[]
}
