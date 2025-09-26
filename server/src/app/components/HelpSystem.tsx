'use client';

import { useState, useEffect } from 'react';

interface HelpTopic {
  id: string;
  title: string;
  category: string;
  icon: string;
  content: React.ReactNode;
  keywords: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface HelpSystemProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
}

const helpTopics: HelpTopic[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    category: 'Basics',
    icon: '🚀',
    keywords: ['start', 'beginner', 'first', 'setup'],
    difficulty: 'beginner',
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Welcome to GB-CMS</h3>
          <p className="text-slate-300 mb-4">
            GB-CMS is a comprehensive digital signage management system. Follow these steps to get started:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-slate-300">
            <li>Add widgets from the Component Library to your canvas</li>
            <li>Customize widget properties using the Properties Panel</li>
            <li>Preview your layout using the Live Preview system</li>
            <li>Save your layout as a template for future use</li>
            <li>Deploy your signage to displays</li>
          </ol>
        </div>
      </div>
    )
  },
  {
    id: 'adding-widgets',
    title: 'Adding Widgets',
    category: 'Widgets',
    icon: '🧩',
    keywords: ['widget', 'add', 'drag', 'drop', 'component'],
    difficulty: 'beginner',
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">How to Add Widgets</h3>
          <div className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-lg">
              <h4 className="font-medium text-white mb-2">Method 1: Drag and Drop</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-300">
                <li>Open the Component Library (left sidebar)</li>
                <li>Browse available widgets by category</li>
                <li>Drag a widget from the library</li>
                <li>Drop it onto the canvas where you want it</li>
                <li>Release to place the widget</li>
              </ol>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg">
              <h4 className="font-medium text-white mb-2">Method 2: Click to Add</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-300">
                <li>Click on any widget in the Component Library</li>
                <li>The widget will be added to the top-left of the canvas</li>
                <li>Drag it to your desired position</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'customizing-widgets',
    title: 'Customizing Widgets',
    category: 'Widgets',
    icon: '⚙️',
    keywords: ['customize', 'properties', 'settings', 'configure'],
    difficulty: 'beginner',
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Widget Customization</h3>
          <div className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-lg">
              <h4 className="font-medium text-white mb-2">Basic Properties</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
                <li>Select a widget on the canvas</li>
                <li>Use the Properties Panel (right sidebar)</li>
                <li>Modify text, colors, and basic settings</li>
                <li>Changes apply instantly to the preview</li>
              </ul>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg">
              <h4 className="font-medium text-white mb-2">Visual Editor</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
                <li>Switch to the Visual Editor tab in Properties Panel</li>
                <li>Use color pickers for backgrounds and text</li>
                <li>Adjust typography (font, size, weight)</li>
                <li>Modify spacing and borders</li>
                <li>Add effects like shadows and opacity</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'responsive-design',
    title: 'Responsive Design',
    category: 'Layout',
    icon: '📱',
    keywords: ['responsive', 'mobile', 'tablet', 'desktop', 'preview'],
    difficulty: 'intermediate',
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Creating Responsive Layouts</h3>
          <div className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-lg">
              <h4 className="font-medium text-white mb-2">Preview Modes</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
                <li><strong>Normal Mode:</strong> Shows your original design</li>
                <li><strong>Responsive Mode:</strong> Automatically adapts for different screen sizes</li>
                <li><strong>Comparison Mode:</strong> Side-by-side view of normal vs responsive</li>
              </ul>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg">
              <h4 className="font-medium text-white mb-2">Device Testing</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
                <li>Use the device selector to test different screen sizes</li>
                <li>Desktop: 1920×1080 (large displays)</li>
                <li>Laptop: 1366×768 (standard laptops)</li>
                <li>Tablet: 1024×768 (tablets and small displays)</li>
                <li>Mobile: 375×667 (mobile devices)</li>
                <li>Custom: Set your own dimensions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'templates',
    title: 'Using Templates',
    category: 'Templates',
    icon: '📋',
    keywords: ['template', 'save', 'load', 'export', 'import'],
    difficulty: 'beginner',
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Template Management</h3>
          <div className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-lg">
              <h4 className="font-medium text-white mb-2">Saving Templates</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-300">
                <li>Create your layout on the canvas</li>
                <li>Go to the Templates tab</li>
                <li>Click "Save Current Layout"</li>
                <li>Enter a name and description</li>
                <li>Add tags for easy searching</li>
                <li>Click "Save Template"</li>
              </ol>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg">
              <h4 className="font-medium text-white mb-2">Loading Templates</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-300">
                <li>Go to the Templates tab</li>
                <li>Browse available templates</li>
                <li>Use search and filters to find specific templates</li>
                <li>Click "Preview" to see template details</li>
                <li>Click "Load Template" to apply it to your canvas</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'plugins',
    title: 'Managing Plugins',
    category: 'Plugins',
    icon: '🔌',
    keywords: ['plugin', 'install', 'uninstall', 'configure'],
    difficulty: 'intermediate',
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Plugin System</h3>
          <div className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-lg">
              <h4 className="font-medium text-white mb-2">Installing Plugins</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-300">
                <li>Go to the Plugins tab</li>
                <li>Browse the marketplace for available plugins</li>
                <li>Click on a plugin to view details</li>
                <li>Click "Install" to download and install</li>
                <li>Follow the installation steps</li>
                <li>Configure the plugin after installation</li>
              </ol>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg">
              <h4 className="font-medium text-white mb-2">Plugin Management</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
                <li><strong>Enable/Disable:</strong> Toggle plugins without uninstalling</li>
                <li><strong>Configure:</strong> Access plugin settings and options</li>
                <li><strong>Update:</strong> Keep plugins up to date</li>
                <li><strong>Uninstall:</strong> Remove plugins you no longer need</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    category: 'Support',
    icon: '🔧',
    keywords: ['troubleshoot', 'error', 'problem', 'fix', 'issue'],
    difficulty: 'intermediate',
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Common Issues & Solutions</h3>
          <div className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-lg">
              <h4 className="font-medium text-white mb-2">Widget Not Displaying</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
                <li>Check if the widget is properly placed on the canvas</li>
                <li>Verify widget properties are configured correctly</li>
                <li>Ensure the widget is not hidden behind other elements</li>
                <li>Try refreshing the preview</li>
              </ul>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg">
              <h4 className="font-medium text-white mb-2">Performance Issues</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
                <li>Reduce the number of widgets on the canvas</li>
                <li>Optimize widget refresh intervals</li>
                <li>Check for memory leaks in custom plugins</li>
                <li>Clear browser cache and reload</li>
              </ul>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg">
              <h4 className="font-medium text-white mb-2">Layout Problems</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
                <li>Use the grid overlay for precise alignment</li>
                <li>Check responsive behavior in different device modes</li>
                <li>Verify widget dimensions and positioning</li>
                <li>Test on actual display devices</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }
];

