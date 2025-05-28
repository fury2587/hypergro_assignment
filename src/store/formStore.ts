import { create } from 'zustand';
import { Form, FormField, FormStep, DevicePreview, FormResponse } from '../types/form';

interface FormStore {
  // Current form being edited
  currentForm: Form | null;
  
  // UI state
  selectedFieldId: string | null;
  previewMode: DevicePreview;
  isPreviewMode: boolean;
  theme: 'light' | 'dark';
  currentStepIndex: number;
  
  // History for undo/redo
  history: Form[];
  historyIndex: number;
  
  // Auto-save state
  autoSaveEnabled: boolean;
  lastSaved: Date | null;
  
  // Form responses
  responses: FormResponse[];
  
  // Validation state
  validationErrors: Record<string, string>;
  
  // Actions
  setCurrentForm: (form: Form) => void;
  addField: (stepId: string, field: Omit<FormField, 'id' | 'order'>) => void;
  updateField: (fieldId: string, updates: Partial<FormField>) => void;
  deleteField: (fieldId: string) => void;
  reorderFields: (stepId: string, fieldIds: string[]) => void;
  selectField: (fieldId: string | null) => void;
  setPreviewMode: (mode: DevicePreview) => void;
  togglePreview: () => void;
  toggleTheme: () => void;
  
