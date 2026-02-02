import { Plus } from "lucide-react";
import type { MealLog } from "../../types/dailyLog";
import { cuteMealTypeLabels, cuteFoodTypeLabels } from "../../types/dailyLog";

// ============================================
// MealSection - 밥 기록 목록 + 추가 버튼
// ============================================

interface MealSectionProps {
  meals: MealLog[];
  onAddClick: () => void;
}

export function MealSection({ meals, onAddClick }: MealSectionProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          🍚 밥 기록
        </h3>
        <button
          onClick={onAddClick}
          className="flex items-center gap-1 text-sm text-orange-500 dark:text-orange-400 font-medium hover:text-orange-600 dark:hover:text-orange-300 transition-colors"
        >
          <Plus size={16} />
          기록 추가
        </button>
      </div>

      {meals.length === 0 ? (
        <div className="text-center py-6">
          <span className="text-4xl block mb-2">🍽️</span>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            아직 밥 기록이 없어요
          </p>
          <button
            onClick={onAddClick}
            className="mt-2 text-sm text-orange-500 dark:text-orange-400 font-medium"
          >
            + 첫 끼니를 기록해보세요
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {meals.map((meal) => (
            <div
              key={meal.id}
              className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl"
            >
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-lg flex-shrink-0">
                🍚
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {cuteMealTypeLabels[meal.mealType]}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {meal.amount}g
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {meal.time} · {cuteFoodTypeLabels[meal.foodType]}
                  {meal.medsTaken && " · 💊 약 복용"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
