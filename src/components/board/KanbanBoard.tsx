import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import { useTaskStore, type Task } from '../../stores/taskStore';

const COLUMNS = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
];

interface KanbanBoardProps {
  searchQuery?: string;
  filter?: 'all' | 'high' | 'medium' | 'low';
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ searchQuery = '', filter = 'all' }) => {
  const { tasks, moveTask } = useTaskStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Apply Search & Filter
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesFilter = filter === 'all' || task.priority === filter;
    return matchesSearch && matchesFilter;
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findContainer = (id: string) => {
    if (COLUMNS.find((c) => c.id === id)) return id;
    return tasks.find((t) => t.id === id)?.status;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    const { setTasks } = useTaskStore.getState();
    const overItems = tasks.filter(t => t.status === overContainer);
    const overIndex = overItems.findIndex(t => t.id === overId);

    let newIndex;
    if (COLUMNS.find(c => c.id === overId)) {
      newIndex = overItems.length;
    } else {
      const isBelowLastItem = over && overIndex === overItems.length - 1;
      const modifier = isBelowLastItem ? 1 : 0;
      newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length;
    }

    const newTasks = tasks.map(t => {
      if (t.id === activeId) {
        return { ...t, status: overContainer, order_index: newIndex };
      }
      return t;
    });

    setTasks(newTasks);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (activeContainer && overContainer) {
      const activeItems = tasks.filter(t => t.status === activeContainer);
      const overItems = tasks.filter(t => t.status === overContainer);
      
      const activeIndex = activeItems.findIndex(t => t.id === activeId);
      const overIndex = overItems.findIndex(t => t.id === overId);

      if (activeIndex !== overIndex || activeContainer !== overContainer) {
        let newIndex = overIndex;
        if (COLUMNS.find(c => c.id === overId)) {
          newIndex = overItems.length;
        }

        // Commit final state
        moveTask(activeId, overContainer, newIndex);
      }
    }

    setActiveTask(null);
  };

  return (
    <div className="flex-1 overflow-x-auto h-full pb-4">
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        measuring={{
          droppable: {
            strategy: 1 // Always
          }
        }}
      >
        <div className="flex h-full space-x-6">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={filteredTasks.filter((t) => t.status === column.id)}
            />
          ))}
        </div>

        <DragOverlay 
          adjustScale={true}
          modifiers={[snapCenterToCursor]}
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: '0.5',
                },
              },
            }),
          }}
        >
          {activeTask ? (
            <TaskCard task={activeTask} isOverlay={true} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;
