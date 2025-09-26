// Sample Plugin for GB-CMS
// This demonstrates how to create a plugin with custom widgets

(function(api) {
  'use strict';

  // Plugin initialization
  function init() {
    console.log('Sample Plugin initialized');
    
    // Register a custom widget
    api.registerWidget({
      id: 'sample-counter',
      name: 'Counter Widget',
      icon: '🔢',
      description: 'A simple counter widget with increment/decrement buttons',
      component: CounterWidget,
      defaultProps: {
        initialValue: 0,
        step: 1,
        minValue: 0,
        maxValue: 100,
        showButtons: true,
        color: '#3b82f6'
      },
      propertySchema: [
        {
          key: 'initialValue',
          label: 'Initial Value',
          type: 'number',
          required: true,
          default: 0,
          validation: { min: 0, max: 1000 }
        },
        {
          key: 'step',
          label: 'Step Size',
          type: 'number',
          required: true,
          default: 1,
          validation: { min: 1, max: 10 }
        },
        {
          key: 'minValue',
          label: 'Minimum Value',
          type: 'number',
          required: false,
          default: 0
        },
        {
          key: 'maxValue',
          label: 'Maximum Value',
          type: 'number',
          required: false,
          default: 100
        },
        {
          key: 'showButtons',
          label: 'Show Buttons',
          type: 'boolean',
          required: false,
          default: true
        },
        {
          key: 'color',
          label: 'Color',
          type: 'color',
          required: false,
          default: '#3b82f6'
        }
      ],
      category: 'interactive',
      tags: ['counter', 'interactive', 'sample']
    });

    // Register a data source
    api.registerDataSource({
      id: 'sample-api',
      name: 'Sample API',
      description: 'Fetches sample data from JSONPlaceholder API',
      configSchema: [
        {
          key: 'endpoint',
          label: 'API Endpoint',
          type: 'select',
          required: true,
          options: [
            { label: 'Posts', value: 'posts' },
            { label: 'Users', value: 'users' },
            { label: 'Comments', value: 'comments' }
          ],
          default: 'posts'
        },
        {
          key: 'limit',
          label: 'Result Limit',
          type: 'number',
          required: false,
          default: 10,
          validation: { min: 1, max: 100 }
        }
      ],
      fetchData: async (config) => {
        const response = await api.http.get(`https://jsonplaceholder.typicode.com/${config.endpoint}?_limit=${config.limit}`);
        return response.json();
      },
      refreshInterval: 300000 // 5 minutes
    });

    // Listen for plugin events
    api.on('widget-clicked', (data) => {
      console.log('Widget clicked:', data);
    });

    // Store plugin configuration
    api.setConfig('initialized', true);
    api.setConfig('initTime', new Date().toISOString());
  }

  // Counter Widget Component
  function CounterWidget(props) {
    const {
      initialValue = 0,
      step = 1,
      minValue = 0,
      maxValue = 100,
      showButtons = true,
      color = '#3b82f6'
    } = props;

    const [count, setCount] = React.useState(initialValue);

    const increment = () => {
      setCount(prev => Math.min(prev + step, maxValue));
    };

    const decrement = () => {
      setCount(prev => Math.max(prev - step, minValue));
    };

    const reset = () => {
      setCount(initialValue);
    };

    return React.createElement('div', {
      className: 'counter-widget h-full w-full flex flex-col items-center justify-center bg-slate-800 rounded-lg p-4',
      style: { borderColor: color }
    }, [
      // Title
      React.createElement('h3', {
        key: 'title',
        className: 'text-white font-medium mb-4 text-sm'
      }, 'Counter Widget'),
      
      // Count Display
      React.createElement('div', {
        key: 'count',
        className: 'text-4xl font-bold text-white mb-6',
        style: { color: color }
      }, count),
      
      // Buttons
      showButtons && React.createElement('div', {
        key: 'buttons',
        className: 'flex space-x-2'
      }, [
        React.createElement('button', {
          key: 'decrement',
          onClick: decrement,
          disabled: count <= minValue,
          className: 'px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm rounded transition-colors',
          title: 'Decrease'
        }, '−'),
        
        React.createElement('button', {
          key: 'reset',
          onClick: reset,
          className: 'px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded transition-colors',
          title: 'Reset'
        }, '↻'),
        
        React.createElement('button', {
          key: 'increment',
          onClick: increment,
          disabled: count >= maxValue,
          className: 'px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm rounded transition-colors',
          title: 'Increase'
        }, '+')
      ]),
      
      // Info
      React.createElement('div', {
        key: 'info',
        className: 'text-xs text-slate-400 mt-4 text-center'
      }, `Range: ${minValue} - ${maxValue} (Step: ${step})`)
    ]);
  }

  // Plugin cleanup
  function cleanup() {
    console.log('Sample Plugin cleaned up');
    api.setConfig('cleaned', true);
  }

  // Export plugin interface
  module.exports = {
    init: init,
    cleanup: cleanup,
    name: 'Sample Plugin',
    version: '1.0.0'
  };

})(api);
