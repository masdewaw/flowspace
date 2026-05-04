import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Sprint = Database['public']['Tables']['sprints']['Row'];

interface SprintState {
  sprints: Sprint[];
  activeSprint: Sprint | null;
  loading: boolean;
  fetchSprints: (projectId: string) => Promise<void>;
  createSprint: (sprint: Database['public']['Tables']['sprints']['Insert']) => Promise<void>;
  updateSprint: (id: string, updates: Database['public']['Tables']['sprints']['Update']) => Promise<void>;
  startSprint: (id: string) => Promise<void>;
  completeSprint: (id: string) => Promise<void>;
}

export const useSprintStore = create<SprintState>((set, get) => ({
  sprints: [],
  activeSprint: null,
  loading: false,
  fetchSprints: async (projectId) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('sprints')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    set({ 
      sprints: data, 
      activeSprint: data.find(s => s.status === 'active') || null,
      loading: false 
    });
  },
  createSprint: async (sprint) => {
    const { data, error } = await supabase
      .from('sprints')
      .insert(sprint)
      .select()
      .single();

    if (error) throw error;
    set({ sprints: [data, ...get().sprints] });
  },
  updateSprint: async (id, updates) => {
    const { data, error } = await supabase
      .from('sprints')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    set({
      sprints: get().sprints.map(s => s.id === id ? data : s),
      activeSprint: data.status === 'active' ? data : get().activeSprint
    });
  },
  startSprint: async (id) => {
    const active = get().activeSprint;
    if (active) {
      await get().updateSprint(active.id, { status: 'completed' });
    }
    await get().updateSprint(id, { status: 'active', start_date: new Date().toISOString() });
  },
  completeSprint: async (id) => {
    await get().updateSprint(id, { status: 'completed', end_date: new Date().toISOString() });
    set({ activeSprint: null });
  }
}));
