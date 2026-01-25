import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDailyLogStore } from "../../stores/useDailyLogStore";
import { usePetStore } from "../../stores/usePetStore";
import { format } from "date-fns";

// ============================================
// Types
// ============================================
interface FeedItem {
  id: string;
  type: "walk" | "meal" | "bowel" | "weight" | "expense";
  time: string;
  title: string;
  subtitle?: string;
  emoji: string;
  color: string;
}

// ============================================
// Component
// ============================================
export default function DailyLogFeed() {
  const navigate = useNavigate();
  
  const selectedPetId = usePetStore((state) => state.selectedPetId);
  const selectedPet = usePetStore((state) => {
    const pets = state.pets;
    return pets.find((p) => p.id === state.selectedPetId);
  });

  const walks = useDailyLogStore((state) => state.walks);
  const meals = useDailyLogStore((state) => state.meals);
  const bowels = useDailyLogStore((state) => state.bowels);
  const weights = useDailyLogStore((state) => state.weights);
  const expenses = useDailyLogStore((state) => state.expenses);

  const today = format(new Date(), "yyyy-MM-dd");

  // Build feed items
  const feedItems = useMemo((): FeedItem[] => {
    const items: FeedItem[] = [];

    // Walks
    walks
      .filter((w) => w.date === today && w.petId === selectedPetId)
      .forEach((walk) => {
        items.push({
          id: walk.id,
          type: "walk",
          time: walk.startTime,
          title: `킁킁 탐험 ${walk.duration}분`,
          subtitle: walk.distance
            ? `${walk.distance}${walk.distanceUnit} 탐험 완료!`
            : "신나는 산책!",
          emoji: "🐕",
          color: "#22c55e",
        });
      });

    // Meals
    meals
      .filter((m) => m.date === today && m.petId === selectedPetId)
      .forEach((meal) => {
        items.push({
          id: meal.id,
          type: "meal",
          time: meal.time,
          title: `냠냠 타임 ${meal.amount}g`,
          subtitle: meal.foodName || meal.foodType,
          emoji: "🍽️",
          color: "#f59e0b",
        });
      });

    // Bowels
    bowels
      .filter((b) => b.date === today && b.petId === selectedPetId)
      .forEach((bowel) => {
        items.push({
          id: bowel.id,
          type: "bowel",
          time: bowel.time,
          title: "응가 체크 ✨",
          subtitle:
            bowel.condition === "good"
              ? "건강해요!"
              : bowel.condition === "soft"
              ? "좀 무른 편"
              : "상태 확인 필요",
          emoji: "💩",
          color: "#ec4899",
        });
      });

    // Weights
    weights
      .filter((w) => w.date === today && w.petId === selectedPetId)
      .forEach((weight) => {
        items.push({
          id: weight.id,
          type: "weight",
          time: "00:00",
          title: `체중 ${weight.weight}kg`,
          subtitle: weight.notes || "기록 완료",
          emoji: "⚖️",
          color: "#3b82f6",
        });
      });

    // Expenses
    expenses
      .filter((e) => e.date === today && e.petId === selectedPetId)
      .forEach((expense) => {
        items.push({
          id: expense.id,
          type: "expense",
          time: "00:00",
          title: `${expense.amount.toLocaleString()}원`,
          subtitle: expense.description,
          emoji: "💰",
          color: "#8b5cf6",
        });
      });

    // Sort by time (descending - newest first)
    return items.sort((a, b) => {
      if (a.time === "00:00") return 1;
      if (b.time === "00:00") return -1;
      return b.time.localeCompare(a.time);
    });
  }, [walks, meals, bowels, weights, expenses, today, selectedPetId]);

  return (
    <div className="px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          📖 오늘의 기록
        </h2>
        <button
          onClick={() => navigate("/home/calendar")}
          className="flex items-center text-sm font-medium text-orange-500 dark:text-orange-400"
        >
          더보기
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Feed Content */}
      {feedItems.length === 0 ? (
        <EmptyFeedState petName={selectedPet?.name || ""} />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700">
          {feedItems.map((item, idx) => (
            <FeedItemRow
              key={`${item.type}-${item.id}`}
              item={item}
              isLast={idx === feedItems.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// Feed Item Row
// ============================================
interface FeedItemRowProps {
  item: FeedItem;
  isLast: boolean;
}

function FeedItemRow({ item, isLast }: FeedItemRowProps) {
  return (
    <div
      className={`flex items-center gap-4 p-4 ${
        !isLast ? "border-b border-gray-50 dark:border-slate-700" : ""
      }`}
    >
      {/* Time */}
      <div className="w-14 text-right">
        <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
          {item.time !== "00:00" ? item.time : ""}
        </p>
      </div>

      {/* Emoji Icon */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
        style={{ backgroundColor: `${item.color}20` }}
      >
        {item.emoji}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-gray-100">
          {item.title}
        </p>
        {item.subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {item.subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================
// Empty State
// ============================================
function EmptyFeedState({ petName }: { petName: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center shadow-sm border border-gray-100 dark:border-slate-700">
      <div className="w-20 h-20 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-4xl">📝</span>
      </div>
      <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">
        {petName}의 오늘 기록이 없어요
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-500">
        위의 버튼으로 하루를 기록해보세요!
      </p>
    </div>
  );
}
