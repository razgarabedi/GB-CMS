/**
 * Advanced Template System Types
 * Enhanced template system with dynamic components, conditional logic, and marketplace features
 */

import type { ScreenConfig, ConfigVariable, ConfigValidationResult } from './ConfigTypes'
import type { LayoutConfig, ComponentDefinition } from './LayoutTypes'

// ============================================================================
// CORE TEMPLATE TYPES
// ============================================================================

/**
 * Advanced template interface with enhanced features
 */
export interface AdvancedTemplate {
  /** Template metadata */
  metadata: TemplateMetadata
  /** Template configuration */
  config: TemplateConfig
  /** Template variables */
  variables: TemplateVariable[]
  /** Template components */
  components: TemplateComponent[]
  /** Template logic */
  logic: TemplateLogic
  /** Template dependencies */
  dependencies: TemplateDependency[]
  /** Template marketplace info */
  marketplace?: TemplateMarketplace
  /** Template analytics */
  analytics?: TemplateAnalytics
}

/**
 * Template metadata
 */
export interface TemplateMetadata {
  /** Template ID */
  id: string
  /** Template name */
  name: string
  /** Template description */
  description: string
  /** Template version */
  version: string
  /** Template category */
  category: TemplateCategory
  /** Template tags */
  tags: string[]
  /** Template author */
  author: TemplateAuthor
  /** Creation timestamp */
  createdAt: string
  /** Last update timestamp */
  updatedAt: string
  /** Template status */
  status: TemplateStatus
  /** Template visibility */
  visibility: TemplateVisibility
  /** Template license */
  license?: TemplateLicense
  /** Template preview */
  preview?: TemplatePreview
  /** Template documentation */
  documentation?: TemplateDocumentation
}

/**
 * Template configuration
 */
export interface TemplateConfig {
  /** Base configuration */
  base: Partial<ScreenConfig>
  /** Component configurations */
  components: Record<string, any>
  /** Layout configuration */
  layout: Partial<LayoutConfig>
  /** Global settings */
  global: Record<string, any>
  /** Conditional configurations */
  conditionals: ConditionalConfig[]
  /** Template inheritance */
  inheritance?: TemplateInheritance
  /** Template overrides */
  overrides: TemplateOverride[]
}

/**
 * Enhanced template variable
 */
export interface TemplateVariable extends ConfigVariable {
  /** Variable group */
  group?: string
  /** Variable dependencies */
  dependencies?: string[]
  /** Variable conditions */
  conditions?: VariableCondition[]
  /** Variable transformations */
  transformations?: VariableTransformation[]
  /** Variable validation rules */
  validationRules?: ValidationRule[]
  /** Variable help text */
  helpText?: string
  /** Variable examples */
  examples?: any[]
}

/**
 * Template component definition
 */
export interface TemplateComponent {
  /** Component ID */
  id: string
  /** Component type */
  type: string
  /** Component name */
  name: string
  /** Component description */
  description?: string
  /** Component category */
  category: ComponentCategory
  /** Component configuration */
  config: ComponentConfig
  /** Component position */
  position: ComponentPosition
  /** Component visibility */
  visibility: ComponentVisibility
  /** Component dependencies */
  dependencies: string[]
  /** Component conditions */
  conditions: ComponentCondition[]
  /** Component styling */
  styling?: ComponentStyling
  /** Component animations */
  animations?: ComponentAnimation[]
  /** Component interactions */
  interactions?: ComponentInteraction[]
}

/**
 * Template logic system
 */
export interface TemplateLogic {
  /** Conditional logic */
  conditionals: ConditionalLogic[]
  /** Event handlers */
  eventHandlers: EventHandler[]
  /** Data transformations */
  transformations: DataTransformation[]
  /** Validation rules */
  validationRules: ValidationRule[]
  /** Business rules */
  businessRules: BusinessRule[]
  /** Custom functions */
  customFunctions?: CustomFunction[]
}

// ============================================================================
// TEMPLATE CATEGORIES AND TYPES
// ============================================================================

/**
 * Template category
 */
export type TemplateCategory = 
  | 'default'
  | 'business'
  | 'education'
  | 'healthcare'
  | 'retail'
  | 'hospitality'
  | 'transportation'
  | 'government'
  | 'entertainment'
  | 'sports'
  | 'news'
  | 'weather'
  | 'energy'
  | 'custom'

/**
 * Template status
 */
export type TemplateStatus = 
  | 'draft'
  | 'published'
  | 'archived'
  | 'deprecated'
  | 'beta'
  | 'stable'

