import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// UI Store - View Mode, App Mode & Settings
// ============================================

export type ViewMode = 'family' | 'provider';
export type AppMode = 'pure_diary' | 'connected';

// Tab Configuration
export interface TabConfig {
  path: string;
  label: string;
  emoji: string;
}

interface UIState {
  // View Mode (Family <-> Provider)
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  
  // App Mode (Pure Diary <-> Connected)
  // This is computed based on connected providers count
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  
  // Dynamic Bottom Tabs based on App Mode
  getBottomTabs: () => TabConfig[];
  
  // Sidebar State
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  
  // Bottom Sheet
  activeBottomSheet: string | null;
  openBottomSheet: (id: string) => void;
  closeBottomSheet: () => void;
  
  // Toast Notifications
  toast: ToastState | null;
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: () => void;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastState {
  message: string;
  type: ToastType;
  duration: number;
}

// ============================================
// Tab Configurations - 3개 탭으로 통합
// ============================================

const PURE_DIARY_TABS: TabConfig[] = [
  { path: '/home', label: '홈', emoji: '🏠' },
  { path: '/home/service', label: '업체 찾기', emoji: '🔍' },
  { path: '/home/profile', label: 'my', emoji: '👤' },
];

const CONNECTED_TABS: TabConfig[] = [
  { path: '/home', label: '홈', emoji: '🏠' },
  { path: '/home/service', label: '업체 찾기', emoji: '🔍' },
  { path: '/home/profile', label: 'my', emoji: '👤' },
];

// ============================================
// Store Implementation
// ============================================

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // ============================================
      // View Mode
      // ============================================
      viewMode: 'family',
      
      setViewMode: (mode) => set({ viewMode: mode }),
      
      toggleViewMode: () => {
        const currentMode = get().viewMode;
        set({ viewMode: currentMode === 'family' ? 'provider' : 'family' });
      },
      
      // ============================================
      // App Mode
      // ============================================
      appMode: 'pure_diary',
      
      setAppMode: (mode) => set({ appMode: mode }),
      
      // ============================================
      // Dynamic Bottom Tabs
      // ============================================
      getBottomTabs: () => {
        const { appMode } = get();
        return appMode === 'connected' ? CONNECTED_TABS : PURE_DIARY_TABS;
      },
      
      // ============================================
      // Sidebar
      // ============================================
      isSidebarOpen: false,
      
      openSidebar: () => set({ isSidebarOpen: true }),
      closeSidebar: () => set({ isSidebarOpen: false }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      
      // ============================================
      // Bottom Sheet
      // ============================================
      activeBottomSheet: null,
      
      openBottomSheet: (id) => set({ activeBottomSheet: id }),
      closeBottomSheet: () => set({ activeBottomSheet: null }),
      
      // ============================================
      // Toast Notifications
      // ============================================
      toast: null,
      
      showToast: (message, type = 'info', duration = 3000) => {
        set({ toast: { message, type, duration } });
        setTimeout(() => {
          set({ toast: null });
        }, duration);
      },
      
      hideToast: () => set({ toast: null }),
    }),
    {
      name: 'repet-ui-storage',
      partialize: (state) => ({
        viewMode: state.viewMode,
        appMode: state.appMode,
      }),
    }
  )
);

// ============================================
// Helper Hook: Update App Mode based on Providers
// ============================================
export const updateAppModeBasedOnProviders = (providersCount: number) => {
  const { setAppMode } = useUIStore.getState();
  setAppMode(providersCount > 0 ? 'connected' : 'pure_diary');
};
