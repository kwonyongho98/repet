import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { X, Send, Loader2, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { Modal, Button, TextArea, Input, Select } from '../common';
import MoodSelector from './MoodSelector';
import ActivityChecklist from './ActivityChecklist';
import PhotoUpload from './PhotoUpload';
import { usePartnerStore } from '../../stores/usePartnerStore';
import { useAuthStore } from '../../stores/useAuthStore';
import type {
  CareNote,
  CareNoteFormData,
  CareNoteMeal,
  CareNoteBowel,
  CareMood,
} from '../../types/partner';
import { defaultCareNoteForm, moodConfig } from '../../types/partner';

interface CareNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    petId: string;
    petName: string;
    petImage?: string;
    providerId: string;
    familyId: string;
    serviceName: string;
  };
  existingNote?: CareNote;
  date?: string;
}

export default function CareNoteModal({
  isOpen,
  onClose,
  booking,
  existingNote,
  date = format(new Date(), 'yyyy-MM-dd'),
}: CareNoteModalProps) {
  const user = useAuthStore((state) => state.user);
  const { createCareNote, updateCareNote, deleteCareNote } = usePartnerStore();

  const [form, setForm] = useState<CareNoteFormData>(defaultCareNoteForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMealForm, setShowMealForm] = useState(false);
  const [showBowelForm, setShowBowelForm] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);

  // 기존 노트가 있으면 폼 초기화
  useEffect(() => {
    if (existingNote) {
      setForm({
        mood: existingNote.mood,
        moodNote: existingNote.moodNote || '',
        activities: existingNote.activities,
        meals: existingNote.meals,
        bowelLogs: existingNote.bowelLogs,
        photos: [],
        existingPhotos: existingNote.photos,
        comment: existingNote.comment || '',
      });
    } else {
      setForm(defaultCareNoteForm);
    }
  }, [existingNote, isOpen]);

  const handleSubmit = async () => {
    // 사진 필수 체크
    if (form.photos.length === 0 && form.existingPhotos.length === 0) {
      alert('최소 1장의 사진이 필요합니다.');
      return;
    }

    if (!user) return;

    setIsSubmitting(true);
    try {
      if (existingNote) {
        await updateCareNote(existingNote.id, form, booking.providerId);
      } else {
        await createCareNote(
          booking.id,
          booking.petId,
          booking.providerId,
          booking.familyId,
          date,
          form,
          user.id
        );
      }
      onClose();
    } catch (error) {
      console.error('Error saving care note:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingNote) return;

    setIsSubmitting(true);
    try {
      await deleteCareNote(existingNote.id);
      onClose();
    } catch (error) {
      console.error('Error deleting care note:', error);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
      setIsDeleteConfirm(false);
    }
  };

  // 식사 추가
  const addMeal = (meal: CareNoteMeal) => {
    setForm((prev) => ({
      ...prev,
      meals: [...prev.meals, meal],
    }));
    setShowMealForm(false);
  };

  // 식사 삭제
  const removeMeal = (index: number) => {
    setForm((prev) => ({
      ...prev,
      meals: prev.meals.filter((_, i) => i !== index),
    }));
  };

  // 배변 추가
  const addBowel = (bowel: CareNoteBowel) => {
    setForm((prev) => ({
      ...prev,
      bowelLogs: [...prev.bowelLogs, bowel],
    }));
    setShowBowelForm(false);
  };

  // 배변 삭제
  const removeBowel = (index: number) => {
    setForm((prev) => ({
      ...prev,
      bowelLogs: prev.bowelLogs.filter((_, i) => i !== index),
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="lg">
      <div className="max-h-[85vh] overflow-y-auto -mx-6 px-6">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 pb-4 -mt-2 pt-2 z-10">
          <div className="flex items-center gap-3">
            {/* 펫 이미지 */}
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 dark:bg-slate-700 flex-shrink-0">
              {booking.petImage ? (
                <img
                  src={booking.petImage}
                  alt={booking.petName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  🐕
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {booking.petName}의 알림장
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {format(new Date(date), 'M월 d일 (EEEE)', { locale: ko })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* 폼 내용 */}
        <div className="space-y-6 pb-4">
          {/* 1. 오늘의 기분 */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              오늘의 기분
            </h3>
            <MoodSelector
              value={form.mood}
              onChange={(mood) => setForm((prev) => ({ ...prev, mood }))}
            />
            <Input
              className="mt-3"
              placeholder="기분에 대한 메모 (선택)"
              value={form.moodNote}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, moodNote: e.target.value }))
              }
            />
          </section>

          {/* 2. 활동 체크 */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              활동 체크
            </h3>
            <ActivityChecklist
              value={form.activities}
              onChange={(activities) =>
                setForm((prev) => ({ ...prev, activities }))
              }
            />
          </section>

          {/* 3. 식사 기록 */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                🍽️ 식사 기록
              </h3>
              <button
                type="button"
                onClick={() => setShowMealForm(true)}
                className="text-sm text-orange-500 font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> 추가
              </button>
            </div>

            {form.meals.length > 0 ? (
              <div className="space-y-2">
                {form.meals.map((meal, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500">
                        {meal.time}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
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
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          meal.ateWell
                            ? 'bg-green-100 text-green-600'
                            : 'bg-orange-100 text-orange-600'
                        }`}
                      >
                        {meal.ateWell ? '잘 먹음' : '조금 먹음'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMeal(index)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                식사 기록이 없습니다
              </p>
            )}
          </section>

          {/* 4. 배변 기록 */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                💩 배변 기록
              </h3>
              <button
                type="button"
                onClick={() => setShowBowelForm(true)}
                className="text-sm text-orange-500 font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> 추가
              </button>
            </div>

            {form.bowelLogs.length > 0 ? (
              <div className="space-y-2">
                {form.bowelLogs.map((bowel, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500">
                        {bowel.time}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {bowel.type === 'urine'
                          ? '소변'
                          : bowel.type === 'feces'
                          ? '대변'
                          : '소변+대변'}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          bowel.condition === 'good'
                            ? 'bg-green-100 text-green-600'
                            : bowel.condition === 'loose'
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-orange-100 text-orange-600'
                        }`}
                      >
                        {bowel.condition === 'good'
                          ? '정상'
                          : bowel.condition === 'loose'
                          ? '무름'
                          : '딱딱함'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeBowel(index)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                배변 기록이 없습니다
              </p>
            )}
          </section>

          {/* 5. 사진 업로드 */}
          <section>
            <PhotoUpload
              photos={form.photos}
              existingPhotos={form.existingPhotos}
              onPhotosChange={(photos) =>
                setForm((prev) => ({ ...prev, photos }))
              }
              onExistingPhotosChange={(existingPhotos) =>
                setForm((prev) => ({ ...prev, existingPhotos }))
              }
              maxPhotos={5}
              required
            />
          </section>

          {/* 6. 코멘트 */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              💬 오늘의 코멘트
            </h3>
            <TextArea
              placeholder="오늘 하루 어떻게 보냈는지 보호자님께 알려주세요..."
              value={form.comment}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, comment: e.target.value }))
              }
              rows={4}
            />
          </section>
        </div>

        {/* 하단 버튼 */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-800 pt-4 pb-2 border-t border-gray-100 dark:border-slate-700 -mx-6 px-6">
          <div className="flex gap-3">
            {existingNote && (
              <Button
                variant="danger"
                onClick={() => setIsDeleteConfirm(true)}
                disabled={isSubmitting}
              >
                삭제
              </Button>
            )}
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  {existingNote ? '수정 완료' : '알림장 보내기'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 식사 추가 모달 */}
      <MealFormModal
        isOpen={showMealForm}
        onClose={() => setShowMealForm(false)}
        onAdd={addMeal}
      />

      {/* 배변 추가 모달 */}
      <BowelFormModal
        isOpen={showBowelForm}
        onClose={() => setShowBowelForm(false)}
        onAdd={addBowel}
      />

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={isDeleteConfirm}
        onClose={() => setIsDeleteConfirm(false)}
        title="알림장 삭제"
        maxWidth="sm"
      >
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          정말 이 알림장을 삭제하시겠습니까?
          <br />
          삭제된 알림장은 복구할 수 없습니다.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setIsDeleteConfirm(false)}
          >
            취소
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : '삭제'}
          </Button>
        </div>
      </Modal>
    </Modal>
  );
}

// ============================================
// 식사 추가 모달
// ============================================
function MealFormModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (meal: CareNoteMeal) => void;
}) {
  const [meal, setMeal] = useState<CareNoteMeal>({
    time: format(new Date(), 'HH:mm'),
    type: 'breakfast',
    amount: 100,
    ateWell: true,
  });

  const handleSubmit = () => {
    onAdd(meal);
    setMeal({
      time: format(new Date(), 'HH:mm'),
      type: 'breakfast',
      amount: 100,
      ateWell: true,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="식사 기록 추가" maxWidth="sm">
      <div className="space-y-4">
        <Input
          label="시간"
          type="time"
          value={meal.time}
          onChange={(e) => setMeal((prev) => ({ ...prev, time: e.target.value }))}
        />
        <Select
          label="식사 종류"
          value={meal.type}
          onChange={(e) =>
            setMeal((prev) => ({
              ...prev,
              type: e.target.value as CareNoteMeal['type'],
            }))
          }
          options={[
            { value: 'breakfast', label: '아침' },
            { value: 'lunch', label: '점심' },
            { value: 'dinner', label: '저녁' },
            { value: 'snack', label: '간식' },
          ]}
        />
        <Input
          label="급여량 (g)"
          type="number"
          value={meal.amount.toString()}
          onChange={(e) =>
            setMeal((prev) => ({ ...prev, amount: parseInt(e.target.value) || 0 }))
          }
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMeal((prev) => ({ ...prev, ateWell: true }))}
            className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
              meal.ateWell
                ? 'border-green-500 bg-green-50 text-green-600'
                : 'border-gray-200 text-gray-500'
            }`}
          >
            😋 잘 먹음
          </button>
          <button
            type="button"
            onClick={() => setMeal((prev) => ({ ...prev, ateWell: false }))}
            className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
              !meal.ateWell
                ? 'border-orange-500 bg-orange-50 text-orange-600'
                : 'border-gray-200 text-gray-500'
            }`}
          >
            😐 조금 먹음
          </button>
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            취소
          </Button>
          <Button variant="primary" className="flex-1" onClick={handleSubmit}>
            추가
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================
// 배변 추가 모달
// ============================================
function BowelFormModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (bowel: CareNoteBowel) => void;
}) {
  const [bowel, setBowel] = useState<CareNoteBowel>({
    time: format(new Date(), 'HH:mm'),
    type: 'both',
    condition: 'good',
  });

  const handleSubmit = () => {
    onAdd(bowel);
    setBowel({
      time: format(new Date(), 'HH:mm'),
      type: 'both',
      condition: 'good',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="배변 기록 추가" maxWidth="sm">
      <div className="space-y-4">
        <Input
          label="시간"
          type="time"
          value={bowel.time}
          onChange={(e) =>
            setBowel((prev) => ({ ...prev, time: e.target.value }))
          }
        />
        <Select
          label="종류"
          value={bowel.type}
          onChange={(e) =>
            setBowel((prev) => ({
              ...prev,
              type: e.target.value as CareNoteBowel['type'],
            }))
          }
          options={[
            { value: 'urine', label: '소변' },
            { value: 'feces', label: '대변' },
            { value: 'both', label: '소변 + 대변' },
          ]}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            상태
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'good', label: '정상', emoji: '✅' },
              { value: 'loose', label: '무름', emoji: '💧' },
              { value: 'hard', label: '딱딱함', emoji: '🪨' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setBowel((prev) => ({
                    ...prev,
                    condition: option.value as CareNoteBowel['condition'],
                  }))
                }
                className={`py-3 rounded-xl border-2 font-medium transition-all ${
                  bowel.condition === option.value
                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                    : 'border-gray-200 text-gray-500'
                }`}
              >
                {option.emoji} {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            취소
          </Button>
          <Button variant="primary" className="flex-1" onClick={handleSubmit}>
            추가
          </Button>
        </div>
      </div>
    </Modal>
  );
}
