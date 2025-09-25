/**
 * UI Types for Enhanced Digital Signage Admin Interface
 * 
 * This file defines comprehensive TypeScript types for the enhanced user interface
 * system, including drag-and-drop, visual editing, and component management.
 */

// ============================================================================
// Base UI Types
// ============================================================================

export interface UIPosition {
  x: number;
  y: number;
}

export interface UISize {
  width: number;
  height: number;
}

export interface UIBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UIGrid {
  columns: number;
  rows: number;
  cellSize: number;
  gap: number;
}

export interface UITheme {
  mode: 'light' | 'dark';
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface UIIcon {
  name: string;
  type: 'material' | 'fontawesome' | 'custom' | 'svg';
  data?: string;
  size?: number;
  color?: string;
}

export interface UIAnimation {
  type: 'fade' | 'slide' | 'scale' | 'rotate' | 'bounce' | 'shake';
  duration: number;
  delay?: number;
  easing?: string;
  direction?: 'in' | 'out' | 'in-out';
}

// ============================================================================
// Drag and Drop Types
// ============================================================================

export interface DragItem {
  id: string;
  type: 'component' | 'template' | 'plugin';
  data: any;
  source: 'library' | 'canvas' | 'template';
  position?: UIPosition;
  size?: UISize;
}

export interface DropTarget {
  id: string;
  type: 'canvas' | 'component' | 'zone';
  bounds: UIBounds;
  accepts: string[];
  onDrop: (item: DragItem, position: UIPosition) => void;
}

export interface DragState {
  isDragging: boolean;
  dragItem: DragItem | null;
  dropTarget: DropTarget | null;
  position: UIPosition;
  isValid: boolean;
  preview: HTMLElement | null;
}

// ============================================================================
// Component Library Types
// ============================================================================

export interface ComponentLibraryItem {
  id: string;
  name: string;
  description: string;
  category: ComponentCategory;
  icon: UIIcon;
  component: React.ComponentType<any>;
  propsSchema: JSONSchema;
  defaultProps: Record<string, any>;
  tags: string[];
  isPlugin: boolean;
  pluginId?: string;
  version: string;
  author?: string;
  status: 'available' | 'installing' | 'error' | 'disabled';
}

export type ComponentCategory = 
  | 'widget'
  | 'layout'
  | 'utility'
  | 'service'
  | 'theme'
  | 'integration'
  | 'custom'
  | 'plugin';

export interface ComponentLibrary {
  items: ComponentLibraryItem[];
  categories: ComponentCategory[];
  searchQuery: string;
  selectedCategory: ComponentCategory | 'all';
  sortBy: 'name' | 'category' | 'popularity' | 'recent';
  filterBy: {
    tags: string[];
    status: string[];
    isPlugin: boolean | null;
  };
}

// ============================================================================
// Layout Canvas Types
// ============================================================================

export interface CanvasComponent {
  id: string;
  type: string;
  name: string;
  position: UIPosition;
  size: UISize;
  props: Record<string, any>;
  locked: boolean;
  visible: boolean;
  zIndex: number;
  parent?: string;
  children: string[];
}

export interface CanvasZone {
  id: string;
  name: string;
  bounds: UIBounds;
  type: 'main' | 'sidebar' | 'header' | 'footer' | 'custom';
  accepts: string[];
  maxComponents?: number;
  components: string[];
}

export interface LayoutCanvas {
  id: string;
  name: string;
  size: UISize;
  grid: UIGrid;
  components: CanvasComponent[];
  zones: CanvasZone[];
  selectedComponent: string | null;
  clipboard: CanvasComponent[];
  history: CanvasState[];
  historyIndex: number;
  isDirty: boolean;
  snapToGrid: boolean;
  showGrid: boolean;
  showGuides: boolean;
  zoom: number;
  pan: UIPosition;
}

export interface CanvasState {
  components: CanvasComponent[];
  timestamp: number;
  action: string;
}

export interface CanvasSelection {
  componentIds: string[];
  bounds: UIBounds;
  isMultiSelect: boolean;
}

// ============================================================================
// Properties Panel Types
// ============================================================================

export interface PropertyField {
  id: string;
  name: string;
  type: PropertyFieldType;
  value: any;
  defaultValue: any;
  required: boolean;
  description?: string;
  options?: PropertyOption[];
  validation?: PropertyValidation;
  dependencies?: PropertyDependency[];
  group?: string;
  order: number;
}

export type PropertyFieldType = 
  | 'text'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'color'
  | 'file'
  | 'url'
  | 'json'
  | 'array'
  | 'object'
  | 'date'
  | 'time'
  | 'range'
  | 'textarea'
  | 'code';

export interface PropertyOption {
  value: any;
  label: string;
  description?: string;
  icon?: UIIcon;
  disabled?: boolean;
}

export interface PropertyValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  custom?: (value: any) => string | null;
}

