// Static Widget Types and Interfaces

export type StaticWidgetSize = 'compact' | 'medium' | 'large' | 'xlarge';

export interface StaticWidgetDimensions {
  compact: { w: 4; h: 4 };
  medium: { w: 6; h: 4 };
  large: { w: 8; h: 7 };
  xlarge: { w: 9; h: 7 };
}

export const STATIC_WIDGET_DIMENSIONS: StaticWidgetDimensions = {
  compact: { w: 4, h: 4 },
  medium: { w: 6, h: 4 },
  large: { w: 8, h: 7 },
  xlarge: { w: 9, h: 7 }
};

export interface StaticWidgetProps {
  id: string;
  x: number;
  y: number;
  size: StaticWidgetSize;
  // Base widget props
  [key: string]: any;
}

export interface StaticWidgetConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  component: React.ComponentType<StaticWidgetProps>;
  sizes: StaticWidgetSize[];
  defaultSize: StaticWidgetSize;
  defaultProps: Record<string, any>;
  propTypes: Record<string, string>;
  capabilities: string[];
  dependencies: string[];
}

export interface StaticWidgetRegistry {
  [widgetId: string]: StaticWidgetConfig;
}

// Helper function to get dimensions for a specific size
export const getStaticWidgetDimensions = (size: StaticWidgetSize): { w: number; h: number } => {
  return STATIC_WIDGET_DIMENSIONS[size];
};

// Helper function to get all available sizes for a widget
export const getAvailableSizes = (sizes: StaticWidgetSize[]): Array<{ size: StaticWidgetSize; dimensions: { w: number; h: number } }> => {
  return sizes.map(size => ({
    size,
    dimensions: getStaticWidgetDimensions(size)
  }));
};

