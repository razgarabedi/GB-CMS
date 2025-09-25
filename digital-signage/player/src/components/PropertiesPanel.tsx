/**
 * Properties Panel Component
 * 
 * Provides a context-sensitive property editor for selected components
 * with real-time validation and live preview updates.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  PropertiesPanel, 
  PropertyField, 
  PropertyFieldType,
  PropertyGroup,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  UIIcon
} from '../types/UITypes';

interface PropertiesPanelProps {
  panel: PropertiesPanel;
  onPanelChange: (panel: PropertiesPanel) => void;
  onFieldChange: (fieldId: string, value: any) => void;
  onValidation: (fieldId: string, result: ValidationResult) => void;
  className?: string;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  panel,
  onPanelChange,
  onFieldChange,
  onValidation,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(panel.searchQuery);
  const [showAdvanced, setShowAdvanced] = useState(panel.showAdvanced);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(panel.groups.filter(g => !g.collapsed).map(g => g.id))
  );

  // Filter fields based on search and advanced settings
  const filteredFields = useMemo(() => {
    let fields = panel.fields;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      fields = fields.filter(field => 
        field.name.toLowerCase().includes(query) ||
        field.description?.toLowerCase().includes(query) ||
        field.group?.toLowerCase().includes(query)
      );
    }

    // Filter by advanced settings
    if (!showAdvanced) {
      fields = fields.filter(field => !field.name.includes('Advanced') && !field.name.includes('Debug'));
    }

    return fields;
  }, [panel.fields, searchQuery, showAdvanced]);

  // Group fields by their group
  const groupedFields = useMemo(() => {
    const groups: Record<string, PropertyField[]> = {};
    
    filteredFields.forEach(field => {
      const groupId = field.group || 'General';
      if (!groups[groupId]) {
        groups[groupId] = [];
      }
      groups[groupId].push(field);
    });

    // Sort fields within each group
    Object.keys(groups).forEach(groupId => {
      groups[groupId].sort((a, b) => a.order - b.order);
    });

    return groups;
  }, [filteredFields]);

  // Handle field value change
  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    onFieldChange(fieldId, value);
    
    // Validate field
    const field = panel.fields.find(f => f.id === fieldId);
    if (field && field.validation) {
      const validation = validateField(field, value);
      onValidation(fieldId, validation);
    }
  }, [panel.fields, onFieldChange, onValidation]);

  // Validate field value
  const validateField = (field: PropertyField, value: any): ValidationResult => {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!field.validation) {
      return { isValid: true, errors, warnings };
    }

    const { validation } = field;

    // Required validation
    if (field.required && (value === null || value === undefined || value === '')) {
      errors.push({
        field: field.id,
        message: `${field.name} is required`,
        code: 'required',
        value
      });
    }

    // Type-specific validation
    if (value !== null && value !== undefined && value !== '') {
      switch (field.type) {
        case 'number':
          const numValue = Number(value);
          if (isNaN(numValue)) {
            errors.push({
              field: field.id,
              message: `${field.name} must be a number`,
              code: 'invalid_number',
              value
            });
          } else {
            if (validation.min !== undefined && numValue < validation.min) {
              errors.push({
                field: field.id,
                message: `${field.name} must be at least ${validation.min}`,
                code: 'min_value',
                value
              });
            }
            if (validation.max !== undefined && numValue > validation.max) {
              errors.push({
                field: field.id,
                message: `${field.name} must be at most ${validation.max}`,
                code: 'max_value',
                value
              });
            }
          }
          break;

        case 'text':
        case 'textarea':
          const strValue = String(value);
          if (validation.minLength !== undefined && strValue.length < validation.minLength) {
            errors.push({
              field: field.id,
              message: `${field.name} must be at least ${validation.minLength} characters`,
              code: 'min_length',
              value
            });
          }
          if (validation.maxLength !== undefined && strValue.length > validation.maxLength) {
            errors.push({
              field: field.id,
              message: `${field.name} must be at most ${validation.maxLength} characters`,
              code: 'max_length',
              value
            });
          }
          if (validation.pattern && !new RegExp(validation.pattern).test(strValue)) {
            errors.push({
              field: field.id,
              message: `${field.name} format is invalid`,
              code: 'pattern',
              value
            });
          }
          break;

        case 'url':
          try {
            new URL(value);
          } catch {
            errors.push({
              field: field.id,
              message: `${field.name} must be a valid URL`,
              code: 'invalid_url',
              value
            });
          }
          break;
      }

      // Custom validation
      if (validation.custom) {
        const customError = validation.custom(value);
        if (customError) {
          errors.push({
            field: field.id,
            message: customError,
            code: 'custom',
            value
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  // Toggle group expansion
  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  }, []);

  // Render field input
  const renderFieldInput = (field: PropertyField) => {
    const hasError = false; // This would come from validation state
    const baseClasses = "w-full px-3 py-2 bg-gray-900 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400";
    const errorClasses = hasError ? "border-red-500" : "border-gray-600";

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={field.value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.description}
            className={`${baseClasses} ${errorClasses}`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={field.value || ''}
            onChange={(e) => handleFieldChange(field.id, Number(e.target.value))}
            min={field.validation?.min}
            max={field.validation?.max}
            className={`${baseClasses} ${errorClasses}`}
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={Boolean(field.value)}
              onChange={(e) => handleFieldChange(field.id, e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-300">{field.description}</span>
          </label>
        );

      case 'select':
        return (
          <select
            value={field.value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={`${baseClasses} ${errorClasses}`}
          >
            {field.options?.map(option => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(field.value) ? field.value : [];
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option.value]
                      : selectedValues.filter(v => v !== option.value);
                    handleFieldChange(field.id, newValues);
                  }}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'color':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={field.value || '#000000'}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className="w-12 h-8 border border-gray-600 rounded"
            />
            <input
              type="text"
              value={field.value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder="#000000"
              className={`${baseClasses} ${errorClasses} flex-1`}
            />
          </div>
        );

      case 'textarea':
        return (
          <textarea
            value={field.value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.description}
            rows={3}
            className={`${baseClasses} ${errorClasses}`}
          />
        );

      case 'json':
        return (
          <textarea
            value={typeof field.value === 'string' ? field.value : JSON.stringify(field.value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleFieldChange(field.id, parsed);
              } catch {
                handleFieldChange(field.id, e.target.value);
              }
            }}
            placeholder="Enter JSON..."
            rows={4}
            className={`${baseClasses} ${errorClasses} font-mono text-sm`}
          />
        );

      case 'range':
        return (
          <div className="space-y-2">
            <input
              type="range"
              min={field.validation?.min || 0}
              max={field.validation?.max || 100}
              value={field.value || 0}
              onChange={(e) => handleFieldChange(field.id, Number(e.target.value))}
              className="w-full"
            />
            <div className="text-sm text-gray-400 text-center">
              {field.value || 0}
            </div>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={field.value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.description}
            className={`${baseClasses} ${errorClasses}`}
          />
        );
    }
  };

  // Render field
  const renderField = (field: PropertyField) => {
    return (
      <div key={field.id} className="mb-4">
        <label className="block text-sm font-medium text-white mb-2">
          {field.name}
          {field.required && <span className="text-red-400 ml-1">*</span>}
        </label>
        
        {renderFieldInput(field)}
        
        {field.description && (
          <p className="text-xs text-gray-400 mt-1">{field.description}</p>
        )}
      </div>
    );
  };

  // Render group
  const renderGroup = (groupId: string, fields: PropertyField[]) => {
    const group = panel.groups.find(g => g.id === groupId);
    const isExpanded = expandedGroups.has(groupId);
    
    return (
      <div key={groupId} className="mb-6">
        <button
          onClick={() => toggleGroup(groupId)}
          className="flex items-center justify-between w-full p-3 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center space-x-2">
            {group?.icon && (
              <span className="text-blue-400">
                {group.icon.type === 'material' && <span className="material-icons text-sm">{group.icon.name}</span>}
                {group.icon.type === 'fontawesome' && <i className={`fa fa-${group.icon.name} text-sm`}></i>}
              </span>
            )}
            <span className="text-sm font-medium text-white">
              {group?.name || groupId}
            </span>
            <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
              {fields.length}
            </span>
          </div>
          
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isExpanded && (
          <div className="mt-3 space-y-4">
            {fields.map(renderField)}
          </div>
        )}
      </div>
    );
  };

  if (!panel.selectedComponent) {
    return (
      <div className={`bg-gray-800 border-l border-gray-700 flex flex-col h-full ${className}`}>
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Properties</h2>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.291A7.962 7.962 0 0012 5c-2.34 0-4.29 1.009-5.824 2.709" />
            </svg>
            <p className="text-sm">No component selected</p>
            <p className="text-xs text-gray-500 mt-1">
              Select a component to edit its properties
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 border-l border-gray-700 flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Properties</h2>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              showAdvanced
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Advanced
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 pl-10 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Properties */}
      <div className="flex-1 overflow-y-auto p-4">
        {Object.keys(groupedFields).length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.291A7.962 7.962 0 0012 5c-2.34 0-4.29 1.009-5.824 2.709" />
            </svg>
            <p className="text-sm">No properties found</p>
            <p className="text-xs text-gray-500 mt-1">
              Try adjusting your search
            </p>
          </div>
        ) : (
          <div>
            {Object.entries(groupedFields).map(([groupId, fields]) =>
              renderGroup(groupId, fields)
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 bg-gray-900">
        <div className="text-xs text-gray-400 text-center">
          {filteredFields.length} of {panel.fields.length} properties
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
