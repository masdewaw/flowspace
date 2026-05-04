import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children,
  size = 'md'
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] h-[90vh]'
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
        <Dialog.Content 
          className={clsx(
            "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full z-[101]",
            "bg-surface dark:bg-zinc-900 border border-border/50 rounded-[2rem] shadow-premium",
            "p-8 animate-in fade-in zoom-in-95 slide-in-from-bottom-10 duration-500",
            sizes[size]
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <Dialog.Title className="text-display text-2xl font-bold text-text-primary">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button 
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-2 text-text-muted hover:text-text-primary transition-all active:scale-90"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>
          
          {description && (
            <Dialog.Description className="text-text-secondary text-sm mb-6 leading-relaxed">
              {description}
            </Dialog.Description>
          )}

          <div className="relative">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export { Modal };
