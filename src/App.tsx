import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';

import Workspaces from './pages/Workspaces';
import { useProjectStore } from './stores/projectStore';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProjectDashboard from './pages/ProjectDashboard';
import Board from './pages/Board';
import PageWrapper from './components/layout/PageWrapper';
import FocusMode from './pages/FocusMode';
import JoinProject from './pages/JoinProject';
import Timeline from './pages/Timeline';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

import { useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requireWorkspace = true }: { children: React.ReactNode, requireWorkspace?: boolean }) => {
  const { session, loading } = useAuthStore();
  const { activeWorkspace } = useProjectStore();
  const location = useLocation();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0F]">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
  
  if (!session) {
    return <Navigate to={`/auth/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  
  if (requireWorkspace && !activeWorkspace) {
    return <Navigate to="/workspaces" replace />;
  }
  
  return <PageWrapper>{children}</PageWrapper>;
};

function App() {
  const { setSession } = useAuthStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    // Initial session check
    import('./lib/supabase').then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session?.user) {
          useProjectStore.getState().fetchUser();
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session?.user) {
          useProjectStore.getState().fetchUser();
        }
      });

      return () => subscription.unsubscribe();
    });
  }, [setSession]);

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/join/:code" element={<ProtectedRoute requireWorkspace={false}><JoinProject /></ProtectedRoute>} />
        
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute requireWorkspace={false}><Navigate to="/workspaces" replace /></ProtectedRoute>} />
        <Route path="/workspaces" element={<ProtectedRoute requireWorkspace={false}><Workspaces /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><ProjectDashboard /></ProtectedRoute>} />
        <Route path="/board" element={<ProtectedRoute><Board /></ProtectedRoute>} />
        <Route path="/timeline" element={<ProtectedRoute><Timeline /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/focus" element={<ProtectedRoute><FocusMode task={{ id: '1', title: 'Deep Work Session' }} onExit={() => navigate('/dashboard')} /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/workspaces" replace />} />
      </Routes>
    </>
  );
}

export default App;
