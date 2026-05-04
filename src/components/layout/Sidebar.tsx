import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  KanbanSquare, 
  Calendar, 
  BarChart2, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Focus,
  Building2
} from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useProjectStore } from '../../stores/projectStore';
import { clsx } from 'clsx';

const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { activeWorkspace, activeProject } = useProjectStore();

  const getPath = (basePath: string) => {
    if (activeProject && ['/board', '/timeline', '/analytics'].includes(basePath)) {
      return `${basePath}?project=${activeProject.id}`;
    }
    return basePath;
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Board', icon: KanbanSquare, path: getPath('/board') },
    { name: 'Timeline', icon: Calendar, path: getPath('/timeline') },
    { name: 'Analytics', icon: BarChart2, path: getPath('/analytics') },
    { name: 'Focus Mode', icon: Focus, path: '/focus' },
  ];

  return (
    <aside 
      className={clsx(
        "h-full glass-panel rounded-[2rem] transition-all duration-500 ease-in-out flex flex-col z-20 relative shadow-premium border-r border-border/50",
        sidebarCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand & Workspace Indicator */}
      <div className="pt-8 pb-6 px-6 flex flex-col space-y-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl shadow-premium flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xl tracking-tighter">F</span>
          </div>
          {!sidebarCollapsed && (
            <span className="ml-3 font-bold text-h2 text-text-primary tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-text-secondary">FlowSpace7</span>
          )}
        </div>

        {activeWorkspace && !sidebarCollapsed && (
          <Link 
            to="/workspaces" 
            className="flex items-center px-3 py-2 bg-surface-2 rounded-xl border border-border/50 group cursor-pointer hover:border-primary/30 transition-all hover:bg-surface-3"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-xs font-bold text-text-primary truncate">{activeWorkspace.name}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold">Workspace</p>
            </div>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => clsx(
              "flex items-center px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
              isActive 
                ? "text-primary bg-primary/10 font-bold shadow-inner-light" 
                : "text-text-secondary hover:bg-surface-2 hover:text-text-primary hover:translate-x-1"
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_12px_rgb(var(--primary))]" />
                )}
                <item.icon className={clsx("w-5 h-5 shrink-0 transition-all duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
                {!sidebarCollapsed && (
                  <span className="ml-3 tracking-wide">{item.name}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border/50 space-y-2">
        <NavLink
          to="/settings"
          className={({ isActive }) => clsx(
            "flex items-center px-4 py-3 rounded-xl transition-all duration-300 group",
            isActive 
              ? "bg-primary/10 text-primary font-bold shadow-inner-light" 
              : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
          )}
        >
          {({ isActive }) => (
            <>
              <Settings className={clsx("w-5 h-5 shrink-0 transition-transform group-hover:rotate-45", isActive && "rotate-45")} />
              {!sidebarCollapsed && (
                <span className="ml-3">Settings</span>
              )}
            </>
          )}
        </NavLink>

        <button
          onClick={toggleSidebar}
          className="w-full flex items-center px-4 py-3 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-2 transition-all duration-300"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="ml-3 font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
