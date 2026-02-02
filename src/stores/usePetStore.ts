import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Pet } from '../types/pet';
import type { Database } from '../types/database';
import { supabase, uploadImage, deleteImage } from '../lib/supabase';

// Type aliases for type-safe inserts/updates
type PetInsert = Database['public']['Tables']['pets']['Insert'];
type PetUpdate = Database['public']['Tables']['pets']['Update'];

interface PetState {
  pets: Pet[];
  isLoading: boolean;
  error: string | null;
  
  // Global Pet Filter
  selectedPetId: string;
  setSelectedPetId: (id: string) => void;
  getSelectedPet: () => Pet | undefined;
  
  // Fetch from Supabase
  fetchPets: (familyId: string) => Promise<void>;
  
  // CRUD
  addPet: (pet: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePet: (id: string, pet: Partial<Pet>) => Promise<void>;
  deletePet: (id: string) => Promise<void>;
  getPetById: (id: string) => Pet | undefined;
  
  // 🔥 NEW: Image upload
  uploadPetImage: (petId: string, file: File) => Promise<string | null>;
  removePetImage: (petId: string) => Promise<void>;
  
  // Clear
  clearPets: () => void;
}

export const usePetStore = create<PetState>()(
  persist(
    (set, get) => ({
      pets: [],
      isLoading: false,
      error: null,
      selectedPetId: '',

      setSelectedPetId: (id) => {
        set({ selectedPetId: id });
      },

      getSelectedPet: () => {
        const state = get();
        return state.pets.find((pet) => pet.id === state.selectedPetId);
      },

      // ============================================
      // Fetch pets from Supabase
      // ============================================
      fetchPets: async (familyId: string) => {
        if (!familyId) {
          set({ pets: [], isLoading: false });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const { data, error } = await supabase
            .from('pets')
            .select(`
              *,
              pet_allergies (id, allergy_name, severity, notes),
              vaccination_records (id, vaccine_name, date, next_due_date, veterinarian, notes)
            `)
            .eq('family_id', familyId)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Fetch pets error:', error);
            set({ error: error.message, isLoading: false });
            return;
          }

          const pets: Pet[] = (data || []).map((pet: any) => ({
            id: pet.id,
            name: pet.name,
            species: pet.species,
            breed: pet.breed,
            birthDate: pet.birth_date,
            gender: pet.gender,
            weight: pet.weight,
            color: pet.color || '#3B82F6',
            profileImage: pet.profile_image,
            microchipId: pet.microchip_id,
            notes: pet.notes,
            allergies: pet.pet_allergies?.map((a: any) => a.allergy_name) || [],
            vaccinationHistory: pet.vaccination_records?.map((v: any) => ({
              id: v.id,
              vaccineName: v.vaccine_name,
              date: v.date,
              nextDueDate: v.next_due_date,
              veterinarian: v.veterinarian,
              notes: v.notes,
            })) || [],
            createdAt: pet.created_at,
            updatedAt: pet.updated_at,
          }));

          const currentSelected = get().selectedPetId;
          const newSelectedId = pets.length > 0 
            ? (pets.find(p => p.id === currentSelected) ? currentSelected : pets[0].id)
            : '';

          set({ 
            pets, 
            isLoading: false,
            selectedPetId: newSelectedId,
          });
        } catch (error) {
          console.error('Fetch pets error:', error);
          set({ error: 'Failed to fetch pets', isLoading: false });
        }
      },

      // ============================================
      // Add pet
      // ============================================
      addPet: async (petData) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('family_id')
          .eq('id', user.id)
          .single();

        if (!profile?.family_id) return;

        try {
          const petInsert: PetInsert = {
            family_id: profile.family_id,
            name: petData.name,
            species: petData.species,
            breed: petData.breed,
            birth_date: petData.birthDate,
            gender: petData.gender,
            weight: petData.weight,
            color: petData.color || '#3B82F6',
            profile_image: petData.profileImage || null,
            microchip_id: petData.microchipId || null,
            notes: petData.notes || null,
          };

          const { data, error } = await supabase
            .from('pets')
            .insert(petInsert)
            .select()
            .single();

          if (error) {
            console.error('Add pet error:', error);
            return;
          }

          const newPet: Pet = {
            id: data.id,
            name: data.name,
            species: data.species,
            breed: data.breed,
            birthDate: data.birth_date,
            gender: data.gender,
            weight: data.weight,
            color: data.color,
            profileImage: data.profile_image,
            microchipId: data.microchip_id,
            notes: data.notes,
            allergies: [],
            vaccinationHistory: [],
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };

          set((state) => {
            const newPets = [...state.pets, newPet];
            const selectedPetId = state.selectedPetId || newPet.id;
            return { pets: newPets, selectedPetId };
          });
        } catch (error) {
          console.error('Add pet error:', error);
        }
      },

      // ============================================
      // Update pet
      // ============================================
      updatePet: async (id, petData) => {
        try {
          const petUpdate: PetUpdate = {};
          
          if (petData.name !== undefined) petUpdate.name = petData.name;
          if (petData.species !== undefined) petUpdate.species = petData.species;
          if (petData.breed !== undefined) petUpdate.breed = petData.breed;
          if (petData.birthDate !== undefined) petUpdate.birth_date = petData.birthDate;
          if (petData.gender !== undefined) petUpdate.gender = petData.gender;
          if (petData.weight !== undefined) petUpdate.weight = petData.weight;
          if (petData.color !== undefined) petUpdate.color = petData.color;
          if (petData.profileImage !== undefined) petUpdate.profile_image = petData.profileImage || null;
          if (petData.microchipId !== undefined) petUpdate.microchip_id = petData.microchipId || null;
          if (petData.notes !== undefined) petUpdate.notes = petData.notes || null;

          const { error } = await supabase
            .from('pets')
            .update(petUpdate)
            .eq('id', id);

          if (error) {
            console.error('Update pet error:', error);
            return;
          }

          set((state) => ({
            pets: state.pets.map((pet) =>
              pet.id === id
                ? { ...pet, ...petData, updatedAt: new Date().toISOString() }
                : pet
            ),
          }));
        } catch (error) {
          console.error('Update pet error:', error);
        }
      },

      // ============================================
      // 🔥 NEW: Upload pet profile image
      // ============================================
      uploadPetImage: async (petId: string, file: File) => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return null;

          // 파일 확장자 추출
          const ext = file.name.split('.').pop() || 'jpg';
          // 고유 경로: userId/petId/timestamp.ext
          const path = `${user.id}/${petId}/${Date.now()}.${ext}`;

          // Supabase Storage에 업로드
          const publicUrl = await uploadImage('PET_IMAGES', file, path);
          if (!publicUrl) return null;

          // DB의 profile_image 필드 업데이트
          const { error } = await supabase
            .from('pets')
            .update({ profile_image: publicUrl })
            .eq('id', petId);

          if (error) {
            console.error('Update pet image error:', error);
            return null;
          }

          // 로컬 상태 업데이트
          set((state) => ({
            pets: state.pets.map((pet) =>
              pet.id === petId
                ? { ...pet, profileImage: publicUrl, updatedAt: new Date().toISOString() }
                : pet
            ),
          }));

          return publicUrl;
        } catch (error) {
          console.error('Upload pet image error:', error);
          return null;
        }
      },

