import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useFormStore } from '../store/formStore';
import { SortableField } from './SortableField';
import { Button } from '@/components/ui/button';

export const FormCanvas: React.FC = () => {
  const { 
    currentForm, 
    addStep, 
    currentStepIndex, 
    setCurrentStep,
    nextStep,
    previousStep,
    updateStep,
    deleteStep,
    setCurrentForm
  } = useFormStore();
  
  if (!currentForm) return null;

  const currentStep = currentForm.steps[currentStepIndex] || currentForm.steps[0];
  const isMultiStep = currentForm.steps.length > 1;

  const { setNodeRef, isOver } = useDroppable({
    id: currentStep.id,
  });

  const handleFormTitleChange = (title: string) => {
    setCurrentForm({ ...currentForm, title, updatedAt: new Date() });
  };

  const handleFormDescriptionChange = (description: string) => {
    setCurrentForm({ ...currentForm, description, updatedAt: new Date() });
  };

  const handleStepTitleChange = (title: string) => {
    updateStep(currentStep.id, { title });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Form Header */}
      <div className="p-6 border-b border-gray-200">
        <input
          type="text"
          value={currentForm.title}
          onChange={(e) => handleFormTitleChange(e.target.value)}
          className="text-2xl font-bold w-full bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
          placeholder="Form Title"
        />
        <textarea
          value={currentForm.description || ''}
          onChange={(e) => handleFormDescriptionChange(e.target.value)}
          className="mt-2 w-full text-gray-600 bg-transparent border-none resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
          placeholder="Add a description for your form..."
          rows={2}
        />
      </div>

      {/* Multi-step Navigation */}
      {isMultiStep && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Form Steps</h3>
            <span className="text-sm text-gray-500">
              Step {currentStepIndex + 1} of {currentForm.steps.length}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 mb-4">
            {currentForm.steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(index)}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${index === currentStepIndex 
                      ? 'bg-blue-600 text-white' 
                      : index < currentStepIndex 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-300 text-gray-600'
                    }
                  `}
                >
                  {index + 1}
                </button>
                {index < currentForm.steps.length - 1 && (
                  <div className="w-8 h-0.5 bg-gray-300 mx-2"></div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <input
              type="text"
              value={currentStep.title}
              onChange={(e) => handleStepTitleChange(e.target.value)}
              className="text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
              placeholder="Step Title"
            />
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={previousStep}
                disabled={currentStepIndex === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextStep}
                disabled={currentStepIndex === currentForm.steps.length - 1}
              >
                Next
              </Button>
              {currentForm.steps.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteStep(currentStep.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete Step
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div 
        ref={setNodeRef} 
        className={`min-h-96 p-6 transition-colors ${
          isOver ? 'bg-blue-50 border-blue-200' : ''
        }`}
      >
        {currentStep.fields.length === 0 ? (
          <div className={`flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg transition-colors ${
            isOver ? 'border-blue-400 bg-blue-100' : 'border-gray-300'
          }`}>
            <div className="text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isOver ? 'Drop field here' : 'Start building your form'}
              </h3>
              <p className="text-gray-500 mb-4">
                Drag field types from the left panel or click them to add
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  📝 Text Input
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  📋 Dropdown
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  📅 Date Picker
                </span>
              </div>
            </div>
          </div>
        ) : (
          <SortableContext
            items={currentStep.fields.map(f => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {currentStep.fields
                .sort((a, b) => a.order - b.order)
                .map((field) => (
                  <SortableField key={field.id} field={field} />
                ))}
            </div>
          </SortableContext>
        )}
        
        {/* Drop indicator when dragging over */}
        {isOver && currentStep.fields.length > 0 && (
          <div className="mt-4 h-2 bg-blue-200 rounded-full opacity-50"></div>
        )}
      </div>

      {/* Form Footer */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={addStep}>
              + Add Step
            </Button>
            <span className="text-sm text-gray-500">
              {currentStep.fields.length} field{currentStep.fields.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <Button className="bg-blue-600 hover:bg-blue-700">
            {currentForm.settings.submitButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
};
