import React, { useState } from 'react';
import { X, Building2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useProjectStore } from '../../stores/projectStore';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WorkspaceModal: React.FC<WorkspaceModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createWorkspace } = useProjectStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await createWorkspace(name.trim());
      setName('');
      onClose();
    } catch (error) {
      console.error('Failed to create workspace:', error);
      alert('Failed to create workspace. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 dark:bg-zinc-900/80 backdrop-blur-sm z-40"
          />
          
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-surface border border-border/50 rounded-3xl shadow-premium w-full max-w-md overflow-hidden pointer-events-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-border/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-text-primary">New Workspace</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-2 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label htmlFor="workspaceName" className="text-sm font-semibold text-text-secondary">Workspace Name</label>
                  <Input 
                    id="workspaceName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. My Company or Personal" 
                    required
                    autoFocus
                    className="h-12 rounded-xl"
                  />
                  <p className="text-xs text-text-muted">A workspace is where you organize your projects and team.</p>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                  <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="rounded-xl shadow-premium px-8" disabled={isSubmitting || !name.trim()}>
                    {isSubmitting ? 'Creating...' : 'Create Workspace'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WorkspaceModal;
