import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { MoreHorizontal, Plus } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

import { type Task } from '../../stores/taskStore';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, tasks }) => {
  const { setNodeRef } = useDroppable({ id });
  const { openTaskModal } = useUIStore();
  const [showMore, setShowMore] = React.useState(false);

  const handleClearColumn = async () => {
    if (window.confirm(`Are you sure you want to clear all tasks in ${title}?`)) {
      // Implementation for clearing tasks
      import('../../lib/supabase').then(({ supabase }) => {
        supabase.from('tasks').delete().eq('status', id).then(() => {
          window.location.reload(); // Simple refresh for now
        });
      });
    }
  };

  return (
    <div className="flex flex-col w-[350px] min-w-[350px] bg-surface/30 dark:bg-surface-2/20 backdrop-blur-xl border border-border/40 shadow-soft rounded-[2.5rem] p-5 h-full max-h-full transition-all duration-500">
      <div className="flex items-center justify-between mb-6 px-1 relative">
        <div className="flex items-center space-x-3">
          <div className={`w-2 h-2 rounded-full ${
            id === 'todo' ? 'bg-text-muted' : 
            id === 'in_progress' ? 'bg-primary' : 
            id === 'review' ? 'bg-warning' : 'bg-success'
          }`} />
          <h3 className="text-[11px] font-black uppercase tracking-widest text-text-muted">{title}</h3>
          <span className="px-2 py-0.5 rounded-full bg-surface-2 text-[10px] font-bold text-text-secondary border border-border/50">
            {tasks.length}
          </span>
        </div>
        <div className="relative">
          <button 
            className="w-8 h-8 flex items-center justify-center hover:bg-surface-2 rounded-xl transition-colors text-text-muted"
            onClick={() => setShowMore(!showMore)}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {showMore && (
            <div className="absolute right-0 mt-2 w-48 bg-surface-2 border border-border/50 rounded-2xl shadow-premium z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
              <button 
                className="w-full text-left px-4 py-2 text-xs font-bold text-text-secondary hover:text-primary hover:bg-surface-2 rounded-xl transition-colors"
                onClick={() => { setShowMore(false); /* open rename modal */ }}
              >
                Rename Stage
              </button>
              <button 
                className="w-full text-left px-4 py-2 text-xs font-bold text-danger hover:bg-danger/10 rounded-xl transition-colors"
                onClick={handleClearColumn}
              >
                Clear Stage
              </button>
            </div>
          )}
        </div>
      </div>

      <div ref={setNodeRef} className="flex-1 overflow-y-auto min-h-[150px] custom-scrollbar pr-1 w-full">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4 pb-4 w-full">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onClick={(t) => openTaskModal(t.status, t)} />
            ))}
          </div>
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="h-32 border-2 border-dashed border-border/30 rounded-3xl flex flex-col items-center justify-center text-center space-y-2 opacity-50 group">
             <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center group-hover:scale-110 transition-transform">
               <Plus className="w-4 h-4 text-text-muted" />
             </div>
             <p className="text-[10px] font-bold uppercase tracking-tighter text-text-muted">Empty Stage</p>
          </div>
        )}
      </div>

      <button 
        className="mt-4 group flex items-center justify-center w-full h-12 rounded-2xl bg-surface-2/50 border border-border/50 text-text-secondary hover:text-primary hover:border-primary/50 hover:bg-surface-2 transition-all text-xs font-bold shadow-soft"
        onClick={() => openTaskModal(id)}
      >
        <Plus className="w-4 h-4 mr-2 group-hover:scale-125 transition-transform" />
        Add New Task
      </button>
    </div>
  );
};

export default KanbanColumn;
