import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, Bell, Moon, Sun, LogOut, User as UserIcon, ChevronRight } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { useProjectStore } from '../../stores/projectStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const TopBar: React.FC = () => {
  const { darkMode, toggleDarkMode } = useUIStore();
  const { user, signOut } = useAuthStore();
  const { activeWorkspace } = useProjectStore();
  const { notifications, unreadCount, fetchNotifications, markAsRead, subscribeToNotifications } = useNotificationStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      const unsubscribe = subscribeToNotifications(user.id);
      return () => unsubscribe();
    }
  }, [user?.id, fetchNotifications, subscribeToNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const userInitial = user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U';

  return (
    <header className="h-24 border-b border-border/30 bg-transparent px-8 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center space-x-2 text-sm">
        <Link to="/dashboard" className="text-text-muted hover:text-text-primary transition-colors font-medium">
          {activeWorkspace?.name || 'FlowSpace'}
        </Link>
        <ChevronRight className="w-4 h-4 text-text-muted/50" />
        <span className="text-text-primary font-bold">{getPageTitle()}</span>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-sm px-8 relative hidden md:block">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
          <Input 
            className="pl-12 pr-12 bg-surface/40 backdrop-blur-md border border-border/50 shadow-soft focus-visible:ring-2 focus-visible:ring-primary/20 rounded-2xl h-11 transition-all duration-300 hover:bg-surface/60 w-full" 
            placeholder="Search anything..." 
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-border/50 bg-surface-2 text-[10px] text-text-muted font-bold tracking-tighter opacity-60">
            ⌘K
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center bg-surface-2/50 backdrop-blur-md rounded-2xl p-1 border border-border/30">
          <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 hover:bg-surface-3 transition-all" onClick={toggleDarkMode}>
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <div className="w-[1px] h-4 bg-border/50 mx-1"></div>
          
          <div className="relative" ref={notificationsRef}>
            <Button 
              variant="ghost" 
              size="icon" 
              className={`rounded-xl h-9 w-9 relative group transition-all ${notificationsOpen ? 'bg-surface-3' : 'hover:bg-surface-3'}`}
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <Bell className="w-4 h-4 text-text-secondary group-hover:text-text-primary" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full border border-surface shadow-[0_0_8px_rgb(var(--primary))] animate-pulse"></span>
            </Button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-surface/95 backdrop-blur-2xl rounded-2xl shadow-premium border border-border/50 overflow-hidden z-50 animate-slide-up origin-top-right">
                <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-wider text-text-primary">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{unreadCount} New</span>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <button 
                        key={notif.id} 
                        className="w-full px-5 py-4 flex items-start space-x-4 hover:bg-surface-2 transition-colors text-left border-b border-border/10 last:border-0"
                        onClick={() => markAsRead(notif.id)}
                      >
                        <div className="w-8 h-8 rounded-xl bg-surface-3 flex items-center justify-center text-sm shrink-0">
                          {notif.icon || '🔔'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-text-primary">{notif.title}</p>
                          <p className="text-[11px] text-text-muted mt-0.5 line-clamp-2">{notif.description}</p>
                          <p className="text-[10px] text-text-muted/60 mt-2 font-medium">
                            {notif.created_at && new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {!notif.is_read && <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>}
                      </button>
                    ))
                  ) : (
                    <div className="px-5 py-8 text-center">
                      <Bell className="w-8 h-8 text-text-muted/20 mx-auto mb-3" />
                      <p className="text-xs text-text-muted">No notifications yet</p>
                    </div>
                  )}
                </div>
                <button className="w-full py-3 text-[11px] font-bold text-primary hover:bg-primary/5 transition-colors border-t border-border/50 uppercase tracking-widest">
                  View All Notifications
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button 
            className="flex items-center space-x-3 p-1.5 pr-3 rounded-2xl hover:bg-surface-2 transition-all duration-300 border border-transparent hover:border-border/30 group"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center border border-primary/20 shadow-premium shrink-0 group-hover:scale-105 transition-transform">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <span className="text-white font-bold text-sm">{userInitial.toUpperCase()}</span>
              )}
            </div>
            <div className="text-left hidden lg:block overflow-hidden max-w-[120px]">
              <p className="text-xs font-bold text-text-primary truncate">{user?.user_metadata?.full_name || 'My Account'}</p>
              <p className="text-[10px] text-text-muted truncate">@{user?.email?.split('@')[0]}</p>
            </div>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-surface/95 backdrop-blur-2xl rounded-2xl shadow-premium border border-border/50 overflow-hidden py-2 animate-slide-up origin-top-right">
              <div className="px-5 py-4 border-b border-border/50">
                <p className="text-sm font-bold text-text-primary truncate">{user?.user_metadata?.full_name}</p>
                <p className="text-xs text-text-muted truncate mt-0.5">{user?.email}</p>
              </div>
              <div className="p-2 space-y-1">
                <button className="w-full px-4 py-2.5 text-sm text-left flex items-center text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded-xl transition-all">
                  <UserIcon className="w-4 h-4 mr-3" />
                  Profile Settings
                </button>
                <button 
                  onClick={async () => {
                    await signOut();
                    window.location.href = '/auth/login';
                  }}
                  className="w-full px-4 py-2.5 text-sm text-left flex items-center text-danger hover:bg-danger/10 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
