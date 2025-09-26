/**
 * Template Manager Component
 * 
 * Provides a comprehensive interface for managing layout templates,
 * including creation, editing, import/export, and marketplace integration.
 */

import React, { useState, useCallback, useMemo } from 'react';
import type { 
  TemplateManager as TemplateManagerType, 
  UITemplate, 
  TemplateCategory
} from '../types/UITypes';

interface TemplateManagerProps {
  manager: TemplateManagerType;
  onManagerChange: (manager: TemplateManagerType) => void;
  onTemplateSelect: (template: UITemplate) => void;
  onTemplateCreate: (template: Partial<UITemplate>) => void;
  onTemplateSave: (template: UITemplate) => void;
  onTemplateDelete: (templateId: string) => void;
  onTemplateExport: (templateId: string) => void;
  onTemplateImport: (file: File) => void;
  onTemplateLoad: (templateId: string) => void;
  className?: string;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  manager,
  onManagerChange,
  onTemplateSelect,
  onTemplateCreate,
  onTemplateSave: _onTemplateSave,
  onTemplateDelete,
  onTemplateExport,
  onTemplateImport,
  onTemplateLoad,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(manager.searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>(manager.selectedCategory);
  const [sortBy, setSortBy] = useState(manager.sortBy);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let filtered = manager.templates;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query)) ||
        template.author.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filter by tags
    if (manager.filterBy.tags.length > 0) {
      filtered = filtered.filter(template => 
        manager.filterBy.tags.some(tag => template.tags.includes(tag))
      );
    }

    // Filter by public status
    if (manager.filterBy.isPublic !== null) {
      filtered = filtered.filter(template => template.isPublic === manager.filterBy.isPublic);
    }

    // Filter by built-in status
    if (manager.filterBy.isBuiltIn !== null) {
      filtered = filtered.filter(template => template.isBuiltIn === manager.filterBy.isBuiltIn);
    }

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'popularity':
          return b.downloads - a.downloads;
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    return filtered;
  }, [manager.templates, searchQuery, selectedCategory, manager.filterBy, sortBy]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    onManagerChange({
      ...manager,
      searchQuery: query
    });
  }, [manager, onManagerChange]);

  // Handle category change
  const handleCategoryChange = useCallback((category: TemplateCategory | 'all') => {
    setSelectedCategory(category);
    onManagerChange({
      ...manager,
      selectedCategory: category
    });
  }, [manager, onManagerChange]);

  // Handle sort change
  const handleSortChange = useCallback((sort: typeof sortBy) => {
    setSortBy(sort);
    onManagerChange({
      ...manager,
      sortBy: sort
    });
  }, [manager, onManagerChange]);

  // Handle template select
  const handleTemplateSelect = useCallback((template: UITemplate) => {
    onTemplateSelect(template);
    onManagerChange({
      ...manager,
      selectedTemplate: template.id
    });
  }, [manager, onManagerChange, onTemplateSelect]);

  // Handle template load
  const handleTemplateLoad = useCallback((templateId: string) => {
    onTemplateLoad(templateId);
  }, [onTemplateLoad]);

  // Handle template delete
  const handleTemplateDelete = useCallback((templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      onTemplateDelete(templateId);
    }
  }, [onTemplateDelete]);

  // Handle template export
  const handleTemplateExport = useCallback((templateId: string) => {
    onTemplateExport(templateId);
  }, [onTemplateExport]);

  // Handle file import
  const handleFileImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onTemplateImport(file);
      setShowImportDialog(false);
    }
  }, [onTemplateImport]);

  // Handle create template
  const handleCreateTemplate = useCallback((templateData: Partial<UITemplate>) => {
    onTemplateCreate(templateData);
    setShowCreateDialog(false);
  }, [onTemplateCreate]);

  // Render template card
  const renderTemplateCard = (template: UITemplate) => {
    const isSelected = manager.selectedTemplate === template.id;
    
    return (
      <div
        key={template.id}
        className={`relative bg-gray-900 border rounded-lg overflow-hidden transition-all duration-200 cursor-pointer ${
          isSelected 
            ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' 
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onClick={() => handleTemplateSelect(template)}
      >
        {/* Thumbnail */}
        <div className="aspect-video bg-gray-800 relative">
          {template.thumbnail ? (
            <img
              src={template.thumbnail}
              alt={template.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {template.isBuiltIn && (
              <span className="px-2 py-1 text-xs font-medium bg-blue-500 text-white rounded">
                Built-in
              </span>
            )}
            {template.isPublic && (
              <span className="px-2 py-1 text-xs font-medium bg-green-500 text-white rounded">
                Public
              </span>
            )}
            {template.isCustom && (
              <span className="px-2 py-1 text-xs font-medium bg-purple-500 text-white rounded">
                Custom
              </span>
            )}
          </div>
          
          {/* Rating */}
          <div className="absolute top-2 right-2 flex items-center space-x-1 bg-black bg-opacity-50 px-2 py-1 rounded">
            <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs text-white">{template.rating.toFixed(1)}</span>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-medium text-white truncate flex-1">
              {template.name}
            </h3>
            <div className="flex items-center space-x-1 ml-2">
              <span className="text-xs text-gray-400">
                {template.downloads}
              </span>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          
          <p className="text-xs text-gray-400 mb-3 line-clamp-2">
            {template.description}
          </p>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>by {template.author}</span>
            <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {template.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-1.5 py-0.5 text-xs bg-gray-700 text-gray-300 rounded"
              >
                {tag}
              </span>
            ))}
            {template.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{template.tags.length - 3}
              </span>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="absolute bottom-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTemplateLoad(template.id);
            }}
            className="p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            title="Load Template"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTemplateExport(template.id);
            }}
            className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            title="Export Template"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          
          {!template.isBuiltIn && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleTemplateDelete(template.id);
              }}
              className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              title="Delete Template"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  };

  // Render template list item
  const renderTemplateListItem = (template: UITemplate) => {
    const isSelected = manager.selectedTemplate === template.id;
    
    return (
      <div
        key={template.id}
        className={`flex items-center p-4 border rounded-lg transition-all duration-200 cursor-pointer ${
          isSelected 
            ? 'border-blue-500 bg-blue-500 bg-opacity-10' 
            : 'border-gray-600 hover:border-gray-500 bg-gray-900'
        }`}
        onClick={() => handleTemplateSelect(template)}
      >
        {/* Thumbnail */}
        <div className="w-16 h-12 bg-gray-800 rounded mr-4 flex-shrink-0">
          {template.thumbnail ? (
            <img
              src={template.thumbnail}
              alt={template.name}
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-medium text-white truncate">
              {template.name}
            </h3>
            <div className="flex items-center space-x-2 ml-2">
              <span className="text-xs text-gray-400">
                {template.downloads} downloads
              </span>
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs text-gray-400">{template.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-gray-400 mb-2 line-clamp-1">
            {template.description}
          </p>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <span>by {template.author}</span>
              <span>•</span>
              <span>{template.category}</span>
            </div>
            <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTemplateLoad(template.id);
            }}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Load
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTemplateExport(template.id);
            }}
            className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Export
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-gray-800 flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Template Manager</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowImportDialog(true)}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Import
            </button>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Create
            </button>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search templates..."
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
          
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value as TemplateCategory | 'all')}
                className="px-3 py-1 text-sm bg-gray-900 border border-gray-600 rounded text-white"
              >
                <option value="all">All Categories</option>
                <option value="business">Business</option>
                <option value="education">Education</option>
                <option value="retail">Retail</option>
                <option value="healthcare">Healthcare</option>
                <option value="transportation">Transportation</option>
                <option value="entertainment">Entertainment</option>
                <option value="corporate">Corporate</option>
                <option value="custom">Custom</option>
              </select>
              
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as typeof sortBy)}
                className="px-3 py-1 text-sm bg-gray-900 border border-gray-600 rounded text-white"
              >
                <option value="name">Name</option>
                <option value="popularity">Popularity</option>
                <option value="recent">Recent</option>
                <option value="rating">Rating</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* View Mode */}
              <div className="flex border border-gray-600 rounded">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2 py-1 text-sm ${
                    viewMode === 'grid' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-900 text-gray-400 hover:text-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-2 py-1 text-sm ${
                    viewMode === 'list' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-900 text-gray-400 hover:text-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
              
              {/* Filters */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 border-b border-gray-700 bg-gray-900">
          <h3 className="text-sm font-medium text-white mb-3">Filters</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Tags Filter */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {['responsive', 'modern', 'minimal', 'corporate', 'creative'].map(tag => (
                  <label key={tag} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={manager.filterBy.tags.includes(tag)}
                      onChange={(e) => {
                        const newTags = e.target.checked
                          ? [...manager.filterBy.tags, tag]
                          : manager.filterBy.tags.filter(t => t !== tag);
                        onManagerChange({
                          ...manager,
                          filterBy: { ...manager.filterBy, tags: newTags }
                        });
                      }}
                      className="mr-1"
                    />
                    <span className="text-xs text-gray-300 capitalize">{tag}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Type Filter */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">Type</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="typeFilter"
                    checked={manager.filterBy.isPublic === null}
                    onChange={() => onManagerChange({
                      ...manager,
                      filterBy: { ...manager.filterBy, isPublic: null }
                    })}
                    className="mr-2"
                  />
                  <span className="text-xs text-gray-300">All</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="typeFilter"
                    checked={manager.filterBy.isPublic === true}
                    onChange={() => onManagerChange({
                      ...manager,
                      filterBy: { ...manager.filterBy, isPublic: true }
                    })}
                    className="mr-2"
                  />
                  <span className="text-xs text-gray-300">Public</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="typeFilter"
                    checked={manager.filterBy.isBuiltIn === true}
                    onChange={() => onManagerChange({
                      ...manager,
                      filterBy: { ...manager.filterBy, isBuiltIn: true }
                    })}
                    className="mr-2"
                  />
                  <span className="text-xs text-gray-300">Built-in</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredTemplates.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.291A7.962 7.962 0 0012 5c-2.34 0-4.29 1.009-5.824 2.709" />
            </svg>
            <p className="text-lg font-medium mb-2">No templates found</p>
            <p className="text-sm text-gray-500 mb-4">
              Try adjusting your search or filters
            </p>
            <div className="text-xs text-gray-600 mb-4">
              Debug: {manager.templates.length} total templates, {filteredTemplates.length} filtered
            </div>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Create Your First Template
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}>
            {filteredTemplates.map(template => 
              viewMode === 'grid' ? renderTemplateCard(template) : renderTemplateListItem(template)
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 bg-gray-900">
        <div className="text-xs text-gray-400 text-center">
          {filteredTemplates.length} of {manager.templates.length} templates
        </div>
      </div>

      {/* Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-white mb-4">Import Template</h3>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowImportDialog(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-white mb-4">Create Template</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Name</label>
                <input
                  type="text"
                  placeholder="Template name"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Description</label>
                <textarea
                  placeholder="Template description"
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Category</label>
                <select className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white">
                  <option value="business">Business</option>
                  <option value="education">Education</option>
                  <option value="retail">Retail</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="transportation">Transportation</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="corporate">Corporate</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowCreateDialog(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCreateTemplate({})}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManager;
