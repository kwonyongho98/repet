import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Calendar,
  ChevronRight,
  Pin,
  Megaphone,
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

// Stores
import { useProviderStore } from "../../stores/useProviderStore";
import { useAuthStore } from "../../stores/useAuthStore";

// Components
import { Badge } from "../../components/common";

// Types
interface Announcement {
  id: string;
  providerId: string;
  providerName: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: Date;
  category: "notice" | "event" | "schedule" | "urgent";
}

const categoryConfig: Record<string, { label: string; color: string; emoji: string }> = {
  notice: { label: "공지", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", emoji: "📢" },
  event: { label: "이벤트", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", emoji: "🎉" },
  schedule: { label: "일정", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", emoji: "📅" },
  urgent: { label: "긴급", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", emoji: "🚨" },
};

export default function AnnouncementListPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // Stores
  const myProviders = useProviderStore((state) => state.myProviders);

  // States
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // Demo announcements
  const [announcements] = useState<Announcement[]>(() => {
    const demoAnnouncements: Announcement[] = [];
    
    myProviders.forEach((provider, idx) => {
      demoAnnouncements.push(
        {
          id: `${provider.id}-1`,
          providerId: provider.id,
          providerName: provider.businessName,
          title: "2월 설 연휴 운영 안내",
          content: `안녕하세요, ${provider.businessName}입니다.\n\n설 연휴 기간 운영 안내드립니다.\n\n📅 휴무일: 2월 8일(토) ~ 2월 10일(월)\n📅 정상 운영: 2월 11일(화)부터\n\n연휴 기간 중 긴급 연락은 카카오톡으로 부탁드립니다.\n\n새해 복 많이 받으세요! 🐕🧧`,
          isPinned: true,
          createdAt: new Date(Date.now() - 86400000 * 2),
          category: "notice",
        },
        {
          id: `${provider.id}-2`,
          providerId: provider.id,
          providerName: provider.businessName,
          title: "2월 특별 이벤트 🎁",
          content: `${provider.businessName}에서 2월 한 달간 특별 이벤트를 진행합니다!\n\n🎁 이벤트 내용:\n- 신규 등록 시 첫 달 10% 할인\n- 기존 회원 친구 추천 시 양쪽 모두 1회 무료\n\n많은 참여 부탁드립니다! 💕`,
          isPinned: false,
          createdAt: new Date(Date.now() - 86400000 * 5),
          category: "event",
        },
        {
          id: `${provider.id}-3`,
          providerId: provider.id,
          providerName: provider.businessName,
          title: "이번 주 일정 변경 안내",
          content: `안녕하세요.\n\n이번 주 금요일(2/7) 오후 3시 이후 조기 마감 예정입니다.\n\n픽업 시간 조정이 필요하신 보호자님께서는 미리 연락 부탁드립니다.\n\n감사합니다.`,
          isPinned: false,
          createdAt: new Date(Date.now() - 86400000),
          category: "schedule",
        }
      );
    });

    return demoAnnouncements;
  });

  // Filter announcements by provider
  const filteredAnnouncements = useMemo(() => {
    let filtered = selectedProviderId
      ? announcements.filter((a) => a.providerId === selectedProviderId)
      : announcements;

    // Sort: pinned first, then by date
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }, [announcements, selectedProviderId]);

  // Group by provider for "all" view
  const groupedByProvider = useMemo(() => {
    if (selectedProviderId) return null;
    
    const groups: Record<string, Announcement[]> = {};
    filteredAnnouncements.forEach((a) => {
      if (!groups[a.providerName]) {
        groups[a.providerName] = [];
      }
      groups[a.providerName].push(a);
    });
    return groups;
  }, [filteredAnnouncements, selectedProviderId]);

  if (myProviders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft size={22} className="text-gray-700 dark:text-gray-200" />
            </button>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              📢 공지사항
            </h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <Megaphone size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-center">
            연결된 업체가 없습니다.<br />
            업체를 연결하면 공지사항을 받을 수 있어요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={22} className="text-gray-700 dark:text-gray-200" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            📢 공지사항
          </h1>
        </div>

        {/* Provider Filter Tabs */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSelectedProviderId("")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              !selectedProviderId
                ? "bg-orange-500 text-white"
                : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400"
            }`}
          >
            전체
          </button>
          {myProviders.map((provider) => (
            <button
              key={provider.id}
              onClick={() => setSelectedProviderId(provider.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedProviderId === provider.id
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400"
              }`}
            >
              {provider.businessName}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">
              공지사항이 없습니다
            </p>
          </div>
        ) : selectedProviderId ? (
          // Single provider view
          <div className="space-y-3">
            {filteredAnnouncements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                showProvider={false}
                onClick={() => setSelectedAnnouncement(announcement)}
              />
            ))}
          </div>
        ) : (
          // Grouped view
          <div className="space-y-6">
            {groupedByProvider && Object.entries(groupedByProvider).map(([providerName, items]) => (
              <div key={providerName}>
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                  🏢 {providerName}
                </h2>
                <div className="space-y-2">
                  {items.slice(0, 3).map((announcement) => (
                    <AnnouncementCard
                      key={announcement.id}
                      announcement={announcement}
                      showProvider={false}
                      onClick={() => setSelectedAnnouncement(announcement)}
                    />
                  ))}
                  {items.length > 3 && (
                    <button
                      onClick={() => setSelectedProviderId(items[0].providerId)}
                      className="w-full py-2 text-sm text-orange-500 font-medium hover:text-orange-600"
                    >
                      +{items.length - 3}개 더보기
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedAnnouncement(null)}
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-t-3xl max-h-[80vh] overflow-hidden">
            <div className="p-6">
              {/* Handle */}
              <div className="flex justify-center mb-4">
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>

              {/* Category Badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryConfig[selectedAnnouncement.category].color}`}>
                  {categoryConfig[selectedAnnouncement.category].emoji} {categoryConfig[selectedAnnouncement.category].label}
                </span>
                {selectedAnnouncement.isPinned && (
                  <Pin size={14} className="text-orange-500" />
                )}
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {selectedAnnouncement.title}
              </h2>

              {/* Meta */}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span>{selectedAnnouncement.providerName}</span>
                <span>·</span>
                <span>{format(selectedAnnouncement.createdAt, "M월 d일", { locale: ko })}</span>
              </div>

              {/* Content */}
              <div className="prose prose-sm dark:prose-invert max-h-[50vh] overflow-y-auto">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedAnnouncement.content}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scrollbar hide */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// Announcement Card Component
interface AnnouncementCardProps {
  announcement: Announcement;
  showProvider?: boolean;
  onClick: () => void;
}

function AnnouncementCard({ announcement, showProvider = true, onClick }: AnnouncementCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 text-left hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
          <span className="text-lg">{categoryConfig[announcement.category].emoji}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {announcement.isPinned && (
              <Pin size={12} className="text-orange-500 flex-shrink-0" />
            )}
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {announcement.title}
            </h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {announcement.content}
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 dark:text-gray-500">
            {showProvider && (
              <>
                <span>{announcement.providerName}</span>
                <span>·</span>
              </>
            )}
            <span>{format(announcement.createdAt, "M월 d일", { locale: ko })}</span>
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight size={18} className="text-gray-400 flex-shrink-0 mt-1" />
      </div>
    </button>
  );
}
