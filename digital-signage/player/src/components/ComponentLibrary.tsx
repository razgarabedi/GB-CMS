/**
 * Component Library Sidebar
 * 
 * Provides a searchable, categorized library of available components
 * with drag-and-drop functionality for adding to layouts.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  ComponentLibrary, 
  ComponentLibraryItem, 
  ComponentCategory,
  UIIcon,
  DragItem
} from '../types/UITypes';

interface ComponentLibraryProps {
  library: ComponentLibrary;
  onLibraryChange: (library: ComponentLibrary) => void;
  onDragStart: (item: DragItem) => void;
  onDragEnd: () => void;
  className?: string;
}

export const ComponentLibrary: React.FC<ComponentLibraryProps> = ({
  library,
  onLibraryChange,
  onDragStart,
  onDragEnd,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(library.searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | 'all'>(library.selectedCategory);
  const [sortBy, setSortBy] = useState(library.sortBy);
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort components
  const filteredComponents = useMemo(() => {
    let filtered = library.items;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by status
    if (library.filterBy.status.length > 0) {
      filtered = filtered.filter(item => library.filterBy.status.includes(item.status));
    }

    // Filter by plugin status
    if (library.filterBy.isPlugin !== null) {
      filtered = filtered.filter(item => item.isPlugin === library.filterBy.isPlugin);
    }

    // Filter by tags
    if (library.filterBy.tags.length > 0) {
      filtered = filtered.filter(item => 
        library.filterBy.tags.some(tag => item.tags.includes(tag))
      );
    }

    // Sort components
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'popularity':
          // This would need popularity data
          return 0;
        case 'recent':
          // This would need timestamp data
          return 0;
        default:
          return 0;
      }
    });

    return filtered;
  }, [library.items, searchQuery, selectedCategory, library.filterBy, sortBy]);

  // Group components by category
  const groupedComponents = useMemo(() => {
    const groups: Record<string, ComponentLibraryItem[]> = {};
    
    filteredComponents.forEach(component => {
      const category = component.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(component);
    });

    return groups;
  }, [filteredComponents]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    onLibraryChange({
      ...library,
      searchQuery: query
    });
  }, [library, onLibraryChange]);

  // Handle category change
  const handleCategoryChange = useCallback((category: ComponentCategory | 'all') => {
    setSelectedCategory(category);
    onLibraryChange({
      ...library,
      selectedCategory: category
    });
  }, [library, onLibraryChange]);

  // Handle sort change
  const handleSortChange = useCallback((sort: typeof sortBy) => {
    setSortBy(sort);
    onLibraryChange({
      ...library,
      sortBy: sort
    });
  }, [library, onLibraryChange]);

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, item: ComponentLibraryItem) => {
    const dragItem: DragItem = {
      id: item.id,
      type: 'component',
      data: item,
      source: 'library'
    };
    
    onDragStart(dragItem);
    
    // Set drag image
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.transform = 'rotate(5deg)';
    dragImage.style.opacity = '0.8';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  }, [onDragStart]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    onDragEnd();
  }, [onDragEnd]);

  // Render icon
  const renderIcon = (icon: UIIcon) => {
    switch (icon.type) {
      case 'material':
        return <span className="material-icons text-2xl">{icon.name}</span>;
      case 'fontawesome':
        return <i className={`fa fa-${icon.name} text-xl`}></i>;
      case 'svg':
        return <div dangerouslySetInnerHTML={{ __html: icon.data || '' }} />;
      default:
        return <div className="w-6 h-6 bg-gray-400 rounded"></div>;
    }
  };

  // Render component item
  const renderComponentItem = (item: ComponentLibraryItem) => {
    const isDisabled = item.status === 'disabled' || item.status === 'error';
    
    return (
      <div
        key={item.id}
        className={`p-3 border border-gray-600 rounded-lg cursor-move transition-all duration-200 ${
          isDisabled 
            ? 'opacity-50 cursor-not-allowed bg-gray-800' 
            : 'hover:border-blue-400 hover:bg-gray-800 bg-gray-900'
        }`}
        draggable={!isDisabled}
        onDragStart={(e) => !isDisabled && handleDragStart(e, item)}
        onDragEnd={handleDragEnd}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 text-blue-400">
            {renderIcon(item.icon)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-white truncate">
                {item.name}
              </h4>
              {item.isPlugin && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Plugin
                </span>
              )}
            </div>
            
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
              {item.description}
            </p>
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex flex-wrap gap-1">
                {item.tags.slice(0, 2).map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
                {item.tags.length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{item.tags.length - 2}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-1">
                {item.status === 'installing' && (
                  <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                )}
                {item.status === 'error' && (
                  <span className="text-red-400 text-xs">Error</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render category section
  const renderCategorySection = (category: string, items: ComponentLibraryItem[]) => {
    const categoryLabels: Record<string, string> = {
      widget: 'Widgets',
      layout: 'Layouts',
      utility: 'Utilities',
      service: 'Services',
      theme: 'Themes',
      integration: 'Integrations',
      custom: 'Custom',
      plugin: 'Plugins'
    };

    return (
      <div key={category} className="mb-6">
        <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
          {categoryLabels[category] || category}
          <span className="ml-2 px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded-full">
            {items.length}
          </span>
        </h3>
        
        <div className="space-y-2">
          {items.map(renderComponentItem)}
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-gray-800 border-r border-gray-700 flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-4">Component Library</h2>
        
        {/* Search */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-3 py-2 pl-10 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All
          </button>
          {library.categories.map(category => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Sort and Filters */}
        <div className="flex items-center justify-between">
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as typeof sortBy)}
            className="px-2 py-1 text-xs bg-gray-900 border border-gray-600 rounded text-white"
          >
            <option value="name">Name</option>
            <option value="category">Category</option>
            <option value="popularity">Popularity</option>
            <option value="recent">Recent</option>
          </select>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
          >
            Filters
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 border-b border-gray-700 bg-gray-900">
          <h3 className="text-sm font-medium text-white mb-3">Filters</h3>
          
          {/* Status Filter */}
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {['available', 'installing', 'error', 'disabled'].map(status => (
                <label key={status} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={library.filterBy.status.includes(status)}
                    onChange={(e) => {
                      const newStatus = e.target.checked
                        ? [...library.filterBy.status, status]
                        : library.filterBy.status.filter(s => s !== status);
                      onLibraryChange({
                        ...library,
                        filterBy: { ...library.filterBy, status: newStatus }
                      });
                    }}
                    className="mr-1"
                  />
                  <span className="text-xs text-gray-300 capitalize">{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Plugin Filter */}
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-2">Type</label>
            <div className="flex flex-wrap gap-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="pluginFilter"
                  checked={library.filterBy.isPlugin === null}
                  onChange={() => onLibraryChange({
                    ...library,
                    filterBy: { ...library.filterBy, isPlugin: null }
                  })}
                  className="mr-1"
                />
                <span className="text-xs text-gray-300">All</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="pluginFilter"
                  checked={library.filterBy.isPlugin === false}
                  onChange={() => onLibraryChange({
                    ...library,
                    filterBy: { ...library.filterBy, isPlugin: false }
                  })}
                  className="mr-1"
                />
                <span className="text-xs text-gray-300">Built-in</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="pluginFilter"
                  checked={library.filterBy.isPlugin === true}
                  onChange={() => onLibraryChange({
                    ...library,
                    filterBy: { ...library.filterBy, isPlugin: true }
                  })}
                  className="mr-1"
                />
                <span className="text-xs text-gray-300">Plugins</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Components List */}
      <div className="flex-1 overflow-y-auto p-4">
        {Object.keys(groupedComponents).length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.291A7.962 7.962 0 0012 5c-2.34 0-4.29 1.009-5.824 2.709" />
            </svg>
            <p className="text-sm">No components found</p>
            <p className="text-xs text-gray-500 mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div>
            {Object.entries(groupedComponents).map(([category, items]) =>
              renderCategorySection(category, items)
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 bg-gray-900">
        <div className="text-xs text-gray-400 text-center">
          {filteredComponents.length} of {library.items.length} components
        </div>
      </div>
    </div>
  );
};

export default ComponentLibrary;