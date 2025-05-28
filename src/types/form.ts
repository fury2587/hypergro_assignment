
export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'dropdown' | 'checkbox' | 'date';
  label: string;
  placeholder?: string;
  required: boolean;
  helpText?: string;
  options?: string[]; // For dropdown
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  order: number;
}

export interface FormStep {
  id: string;
  title: string;
  fields: FormField[];
  order: number;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  steps: FormStep[];
  settings: {
    multiStep: boolean;
    showProgress: boolean;
    submitButtonText: string;
    theme: 'light' | 'dark';
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface FormResponse {
  id: string;
  formId: string;
  data: Record<string, any>;
  submittedAt: Date;
}

export type DevicePreview = 'desktop' | 'tablet' | 'mobile';

export interface FieldTemplate {
  type: FormField['type'];
  label: string;
  icon: string;
  defaultProps: Partial<FormField>;
}
