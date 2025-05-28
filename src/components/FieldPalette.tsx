
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useFormStore } from '../store/formStore';
import { FIELD_TEMPLATES } from '../constants/fieldTemplates';
import { FieldTemplate } from '../types/form';

interface DraggableFieldProps {
  template: FieldTemplate;
}

const DraggableField: React.FC<DraggableFieldProps> = ({ template }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `template_${template.type}`,
    data: { template },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const { currentForm, addField } = useFormStore();

  const handleClick = () => {
    if (currentForm && currentForm.steps.length > 0) {
      addField(currentForm.steps[0].id, {
        type: template.type,
        label: template.defaultProps.label || template.label,
        required: template.defaultProps.required || false,
        ...template.defaultProps,
      });
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      className={`
        bg-white rounded-lg border-2 border-dashed border-gray-300 p-4 
        cursor-pointer transition-all duration-200 hover:border-blue-400 
        hover:bg-blue-50 group ${isDragging ? 'opacity-50' : ''}
      `}
    >
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{template.icon}</span>
        <div>
          <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
            {template.label}
          </h3>
          <p className="text-sm text-gray-500">
            Click or drag to add
          </p>
        </div>
      </div>
    </div>
  );
};

export const FieldPalette: React.FC = () => {
  const { saveTemplate, loadTemplate, generateShareableLink } = useFormStore();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Field Types</h2>
        <p className="text-sm text-gray-600 mt-1">
          Drag fields to the form or click to add
        </p>
      </div>
      
      <div className="p-4 space-y-3">
        {FIELD_TEMPLATES.map((template) => (
          <DraggableField key={template.type} template={template} />
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h3>
        <div className="space-y-2">
          <button 
            onClick={saveTemplate}
            className="w-full text-left text-sm text-gray-600 hover:text-blue-600 py-1"
          >
            💾 Save Template
          </button>
          <button 
            onClick={loadTemplate}
            className="w-full text-left text-sm text-gray-600 hover:text-blue-600 py-1"
          >
            📂 Load Template
          </button>
          <button 
            onClick={generateShareableLink}
            className="w-full text-left text-sm text-gray-600 hover:text-blue-600 py-1"
          >
            🔗 Generate Share Link
          </button>
        </div>
      </div>
    </div>
  );
};
