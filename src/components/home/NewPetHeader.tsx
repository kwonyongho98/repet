import { useState, useRef, TouchEvent, ChangeEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePetStore } from "../../stores/usePetStore";

// ============================================
// NewPetHeader v5 - 프로필 사진 탭하면 변경 가능
// ============================================
export default function NewPetHeader() {
  const pets = usePetStore((state) => state.pets);
  const selectedPetId = usePetStore((state) => state.selectedPetId);
  const setSelectedPetId = usePetStore((state) => state.setSelectedPetId);
  const uploadPetImage = usePetStore((state) => state.uploadPetImage);

  const selectedPet = pets.find((p) => p.id === selectedPetId);
  const currentIndex = pets.findIndex((p) => p.id === selectedPetId);

  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const goToPrevPet = () => {
    if (isAnimating || pets.length <= 1) return;
    setIsAnimating(true);
    setSlideDirection("right");
    setTimeout(() => {
      setSelectedPetId(currentIndex > 0 ? pets[currentIndex - 1].id : pets[pets.length - 1].id);
      setSlideDirection(null);
      setIsAnimating(false);
    }, 200);
  };

  const goToNextPet = () => {
    if (isAnimating || pets.length <= 1) return;
    setIsAnimating(true);
    setSlideDirection("left");
    setTimeout(() => {
      setSelectedPetId(currentIndex < pets.length - 1 ? pets[currentIndex + 1].id : pets[0].id);
      setSlideDirection(null);
      setIsAnimating(false);
    }, 200);
  };

  const handleTouchStart = (e: TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchMove = (e: TouchEvent) => { touchEndX.current = e.touches[0].clientX; };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) { diff > 0 ? goToNextPet() : goToPrevPet(); }
  };

  // 🔥 프로필 사진 클릭 → 파일 선택
  const handleProfileClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  // 🔥 파일 선택 → 즉시 업로드
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPet) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 크기는 5MB 이하여야 합니다.');
      return;
    }

    setIsUploading(true);
    try {
      await uploadPetImage(selectedPet.id, file);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  if (!selectedPet) return null;

  const age = calculateAge(selectedPet.birthDate);
  const isMale = selectedPet.gender === "male";

  return (
    <div className="px-4 pt-3 pb-1">
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-orange-200 dark:border-orange-800/50 p-4 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`flex items-center gap-4 transition-all duration-200 ${
            slideDirection === "left" ? "-translate-x-6 opacity-0"
              : slideDirection === "right" ? "translate-x-6 opacity-0"
              : "translate-x-0 opacity-100"
          }`}
        >
          {/* 🔥 프로필 사진 (클릭하면 변경) */}
          <button
            type="button"
            onClick={handleProfileClick}
            disabled={isUploading}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-md ring-3 ring-orange-200 dark:ring-orange-800/50 relative overflow-hidden group transition-all ${
              isUploading ? 'opacity-60' : 'cursor-pointer'
            }`}
            style={{ backgroundColor: selectedPet.profileImage ? 'transparent' : (selectedPet.color || "#F97316") }}
          >
            {selectedPet.profileImage ? (
              <img
                src={selectedPet.profileImage}
                alt={selectedPet.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              selectedPet.name.charAt(0)
            )}

            {/* 호버 카메라 오버레이 */}
            {!isUploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
            )}

            {/* 업로드 스피너 */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>

          {/* 히든 파일 인풋 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* 이름 + 정보 태그 */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {selectedPet.name}
            </h1>
            <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
              <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                isMale ? "bg-blue-50 dark:bg-blue-950/40 text-blue-500" : "bg-pink-50 dark:bg-pink-950/40 text-pink-500"
              }`}>
                {isMale ? "♂ 남아" : "♀ 여아"}
              </span>
              {age !== null && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
                  🎂 {age}살
                </span>
              )}
              {selectedPet.breed && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
                  {selectedPet.breed}
                </span>
              )}
            </div>
          </div>

          {/* 펫 전환 */}
          {pets.length > 1 && (
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button onClick={goToPrevPet} disabled={isAnimating} className="p-1.5 rounded-full hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-30">
                <ChevronLeft size={18} className="text-orange-400" />
              </button>
              <button onClick={goToNextPet} disabled={isAnimating} className="p-1.5 rounded-full hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-30">
                <ChevronRight size={18} className="text-orange-400" />
              </button>
            </div>
          )}
        </div>

        {pets.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {pets.map((pet, idx) => (
              <button
                key={pet.id}
                onClick={() => !isAnimating && setSelectedPetId(pet.id)}
                className={`rounded-full transition-all duration-300 ${
                  idx === currentIndex ? "bg-orange-500 w-5 h-1.5" : "bg-gray-300 dark:bg-gray-600 w-1.5 h-1.5 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
