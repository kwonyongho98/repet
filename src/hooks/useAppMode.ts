import { useEffect } from 'react';
import { useUIStore, updateAppModeBasedOnProviders } from '../stores/useUIStore';
import { useProviderStore } from '../stores/useProviderStore';

// ============================================
// useAppMode - 앱 모드 관리 공통 훅
// ============================================

/**
 * 앱 모드(Pure Diary / Connected) 상태 및 자동 업데이트
 * 
 * @example
 * const { appMode, isPureDiary, isConnected } = useAppMode();
 */
export function useAppMode() {
  const appMode = useUIStore((state) => state.appMode);
  const myProviders = useProviderStore((state) => state.myProviders);
  
  // 연결된 업체 수에 따라 앱 모드 자동 업데이트
  useEffect(() => {
    updateAppModeBasedOnProviders(myProviders.length);
  }, [myProviders.length]);
  
  return {
    appMode,
    isPureDiary: appMode === 'pure_diary',
    isConnected: appMode === 'connected',
    connectedProvidersCount: myProviders.length,
  };
}

export default useAppMode;
