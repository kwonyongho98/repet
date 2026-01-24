import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Pet } from "../types/pet";

interface PetState {
  pets: Pet[];
  addPet: (pet: Omit<Pet, "id" | "createdAt" | "updatedAt">) => void;
  updatePet: (id: string, pet: Partial<Pet>) => void;
  deletePet: (id: string) => void;
  getPetById: (id: string) => Pet | undefined;
}

export const usePetStore = create<PetState>()(
  persist(
    (set, get) => ({
      pets: [
        {
          id: "1",
          name: "멍멍이",
          species: "개",
          breed: "골든 리트리버",
          birthDate: "2023-01-15",
          gender: "male",
          weight: 30,
          color: "#3B82F6",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "뭉치",
          species: "개",
          breed: "포메라니안",
          birthDate: "2024-06-20",
          gender: "female",
          weight: 3.5,
          color: "#10B981",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],

      addPet: (petData) => {
        const newPet: Pet = {
          ...petData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ pets: [...state.pets, newPet] }));
      },

      updatePet: (id, petData) => {
        set((state) => ({
          pets: state.pets.map((pet) =>
            pet.id === id
              ? { ...pet, ...petData, updatedAt: new Date().toISOString() }
              : pet,
          ),
        }));
      },

      deletePet: (id) => {
        set((state) => ({ pets: state.pets.filter((pet) => pet.id !== id) }));
      },

      getPetById: (id) => {
        return get().pets.find((pet) => pet.id === id);
      },
    }),
    {
      name: "pet-storage", // localStorage key
    },
  ),
);
