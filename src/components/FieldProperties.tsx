
import React from 'react';
import { useFormStore } from '../store/formStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

export const FieldProperties: React.FC = () => {
  const { currentForm, selectedFieldId, updateField } = useFormStore();
  
  if (!currentForm || !selectedFieldId) return null;

  const field = currentForm.steps
    .flatMap(step => step.fields)
    .find(f => f.id === selectedFieldId);

  if (!field) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Field Properties</h2>
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <Label htmlFor="field-label">Label</Label>
          <Input
            id="field-label"
            value={field.label}
            onChange={(e) => updateField(field.id, { label: e.target.value })}
            placeholder="Field label"
          />
        </div>

        {field.type !== 'checkbox' && (
          <div>
            <Label htmlFor="field-placeholder">Placeholder</Label>
            <Input
              id="field-placeholder"
              value={field.placeholder || ''}
              onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
              placeholder="Placeholder text"
            />
          </div>
        )}

        <div>
          <Label htmlFor="field-help">Help Text</Label>
          <Textarea
            id="field-help"
            value={field.helpText || ''}
            onChange={(e) => updateField(field.id, { helpText: e.target.value })}
            placeholder="Additional help text"
            rows={2}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="field-required"
            checked={field.required}
            onCheckedChange={(checked) => updateField(field.id, { required: checked })}
          />
          <Label htmlFor="field-required">Required field</Label>
        </div>

        {field.type === 'dropdown' && (
          <div>
            <Label>Options (one per line)</Label>
            <Textarea
              value={field.options?.join('\n') || ''}
              onChange={(e) => {
                const options = e.target.value.split('\n').filter(option => option.trim());
                updateField(field.id, { options });
              }}
              placeholder="Option 1&#10;Option 2&#10;Option 3"
              rows={4}
            />
          </div>
        )}
      </div>
    </div>
  );
};
