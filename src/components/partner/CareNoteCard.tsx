import { useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronDown, ChevronUp, Store, X } from 'lucide-react';
import type { CareNote } from '../../types/partner';
import { moodConfig, activityConfig } from '../../types/partner';
import { Modal } from '../common';

interface CareNoteCardProps {
  careNote: CareNote;
  compact?: boolean;
}

export default function CareNoteCard({ careNote, compact = false }: CareNoteCardProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const moodInfo = moodConfig[careNote.mood];
  const activeActivities = Object.entries(careNote.activities)
    .filter(([_, value]) => value)
    .map(([key]) => activityConfig[key as keyof typeof activityConfig]);

  if (compact) {
    return (
      <CompactCard
        careNote={careNote}
        moodInfo={moodInfo}
        activeActivities={activeActivities}
      />
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl border-2 border-blue-200 dark:border-blue-800 overflow-hidden">
        {/* 헤더 */}
        <div className="p-4 border-b border-blue-100 dark:border-blue-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {careNote.providerName || '파트너'}
                </span>
                <span className="text-xs px-2 py-0.5 bg-blue-500 text-white rounded-full">
                  알림장
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {format(new Date(careNote.date), 'M월 d일 (EEE)', { locale: ko })}
              </p>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-white/50 dark:hover:bg-slate-600 rounded-lg transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* 기분 요약 (항상 표시) */}
        <div className="px-4 py-3 flex items-center gap-3 bg-white/50 dark:bg-slate-700/50">
          <span className="text-3xl">{moodInfo.emoji}</span>
          <div>
            <p className="font-medium" style={{ color: moodInfo.color }}>
              {moodInfo.label}
            </p>
            {careNote.moodNote && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                "{careNote.moodNote}"
              </p>
            )}
          </div>
        </div>

        {/* 확장 내용 */}
        {isExpanded && (
          <div className="p-4 space-y-4">
            {/* 활동 태그 */}
            {activeActivities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeActivities.map((activity, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-600 rounded-full text-sm"
                  >
                    <span>{activity.emoji}</span>
                    <span className="text-gray-700 dark:text-gray-200">
                      {activity.label}
                    </span>
                  </span>
                ))}
              </div>
            )}

            {/* 식사 기록 */}
            {careNote.meals.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  🍽️ 식사
                </h4>
                <div className="space-y-1">
                  {careNote.meals.map((meal, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
                    >
                      <span className="text-gray-400">{meal.time}</span>
                      <span>
                        {meal.type === 'breakfast'
                          ? '아침'
                          : meal.type === 'lunch'
                          ? '점심'
                          : meal.type === 'dinner'
                          ? '저녁'
                          : '간식'}{' '}
                        {meal.amount}g
                      </span>
                      <span
                        className={`text-xs ${
                          meal.ateWell ? 'text-green-500' : 'text-orange-500'
                        }`}
                      >
                        {meal.ateWell ? '✓ 잘 먹음' : '△ 조금'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 배변 기록 */}
            {careNote.bowelLogs.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  💩 배변
                </h4>
                <div className="space-y-1">
                  {careNote.bowelLogs.map((bowel, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
                    >
                      <span className="text-gray-400">{bowel.time}</span>
                      <span>
                        {bowel.type === 'urine'
                          ? '소변'
                          : bowel.type === 'feces'
                          ? '대변'
                          : '소변+대변'}
                      </span>
                      <span
                        className={`text-xs ${
                          bowel.condition === 'good'
                            ? 'text-green-500'
                            : 'text-orange-500'
                        }`}
                      >
                        {bowel.condition === 'good'
                          ? '✓ 정상'
                          : bowel.condition === 'loose'
                          ? '△ 무름'
                          : '△ 딱딱'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 사진 */}
            {careNote.photos.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  📸 오늘의 사진
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {careNote.photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPhoto(photo)}
                      className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-600 hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 코멘트 */}
            {careNote.comment && (
              <div className="p-3 bg-white dark:bg-slate-600 rounded-xl">
                <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                  {careNote.comment}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 사진 확대 모달 */}
      <Modal
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        title=""
        maxWidth="lg"
      >
        <div className="relative">
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-2 right-2 p-2 bg-black/50 rounded-full z-10"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          {selectedPhoto && (
            <img
              src={selectedPhoto}
              alt="확대 사진"
              className="w-full rounded-xl"
            />
          )}
        </div>
      </Modal>
    </>
  );
}

// ============================================
// Compact Card (피드용)
// ============================================
function CompactCard({
  careNote,
  moodInfo,
  activeActivities,
}: {
  careNote: CareNote;
  moodInfo: { emoji: string; label: string; color: string };
  activeActivities: { emoji: string; label: string }[];
}) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-4 border border-blue-200 dark:border-blue-700">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
          <Store className="w-4 h-4 text-white" />
        </div>
        <span className="font-medium text-gray-900 dark:text-white text-sm">
          {careNote.providerName || '파트너'}
        </span>
        <span className="text-xs px-2 py-0.5 bg-blue-500 text-white rounded-full">
          알림장
        </span>
      </div>

      {/* 기분 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{moodInfo.emoji}</span>
        <span className="font-medium" style={{ color: moodInfo.color }}>
          {moodInfo.label}
        </span>
      </div>

      {/* 활동 태그 */}
      {activeActivities.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {activeActivities.slice(0, 4).map((activity, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 bg-white/70 dark:bg-slate-500 rounded-full"
            >
              {activity.emoji} {activity.label}
            </span>
          ))}
          {activeActivities.length > 4 && (
            <span className="text-xs px-2 py-1 bg-white/70 dark:bg-slate-500 rounded-full">
              +{activeActivities.length - 4}
            </span>
          )}
        </div>
      )}

      {/* 사진 미리보기 */}
      {careNote.photos.length > 0 && (
        <div className="flex gap-1 mt-2">
          {careNote.photos.slice(0, 3).map((photo, index) => (
            <div
              key={index}
              className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-slate-500"
            >
              <img
                src={photo}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {careNote.photos.length > 3 && (
            <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-slate-500 flex items-center justify-center">
              <span className="text-xs text-gray-500 dark:text-gray-300">
                +{careNote.photos.length - 3}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
