import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pin, Send, Loader2, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

import { useProviderStore } from "../../stores/useProviderStore";
import { useUIStore } from "../../stores/useUIStore";
import { Button, Input, TextArea, Modal } from "../../components/common";
import type { Announcement } from "../../types/provider";

// ============================================
// Provider Announcement Page
// ============================================

export default function ProviderAnnouncementPage() {
  const navigate = useNavigate();
  const myProvider = useProviderStore((state) => state.myProvider);
  const announcements = useProviderStore((state) => state.announcements);
  const fetchAnnouncements = useProviderStore((state) => state.fetchAnnouncements);
  const createAnnouncement = useProviderStore((state) => state.createAnnouncement);
  const deleteAnnouncement = useProviderStore((state) => state.deleteAnnouncement);
  const showToast = useUIStore((state) => state.showToast);
  
  // State
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  
  // Fetch announcements
  useState(() => {
    if (myProvider) {
      fetchAnnouncements(myProvider.id);
    }
  });
  
  // Submit announcement
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      showToast('제목과 내용을 입력해주세요', 'warning');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await createAnnouncement({
        title: title.trim(),
        content: content.trim(),
        isPinned,
      });
      
      if (result) {
        showToast('공지사항이 등록되었습니다', 'success');
        setShowForm(false);
        setTitle("");
        setContent("");
        setIsPinned(false);
      } else {
        showToast('공지사항 등록에 실패했습니다', 'error');
      }
    } catch (error) {
      showToast('오류가 발생했습니다', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Delete announcement
  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    const success = await deleteAnnouncement(deleteTarget.id);
    if (success) {
      showToast('공지사항이 삭제되었습니다', 'success');
    } else {
      showToast('삭제에 실패했습니다', 'error');
    }
    setDeleteTarget(null);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-4">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
        <div className="h-14 px-4 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <ArrowLeft size={22} className="text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="font-bold text-gray-900 dark:text-white">공지사항 관리</h1>
          <button
            onClick={() => setShowForm(true)}
            className="text-orange-500 font-medium text-sm"
          >
            + 작성
          </button>
        </div>
      </header>
      
      {/* Content */}
      <div className="px-4 pt-4">
        {announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-4">📢</div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
              공지사항이 없어요
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
              보호자님들에게 전달할<br />
              공지사항을 등록해보세요
            </p>
            <Button variant="primary" onClick={() => setShowForm(true)}>
              공지사항 작성하기
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map(announcement => (
              <AnnouncementCard 
                key={announcement.id} 
                announcement={announcement}
                onDelete={() => setDeleteTarget(announcement)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Create Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="공지사항 작성"
      >
        <div className="space-y-4">
          <Input
            label="제목"
            placeholder="공지사항 제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          
          <TextArea
            label="내용"
            placeholder="공지사항 내용을 입력하세요"
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          
          <button
            onClick={() => setIsPinned(!isPinned)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all ${
              isPinned
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30'
                : 'border-gray-200 dark:border-slate-600'
            }`}
          >
            <Pin size={18} className={isPinned ? 'text-orange-500' : 'text-gray-400'} />
            <span className={`text-sm font-medium ${isPinned ? 'text-orange-500' : 'text-gray-600 dark:text-gray-400'}`}>
              상단 고정
            </span>
          </button>
          
          <Button
            variant="primary"
            className="w-full"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin mr-2" />
            ) : (
              <Send size={18} className="mr-2" />
            )}
            공지사항 등록
          </Button>
        </div>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="공지사항 삭제"
      >
        <div className="text-center py-4">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            "{deleteTarget?.title}" 공지사항을 삭제하시겠습니까?
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setDeleteTarget(null)}
            >
              취소
            </Button>
            <Button
              variant="primary"
              className="flex-1 bg-red-500 hover:bg-red-600"
              onClick={handleDelete}
            >
              삭제
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ============================================
// Announcement Card
// ============================================

interface AnnouncementCardProps {
  announcement: Announcement;
  onDelete: () => void;
}

function AnnouncementCard({ announcement, onDelete }: AnnouncementCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {announcement.isPinned && (
            <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-500 text-xs rounded-full font-medium">
              📌 고정
            </span>
          )}
          <h3 className="font-bold text-gray-900 dark:text-white">
            {announcement.title}
          </h3>
        </div>
        <button
          onClick={onDelete}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 whitespace-pre-wrap">
        {announcement.content}
      </p>
      
      <p className="text-xs text-gray-400">
        {format(parseISO(announcement.createdAt), "yyyy년 M월 d일 HH:mm", { locale: ko })}
      </p>
    </div>
  );
}
