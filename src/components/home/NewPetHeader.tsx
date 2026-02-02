import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePetStore } from "../../stores/usePetStore";
import type { Pet } from "../../types/pet";

// ============================================
// NewPetHeader - 새로운 펫 헤더 (사진 + 정보 + 스와이프)
// ============================================
export default function NewPetHeader() {
  const pets = usePetStore((state) => state.pets);
  const selectedPetId = usePetStore((state) => state.selectedPetId);
  const setSelectedPetId = usePetStore((state) => state.setSelectedPetId);

  const selectedPet = pets.find((p) => p.id === selectedPetId);
  const currentIndex = pets.findIndex((p) => p.id === selectedPetId);

  // 펫 전환
  const goToPrevPet = () => {
    if (currentIndex > 0) {
      setSelectedPetId(pets[currentIndex - 1].id);
    } else {
      setSelectedPetId(pets[pets.length - 1].id); // 순환
    }
  };

  const goToNextPet = () => {
    if (currentIndex < pets.length - 1) {
      setSelectedPetId(pets[currentIndex + 1].id);
    } else {
      setSelectedPetId(pets[0].id); // 순환
    }
  };

  // 나이 계산 (생일 기준)
  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (!selectedPet) return null;

  const age = calculateAge(selectedPet.birthDate);
  const genderEmoji = selectedPet.gender === "male" ? "♂" : "♀";

  return (
    <div className="px-4 py-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-4">
          {/* 좌측: 펫 프로필 사진 */}
          <div
            className="relative w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-md"
            style={{ backgroundColor: selectedPet.color }}
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
          </div>

          {/* 중앙: 펫 정보 */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
              {selectedPet.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-sm font-medium ${
                  selectedPet.gender === "male"
                    ? "text-blue-500"
                    : "text-pink-500"
                }`}
              >
                {genderEmoji}
              </span>
              {age !== null && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {age}살
                </span>
              )}
              {selectedPet.breed && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {selectedPet.breed}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* 우측: 펫 전환 버튼 (여러 마리일 때만) */}
          {pets.length > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={goToPrevPet}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft size={20} className="text-gray-400" />
              </button>
              <button
                onClick={goToNextPet}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronRight size={20} className="text-gray-400" />
              </button>
            </div>
          )}
        </div>

        {/* 펫 인디케이터 (여러 마리일 때만) */}
        {pets.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {pets.map((pet, idx) => (
              <button
                key={pet.id}
                onClick={() => setSelectedPetId(pet.id)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? "bg-orange-500 w-4"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
