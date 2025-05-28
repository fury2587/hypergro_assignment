
import { FieldTemplate } from '../types/form';

export const FIELD_TEMPLATES: FieldTemplate[] = [
  {
    type: 'text',
    label: 'Text Input',
    icon: '📝',
    defaultProps: {
      label: 'Text Field',
      placeholder: 'Enter text...',
      required: false,
      validation: {
        minLength: 0,
        maxLength: 100,
      },
    },
  },
  {
    type: 'textarea',
    label: 'Textarea',
    icon: '📄',
    defaultProps: {
      label: 'Long Text',
      placeholder: 'Enter your message...',
      required: false,
      validation: {
        minLength: 0,
        maxLength: 500,
      },
    },
  },
  {
    type: 'dropdown',
    label: 'Dropdown',
    icon: '📋',
    defaultProps: {
      label: 'Select Option',
      placeholder: 'Choose one...',
      required: false,
      options: ['Option 1', 'Option 2', 'Option 3'],
    },
  },
  {
    type: 'checkbox',
    label: 'Checkbox',
    icon: '☑️',
    defaultProps: {
      label: 'Checkbox Field',
      required: false,
    },
  },
  {
    type: 'date',
    label: 'Date Picker',
    icon: '📅',
    defaultProps: {
      label: 'Select Date',
      required: false,
    },
  },
];
