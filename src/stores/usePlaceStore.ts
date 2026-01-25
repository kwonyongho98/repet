import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ServiceProvider } from "../types/service";

// 최근 본 장소 타입 (간단한 정보만 저장)
export interface RecentPlace {
  id: string;
  name: string;
  type: ServiceProvider["type"];
  address: string;
  rating: number;
  viewedAt: string; // ISO date string
}

interface PlaceState {
  // 저장한 장소 (좋아요)
  savedPlaceIds: string[];
  
  // 최근 본 장소
  recentPlaces: RecentPlace[];

  // Actions
  toggleSave: (placeId: string) => void;
  isSaved: (placeId: string) => boolean;
  addRecent: (provider: ServiceProvider) => void;
  removeRecent: (placeId: string) => void;
  clearRecentPlaces: () => void;
  clearSavedPlaces: () => void;
}

const MAX_RECENT_PLACES = 15;

export const usePlaceStore = create<PlaceState>()(
  persist(
    (set, get) => ({
      savedPlaceIds: [],
      recentPlaces: [],

      // 저장(좋아요) 토글
      toggleSave: (placeId: string) => {
        const { savedPlaceIds } = get();
        const isCurrentlySaved = savedPlaceIds.includes(placeId);

        if (isCurrentlySaved) {
          // 저장 취소
          set({
            savedPlaceIds: savedPlaceIds.filter((id) => id !== placeId),
          });
        } else {
          // 저장 추가
          set({
            savedPlaceIds: [...savedPlaceIds, placeId],
          });
        }
      },

      // 저장 여부 확인
      isSaved: (placeId: string) => {
        return get().savedPlaceIds.includes(placeId);
      },

      // 최근 본 장소 추가
      addRecent: (provider: ServiceProvider) => {
        const { recentPlaces } = get();
        
        // 중복 제거 (이미 있으면 삭제)
        const filteredPlaces = recentPlaces.filter(
          (place) => place.id !== provider.id
        );

        // 새 항목을 맨 앞에 추가
        const newRecentPlace: RecentPlace = {
          id: provider.id,
          name: provider.name,
          type: provider.type,
          address: provider.address,
          rating: provider.rating,
          viewedAt: new Date().toISOString(),
        };

        // 최대 개수 제한 (15개)
        const updatedPlaces = [newRecentPlace, ...filteredPlaces].slice(
          0,
          MAX_RECENT_PLACES
        );

        set({ recentPlaces: updatedPlaces });
      },

      // 최근 본 장소에서 제거
      removeRecent: (placeId: string) => {
        set({
          recentPlaces: get().recentPlaces.filter(
            (place) => place.id !== placeId
          ),
        });
      },

      // 최근 본 장소 전체 삭제
      clearRecentPlaces: () => {
        set({ recentPlaces: [] });
      },

      // 저장한 장소 전체 삭제
      clearSavedPlaces: () => {
        set({ savedPlaceIds: [] });
      },
    }),
    {
      name: "place-storage",
    }
  )
);
