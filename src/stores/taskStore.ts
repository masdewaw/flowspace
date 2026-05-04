import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

export type Task = Database['public']['Tables']['tasks']['Row'];
export type ProjectMember = Database['public']['Tables']['profiles']['Row'] & {
  project_role: string;
};

interface TaskState {
  tasks: Task[];
  projectMembers: ProjectMember[];
  loading: boolean;
  fetchTasks: (projectId: string) => Promise<void>;
  fetchProjectMembers: (projectId: string) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  moveTask: (taskId: string, newStatus: string, newIndex: number) => Promise<void>;
  createTask: (task: Database['public']['Tables']['tasks']['Insert']) => Promise<void>;
  setTasks: (tasks: Task[]) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  projectMembers: [],
  loading: false,
  fetchTasks: async (projectId) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });
      if (error) throw error;
      set({ tasks: data || [], loading: false });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      import('react-hot-toast').then(({ toast }) => {
        toast.error('Failed to load tasks');
      });
      set({ loading: false });
      throw error;
    }
  },
  fetchProjectMembers: async (projectId) => {
    try {
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          role,
          profiles (*)
        `)
        .eq('project_id', projectId);

      if (error) throw error;

      const members = (data as unknown as Array<{ role: string; profiles: Database['public']['Tables']['profiles']['Row'] }>).map((m) => ({
        ...m.profiles,
        project_role: m.role
      })) as ProjectMember[];

      set({ projectMembers: members });
    } catch (error) {
      console.error('Error fetching project members:', error);
    }
  },
  updateTask: async (id, updates) => {
    // Get old task to check for new assignees
    const oldTask = get().tasks.find(t => t.id === id);
    const { error } = await supabase.from('tasks').update(updates).eq('id', id);
    if (error) throw error;
    
    set({
      tasks: get().tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    });

    // Notify new assignees
    if (updates.assignee_ids && oldTask) {
      const newAssignees = updates.assignee_ids.filter(id => !oldTask.assignee_ids?.includes(id));
      if (newAssignees.length > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        for (const userId of newAssignees) {
          if (userId === user?.id) continue; // Don't notify self
          await supabase.from('notifications').insert([{
            user_id: userId,
            title: 'New Task Assigned',
            description: `You have been assigned to: ${updates.title || oldTask.title}`,
            type: 'task_assignment',
            icon: '🎯',
            link: `/board?task=${id}`
          }]);
        }
      }
    }
  },
  moveTask: async (taskId, newStatus, newIndex) => {
    const tasks = [...get().tasks];
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const task = tasks[taskIndex];
    // const oldStatus = task.status;
    
    // Optimistic Update
    const updatedTask = { ...task, status: newStatus, order_index: newIndex };
    const filteredTasks = tasks.filter(t => t.id !== taskId);
    
    // Simple reordering logic for optimistic UI
    const statusTasks = filteredTasks.filter(t => t.status === newStatus);
    statusTasks.splice(newIndex, 0, updatedTask);
    
    const finalTasks = [
      ...filteredTasks.filter(t => t.status !== newStatus),
      ...statusTasks
    ].map((t, idx) => ({ ...t, order_index: idx }));

    set({ tasks: finalTasks });

    // Persist to Supabase
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus, order_index: newIndex })
      .eq('id', taskId);

    if (error) {
      // Revert on error
      get().fetchTasks(task.project_id!);
    }
  },
  createTask: async (task) => {
    const { data, error } = await supabase.from('tasks').insert([task]).select().single();
    if (error) throw error;
    if (data) {
      set({ tasks: [...get().tasks, data] });

      // Notify assignees
      if (data.assignee_ids && data.assignee_ids.length > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        for (const userId of data.assignee_ids) {
          if (userId === user?.id) continue;
          await supabase.from('notifications').insert([{
            user_id: userId,
            title: 'New Task Assigned',
            description: `You have been assigned to: ${data.title}`,
            type: 'task_assignment',
            icon: '🎯',
            link: `/board?task=${data.id}`
          }]);
        }
      }
    }
  },
  setTasks: (tasks) => set({ tasks }),
}));
