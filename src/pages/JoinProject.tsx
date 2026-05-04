import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore, type Project } from '../stores/projectStore';
import { toast } from 'react-hot-toast';
import { Loader2, CheckCircle2, AlertCircle, Users, Layout } from 'lucide-react';
import { Button } from '../components/ui/Button';

const JoinProject: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { joinProject, getProjectByInviteCode } = useProjectStore();
  const [project, setProject] = useState<(Project & { workspaces: { name: string } }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!code) return;
      setLoading(true);
      try {
        const data = await getProjectByInviteCode(code);
        setProject(data as Project & { workspaces: { name: string } });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid invite link');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [code, getProjectByInviteCode]);

  const handleJoin = async () => {
    if (!code) return;
    setJoining(true);
    try {
      const projectId = await joinProject(code);
      setSuccess(true);
      toast.success('Successfully joined the project!');
      setTimeout(() => {
        navigate(`/board?project=${projectId}`);
      }, 1500);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to join');
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full glass-panel p-10 rounded-[3rem] border border-white/20 dark:border-zinc-800 shadow-premium relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        
        {loading && (
          <div className="py-12 space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Fetching Project Details...</h2>
          </div>
        )}

        {error && (
          <div className="py-8 space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold text-text-primary">Link Invalid</h2>
            <p className="text-text-secondary">{error}</p>
            <Button 
              variant="primary" 
              className="w-full rounded-2xl h-14 text-lg font-bold shadow-premium"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </div>
        )}

        {project && !success && !loading && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
              <div 
                className="w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto shadow-premium transform hover:rotate-3 transition-transform duration-500"
                style={{ backgroundColor: `${project.color || '#6366F1'}20`, color: project.color || '#6366F1' }}
              >
                <Layout className="w-12 h-12" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-text-primary tracking-tight">{project.name}</h1>
                <p className="text-text-secondary font-medium">Workspace: {project.workspaces?.name}</p>
              </div>
            </div>

            <div className="bg-surface-2/50 p-6 rounded-[2rem] border border-border/30 space-y-4">
              <p className="text-sm text-text-secondary leading-relaxed">
                {project.description || 'You have been invited to collaborate on this project in FlowSpace.'}
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs font-bold text-text-muted uppercase tracking-widest">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-primary" />
                  Collaborative Project
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <Button 
                variant="primary" 
                className="w-full rounded-2xl h-14 text-lg font-bold shadow-premium hover:scale-[1.02] active:scale-[0.98] transition-all"
                onClick={handleJoin}
                isLoading={joining}
              >
                Join Project Team
              </Button>
              <Button 
                variant="ghost" 
                className="w-full rounded-2xl h-12 text-text-secondary font-semibold"
                onClick={() => navigate('/dashboard')}
                disabled={joining}
              >
                Maybe Later
              </Button>
            </div>
          </div>
        )}

        {success && (
          <div className="py-12 space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="w-24 h-24 bg-green-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-3xl font-black text-text-primary">Welcome Aboard!</h2>
            <p className="text-text-secondary font-medium">You're now a member of <b>{project?.name}</b>.<br/>Redirecting you to the board...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinProject;
