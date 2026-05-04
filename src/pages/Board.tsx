import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUIStore } from '../stores/uiStore';
import { useTaskStore } from '../stores/taskStore';
import { useProjectStore } from '../stores/projectStore';
import { useRealtime } from '../hooks/useRealtime';
import { Button } from '../components/ui/Button';
import { Filter, Search, Share2, Settings, Plus as PlusIcon, Layout, ChevronRight, UserPlus } from 'lucide-react';
import { Input } from '../components/ui/Input';
import ProjectSettingsModal from '../components/project/ProjectSettingsModal.tsx';
import { toast } from 'react-hot-toast';
import KanbanBoard from '../components/board/KanbanBoard';
import TaskModal from '../components/board/TaskModal';
import AddMemberModal from '../components/project/AddMemberModal';
import { supabase } from '../lib/supabase';

interface ProjectMember {
  id: string;
  user_id: string;
  profiles?: {
    name: string | null;
    avatar_url: string | null;
  } | null;
}

const Board: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [members, setMembers] = useState<ProjectMember[]>([]);

  const { isTaskModalOpen, closeTaskModal, taskModalStatus, editingTask } = useUIStore();
  const { fetchTasks, loading } = useTaskStore();
  const { activeProject, projects, setActiveProject, activeWorkspace, fetchProjects, isAdmin } = useProjectStore();

  useRealtime(projectId || undefined);

  useEffect(() => {
    if (activeWorkspace && projects.length === 0) {
      fetchProjects(activeWorkspace.id);
    }
  }, [activeWorkspace, fetchProjects, projects.length]);

  const fetchMembers = React.useCallback(async () => {
    if (!projectId) return;
    const { data } = await supabase
      .from('project_members')
      .select('*, profiles(name, avatar_url, id, email)')
      .eq('project_id', projectId);
    setMembers((data as unknown as ProjectMember[]) || []);
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchTasks(projectId);
      const project = projects.find(p => p.id === projectId);
      if (project) {
        // Use a small delay or ensure these are decoupled if needed, 
        // but typically standard React effects allow this.
        // The error might be specific to certain strict linters.
        Promise.resolve().then(() => {
          setActiveProject(project);
          fetchMembers();
        });
      }
    }
  }, [projectId, fetchTasks, projects, setActiveProject, fetchMembers]);

  const handleShare = () => {
    if (!activeProject) return;
    const joinLink = `${window.location.origin}/join/${activeProject.invite_code}`;
    navigator.clipboard.writeText(joinLink);
    toast.success('Invite link copied to clipboard!');
  };

  if (!projectId) {
    return (
      <div className="h-full flex flex-col items-start justify-start space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="w-full flex items-center justify-between pb-8 border-b border-border/30">
          <div className="flex items-center space-x-6">
            <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center border border-primary/10 shadow-soft shrink-0">
              <Layout className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-display text-3xl mb-0.5">Select a Project</h2>
              <p className="text-text-secondary text-base">
                Choose a project from <span className="text-text-primary font-bold">{activeWorkspace?.name}</span> to manage your board.
              </p>
            </div>
          </div>
          
          <Button variant="outline" className="rounded-xl" onClick={() => window.location.href = '/dashboard'}>
            <PlusIcon className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => {
                  setSearchParams({ project: project.id });
                  setActiveProject(project);
                }}
                className="group relative flex items-center p-5 rounded-[2rem] bg-surface/40 backdrop-blur-md border border-border/40 hover:border-primary/40 hover:bg-surface/60 transition-all duration-500 text-left hover:shadow-premium overflow-hidden"
              >
                {/* Accent line */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center text-text-muted shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500 border border-border/50">
                  <Layout className="w-6 h-6" />
                </div>
                
                <div className="ml-5 flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-text-primary truncate group-hover:text-primary transition-colors">{project.name}</h3>
                  <p className="text-text-secondary text-sm truncate opacity-70 group-hover:opacity-100 transition-opacity">
                    {project.description || 'No description provided'}
                  </p>
                </div>

                <div className="ml-4 w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center text-text-muted group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-soft">
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
            
            {projects.length === 0 && (
              <div className="col-span-full py-16 flex flex-col items-center justify-center bg-surface/20 rounded-[2.5rem] border-2 border-dashed border-border/30">
                <div className="w-16 h-16 bg-surface-2 rounded-2xl flex items-center justify-center mb-4">
                  <Layout className="w-8 h-8 text-text-muted opacity-50" />
                </div>
                <p className="text-text-secondary font-medium">No projects found in this workspace.</p>
                <Button 
                  variant="ghost" 
                  className="mt-2 text-primary hover:bg-primary/10" 
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Go to Dashboard to create one
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-display">{activeProject?.name || 'Loading Board...'}</h1>
          <p className="text-text-secondary text-sm">Manage tasks and track progress</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full px-5 shadow-sm bg-white/40 dark:bg-zinc-800/40 backdrop-blur-sm"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          {activeProject && activeProject.workspace_id && isAdmin(activeProject.workspace_id) && (
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full shadow-sm bg-white/40 dark:bg-zinc-800/40 backdrop-blur-sm hover:-translate-y-1 transition-transform"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 py-4 border-y border-border/30">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input 
              className="pl-11 h-10 rounded-full bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm border-white/50 shadow-sm" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant={activeFilter === 'all' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="rounded-full h-10 px-4"
              onClick={() => setActiveFilter('all')}
            >
              <Filter className="w-4 h-4 mr-2" />
              All
            </Button>
            {['high', 'medium', 'low'].map((f) => (
              <Button 
                key={f}
                variant={activeFilter === f ? 'secondary' : 'ghost'} 
                size="sm" 
                className="rounded-full h-10 px-4 capitalize"
                onClick={() => setActiveFilter(f as 'high' | 'medium' | 'low')}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex -space-x-2">
            {members.slice(0, 4).map((member) => (
              <div 
                key={member.id} 
                className="w-9 h-9 rounded-full border-2 border-white dark:border-zinc-800 bg-surface-2 flex items-center justify-center text-xs font-bold text-primary shadow-sm relative hover:-translate-y-1 transition-transform cursor-pointer overflow-hidden group"
                title={member.profiles?.name || 'User'}
              >
                {member.profiles?.avatar_url ? (
                  <img src={member.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{member.profiles?.name?.charAt(0) || '?'}</span>
                )}
              </div>
            ))}
              <Button 
                variant="secondary" 
                size="icon" 
                className="w-9 h-9 rounded-full border-2 border-white dark:border-zinc-800 shadow-sm hover:-translate-y-1 transition-transform z-10"
                onClick={() => setIsAddMemberOpen(true)}
              >
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <KanbanBoard searchQuery={searchQuery} filter={activeFilter} />
      )}

      {projectId && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={closeTaskModal}
          projectId={projectId}
          initialStatus={taskModalStatus}
          task={editingTask}
        />
      )}

      {activeProject && (
        <ProjectSettingsModal
          key={activeProject.id}
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          project={activeProject}
        />
      )}

      {activeProject && activeWorkspace && (
        <AddMemberModal
          isOpen={isAddMemberOpen}
          onClose={() => setIsAddMemberOpen(false)}
          projectId={activeProject.id}
          workspaceId={activeWorkspace.id}
          currentMemberIds={members.map(m => m.user_id)}
          onMemberAdded={fetchMembers}
        />
      )}
    </div>
  );
};

export default Board;
