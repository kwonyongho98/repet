import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, Bell, ChevronDown, Search, RefreshCw } from "lucide-react";
import { format, parseISO, isToday, isYesterday, isSameWeek, startOfWeek } from "date-fns";
import { ko } from "date-fns/locale";

import { useProviderStore } from "../../stores/useProviderStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { useUIStore } from "../../stores/useUIStore";
import { moodConfig, serviceTypeConfig } from "../../types/provider";
import type { CareNote, MyProvider } from "../../types/provider";
import { SkeletonCareNote, ErrorState, EmptyState as CommonEmptyState } from "../../components/common";

// ============================================
// Communication Page (소통 탭)
// ============================================

type SubTab = 'care-notes' | 'announcements';

export default function CommunicationPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const myProviders = useProviderStore((state) => state.myProviders);
  const careNotes = useProviderStore((state) => state.careNotes);
  const fetchCareNotes = useProviderStore((state) => state.fetchCareNotes);
  const isLoading = useProviderStore((state) => state.isLoading);
  
  // State
  const [activeTab, setActiveTab] = useState<SubTab>('care-notes');
  const [selectedProviderId, setSelectedProviderId] = useState<string | 'all'>('all');
  const [showProviderFilter, setShowProviderFilter] = useState(false);
  
  // Fetch care notes on mount
  useEffect(() => {
    if (user?.familyId) {
      fetchCareNotes({ familyId: user.familyId });
    }
  }, [user?.familyId, fetchCareNotes]);
  
  // Filter notes by provider
  const filteredNotes = selectedProviderId === 'all' 
    ? careNotes 
    : careNotes.filter(note => note.providerId === selectedProviderId);
  
  // Group notes by date
  const groupedNotes = groupNotesByDate(filteredNotes);
  
  // Selected provider for display
  const selectedProvider = selectedProviderId !== 'all' 
    ? myProviders.find(p => p.id === selectedProviderId)
    : null;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 px-4 pt-4 pb-2 border-b border-gray-100 dark:border-slate-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          💬 소통
        </h1>
        
        {/* Sub Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('care-notes')}
            className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'care-notes'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            📝 케어노트
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'announcements'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            📢 공지사항
          </button>
        </div>
      </div>
      
      {/* Content */}
      {activeTab === 'care-notes' ? (
        <div className="px-4 pt-4">
          {/* Provider Filter */}
          {myProviders.length > 1 && (
            <div className="mb-4">
              <button
                onClick={() => setShowProviderFilter(!showProviderFilter)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700"
              >
                <Filter size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {selectedProvider ? selectedProvider.name : '전체 업체'}
                </span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${showProviderFilter ? 'rotate-180' : ''}`} />
              </button>
              
              {showProviderFilter && (
                <div className="mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
                  <button
                    onClick={() => {
                      setSelectedProviderId('all');
                      setShowProviderFilter(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm ${
                      selectedProviderId === 'all' 
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-500' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    전체 업체
                  </button>
                  {myProviders.map(provider => (
                    <button
                      key={provider.id}
                      onClick={() => {
                        setSelectedProviderId(provider.id);
                        setShowProviderFilter(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm flex items-center gap-2 border-t border-gray-100 dark:border-slate-700 ${
                        selectedProviderId === provider.id 
                          ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-500' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span>{serviceTypeConfig[provider.serviceType]?.emoji}</span>
                      <span>{provider.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Care Notes List */}
          {isLoading ? (
            <div className="space-y-3">
              <SkeletonCareNote />
              <SkeletonCareNote />
              <SkeletonCareNote />
            </div>
          ) : filteredNotes.length === 0 ? (
            <CommonEmptyState 
              emoji="📭"
              title="케어노트가 없어요"
              message="선생님이 케어노트를 보내면\n여기에서 확인할 수 있어요"
            />
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedNotes).map(([dateLabel, notes]) => (
                <div key={dateLabel}>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                    {dateLabel}
                  </h3>
                  <div className="space-y-3">
                    {notes.map(note => (
                      <CareNoteCard 
                        key={note.id} 
                        note={note}
                        onClick={() => navigate(`/home/communication/care-note/${note.id}`)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <AnnouncementsSection providers={myProviders} />
      )}
    </div>
  );
}

// ============================================
// Care Note Card
// ============================================

interface CareNoteCardProps {
  note: CareNote;
  onClick: () => void;
}

function CareNoteCard({ note, onClick }: CareNoteCardProps) {
  const mood = moodConfig[note.mood];
  const serviceType = note.provider?.serviceType 
    ? serviceTypeConfig[note.provider.serviceType] 
    : null;
  
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-all"
    >
      {/* Photos */}
      {note.photos && note.photos.length > 0 && (
        <div className="relative h-40 bg-gray-100 dark:bg-slate-700">
          <img 
            src={note.photos[0]} 
            alt="" 
            className="w-full h-full object-cover"
          />
          {note.photos.length > 1 && (
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded-full text-xs text-white">
              +{note.photos.length - 1}
            </div>
          )}
        </div>
      )}
      
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: serviceType ? `${serviceType.color}20` : '#f3f4f6' }}
          >
            {serviceType?.emoji || '🏪'}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white">
              {note.provider?.name || '업체'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {note.pet?.name} · {format(parseISO(note.date), "M월 d일 (EEE)", { locale: ko })}
            </p>
          </div>
          <div 
            className="px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: `${mood.color}20`, color: mood.color }}
          >
            {mood.emoji} {mood.label}
          </div>
        </div>
        
        {/* Comment */}
        {note.comment && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {note.comment}
          </p>
        )}
        
        {/* Activities preview */}
        {note.activities && (
          <div className="flex flex-wrap gap-1 mt-3">
            {Object.entries(note.activities)
              .filter(([_, value]) => value)
              .slice(0, 4)
              .map(([key]) => (
                <span 
                  key={key}
                  className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded-full text-xs text-gray-600 dark:text-gray-400"
                >
                  {getActivityLabel(key)}
                </span>
              ))}
          </div>
        )}
      </div>
    </button>
  );
}

// ============================================
// Announcements Section
// ============================================

interface AnnouncementsSectionProps {
  providers: MyProvider[];
}

function AnnouncementsSection({ providers }: AnnouncementsSectionProps) {
  // Placeholder - Will be implemented in Phase 3
  return (
    <div className="px-4 pt-4">
      <EmptyState type="announcements" />
    </div>
  );
}

// ============================================
// Empty State
// ============================================

interface EmptyStateProps {
  type: 'care-notes' | 'announcements';
}

function EmptyState({ type }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="text-6xl mb-4">
        {type === 'care-notes' ? '📭' : '📪'}
      </div>
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
        {type === 'care-notes' ? '케어노트가 없어요' : '공지사항이 없어요'}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
        {type === 'care-notes' 
          ? '선생님이 케어노트를 보내면\n여기에서 확인할 수 있어요'
          : '업체에서 공지사항을 등록하면\n여기에서 확인할 수 있어요'
        }
      </p>
    </div>
  );
}

// ============================================
// Helper Functions
// ============================================

function groupNotesByDate(notes: CareNote[]): Record<string, CareNote[]> {
  const groups: Record<string, CareNote[]> = {};
  
  notes.forEach(note => {
    const date = parseISO(note.date);
    let label: string;
    
    if (isToday(date)) {
      label = '오늘';
    } else if (isYesterday(date)) {
      label = '어제';
    } else if (isSameWeek(date, new Date(), { weekStartsOn: 1 })) {
      label = '이번 주';
    } else {
      label = format(date, "M월", { locale: ko });
    }
    
    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(note);
  });
  
  return groups;
}

function getActivityLabel(key: string): string {
  const labels: Record<string, string> = {
    nap: '😴 낮잠',
    snack: '🍪 간식',
    play: '🎾 놀이',
    walk: '🚶 산책',
    grooming: '✨ 미용',
    training: '🎓 훈련',
    socialization: '🐕 친구놀이',
  };
  return labels[key] || key;
}
