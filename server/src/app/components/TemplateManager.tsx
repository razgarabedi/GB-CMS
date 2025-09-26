'use client';

import { useState, useEffect } from 'react';

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  component?: string;
  props?: Record<string, any>;
}

interface Template {
  id: string;
  name: string;
  description?: string;
  category: string;
  layout: LayoutItem[];
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  tags: string[];
  isPublic: boolean;
  downloads: number;
  rating: number;
}

interface TemplateManagerProps {
  layout: LayoutItem[];
  onLoadTemplate: (template: Template) => void;
}

export default function TemplateManager({ layout, onLoadTemplate }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateCategory, setTemplateCategory] = useState('custom');
  const [templateTags, setTemplateTags] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [activeTab, setActiveTab] = useState<'my-templates' | 'public' | 'import-export'>('my-templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'rating' | 'downloads'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const categories = [
    { id: 'all', name: 'All Categories', icon: '📁' },
    { id: 'dashboard', name: 'Dashboards', icon: '📊' },
    { id: 'retail', name: 'Retail', icon: '🏪' },
    { id: 'corporate', name: 'Corporate', icon: '🏢' },
    { id: 'education', name: 'Education', icon: '🎓' },
    { id: 'healthcare', name: 'Healthcare', icon: '🏥' },
    { id: 'restaurant', name: 'Restaurant', icon: '🍽️' },
    { id: 'transportation', name: 'Transportation', icon: '🚌' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'weather', name: 'Weather', icon: '🌤️' },
    { id: 'news', name: 'News', icon: '📰' },
    { id: 'custom', name: 'Custom', icon: '🔧' }
  ];

  const popularTags = [
    'weather', 'clock', 'news', 'slideshow', 'dashboard', 'kpi', 'analytics',
    'corporate', 'retail', 'restaurant', 'education', 'healthcare', 'modern',
    'minimal', 'colorful', 'dark', 'light', 'responsive', 'animated'
  ];

  useEffect(() => {
    loadTemplatesFromStorage();
  }, []);

  const loadTemplatesFromStorage = () => {
    const savedTemplates = localStorage.getItem('gb-cms-templates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  };

  const saveTemplateToStorage = (updatedTemplates: Template[]) => {
    localStorage.setItem('gb-cms-templates', JSON.stringify(updatedTemplates));
    setTemplates(updatedTemplates);
  };

  const generateThumbnail = (layout: LayoutItem[]): string => {
    // Generate a simple SVG thumbnail representation
    const svgElements = layout.map(item => {
      const x = (item.x / 12) * 200;
      const y = item.y * 20;
      const width = (item.w / 12) * 200;
      const height = item.h * 20;
      
      return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#3b82f6" rx="2"/>`;
    }).join('');
    
    const svg = `<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="150" fill="#1e293b"/>
      ${svgElements}
    </svg>`;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const saveTemplate = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    const newTemplate: Template = {
      id: `template-${Date.now()}`,
      name: templateName,
      description: templateDescription || `Custom template with ${layout.length} widgets`,
      category: templateCategory,
      layout: JSON.parse(JSON.stringify(layout)), // Deep clone
      thumbnail: generateThumbnail(layout),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'Current User',
      tags: templateTags.split(',').map(tag => tag.trim()).filter(Boolean),
      isPublic: isPublic,
      downloads: 0,
      rating: 0
    };

    const updatedTemplates = [...templates, newTemplate];
    saveTemplateToStorage(updatedTemplates);
    
    // Reset form
    setTemplateName('');
    setTemplateDescription('');
    setTemplateCategory('custom');
    setTemplateTags('');
    setIsPublic(false);
    
    alert(`Template "${templateName}" saved successfully!`);
  };

  const loadTemplate = (template: Template) => {
    if (confirm(`Load template "${template.name}"? This will replace your current layout.`)) {
      onLoadTemplate(template);
    }
  };

  const deleteTemplate = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      const updatedTemplates = templates.filter(t => t.id !== templateId);
      saveTemplateToStorage(updatedTemplates);
    }
  };

  const exportTemplate = (template: Template) => {
    const exportData = {
      ...template,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_template.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportAllTemplates = () => {
    if (templates.length === 0) {
      alert('No templates to export');
      return;
    }

    const exportData = {
      templates: templates,
      exportedAt: new Date().toISOString(),
      version: '1.0',
      totalTemplates: templates.length
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `gb_cms_templates_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        
        if (importData.templates) {
          // Importing multiple templates
          const newTemplates = importData.templates.map((template: Template) => ({
            ...template,
            id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            importedAt: new Date().toISOString(),
            author: 'Imported'
          }));
          
          const updatedTemplates = [...templates, ...newTemplates];
          saveTemplateToStorage(updatedTemplates);
          alert(`Successfully imported ${newTemplates.length} templates!`);
        } else {
          // Importing single template
          const newTemplate: Template = {
            ...importData,
            id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            importedAt: new Date().toISOString(),
            author: 'Imported'
          };
          
          const updatedTemplates = [...templates, newTemplate];
          saveTemplateToStorage(updatedTemplates);
          alert(`Successfully imported template "${newTemplate.name}"!`);
        }
      } catch (error) {
        alert('Error importing template. Please check the file format.');
        console.error('Import error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  const filteredTemplates = templates
    .filter(template => {
      const matchesSearch = searchQuery === '' || 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        template.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => template.tags.some(templateTag => 
          templateTag.toLowerCase().includes(tag.toLowerCase())
        ));
      
      return matchesSearch && matchesCategory && matchesTags;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'downloads':
          comparison = a.downloads - b.downloads;
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const renderTemplateCard = (template: Template) => (
    <div key={template.id} className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10 group">
      {/* Thumbnail with Preview Overlay */}
      <div className="h-32 bg-slate-900 flex items-center justify-center overflow-hidden relative">
        {template.thumbnail ? (
          <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-slate-500 text-3xl">📄</div>
        )}
        
        {/* Preview Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <button
            onClick={() => setPreviewTemplate(template)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            👁️ Preview
          </button>
        </div>
        
        {/* Widget Count Badge */}
        <div className="absolute top-2 right-2 bg-slate-800/90 text-slate-300 px-2 py-1 rounded-full text-xs font-medium">
          {template.layout.length} widgets
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-white text-sm truncate group-hover:text-blue-300 transition-colors">
            {template.name}
          </h4>
          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <span>⭐</span>
            <span>{template.rating.toFixed(1)}</span>
          </div>
        </div>
        
        <p className="text-xs text-slate-400 mb-3 line-clamp-2">
          {template.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
          <div className="flex items-center space-x-2">
            <span>{categories.find(c => c.id === template.category)?.icon} {template.category}</span>
            <span>•</span>
            <span>by {template.author}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>📥 {template.downloads}</span>
            <span>•</span>
            <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        {/* Tags */}
        {template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {template.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-slate-700 text-xs text-slate-300 rounded">
                {tag}
              </span>
            ))}
            {template.tags.length > 3 && (
              <span className="px-2 py-1 bg-slate-700 text-xs text-slate-300 rounded">
                +{template.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={() => loadTemplate(template)}
            className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors font-medium"
          >
            Load
          </button>
          <button
            onClick={() => setPreviewTemplate(template)}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors"
            title="Preview Template"
          >
            👁️
          </button>
          <button
            onClick={() => exportTemplate(template)}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors"
            title="Export Template"
          >
            📤
          </button>
          <button
            onClick={() => deleteTemplate(template.id)}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
            title="Delete Template"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-slate-800/50 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Template Manager</h3>
        <div className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
          {templates.length} templates
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-slate-900 p-1 rounded-lg">
        {[
          { id: 'my-templates', label: 'My Templates', icon: '📁' },
          { id: 'public', label: 'Public Gallery', icon: '🌐' },
          { id: 'import-export', label: 'Import/Export', icon: '📤' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'my-templates' && (
        <div className="space-y-6">
          {/* Save Template Form */}
          <div className="card">
            <div className="p-4">
              <h4 className="font-medium text-white mb-4 flex items-center space-x-2">
                <span>💾</span>
                <span>Save Current Layout</span>
              </h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter template name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Category
                    </label>
                    <select
                      value={templateCategory}
                      onChange={(e) => setTemplateCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.filter(c => c.id !== 'all').map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Describe your template..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={templateTags}
                    onChange={(e) => setTemplateTags(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="dashboard, weather, corporate"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isPublic" className="text-sm text-slate-300">
                    Make template public (share with community)
                  </label>
                </div>
                
                <button
                  onClick={saveTemplate}
                  disabled={!templateName.trim() || layout.length === 0}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                >
                  Save Template ({layout.length} widgets)
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Search and Filter Controls */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search templates by name, description, tags, or author..."
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                🔍
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap gap-3">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>

              {/* Sort Controls */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="rating">Sort by Rating</option>
                <option value="downloads">Sort by Downloads</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex bg-slate-700 rounded-md p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === 'grid' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⊞
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === 'list' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ☰
                </button>
              </div>

              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  showAdvancedFilters
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                🔧 Advanced
              </button>

              {/* Clear Filters */}
              {(searchQuery || selectedCategory !== 'all' || selectedTags.length > 0) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedTags([]);
                  }}
                  className="px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-md text-sm font-medium transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <h4 className="text-sm font-medium text-white mb-3">Tag Filters</h4>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (selectedTags.includes(tag)) {
                          setSelectedTags(selectedTags.filter(t => t !== tag));
                        } else {
                          setSelectedTags([...selectedTags, tag]);
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
            </span>
            <span>
              Showing {viewMode === 'grid' ? 'grid' : 'list'} view
            </span>
          </div>

          {/* Templates Display */}
          {filteredTemplates.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTemplates.map(renderTemplateCard)}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTemplates.map(template => (
                  <div key={template.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
                    <div className="flex items-center space-x-4">
                      {/* Thumbnail */}
                      <div className="w-16 h-12 bg-slate-900 rounded flex items-center justify-center overflow-hidden shrink-0">
                        {template.thumbnail ? (
                          <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-slate-500 text-lg">📄</div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-medium text-white text-sm truncate">{template.name}</h4>
                          <div className="flex items-center space-x-1 text-xs text-slate-400">
                            <span>⭐</span>
                            <span>{template.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mb-2 line-clamp-1">{template.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                          <span>{categories.find(c => c.id === template.category)?.icon} {template.category}</span>
                          <span>by {template.author}</span>
                          <span>{template.layout.length} widgets</span>
                          <span>📥 {template.downloads}</span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex space-x-2 shrink-0">
                        <button
                          onClick={() => loadTemplate(template)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => setPreviewTemplate(template)}
                          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors"
                          title="Preview"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => exportTemplate(template)}
                          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors"
                          title="Export"
                        >
                          📤
                        </button>
                        <button
                          onClick={() => deleteTemplate(template.id)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="text-center text-slate-400 py-12">
              <div className="text-4xl mb-4">📄</div>
              <div className="text-lg font-medium mb-2">
                {templates.length === 0 ? 'No Templates Yet' : 'No Templates Found'}
              </div>
              <div className="text-sm">
                {templates.length === 0 
                  ? 'Save your first template to get started'
                  : 'Try adjusting your search or filter criteria'
                }
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'public' && (
        <div className="text-center text-slate-400 py-12">
          <div className="text-4xl mb-4">🌐</div>
          <div className="text-lg font-medium mb-2">Public Gallery</div>
          <div className="text-sm mb-4">Coming Soon</div>
          <div className="text-xs">
            Share and discover templates from the GB-CMS community
          </div>
        </div>
      )}

      {activeTab === 'import-export' && (
        <div className="space-y-6">
          <div className="card">
            <div className="p-4">
              <h4 className="font-medium text-white mb-4 flex items-center space-x-2">
                <span>📥</span>
                <span>Import Templates</span>
              </h4>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".json"
                    onChange={importTemplate}
                    className="hidden"
                    id="template-import"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="template-import"
                    className={`cursor-pointer ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <div className="text-3xl mb-2">📁</div>
                    <div className="text-white font-medium mb-1">
                      {isLoading ? 'Importing...' : 'Choose Template File'}
                    </div>
                    <div className="text-sm text-slate-400">
                      Select .json template files to import
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="p-4">
              <h4 className="font-medium text-white mb-4 flex items-center space-x-2">
                <span>📤</span>
                <span>Export Templates</span>
              </h4>
              
              <div className="space-y-4">
                <button
                  onClick={exportAllTemplates}
                  disabled={templates.length === 0}
                  className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                >
                  Export All Templates ({templates.length})
                </button>
                
                <div className="text-xs text-slate-400 text-center">
                  Individual templates can be exported from the template cards above
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div>
                <h3 className="text-xl font-semibold text-white">{previewTemplate.name}</h3>
                <p className="text-sm text-slate-400 mt-1">{previewTemplate.description}</p>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Template Info */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Template Details</h4>
                    <div className="bg-slate-900/50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Category:</span>
                        <span className="text-white">
                          {categories.find(c => c.id === previewTemplate.category)?.icon} {previewTemplate.category}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Author:</span>
                        <span className="text-white">{previewTemplate.author}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Widgets:</span>
                        <span className="text-white">{previewTemplate.layout.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Downloads:</span>
                        <span className="text-white">{previewTemplate.downloads}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Rating:</span>
                        <span className="text-white">⭐ {previewTemplate.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Created:</span>
                        <span className="text-white">{new Date(previewTemplate.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Updated:</span>
                        <span className="text-white">{new Date(previewTemplate.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {previewTemplate.tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {previewTemplate.tags.map((tag, index) => (
                          <span key={index} className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Widget List */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Widgets in Template</h4>
                    <div className="space-y-2">
                      {previewTemplate.layout.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <div className="text-white text-sm font-medium">{item.component}</div>
                              <div className="text-slate-400 text-xs">
                                {item.w}×{item.h} at ({item.x}, {item.y})
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Template Preview */}
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Preview</h4>
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    {previewTemplate.thumbnail ? (
                      <img 
                        src={previewTemplate.thumbnail} 
                        alt={previewTemplate.name} 
                        className="w-full h-auto rounded border border-slate-700"
                      />
                    ) : (
                      <div className="aspect-video bg-slate-800 rounded flex items-center justify-center text-slate-500">
                        <div className="text-center">
                          <div className="text-4xl mb-2">📄</div>
                          <div className="text-sm">No preview available</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-slate-700">
              <div className="text-sm text-slate-400">
                Template ID: {previewTemplate.id}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    loadTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Load Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}