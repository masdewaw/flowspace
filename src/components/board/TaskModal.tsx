import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Type, AlignLeft, Flag, Calendar as CalendarIcon, Tag, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useTaskStore, type Task } from '../../stores/taskStore';
import { useProjectStore } from '../../stores/projectStore';
import { Layout, User as UserIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  initialStatus?: string;
  task?: Task | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, projectId: propProjectId, initialStatus = 'todo', task }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState(initialStatus);
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showAssigneeSelector, setShowAssigneeSelector] = useState(false);
  
  const { projects } = useProjectStore();
  const { createTask, updateTask, fetchProjectMembers, projectMembers } = useTaskStore();
  
  const [selectedProjectId, setSelectedProjectId] = useState(propProjectId || projects[0]?.id || '');

  // Sync state when task changes (Edit Mode)
  React.useEffect(() => {
    // Wrap in a microtask to avoid synchronous setState warning
    Promise.resolve().then(() => {
      if (task) {
        setTitle(task.title || '');
        setDescription(task.description || '');
        setPriority(task.priority || 'medium');
        setStatus(task.status || 'todo');
        setAssigneeIds(task.assignee_ids || []);
        setDueDate(task.due_date || '');
        setStartDate(task.start_date || '');
        setSelectedProjectId(task.project_id || '');
      } else {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setStatus(initialStatus);
        setAssigneeIds([]);
        setDueDate('');
        setStartDate('');
        if (propProjectId) setSelectedProjectId(propProjectId);
      }
    });
  }, [task, isOpen, propProjectId, initialStatus]);

  // Fetch members when project changes
  React.useEffect(() => {
    if (selectedProjectId && isOpen) {
      fetchProjectMembers(selectedProjectId);
    }
  }, [selectedProjectId, isOpen, fetchProjectMembers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedProjectId) return;

    setLoading(true);
    try {
      const taskData = {
        project_id: selectedProjectId,
        title,
        description,
        priority,
        status,
        assignee_ids: assigneeIds,
        due_date: dueDate || null,
        start_date: startDate || null,
        order_index: task ? task.order_index : 0,
      };

      if (task) {
        await updateTask(task.id, taskData);
        toast.success('Task updated successfully');
      } else {
        await createTask(taskData);
        toast.success('Task created successfully');
      }
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const priorities = [
    { id: 'low', label: 'Low', color: 'bg-blue-500/20 text-blue-500' },
    { id: 'medium', label: 'Medium', color: 'bg-yellow-500/20 text-yellow-500' },
    { id: 'high', label: 'High', color: 'bg-red-500/20 text-red-500' },
  ];

  const statuses = [
    { id: 'todo', label: 'To Do' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'review', label: 'Review' },
    { id: 'done', label: 'Done' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl glass-panel rounded-[2.5rem] overflow-hidden border border-white/40 dark:border-zinc-700/50"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold flex items-center text-text-primary">
                    <CheckCircle2 className="w-6 h-6 mr-3 text-primary" />
                    {task ? 'Edit Task' : 'New Task'}
                  </h2>
                  <p className="text-text-secondary text-sm mt-1">
                    {task ? 'Update task details and progress' : 'Break down your project goals into actionable items'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center hover:bg-surface-2 rounded-full transition-all text-text-muted hover:text-text-primary hover:rotate-90 duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest ml-1 flex items-center text-text-muted">
                    <Type className="w-3.5 h-3.5 mr-2" />
                    Task Title
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Design System Updates"
                    className="h-14 rounded-2xl bg-surface border-border/50 focus:border-primary/50 focus:ring-primary/20 text-base font-medium transition-all"
                    autoFocus
                  />
                </div>

                {!propProjectId && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest ml-1 flex items-center text-text-muted">
                      <Layout className="w-3.5 h-3.5 mr-2" />
                      Select Project
                    </label>
                    <div className="relative">
                      <select
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        className="w-full h-14 rounded-2xl bg-surface border border-border/50 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer text-sm font-medium"
                      >
                        <option value="" disabled>Select a project...</option>
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                        <AlignLeft className="w-4 h-4 rotate-90" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest ml-1 flex items-center text-text-muted">
                    <AlignLeft className="w-3.5 h-3.5 mr-2" />
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add details about this task..."
                    className="w-full min-h-[120px] rounded-2xl bg-surface border border-border/50 p-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none placeholder:text-text-muted text-sm leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest ml-1 flex items-center text-text-muted">
                      <Flag className="w-3.5 h-3.5 mr-2" />
                      Priority
                    </label>
                    <div className="flex p-1 bg-surface border border-border/50 rounded-2xl">
                      {priorities.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPriority(p.id)}
                          className={`flex-1 py-2 px-1 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all ${
                            priority === p.id 
                              ? `${p.color} shadow-sm` 
                              : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest ml-1 flex items-center text-text-muted">
                      <Tag className="w-3.5 h-3.5 mr-2" />
                      Status
                    </label>
                    <div className="relative">
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full h-12 rounded-2xl bg-surface border border-border/50 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer text-sm font-medium"
                      >
                        {statuses.map((s) => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                        <AlignLeft className="w-4 h-4 rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border/30 space-y-6">
                  {/* Metadata Row */}
                  <div className="flex flex-wrap gap-3">
                    <div className="relative">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        type="button" 
                        onClick={() => setShowAssigneeSelector(!showAssigneeSelector)}
                        className={`rounded-xl flex items-center space-x-2 px-3 h-10 ${assigneeIds.length > 0 ? 'bg-primary/10 text-primary' : 'hover:bg-surface-2'}`}
                      >
                        <UserIcon className="w-4 h-4" />
                        <span className="text-xs font-bold">
                          {assigneeIds.length > 0 ? `${assigneeIds.length} Assigned` : 'Assign'}
                        </span>
                      </Button>
                      
                      {showAssigneeSelector && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute bottom-full left-0 mb-2 w-64 bg-surface border border-border shadow-premium rounded-2xl p-2 z-10"
                        >
                          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted px-3 py-2">Select Assignees</p>
                          <div className="max-h-48 overflow-y-auto space-y-1">
                            {projectMembers.map((member) => (
                              <button
                                key={member.id}
                                type="button"
                                onClick={() => {
                                  if (assigneeIds.includes(member.id)) {
                                    setAssigneeIds(assigneeIds.filter(id => id !== member.id));
                                  } else {
                                    setAssigneeIds([...assigneeIds, member.id]);
                                  }
                                }}
                                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-all ${
                                  assigneeIds.includes(member.id) ? 'bg-primary/10 text-primary' : 'hover:bg-surface-2 text-text-primary'
                                }`}
                              >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-bold text-white">
                                  {member.name?.[0] || 'U'}
                                </div>
                                <div className="text-left">
                                  <p className="text-xs font-bold">{member.name}</p>
                                  <p className="text-[10px] text-text-muted capitalize">{member.project_role}</p>
                                </div>
                                {assigneeIds.includes(member.id) && (
                                  <div className="ml-auto">
                                    <CheckCircle2 className="w-4 h-4" />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <div 
                      className="relative group"
                      onClick={(e) => {
                        const input = e.currentTarget.querySelector('input');
                        if (input && 'showPicker' in input) {
                          input.showPicker();
                        }
                      }}
                    >
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        type="button" 
                        className={`rounded-xl flex items-center space-x-2 px-3 h-10 w-full ${startDate ? 'bg-primary/10 text-primary' : 'hover:bg-surface-2'}`}
                      >
                        <CalendarIcon className="w-4 h-4" />
                        <span className="text-xs font-bold">
                          {startDate ? `Start: ${new Date(startDate).toLocaleDateString()}` : 'Start Date'}
                        </span>
                      </Button>
                    </div>

                    <div 
                      className="relative group"
                      onClick={(e) => {
                        const input = e.currentTarget.querySelector('input');
                        if (input && 'showPicker' in input) {
                          input.showPicker();
                        }
                      }}
                    >
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        type="button" 
                        className={`rounded-xl flex items-center space-x-2 px-3 h-10 w-full ${dueDate ? 'bg-accent/10 text-accent' : 'hover:bg-surface-2'}`}
                      >
                        <CalendarIcon className="w-4 h-4" />
                        <span className="text-xs font-bold">
                          {dueDate ? `Due: ${new Date(dueDate).toLocaleDateString()}` : 'Due Date'}
                        </span>
                      </Button>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-end space-x-3">
                    <Button variant="ghost" onClick={onClose} type="button" className="rounded-xl px-6 font-bold text-sm">
                      Cancel
                    </Button>
                    <Button 
                      variant="primary" 
                      type="submit" 
                      isLoading={loading}
                      disabled={!title.trim()}
                      className="rounded-xl px-8 shadow-premium font-bold text-sm h-11"
                    >
                      {task ? 'Update Task' : 'Create Task'}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TaskModal;
