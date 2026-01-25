import { Heart } from "lucide-react";
import { usePetStore } from "../../stores/usePetStore";
import type { Pet } from "../../types/pet";

export default function PetSelector() {
  const pets = usePetStore((state) => state.pets);
  const selectedPetId = usePetStore((state) => state.selectedPetId);
  const setSelectedPetId = usePetStore((state) => state.setSelectedPetId);

  return (
    <div className="px-4 py-4">
      <div className="flex gap-4 overflow-x-auto scrollbar-hide justify-center">
        {pets.map((pet) => (
          <PetAvatar
            key={pet.id}
            pet={pet}
            isSelected={pet.id === selectedPetId}
            onSelect={() => setSelectedPetId(pet.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================
// Pet Avatar Component
// ============================================
interface PetAvatarProps {
  pet: Pet;
  isSelected: boolean;
  onSelect: () => void;
}

function PetAvatar({ pet, isSelected, onSelect }: PetAvatarProps) {
  return (
    <button
      onClick={onSelect}
      className="flex flex-col items-center gap-1.5 flex-shrink-0 transition-all duration-300"
      style={{ transform: isSelected ? "scale(1.05)" : "scale(1)" }}
    >
      {/* Avatar with Dynamic Ring */}
      <div
        className={`relative w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold transition-all duration-300 ${
          isSelected
            ? "ring-[3px] ring-offset-2 dark:ring-offset-slate-900"
            : "opacity-60"
        }`}
        style={{
          backgroundColor: pet.color,
          ringColor: isSelected ? pet.color : "transparent",
        }}
      >
        {pet.profileImage ? (
          <img
            src={pet.profileImage}
            alt={pet.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          pet.name.charAt(0)
        )}
        {isSelected && (
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-md">
            <Heart size={12} fill={pet.color} color={pet.color} />
          </div>
        )}
      </div>
      {/* Name */}
      <span
        className={`text-xs font-semibold ${
          isSelected
            ? "text-gray-900 dark:text-gray-100"
            : "text-gray-400 dark:text-gray-500"
        }`}
      >
        {pet.name}
      </span>
    </button>
  );
}