      // ============================================
      // 🔥 NEW: Remove pet profile image
      // ============================================
      removePetImage: async (petId: string) => {
        try {
          const pet = get().pets.find(p => p.id === petId);
          if (!pet?.profileImage) return;

          // Storage에서 파일 삭제 (URL에서 경로 추출)
          try {
            const url = new URL(pet.profileImage);
            const pathMatch = url.pathname.match(/\/pet-images\/(.+)/);
            if (pathMatch) {
              await deleteImage('PET_IMAGES', pathMatch[1]);
            }
          } catch {
            // URL 파싱 실패해도 DB는 업데이트
          }

          // DB 업데이트
          const { error } = await supabase
            .from('pets')
            .update({ profile_image: null })
            .eq('id', petId);

          if (error) {
            console.error('Remove pet image error:', error);
            return;
          }

          // 로컬 상태 업데이트
          set((state) => ({
            pets: state.pets.map((p) =>
              p.id === petId
                ? { ...p, profileImage: undefined, updatedAt: new Date().toISOString() }
                : p
            ),
          }));
        } catch (error) {
          console.error('Remove pet image error:', error);
        }
      },

      // ============================================
      // Delete pet
      // ============================================
      deletePet: async (id) => {
        try {
          // 펫 삭제 시 이미지도 함께 삭제
          const pet = get().pets.find(p => p.id === id);
          if (pet?.profileImage) {
            try {
              const url = new URL(pet.profileImage);
              const pathMatch = url.pathname.match(/\/pet-images\/(.+)/);
              if (pathMatch) {
                await deleteImage('PET_IMAGES', pathMatch[1]);
              }
            } catch {
              // 이미지 삭제 실패해도 펫 삭제는 진행
            }
          }

          const { error } = await supabase
            .from('pets')
            .delete()
            .eq('id', id);

          if (error) {
            console.error('Delete pet error:', error);
            return;
          }

          set((state) => {
            const newPets = state.pets.filter((pet) => pet.id !== id);
            const newSelectedId = state.selectedPetId === id
              ? (newPets[0]?.id || '')
              : state.selectedPetId;
            return { pets: newPets, selectedPetId: newSelectedId };
          });
        } catch (error) {
          console.error('Delete pet error:', error);
        }
      },

      getPetById: (id) => {
        return get().pets.find((pet) => pet.id === id);
      },

      clearPets: () => {
        set({ pets: [], selectedPetId: '', isLoading: false, error: null });
      },
    }),
    {
      name: 'pet-storage',
      partialize: (state) => ({
        selectedPetId: state.selectedPetId,
      }),
    }
  )
);
