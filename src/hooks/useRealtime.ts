import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTaskStore } from '../stores/taskStore';
import { useSprintStore } from '../stores/sprintStore';

export const useRealtime = (projectId?: string) => {
  const { fetchTasks } = useTaskStore();
  const { fetchSprints } = useSprintStore();

  useEffect(() => {
    if (!projectId) return;

    // Subscribe to task changes
    const taskChannel = supabase
      .channel(`project-tasks-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          fetchTasks(projectId);
        }
      )
      .subscribe();

    // Subscribe to sprint changes
    const sprintChannel = supabase
      .channel(`project-sprints-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sprints',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          fetchSprints(projectId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(taskChannel);
      supabase.removeChannel(sprintChannel);
    };
  }, [projectId, fetchTasks, fetchSprints]);
};
