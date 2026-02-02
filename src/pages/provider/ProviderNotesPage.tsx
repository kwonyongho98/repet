import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Search,
  ChevronRight,
  Clock,
  CheckCircle,
  Camera,
  X,
  Loader2,
  Send,
  ArrowLeft,
} from "lucide-react";
import { useProviderStore } from "../../stores/useProviderStore";
import type {
  ConnectedPet,
  CareNoteFormData,
  CareMood,
  CareActivities,
} from "../../types/provider";
import { moodConfig, activityConfig } from "../../types/provider";

// Default form data
const getDefaultFormData = (): CareNoteFormData => ({
  petId: "",
  familyId: "",
  date: format(new Date(), "yyyy-MM-dd"),
  mood: "normal",
  moodNote: "",
  activities: {
    nap: false,
    snack: false,
    play: false,
    walk: false,
    grooming: false,
    training: false,
    socialization: false,
  },
  meals: [],
  bowelLogs: [],
  photos: [],
  existingPhotos: [],
  comment: "",
});

export default function ProviderNotesPage() {
  const connectedPets = useProviderStore((state) => state.connectedPets);
  const careNotes = useProviderStore((state) => state.careNotes);
  const isLoading = useProviderStore((state) => state.isLoading);
  const fetchConnectedPets = useProviderStore(
    (state) => state.fetchConnectedPets,
  );
  const fetchCareNotes = useProviderStore((state) => state.fetchCareNotes);
  const createCareNote = useProviderStore((state) => state.createCareNote);
  const myProvider = useProviderStore((state) => state.myProvider);

  const [selectedPet, setSelectedPet] = useState<ConnectedPet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] =
    useState<CareNoteFormData>(getDefaultFormData());
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data on mount
  useEffect(() => {
    fetchConnectedPets();
    if (myProvider) {
      fetchCareNotes({ providerId: myProvider.id });
    }
  }, [fetchConnectedPets, fetchCareNotes, myProvider]);

  // 안전한 pets 배열 (undefined 방지)
  const safePets = Array.isArray(connectedPets) ? connectedPets : [];

  // Filter pets by search - with safe null/undefined checks
  const filteredPets = safePets.filter((pet) => {
    if (!pet) return false;
    const query = (searchQuery || "").toLowerCase();
    if (!query) return true;
    const petName = (pet.petName || pet.name || "").toLowerCase();
    const familyName = (
      pet.familyName ||
      pet.family?.name ||
      ""
    ).toLowerCase();

    return petName.includes(query) || familyName.includes(query);
  });

  // Open modal for specific pet
  const handleWriteNote = (pet: ConnectedPet) => {
    setSelectedPet(pet);
    setFormData({
      ...getDefaultFormData(),
      petId: pet.petId || pet.id,
      familyId: pet.familyId || pet.family?.id || "",
    });
    setIsModalOpen(true);
  };

  // Toggle activity
  const toggleActivity = (key: keyof CareActivities) => {
    setFormData((prev) => ({
      ...prev,
      activities: {
        ...prev.activities,
        [key]: !prev.activities[key],
      },
    }));
  };

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (formData.photos.length + files.length > 5) {
      alert("사진은 최대 5장까지 업로드할 수 있습니다.");
      return;
    }
    // Convert files to URLs for preview (실제 구현에서는 Supabase Storage로 업로드)
    const newPhotos = files.map((file) => URL.createObjectURL(file));
    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos],
    }));
  };

  // Remove photo
  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  // Submit care note (알림장 보내기)
  const handleSubmit = async () => {
    if (!formData.petId || !formData.familyId) {
      alert("펫 또는 가족 정보가 없습니다.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await createCareNote(formData);
      if (result) {
        alert("알림장이 성공적으로 전송되었습니다! 🎉");
        setIsModalOpen(false);
        setFormData(getDefaultFormData());
        setSelectedPet(null);
        // Refresh pets to update hasTodayCareNote
        fetchConnectedPets();
        if (myProvider) {
          fetchCareNotes({ providerId: myProvider.id });
        }
      } else {
        alert("알림장 전송에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("Create care note error:", error);
      alert("알림장 전송 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 펫 이름 가져오기 헬퍼
  const getPetDisplayName = (pet: ConnectedPet | null | undefined) => {
    if (!pet) return "이름 없음";
    return pet.petName || pet.name || "이름 없음";
  };

  const getPetDisplayBreed = (pet: ConnectedPet | null | undefined) => {
    if (!pet) return "품종 미상";
    return pet.petBreed || pet.breed || "품종 미상";
  };

  const getFamilyDisplayName = (pet: ConnectedPet | null | undefined) => {
    if (!pet) return "가족 정보 없음";
    return pet.familyName || pet.family?.name || "가족 정보 없음";
  };

  // 안전한 careNotes 배열
  const safeCareNotes = Array.isArray(careNotes) ? careNotes : [];

  return (
    <div className="min-h-full bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-4 py-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          📝 알림장 작성
        </h1>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="아이 이름 또는 보호자 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Pet List */}
      <div className="p-4">
        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          오늘의 아이들 ({filteredPets.length})
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : filteredPets.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🐾</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              연결된 아이가 없습니다.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPets.map((pet) => (
              <div
                key={pet.connectionId || pet.petId || pet.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  {/* Pet Avatar */}
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0 bg-indigo-500">
                    {pet.petImage || pet.profileImage ? (
                      <img
                        src={pet.petImage || pet.profileImage || ""}
                        alt={getPetDisplayName(pet)}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      (getPetDisplayName(pet) || "?").charAt(0)
                    )}
                  </div>

                  {/* Pet Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {getPetDisplayName(pet)}
                      </h3>
                      {pet.hasTodayCareNote && (
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium rounded-full flex items-center gap-1">
                          <CheckCircle size={12} />
                          작성완료
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {getPetDisplayBreed(pet)} · {getFamilyDisplayName(pet)}
                    </p>
                    {pet.allergies && pet.allergies.length > 0 && (
                      <p className="text-xs text-red-500 mt-1">
                        ⚠️ 알러지: {pet.allergies.join(", ")}
                      </p>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleWriteNote(pet)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      pet.hasTodayCareNote
                        ? "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-600"
                        : "bg-orange-500 text-white border border-orange-500 hover:bg-orange-600"
                    }`}
                  >
                    {pet.hasTodayCareNote ? "수정" : "작성"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Notes */}
      {safeCareNotes.length > 0 && (
        <div className="p-4 pt-0">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            최근 작성한 알림장
          </h2>
          <div className="space-y-2">
            {safeCareNotes.slice(0, 5).map((note) => (
              <div
                key={note.id}
                className="bg-white dark:bg-slate-800 rounded-xl p-3 flex items-center gap-3"
              >
                <div className="text-2xl">
                  {moodConfig[note.mood]?.emoji ?? "😊"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {note.petName || note.pet?.name || "알 수 없음"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(note.date), "M월 d일 (EEE)", {
                      locale: ko,
                    })}
                  </p>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 전체화면 알림장 작성 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 overflow-hidden flex flex-col">
          {/* 헤더 */}
          <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex-1">
              {getPetDisplayName(selectedPet)} 알림장
            </h2>
          </div>

          {/* 바디 - 스크롤 가능 */}
          <div className="flex-1 overflow-y-auto p-4 pb-24">
            <div className="space-y-6 max-w-lg mx-auto">
              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  날짜
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-700 rounded-xl border border-gray-200 dark:border-slate-600">
                  <Clock size={18} className="text-gray-400" />
                  <span className="text-gray-900 dark:text-white">
                    {format(new Date(formData.date), "yyyy년 M월 d일 (EEE)", {
                      locale: ko,
                    })}
                  </span>
                </div>
              </div>

              {/* Mood Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  오늘의 기분
                </label>
                <div className="flex gap-2">
                  {(
                    Object.entries(moodConfig) as [
                      CareMood,
                      (typeof moodConfig)[CareMood],
                    ][]
                  ).map(([mood, config]) => (
                    <button
                      key={mood}
                      onClick={() => setFormData((prev) => ({ ...prev, mood }))}
                      className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 transition-all border-2 ${
                        formData.mood === mood
                          ? "bg-orange-50 dark:bg-orange-900/30 border-orange-500"
                          : "bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
                      }`}
                    >
                      <span className="text-2xl">{config.emoji}</span>
                      <span
                        className={`text-xs font-medium ${
                          formData.mood === mood
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {config.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Activities */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  오늘의 활동
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(
                    Object.entries(activityConfig) as [
                      keyof CareActivities,
                      (typeof activityConfig)[keyof CareActivities],
                    ][]
                  ).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => toggleActivity(key)}
                      className={`py-3 rounded-xl flex flex-col items-center gap-1 transition-all border-2 ${
                        formData.activities[key]
                          ? "bg-green-50 dark:bg-green-900/30 border-green-500"
                          : "bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
                      }`}
                    >
                      <span className="text-xl">{config.emoji}</span>
                      <span
                        className={`text-xs font-medium ${
                          formData.activities[key]
                            ? "text-green-600 dark:text-green-400"
                            : "text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {config.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Photos */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  사진 ({formData.photos.length}/5)
                </label>
                <div className="flex gap-2 flex-wrap">
                  {formData.photos.map((photo, index) => (
                    <div key={`photo-${index}`} className="relative w-20 h-20">
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover rounded-xl border border-gray-200 dark:border-slate-600"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}

                  {formData.photos.length < 5 && (
                    <label className="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                      <Camera size={24} className="text-gray-400" />
                      <span className="text-xs text-gray-400 mt-1">추가</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  오늘의 한마디
                </label>
                <textarea
                  value={formData.comment || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }
                  placeholder="보호자님께 전할 이야기를 적어주세요..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 하단 고정 버튼 */}
          <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 p-4 safe-area-inset-bottom">
            <div className="flex gap-3 max-w-lg mx-auto">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-3 rounded-xl text-base font-semibold bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="flex-1 px-4 py-3 rounded-xl text-base font-semibold bg-orange-500 text-white border border-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    전송중...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    알림장 보내기
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