/**
 * Template visibility
 */
export type TemplateVisibility = 
  | 'public'
  | 'private'
  | 'unlisted'
  | 'organization'
  | 'team'

/**
 * Component category
 */
export type ComponentCategory = 
  | 'widget'
  | 'layout'
  | 'utility'
  | 'media'
  | 'data'
  | 'interactive'
  | 'navigation'
  | 'content'

// ============================================================================
// TEMPLATE AUTHOR AND LICENSING
// ============================================================================

/**
 * Template author
 */
export interface TemplateAuthor {
  /** Author ID */
  id: string
  /** Author name */
  name: string
  /** Author email */
  email?: string
  /** Author website */
  website?: string
  /** Author avatar */
  avatar?: string
  /** Author bio */
  bio?: string
  /** Author organization */
  organization?: string
  /** Author social links */
  social?: Record<string, string>
}

/**
 * Template license
 */
export interface TemplateLicense {
  /** License type */
  type: 'MIT' | 'Apache-2.0' | 'GPL-3.0' | 'BSD-3-Clause' | 'Custom'
  /** License text */
  text?: string
  /** License URL */
  url?: string
  /** Commercial use allowed */
  commercialUse: boolean
  /** Modification allowed */
  modification: boolean
  /** Distribution allowed */
  distribution: boolean
  /** Attribution required */
  attribution: boolean
}

// ============================================================================
// TEMPLATE PREVIEW AND DOCUMENTATION
// ============================================================================

/**
 * Template preview
 */
export interface TemplatePreview {
  /** Preview images */
  images: PreviewImage[]
  /** Preview videos */
  videos?: PreviewVideo[]
  /** Live preview URL */
  liveUrl?: string
  /** Preview configuration */
  config: Record<string, any>
  /** Preview metadata */
  metadata: Record<string, any>
}

/**
 * Preview image
 */
export interface PreviewImage {
  /** Image URL */
  url: string
  /** Image alt text */
  alt: string
  /** Image caption */
  caption?: string
  /** Image dimensions */
  dimensions: { width: number; height: number }
  /** Image type */
  type: 'screenshot' | 'mockup' | 'diagram' | 'icon'
}

/**
 * Preview video
 */
export interface PreviewVideo {
  /** Video URL */
  url: string
  /** Video thumbnail */
  thumbnail: string
  /** Video duration */
  duration: number
  /** Video description */
  description?: string
}

/**
 * Template documentation
 */
export interface TemplateDocumentation {
  /** Getting started guide */
  gettingStarted?: string
  /** Configuration guide */
  configuration?: string
  /** Customization guide */
  customization?: string
  /** Troubleshooting guide */
  troubleshooting?: string
  /** FAQ */
  faq?: FAQ[]
  /** Changelog */
  changelog?: ChangelogEntry[]
  /** Support information */
  support?: SupportInfo
}

/**
 * FAQ entry
 */
export interface FAQ {
  /** Question */
  question: string
  /** Answer */
  answer: string
  /** Category */
  category?: string
}

/**
 * Changelog entry
 */
export interface ChangelogEntry {
  /** Version */
  version: string
  /** Date */
  date: string
  /** Changes */
  changes: string[]
  /** Type */
  type: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security'
}

/**
 * Support information
 */
export interface SupportInfo {
  /** Support email */
  email?: string
  /** Support URL */
  url?: string
  /** Documentation URL */
  documentation?: string
  /** Community forum */
  forum?: string
  /** Issue tracker */
  issues?: string
}

// ============================================================================
// TEMPLATE LOGIC AND CONDITIONALS
// ============================================================================

/**
 * Conditional configuration
 */
export interface ConditionalConfig {
  /** Condition ID */
  id: string
  /** Condition name */
  name: string
  /** Condition expression */
  expression: string
  /** Condition result */
  result: any
  /** Condition priority */
  priority: number
  /** Condition description */
  description?: string
}

/**
 * Variable condition
 */
export interface VariableCondition {
  /** Condition type */
  type: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'regex'
  /** Condition value */
  value: any
  /** Condition field */
  field?: string
  /** Condition message */
  message?: string
}

/**
 * Variable transformation
 */
export interface VariableTransformation {
  /** Transformation type */
  type: 'format' | 'validate' | 'transform' | 'default'
  /** Transformation function */
  function: string
  /** Transformation parameters */
  parameters?: Record<string, any>
}

/**
 * Conditional logic
 */
