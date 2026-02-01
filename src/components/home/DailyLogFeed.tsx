import { useMemo, useEffect } from "react";
import { ChevronRight, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDailyLogStore } from "../../stores/useDailyLogStore";
import { usePetStore } from "../../stores/usePetStore";
import { usePartnerStore } from "../../stores/usePartnerStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { CareNoteCard } from "../partner";
import { format } from "date-fns";
import type { CareNote } from "../../types/partner";
import { moodConfig } from "../../types/partner";

// ============================================
// Types
// ============================================
interface FeedItem {
  id: string;
  type: "walk" | "meal" | "bowel" | "weight" | "expense" | "care_note";
  time: string;
  title: string;
  subtitle?: string;
  emoji: string;
  color: string;
  source: "family" | "partner";
  careNote?: CareNote;
}

// ============================================
// Component
// ============================================
export default function DailyLogFeed() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  const selectedPetId = usePetStore((state) => state.selectedPetId);
  const selectedPet = usePetStore((state) => {
    const pets = state.pets;
    return pets.find((p) => p.id === state.selectedPetId);
  });

  // FIX: walkLogs, mealLogs, bowelLogs, weightLogs, expenseLogs (스토어 실제 속성명)
  const walks = useDailyLogStore((state) => state.walkLogs);
  const meals = useDailyLogStore((state) => state.mealLogs);
  const bowels = useDailyLogStore((state) => state.bowelLogs);
  const weights = useDailyLogStore((state) => state.weightLogs);
  const expenses = useDailyLogStore((state) => state.expenseLogs);

  // Partner Care Notes
  const { careNotes, fetchCareNotes } = usePartnerStore();

  const today = format(new Date(), "yyyy-MM-dd");

  // Fetch care notes for today
  useEffect(() => {
    if (user?.familyId && selectedPetId) {
      fetchCareNotes(user.familyId, {
        petId: selectedPetId,
        startDate: today,
        endDate: today,
      });
    }
  }, [user?.familyId, selectedPetId, today, fetchCareNotes]);

  // Build feed items
  const feedItems = useMemo((): FeedItem[] => {
    const items: FeedItem[] = [];

    // Walks
    (walks || [])
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
          source: "family",
        });
      });

    // Meals
    (meals || [])
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
          source: "family",
        });
      });

    // Bowels
    (bowels || [])
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
          source: "family",
        });
      });

    // Weights
    (weights || [])
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
          source: "family",
        });
      });

    // Expenses
    (expenses || [])
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
          source: "family",
        });
      });

    // Care Notes from Partners
    (careNotes || [])
      .filter((cn) => cn.date === today && cn.petId === selectedPetId)
      .forEach((careNote) => {
        const moodInfo = moodConfig[careNote.mood];
        items.push({
          id: careNote.id,
          type: "care_note",
          time: format(new Date(careNote.createdAt), "HH:mm"),
          title: `${careNote.providerName || "파트너"} 알림장`,
          subtitle: `${moodInfo.emoji} ${moodInfo.label}`,
          emoji: "📝",
          color: "#3b82f6",
          source: "partner",
          careNote,
        });
      });

    // Sort by time (descending - newest first)
    return items.sort((a, b) => {
      if (a.time === "00:00") return 1;
      if (b.time === "00:00") return -1;
      return b.time.localeCompare(a.time);
    });
  }, [walks, meals, bowels, weights, expenses, careNotes, today, selectedPetId]);

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
        <div className="space-y-3">
          {feedItems.map((item) =>
            item.type === "care_note" && item.careNote ? (
              <CareNoteCard key={item.id} careNote={item.careNote} compact />
            ) : (
              <div
                key={`${item.type}-${item.id}`}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700"
              >
                <FeedItemRow item={item} />
              </div>
            )
          )}
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
}

function FeedItemRow({ item }: FeedItemRowProps) {
  return (
    <div className="flex items-center gap-4 p-4">
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
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {item.title}
          </p>
          {item.source === "partner" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs">
              <Store size={10} />
              파트너
            </span>
          )}
        </div>
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
