// ============================================
// DailyTracker - 오늘의 밥/응가/산책 현황 요약
// ============================================

interface DailyTrackerProps {
  mealCount: number;
  bowelCount: number;
  walkCount: number;
  totalWalkMinutes: number;
}

export function DailyTracker({
  mealCount,
  bowelCount,
  walkCount,
  totalWalkMinutes,
}: DailyTrackerProps) {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 rounded-2xl p-4 shadow-md">
      <h3 className="text-white font-bold text-sm mb-3 opacity-90">
        📊 오늘의 현황
      </h3>
      <div className="grid grid-cols-3 gap-3">
        <TrackerCard
          emoji="🍚"
          label="밥"
          value={`${mealCount}회`}
          bgColor="bg-white/20"
        />
        <TrackerCard
          emoji="💩"
          label="응가"
          value={`${bowelCount}회`}
          bgColor="bg-white/20"
        />
        <TrackerCard
          emoji="🐾"
          label="산책"
          value={walkCount > 0 ? `${totalWalkMinutes}분` : "아직"}
          bgColor="bg-white/20"
        />
      </div>
    </div>
  );
}

interface TrackerCardProps {
  emoji: string;
  label: string;
  value: string;
  bgColor: string;
}

function TrackerCard({ emoji, label, value, bgColor }: TrackerCardProps) {
  return (
    <div
      className={`${bgColor} rounded-xl p-3 text-center backdrop-blur-sm`}
    >
      <span className="text-2xl block mb-1">{emoji}</span>
      <span className="text-white text-xs font-medium block opacity-80">
        {label}
      </span>
      <span className="text-white text-base font-bold block">{value}</span>
    </div>
  );
}
