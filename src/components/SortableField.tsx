
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useFormStore } from '../store/formStore';
import { FormField } from '../types/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface SortableFieldProps {
  field: FormField;
}

export const SortableField: React.FC<SortableFieldProps> = ({ field }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const { selectedFieldId, selectField, deleteField } = useFormStore();
  const isSelected = selectedFieldId === field.id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const renderFieldPreview = () => {
    const baseClasses = "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";
    
    switch (field.type) {
      case 'text':
        return (
          <Input
            placeholder={field.placeholder}
            className={baseClasses}
            disabled
          />
        );
      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            className={baseClasses}
            disabled
            rows={3}
          />
        );
      case 'dropdown':
        return (
          <Select disabled>
            <SelectTrigger className={baseClasses}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox disabled />
            <label className="text-sm text-gray-700">
              {field.label}
            </label>
          </div>
        );
      case 'date':
        return (
          <Input
            type="date"
            className={baseClasses}
            disabled
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`
        group relative bg-white border-2 rounded-lg p-4 transition-all duration-200
        ${isSelected 
          ? 'border-blue-500 shadow-lg' 
          : 'border-gray-200 hover:border-gray-300'
        }
        ${isDragging ? 'opacity-50' : ''}
      `}
      onClick={() => selectField(field.id)}
    >
      {/* Drag Handle */}
      <div
        {...listeners}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <div className="flex flex-col space-y-1">
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
        </div>
      </div>

      {/* Delete Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          deleteField(field.id);
        }}
        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
      >
        ×
      </Button>

      {/* Field Content */}
      <div className="ml-6 mr-12">
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-900 mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.helpText && (
            <p className="text-sm text-gray-500 mb-2">{field.helpText}</p>
          )}
        </div>

        {renderFieldPreview()}

        {/* Field Type Badge */}
        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {field.type}
          </span>
          {field.validation && (
            <div className="text-xs text-gray-500">
              {field.validation.minLength && `Min: ${field.validation.minLength}`}
              {field.validation.maxLength && ` Max: ${field.validation.maxLength}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
