import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Layout, Users, Clock, ArrowUpRight, Building2, ShieldCheck, KanbanSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useProjectStore } from '../stores/projectStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { motion } from 'framer-motion';
import ProjectModal from '../components/project/ProjectModal';
import WorkspaceModal from '../components/project/WorkspaceModal';
import TaskModal from '../components/board/TaskModal';
import { useUIStore } from '../stores/uiStore';

const ProjectDashboard: React.FC = () => {
  const { workspaces, projects, activeWorkspace, fetchWorkspaces, fetchProjects, loading } = useProjectStore();
  const { isTaskModalOpen, openTaskModal, closeTaskModal } = useUIStore();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    if (activeWorkspace) {
      fetchProjects(activeWorkspace.id);
    }
  }, [activeWorkspace, fetchProjects]);

  if (loading && workspaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-primary/10 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="text-text-secondary font-medium animate-pulse">Initializing your space...</p>
      </div>
    );
  }

  // No Workspace Empty State
  if (workspaces.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[75vh] max-w-xl mx-auto text-center space-y-10 p-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/10 rounded-[3rem] flex items-center justify-center shadow-premium"
        >
          <Building2 className="w-16 h-16 text-primary" />
        </motion.div>
        <div className="space-y-4">
          <h1 className="text-display text-5xl">Welcome to FlowSpace7</h1>
          <p className="text-text-secondary text-xl leading-relaxed">
            Every great project starts with a dedicated space. Create your first workspace to begin your high-performance journey.
          </p>
        </div>
        <Button 
          variant="primary" 
          size="lg" 
          onClick={() => setIsWorkspaceModalOpen(true)}
          className="rounded-2xl px-12 h-16 text-xl shadow-premium hover:scale-105 transition-transform"
        >
          <Plus className="w-6 h-6 mr-3" />
          Create My First Workspace
        </Button>
        <WorkspaceModal 
          isOpen={isWorkspaceModalOpen} 
          onClose={() => setIsWorkspaceModalOpen(false)} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-3 text-text-muted">
            <Building2 className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">{activeWorkspace?.name}</span>
          </div>
          <h1 className="text-display text-4xl">Project Dashboard</h1>
          <p className="text-text-secondary">Overview of all active projects in this workspace.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="ghost" className="rounded-xl border border-border/50 bg-surface-2/50" onClick={() => navigate('/workspaces')}>
            Switch Workspace
          </Button>
          <Button 
            variant="secondary" 
            className="rounded-xl shadow-soft"
            onClick={() => openTaskModal()}
            disabled={projects.length === 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
          <Button variant="primary" className="rounded-xl shadow-premium" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </div>
      </div>

      {/* Stats Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Projects', value: projects.length, icon: Layout, color: 'text-primary' },
          { label: 'Total Members', value: activeWorkspace?.member_count || 1, icon: Users, color: 'text-success' },
          { label: 'Workspace Owner', value: activeWorkspace?.owner_id ? 'You' : 'N/A', icon: ShieldCheck, color: 'text-accent' },
          { label: 'Total Tasks', value: projects.reduce((acc, p) => acc + (p.task_count || 0), 0), icon: KanbanSquare, color: 'text-warning' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-surface/40 border border-border/50 p-5 rounded-2xl flex items-center space-x-4"
          >
            <div className={`w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-text-muted">{stat.label}</p>
              <p className="text-lg font-black text-text-primary">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (index * 0.1) }}
            className="group relative"
            onClick={() => navigate(`/board?project=${project.id}`)}
          >
            {/* Hover Glow Effect */}
            <div 
              className="absolute -inset-0.5 rounded-[2rem] opacity-0 group-hover:opacity-20 blur-xl transition duration-500"
              style={{ backgroundColor: project.color || 'rgb(var(--primary))' }}
            />
            
            <div className="relative bg-surface/60 dark:bg-surface/40 backdrop-blur-xl border border-border/50 rounded-[2rem] p-7 cursor-pointer hover:border-primary/30 transition-all duration-500 overflow-hidden group shadow-soft hover:shadow-premium">
              <div className="flex items-center justify-between mb-6">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500"
                  style={{ backgroundColor: `${project.color || '#6366F1'}20`, color: project.color || '#6366F1' }}
                >
                  <Layout className="w-8 h-8" />
                </div>
                <div className="flex flex-col items-end">
                   <Badge variant="success" className="bg-success/10 text-success border-success/20 mb-2">
                    Active
                  </Badge>
                  <ArrowUpRight className="w-5 h-5 text-text-muted group-hover:text-primary transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <h3 className="text-h2 text-text-primary group-hover:text-primary transition-colors leading-tight">{project.name}</h3>
                <p className="text-text-secondary text-sm line-clamp-2 leading-relaxed">
                  {project.description || 'Elevate your project execution with FlowSpace7 tracking.'}
                </p>
              </div>

              <div className="flex items-center space-x-6 mb-8">
                <div className="flex items-center text-xs font-semibold text-text-muted">
                  <Users className="w-4 h-4 mr-2 text-primary/60" />
                  <span>{project.member_count || 1} Member{project.member_count !== 1 && 's'}</span>
                </div>
                <div className="flex items-center text-xs font-semibold text-text-muted">
                  <Clock className="w-4 h-4 mr-2 text-accent/60" />
                  <span>{project.created_at ? formatDistanceToNow(new Date(project.created_at)) : 'Recently'} ago</span>
                </div>
              </div>

              <div className="pt-6 border-t border-border/40 flex items-center justify-between">
                <div className="flex -space-x-3">
                  {[1].map((i) => (
                    <div 
                      key={i} 
                      className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark border-4 border-surface dark:border-surface-2 flex items-center justify-center text-xs font-bold text-white shadow-premium z-10"
                    >
                      {activeWorkspace?.owner_id?.substring(0, 1).toUpperCase() || 'U'}
                    </div>
                  ))}
                  <div className="w-9 h-9 rounded-full bg-surface-2 border-4 border-surface dark:border-surface-2 flex items-center justify-center text-[10px] font-bold text-text-muted z-0">
                    +0
                  </div>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted group-hover:text-primary transition-colors">
                  View Board
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {projects.length === 0 && activeWorkspace && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full py-24 bg-surface/30 border-2 border-dashed border-border/50 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-6"
          >
            <div className="w-20 h-20 bg-surface-2 rounded-[2rem] flex items-center justify-center shadow-inner-light">
              <Plus className="w-10 h-10 text-text-muted" />
            </div>
            <div className="max-w-sm">
              <h3 className="text-h2 text-text-primary">Ready to build something?</h3>
              <p className="text-text-secondary mt-2">No projects found in this workspace yet. Let's create your first one!</p>
            </div>
            <Button 
              variant="secondary" 
              size="lg"
              className="rounded-2xl px-10 h-14 shadow-premium"
              onClick={() => setIsModalOpen(true)}
            >
              Create New Project
            </Button>
          </motion.div>
        )}
      </div>

      <ProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      <WorkspaceModal 
        isOpen={isWorkspaceModalOpen} 
        onClose={() => setIsWorkspaceModalOpen(false)} 
      />
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={closeTaskModal}
      />
    </div>
  );
};

export default ProjectDashboard;
