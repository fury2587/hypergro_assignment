
import React, { useState } from 'react';
import { useFormStore } from '../store/formStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export const FormPreview: React.FC = () => {
  const { 
    currentForm, 
    previewMode, 
    currentStepIndex, 
    setCurrentStep,
    validateField,
    addResponse 
  } = useFormStore();
  
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [currentPreviewStep, setCurrentPreviewStep] = useState(0);

  if (!currentForm) return null;

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'mobile':
        return 'max-w-sm';
      case 'tablet':
        return 'max-w-2xl';
      default:
        return 'max-w-4xl';
    }
  };

  const currentStep = currentForm.steps[currentPreviewStep] || currentForm.steps[0];
  const isMultiStep = currentForm.steps.length > 1;

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    
    // Real-time validation
    const error = validateField(fieldId, value);
    setValidationErrors(prev => ({
      ...prev,
      [fieldId]: error || ''
    }));
  };

  const handleNextStep = () => {
    if (currentPreviewStep < currentForm.steps.length - 1) {
      setCurrentPreviewStep(currentPreviewStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentPreviewStep > 0) {
      setCurrentPreviewStep(currentPreviewStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    let hasErrors = false;
    const errors: Record<string, string> = {};
    
    currentForm.steps.forEach(step => {
      step.fields.forEach(field => {
        const error = validateField(field.id, formData[field.id]);
        if (error) {
          errors[field.id] = error;
          hasErrors = true;
        }
      });
    });

    if (hasErrors) {
      setValidationErrors(errors);
      return;
    }

    // Submit form
    addResponse({
      formId: currentForm.id,
      data: formData,
    });

    alert('Form submitted successfully!');
    setFormData({});
    setValidationErrors({});
    setCurrentPreviewStep(0);
  };

  const renderField = (field: any) => {
    const value = formData[field.id] || '';
    const error = validationErrors[field.id];

    switch (field.type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={error ? 'border-red-500' : ''}
          />
        );
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={error ? 'border-red-500' : ''}
            rows={3}
          />
        );
      case 'dropdown':
        return (
          <Select onValueChange={(value) => handleFieldChange(field.id, value)}>
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string, index: number) => (
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
            <Checkbox
              checked={value}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
            />
            <label className="text-sm text-gray-700">
              {field.label}
            </label>
          </div>
        );
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={error ? 'border-red-500' : ''}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center">
      <div className={`${getPreviewWidth()} w-full bg-white rounded-lg shadow-lg border border-gray-200 p-8`}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {currentForm.title}
          </h1>
          {currentForm.description && (
            <p className="text-gray-600">{currentForm.description}</p>
          )}
        </div>

        {/* Progress bar for multi-step forms */}
        {isMultiStep && currentForm.settings.showProgress && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentPreviewStep + 1} of {currentForm.steps.length}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(((currentPreviewStep + 1) / currentForm.steps.length) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentPreviewStep + 1) / currentForm.steps.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Step title for multi-step forms */}
        {isMultiStep && (
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {currentStep.title}
          </h2>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              {field.type !== 'checkbox' && (
                <label className="block text-sm font-medium text-gray-900">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
              )}
              
              {field.helpText && (
                <p className="text-sm text-gray-500">{field.helpText}</p>
              )}

              {renderField(field)}

              {validationErrors[field.id] && (
                <p className="text-sm text-red-600">{validationErrors[field.id]}</p>
              )}
            </div>
          ))}

          {/* Multi-step navigation */}
          {isMultiStep ? (
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviousStep}
                disabled={currentPreviewStep === 0}
              >
                Previous
              </Button>
              
              {currentPreviewStep === currentForm.steps.length - 1 ? (
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {currentForm.settings.submitButtonText}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Next
                </Button>
              )}
            </div>
          ) : (
            <div className="pt-6">
              <Button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {currentForm.settings.submitButtonText}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