export interface ConditionalLogic {
  /** Logic ID */
  id: string
  /** Logic name */
  name: string
  /** Logic condition */
  condition: string
  /** Logic actions */
  actions: LogicAction[]
  /** Logic priority */
  priority: number
  /** Logic description */
  description?: string
}

/**
 * Logic action
 */
export interface LogicAction {
  /** Action type */
  type: 'show' | 'hide' | 'enable' | 'disable' | 'set' | 'call'
  /** Action target */
  target: string
  /** Action value */
  value?: any
  /** Action parameters */
  parameters?: Record<string, any>
}

/**
 * Event handler
 */
export interface EventHandler {
  /** Event type */
  event: string
  /** Event target */
  target: string
  /** Event action */
  action: string
  /** Event parameters */
  parameters?: Record<string, any>
  /** Event conditions */
  conditions?: string[]
}

/**
 * Data transformation
 */
export interface DataTransformation {
  /** Transformation ID */
  id: string
  /** Transformation name */
  name: string
  /** Transformation type */
  type: 'map' | 'filter' | 'reduce' | 'sort' | 'group'
  /** Transformation function */
  function: string
  /** Transformation parameters */
  parameters?: Record<string, any>
}

/**
 * Validation rule
 */
export interface ValidationRule {
  /** Rule ID */
  id: string
  /** Rule name */
  name: string
  /** Rule type */
  type: 'required' | 'format' | 'range' | 'custom'
  /** Rule expression */
  expression: string
  /** Rule message */
  message: string
  /** Rule severity */
  severity: 'error' | 'warning' | 'info'
}

/**
 * Business rule
 */
export interface BusinessRule {
  /** Rule ID */
  id: string
  /** Rule name */
  name: string
  /** Rule description */
  description: string
  /** Rule condition */
  condition: string
  /** Rule action */
  action: string
  /** Rule priority */
  priority: number
}

/**
 * Custom function
 */
export interface CustomFunction {
  /** Function ID */
  id: string
  /** Function name */
  name: string
  /** Function description */
  description: string
  /** Function code */
  code: string
  /** Function parameters */
  parameters: FunctionParameter[]
  /** Function return type */
  returnType: string
}

/**
 * Function parameter
 */
export interface FunctionParameter {
  /** Parameter name */
  name: string
  /** Parameter type */
  type: string
  /** Parameter required */
  required: boolean
  /** Parameter default value */
  defaultValue?: any
  /** Parameter description */
  description?: string
}

// ============================================================================
// TEMPLATE COMPONENTS
// ============================================================================

/**
 * Component configuration
 */
export interface ComponentConfig {
  /** Component properties */
  properties: Record<string, any>
  /** Component settings */
  settings: Record<string, any>
  /** Component data sources */
  dataSources: DataSource[]
  /** Component styling */
  styling: Record<string, any>
  /** Component animations */
  animations: Record<string, any>
  /** Component interactions */
  interactions: Record<string, any>
}

/**
 * Data source
 */
export interface DataSource {
  /** Source ID */
  id: string
  /** Source type */
  type: 'api' | 'database' | 'file' | 'websocket' | 'static'
  /** Source URL */
  url?: string
  /** Source configuration */
  config: Record<string, any>
  /** Source refresh interval */
  refreshInterval?: number
  /** Source transformation */
  transformation?: string
}

/**
 * Component position
 */
export interface ComponentPosition {
  /** Grid position */
  grid: {
    x: number
    y: number
    width: number
    height: number
  }
  /** Responsive positions */
  responsive?: {
    mobile?: Partial<ComponentPosition['grid']>
    tablet?: Partial<ComponentPosition['grid']>
    desktop?: Partial<ComponentPosition['grid']>
  }
  /** Position constraints */
  constraints?: {
    minWidth?: number
    maxWidth?: number
    minHeight?: number
    maxHeight?: number
    aspectRatio?: number
  }
}

/**
 * Component visibility
 */
export interface ComponentVisibility {
  /** Default visibility */
  default: boolean
  /** Conditional visibility */
  conditionals: VisibilityCondition[]
  /** Responsive visibility */
  responsive?: {
    mobile?: boolean
    tablet?: boolean
    desktop?: boolean
  }
}

/**
 * Visibility condition
 */
export interface VisibilityCondition {
  /** Condition expression */
  expression: string
  /** Visibility value */
  visible: boolean
  /** Condition priority */
  priority: number
}

/**
 * Component condition
 */
export interface ComponentCondition {
  /** Condition ID */
  id: string
  /** Condition name */
  name: string
  /** Condition expression */
  expression: string
  /** Condition result */
  result: any
  /** Condition priority */
  priority: number
}

