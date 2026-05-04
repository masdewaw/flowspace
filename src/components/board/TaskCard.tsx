import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { MoreHorizontal, Paperclip, MessageSquare } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { clsx } from 'clsx';

import { useTaskStore, type Task } from '../../stores/taskStore';

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
  onClick?: (task: Task) => void;
}

const priorityConfig: Record<string, { color: string, label: string }> = {
  critical: { color: 'bg-danger/10 text-danger border-danger/20', label: 'Critical' },
  high: { color: 'bg-warning/10 text-warning border-warning/20', label: 'High' },
  medium: { color: 'bg-primary/10 text-primary border-primary/20', label: 'Medium' },
  low: { color: 'bg-success/10 text-success border-success/20', label: 'Low' },
};

const TaskCard: React.FC<TaskCardProps> = ({ task, isOverlay, onClick }) => {
  const { projectMembers } = useTaskStore();
  
  const priorityKey = (task.priority as string) || 'medium';
  const priority = priorityConfig[priorityKey] || priorityConfig.medium;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: task.id,
    disabled: isOverlay 
  });

  const style = !isOverlay ? {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0 : undefined,
  } : undefined;


  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isOverlay ? {} : attributes)}
      {...(isOverlay ? {} : listeners)}
      className={clsx(
        "relative group w-full bg-surface dark:bg-surface/60 border border-border/50 p-4 rounded-2xl cursor-grab active:cursor-grabbing transition-all duration-300",
        "shadow-soft",
        !isOverlay && "hover:shadow-premium hover:border-border-strong hover:-translate-y-1",
        onClick && "cursor-pointer"
      )}
      onClick={() => onClick?.(task)}
    >
      {/* Priority Indicator Line */}
      <div className={clsx("absolute top-4 left-0 w-1 h-6 rounded-r-full", priority.color.split(' ')[1].replace('text-', 'bg-'))} />

      <div className="flex items-start justify-between mb-3 pl-2">
        <Badge className={clsx("text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-lg border", priority.color)}>
          {priority.label}
        </Badge>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center hover:bg-surface-2 rounded-lg text-text-muted">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2 mb-4 pl-2">
        <h4 className="text-sm font-bold text-text-primary leading-snug group-hover:text-primary transition-colors">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/30 pl-2">
        <div className="flex items-center space-x-3 text-text-muted">
          <div className="flex items-center space-x-1 hover:text-primary transition-colors cursor-pointer">
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">0</span>
          </div>
          {task.due_date && (
            <div className="flex items-center space-x-1 text-accent transition-colors">
              <Paperclip className="w-3.5 h-3.5 rotate-45" />
              <span className="text-[10px] font-bold">
                {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}
        </div>

        <div className="flex -space-x-2">
          {task.assignee_ids?.slice(0, 3).map((id) => {
            const member = projectMembers.find(m => m.id === id);
            return (
              <div 
                key={id}
                className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-surface dark:border-surface-2 flex items-center justify-center text-[8px] font-black text-primary shadow-sm overflow-hidden"
                title={member?.name || 'Unknown'}
              >
                {member?.name?.[0] || 'U'}
              </div>
            );
          })}
          {task.assignee_ids && task.assignee_ids.length > 3 && (
            <div className="w-7 h-7 rounded-full bg-surface-2 border-2 border-surface flex items-center justify-center text-[8px] font-bold text-text-muted">
              +{task.assignee_ids.length - 3}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
