import { useMemo } from "react";
import { differenceInDays } from "date-fns";
import { usePetStore } from "../../stores/usePetStore";
import { useDailyLogStore } from "../../stores/useDailyLogStore";
import { format } from "date-fns";

export default function InfoWidgetRow() {
  const selectedPet = usePetStore((state) => {
    const pets = state.pets;
    const selectedPetId = state.selectedPetId;
    return pets.find((p) => p.id === selectedPetId);
  });

  const meals = useDailyLogStore((state) => state.meals);
  const weights = useDailyLogStore((state) => state.weights);

  const today = format(new Date(), "yyyy-MM-dd");

  // Calculate D-day
  const daysWithPet = useMemo(() => {
    if (!selectedPet) return 0;
    return differenceInDays(new Date(), new Date(selectedPet.createdAt));
  }, [selectedPet]);

  // Today's meals
  const todayMeals = useMemo(() => {
    if (!selectedPet) return [];
    return meals.filter(
      (m) => m.date === today && m.petId === selectedPet.id
    );
  }, [meals, today, selectedPet]);

  const totalIntake = useMemo(() => {
    return todayMeals.reduce((acc, m) => acc + m.amount, 0);
  }, [todayMeals]);

  // Latest weight
  const latestWeight = useMemo(() => {
    if (!selectedPet) return null;
    const petWeights = weights
      .filter((w) => w.petId === selectedPet.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return petWeights[0] || null;
  }, [weights, selectedPet]);

  return (
    <div className="px-4 mb-4">
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {/* D-day Widget */}
        <InfoWidget
          emoji="🐶"
          label="함께한 날"
          value={`D+${daysWithPet}`}
          bgColor="bg-orange-50 dark:bg-orange-900/30"
          textColor="text-orange-600 dark:text-orange-400"
          subtext={selectedPet?.name || ""}
        />

        {/* Today's Intake Widget */}
        <InfoWidget
          emoji="🍚"
          label="오늘 식사"
          value={totalIntake > 0 ? `${totalIntake}g` : "-"}
          bgColor="bg-amber-50 dark:bg-amber-900/30"
          textColor="text-amber-600 dark:text-amber-400"
          subtext={`${todayMeals.length}회`}
        />

        {/* Weight Widget */}
        <InfoWidget
          emoji="⚖️"
          label="최근 체중"
          value={latestWeight ? `${latestWeight.weight}kg` : "-"}
          bgColor="bg-blue-50 dark:bg-blue-900/30"
          textColor="text-blue-600 dark:text-blue-400"
          subtext={latestWeight?.date || "기록 없음"}
        />

        {/* Poop Count Today */}
        <TodayPoopWidget petId={selectedPet?.id} />
      </div>
    </div>
  );
}

// ============================================
// Info Widget Component
// ============================================
interface InfoWidgetProps {
  emoji: string;
  label: string;
  value: string;
  bgColor: string;
  textColor: string;
  subtext?: string;
}

function InfoWidget({
  emoji,
  label,
  value,
  bgColor,
  textColor,
  subtext,
}: InfoWidgetProps) {
  return (
    <div
      className={`flex-shrink-0 w-28 ${bgColor} rounded-2xl p-3 border border-gray-100 dark:border-slate-700`}
    >
      <div className="text-2xl mb-2">{emoji}</div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
      <p className={`text-lg font-bold ${textColor}`}>{value}</p>
      {subtext && (
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
          {subtext}
        </p>
      )}
    </div>
  );
}

// ============================================
// Today's Poop Count Widget
// ============================================
function TodayPoopWidget({ petId }: { petId?: string }) {
  const bowels = useDailyLogStore((state) => state.bowels);
  const today = format(new Date(), "yyyy-MM-dd");

  const todayBowels = useMemo(() => {
    if (!petId) return [];
    return bowels.filter((b) => b.date === today && b.petId === petId);
  }, [bowels, today, petId]);

  return (
    <InfoWidget
      emoji="💩"
      label="오늘 배변"
      value={`${todayBowels.length}회`}
      bgColor="bg-pink-50 dark:bg-pink-900/30"
      textColor="text-pink-600 dark:text-pink-400"
      subtext={todayBowels.length > 0 ? "잘하고 있어요!" : "아직 기록 없음"}
    />
  );
}