/**
 * Component styling
 */
export interface ComponentStyling {
  /** CSS classes */
  classes: string[]
  /** Inline styles */
  styles: Record<string, any>
  /** CSS variables */
  variables: Record<string, any>
  /** Theme overrides */
  themeOverrides: Record<string, any>
  /** Responsive styles */
  responsive?: {
    mobile?: Record<string, any>
    tablet?: Record<string, any>
    desktop?: Record<string, any>
  }
}

/**
 * Component animation
 */
export interface ComponentAnimation {
  /** Animation ID */
  id: string
  /** Animation name */
  name: string
  /** Animation type */
  type: 'entrance' | 'exit' | 'hover' | 'focus' | 'click' | 'custom'
  /** Animation duration */
  duration: number
  /** Animation delay */
  delay?: number
  /** Animation easing */
  easing: string
  /** Animation keyframes */
  keyframes: AnimationKeyframe[]
  /** Animation triggers */
  triggers: string[]
}

/**
 * Animation keyframe
 */
export interface AnimationKeyframe {
  /** Keyframe offset */
  offset: number
  /** Keyframe properties */
  properties: Record<string, any>
}

/**
 * Component interaction
 */
export interface ComponentInteraction {
  /** Interaction ID */
  id: string
  /** Interaction type */
  type: 'click' | 'hover' | 'focus' | 'blur' | 'change' | 'custom'
  /** Interaction target */
  target: string
  /** Interaction action */
  action: string
  /** Interaction parameters */
  parameters?: Record<string, any>
  /** Interaction conditions */
  conditions?: string[]
}

// ============================================================================
// TEMPLATE DEPENDENCIES AND INHERITANCE
// ============================================================================

/**
 * Template dependency
 */
export interface TemplateDependency {
  /** Dependency ID */
  id: string
  /** Dependency name */
  name: string
  /** Dependency type */
  type: 'template' | 'component' | 'library' | 'service'
  /** Dependency version */
  version: string
  /** Dependency source */
  source: string
  /** Dependency required */
  required: boolean
  /** Dependency description */
  description?: string
}

/**
 * Template inheritance
 */
export interface TemplateInheritance {
  /** Parent template ID */
  parentId: string
  /** Parent template version */
  parentVersion: string
  /** Inherited properties */
  inherited: string[]
  /** Overridden properties */
  overridden: string[]
  /** Inheritance level */
  level: number
}

/**
 * Template override
 */
export interface TemplateOverride {
  /** Override ID */
  id: string
  /** Override path */
  path: string
  /** Override value */
  value: any
  /** Override condition */
  condition?: string
  /** Override priority */
  priority: number
}

// ============================================================================
// TEMPLATE MARKETPLACE
// ============================================================================

/**
 * Template marketplace information
 */
export interface TemplateMarketplace {
  /** Marketplace ID */
  id: string
  /** Marketplace status */
  status: 'published' | 'unpublished' | 'pending' | 'rejected'
  /** Marketplace rating */
  rating?: number
  /** Marketplace reviews */
  reviews?: TemplateReview[]
  /** Marketplace downloads */
  downloads: number
  /** Marketplace price */
  price?: TemplatePrice
  /** Marketplace categories */
  categories: string[]
  /** Marketplace featured */
  featured: boolean
  /** Marketplace promoted */
  promoted: boolean
  /** Marketplace tags */
  tags: string[]
  /** Marketplace metadata */
  metadata: Record<string, any>
}

/**
 * Template review
 */
export interface TemplateReview {
  /** Review ID */
  id: string
  /** Reviewer ID */
  reviewerId: string
  /** Reviewer name */
  reviewerName: string
  /** Review rating */
  rating: number
  /** Review title */
  title: string
  /** Review content */
  content: string
  /** Review date */
  date: string
  /** Review helpful */
  helpful: number
  /** Review verified */
  verified: boolean
}

/**
 * Template price
 */
export interface TemplatePrice {
  /** Price type */
  type: 'free' | 'paid' | 'subscription'
  /** Price amount */
  amount: number
  /** Price currency */
  currency: string
  /** Price period */
  period?: 'monthly' | 'yearly' | 'lifetime'
  /** Price trial */
  trial?: {
    duration: number
    period: 'days' | 'weeks' | 'months'
  }
}

// ============================================================================
// TEMPLATE ANALYTICS
// ============================================================================

/**
 * Template analytics
 */