export default function HelpSystem({ isOpen, onClose, initialTopic }: HelpSystemProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(initialTopic || null);
  const [filteredTopics, setFilteredTopics] = useState(helpTopics);

  const categories = ['All', ...Array.from(new Set(helpTopics.map(topic => topic.category)))];

  useEffect(() => {
    if (isOpen && initialTopic) {
      setSelectedTopic(initialTopic);
    }
  }, [isOpen, initialTopic]);

  useEffect(() => {
    let filtered = helpTopics;

    if (searchQuery) {
      filtered = filtered.filter(topic =>
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(topic => topic.category === selectedCategory);
    }

    setFilteredTopics(filtered);
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-semibold text-white">Help & Documentation</h2>
            <p className="text-slate-400 mt-1">Find answers and learn how to use GB-CMS</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-80 border-r border-slate-700 bg-slate-900/50 p-6 overflow-y-auto">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search help topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                  🔍
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Topics List */}
            <div className="space-y-2">
              {filteredTopics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedTopic === topic.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{topic.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{topic.title}</div>
                      <div className="text-xs opacity-75">{topic.category}</div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${
                      topic.difficulty === 'beginner' ? 'bg-green-600' :
                      topic.difficulty === 'intermediate' ? 'bg-yellow-600' :
                      'bg-red-600'
                    }`}>
                      {topic.difficulty}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {filteredTopics.length === 0 && (
              <div className="text-center text-slate-400 py-8">
                <div className="text-4xl mb-2">🔍</div>
                <div className="text-sm">No topics found</div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {selectedTopic ? (
              (() => {
                const topic = helpTopics.find(t => t.id === selectedTopic);
                return topic ? (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <span className="text-3xl">{topic.icon}</span>
                      <div>
                        <h3 className="text-2xl font-semibold text-white">{topic.title}</h3>
                        <div className="flex items-center space-x-2 text-sm text-slate-400">
                          <span>{topic.category}</span>
                          <span>•</span>
                          <span className="capitalize">{topic.difficulty}</span>
                        </div>
                      </div>
                    </div>
                    {topic.content}
                  </div>
                ) : (
                  <div className="text-center text-slate-400 py-12">
                    <div className="text-4xl mb-4">❓</div>
                    <div className="text-lg">Topic not found</div>
                  </div>
                );
              })()
            ) : (
              <div className="text-center text-slate-400 py-12">
                <div className="text-4xl mb-4">📚</div>
                <div className="text-lg mb-2">Select a topic to get started</div>
                <div className="text-sm">Choose from the list on the left to view help content</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
