
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useFormStore } from '../store/formStore';
import { Save, Upload, Share, Zap } from 'lucide-react';

export const QuickActions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { saveTemplate, loadTemplate, generateShareableLink, theme } = useFormStore();

  const handleSaveTemplate = () => {
    saveTemplate();
    setIsOpen(false);
    // You could add a toast notification here
    console.log('Template saved successfully!');
  };

  const handleLoadTemplate = () => {
    loadTemplate();
    setIsOpen(false);
    console.log('Template loaded successfully!');
  };

  const handleShareForm = () => {
    const shareUrl = generateShareableLink();
    setIsOpen(false);
    console.log('Shareable link generated and copied to clipboard!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center space-x-2"
        >
          <Zap size={16} />
          <span>Quick Actions</span>
        </Button>
      </DialogTrigger>
      <DialogContent className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <DialogHeader>
          <DialogTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
            Quick Actions
          </DialogTitle>
          <DialogDescription className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Manage your form templates and sharing options
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <Button
            onClick={handleSaveTemplate}
            className="w-full justify-start space-x-3 h-12"
            variant="outline"
          >
            <Save size={20} />
            <div className="text-left">
              <div className="font-medium">Save as Template</div>
              <div className="text-sm text-gray-500">Save current form as a reusable template</div>
            </div>
          </Button>

          <Button
            onClick={handleLoadTemplate}
            className="w-full justify-start space-x-3 h-12"
            variant="outline"
          >
            <Upload size={20} />
            <div className="text-left">
              <div className="font-medium">Load Template</div>
              <div className="text-sm text-gray-500">Load a previously saved template</div>
            </div>
          </Button>

          <Button
            onClick={handleShareForm}
            className="w-full justify-start space-x-3 h-12"
            variant="outline"
          >
            <Share size={20} />
            <div className="text-left">
              <div className="font-medium">Share Form</div>
              <div className="text-sm text-gray-500">Generate a shareable link for this form</div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
