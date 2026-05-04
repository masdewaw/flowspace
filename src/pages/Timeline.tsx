import React, { useEffect } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useTaskStore } from '../stores/taskStore';
import GanttTimeline from '../components/timeline/GanttTimeline';
import { Layout, Calendar, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TaskModal from '../components/board/TaskModal';
import { type Task } from '../stores/taskStore';

const Timeline: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const { activeProject, projects, setActiveProject } = useProjectStore();
  const { tasks, fetchTasks, loading } = useTaskStore();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);

  useEffect(() => {
    if (projectId && (!activeProject || activeProject.id !== projectId)) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setActiveProject(project);
      }
    }
  }, [projectId, projects, activeProject, setActiveProject]);

  useEffect(() => {
    if (activeProject) {
      fetchTasks(activeProject.id);
    }
  }, [activeProject, fetchTasks]);

  if (!activeProject) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-6 text-center">
        <div className="w-20 h-20 bg-surface-2 rounded-3xl flex items-center justify-center text-text-muted">
          <Calendar className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">No Project Selected</h2>
          <p className="text-text-secondary mt-2">Select a project to view its timeline.</p>
        </div>
        <Button onClick={() => navigate('/board')}>Go to Board</Button>
      </div>
    );
  }

  // Transform tasks for GanttTimeline
  const timelineTasks = tasks.map(task => ({
    id: task.id,
    title: task.title,
    start_date: task.start_date ? new Date(task.start_date) : (task.due_date ? new Date(new Date(task.due_date).getTime() - 2 * 24 * 60 * 60 * 1000) : new Date()),
    end_date: task.due_date ? new Date(task.due_date) : new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    color: task.priority === 'high' ? '#EF4444' : task.priority === 'medium' ? '#F59E0B' : '#10B981'
  }));

  const handleTaskClick = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setIsModalOpen(true);
    }
  };

  const handleAddTask = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-text-muted mb-1">
            <Layout className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">{activeProject.name}</span>
          </div>
          <h1 className="text-display">Project Timeline</h1>
        </div>
        <Button onClick={handleAddTask}>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <GanttTimeline tasks={timelineTasks} onTaskClick={handleTaskClick} />
      )}

      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={activeProject.id}
        task={selectedTask}
      />
    </div>
  );
};

export default Timeline;
