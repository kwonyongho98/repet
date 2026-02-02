import { Plus } from "lucide-react";
import type { BowelLog } from "../../types/dailyLog";
import { cuteBowelTypeLabels, cuteBowelConditionLabels } from "../../types/dailyLog";

// ============================================
// BowelSection - 배변 기록 목록 + 추가 버튼
// ============================================

interface BowelSectionProps {
  bowels: BowelLog[];
  onAddClick: () => void;
}

export function BowelSection({ bowels, onAddClick }: BowelSectionProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          💩 배변 기록
        </h3>
        <button
          onClick={onAddClick}
          className="flex items-center gap-1 text-sm text-amber-500 dark:text-amber-400 font-medium hover:text-amber-600 dark:hover:text-amber-300 transition-colors"
        >
          <Plus size={16} />
          기록 추가
        </button>
      </div>

      {bowels.length === 0 ? (
        <div className="text-center py-6">
          <span className="text-4xl block mb-2">🚽</span>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            아직 배변 기록이 없어요
          </p>
          <button
            onClick={onAddClick}
            className="mt-2 text-sm text-amber-500 dark:text-amber-400 font-medium"
          >
            + 배변을 기록해보세요
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {bowels.map((bowel) => (
            <div
              key={bowel.id}
              className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl"
            >
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-lg flex-shrink-0">
                💩
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {cuteBowelTypeLabels[bowel.bowelType]}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {bowel.time} · {cuteBowelConditionLabels[bowel.condition]}
                  {bowel.notes && ` · ${bowel.notes}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
