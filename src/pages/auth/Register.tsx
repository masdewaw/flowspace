import React from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, CheckCircle2 } from 'lucide-react';

const Register: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });
      if (error) throw error;
      
      toast.success('Registration successful! You can now log in.');
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      navigate(redirect ? `/auth/login?redirect=${encodeURIComponent(redirect)}` : '/auth/login');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative order-2 lg:order-1">
        <div className="absolute top-0 left-0 p-8 lg:hidden">
           <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
             <span className="text-white font-bold">F</span>
           </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-10"
        >
          <div className="space-y-3">
            <h2 className="text-display text-4xl">Create Account</h2>
            <p className="text-text-secondary text-lg">Join FlowSpace7 and start organizing today.</p>
          </div>
          
          <form className="space-y-5" onSubmit={handleRegister}>
            <div className="space-y-2 group">
              <label className="text-label text-text-secondary group-focus-within:text-primary transition-colors">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
                <Input 
                  type="text" 
                  placeholder="John Doe" 
                  className="pl-12 h-14 rounded-2xl bg-surface-2 border-transparent focus:bg-background transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>
            </div>

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
              <label className="text-label text-text-secondary group-focus-within:text-primary transition-colors">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-12 h-14 rounded-2xl bg-surface-2 border-transparent focus:bg-background transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  minLength={6}
                />
              </div>
              <p className="text-[10px] text-text-muted px-1">Minimum 6 characters with letters and numbers.</p>
            </div>
            
            <Button 
              className="w-full h-14 rounded-2xl text-lg font-bold shadow-premium group mt-4" 
              variant="primary" 
              type="submit" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span>Get Started</span>
                  <UserPlus className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>

          <div className="text-center text-text-secondary font-medium">
            Already have an account?{' '}
            <Link 
              to={`/auth/login${window.location.search}`} 
              className="text-primary hover:underline font-bold"
            >
              Sign in here
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Branding Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface-2 overflow-hidden items-center justify-center p-12 order-1 lg:order-2">
        <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-primary/20 rounded-full blur-[120px] animate-pulse-soft" />
        <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] bg-accent/10 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDelay: '1s' }} />
        
        <div className="relative z-10 max-w-lg space-y-10">
          <div className="space-y-6">
            <h2 className="text-display text-5xl font-black leading-tight text-text-primary">
              Built for <span className="text-primary">High-Performance</span> Teams.
            </h2>
            <p className="text-text-secondary text-xl leading-relaxed">
              Experience the next generation of project management. Fast, beautiful, and deeply integrated.
            </p>
          </div>

          <div className="space-y-4">
            {[
              "Unlimited Projects & Workspaces",
              "Advanced Kanban & Timeline Views",
              "Real-time Collaboration",
              "Deep Work Focus Mode"
            ].map((feature, i) => (
              <motion.div 
                key={feature}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                className="flex items-center space-x-3 text-text-primary font-semibold"
              >
                <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                </div>
                <span>{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
