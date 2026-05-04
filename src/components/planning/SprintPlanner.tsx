import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, Play, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useSprintStore } from '../../stores/sprintStore';
import { format } from 'date-fns';

const SprintPlanner: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { sprints, activeSprint, fetchSprints, createSprint, startSprint } = useSprintStore();

  useEffect(() => {
    fetchSprints(projectId);
  }, [projectId, fetchSprints]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-h2">Sprint Planning</h2>
          <p className="text-text-secondary text-sm">Manage your backlog and plan your next sprint</p>
        </div>
        <Button onClick={() => createSprint({ project_id: projectId, name: `Sprint ${sprints.length + 1}` })}>
          <Plus className="w-4 h-4 mr-2" />
          Create Sprint
        </Button>
      </div>

      {/* Active Sprint Section */}
      {activeSprint && (
        <div className="bg-primary/5 border border-primary/20 rounded-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Badge variant="success">Active</Badge>
              <h3 className="text-h3">{activeSprint.name}</h3>
              <span className="text-text-muted text-sm">
                {activeSprint.start_date && format(new Date(activeSprint.start_date), 'MMM d')} - 
                {activeSprint.end_date && format(new Date(activeSprint.end_date), 'MMM d')}
              </span>
            </div>
            <Button variant="outline" size="sm">Complete Sprint</Button>
          </div>
          
          <div className="text-sm text-text-secondary">
            {activeSprint.goal || "No goal set for this sprint."}
          </div>
        </div>
      )}

      {/* Sprint List */}
      <div className="space-y-4">
        {sprints.filter(s => s.status !== 'active').map((sprint) => (
          <motion.div 
            key={sprint.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-surface-2 rounded-card">
                <Calendar className="w-5 h-5 text-text-secondary" />
              </div>
              <div>
                <h4 className="font-semibold">{sprint.name}</h4>
                <p className="text-xs text-text-muted">
                  {sprint.status === 'planning' ? 'Planning' : 'Completed'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {sprint.status === 'planning' && (
                <Button variant="ghost" size="sm" onClick={() => startSprint(sprint.id)}>
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </Button>
              )}
              <Button variant="ghost" size="icon">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SprintPlanner;
