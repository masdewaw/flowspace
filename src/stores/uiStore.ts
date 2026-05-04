import { create } from 'zustand';
import type { Task } from './taskStore';

interface UIState {
  sidebarCollapsed: boolean;
  darkMode: boolean;
  isTaskModalOpen: boolean;
  taskModalStatus?: string;
  editingTask: Task | null;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openTaskModal: (status?: string, task?: Task) => void;
  closeTaskModal: () => void;
}

const getInitialDarkMode = () => {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  return isDark;
};

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  darkMode: getInitialDarkMode(),
  isTaskModalOpen: false,
  taskModalStatus: undefined,
  editingTask: null,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleDarkMode: () => set((state) => {
    const newDarkMode = !state.darkMode;
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { darkMode: newDarkMode };
  }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  openTaskModal: (status, task) => set({ isTaskModalOpen: true, taskModalStatus: status, editingTask: task || null }),
  closeTaskModal: () => set({ isTaskModalOpen: false, taskModalStatus: undefined, editingTask: null }),
}));
