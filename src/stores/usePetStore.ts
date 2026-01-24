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
          allergies: ["닭고기", "밀"],
          vaccinationHistory: [
            {
              id: "v1",
              vaccineName: "종합백신(DHPPL)",
              date: "2023-03-15",
              nextDueDate: "2024-03-15",
              veterinarian: "해피동물병원",
              notes: "1차 접종 완료",
            },
            {
              id: "v2",
              vaccineName: "광견병",
              date: "2023-04-20",
              nextDueDate: "2024-04-20",
              veterinarian: "해피동물병원",
            },
          ],
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
          allergies: [],
          vaccinationHistory: [
            {
              id: "v3",
              vaccineName: "종합백신(DHPPL)",
              date: "2024-08-20",
              nextDueDate: "2025-08-20",
              veterinarian: "사랑동물병원",
              notes: "1차 접종",
            },
          ],
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
