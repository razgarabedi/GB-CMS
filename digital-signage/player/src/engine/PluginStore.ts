/**
 * Plugin Store
 * Repository for sharing and discovering plugins
 */

import type {
  PluginStore as IPluginStore,
  StoreBrowseOptions,
  StoreSearchOptions,
  StorePlugin,
  StorePluginDetails,
  StoreInstallResult,
  StoreReview,
  StoreAnalytics
} from '../types/PluginTypes'

export class PluginStore implements IPluginStore {
  private plugins: Map<string, StorePlugin> = new Map()
  private reviews: Map<string, StoreReview[]> = new Map()
  private analytics: Map<string, StoreAnalytics> = new Map()

  constructor() {
    this.initializeDefaultPlugins()
  }

  // ============================================================================
  // STORE OPERATIONS
  // ============================================================================

  /**
   * Browse plugins
   */
  async browsePlugins(options: StoreBrowseOptions = {}): Promise<StorePlugin[]> {
    let plugins = Array.from(this.plugins.values())

    // Apply filters
    if (options.category) {
      plugins = plugins.filter(p => p.category === options.category)
    }
    if (options.featured) {
      plugins = plugins.filter(p => p.featured)
    }
    if (options.trending) {
      plugins = plugins.filter(p => p.trending)
    }
    if (options.new) {
      plugins = plugins.filter(p => p.new)
    }

    // Apply sorting
    if (options.sort) {
      plugins.sort((a, b) => {
        const aValue = this.getNestedValue(a, options.sort!.field)
        const bValue = this.getNestedValue(b, options.sort!.field)
        
        if (options.sort!.direction === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
    }

    // Apply pagination
    if (options.pagination) {
      const { page, size } = options.pagination
      const start = (page - 1) * size
      const end = start + size
      plugins = plugins.slice(start, end)
    }

    return plugins
  }

  /**
   * Search plugins
   */
  async searchPlugins(query: string, options: StoreSearchOptions = {}): Promise<StorePlugin[]> {
    const plugins = await this.browsePlugins(options)
    
    return plugins.filter(plugin => {
      const searchText = [
        plugin.name,
        plugin.description,
        ...plugin.tags
      ].join(' ').toLowerCase()
      
      return searchText.includes(query.toLowerCase())
    })
  }

  /**
   * Get plugin details
   */
  async getPluginDetails(pluginId: string): Promise<StorePluginDetails | null> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      return null
    }

    const reviews = this.reviews.get(pluginId) || []
    const analytics = this.analytics.get(pluginId) || this.createEmptyAnalytics()

    return {
      ...plugin,
      changelog: [],
      documentation: '',
      support: {
        email: plugin.author.email,
        url: plugin.author.website
      },
      reviews,
      analytics,
      dependencies: [],
      permissions: [],
      security: {
        level: 'medium',
        sandbox: true,
        allowedOrigins: [],
        allowedAPIs: [],
        csp: ''
      }
    }
  }

  /**
   * Install plugin
   */
  async installPlugin(pluginId: string): Promise<StoreInstallResult> {
    try {
      const plugin = this.plugins.get(pluginId)
      if (!plugin) {
        return {
          success: false,
          pluginId,
          message: 'Plugin not found'
        }
      }

      // Update analytics
      const analytics = this.analytics.get(pluginId) || this.createEmptyAnalytics()
      analytics.downloads += 1
      analytics.installations += 1
      this.analytics.set(pluginId, analytics)

      return {
        success: true,
        pluginId,
        message: 'Plugin installed successfully'
      }
    } catch (error) {
      return {
        success: false,
        pluginId,
        message: 'Installation failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  /**
   * Rate plugin
   */
  async ratePlugin(pluginId: string, rating: number, review?: string): Promise<void> {
    const reviews = this.reviews.get(pluginId) || []
    
    const newReview: StoreReview = {
      id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: 'user',
      userName: 'User',
      rating,
      title: review ? review.substring(0, 50) : 'Plugin Review',
      content: review || '',
      date: new Date().toISOString(),
      helpful: 0,
      verified: true
    }

    reviews.push(newReview)
    this.reviews.set(pluginId, reviews)

    // Update analytics
    const analytics = this.analytics.get(pluginId) || this.createEmptyAnalytics()
    analytics.reviews += 1
    analytics.ratings += 1
    this.analytics.set(pluginId, analytics)
  }

  /**
   * Get plugin reviews
   */
  async getPluginReviews(pluginId: string): Promise<StoreReview[]> {
    return this.reviews.get(pluginId) || []
  }

  /**
   * Get plugin analytics
   */
  async getPluginAnalytics(pluginId: string): Promise<StoreAnalytics> {
    return this.analytics.get(pluginId) || this.createEmptyAnalytics()
  }

  /**
   * Update plugin analytics
   */
  async updatePluginAnalytics(pluginId: string, updates: Partial<StoreAnalytics>): Promise<void> {
    const analytics = this.analytics.get(pluginId) || this.createEmptyAnalytics()
    const updatedAnalytics = { ...analytics, ...updates }
    this.analytics.set(pluginId, updatedAnalytics)
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Initialize default plugins
   */
  private initializeDefaultPlugins(): void {
    const defaultPlugins: StorePlugin[] = [
      {
        id: 'weather-widget-pro',
        name: 'Weather Widget Pro',
        description: 'Advanced weather widget with multiple locations and detailed forecasts',
        version: '2.1.0',
        author: {
          id: 'weather-pro',
          name: 'Weather Pro Team',
          email: 'team@weatherpro.com',
          website: 'https://weatherpro.com'
        },
        category: 'widget',
        tags: ['weather', 'forecast', 'location', 'pro'],
        rating: 4.8,
        downloads: 15420,
        price: {
          type: 'paid',
          amount: 29.99,
          currency: 'USD'
        },
        preview: {
          images: ['https://example.com/weather-preview.jpg'],
          videos: [],
          liveUrl: 'https://demo.weatherpro.com'
        },
        featured: true,
        trending: true,
        new: false,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-03-20T14:30:00Z'
      },
      {
        id: 'social-media-feed',
        name: 'Social Media Feed',
        description: 'Display social media feeds from multiple platforms',
        version: '1.5.2',
        author: {
          id: 'social-feed',
          name: 'Social Feed Solutions',
          email: 'contact@socialfeed.com',
          website: 'https://socialfeed.com'
        },
        category: 'widget',
        tags: ['social', 'media', 'feed', 'twitter', 'facebook', 'instagram'],
        rating: 4.6,
        downloads: 8930,
        price: {
          type: 'free',
          amount: 0,
          currency: 'USD'
        },
        preview: {
          images: ['https://example.com/social-preview.jpg'],
          videos: []
        },
        featured: false,
        trending: true,
        new: false,
        createdAt: '2024-02-01T09:00:00Z',
        updatedAt: '2024-03-18T16:45:00Z'
      },
      {
        id: 'analytics-dashboard',
        name: 'Analytics Dashboard',
        description: 'Comprehensive analytics dashboard with charts and metrics',
        version: '3.0.1',
        author: {
          id: 'analytics-pro',
          name: 'Analytics Pro',
          email: 'support@analyticspro.com',
          website: 'https://analyticspro.com'
        },
        category: 'widget',
        tags: ['analytics', 'dashboard', 'charts', 'metrics', 'data'],
        rating: 4.9,
        downloads: 22150,
        price: {
          type: 'subscription',
          amount: 19.99,
          currency: 'USD',
          period: 'monthly'
        },
        preview: {
          images: ['https://example.com/analytics-preview.jpg'],
          videos: ['https://example.com/analytics-demo.mp4']
        },
        featured: true,
        trending: false,
        new: false,
        createdAt: '2024-01-10T08:00:00Z',
        updatedAt: '2024-03-22T11:20:00Z'
      },
      {
        id: 'news-ticker',
        name: 'News Ticker',
        description: 'Scrolling news ticker with RSS feed support',
        version: '1.2.0',
        author: {
          id: 'news-ticker',
          name: 'News Ticker Solutions',
          email: 'info@newsticker.com',
          website: 'https://newsticker.com'
        },
        category: 'widget',
        tags: ['news', 'ticker', 'rss', 'scrolling', 'feed'],
        rating: 4.3,
        downloads: 5670,
        price: {
          type: 'free',
          amount: 0,
          currency: 'USD'
        },
        preview: {
          images: ['https://example.com/ticker-preview.jpg'],
          videos: []
        },
        featured: false,
        trending: false,
        new: true,
        createdAt: '2024-03-15T12:00:00Z',
        updatedAt: '2024-03-15T12:00:00Z'
      },
      {
        id: 'calendar-events',
        name: 'Calendar Events',
        description: 'Display calendar events and schedules',
        version: '2.0.3',
        author: {
          id: 'calendar-pro',
          name: 'Calendar Pro Team',
          email: 'team@calendarpro.com',
          website: 'https://calendarpro.com'
        },
        category: 'widget',
        tags: ['calendar', 'events', 'schedule', 'appointments'],
        rating: 4.7,
        downloads: 12340,
        price: {
          type: 'paid',
          amount: 49.99,
          currency: 'USD'
        },
        preview: {
          images: ['https://example.com/calendar-preview.jpg'],
          videos: []
        },
        featured: false,
        trending: true,
        new: false,
        createdAt: '2024-01-20T15:00:00Z',
        updatedAt: '2024-03-19T09:15:00Z'
      }
    ]

    defaultPlugins.forEach(plugin => {
      this.plugins.set(plugin.id, plugin)
      this.analytics.set(plugin.id, this.createEmptyAnalytics())
    })
  }

  /**
   * Create empty analytics
   */
  private createEmptyAnalytics(): StoreAnalytics {
    return {
      views: 0,
      downloads: 0,
      installations: 0,
      ratings: 0,
      reviews: 0,
      revenue: 0,
      trends: []
    }
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.plugins.clear()
    this.reviews.clear()
    this.analytics.clear()
  }
}
