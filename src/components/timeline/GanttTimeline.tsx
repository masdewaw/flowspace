import React from 'react';
import { motion } from 'framer-motion';
import { format, addDays, startOfToday, eachDayOfInterval, isSameDay } from 'date-fns';
import { clsx } from 'clsx';

interface TimelineTask {
  id: string;
  title: string;
  start_date: Date;
  end_date: Date;
  color?: string;
}

interface GanttTimelineProps {
  tasks: TimelineTask[];
  onTaskClick?: (taskId: string) => void;
}

const GanttTimeline: React.FC<GanttTimelineProps> = ({ tasks, onTaskClick }) => {
  const today = startOfToday();
  const startDate = addDays(today, -7);
  const endDate = addDays(today, 21);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="overflow-x-auto card">
      <div className="min-w-[1200px]">
        {/* Header */}
        <div className="flex border-b border-border bg-surface-2">
          <div className="w-64 p-4 border-r border-border font-semibold sticky left-0 bg-surface-2 z-10">
            Task
          </div>
          <div className="flex flex-1">
            {days.map((day) => (
              <div 
                key={day.toISOString()}
                className={clsx(
                  "flex-1 min-w-[40px] p-2 text-center text-[10px] border-r border-border/50",
                  isSameDay(day, today) && "bg-primary/10 font-bold text-primary"
                )}
              >
                <div>{format(day, 'EEE')}</div>
                <div>{format(day, 'd')}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border/50">
          {tasks.map((task) => {
            const startIdx = days.findIndex(d => isSameDay(d, task.start_date));
            const endIdx = days.findIndex(d => isSameDay(d, task.end_date));
            
            // Calculate position
            const startPercent = (startIdx / days.length) * 100;
            const widthPercent = ((endIdx - startIdx + 1) / days.length) * 100;

            return (
              <div 
                key={task.id} 
                onClick={() => onTaskClick?.(task.id)}
                className="flex group hover:bg-surface-2/50 transition-colors cursor-pointer"
              >
                <div className="w-64 p-3 border-r border-border truncate text-sm sticky left-0 bg-surface z-10 group-hover:bg-surface-2/50">
                  {task.title}
                </div>
                <div className="flex-1 relative h-12 flex items-center">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="absolute h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center px-3"
                    style={{ 
                      left: `${startPercent}%`, 
                      width: `${widthPercent}%`,
                      transformOrigin: 'left'
                    }}
                  >
                    <span className="text-[10px] font-medium text-primary-dark truncate">
                      {task.title}
                    </span>
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GanttTimeline;
