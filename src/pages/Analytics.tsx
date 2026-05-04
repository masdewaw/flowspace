import React, { useEffect } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useTaskStore } from '../stores/taskStore';
import VelocityChart from '../components/analytics/VelocityChart';
import { useSprintStore } from '../stores/sprintStore';
import { Layout, BarChart2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Analytics: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const { activeProject, projects, setActiveProject } = useProjectStore();
  const { tasks, fetchTasks, loading } = useTaskStore();
  const { sprints, fetchSprints, loading: sprintsLoading } = useSprintStore();
  const navigate = useNavigate();

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
      fetchSprints(activeProject.id);
    }
  }, [activeProject, fetchTasks, fetchSprints]);

  if (!activeProject) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-6 text-center">
        <div className="w-20 h-20 bg-surface-2 rounded-3xl flex items-center justify-center text-text-muted">
          <BarChart2 className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">No Project Selected</h2>
          <p className="text-text-secondary mt-2">Select a project to view its analytics.</p>
        </div>
        <Button onClick={() => navigate('/board')}>Go to Board</Button>
      </div>
    );
  }

  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const totalTasks = tasks.length;

  // Calculate real velocity data
  const velocityData = sprints.slice().reverse().map(sprint => {
    const sprintTasks = tasks.filter(t => t.sprint_id === sprint.id);
    const completed = sprintTasks
      .filter(t => t.status === 'done')
      .reduce((sum, t) => sum + (t.story_points || 1), 0);
    const planned = sprintTasks
      .reduce((sum, t) => sum + (t.story_points || 1), 0);
      
    return {
      sprint: sprint.name,
      planned,
      completed
    };
  });

  // Add "Backlog/Current" if there are tasks without a sprint
  const backlogTasks = tasks.filter(t => !t.sprint_id);
  if (backlogTasks.length > 0) {
    velocityData.push({
      sprint: 'Backlog',
      planned: backlogTasks.reduce((sum, t) => sum + (t.story_points || 1), 0),
      completed: backlogTasks.filter(t => t.status === 'done').reduce((sum, t) => sum + (t.story_points || 1), 0)
    });
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-text-muted mb-1">
            <Layout className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">{activeProject.name}</span>
          </div>
          <h1 className="text-display">Analytics & Insights</h1>
        </div>
      </div>

      {(loading || sprintsLoading) ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center text-success">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Completed</p>
                <p className="text-2xl font-black">{completedTasks}</p>
              </div>
            </div>
            <div className="card p-6 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider">In Progress</p>
                <p className="text-2xl font-black">{inProgressTasks}</p>
              </div>
            </div>
            <div className="card p-6 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center text-warning">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider">To Do</p>
                <p className="text-2xl font-black">{todoTasks}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card p-8">
              <h3 className="text-xl font-bold mb-6">Sprint Velocity</h3>
              <VelocityChart data={velocityData} />
            </div>
            
            <div className="card p-8 flex flex-col justify-center items-center text-center space-y-4">
              <div className="relative w-48 h-48">
                 <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-surface-3 stroke-current"
                    strokeWidth="10"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                  ></circle>
                  <circle
                    className="text-primary stroke-current"
                    strokeWidth="10"
                    strokeDasharray={`${(completedTasks / (totalTasks || 1)) * 251.2} 251.2`}
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    transform="rotate(-90 50 50)"
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black">{Math.round((completedTasks / (totalTasks || 1)) * 100)}%</span>
                  <span className="text-[10px] font-bold text-text-muted uppercase">Done</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold">Overall Progress</h3>
                <p className="text-text-secondary text-sm mt-1">
                  You've completed {completedTasks} out of {totalTasks} total tasks.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
