import { useMemo } from 'react';
import { useAuthStore } from '../stores/useAuthStore';

// ============================================
// useUserData - 사용자 정보 접근 공통 훅
// ============================================

/**
 * 현재 로그인된 사용자 정보에 쉽게 접근하는 훅
 * 
 * @example
 * const { user, familyId, isAuthenticated } = useUserData();
 */
export function useUserData() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isNewUser = useAuthStore((state) => state.isNewUser);
  const isLoading = useAuthStore((state) => state.isLoading);
  
  const familyId = useMemo(() => user?.familyId, [user?.familyId]);
  const userId = useMemo(() => user?.id, [user?.id]);
  const providerId = useMemo(() => user?.providerId, [user?.providerId]);
  
  return {
    user,
    userId,
    familyId,
    providerId,
    isAuthenticated,
    isNewUser,
    isLoading,
    
    // 편의 속성
    hasFamily: !!familyId,
    isProviderOwner: !!providerId,
  };
}

export default useUserData;
