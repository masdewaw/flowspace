import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import type { User } from '@supabase/supabase-js';

export type Project = Database['public']['Tables']['projects']['Row'] & {
  member_count?: number;
  task_count?: number;
  invite_code?: string | null;
};
export type Workspace = Database['public']['Tables']['workspaces']['Row'] & {
  member_count?: number;
  my_role?: 'owner' | 'admin' | 'member' | 'viewer';
};
export interface WorkspaceMember {
  user_id: string;
  role: string;
  profiles: {
    id: string;
    name: string | null;
    avatar_url: string | null;
    email: string | null;
  } | null;
}

interface ProjectState {
  workspaces: Workspace[];
  projects: Project[];
  activeWorkspace: Workspace | null;
  activeProject: Project | null;
  loading: boolean;
  user: User | null;
  fetchUser: () => Promise<void>;
  isAdmin: (workspaceId: string) => boolean;
  fetchWorkspaces: () => Promise<void>;
  fetchProjects: (workspaceId: string) => Promise<void>;
  setActiveWorkspace: (workspace: Workspace) => void;
  setActiveProject: (project: Project) => void;
  createWorkspace: (name: string) => Promise<void>;
  createProject: (project: Database['public']['Tables']['projects']['Insert']) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  joinProject: (inviteCode: string) => Promise<string>; // Returns project_id
  getProjectByInviteCode: (code: string) => Promise<Project>;
  fetchWorkspaceMembers: (workspaceId: string) => Promise<WorkspaceMember[]>;
  addProjectMember: (projectId: string, userId: string, role?: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  workspaces: [],
  projects: [],
  activeWorkspace: null,
  activeProject: null,
  loading: false,
  user: null,
  fetchUser: async () => {
    const { data } = await supabase.auth.getUser();
    set({ user: data.user });
  },
  isAdmin: (workspaceId: string) => {
    const { workspaces, user } = get();
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (!workspace || !user) return false;
    return workspace.owner_id === user.id || workspace.my_role === 'admin' || workspace.my_role === 'owner';
  },
  fetchWorkspaces: async () => {
    set({ loading: true });
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('workspaces')
        .select(`
          *,
          workspace_members!inner(role),
          all_members:workspace_members(count)
        `)
        .eq('workspace_members.user_id', userId);

      if (error) throw error;
      
      const workspacesWithRole = data.map(w => {
        const members = w.workspace_members as unknown as { role: string }[];
        const counts = w.all_members as unknown as { count: number }[];
        
        return {
          ...w,
          my_role: (members?.[0]?.role as Workspace['my_role']) || (w.owner_id === userId ? 'owner' : 'member'),
          member_count: counts?.[0]?.count || 1
        };
      });

      set({ 
        workspaces: workspacesWithRole, 
        loading: false 
      });

      if (workspacesWithRole.length > 0 && !get().activeWorkspace) {
        set({ activeWorkspace: workspacesWithRole[0] });
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      set({ loading: false });
    }
  },
  createWorkspace: async (name: string) => {
    set({ loading: true });
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    
    if (!user) {
      set({ loading: false });
      throw new Error('User not authenticated');
    }

    const { data: newWorkspace, error: createError } = await supabase
      .from('workspaces')
      .insert({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 7),
        owner_id: user.id
      })
      .select()
      .single();
      
    if (createError) {
      set({ loading: false });
      throw createError;
    }
    
    // Add member
    const { error: memberError } = await supabase.from('workspace_members').insert({
      workspace_id: newWorkspace.id,
      user_id: user.id,
      role: 'admin'
    });

    if (memberError) {
      set({ loading: false });
      throw memberError;
    }
    
    set({ 
      workspaces: [...get().workspaces, newWorkspace], 
      activeWorkspace: newWorkspace,
      loading: false 
    });
  },
  fetchProjects: async (workspaceId) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_members (count)
        `)
        .eq('workspace_id', workspaceId);
      if (error) throw error;
      
      // Transform data to include a proper member_count field
      const projectsWithCount = data.map(p => ({
        ...p,
        member_count: p.project_members?.[0]?.count || 0
      }));
      
      set({ projects: projectsWithCount, loading: false });
    } catch (error) {
      console.error('Error fetching projects:', error);
      set({ loading: false });
    }
  },
  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
  setActiveProject: (project) => set({ activeProject: project }),
  createProject: async (project) => {
    set({ loading: true });
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single();
      
      if (error) throw error;

      // Add creator as member
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: data.id,
          user_id: user.id,
          role: 'lead'
        });

      if (memberError) throw memberError;

      set({ projects: [data, ...get().projects], loading: false });
    } catch (error) {
      console.error('Error creating project:', error);
      set({ loading: false });
      throw error;
    }
  },
  updateProject: async (id, updates) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { member_count: _, task_count: __, ...dbUpdates } = updates;
    
    // Convert Partial<Project> to the update type expected by Supabase
    // We need to omit the extra fields we added (member_count, task_count)
    const { error } = await supabase
      .from('projects')
      .update(dbUpdates as Database['public']['Tables']['projects']['Update'])
      .eq('id', id);
      
    if (error) throw error;
    set({
      projects: get().projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      activeProject: get().activeProject?.id === id ? { ...get().activeProject!, ...updates } : get().activeProject,
    });
  },
  deleteProject: async (id) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
    set({
      projects: get().projects.filter((p) => p.id !== id),
      activeProject: get().activeProject?.id === id ? null : get().activeProject,
    });
  },
  joinProject: async (inviteCode: string) => {
    set({ loading: true });
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) throw new Error('User not authenticated');

      // 1. Find project by invite code
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('invite_code', inviteCode)
        .single();

      if (projectError || !project) throw new Error('Invalid invite code');

      // 2. Check if already a member
      const { data: existingMember } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', project.id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        set({ loading: false });
        return project.id;
      }

      // 3. Add to project_members
      const { error: joinError } = await supabase
        .from('project_members')
        .insert({
          project_id: project.id,
          user_id: user.id,
          role: 'member'
        });

      if (joinError) throw joinError;

      // 4. Ensure user is in the workspace
      if (!project.workspace_id) throw new Error('Project has no workspace');
      const { data: workspaceMember } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', project.workspace_id)
        .eq('user_id', user.id)
        .single();

      if (!workspaceMember) {
        await supabase.from('workspace_members').insert({
          workspace_id: project.workspace_id,
          user_id: user.id,
          role: 'member'
        });
      }

      set({ loading: false });
      return project.id;
    } catch (error) {
      console.error('Error joining project:', error);
      set({ loading: false });
      throw error;
    }
  },
  getProjectByInviteCode: async (code: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        workspaces (
          name
        )
      `)
      .eq('invite_code', code)
      .single();

    if (error || !data) throw new Error('Invalid invite code');
    return data as unknown as Project;
  },
  fetchWorkspaceMembers: async (workspaceId: string) => {
    const { data, error } = await supabase
      .from('workspace_members')
      .select(`
        user_id,
        role,
        profiles:profiles(*)
      `)
      .eq('workspace_id', workspaceId);

    if (error) throw error;
    return (data as unknown as WorkspaceMember[]) || [];
  },
  addProjectMember: async (projectId: string, userId: string, role = 'member') => {
    const { error } = await supabase
      .from('project_members')
      .insert({
        project_id: projectId,
        user_id: userId,
        role
      });

    if (error) throw error;
  }
}));