export interface TemplateAnalytics {
  /** Usage statistics */
  usage: UsageStats
  /** Performance metrics */
  performance: PerformanceMetrics
  /** Error tracking */
  errors: ErrorStats
  /** User feedback */
  feedback: FeedbackStats
  /** Market insights */
  market: MarketInsights
}

/**
 * Usage statistics
 */
export interface UsageStats {
  /** Total installations */
  installations: number
  /** Active installations */
  activeInstallations: number
  /** Total views */
  views: number
  /** Unique viewers */
  uniqueViewers: number
  /** Average session duration */
  averageSessionDuration: number
  /** Usage by region */
  usageByRegion: Record<string, number>
  /** Usage by device */
  usageByDevice: Record<string, number>
  /** Usage trends */
  trends: UsageTrend[]
}

/**
 * Usage trend
 */
export interface UsageTrend {
  /** Date */
  date: string
  /** Value */
  value: number
  /** Type */
  type: 'installations' | 'views' | 'active'
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  /** Load time */
  loadTime: number
  /** Render time */
  renderTime: number
  /** Memory usage */
  memoryUsage: number
  /** CPU usage */
  cpuUsage: number
  /** Network usage */
  networkUsage: number
  /** Error rate */
  errorRate: number
  /** Uptime */
  uptime: number
}

/**
 * Error statistics
 */
export interface ErrorStats {
  /** Total errors */
  totalErrors: number
  /** Error rate */
  errorRate: number
  /** Error types */
  errorTypes: Record<string, number>
  /** Error trends */
  errorTrends: ErrorTrend[]
  /** Critical errors */
  criticalErrors: number
  /** Resolved errors */
  resolvedErrors: number
}

/**
 * Error trend
 */
export interface ErrorTrend {
  /** Date */
  date: string
  /** Error count */
  count: number
  /** Error type */
  type: string
}

/**
 * Feedback statistics
 */
export interface FeedbackStats {
  /** Total feedback */
  totalFeedback: number
  /** Average rating */
  averageRating: number
  /** Rating distribution */
  ratingDistribution: Record<number, number>
  /** Feedback categories */
  categories: Record<string, number>
  /** Sentiment analysis */
  sentiment: {
    positive: number
    neutral: number
    negative: number
  }
}

/**
 * Market insights
 */
export interface MarketInsights {
  /** Market position */
  position: number
  /** Market share */
  marketShare: number
  /** Competitor analysis */
  competitors: CompetitorAnalysis[]
  /** Market trends */
  trends: MarketTrend[]
  /** Opportunities */
  opportunities: string[]
  /** Threats */
  threats: string[]
}

/**
 * Competitor analysis
 */
export interface CompetitorAnalysis {
  /** Competitor name */
  name: string
  /** Competitor rating */
  rating: number
  /** Competitor price */
  price: number
  /** Competitor features */
  features: string[]
  /** Competitive advantage */
  advantage: string
}

/**
 * Market trend
 */
export interface MarketTrend {
  /** Trend name */
  name: string
  /** Trend direction */
  direction: 'up' | 'down' | 'stable'
  /** Trend magnitude */
  magnitude: number
  /** Trend period */
  period: string
}

// ============================================================================
// TEMPLATE BUILDER TYPES
// ============================================================================

/**
 * Template builder interface
 */
export interface TemplateBuilder {
  /** Builder ID */
  id: string
  /** Builder name */
  name: string
  /** Builder version */
  version: string
  /** Builder configuration */
  config: BuilderConfig
  /** Builder tools */
  tools: BuilderTool[]
  /** Builder templates */
  templates: BuilderTemplate[]
  /** Builder validation */
  validation: BuilderValidation
}

/**
 * Builder configuration
 */
export interface BuilderConfig {
  /** Grid system */
  grid: GridConfig
  /** Component library */
  componentLibrary: ComponentLibrary
  /** Theme system */
  theme: ThemeConfig
  /** Animation system */
  animation: AnimationConfig
  /** Responsive breakpoints */
  breakpoints: BreakpointConfig
}

/**
 * Grid configuration
 */
export interface GridConfig {
  /** Grid columns */
  columns: number
  /** Grid rows */
  rows: number
  /** Grid gap */
  gap: number
  /** Grid snap */
  snap: boolean
  /** Grid constraints */
  constraints: GridConstraints
}

/**
 * Grid constraints
 */
export interface GridConstraints {
  /** Minimum component size */
  minSize: { width: number; height: number }
  /** Maximum component size */
  maxSize: { width: number; height: number }
  /** Aspect ratio constraints */
  aspectRatios: number[]
  /** Collision detection */
  collisionDetection: boolean
}

