import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { format } from "date-fns";

import { usePetStore } from "../stores/usePetStore";
import { useDailyLogStore } from "../stores/useDailyLogStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useFamilyStore } from "../stores/useFamilyStore";
import { useProviderStore } from "../stores/useProviderStore";
import { useUIStore, updateAppModeBasedOnProviders } from "../stores/useUIStore";

import { Button, WalkFAB } from "../components/common";
import { NewPetHeader, DashboardGrid, ProviderSection, WalkMapModal } from "../components/home";

// ============================================
// HomePage v4 - 히어로 배너 복원 + 주황 테두리
// ============================================
export default function HomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isNewUser = useAuthStore((s) => s.isNewUser);
  const appMode = useUIStore((s) => s.appMode);

  useEffect(() => {
    if (isNewUser && user) navigate("/onboarding", { replace: true });
  }, [isNewUser, user, navigate]);

  const pets = usePetStore((s) => s.pets);
  const fetchPets = usePetStore((s) => s.fetchPets);
  const fetchFamily = useFamilyStore((s) => s.fetchFamily);
  const myProviders = useProviderStore((s) => s.myProviders);
  const fetchMyProviders = useProviderStore((s) => s.fetchMyProviders);
  const fetchMyProvider = useProviderStore((s) => s.fetchMyProvider);
  const fetchAllLogs = useDailyLogStore((s) => s.fetchAllLogs);

  useEffect(() => {
    if (user?.familyId) {
      fetchPets(user.familyId);
      fetchFamily(user.familyId);
      fetchMyProviders(user.familyId);
    }
    fetchMyProvider();
  }, [user?.familyId, fetchPets, fetchFamily, fetchMyProviders, fetchMyProvider]);

  useEffect(() => {
    if (pets.length > 0) {
      fetchAllLogs(pets.map((p) => p.id), format(new Date(), "yyyy-MM-dd"));
    }
  }, [pets, fetchAllLogs]);

  useEffect(() => {
    updateAppModeBasedOnProviders(myProviders.length);
  }, [myProviders.length]);

  const [isWalkModalOpen, setIsWalkModalOpen] = useState(false);

  // Empty State
  if (pets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 bg-gray-50 dark:bg-slate-900">
        <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-5 ring-4 ring-orange-200 dark:ring-orange-800/50">
          <span className="text-4xl">🐕</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          반려견을 등록해주세요!
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          우리 아이와 함께하는<br />행복한 일상을 기록해보세요 💕
        </p>
        <Button variant="primary" onClick={() => navigate("/home/pets")} className="rounded-full px-8">
          <Plus size={18} className="mr-1" />
          우리 아이 등록하기
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-4">
      {/* 1. 펫 프로필 카드 */}
      <NewPetHeader />

      {/* 2. 히어로 배너 (메시지 카드) */}
      <div className="px-4 mb-3">
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-2xl p-4 border border-orange-200 dark:border-orange-800/50 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-200 dark:bg-orange-800/50 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-lg">🐾</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              오늘도 건강한 하루 보내고 있나요?
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              일상을 기록하고 가족과 함께 공유해보세요
            </p>
          </div>
          <span className="text-orange-400 text-sm">›</span>
        </div>
      </div>

      {/* 3. 에당이의 하루 */}
      <DashboardGrid />

      {/* 4. 업체 섹션 */}
      {appMode === "connected" && myProviders.length > 0 && (
        <ProviderSection providers={myProviders} />
      )}

      {/* 미연결 유도 */}
      {appMode === "pure_diary" && (
        <div className="px-4 mb-3">
          <button
            onClick={() => navigate("/home/provider-connect")}
            className="w-full bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-orange-200 dark:border-orange-800/50 flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/40 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🏫</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                유치원/호텔과 연결하기
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                초대 코드를 입력하면 케어노트를 받을 수 있어요
              </p>
            </div>
            <span className="text-orange-500 text-sm font-medium">→</span>
          </button>
        </div>
      )}

      <WalkMapModal isOpen={isWalkModalOpen} onClose={() => setIsWalkModalOpen(false)} />
      <WalkFAB onClick={() => setIsWalkModalOpen(true)} />
    </div>
  );
}
