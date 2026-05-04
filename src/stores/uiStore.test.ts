import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../stores/uiStore';

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.setState({ sidebarCollapsed: false, darkMode: false });
  });

  it('should toggle sidebar', () => {
    const { toggleSidebar } = useUIStore.getState();
    toggleSidebar();
    expect(useUIStore.getState().sidebarCollapsed).toBe(true);
    toggleSidebar();
    expect(useUIStore.getState().sidebarCollapsed).toBe(false);
  });

  it('should toggle dark mode and update document class', () => {
    const { toggleDarkMode } = useUIStore.getState();
    toggleDarkMode();
    expect(useUIStore.getState().darkMode).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    
    toggleDarkMode();
    expect(useUIStore.getState().darkMode).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
