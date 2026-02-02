import type { WalkLog } from "../../types/dailyLog";
import { cuteSatisfactionLabels } from "../../types/dailyLog";

// ============================================
// WalkSection - 산책 기록 목록 (읽기 전용, 추가는 FAB로)
// ============================================

interface WalkSectionProps {
  walks: WalkLog[];
}

export function WalkSection({ walks }: WalkSectionProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          🐾 산책 기록
        </h3>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          홈에서 산책 시작
        </span>
      </div>

      {walks.length === 0 ? (
        <div className="text-center py-6">
          <span className="text-4xl block mb-2">🐕</span>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            아직 오늘 산책을 안 했어요
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            홈 화면의 초록 버튼으로 산책을 시작해보세요!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {walks.map((walk) => (
            <div
              key={walk.id}
              className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-lg flex-shrink-0">
                🐾
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    산책 {walk.duration}분
                  </span>
                  {walk.distance && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {walk.distance}
                      {walk.distanceUnit}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {walk.startTime} ~ {walk.endTime}
                  {walk.satisfaction &&
                    ` · ${cuteSatisfactionLabels[walk.satisfaction]}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
