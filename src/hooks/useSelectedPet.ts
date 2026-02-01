import { useMemo } from 'react';
import { usePetStore } from '../stores/usePetStore';

// ============================================
// useSelectedPet - 선택된 펫 접근 공통 훅
// ============================================

/**
 * 현재 선택된 펫 정보에 쉽게 접근하는 훅
 * 
 * @example
 * const { selectedPet, selectedPetId, hasPets } = useSelectedPet();
 */
export function useSelectedPet() {
  const pets = usePetStore((state) => state.pets);
  const selectedPetId = usePetStore((state) => state.selectedPetId);
  const setSelectedPetId = usePetStore((state) => state.setSelectedPetId);
  const isLoading = usePetStore((state) => state.isLoading);
  
  const selectedPet = useMemo(
    () => pets.find((p) => p.id === selectedPetId),
    [pets, selectedPetId]
  );
  
  return {
    // 펫 목록
    pets,
    petsCount: pets.length,
    hasPets: pets.length > 0,
    
    // 선택된 펫
    selectedPet,
    selectedPetId,
    setSelectedPetId,
    hasSelectedPet: !!selectedPet,
    
    // 로딩 상태
    isLoading,
  };
}

export default useSelectedPet;
