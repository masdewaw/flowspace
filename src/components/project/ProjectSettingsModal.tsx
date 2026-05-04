import React, { useState } from 'react';
import { Modal } from '../ui/Modal.tsx';
import { Input } from '../ui/Input.tsx';
import { Button } from '../ui/Button.tsx';
import { useProjectStore, type Project } from '../../stores/projectStore';
import { Trash2, AlertTriangle, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({ isOpen, onClose, project }) => {
  const [name, setName] = useState(project?.name || '');
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { updateProject, deleteProject, isAdmin } = useProjectStore();
  const navigate = useNavigate();

  const isProjectAdmin = project.workspace_id ? isAdmin(project.workspace_id) : false;

  const handleSave = async () => {
    if (!name.trim() || !isProjectAdmin) return;
    setLoading(true);
    try {
      await updateProject(project.id, { name });
      toast.success('Project updated successfully');
      onClose();
    } catch {
      toast.error('Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isProjectAdmin) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setLoading(true);
    try {
      await deleteProject(project.id);
      toast.success('Project deleted successfully');
      navigate('/dashboard');
      onClose();
    } catch {
      toast.error('Failed to delete project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Project Settings"
      description={isProjectAdmin ? "Manage your project details and preferences." : "View project information."}
    >
      <div className="space-y-6 pt-4">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-text-muted ml-1">
            Project Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter project name"
            className="h-12 bg-surface-2/50 border-border/50 focus:border-primary/50"
            disabled={!isProjectAdmin}
          />
        </div>

        {isProjectAdmin && (
          <div className="pt-4 border-t border-border/30">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-text-primary">Danger Zone</h4>
                <p className="text-xs text-text-secondary">Permanently delete this project and all its tasks.</p>
              </div>
            </div>
            
            <div className="mt-4 p-4 rounded-2xl bg-danger/5 border border-danger/20 flex flex-col space-y-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                <div className="text-xs text-danger/80 leading-relaxed">
                  Deleting a project is irreversible. All tasks, comments, and files associated with this project will be removed forever.
                </div>
              </div>
              
              <Button
                variant={confirmDelete ? 'danger' : 'outline'}
                className="w-full h-11 font-bold group"
                onClick={handleDelete}
                isLoading={loading && confirmDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {confirmDelete ? 'Click again to confirm delete' : 'Delete Project'}
              </Button>
              
              {confirmDelete && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-text-muted hover:text-text-primary"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel deletion
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 pt-4">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {isProjectAdmin ? 'Cancel' : 'Close'}
          </Button>
          {isProjectAdmin && (
            <Button 
              className="px-8 shadow-premium" 
              onClick={handleSave} 
              isLoading={loading && !confirmDelete}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ProjectSettingsModal;