  // Step management
  addStep: () => void;
  updateStep: (stepId: string, updates: Partial<FormStep>) => void;
  deleteStep: (stepId: string) => void;
  setCurrentStep: (index: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  
  // History management
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;
  
  // Template management
  saveTemplate: () => void;
  loadTemplate: () => void;
  
  // Sharing and storage
  generateShareableLink: () => string;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => Form | null;
  
  // Auto-save
  toggleAutoSave: () => void;
  
  // Form responses
  addResponse: (response: Omit<FormResponse, 'id' | 'submittedAt'>) => void;
  getResponsesForForm: (formId: string) => FormResponse[];
  
  // Validation
  validateField: (fieldId: string, value: any) => string | null;
  validateForm: () => boolean;
  clearValidationErrors: () => void;
}

export const useFormStore = create<FormStore>((set, get) => ({
  currentForm: null,
  selectedFieldId: null,
  previewMode: 'desktop',
  isPreviewMode: false,
  theme: 'light',
  currentStepIndex: 0,
  history: [],
  historyIndex: -1,
  autoSaveEnabled: true,
  lastSaved: null,
  responses: JSON.parse(localStorage.getItem('formResponses') || '[]'), // Load responses on init
  validationErrors: {},

  setCurrentForm: (form) => {
    set({ currentForm: form });
    if (get().autoSaveEnabled) {
      get().saveToLocalStorage();
    }
  },

  addField: (stepId, fieldData) => {
    const state = get();
    if (!state.currentForm) return;

    const newField: FormField = {
      ...fieldData,
      id: `field_${Date.now()}`,
      order: state.currentForm.steps.find(s => s.id === stepId)?.fields.length || 0,
    };

    const updatedForm = {
      ...state.currentForm,
      steps: state.currentForm.steps.map(step =>
        step.id === stepId
          ? { ...step, fields: [...step.fields, newField] }
          : step
      ),
      updatedAt: new Date(),
    };

    set({ currentForm: updatedForm });
    get().saveToHistory();
    if (get().autoSaveEnabled) {
      get().saveToLocalStorage();
    }
  },

  updateField: (fieldId, updates) => {
    const state = get();
    if (!state.currentForm) return;

    const updatedForm = {
      ...state.currentForm,
      steps: state.currentForm.steps.map(step => ({
        ...step,
        fields: step.fields.map(field =>
          field.id === fieldId ? { ...field, ...updates } : field
        ),
      })),
      updatedAt: new Date(),
    };

    set({ currentForm: updatedForm });
    if (get().autoSaveEnabled) {
      get().saveToLocalStorage();
    }
  },

  deleteField: (fieldId) => {
    const state = get();
    if (!state.currentForm) return;

    const updatedForm = {
      ...state.currentForm,
      steps: state.currentForm.steps.map(step => ({
        ...step,
        fields: step.fields.filter(field => field.id !== fieldId),
      })),
      updatedAt: new Date(),
    };

    set({ 
      currentForm: updatedForm, 
      selectedFieldId: state.selectedFieldId === fieldId ? null : state.selectedFieldId 
    });
    get().saveToHistory();
    if (get().autoSaveEnabled) {
      get().saveToLocalStorage();
    }
  },

  reorderFields: (stepId, fieldIds) => {
    const state = get();
    if (!state.currentForm) return;

    const updatedForm = {
      ...state.currentForm,
      steps: state.currentForm.steps.map(step => {
        if (step.id === stepId) {
          const reorderedFields = fieldIds.map((id, index) => {
            const field = step.fields.find(f => f.id === id);
            return field ? { ...field, order: index } : null;
          }).filter(Boolean) as FormField[];
          
          return { ...step, fields: reorderedFields };
        }
        return step;
      }),
      updatedAt: new Date(),
    };

    set({ currentForm: updatedForm });
    if (get().autoSaveEnabled) {
      get().saveToLocalStorage();
    }
  },

  selectField: (fieldId) => set({ selectedFieldId: fieldId }),
  setPreviewMode: (mode) => set({ previewMode: mode }),
  togglePreview: () => set((state) => ({ isPreviewMode: !state.isPreviewMode })),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

  addStep: () => {
    const state = get();
    if (!state.currentForm) return;

    const newStep: FormStep = {
      id: `step_${Date.now()}`,
      title: `Step ${state.currentForm.steps.length + 1}`,
      fields: [],
      order: state.currentForm.steps.length,
    };

    const updatedForm = {
      ...state.currentForm,
      steps: [...state.currentForm.steps, newStep],
      settings: { ...state.currentForm.settings, multiStep: true },
      updatedAt: new Date(),
    };

    set({ currentForm: updatedForm });
    get().saveToHistory();
    if (get().autoSaveEnabled) {
      get().saveToLocalStorage();
    }
  },

  updateStep: (stepId, updates) => {
    const state = get();
    if (!state.currentForm) return;

    const updatedForm = {
      ...state.currentForm,
      steps: state.currentForm.steps.map(step =>
        step.id === stepId ? { ...step, ...updates } : step
      ),
      updatedAt: new Date(),
    };

    set({ currentForm: updatedForm });
    if (get().autoSaveEnabled) {
      get().saveToLocalStorage();
    }
  },

  deleteStep: (stepId) => {
    const state = get();
    if (!state.currentForm) return;

    const updatedForm = {
      ...state.currentForm,
      steps: state.currentForm.steps.filter(step => step.id !== stepId),
      updatedAt: new Date(),
    };

    set({ currentForm: updatedForm, currentStepIndex: 0 });
    get().saveToHistory();
    if (get().autoSaveEnabled) {
      get().saveToLocalStorage();
    }
  },

  setCurrentStep: (index) => set({ currentStepIndex: index }),
  
  nextStep: () => {
    const state = get();
    if (state.currentForm && state.currentStepIndex < state.currentForm.steps.length - 1) {
      set({ currentStepIndex: state.currentStepIndex + 1 });
    }
  },

  previousStep: () => {
    const state = get();
    if (state.currentStepIndex > 0) {
      set({ currentStepIndex: state.currentStepIndex - 1 });
    }
  },

  saveToHistory: () => {
    const state = get();
    if (!state.currentForm) return;

    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(state.currentForm)));
    
    set({
      history: newHistory.slice(-20), // Keep last 20 states
      historyIndex: Math.min(newHistory.length - 1, 19),
    });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const previousForm = state.history[state.historyIndex - 1];
      set({
        currentForm: previousForm,
        historyIndex: state.historyIndex - 1,
      });
    }
  },

  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const nextForm = state.history[state.historyIndex + 1];
      set({
        currentForm: nextForm,
        historyIndex: state.historyIndex + 1,
      });
    }
  },

  saveTemplate: () => {
    const state = get();
    if (!state.currentForm) return;
    
    const templates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
    templates.push({
      id: `template_${Date.now()}`,
      name: state.currentForm.title,
      form: state.currentForm,
      createdAt: new Date(),
    });
    localStorage.setItem('formTemplates', JSON.stringify(templates));
    console.log('Template saved successfully');
  },

  loadTemplate: () => {
    const templates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
    if (templates.length > 0) {
      // For simplicity, load the first template
      const template = templates[0];
      set({ currentForm: template.form });
      console.log('Template loaded successfully');
    }
  },

  generateShareableLink: () => {
    const state = get();
    if (!state.currentForm) return '';
    
    const shareId = `form_${Date.now()}`;
    
    // Store the form with the share ID
    localStorage.setItem(`shared_${shareId}`, JSON.stringify(state.currentForm));
    console.log('Form saved for sharing with ID:', shareId);
    
    // Also update the form ID to match the share ID for consistency
    const updatedForm = { ...state.currentForm, id: shareId };
    localStorage.setItem(`shared_${shareId}`, JSON.stringify(updatedForm));
    
    const shareableUrl = `${window.location.origin}/form/${shareId}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareableUrl).then(() => {
      console.log('Shareable link copied to clipboard:', shareableUrl);
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
    });
    
    return shareableUrl;
  },

  saveToLocalStorage: () => {
    const state = get();
    if (state.currentForm) {
      localStorage.setItem('currentForm', JSON.stringify(state.currentForm));
      set({ lastSaved: new Date() });
    }
  },

  loadFromLocalStorage: () => {
    const saved = localStorage.getItem('currentForm');
    if (saved) {
      const form = JSON.parse(saved);
      set({ currentForm: form });
      return form;
    }
    return null;
  },

  toggleAutoSave: () => set((state) => ({ autoSaveEnabled: !state.autoSaveEnabled })),

  addResponse: (responseData) => {
    const newResponse: FormResponse = {
      ...responseData,
      id: `response_${Date.now()}`,
      submittedAt: new Date(),
    };

    set((state) => ({
      responses: [...state.responses, newResponse],
    }));

    // Save to localStorage
    const responses = JSON.parse(localStorage.getItem('formResponses') || '[]');
    responses.push(newResponse);
    localStorage.setItem('formResponses', JSON.stringify(responses));
  },

  getResponsesForForm: (formId) => {
    const state = get();
    return state.responses.filter(response => response.formId === formId);
  },

  validateField: (fieldId, value) => {
    const state = get();
    if (!state.currentForm) return null;

    const field = state.currentForm.steps
      .flatMap(step => step.fields)
      .find(f => f.id === fieldId);

    if (!field) return null;

    // Required validation
    if (field.required && (!value || value.toString().trim() === '')) {
      return 'This field is required';
    }

    // Length validation for text fields
    if (field.validation && (field.type === 'text' || field.type === 'textarea')) {
      const textValue = value?.toString() || '';
      
      if (field.validation.minLength && textValue.length < field.validation.minLength) {
        return `Minimum length is ${field.validation.minLength} characters`;
      }
      
      if (field.validation.maxLength && textValue.length > field.validation.maxLength) {
        return `Maximum length is ${field.validation.maxLength} characters`;
      }
      
      if (field.validation.pattern) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(textValue)) {
          return 'Invalid format';
        }
      }
    }

    return null;
  },

  validateForm: () => {
    const state = get();
    if (!state.currentForm) return false;

    const errors: Record<string, string> = {};
    let isValid = true;

    state.currentForm.steps.forEach(step => {
      step.fields.forEach(field => {
        // For demo purposes, we'll assume empty values for validation
        const error = get().validateField(field.id, '');
        if (error) {
          errors[field.id] = error;
          isValid = false;
        }
      });
    });

    set({ validationErrors: errors });
    return isValid;
  },

  clearValidationErrors: () => set({ validationErrors: {} }),
}));
