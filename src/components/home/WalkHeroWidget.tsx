import { Play, MapPin, Timer, Cloud, Sun, CloudRain } from "lucide-react";
import { usePetStore } from "../../stores/usePetStore";
import { useWalkStore, formatWalkTime, formatDistance } from "../../stores/useWalkStore";

interface WalkHeroWidgetProps {
  onStartWalk: () => void;
}

export default function WalkHeroWidget({ onStartWalk }: WalkHeroWidgetProps) {
  const selectedPet = usePetStore((state) => {
    const pets = state.pets;
    const selectedPetId = state.selectedPetId;
    return pets.find((p) => p.id === selectedPetId);
  });

  const { isTracking, isPaused, time, distance } = useWalkStore();

  // Simulated weather (would come from API in production)
  const weather = { temp: 18, condition: "sunny" as const };

  const WeatherIcon = weather.condition === "sunny" 
    ? Sun 
    : weather.condition === "cloudy" 
    ? Cloud 
    : CloudRain;

  if (isTracking) {
    // ============================================
    // Active State - Live Dashboard
    // ============================================
    return (
      <div className="px-4 mb-4">
        <div 
          className="relative rounded-3xl overflow-hidden"
          style={{ minHeight: "160px" }}
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600">
            {/* Animated waves */}
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="white" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,50 Q25,30 50,50 T100,50 T150,50 T200,50 V100 H0 Z"
                  fill="url(#waveGradient)"
                  className="animate-wave"
                />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 p-5">
            {/* Top Row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                <span className="text-white/80 text-sm font-medium">
                  {isPaused ? "일시정지" : "산책 중"}
                </span>
              </div>
              <button
                onClick={onStartWalk}
                className="px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full hover:bg-white/30 transition-colors"
              >
                지도 보기
              </button>
            </div>

            {/* Main Stats */}
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Timer size={18} className="text-white/70" />
                  <span className="text-white/70 text-sm">경과 시간</span>
                </div>
                <p className="text-white text-4xl font-bold font-mono tracking-tight">
                  {formatWalkTime(time)}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1 justify-end">
                  <MapPin size={18} className="text-white/70" />
                  <span className="text-white/70 text-sm">이동 거리</span>
                </div>
                <p className="text-white text-4xl font-bold">
                  {formatDistance(distance)}
                </p>
              </div>
            </div>

            {/* Pet Running Animation */}
            <div className="absolute bottom-4 right-4 text-4xl animate-bounce">
              🐕
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // Idle State - Ready to Start
  // ============================================
  return (
    <div className="px-4 mb-4">
      <div 
        className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 dark:from-emerald-600 dark:via-teal-700 dark:to-cyan-800"
        style={{ minHeight: "160px" }}
      >
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full">
              <defs>
                <pattern id="heroGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#heroGrid)" />
            </svg>
          </div>
          
          {/* Decorative Circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-5 flex flex-col justify-between h-full" style={{ minHeight: "160px" }}>
          {/* Top Row */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Good day for a walk!</p>
              <h2 className="text-white text-2xl font-bold">
                {selectedPet?.name}와(과) 산책가자! 🐕
              </h2>
            </div>
            {/* Weather Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
              <WeatherIcon size={16} className="text-white" />
              <span className="text-white text-sm font-medium">{weather.temp}°</span>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex items-end justify-between mt-4">
            <p className="text-white/60 text-sm">
              GPS로 경로와 배변 위치를 기록해요
            </p>
            <button
              onClick={onStartWalk}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-teal-600 dark:text-teal-700 font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <Play size={18} fill="currentColor" />
              시작하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
