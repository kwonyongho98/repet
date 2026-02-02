import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { format } from "date-fns";

// Stores
import { usePetStore } from "../stores/usePetStore";
import { useDailyLogStore } from "../stores/useDailyLogStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useFamilyStore } from "../stores/useFamilyStore";
import { useProviderStore } from "../stores/useProviderStore";
import {
  useUIStore,
  updateAppModeBasedOnProviders,
} from "../stores/useUIStore";

// Components
import { Button, WalkFAB } from "../components/common";
import {
  NewPetHeader,
  DashboardGrid,
  ProviderSection,
  WalkMapModal,
} from "../components/home";

// ============================================
// Main Component
// ============================================
export default function HomePage() {
  const navigate = useNavigate();

  // Auth & Family
  const user = useAuthStore((state) => state.user);
  const isNewUser = useAuthStore((state) => state.isNewUser);

  // UI Store - App Mode
  const appMode = useUIStore((state) => state.appMode);

  // Redirect to onboarding if new user
  useEffect(() => {
    if (isNewUser && user) {
      navigate("/onboarding", { replace: true });
    }
  }, [isNewUser, user, navigate]);

  // Stores
  const pets = usePetStore((state) => state.pets);
  const petsLoading = usePetStore((state) => state.isLoading);
  const fetchPets = usePetStore((state) => state.fetchPets);
  const selectedPetId = usePetStore((state) => state.selectedPetId);
  const selectedPet = useMemo(
    () => pets.find((p) => p.id === selectedPetId),
    [pets, selectedPetId],
  );

  // Family Store
  const fetchFamily = useFamilyStore((state) => state.fetchFamily);

  // Provider Store (My Providers)
  const myProviders = useProviderStore((state) => state.myProviders);
  const fetchMyProviders = useProviderStore((state) => state.fetchMyProviders);
  const fetchMyProvider = useProviderStore((state) => state.fetchMyProvider);

  // Daily Log Store
  const logsLoading = useDailyLogStore((state) => state.isLoading);
  const fetchAllLogs = useDailyLogStore((state) => state.fetchAllLogs);

  // Fetch data on mount
  useEffect(() => {
    if (user?.familyId) {
      fetchPets(user.familyId);
      fetchFamily(user.familyId);
      fetchMyProviders(user.familyId);
    }
    fetchMyProvider();
  }, [
    user?.familyId,
    fetchPets,
    fetchFamily,
    fetchMyProviders,
    fetchMyProvider,
  ]);

  // pets가 로드된 후 로그 fetch
  useEffect(() => {
    if (pets.length > 0) {
      const petIds = pets.map((p) => p.id);
      fetchAllLogs(petIds, format(new Date(), "yyyy-MM-dd"));
    }
  }, [pets, fetchAllLogs]);

  // Update app mode based on providers
  useEffect(() => {
    updateAppModeBasedOnProviders(myProviders.length);
  }, [myProviders.length]);

  // State
  const [isWalkModalOpen, setIsWalkModalOpen] = useState(false);

  // ============================================
  // Empty State (No Pets)
  // ============================================
  if (pets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 dark:bg-slate-900">
        <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <span className="text-6xl">🐕</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          반려견을 등록해주세요!
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
          우리 아이와 함께하는
          <br />
          행복한 일상을 기록해보세요 💕
        </p>
        <Button
          variant="primary"
          onClick={() => navigate("/home/pets")}
          className="rounded-full px-8"
        >
          <Plus size={18} className="mr-1" />
          우리 아이 등록하기
        </Button>
      </div>
    );
  }

  // ============================================
  // Main Render
  // ============================================
  return (
    <div className="pb-4 min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Section 1: 펫 헤더 (사진 + 정보 + 스와이프) */}
      <NewPetHeader />

      {/* Section 2: 에당이의 하루 (4개 위젯 그리드) */}
      <DashboardGrid />

      {/* Section 3: 업체 섹션 (연결된 Provider 있을 때만) */}
      {appMode === "connected" && myProviders.length > 0 && (
        <ProviderSection providers={myProviders} />
      )}

      {/* Provider 미연결 시 연결 유도 */}
      {appMode === "pure_diary" && (
        <div className="px-4 mb-4">
          <button
            onClick={() => navigate("/home/provider-connect")}
            className="w-full bg-gradient-to-r from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 rounded-2xl p-4 border border-orange-200 dark:border-orange-800/50"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏫</span>
              <div className="text-left flex-1">
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  유치원/호텔과 연결하기
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  초대 코드를 입력하면 케어노트를 받을 수 있어요
                </p>
              </div>
              <span className="text-orange-500">→</span>
            </div>
          </button>
        </div>
      )}

      {/* Walk Modal */}
      <WalkMapModal
        isOpen={isWalkModalOpen}
        onClose={() => setIsWalkModalOpen(false)}
      />

      {/* Walk FAB (Floating Action Button) */}
      <WalkFAB onClick={() => setIsWalkModalOpen(true)} />

      {/* Scrollbar hide style */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