export interface PropertyDependency {
  field: string;
  condition: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
}

export interface PropertiesPanel {
  selectedComponent: string | null;
  fields: PropertyField[];
  groups: PropertyGroup[];
  isCollapsed: boolean;
  searchQuery: string;
  showAdvanced: boolean;
}

export interface PropertyGroup {
  id: string;
  name: string;
  description?: string;
  icon?: UIIcon;
  fields: string[];
  collapsed: boolean;
  order: number;
}

// ============================================================================
// Template Management Types
// ============================================================================

export interface UITemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnail: string;
  preview: string;
  components: CanvasComponent[];
  zones: CanvasZone[];
  size: UISize;
  grid: UIGrid;
  tags: string[];
  author: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  downloads: number;
  rating: number;
  reviews: number;
  isBuiltIn: boolean;
  isCustom: boolean;
}

export type TemplateCategory = 
  | 'business'
  | 'education'
  | 'retail'
  | 'healthcare'
  | 'transportation'
  | 'entertainment'
  | 'corporate'
  | 'custom';

export interface TemplateManager {
  templates: UITemplate[];
  selectedTemplate: string | null;
  searchQuery: string;
  selectedCategory: TemplateCategory | 'all';
  sortBy: 'name' | 'popularity' | 'recent' | 'rating';
  filterBy: {
    tags: string[];
    isPublic: boolean | null;
    isBuiltIn: boolean | null;
  };
  isCreating: boolean;
  isImporting: boolean;
  isExporting: boolean;
}

// ============================================================================
// Plugin Management UI Types
// ============================================================================

export interface PluginUI {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: ComponentCategory;
  icon: UIIcon;
  status: PluginStatus;
  isInstalled: boolean;
  isEnabled: boolean;
  isUpdating: boolean;
  rating: number;
  reviews: number;
  downloads: number;
  size: number;
  dependencies: string[];
  permissions: string[];
  screenshots: string[];
  documentation: string;
  support: string;
  license: string;
  price: number;
  currency: string;
  isFree: boolean;
  isPremium: boolean;
}

export type PluginStatus = 
  | 'available'
  | 'installing'
  | 'installed'
  | 'enabled'
  | 'disabled'
  | 'updating'
  | 'error'
  | 'uninstalling';

export interface PluginManagerUI {
  plugins: PluginUI[];
  selectedPlugin: string | null;
  searchQuery: string;
  selectedCategory: ComponentCategory | 'all';
  sortBy: 'name' | 'popularity' | 'recent' | 'rating' | 'price';
  filterBy: {
    status: PluginStatus[];
    isInstalled: boolean | null;
    isFree: boolean | null;
    category: ComponentCategory[];
  };
  isInstalling: boolean;
  isUninstalling: boolean;
  isUpdating: boolean;
  showStore: boolean;
  showInstalled: boolean;
}

// ============================================================================
// Preview System Types
// ============================================================================

export interface PreviewConfig {
  screenId: string;
  size: UISize;
  theme: UITheme;
  layout: LayoutCanvas;
  components: CanvasComponent[];
  isLive: boolean;
  refreshInterval: number;
  showDebugInfo: boolean;
  showGrid: boolean;
  showGuides: boolean;
  zoom: number;
  deviceType: DeviceType;
}

export type DeviceType = 
  | 'desktop'
  | 'tablet'
  | 'mobile'
  | 'tv'
  | 'custom';

export interface PreviewSystem {
  config: PreviewConfig;
  isVisible: boolean;
  isFullscreen: boolean;
  isRecording: boolean;
  deviceType: DeviceType;
  refreshInterval: number;
  lastRefresh: Date;
  errors: PreviewError[];
  performance: PreviewPerformance;
}

export interface PreviewError {
  id: string;
  componentId: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: Date;
  stack?: string;
}

export interface PreviewPerformance {
  renderTime: number;
  memoryUsage: number;
  componentCount: number;
  errorCount: number;
  warningCount: number;
  lastUpdate: Date;
}

// ============================================================================
// Enhanced Admin Interface Types
// ============================================================================

