/**
 * Admin API Service
 * 
 * Handles all API calls to the backend for the advanced admin interface
 */

const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? '/api/admin' 
  : 'http://localhost:3000/api/admin';

const API_KEY = import.meta.env.VITE_API_KEY || '';

// Helper function to make API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(API_KEY && { 'X-API-Key': API_KEY }),
    ...options.headers,
  };

  console.log(`🔗 API Call: ${options.method || 'GET'} ${url}`);
  console.log(`📋 Headers:`, headers);
  if (options.body) {
    console.log(`📦 Body:`, JSON.parse(options.body as string));
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    console.log(`📊 Response Headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error Response:`, errorText);
      
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { error: errorText || 'Unknown error' };
      }
      
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ API Success:`, data);
    return data;
  } catch (error) {
    console.error(`❌ API call failed: ${endpoint}`, error);
    console.error(`❌ Error details:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      url,
      method: options.method || 'GET'
    });
    throw error;
  }
}

// ============================================================================
// COMPONENT LIBRARY API
// ============================================================================

export const ComponentAPI = {
  // Get all components
  async getAll(): Promise<any[]> {
    return apiCall('/components');
  },

  // Get component by ID
  async getById(id: string): Promise<any> {
    return apiCall(`/components/${id}`);
  },

  // Create or update component
  async save(component: any): Promise<any> {
    return apiCall('/components', {
      method: 'POST',
      body: JSON.stringify(component),
    });
  },

  // Delete component
  async delete(id: string): Promise<void> {
    return apiCall(`/components/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// TEMPLATE MANAGEMENT API
// ============================================================================

export const TemplateAPI = {
  // Get all templates
  async getAll(): Promise<any[]> {
    return apiCall('/templates');
  },

  // Get template by ID
  async getById(id: string): Promise<any> {
    return apiCall(`/templates/${id}`);
  },

  // Create or update template
  async save(template: any): Promise<any> {
    return apiCall('/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  },

  // Delete template
  async delete(id: string): Promise<void> {
    return apiCall(`/templates/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// PLUGIN MANAGEMENT API
// ============================================================================

export const PluginAPI = {
  // Get all plugins
  async getAll(): Promise<any[]> {
    return apiCall('/plugins');
  },

  // Get plugin by ID
  async getById(id: string): Promise<any> {
    return apiCall(`/plugins/${id}`);
  },

  // Install plugin
  async install(id: string): Promise<any> {
    return apiCall(`/plugins/${id}/install`, {
      method: 'POST',
    });
  },

  // Uninstall plugin
  async uninstall(id: string): Promise<any> {
    return apiCall(`/plugins/${id}/uninstall`, {
      method: 'POST',
    });
  },
};

// ============================================================================
// LAYOUT MANAGEMENT API
// ============================================================================

export const LayoutAPI = {
  // Get all layouts
  async getAll(): Promise<any[]> {
    return apiCall('/layouts');
  },

  // Get layout by ID
  async getById(id: string): Promise<any> {
    return apiCall(`/layouts/${id}`);
  },

  // Save layout
  async save(layout: any): Promise<any> {
    return apiCall('/layouts', {
      method: 'POST',
      body: JSON.stringify(layout),
    });
  },

  // Delete layout
  async delete(id: string): Promise<void> {
    return apiCall(`/layouts/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// CONFIGURATION MANAGEMENT API
// ============================================================================

export const ConfigAPI = {
  // Get all configurations
  async getAll(): Promise<Record<string, any>> {
    return apiCall('/configs');
  },

  // Get configuration by screen ID
  async getByScreenId(screenId: string): Promise<any> {
    return apiCall(`/configs/${screenId}`);
  },

  // Save configuration
  async save(screenId: string, config: any): Promise<any> {
    return apiCall(`/configs/${screenId}`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },
};

// ============================================================================
// ANALYTICS AND MONITORING API
// ============================================================================

export const AnalyticsAPI = {
  // Get system analytics
  async getAnalytics(): Promise<any> {
    return apiCall('/analytics');
  },

  // Get system health
  async getHealth(): Promise<any> {
    return apiCall('/health');
  },
};

// ============================================================================
// EXPORT ALL APIs
// ============================================================================

export const AdminAPI = {
  components: ComponentAPI,
  templates: TemplateAPI,
  plugins: PluginAPI,
  layouts: LayoutAPI,
  configs: ConfigAPI,
  analytics: AnalyticsAPI,
};

export default AdminAPI;
