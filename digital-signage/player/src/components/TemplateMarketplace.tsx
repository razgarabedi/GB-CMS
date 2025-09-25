/**
 * Template Marketplace Component
 * Browse, search, and install templates from the marketplace
 */

import React, { useState, useEffect, useCallback } from 'react'
import type { AdvancedTemplate, TemplateMarketplace, TemplateReview } from '../types/TemplateTypes'

interface TemplateMarketplaceProps {
  /** Available templates */
  templates?: AdvancedTemplate[]
  /** Callback when template is selected */
  onTemplateSelect?: (template: AdvancedTemplate) => void
  /** Callback when template is installed */
  onTemplateInstall?: (template: AdvancedTemplate) => void
  /** Theme */
  theme?: 'dark' | 'light'
  /** Whether the marketplace is visible */
  visible?: boolean
}

interface MarketplaceState {
  searchQuery: string
  selectedCategory: string
  sortBy: 'name' | 'rating' | 'downloads' | 'createdAt' | 'updatedAt'
  sortDirection: 'asc' | 'desc'
  selectedTemplate: AdvancedTemplate | null
  showFilters: boolean
  priceFilter: 'all' | 'free' | 'paid'
  ratingFilter: number
}

export default function TemplateMarketplace({
  templates = [],
  onTemplateSelect,
  onTemplateInstall,
  theme = 'dark',
  visible = true
}: TemplateMarketplaceProps) {
  const [marketplaceState, setMarketplaceState] = useState<MarketplaceState>({
    searchQuery: '',
    selectedCategory: 'all',
    sortBy: 'rating',
    sortDirection: 'desc',
    selectedTemplate: null,
    showFilters: false,
    priceFilter: 'all',
    ratingFilter: 0
  })

  const [filteredTemplates, setFilteredTemplates] = useState<AdvancedTemplate[]>(templates)

  // Filter and sort templates
  useEffect(() => {
    let filtered = [...templates]

    // Search filter
    if (marketplaceState.searchQuery) {
      const query = marketplaceState.searchQuery.toLowerCase()
      filtered = filtered.filter(template =>
        template.metadata.name.toLowerCase().includes(query) ||
        template.metadata.description.toLowerCase().includes(query) ||
        template.metadata.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Category filter
    if (marketplaceState.selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.metadata.category === marketplaceState.selectedCategory)
    }

    // Price filter
    if (marketplaceState.priceFilter !== 'all') {
      filtered = filtered.filter(template => {
        const price = template.marketplace?.price
        if (marketplaceState.priceFilter === 'free') {
          return !price || price.type === 'free'
        } else if (marketplaceState.priceFilter === 'paid') {
          return price && price.type !== 'free'
        }
        return true
      })
    }

    // Rating filter
    if (marketplaceState.ratingFilter > 0) {
      filtered = filtered.filter(template => {
        const rating = template.marketplace?.rating || 0
        return rating >= marketplaceState.ratingFilter
      })
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (marketplaceState.sortBy) {
        case 'name':
          aValue = a.metadata.name
          bValue = b.metadata.name
          break
        case 'rating':
          aValue = a.marketplace?.rating || 0
          bValue = b.marketplace?.rating || 0
          break
        case 'downloads':
          aValue = a.marketplace?.downloads || 0
          bValue = b.marketplace?.downloads || 0
          break
        case 'createdAt':
          aValue = new Date(a.metadata.createdAt)
          bValue = new Date(b.metadata.createdAt)
          break
        case 'updatedAt':
          aValue = new Date(a.metadata.updatedAt)
          bValue = new Date(b.metadata.updatedAt)
          break
        default:
          aValue = a.metadata.name
          bValue = b.metadata.name
      }

      if (marketplaceState.sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredTemplates(filtered)
  }, [templates, marketplaceState])

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setMarketplaceState(prev => ({ ...prev, searchQuery: query }))
  }, [])

  // Handle category change
  const handleCategoryChange = useCallback((category: string) => {
    setMarketplaceState(prev => ({ ...prev, selectedCategory: category }))
  }, [])

  // Handle sort change
  const handleSortChange = useCallback((sortBy: string, direction: 'asc' | 'desc') => {
    setMarketplaceState(prev => ({ ...prev, sortBy: sortBy as any, sortDirection: direction }))
  }, [])

  // Handle template selection
  const handleTemplateSelect = useCallback((template: AdvancedTemplate) => {
    setMarketplaceState(prev => ({ ...prev, selectedTemplate: template }))
    onTemplateSelect?.(template)
  }, [onTemplateSelect])

  // Handle template installation
  const handleTemplateInstall = useCallback((template: AdvancedTemplate) => {
    onTemplateInstall?.(template)
  }, [onTemplateInstall])

  // Get categories
  const categories = ['all', ...Array.from(new Set(templates.map(t => t.metadata.category)))]

  if (!visible) return null

  return (
    <div
      className="template-marketplace"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme === 'light' ? '#ffffff' : '#111827'
      }}
    >
      {/* Header */}
      <div
        className="marketplace-header"
        style={{
          padding: '24px',
          borderBottom: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
          backgroundColor: theme === 'light' ? '#f9fafb' : '#1f2937'
        }}
      >
        <h1
          style={{
            margin: '0 0 16px 0',
            fontSize: '28px',
            fontWeight: 700,
            color: theme === 'light' ? '#111827' : '#f9fafb'
          }}
        >
          Template Marketplace
        </h1>
        <p
          style={{
            margin: '0 0 24px 0',
            fontSize: '16px',
            color: theme === 'light' ? '#6b7280' : '#9ca3af'
          }}
        >
          Discover and install professional templates for your digital signage
        </p>

        {/* Search and Filters */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: '300px' }}>
            <input
              type="text"
              placeholder="Search templates..."
              value={marketplaceState.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                border: `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}`,
                borderRadius: '8px',
                backgroundColor: theme === 'light' ? '#ffffff' : '#374151',
                color: theme === 'light' ? '#111827' : '#f9fafb'
              }}
            />
          </div>

          {/* Category Filter */}
          <select
            value={marketplaceState.selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            style={{
              padding: '12px 16px',
              fontSize: '16px',
              border: `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}`,
              borderRadius: '8px',
              backgroundColor: theme === 'light' ? '#ffffff' : '#374151',
              color: theme === 'light' ? '#111827' : '#f9fafb',
              minWidth: '150px'
            }}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={`${marketplaceState.sortBy}-${marketplaceState.sortDirection}`}
            onChange={(e) => {
              const [sortBy, sortDirection] = e.target.value.split('-')
              handleSortChange(sortBy, sortDirection as 'asc' | 'desc')
            }}
            style={{
              padding: '12px 16px',
              fontSize: '16px',
              border: `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}`,
              borderRadius: '8px',
              backgroundColor: theme === 'light' ? '#ffffff' : '#374151',
              color: theme === 'light' ? '#111827' : '#f9fafb',
              minWidth: '150px'
            }}
          >
            <option value="rating-desc">Highest Rated</option>
            <option value="downloads-desc">Most Downloaded</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="updatedAt-desc">Recently Updated</option>
            <option value="createdAt-desc">Newest</option>
          </select>

          {/* Filters Toggle */}
          <button
            onClick={() => setMarketplaceState(prev => ({ ...prev, showFilters: !prev.showFilters }))}
            style={{
              padding: '12px 16px',
              fontSize: '16px',
              fontWeight: 500,
              backgroundColor: marketplaceState.showFilters ? '#3b82f6' : 'transparent',
              color: marketplaceState.showFilters ? '#ffffff' : (theme === 'light' ? '#374151' : '#d1d5db'),
              border: `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {marketplaceState.showFilters && (
          <div
            style={{
              marginTop: '16px',
              padding: '16px',
              border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
              borderRadius: '8px',
              backgroundColor: theme === 'light' ? '#ffffff' : '#374151',
              display: 'flex',
              gap: '24px',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
          >
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: theme === 'light' ? '#374151' : '#d1d5db' }}>
                Price
              </label>
              <select
                value={marketplaceState.priceFilter}
                onChange={(e) => setMarketplaceState(prev => ({ ...prev, priceFilter: e.target.value as any }))}
                style={{
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}`,
                  borderRadius: '4px',
                  backgroundColor: theme === 'light' ? '#ffffff' : '#4b5563',
                  color: theme === 'light' ? '#111827' : '#f9fafb'
                }}
              >
                <option value="all">All Prices</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: theme === 'light' ? '#374151' : '#d1d5db' }}>
                Minimum Rating
              </label>
              <select
                value={marketplaceState.ratingFilter}
                onChange={(e) => setMarketplaceState(prev => ({ ...prev, ratingFilter: Number(e.target.value) }))}
                style={{
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}`,
                  borderRadius: '4px',
                  backgroundColor: theme === 'light' ? '#ffffff' : '#4b5563',
                  color: theme === 'light' ? '#111827' : '#f9fafb'
                }}
              >
                <option value={0}>Any Rating</option>
                <option value={1}>1+ Stars</option>
                <option value={2}>2+ Stars</option>
                <option value={3}>3+ Stars</option>
                <option value={4}>4+ Stars</option>
                <option value={5}>5 Stars</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className="marketplace-content"
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden'
        }}
      >
        {/* Template Grid */}
        <div
          className="template-grid"
          style={{
            flex: 1,
            padding: '24px',
            overflow: 'auto'
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px'
            }}
          >
            {filteredTemplates.map(template => (
              <TemplateCard
                key={template.metadata.id}
                template={template}
                isSelected={marketplaceState.selectedTemplate?.metadata.id === template.metadata.id}
                onSelect={() => handleTemplateSelect(template)}
                onInstall={() => handleTemplateInstall(template)}
                theme={theme}
              />
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 24px',
                color: theme === 'light' ? '#6b7280' : '#9ca3af'
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600 }}>
                No templates found
              </h3>
              <p style={{ margin: 0, fontSize: '14px' }}>
                Try adjusting your search criteria or filters
              </p>
            </div>
          )}
        </div>

        {/* Template Details Sidebar */}
        {marketplaceState.selectedTemplate && (
          <div
            className="template-details"
            style={{
              width: '400px',
              borderLeft: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
              backgroundColor: theme === 'light' ? '#f9fafb' : '#1f2937',
              overflow: 'auto'
            }}
          >
            <TemplateDetails
              template={marketplaceState.selectedTemplate}
              onInstall={() => handleTemplateInstall(marketplaceState.selectedTemplate!)}
              theme={theme}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Template Card Component
function TemplateCard({
  template,
  isSelected,
  onSelect,
  onInstall,
  theme
}: {
  template: AdvancedTemplate
  isSelected: boolean
  onSelect: () => void
  onInstall: () => void
  theme: string
}) {
  const marketplace = template.marketplace

  return (
    <div
      onClick={onSelect}
      style={{
        border: `2px solid ${isSelected ? '#3b82f6' : (theme === 'light' ? '#e5e7eb' : '#374151')}`,
        borderRadius: '12px',
        backgroundColor: theme === 'light' ? '#ffffff' : '#374151',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = theme === 'light' ? '#d1d5db' : '#6b7280'
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = theme === 'light' ? '#e5e7eb' : '#374151'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }
      }}
    >
      {/* Preview Image */}
      <div
        style={{
          height: '200px',
          backgroundColor: theme === 'light' ? '#f3f4f6' : '#4b5563',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          color: theme === 'light' ? '#6b7280' : '#9ca3af'
        }}
      >
        {template.metadata.preview?.images?.[0] ? (
          <img
            src={template.metadata.preview.images[0].url}
            alt={template.metadata.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          'Preview'
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <h3
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 600,
              color: theme === 'light' ? '#111827' : '#f9fafb',
              lineHeight: 1.2
            }}
          >
            {template.metadata.name}
          </h3>
          {marketplace?.price && (
            <span
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                fontWeight: 500,
                backgroundColor: marketplace.price.type === 'free' ? '#10b981' : '#3b82f6',
                color: '#ffffff',
                borderRadius: '4px'
              }}
            >
              {marketplace.price.type === 'free' ? 'Free' : `$${marketplace.price.amount}`}
            </span>
          )}
        </div>

        {/* Description */}
        <p
          style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            color: theme === 'light' ? '#6b7280' : '#9ca3af',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {template.metadata.description}
        </p>

        {/* Rating and Downloads */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
          {marketplace?.rating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '14px', color: theme === 'light' ? '#374151' : '#d1d5db' }}>
                ⭐ {marketplace.rating.toFixed(1)}
              </span>
            </div>
          )}
          {marketplace?.downloads && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '14px', color: theme === 'light' ? '#374151' : '#d1d5db' }}>
                📥 {marketplace.downloads.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {template.metadata.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              style={{
                padding: '2px 8px',
                fontSize: '12px',
                backgroundColor: theme === 'light' ? '#f3f4f6' : '#6b7280',
                color: theme === 'light' ? '#374151' : '#d1d5db',
                borderRadius: '12px'
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Install Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onInstall()
          }}
          style={{
            width: '100%',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 500,
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6'
          }}
        >
          Install Template
        </button>
      </div>
    </div>
  )
}

// Template Details Component
function TemplateDetails({
  template,
  onInstall,
  theme
}: {
  template: AdvancedTemplate
  onInstall: () => void
  theme: string
}) {
  const marketplace = template.marketplace

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2
          style={{
            margin: '0 0 8px 0',
            fontSize: '20px',
            fontWeight: 600,
            color: theme === 'light' ? '#111827' : '#f9fafb'
          }}
        >
          {template.metadata.name}
        </h2>
        <p
          style={{
            margin: '0 0 16px 0',
            fontSize: '14px',
            color: theme === 'light' ? '#6b7280' : '#9ca3af',
            lineHeight: 1.5
          }}
        >
          {template.metadata.description}
        </p>

        {/* Rating and Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          {marketplace?.rating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '16px' }}>⭐</span>
              <span style={{ fontSize: '14px', fontWeight: 500, color: theme === 'light' ? '#111827' : '#f9fafb' }}>
                {marketplace.rating.toFixed(1)}
              </span>
              <span style={{ fontSize: '12px', color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                ({marketplace.reviews?.length || 0} reviews)
              </span>
            </div>
          )}
          {marketplace?.downloads && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '16px' }}>📥</span>
              <span style={{ fontSize: '14px', color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                {marketplace.downloads.toLocaleString()} downloads
              </span>
            </div>
          )}
        </div>

        {/* Price */}
        {marketplace?.price && (
          <div style={{ marginBottom: '16px' }}>
            <span
              style={{
                padding: '6px 12px',
                fontSize: '16px',
                fontWeight: 600,
                backgroundColor: marketplace.price.type === 'free' ? '#10b981' : '#3b82f6',
                color: '#ffffff',
                borderRadius: '6px'
              }}
            >
              {marketplace.price.type === 'free' ? 'Free' : `$${marketplace.price.amount}`}
            </span>
          </div>
        )}
      </div>

      {/* Author */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: theme === 'light' ? '#111827' : '#f9fafb' }}>
          Author
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {template.metadata.author.avatar && (
            <img
              src={template.metadata.author.avatar}
              alt={template.metadata.author.name}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%'
              }}
            />
          )}
          <div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: theme === 'light' ? '#111827' : '#f9fafb' }}>
              {template.metadata.author.name}
            </div>
            {template.metadata.author.organization && (
              <div style={{ fontSize: '12px', color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                {template.metadata.author.organization}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: theme === 'light' ? '#111827' : '#f9fafb' }}>
          Features
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '14px', color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
            • {template.components.length} components
          </div>
          <div style={{ fontSize: '14px', color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
            • {template.variables.length} configurable variables
          </div>
          <div style={{ fontSize: '14px', color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
            • {template.logic.conditionals.length} conditional rules
          </div>
        </div>
      </div>

      {/* Tags */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: theme === 'light' ? '#111827' : '#f9fafb' }}>
          Tags
        </h3>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {template.metadata.tags.map(tag => (
            <span
              key={tag}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                backgroundColor: theme === 'light' ? '#f3f4f6' : '#6b7280',
                color: theme === 'light' ? '#374151' : '#d1d5db',
                borderRadius: '12px'
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Install Button */}
      <button
        onClick={onInstall}
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: '16px',
          fontWeight: 600,
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#2563eb'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#3b82f6'
        }}
      >
        Install Template
      </button>
    </div>
  )
}