export interface AdminInterface {
  currentScreen: string | null;
  currentTab: AdminTab;
  componentLibrary: ComponentLibrary;
  layoutCanvas: LayoutCanvas;
  propertiesPanel: PropertiesPanel;
  templateManager: TemplateManager;
  pluginManager: PluginManagerUI;
  previewSystem: PreviewSystem;
  theme: UITheme;
  language: string;
  isFullscreen: boolean;
  isDirty: boolean;
  lastSaved: Date | null;
  autoSave: boolean;
  autoSaveInterval: number;
  shortcuts: KeyboardShortcut[];
  notifications: Notification[];
  help: HelpSystem;
}

export type AdminTab = 
  | 'design'
  | 'components'
  | 'templates'
  | 'plugins'
  | 'preview'
  | 'settings'
  | 'help';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: string;
  description: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  duration?: number;
  actions?: NotificationAction[];
  isRead: boolean;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  type: 'primary' | 'secondary' | 'danger';
}

export interface HelpSystem {
  isVisible: boolean;
  currentTopic: string | null;
  searchQuery: string;
  favorites: string[];
  recent: string[];
  tutorials: Tutorial[];
  faqs: FAQ[];
  documentation: DocumentationSection[];
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  completed: boolean;
  progress: number;
}

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  action?: string;
  target?: string;
  completed: boolean;
  order: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  helpful: number;
  notHelpful: number;
}

export interface DocumentationSection {
  id: string;
  title: string;
  content: string;
  category: string;
  order: number;
  children: DocumentationSection[];
}

// ============================================================================
// Event Types
// ============================================================================

export interface UIEvent {
  type: string;
  timestamp: Date;
  data: any;
  source: string;
  target?: string;
}

export interface ComponentEvent extends UIEvent {
  type: 'component:select' | 'component:deselect' | 'component:move' | 'component:resize' | 'component:delete' | 'component:duplicate';
  componentId: string;
  position?: UIPosition;
  size?: UISize;
}

export interface CanvasEvent extends UIEvent {
  type: 'canvas:zoom' | 'canvas:pan' | 'canvas:grid:toggle' | 'canvas:guides:toggle' | 'canvas:snap:toggle';
  zoom?: number;
  pan?: UIPosition;
  grid?: boolean;
  guides?: boolean;
  snap?: boolean;
}

export interface TemplateEvent extends UIEvent {
  type: 'template:create' | 'template:save' | 'template:load' | 'template:delete' | 'template:export' | 'template:import';
  templateId: string;
  template?: UITemplate;
}

export interface PluginEvent extends UIEvent {
  type: 'plugin:install' | 'plugin:uninstall' | 'plugin:enable' | 'plugin:disable' | 'plugin:update';
  pluginId: string;
  plugin?: PluginUI;
}

// ============================================================================
// API Types
// ============================================================================

export interface UIAPI {
  // Component Library
  getComponents: () => Promise<ComponentLibraryItem[]>;
  searchComponents: (query: string) => Promise<ComponentLibraryItem[]>;
  getComponent: (id: string) => Promise<ComponentLibraryItem>;
  
  // Layout Canvas
  saveLayout: (layout: LayoutCanvas) => Promise<void>;
  loadLayout: (id: string) => Promise<LayoutCanvas>;
  deleteLayout: (id: string) => Promise<void>;
  
  // Templates
  getTemplates: () => Promise<UITemplate[]>;
  saveTemplate: (template: UITemplate) => Promise<void>;
  loadTemplate: (id: string) => Promise<UITemplate>;
  deleteTemplate: (id: string) => Promise<void>;
  exportTemplate: (id: string) => Promise<Blob>;
  importTemplate: (file: File) => Promise<UITemplate>;
  
  // Plugins
  getPlugins: () => Promise<PluginUI[]>;
  installPlugin: (id: string) => Promise<void>;
  uninstallPlugin: (id: string) => Promise<void>;
  enablePlugin: (id: string) => Promise<void>;
  disablePlugin: (id: string) => Promise<void>;
  updatePlugin: (id: string) => Promise<void>;
  
  // Preview
  getPreviewConfig: (screenId: string) => Promise<PreviewConfig>;
  updatePreview: (config: PreviewConfig) => Promise<void>;
  
  // Settings
  getSettings: () => Promise<AdminInterface>;
  saveSettings: (settings: Partial<AdminInterface>) => Promise<void>;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface JSONSchema {
  type: string;
  properties?: Record<string, JSONSchema>;
  required?: string[];
  items?: JSONSchema;
  enum?: any[];
  default?: any;
  description?: string;
  title?: string;
  format?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  value?: any;
}

// All types are already exported as interfaces above
