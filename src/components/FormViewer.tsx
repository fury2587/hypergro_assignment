
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Form } from '../types/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export const FormViewer: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shareId) {
      console.log('Looking for shared form with ID:', shareId);
      
      // Try to get the shared form from localStorage
      const sharedForm = localStorage.getItem(`shared_${shareId}`);
      console.log('Found shared form data:', sharedForm ? 'Yes' : 'No');
      
      if (sharedForm) {
        try {
          const parsedForm = JSON.parse(sharedForm);
          console.log('Parsed form:', parsedForm);
          setForm(parsedForm);
        } catch (err) {
          console.error('Error parsing shared form:', err);
          setError('Invalid form data');
        }
      } else {
        // Also try to get from current form if it matches
        const currentForm = localStorage.getItem('currentForm');
        if (currentForm) {
          try {
            const parsedCurrentForm = JSON.parse(currentForm);
            // If the shareId matches the current form's ID or if it's a recent form
            if (parsedCurrentForm.id === shareId || shareId.includes('form_')) {
              console.log('Using current form as fallback');
              setForm(parsedCurrentForm);
              // Also save it as shared for future access
              localStorage.setItem(`shared_${shareId}`, JSON.stringify(parsedCurrentForm));
            } else {
              setError('Form not found');
            }
          } catch (err) {
            console.error('Error parsing current form:', err);
            setError('Form not found');
          }
        } else {
          setError('Form not found');
        }
      }
      setLoading(false);
    } else {
      setError('No form ID provided');
      setLoading(false);
    }
  }, [shareId]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Submitting form data:', formData);
    
    // Save response to localStorage
    const responses = JSON.parse(localStorage.getItem('formResponses') || '[]');
    const newResponse = {
      id: `response_${Date.now()}`,
      formId: form?.id,
      data: formData,
      submittedAt: new Date(),
    };
    
    responses.push(newResponse);
    localStorage.setItem('formResponses', JSON.stringify(responses));
    console.log('Response saved:', newResponse);
    
    setSubmitted(true);
  };

  const renderField = (field: any) => {
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={3}
          />
        );
      case 'dropdown':
        return (
          <Select onValueChange={(value) => handleFieldChange(field.id, value)}>
            <SelectTrigger>
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
            required={field.required}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Form Not Found</h1>
          <p className="text-gray-600 mb-4">
            {error || "The form you're looking for doesn't exist or has been removed."}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Share ID: {shareId}
          </p>
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Go to Form Builder
          </Button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h1>
          <p className="text-gray-600">Your response has been submitted successfully.</p>
        </div>
      </div>
    );
  }

  const currentStepData = form.steps[currentStep];
  const isMultiStep = form.steps.length > 1;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {form.title}
            </h1>
            {form.description && (
              <p className="text-gray-600">{form.description}</p>
            )}
          </div>

          {/* Progress bar for multi-step forms */}
          {isMultiStep && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Step {currentStep + 1} of {form.steps.length}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(((currentStep + 1) / form.steps.length) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / form.steps.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Step title */}
          {isMultiStep && (
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {currentStepData.title}
            </h2>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStepData.fields.map((field) => (
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
              </div>
            ))}

            {/* Multi-step navigation */}
            {isMultiStep ? (
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                
                {currentStep === form.steps.length - 1 ? (
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {form.settings.submitButtonText}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
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
                  {form.settings.submitButtonText}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