/**
 * Component library
 */
export interface ComponentLibrary {
  /** Available components */
  components: ComponentDefinition[]
  /** Component categories */
  categories: ComponentCategory[]
  /** Component search */
  search: SearchConfig
  /** Component filters */
  filters: FilterConfig
}

/**
 * Search configuration
 */
export interface SearchConfig {
  /** Search fields */
  fields: string[]
  /** Search operators */
  operators: string[]
  /** Search highlighting */
  highlighting: boolean
  /** Search suggestions */
  suggestions: boolean
}

/**
 * Filter configuration
 */
export interface FilterConfig {
  /** Available filters */
  filters: Filter[]
  /** Filter combinations */
  combinations: FilterCombination[]
  /** Filter persistence */
  persistence: boolean
}

/**
 * Filter
 */
export interface Filter {
  /** Filter ID */
  id: string
  /** Filter name */
  name: string
  /** Filter type */
  type: 'select' | 'range' | 'text' | 'boolean'
  /** Filter options */
  options?: any[]
  /** Filter default */
  defaultValue?: any
}

/**
 * Filter combination
 */
export interface FilterCombination {
  /** Combination ID */
  id: string
  /** Combination name */
  name: string
  /** Combination filters */
  filters: string[]
  /** Combination logic */
  logic: 'AND' | 'OR'
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  /** Available themes */
  themes: Theme[]
  /** Theme variables */
  variables: ThemeVariable[]
  /** Theme inheritance */
  inheritance: boolean
  /** Theme customization */
  customization: boolean
}

/**
 * Theme
 */
export interface Theme {
  /** Theme ID */
  id: string
  /** Theme name */
  name: string
  /** Theme description */
  description: string
  /** Theme colors */
  colors: Record<string, string>
  /** Theme typography */
  typography: Record<string, any>
  /** Theme spacing */
  spacing: Record<string, number>
  /** Theme shadows */
  shadows: Record<string, string>
}

/**
 * Theme variable
 */
export interface ThemeVariable {
  /** Variable name */
  name: string
  /** Variable type */
  type: 'color' | 'size' | 'font' | 'spacing' | 'shadow'
  /** Variable value */
  value: any
  /** Variable description */
  description: string
  /** Variable editable */
  editable: boolean
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  /** Available animations */
  animations: Animation[]
  /** Animation presets */
  presets: AnimationPreset[]
  /** Animation timing */
  timing: TimingConfig
  /** Animation easing */
  easing: EasingConfig
}

/**
 * Animation
 */
export interface Animation {
  /** Animation ID */
  id: string
  /** Animation name */
  name: string
  /** Animation type */
  type: string
  /** Animation duration */
  duration: number
  /** Animation keyframes */
  keyframes: AnimationKeyframe[]
}

/**
 * Animation preset
 */
export interface AnimationPreset {
  /** Preset ID */
  id: string
  /** Preset name */
  name: string
  /** Preset description */
  description: string
  /** Preset animations */
  animations: string[]
  /** Preset timing */
  timing: Record<string, any>
}

/**
 * Timing configuration
 */
export interface TimingConfig {
  /** Default duration */
  defaultDuration: number
  /** Duration range */
  durationRange: { min: number; max: number }
  /** Duration steps */
  durationSteps: number[]
  /** Default delay */
  defaultDelay: number
  /** Delay range */
  delayRange: { min: number; max: number }
}

/**
 * Easing configuration
 */
export interface EasingConfig {
  /** Available easings */
  easings: Easing[]
  /** Default easing */
  defaultEasing: string
  /** Custom easings */
  customEasings: CustomEasing[]
}

/**
 * Easing
 */
export interface Easing {
  /** Easing name */
  name: string
  /** Easing function */
  function: string
  /** Easing description */
  description: string
}

/**
 * Custom easing
 */
export interface CustomEasing {
  /** Easing name */
  name: string
  /** Easing definition */
  definition: string
  /** Easing parameters */
  parameters: EasingParameter[]
}

/**
 * Easing parameter
 */
export interface EasingParameter {
  /** Parameter name */
  name: string
  /** Parameter type */
  type: 'number' | 'string' | 'boolean'
  /** Parameter default */
  defaultValue: any
  /** Parameter range */
  range?: { min: number; max: number }
}

/**
 * Breakpoint configuration
 */
export interface BreakpointConfig {
  /** Available breakpoints */
  breakpoints: Breakpoint[]
  /** Default breakpoint */
  defaultBreakpoint: string
  /** Breakpoint inheritance */
  inheritance: boolean
}

