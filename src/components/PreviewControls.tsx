
import React from 'react';
import { useFormStore } from '../store/formStore';
import { Button } from '@/components/ui/button';

export const PreviewControls: React.FC = () => {
  const { previewMode, setPreviewMode, isPreviewMode } = useFormStore();

  if (!isPreviewMode) return null;

  return (
    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
      <Button
        variant={previewMode === 'desktop' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setPreviewMode('desktop')}
        className="text-xs"
      >
        🖥️ Desktop
      </Button>
      <Button
        variant={previewMode === 'tablet' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setPreviewMode('tablet')}
        className="text-xs"
      >
        📱 Tablet
      </Button>
      <Button
        variant={previewMode === 'mobile' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setPreviewMode('mobile')}
        className="text-xs"
      >
        📱 Mobile
      </Button>
    </div>
  );
};
