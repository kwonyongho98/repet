import { Scale, TrendingUp, TrendingDown, Minus } from "lucide-react";

// ============================================
// WeightEventCard - 캘린더 체중 변화 카드
// ============================================

interface WeightEventCardProps {
  weight: number;
  previousWeight?: number;
  date: string;
  petName: string;
  notes?: string;
}

export function WeightEventCard({
  weight,
  previousWeight,
  date,
  petName,
  notes,
}: WeightEventCardProps) {
  const diff = previousWeight ? weight - previousWeight : 0;
  const diffAbs = Math.abs(diff).toFixed(1);
  const isGain = diff > 0;
  const isLoss = diff < 0;
  const isStable = diff === 0 || !previousWeight;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800/40">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
          <Scale size={18} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
              {weight}kg
            </span>
            {!isStable && (
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  isGain
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                {isGain ? (
                  <TrendingUp size={12} />
                ) : (
                  <TrendingDown size={12} />
                )}
                {isGain ? "+" : "-"}
                {diffAbs}kg
              </span>
            )}
            {isStable && previousWeight && (
              <span className="flex items-center gap-0.5 text-xs font-medium text-gray-400">
                <Minus size={12} />
                변화 없음
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {petName} · {date}
          </span>
        </div>
      </div>
      {notes && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 pl-13">
          📝 {notes}
        </p>
      )}
    </div>
  );
}
