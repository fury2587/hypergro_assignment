
import React from 'react';
import { Button } from '@/components/ui/button';
import { useFormStore } from '../store/formStore';
import { BarChart3, FileText, ArrowLeft } from 'lucide-react';

interface NavigationMenuProps {
  currentView: 'builder' | 'responses';
  onViewChange: (view: 'builder' | 'responses') => void;
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({ currentView, onViewChange }) => {
  const { theme, currentForm } = useFormStore();

  return (
    <div className="flex items-center space-x-2">
      {currentView === 'responses' ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewChange('builder')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft size={16} />
          <span>Back to Builder</span>
        </Button>
      ) : (
        <>
          <Button
            variant={currentView === 'builder' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('builder')}
            className="flex items-center space-x-2"
          >
            <FileText size={16} />
            <span>Form Builder</span>
          </Button>
          <Button
            variant={currentView === 'responses' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('responses')}
            className="flex items-center space-x-2"
            disabled={!currentForm}
          >
            <BarChart3 size={16} />
            <span>Responses</span>
          </Button>
        </>
      )}
    </div>
  );
};
