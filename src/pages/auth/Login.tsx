import React from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, ShieldCheck } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Successfully signed in!');
      
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      navigate(redirect || '/dashboard');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Branding Side - Hidden on small screens */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface-2 overflow-hidden items-center justify-center p-12">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-primary/20 rounded-full blur-[120px] animate-pulse-soft" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-accent/10 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDelay: '1s' }} />
        
        <div className="relative z-10 max-w-lg text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-24 h-24 bg-gradient-to-br from-primary to-primary-dark rounded-[2.5rem] shadow-premium mx-auto flex items-center justify-center"
          >
            <span className="text-white font-bold text-5xl tracking-tighter">F</span>
          </motion.div>
          
          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-display text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-text-secondary"
            >
              Master Your Flow.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-text-secondary text-xl leading-relaxed"
            >
              The most intuitive way to manage your tasks, sprints, and project lifecycles in one unified space.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center space-x-6 pt-8"
          >
            <div className="flex items-center text-sm font-medium text-text-muted">
              <ShieldCheck className="w-5 h-5 mr-2 text-success" />
              Enterprise Grade
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-border" />
            <div className="text-sm font-medium text-text-muted">Trusted by 10k+ users</div>
          </motion.div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute top-0 right-0 p-8 lg:hidden">
           <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
             <span className="text-white font-bold">F</span>
           </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-10"
        >
          <div className="space-y-3">
            <h2 className="text-display text-4xl">Sign In</h2>
            <p className="text-text-secondary text-lg">Enter your details to access your dashboard.</p>
          </div>
          
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2 group">
              <label className="text-label text-text-secondary group-focus-within:text-primary transition-colors">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
                <Input 
                  type="email" 
                  placeholder="name@company.com" 
                  className="pl-12 h-14 rounded-2xl bg-surface-2 border-transparent focus:bg-background transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-2 group">
              <div className="flex items-center justify-between">
                <label className="text-label text-text-secondary group-focus-within:text-primary transition-colors">Password</label>
                <Link to="#" className="text-xs font-semibold text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-12 h-14 rounded-2xl bg-surface-2 border-transparent focus:bg-background transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>
            
            <Button 
              className="w-full h-14 rounded-2xl text-lg font-bold shadow-premium group" 
              variant="primary" 
              type="submit" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span>Sign In</span>
                  <LogIn className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>

          <div className="text-center text-text-secondary font-medium">
            New to FlowSpace7?{' '}
            <Link 
              to={`/auth/register${window.location.search}`} 
              className="text-primary hover:underline font-bold"
            >
              Create an account
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
