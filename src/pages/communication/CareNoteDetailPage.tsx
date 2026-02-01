import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Heart, MessageCircle, Send, MoreHorizontal,
  ChevronLeft, ChevronRight, X, Loader2
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

import { useProviderStore } from "../../stores/useProviderStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { moodConfig, activityConfig, serviceTypeConfig } from "../../types/provider";
import type { CareNote, CareNoteComment } from "../../types/provider";
import { Button, TextArea } from "../../components/common";

// ============================================
// Care Note Detail Page
// ============================================

export default function CareNoteDetailPage() {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  
  const user = useAuthStore((state) => state.user);
  const careNotes = useProviderStore((state) => state.careNotes);
  const comments = useProviderStore((state) => state.careNoteComments);
  const fetchCareNoteComments = useProviderStore((state) => state.fetchCareNoteComments);
  const addCareNoteComment = useProviderStore((state) => state.addCareNoteComment);
  const isLoading = useProviderStore((state) => state.isLoading);
  
  // State
  const [note, setNote] = useState<CareNote | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // Find note from store
  useEffect(() => {
    const foundNote = careNotes.find(n => n.id === noteId);
    if (foundNote) {
      setNote(foundNote);
    }
  }, [noteId, careNotes]);
  
  // Fetch comments
  useEffect(() => {
    if (noteId) {
      fetchCareNoteComments(noteId);
    }
  }, [noteId, fetchCareNoteComments]);
  
  // Submit comment
  const handleSubmitComment = async () => {
    if (!newComment.trim() || !noteId || !user) return;
    
    setIsSubmitting(true);
    try {
      await addCareNoteComment({
        careNoteId: noteId,
        authorId: user.id,
        authorType: 'family',
        content: newComment.trim(),
      });
      setNewComment("");
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!note) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  const mood = moodConfig[note.mood];
  const serviceType = note.provider?.serviceType 
    ? serviceTypeConfig[note.provider.serviceType] 
    : null;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
        <div className="h-14 px-4 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <ArrowLeft size={22} className="text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="font-bold text-gray-900 dark:text-white">케어노트</h1>
          <button className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
            <MoreHorizontal size={22} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </header>
      
      {/* Content */}
      <div className="px-4 py-4">
        {/* Provider Info */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: serviceType ? `${serviceType.color}20` : '#f3f4f6' }}
            >
              {serviceType?.emoji || '🏪'}
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-gray-900 dark:text-white">
                {note.provider?.name || '업체'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {format(parseISO(note.date), "yyyy년 M월 d일 (EEEE)", { locale: ko })}
              </p>
            </div>
          </div>
        </div>
        
        {/* Pet & Mood */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {note.pet?.profileImage ? (
                <img 
                  src={note.pet.profileImage} 
                  alt={note.pet.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                  style={{ backgroundColor: note.pet?.color || '#f3f4f6' }}
                >
                  🐕
                </div>
              )}
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {note.pet?.name || '반려동물'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  오늘의 컨디션
                </p>
              </div>
            </div>
            <div 
              className="px-4 py-2 rounded-full flex items-center gap-2"
              style={{ backgroundColor: `${mood.color}20` }}
            >
              <span className="text-2xl">{mood.emoji}</span>
              <span className="font-medium" style={{ color: mood.color }}>
                {mood.label}
              </span>
            </div>
          </div>
          
          {note.moodNote && (
            <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-700 rounded-xl p-3">
              {note.moodNote}
            </p>
          )}
        </div>
        
        {/* Photos */}
        {note.photos && note.photos.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              📸 오늘의 사진
              <span className="text-sm font-normal text-gray-500">
                {note.photos.length}장
              </span>
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {note.photos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentPhotoIndex(idx);
                    setShowPhotoViewer(true);
                  }}
                  className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-700"
                >
                  <img 
                    src={photo} 
                    alt="" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Activities */}
        {note.activities && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">
              🎯 오늘의 활동
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(activityConfig).map(([key, config]) => {
                const isActive = note.activities?.[key as keyof typeof note.activities];
                return (
                  <div
                    key={key}
                    className={`flex flex-col items-center justify-center py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-orange-50 dark:bg-orange-900/30'
                        : 'bg-gray-50 dark:bg-slate-700 opacity-40'
                    }`}
                  >
                    <span className="text-xl mb-1">{config.emoji}</span>
                    <span className={`text-xs ${
                      isActive 
                        ? 'text-orange-600 dark:text-orange-400 font-medium' 
                        : 'text-gray-400'
                    }`}>
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Meals */}
        {note.meals && note.meals.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">
              🍽️ 식사 기록
            </h3>
            <div className="space-y-2">
              {note.meals.map((meal, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {meal.type === 'breakfast' ? '🌅' : meal.type === 'lunch' ? '☀️' : meal.type === 'dinner' ? '🌙' : '🍪'}
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {meal.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {meal.amount && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {meal.amount}g
                      </span>
                    )}
                    <span className={`text-sm ${meal.ateWell ? 'text-green-500' : 'text-orange-500'}`}>
                      {meal.ateWell ? '잘 먹었어요 ✓' : '조금 먹었어요'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Comment from Provider */}
        {note.comment && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">
              💬 선생님 코멘트
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
              {note.comment}
            </p>
          </div>
        )}
        
        {/* Comments Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <MessageCircle size={18} />
            댓글
            {comments.length > 0 && (
              <span className="text-sm font-normal text-gray-500">
                {comments.length}
              </span>
            )}
          </h3>
          
          {comments.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
              아직 댓글이 없어요. 첫 댓글을 남겨보세요!
            </p>
          ) : (
            <div className="space-y-3 mb-4">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Comment Input - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 p-4 safe-area-bottom">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <TextArea
              placeholder="댓글을 입력하세요..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={1}
              className="resize-none"
            />
          </div>
          <Button
            variant="primary"
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || isSubmitting}
            className="rounded-xl px-4"
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </Button>
        </div>
      </div>
      
      {/* Photo Viewer Modal */}
      {showPhotoViewer && note.photos && (
        <PhotoViewer
          photos={note.photos}
          currentIndex={currentPhotoIndex}
          onClose={() => setShowPhotoViewer(false)}
          onPrev={() => setCurrentPhotoIndex(i => Math.max(0, i - 1))}
          onNext={() => setCurrentPhotoIndex(i => Math.min(note.photos!.length - 1, i + 1))}
        />
      )}
      
      <style>{`
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
      `}</style>
    </div>
  );
}

// ============================================
// Comment Item
// ============================================

interface CommentItemProps {
  comment: CareNoteComment;
}

function CommentItem({ comment }: CommentItemProps) {
  return (
    <div className="flex gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
        comment.authorType === 'provider'
          ? 'bg-blue-100 dark:bg-blue-900/30'
          : 'bg-orange-100 dark:bg-orange-900/30'
      }`}>
        {comment.authorType === 'provider' ? '👩‍🏫' : '👨‍👩‍👧'}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {comment.authorName || (comment.authorType === 'provider' ? '선생님' : '보호자')}
          </span>
          <span className="text-xs text-gray-400">
            {format(parseISO(comment.createdAt), "M/d HH:mm")}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {comment.content}
        </p>
      </div>
    </div>
  );
}

// ============================================
// Photo Viewer
// ============================================

interface PhotoViewerProps {
  photos: string[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function PhotoViewer({ photos, currentIndex, onClose, onPrev, onNext }: PhotoViewerProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white"
      >
        <X size={24} />
      </button>
      
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm">
        {currentIndex + 1} / {photos.length}
      </div>
      
      {currentIndex > 0 && (
        <button
          onClick={onPrev}
          className="absolute left-4 p-2 bg-black/50 rounded-full text-white"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      
      <img 
        src={photos[currentIndex]} 
        alt="" 
        className="max-w-full max-h-full object-contain"
      />
      
      {currentIndex < photos.length - 1 && (
        <button
          onClick={onNext}
          className="absolute right-4 p-2 bg-black/50 rounded-full text-white"
        >
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  );
}