/**
 * Breakpoint
 */
export interface Breakpoint {
  /** Breakpoint ID */
  id: string
  /** Breakpoint name */
  name: string
  /** Breakpoint width */
  width: number
  /** Breakpoint height */
  height?: number
  /** Breakpoint description */
  description: string
}

/**
 * Builder tool
 */
export interface BuilderTool {
  /** Tool ID */
  id: string
  /** Tool name */
  name: string
  /** Tool type */
  type: 'selector' | 'inspector' | 'preview' | 'code' | 'assets'
  /** Tool configuration */
  config: Record<string, any>
  /** Tool position */
  position: 'left' | 'right' | 'top' | 'bottom' | 'floating'
  /** Tool visibility */
  visibility: boolean
  /** Tool permissions */
  permissions: string[]
}

/**
 * Builder template
 */
export interface BuilderTemplate {
  /** Template ID */
  id: string
  /** Template name */
  name: string
  /** Template description */
  description: string
  /** Template category */
  category: string
  /** Template preview */
  preview: string
  /** Template configuration */
  config: Record<string, any>
  /** Template components */
  components: ComponentDefinition[]
}

/**
 * Builder validation
 */
export interface BuilderValidation {
  /** Validation rules */
  rules: ValidationRule[]
  /** Validation triggers */
  triggers: string[]
  /** Validation feedback */
  feedback: ValidationFeedback
  /** Validation testing */
  testing: ValidationTesting
}

/**
 * Validation feedback
 */
export interface ValidationFeedback {
  /** Real-time validation */
  realTime: boolean
  /** Validation messages */
  messages: ValidationMessage[]
  /** Validation severity */
  severity: 'error' | 'warning' | 'info'
  /** Validation display */
  display: 'inline' | 'panel' | 'modal'
}

/**
 * Validation message
 */
export interface ValidationMessage {
  /** Message ID */
  id: string
  /** Message type */
  type: 'error' | 'warning' | 'info' | 'success'
  /** Message text */
  text: string
  /** Message target */
  target: string
  /** Message actions */
  actions: ValidationAction[]
}

/**
 * Validation action
 */
export interface ValidationAction {
  /** Action type */
  type: 'fix' | 'ignore' | 'learn' | 'custom'
  /** Action label */
  label: string
  /** Action function */
  function: string
  /** Action parameters */
  parameters?: Record<string, any>
}

/**
 * Validation testing
 */
export interface ValidationTesting {
  /** Test automation */
  automation: boolean
  /** Test scenarios */
  scenarios: TestScenario[]
  /** Test coverage */
  coverage: TestCoverage
  /** Test reporting */
  reporting: TestReporting
}

/**
 * Test scenario
 */
export interface TestScenario {
  /** Scenario ID */
  id: string
  /** Scenario name */
  name: string
  /** Scenario description */
  description: string
  /** Scenario steps */
  steps: TestStep[]
  /** Scenario expected */
  expected: any
  /** Scenario actual */
  actual?: any
  /** Scenario status */
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped'
}

/**
 * Test step
 */
export interface TestStep {
  /** Step ID */
  id: string
  /** Step type */
  type: 'action' | 'assertion' | 'wait' | 'custom'
  /** Step description */
  description: string
  /** Step parameters */
  parameters: Record<string, any>
  /** Step result */
  result?: any
}

/**
 * Test coverage
 */
export interface TestCoverage {
  /** Coverage percentage */
  percentage: number
  /** Coverage areas */
  areas: CoverageArea[]
  /** Coverage gaps */
  gaps: CoverageGap[]
  /** Coverage trends */
  trends: CoverageTrend[]
}

/**
 * Coverage area
 */
export interface CoverageArea {
  /** Area name */
  name: string
  /** Area coverage */
  coverage: number
  /** Area tests */
  tests: number
  /** Area lines */
  lines: number
}

/**
 * Coverage gap
 */
export interface CoverageGap {
  /** Gap type */
  type: 'component' | 'function' | 'condition' | 'branch'
  /** Gap location */
  location: string
  /** Gap description */
  description: string
  /** Gap priority */
  priority: 'low' | 'medium' | 'high' | 'critical'
}

/**
 * Coverage trend
 */
export interface CoverageTrend {
  /** Trend date */
  date: string
  /** Trend coverage */
  coverage: number
  /** Trend tests */
  tests: number
}

/**
 * Test reporting
 */
