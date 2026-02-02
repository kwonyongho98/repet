import { useState, useMemo, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Plus,
  Loader2,
  ChevronRight,
  Store,
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

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
import {
  Button,
  BottomSheet,
  Input,
  TextArea,
  WalkFAB,
} from "../components/common";
import {
  PetSelector,
  WalkHeroWidget,
  WalkMapModal,
  InfoWidgetRow,
  QuickActionGridSimple,
  DailyLogFeed,
  ProviderConnectBanner,
  CareNoteSummary,
} from "../components/home";
import type { QuickActionType } from "../components/home";

// Types
import type {
  ExpenseCategory,
} from "../types/dailyLog";
import {
  cuteExpenseCategoryLabels,
} from "../types/dailyLog";
import { serviceTypeConfig } from "../types/provider";

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

  // Daily Log Store - fetchAllLogs 사용 (fetchLogs가 아님!)
  const logsLoading = useDailyLogStore((state) => state.isLoading);
  const fetchAllLogs = useDailyLogStore((state) => state.fetchAllLogs);

  // Fetch data on mount
  useEffect(() => {
    if (user?.familyId) {
      fetchPets(user.familyId);
      fetchFamily(user.familyId);
      fetchMyProviders(user.familyId);
    }
    // Fetch user's provider info (if they own one)
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

  // Daily Log Actions (weight & expense only)
  const addWeightLog = useDailyLogStore((state) => state.addWeightLog);
  const addExpenseLog = useDailyLogStore((state) => state.addExpenseLog);

  // State
  const [activeSheet, setActiveSheet] = useState<QuickActionType | null>(null);
  const [isWalkModalOpen, setIsWalkModalOpen] = useState(false);

  // Today's date
  const today = format(new Date(), "yyyy-MM-dd");

  // ============================================
  // Form States (weight & expense only — meal/bowel moved to FamilyBoardPage)
  // ============================================

  const [weightForm, setWeightForm] = useState({ weight: "", notes: "" });

  const [expenseForm, setExpenseForm] = useState({
    amount: "",
    category: "food" as ExpenseCategory,
    description: "",
    notes: "",
  });

  // ============================================
  // Submit Handlers (weight & expense only)
  // ============================================
  const handleWeightSubmit = () => {
    if (!selectedPet || !weightForm.weight) return;

    addWeightLog({
      petId: selectedPet.id,
      petName: selectedPet.name,
      date: today,
      weight: parseFloat(weightForm.weight),
      notes: weightForm.notes || undefined,
    });

    setActiveSheet(null);
    setWeightForm({ weight: "", notes: "" });
  };

  const handleExpenseSubmit = () => {
    if (!selectedPet || !expenseForm.amount || !expenseForm.description) return;

    addExpenseLog({
      petId: selectedPet.id,
      petName: selectedPet.name,
      date: today,
      amount: parseFloat(expenseForm.amount),
      category: expenseForm.category,
      description: expenseForm.description,
      notes: expenseForm.notes || undefined,
    });

    setActiveSheet(null);
    setExpenseForm({
      amount: "",
      category: "food",
      description: "",
      notes: "",
    });
  };

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
      {/* Section 1: Pet Selector */}
      <PetSelector />

      {/* Section 2: Care Note Summary (Connected Mode Only) */}
      {appMode === "connected" && <CareNoteSummary />}

      {/* Section 3: Walk Hero Widget */}
      <WalkHeroWidget onStartWalk={() => setIsWalkModalOpen(true)} />

      {/* Section 4: Info Widget Row */}
      <InfoWidgetRow />

      {/* Section 5: Quick Actions */}
      <QuickActionGridSimple
        onActionClick={setActiveSheet}
        onNavigate={(path) => navigate(path)}
      />

      {/* Section 6: Daily Log Feed */}
      <DailyLogFeed />

      {/* Section 7: Provider Connect Banner (Pure Diary Mode Only) */}
      {appMode === "pure_diary" && <ProviderConnectBanner variant="default" />}

      {/* Section 8: My Providers (Connected Mode) */}
      {appMode === "connected" && myProviders.length > 0 && (
        <div className="px-4 mt-6 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              👩‍🏫 내 선생님
            </h2>
            <Link
              to="/home/provider-connect"
              className="text-sm text-orange-500 dark:text-orange-400 font-medium flex items-center gap-1"
            >
              <Plus size={16} />
              연결
            </Link>
          </div>

          <div className="space-y-3">
            {myProviders.map((provider) => (
              <Link
                to="/home/communication"
                key={provider.id}
                className="block bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-2xl">
                    {provider.serviceType === "hotel"
                      ? "🏨"
                      : provider.serviceType === "training"
                        ? "🎓"
                        : provider.serviceType === "grooming"
                          ? "✂️"
                          : "🏥"}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {provider.businessName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {serviceTypeConfig[provider.serviceType]?.label}
                    </p>
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-gray-400 dark:text-gray-500"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Walk Modal */}
      <WalkMapModal
        isOpen={isWalkModalOpen}
        onClose={() => setIsWalkModalOpen(false)}
      />

      {/* ============================================ */}
      {/* Bottom Sheets */}
      {/* ============================================ */}

      {/* Meal/Bowel/Board sheets moved to FamilyBoardPage */}

      {/* Weight Sheet */}
      <BottomSheet
        isOpen={activeSheet === "weight"}
        onClose={() => setActiveSheet(null)}
        title={`⚖️ ${selectedPet?.name}의 몸무게`}
      >
        <div className="space-y-4">
          <div className="text-center py-2">
            <span className="text-5xl">🐕‍🦺</span>
          </div>
          <Input
            label="몸무게 (kg)"
            type="number"
            step="0.1"
            placeholder="30.5"
            value={weightForm.weight}
            onChange={(e) =>
              setWeightForm({ ...weightForm, weight: e.target.value })
            }
          />
          <TextArea
            label="메모 📝"
            placeholder="다이어트 중이에요!"
            rows={2}
            value={weightForm.notes}
            onChange={(e) =>
              setWeightForm({ ...weightForm, notes: e.target.value })
            }
          />
          <Button
            variant="primary"
            className="w-full rounded-2xl py-3"
            onClick={handleWeightSubmit}
          >
            📊 기록 완료!
          </Button>
        </div>
      </BottomSheet>

      {/* Expense Sheet */}
      <BottomSheet
        isOpen={activeSheet === "expense"}
        onClose={() => setActiveSheet(null)}
        title={`💰 ${selectedPet?.name}의 품위유지비`}
      >
        <div className="space-y-4">
          <div className="text-center py-2">
            <span className="text-5xl">💸</span>
          </div>
          <Input
            label="얼마 썼어요? (원)"
            type="number"
            placeholder="45000"
            value={expenseForm.amount}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, amount: e.target.value })
            }
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              어디에 썼어요?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                Object.keys(cuteExpenseCategoryLabels) as ExpenseCategory[]
              ).map((cat) => (
                <button
                  key={cat}
                  onClick={() =>
                    setExpenseForm({ ...expenseForm, category: cat })
                  }
                  className={`py-2 px-3 rounded-xl border-2 text-xs font-medium transition-all ${
                    expenseForm.category === cat
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                      : "border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {cuteExpenseCategoryLabels[cat]}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="뭘 샀어요?"
            placeholder="로얄캐닌 사료 3kg"
            value={expenseForm.description}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, description: e.target.value })
            }
          />
          <Button
            variant="primary"
            className="w-full rounded-2xl py-3"
            onClick={handleExpenseSubmit}
          >
            💰 지출 기록!
          </Button>
        </div>
      </BottomSheet>

      {/* ============================================ */}
      {/* Walk FAB (Floating Action Button) */}
      {/* ============================================ */}
      <WalkFAB onClick={() => setIsWalkModalOpen(true)} />

      {/* Scrollbar hide style */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes wave {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-25%); }
        }
        .animate-wave { animation: wave 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
