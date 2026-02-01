import { Link } from "react-router-dom";
import { ChevronRight, MessageCircle, Image as ImageIcon } from "lucide-react";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { useProviderStore } from "../../stores/useProviderStore";
import { moodConfig, serviceTypeConfig } from "../../types/provider";
import type { CareNote } from "../../types/provider";

// ============================================
// Care Note Summary
// 홈 화면 케어노트 요약 (Connected Mode에서 표시)
// ============================================

export default function CareNoteSummary() {
  const myProviders = useProviderStore((state) => state.myProviders);
  const careNotes = useProviderStore((state) => state.careNotes);
  
  // FIX: myProviders가 undefined일 수 있으므로 방어 처리
  // 또한 MyProvider 타입에 recentCareNotes 속성이 없으므로
  // useProviderStore의 careNotes 상태를 직접 사용
  const allRecentNotes = (careNotes || []).map(note => ({
    ...note,
    providerName: note.providerName || "파트너",
  }));
  
  // Sort by date (newest first)
  allRecentNotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Get today's notes
  const todayNotes = allRecentNotes.filter(note => {
    try {
      return isToday(parseISO(note.date));
    } catch {
      return false;
    }
  });
  
  // If no providers connected at all
  if (!myProviders || myProviders.length === 0) {
    return null; // 연결된 업체가 없으면 이 섹션 자체를 숨김
  }
  
  // If no notes at all
  if (allRecentNotes.length === 0) {
    return (
      <div className="mx-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            📝 오늘의 케어노트
          </h2>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-2">🔭</div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            아직 케어노트가 없어요
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
            선생님이 케어노트를 보내면 여기에 표시돼요
          </p>
        </div>
      </div>
    );
  }
  
  const formatNoteDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      if (isToday(date)) return "오늘";
      if (isYesterday(date)) return "어제";
      return format(date, "M월 d일", { locale: ko });
    } catch {
      return dateStr;
    }
  };
  
  return (
    <div className="mx-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          📝 오늘의 케어노트
          {todayNotes.length > 0 && (
            <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
              {todayNotes.length}
            </span>
          )}
        </h2>
        <Link
          to="/home/communication"
          className="text-sm text-orange-500 dark:text-orange-400 font-medium flex items-center gap-1"
        >
          전체보기
          <ChevronRight size={16} />
        </Link>
      </div>
      
      <div className="space-y-3">
        {(todayNotes.length > 0 ? todayNotes : allRecentNotes.slice(0, 2)).map((note) => (
          <CareNotePreviewCard 
            key={note.id} 
            note={note} 
            providerName={note.providerName}
            showDate={todayNotes.length === 0}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================
// Care Note Preview Card
// ============================================

interface CareNotePreviewCardProps {
  note: CareNote;
  providerName: string;
  showDate?: boolean;
}

function CareNotePreviewCard({ note, providerName, showDate }: CareNotePreviewCardProps) {
  const mood = moodConfig[note.mood] || { emoji: "😐", label: "보통" };
  const serviceType = note.provider?.serviceType 
    ? serviceTypeConfig[note.provider.serviceType] 
    : null;
  
  const formatNoteDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      if (isToday(date)) return "오늘";
      if (isYesterday(date)) return "어제";
      return format(date, "M월 d일", { locale: ko });
    } catch {
      return dateStr;
    }
  };
  
  return (
    <Link
      to={`/home/communication/care-note/${note.id}`}
      className="block bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: serviceType ? `${serviceType.color}20` : '#f3f4f6' }}
          >
            {serviceType?.emoji || '🐾'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 dark:text-white">
                {providerName}
              </h3>
              {showDate && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  · {formatNoteDate(note.date)}
                </span>
              )}
            </div>
            {note.pet && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {note.pet.name}의 하루
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-slate-700">
            <span className="text-lg">{mood.emoji}</span>
            <span className="text-xs text-gray-600 dark:text-gray-400">{mood.label}</span>
          </div>
        </div>
        
        {/* Content preview */}
        {note.comment && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            "{note.comment}"
          </p>
        )}
        
        {/* Photos preview & stats */}
        <div className="flex items-center justify-between">
          {note.photos && note.photos.length > 0 ? (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {note.photos.slice(0, 3).map((photo, idx) => (
                  <div 
                    key={idx}
                    className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 overflow-hidden"
                  >
                    <img 
                      src={photo} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              {note.photos.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{note.photos.length - 3}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-gray-400">
              <ImageIcon size={14} />
              <span className="text-xs">사진 없음</span>
            </div>
          )}
          
          <div className="flex items-center gap-1 text-gray-400">
            <MessageCircle size={14} />
            <span className="text-xs">댓글달기</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
