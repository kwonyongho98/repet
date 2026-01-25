import { useEffect, useRef, useState } from "react";
import {
  X,
  Pause,
  Play,
  Square,
  MapPin,
  Navigation,
} from "lucide-react";
import { useWalkStore, formatWalkTime, formatDistance } from "../../stores/useWalkStore";
import { usePetStore } from "../../stores/usePetStore";
import { useDailyLogStore } from "../../stores/useDailyLogStore";
import { format } from "date-fns";

interface WalkMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalkMapModal({ isOpen, onClose }: WalkMapModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Walk Store
  const {
    isTracking,
    isPaused,
    path,
    poopLocations,
    distance,
    time,
    currentPosition,
    startWalk,
    stopWalk,
    pauseWalk,
    resumeWalk,
    updateLocation,
    dropPoopMarker,
    incrementTime,
  } = useWalkStore();

  // Pet Store
  const selectedPet = usePetStore((state) => {
    const pets = state.pets;
    const selectedPetId = state.selectedPetId;
    return pets.find((p) => p.id === selectedPetId);
  });

  // Daily Log Store
  const addWalkLog = useDailyLogStore((state) => state.addWalkLog);

  // Local State
  const [showPoopAnimation, setShowPoopAnimation] = useState(false);

  // ============================================
  // GPS Tracking
  // ============================================
  useEffect(() => {
    if (isTracking && !isPaused) {
      // Start GPS tracking
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            updateLocation(
              position.coords.latitude,
              position.coords.longitude
            );
          },
          (error) => {
            console.error("GPS Error:", error);
            // Fallback: simulate movement for demo
            simulateMovement();
          },
          {
            enableHighAccuracy: true,
            maximumAge: 5000,
            timeout: 10000,
          }
        );
      } else {
        // No GPS available, simulate for demo
        simulateMovement();
      }

      // Start timer
      timerRef.current = setInterval(() => {
        incrementTime();
      }, 1000);
    }

    return () => {
      // Cleanup GPS watch
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      // Cleanup timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isTracking, isPaused]);

  // Simulate movement for demo/testing
  const simulateMovement = () => {
    const baseLatSeoul = 37.5665;
    const baseLngSeoul = 126.978;
    
    const interval = setInterval(() => {
      if (!useWalkStore.getState().isTracking || useWalkStore.getState().isPaused) {
        clearInterval(interval);
        return;
      }
      
      const currentPath = useWalkStore.getState().path;
      const lastPos = currentPath.length > 0 
        ? currentPath[currentPath.length - 1]
        : { lat: baseLatSeoul, lng: baseLngSeoul };
      
      // Random small movement
      const newLat = lastPos.lat + (Math.random() - 0.5) * 0.0005;
      const newLng = lastPos.lng + (Math.random() - 0.5) * 0.0005;
      
      updateLocation(newLat, newLng);
    }, 3000);

    return () => clearInterval(interval);
  };

  // ============================================
  // Handlers
  // ============================================
  const handleStart = () => {
    startWalk();
  };

  const handlePause = () => {
    if (isPaused) {
      resumeWalk();
    } else {
      pauseWalk();
    }
  };

  const handleStop = () => {
    const summary = stopWalk();
    
    if (summary && selectedPet) {
      // Save to daily log
      addWalkLog({
        petId: selectedPet.id,
        petName: selectedPet.name,
        date: format(new Date(), "yyyy-MM-dd"),
        startTime: format(summary.startTime, "HH:mm"),
        endTime: format(summary.endTime, "HH:mm"),
        duration: Math.round(summary.duration / 60), // Convert to minutes
        distance: summary.distance,
        distanceUnit: "km",
        satisfaction: "good",
        notes: summary.poopLocations.length > 0 
          ? `💩 ${summary.poopLocations.length}회 배변`
          : undefined,
      });
    }
    
    onClose();
  };

  const handlePoopDrop = () => {
    dropPoopMarker();
    setShowPoopAnimation(true);
    setTimeout(() => setShowPoopAnimation(false), 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900">
      {/* ============================================ */}
      {/* Map Background */}
      {/* ============================================ */}
      <div 
        ref={mapRef}
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(135deg, #1a365d 0%, #0f172a 50%, #1e293b 100%)
          `,
        }}
      >
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full">
            <defs>
              <pattern id="walkGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#walkGrid)" />
          </svg>
        </div>

        {/* Path Visualization (Simplified) */}
        {path.length > 1 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <polyline
              points={path.slice(-50).map((p, i) => {
                // Simple visualization in center of screen
                const x = 50 + (i * 3) % 200;
                const y = 300 + Math.sin(i * 0.5) * 50;
                return `${x},${y}`;
              }).join(" ")}
              fill="none"
              stroke="#fb923c"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-pulse"
            />
          </svg>
        )}

        {/* Poop Markers */}
        {poopLocations.map((poop, idx) => (
          <div
            key={idx}
            className="absolute text-3xl animate-bounce"
            style={{
              left: `${20 + (idx * 40) % 80}%`,
              top: `${30 + (idx * 20) % 40}%`,
            }}
          >
            💩
          </div>
        ))}

        {/* Current Position Indicator */}
        {currentPosition && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              {/* Pulse Ring */}
              <div className="absolute -inset-4 bg-orange-500/30 rounded-full animate-ping" />
              <div className="absolute -inset-2 bg-orange-500/50 rounded-full" />
              {/* Center Dot */}
              <div className="w-6 h-6 bg-orange-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <Navigation size={12} className="text-white" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* Top HUD */}
      {/* ============================================ */}
      <div className="absolute top-0 left-0 right-0 z-10">
        {/* Close Button */}
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center"
          >
            <X size={20} className="text-white" />
          </button>
          
          {/* Pet Info */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: selectedPet?.color || "#f97316" }}
            >
              {selectedPet?.name.charAt(0) || "🐕"}
            </div>
            <span className="text-white font-medium text-sm">
              {selectedPet?.name || "산책"}
            </span>
          </div>
          
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Main Stats Display */}
        {isTracking && (
          <div className="px-6 pt-8">
            {/* Timer - Large */}
            <div className="text-center mb-4">
              <p className="text-white/60 text-sm font-medium mb-1">TIME</p>
              <p className="text-white text-6xl font-bold tracking-tight font-mono">
                {formatWalkTime(time)}
              </p>
            </div>

            {/* Distance & Pace Row */}
            <div className="flex justify-center gap-12">
              <div className="text-center">
                <p className="text-white/60 text-xs font-medium mb-1">DISTANCE</p>
                <p className="text-white text-3xl font-bold">
                  {formatDistance(distance)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-xs font-medium mb-1">PACE</p>
                <p className="text-white text-3xl font-bold">
                  {distance > 0 ? `${(time / 60 / distance).toFixed(1)}'` : "--"}
                </p>
              </div>
            </div>

            {/* Status */}
            {isPaused && (
              <div className="mt-6 text-center">
                <span className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                  ⏸️ 일시정지됨
                </span>
              </div>
            )}
          </div>
        )}

        {/* Pre-start State */}
        {!isTracking && (
          <div className="px-6 pt-16 text-center">
            <p className="text-white/60 text-lg mb-2">
              {selectedPet?.name}와(과) 함께
            </p>
            <h1 className="text-white text-4xl font-bold mb-4">
              산책을 시작할까요? 🐕
            </h1>
            <p className="text-white/40 text-sm">
              GPS로 경로를 추적하고 배변 위치도 기록해요
            </p>
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* Bottom Controls */}
      {/* ============================================ */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pb-safe">
        <div className="px-6 pb-8 pt-4 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent">
          {!isTracking ? (
            /* Start Button */
            <button
              onClick={handleStart}
              className="w-full py-5 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xl font-bold rounded-2xl shadow-lg shadow-orange-500/30 active:scale-98 transition-transform"
            >
              <Play size={24} className="inline mr-2" fill="white" />
              시작하기
            </button>
          ) : (
            /* Active Controls */
            <div className="flex items-center justify-center gap-6">
              {/* Pause/Resume */}
              <button
                onClick={handlePause}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isPaused
                    ? "bg-green-500 shadow-lg shadow-green-500/30"
                    : "bg-white/20 backdrop-blur-md"
                }`}
              >
                {isPaused ? (
                  <Play size={28} className="text-white ml-1" fill="white" />
                ) : (
                  <Pause size={28} className="text-white" />
                )}
              </button>

              {/* Stop */}
              <button
                onClick={handleStop}
                className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 active:scale-95 transition-transform"
              >
                <Square size={32} className="text-white" fill="white" />
              </button>

              {/* Spacer for alignment */}
              <div className="w-16" />
            </div>
          )}
        </div>

        {/* Poop FAB */}
        {isTracking && (
          <button
            onClick={handlePoopDrop}
            className="absolute right-6 bottom-32 w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-amber-400/30 active:scale-95 transition-transform"
          >
            <span className="text-3xl">💩</span>
          </button>
        )}

        {/* Poop Animation */}
        {showPoopAnimation && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-8xl animate-bounce">💩</div>
            <div className="absolute text-white text-xl font-bold mt-32 animate-pulse">
              배변 기록됨!
            </div>
          </div>
        )}
      </div>

      {/* Safe area padding */}
      <style>{`
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom, 20px);
        }
        .active\\:scale-98:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
}
