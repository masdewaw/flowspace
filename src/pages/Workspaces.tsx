import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2, ChevronRight, Users, ShieldCheck } from 'lucide-react';
import { useProjectStore, type Workspace } from '../stores/projectStore';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import WorkspaceModal from '../components/project/WorkspaceModal';

const Workspaces: React.FC = () => {
  const { workspaces, fetchWorkspaces, setActiveWorkspace, loading } = useProjectStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleSelectWorkspace = (workspace: Workspace) => {
    setActiveWorkspace(workspace);
    navigate('/dashboard');
  };

  if (loading && workspaces.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-text-secondary font-medium animate-pulse tracking-wide">Loading your universes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary relative overflow-hidden flex flex-col">
      {/* Background Ambient Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse-soft" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full animate-pulse-soft" />

      <div className="relative z-10 max-w-6xl mx-auto w-full px-6 py-20 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Workspace Hub</span>
            </div>
            <h1 className="text-display text-5xl md:text-6xl">Choose your space</h1>
            <p className="text-text-secondary text-xl max-w-xl">
              Welcome back, <span className="text-text-primary font-bold">{user?.user_metadata?.full_name?.split(' ')[0] || 'Explorer'}</span>. Select a workspace to continue your progress.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button 
              variant="primary" 
              size="lg" 
              className="rounded-2xl px-8 h-14 shadow-premium hover:scale-105 transition-transform"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-5 h-5 mr-3" />
              New Workspace
            </Button>
          </motion.div>
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace, index) => (
            <motion.div
              key={workspace.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              onClick={() => handleSelectWorkspace(workspace)}
              className="group cursor-pointer"
            >
              <div className="relative h-full p-8 rounded-[2.5rem] bg-surface/40 backdrop-blur-xl border border-border/50 hover:border-primary/40 transition-all duration-500 hover:shadow-premium hover:-translate-y-2 overflow-hidden">
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Building2 className="w-24 h-24 rotate-12" />
                </div>

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform duration-500 border border-primary/10">
                    <Building2 className="w-7 h-7" />
                  </div>
                  
                  <h3 className="text-2xl font-black text-text-primary mb-2 group-hover:text-primary transition-colors">{workspace.name}</h3>
                  <div className="flex items-center text-text-muted text-xs font-semibold uppercase tracking-widest mb-8">
                    <span>{workspace.owner_id === user?.id ? 'Owner' : 'Member'}</span>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-border/30">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-text-secondary text-sm">
                        <Users className="w-4 h-4 mr-2" />
                        <span className="font-bold">{workspace.member_count || 1}</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all duration-500">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Empty State */}
          {workspaces.length === 0 && !loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 border-2 border-dashed border-border/30 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-6 bg-surface/20"
            >
              <div className="w-20 h-20 bg-surface-2 rounded-3xl flex items-center justify-center shadow-inner-light">
                <Building2 className="w-10 h-10 text-text-muted" />
              </div>
              <div className="max-w-xs">
                <h3 className="text-2xl font-bold text-text-primary">No workspaces yet</h3>
                <p className="text-text-secondary mt-2 text-sm leading-relaxed">Create your first space to start organizing your projects and tasks.</p>
              </div>
              <Button 
                variant="secondary" 
                className="rounded-2xl px-10 h-12 shadow-soft"
                onClick={() => setIsModalOpen(true)}
              >
                Create Workspace
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      <WorkspaceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default Workspaces;