export interface TestReporting {
  /** Report format */
  format: 'json' | 'html' | 'xml' | 'text'
  /** Report location */
  location: string
  /** Report frequency */
  frequency: 'on-demand' | 'scheduled' | 'continuous'
  /** Report notifications */
  notifications: NotificationConfig[]
}

/**
 * Notification configuration
 */
export interface NotificationConfig {
  /** Notification type */
  type: 'email' | 'slack' | 'webhook' | 'sms'
  /** Notification target */
  target: string
  /** Notification conditions */
  conditions: string[]
  /** Notification template */
  template: string
}

// ============================================================================
// TEMPLATE MANAGEMENT TYPES
// ============================================================================

/**
 * Template manager interface
 */
export interface TemplateManager {
  /** Get template */
  getTemplate(templateId: string): Promise<AdvancedTemplate | null>
  
  /** Save template */
  saveTemplate(template: AdvancedTemplate): Promise<AdvancedTemplate>
  
  /** Delete template */
  deleteTemplate(templateId: string): Promise<boolean>
  
  /** List templates */
  listTemplates(options?: TemplateListOptions): Promise<AdvancedTemplate[]>
  
  /** Search templates */
  searchTemplates(query: string, options?: TemplateSearchOptions): Promise<AdvancedTemplate[]>
  
  /** Validate template */
  validateTemplate(template: AdvancedTemplate): Promise<ConfigValidationResult>
  
  /** Test template */
  testTemplate(template: AdvancedTemplate, testConfig: any): Promise<TestResult>
  
  /** Publish template */
  publishTemplate(templateId: string, marketplace: TemplateMarketplace): Promise<boolean>
  
  /** Import template */
  importTemplate(templateData: any): Promise<AdvancedTemplate>
  
  /** Export template */
  exportTemplate(templateId: string): Promise<TemplateExport>
  
  /** Clone template */
  cloneTemplate(templateId: string, newName: string): Promise<AdvancedTemplate>
  
  /** Get template analytics */
  getTemplateAnalytics(templateId: string): Promise<TemplateAnalytics>
  
  /** Update template analytics */
  updateTemplateAnalytics(templateId: string, analytics: Partial<TemplateAnalytics>): Promise<void>
}

/**
 * Template list options
 */
export interface TemplateListOptions {
  /** Filter by category */
  category?: TemplateCategory
  /** Filter by status */
  status?: TemplateStatus
  /** Filter by visibility */
  visibility?: TemplateVisibility
  /** Filter by author */
  author?: string
  /** Sort options */
  sort?: TemplateSortOptions
  /** Pagination */
  pagination?: PaginationOptions
}

/**
 * Template sort options
 */
export interface TemplateSortOptions {
  /** Sort field */
  field: 'name' | 'createdAt' | 'updatedAt' | 'rating' | 'downloads'
  /** Sort direction */
  direction: 'asc' | 'desc'
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  /** Page number */
  page: number
  /** Page size */
  size: number
  /** Total count */
  total?: number
}

/**
 * Template search options
 */
export interface TemplateSearchOptions {
  /** Search fields */
  fields?: string[]
  /** Search filters */
  filters?: Record<string, any>
  /** Search sort */
  sort?: TemplateSortOptions
  /** Search pagination */
  pagination?: PaginationOptions
}

/**
 * Test result
 */
export interface TestResult {
  /** Test success */
  success: boolean
  /** Test results */
  results: TestScenario[]
  /** Test coverage */
  coverage: TestCoverage
  /** Test errors */
  errors: TestError[]
  /** Test duration */
  duration: number
}

/**
 * Test error
 */
export interface TestError {
  /** Error type */
  type: 'validation' | 'runtime' | 'assertion' | 'timeout'
  /** Error message */
  message: string
  /** Error location */
  location?: string
  /** Error stack */
  stack?: string
}

/**
 * Template export
 */
export interface TemplateExport {
  /** Export version */
  version: string
  /** Export timestamp */
  timestamp: string
  /** Export metadata */
  metadata: {
    exportedBy: string
    exportReason?: string
    sourceVersion: string
  }
  /** Template data */
  template: AdvancedTemplate
  /** Dependencies */
  dependencies: TemplateDependency[]
  /** Assets */
  assets: TemplateAsset[]
}

/**
 * Template asset
 */
export interface TemplateAsset {
  /** Asset ID */
  id: string
  /** Asset type */
  type: 'image' | 'video' | 'audio' | 'font' | 'icon' | 'document'
  /** Asset URL */
  url: string
  /** Asset size */
  size: number
  /** Asset metadata */
  metadata: Record<string, any>
}
