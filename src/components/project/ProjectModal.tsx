import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useProjectStore } from '../../stores/projectStore';
import { useAuthStore } from '../../stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = [
  '#E11D48', // Rose/Primary
  '#F97316', // Orange
  '#8B5CF6', // Purple
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F43F5E', // Pink
];

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { activeWorkspace, createProject } = useProjectStore();
  const { user } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !activeWorkspace || !user) return;

    setIsSubmitting(true);
    try {
      await createProject({
        name: name.trim(),
        description: description.trim() || null,
        color,
        workspace_id: activeWorkspace.id
      });
      setName('');
      setDescription('');
      setColor(COLORS[0]);
      onClose();
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 dark:bg-zinc-900/80 backdrop-blur-sm z-40"
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-surface dark:bg-surface-dark border border-border/50 rounded-3xl shadow-premium w-full max-w-md overflow-hidden pointer-events-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-border/50">
                <h2 className="text-xl font-bold text-text-primary">Create New Project</h2>
                <button 
                  onClick={onClose}
                  className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-2 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label htmlFor="projectName" className="text-sm font-semibold text-text-secondary">Project Name</label>
                  <Input 
                    id="projectName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Q3 Marketing Campaign" 
                    required
                    autoFocus
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="projectDesc" className="text-sm font-semibold text-text-secondary">Description <span className="text-text-muted font-normal">(Optional)</span></label>
                  <textarea 
                    id="projectDesc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this project about?"
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 transition-all resize-none h-24"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-text-secondary">Project Color</label>
                  <div className="flex items-center space-x-3">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-offset-surface ring-primary' : 'hover:scale-110'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                  <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="rounded-xl shadow-premium" disabled={isSubmitting || !name.trim()}>
                    {isSubmitting ? 'Creating...' : 'Create Project'}
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

export default ProjectModal;
