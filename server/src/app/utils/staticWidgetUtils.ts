import { StaticWidgetSize, STATIC_WIDGET_DIMENSIONS } from '../types/staticWidgets';

// List of static widget types
const STATIC_WIDGET_TYPES = ['Static Weather'];

// Check if a widget type is static
export const isStaticWidget = (componentType: string): boolean => {
  return STATIC_WIDGET_TYPES.includes(componentType);
};

// Get static widget dimensions for a given size
export const getStaticWidgetDimensions = (size: StaticWidgetSize): { w: number; h: number } => {
  return STATIC_WIDGET_DIMENSIONS[size];
};

// Check if a widget can be resized
export const canResizeWidget = (componentType: string): boolean => {
  return !isStaticWidget(componentType);
};

// Get the size from widget props
export const getWidgetSize = (props: Record<string, any>): StaticWidgetSize | null => {
  return props.size || null;
};

// Validate static widget size
export const isValidStaticSize = (size: string): size is StaticWidgetSize => {
  return ['compact', 'medium', 'large', 'xlarge'].includes(size);
};

