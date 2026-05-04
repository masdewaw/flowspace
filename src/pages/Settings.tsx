import React, { useState } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { Save, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'react-hot-toast';

const Settings: React.FC = () => {
  const { activeWorkspace } = useProjectStore();
  const [name, setName] = useState(activeWorkspace?.name || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      // Mock update for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  if (!activeWorkspace) return null;

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-display">Workspace Settings</h1>
        <p className="text-text-secondary">Manage your workspace identity and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          <h3 className="text-h3">General</h3>
          <p className="text-sm text-text-muted">Basic identity and branding for your workspace.</p>
        </div>
        
        <div className="md:col-span-2 card p-8">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-bold text-text-muted uppercase tracking-wider">Workspace Name</label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. My Awesome Team"
              />
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={loading || name === activeWorkspace.name}>
                {loading ? 'Saving...' : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-border/50">
        <div className="md:col-span-1 space-y-2">
          <h3 className="text-h3 text-error">Danger Zone</h3>
          <p className="text-sm text-text-muted">Irreversible actions that affect your entire workspace.</p>
        </div>
        
        <div className="md:col-span-2 card p-8 border-error/20 bg-error/5">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-error/10 rounded-xl text-error">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h4 className="font-bold text-text-primary">Delete Workspace</h4>
                <p className="text-sm text-text-secondary mt-1">
                  Once you delete a workspace, there is no going back. Please be certain.
                </p>
              </div>
              <Button variant="outline" className="border-error text-error hover:bg-error hover:text-white transition-all">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Workspace
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
