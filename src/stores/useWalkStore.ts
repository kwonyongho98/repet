import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============================================
// Types
// ============================================
export interface Coordinate {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface PoopLocation {
  lat: number;
  lng: number;
  timestamp: number;
}

interface WalkState {
  // State
  isTracking: boolean;
  isPaused: boolean;
  path: Coordinate[];
  poopLocations: PoopLocation[];
  distance: number; // in km
  time: number; // in seconds
  startTime: Date | null;
  currentPosition: Coordinate | null;

  // Actions
  startWalk: () => void;
  stopWalk: () => WalkSummary | null;
  pauseWalk: () => void;
  resumeWalk: () => void;
  updateLocation: (lat: number, lng: number) => void;
  dropPoopMarker: () => void;
  incrementTime: () => void;
  resetWalk: () => void;
}

export interface WalkSummary {
  distance: number;
  duration: number;
  path: Coordinate[];
  poopLocations: PoopLocation[];
  startTime: Date;
  endTime: Date;
}

// ============================================
// Haversine Formula for Distance Calculation
// ============================================
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// ============================================
// Store
// ============================================
export const useWalkStore = create<WalkState>()(
  persist(
    (set, get) => ({
      // Initial State
      isTracking: false,
      isPaused: false,
      path: [],
      poopLocations: [],
      distance: 0,
      time: 0,
      startTime: null,
      currentPosition: null,

      // Start Walk
      startWalk: () => {
        set({
          isTracking: true,
          isPaused: false,
          path: [],
          poopLocations: [],
          distance: 0,
          time: 0,
          startTime: new Date(),
          currentPosition: null,
        });
      },

      // Stop Walk & Return Summary
      stopWalk: () => {
        const state = get();
        if (!state.isTracking || !state.startTime) return null;

        const summary: WalkSummary = {
          distance: state.distance,
          duration: state.time,
          path: state.path,
          poopLocations: state.poopLocations,
          startTime: state.startTime,
          endTime: new Date(),
        };

        set({
          isTracking: false,
          isPaused: false,
          path: [],
          poopLocations: [],
          distance: 0,
          time: 0,
          startTime: null,
          currentPosition: null,
        });

        return summary;
      },

      // Pause Walk
      pauseWalk: () => {
        set({ isPaused: true });
      },

      // Resume Walk
      resumeWalk: () => {
        set({ isPaused: false });
      },

      // Update Location
      updateLocation: (lat: number, lng: number) => {
        const state = get();
        if (!state.isTracking || state.isPaused) return;

        const newCoord: Coordinate = {
          lat,
          lng,
          timestamp: Date.now(),
        };

        let newDistance = state.distance;

        // Calculate distance from last point
        if (state.path.length > 0) {
          const lastCoord = state.path[state.path.length - 1];
          const segmentDistance = calculateDistance(
            lastCoord.lat,
            lastCoord.lng,
            lat,
            lng
          );
          
          // Only add distance if it's reasonable (filter GPS noise)
          if (segmentDistance < 0.1) { // Less than 100m per update
            newDistance += segmentDistance;
          }
        }

        set({
          path: [...state.path, newCoord],
          distance: newDistance,
          currentPosition: newCoord,
        });
      },

      // Drop Poop Marker
      dropPoopMarker: () => {
        const state = get();
        if (!state.currentPosition) return;

        const poopMarker: PoopLocation = {
          lat: state.currentPosition.lat,
          lng: state.currentPosition.lng,
          timestamp: Date.now(),
        };

        set({
          poopLocations: [...state.poopLocations, poopMarker],
        });
      },

      // Increment Time (called every second)
      incrementTime: () => {
        const state = get();
        if (!state.isTracking || state.isPaused) return;

        set({ time: state.time + 1 });
      },

      // Reset Walk
      resetWalk: () => {
        set({
          isTracking: false,
          isPaused: false,
          path: [],
          poopLocations: [],
          distance: 0,
          time: 0,
          startTime: null,
          currentPosition: null,
        });
      },
    }),
    {
      name: "walk-storage",
      // Don't persist tracking state (reset on page reload)
      partialize: (state) => ({
        // Only persist completed walk data if needed
      }),
    }
  )
);

// ============================================
// Utility Hooks
// ============================================
export function formatWalkTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(2)}km`;
}
