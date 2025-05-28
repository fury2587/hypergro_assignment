import React, { useEffect } from 'react';
import { DndContext, DragEndEvent, closestCenter, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useFormStore } from '../store/formStore';
import { FieldPalette } from './FieldPalette';
import { FormCanvas } from './FormCanvas';
import { FieldProperties } from './FieldProperties';
import { FormPreview } from './FormPreview';
import { PreviewControls } from './PreviewControls';
import { QuickActions } from './QuickActions';
import { NavigationMenu } from './NavigationMenu';
import { ResponsesDashboard } from './ResponsesDashboard';
import { Button } from '@/components/ui/button';
import { Form } from '../types/form';

export const FormBuilder: React.FC = () => {
  const {
    currentForm,
    setCurrentForm,
    isPreviewMode,
    togglePreview,
    selectedFieldId,
    reorderFields,
    addField,
    saveToHistory,
    theme,
    toggleTheme,
    undo,
    redo,
    historyIndex,
    history,
    autoSaveEnabled,
    toggleAutoSave,
    lastSaved,
    loadFromLocalStorage,
    currentStepIndex,
  } = useFormStore();

  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [currentView, setCurrentView] = React.useState<'builder' | 'responses'>('builder');

  // Initialize with a default form or load from localStorage
  useEffect(() => {
    if (!currentForm) {
      const savedForm = loadFromLocalStorage();
      
      if (!savedForm) {
        const defaultForm: Form = {
          id: `form_${Date.now()}`,
          title: 'Untitled Form',
          description: 'Add a description for your form',
          steps: [
            {
              id: 'step_1',
              title: 'Step 1',
              fields: [],
              order: 0,
            },
          ],
          settings: {
            multiStep: false,
            showProgress: false,
            submitButtonText: 'Submit',
            theme: 'light',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setCurrentForm(defaultForm);
        saveToHistory();
      }
    }
  }, [currentForm, setCurrentForm, saveToHistory, loadFromLocalStorage]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over || !currentForm) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Check if dragging a template field (from palette)
    if (activeId.startsWith('template_')) {
      const template = active.data.current?.template;
      if (template && overId.startsWith('step_')) {
        // Add new field to the step
        addField(overId, {
          type: template.type,
          label: template.defaultProps.label || template.label,
          required: template.defaultProps.required || false,
          ...template.defaultProps,
        });
      }
      return;
    }
    
    // Handle reordering existing fields within a step
    if (overId.startsWith('step_')) {
      const step = currentForm.steps.find(s => s.id === overId);
      if (step) {
        const oldIndex = step.fields.findIndex(f => f.id === activeId);
        const newIndex = step.fields.length; // Add to end for now
        
        if (oldIndex !== -1) {
          const newFieldIds = [...step.fields.map(f => f.id)];
          const [removed] = newFieldIds.splice(oldIndex, 1);
          newFieldIds.splice(newIndex, 0, removed);
          reorderFields(overId, newFieldIds);
        }
      }
    }
    
    // Handle reordering between existing fields
    if (activeId !== overId && !activeId.startsWith('template_')) {
      const currentStep = currentForm.steps[currentStepIndex];
      if (currentStep) {
        const oldIndex = currentStep.fields.findIndex(f => f.id === activeId);
        const newIndex = currentStep.fields.findIndex(f => f.id === overId);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const newFieldIds = [...currentStep.fields.map(f => f.id)];
          const [removed] = newFieldIds.splice(oldIndex, 1);
          newFieldIds.splice(newIndex, 0, removed);
          reorderFields(currentStep.id, newFieldIds);
        }
      }
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return 'Never';
    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes === 0) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  if (!currentForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Form Builder...</p>
        </div>
      </div>
    );
  }

  // Show responses dashboard if in responses view
  if (currentView === 'responses') {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Header for responses view */}
        <header className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Form Responses
                </h1>
              </div>
              
              <div className="flex items-center space-x-3">
                <NavigationMenu currentView={currentView} onViewChange={setCurrentView} />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  title="Toggle theme"
                >
                  {theme === 'dark' ? '☀️' : '🌙'}
                </Button>
              </div>
            </div>
          </div>
        </header>

        <ResponsesDashboard />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <DndContext 
        collisionDetection={closestCenter} 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Header */}
        <header className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Form Builder
                </h1>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={currentForm.title}
                    onChange={(e) => setCurrentForm({ ...currentForm, title: e.target.value })}
                    className={`text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Auto-save indicator */}
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleAutoSave}
                    className={autoSaveEnabled ? 'text-green-600' : 'text-gray-500'}
                  >
                    {autoSaveEnabled ? '💾 Auto-save ON' : '💾 Auto-save OFF'}
                  </Button>
                  <span>Last saved: {formatLastSaved()}</span>
                </div>

                {/* Undo/Redo */}
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={undo}
                    disabled={historyIndex <= 0}
                    title="Undo"
                  >
                    ↶
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={redo}
                    disabled={historyIndex >= history.length - 1}
                    title="Redo"
                  >
                    ↷
                  </Button>
                </div>

                {/* Navigation Menu */}
                <NavigationMenu currentView={currentView} onViewChange={setCurrentView} />

                {/* Quick Actions */}
                <QuickActions />

                {/* Theme toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  title="Toggle theme"
                >
                  {theme === 'dark' ? '☀️' : '🌙'}
                </Button>

                <PreviewControls />
                <Button
                  onClick={togglePreview}
                  variant={isPreviewMode ? "default" : "outline"}
                  className="transition-all duration-200"
                >
                  {isPreviewMode ? 'Edit Mode' : 'Preview'}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isPreviewMode ? (
            <FormPreview />
          ) : (
            <div className="grid grid-cols-12 gap-6">
              {/* Field Palette */}
              <div className="col-span-3">
                <FieldPalette />
              </div>

              {/* Form Canvas */}
              <div className="col-span-6">
                <FormCanvas />
              </div>

              {/* Properties Panel */}
              <div className="col-span-3">
                {selectedFieldId ? (
                  <FieldProperties />
                ) : (
                  <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-6`}>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-center`}>
                      Select a field to edit its properties
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="bg-white border-2 border-blue-500 rounded-lg p-4 shadow-lg opacity-90">
              {activeId.startsWith('template_') ? (
                <div className="text-sm font-medium text-gray-900">
                  Adding {activeId.replace('template_', '')} field...
                </div>
              ) : (
                <div className="text-sm font-medium text-gray-900">
                  Moving field...
                </div>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
