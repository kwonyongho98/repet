// ============================================
// Stores Index - Zustand 스토어 통합 export
// ============================================

// Auth & User
export { useAuthStore } from './useAuthStore';

// UI & Theme
export { useUIStore, updateAppModeBasedOnProviders } from './useUIStore';
export type { ViewMode, AppMode, TabConfig, ToastType } from './useUIStore';
export { useThemeStore } from './useThemeStore';

// Pet & Family
export { usePetStore } from './usePetStore';
export { useFamilyStore } from './useFamilyStore';
export { useFamilyBoardStore } from './useFamilyBoardStore';

// Daily Logs
export { useDailyLogStore } from './useDailyLogStore';
export { useWalkStore } from './useWalkStore';

// Calendar
export { useCalendarStore } from './useCalendarStore';
export type { WalkEventData } from './useCalendarStore';

// Booking
export { useBookingStore } from './useBookingStore';

// Provider & Care
export { useProviderStore } from './useProviderStore';

// Service & Places
export { useServiceStore } from './useServiceStore';
export { usePlaceStore } from './usePlaceStore';

// Legacy (Partner - Provider로 대체 예정)
export { usePartnerStore } from './usePartnerStore';
