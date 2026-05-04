import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  icon: string | null;
  type: string | null;
  link: string | null;
  is_read: boolean | null;
  created_at: string | null;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  createNotification: (notif: Partial<Notification>) => Promise<void>;
  subscribeToNotifications: (userId: string) => () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      const unreadCount = data.filter(n => !n.is_read).length;
      set({ notifications: data || [], unreadCount, loading: false });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({ loading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      
      const notifications = get().notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      );
      const unreadCount = notifications.filter(n => !n.is_read).length;
      set({ notifications, unreadCount });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      
      const notifications = get().notifications.map(n => ({ ...n, is_read: true }));
      set({ notifications, unreadCount: 0 });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  },

  createNotification: async (notif: Partial<Notification>) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([notif as NotificationInsert]);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  },

  subscribeToNotifications: (userId: string) => {
    const subscription = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          set(state => ({
            notifications: [newNotif, ...state.notifications].slice(0, 20),
            unreadCount: state.unreadCount + 1
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  },
}));
