import { useState } from "react";
import { Navigation, X } from "lucide-react";
import { useWalkStore } from "../../stores/useWalkStore";

// ============================================
// Walk FAB (Floating Action Button)
// Quick Start Walk from anywhere
// ============================================

interface WalkFABProps {
  onClick: () => void;
  className?: string;
}

export default function WalkFAB({ onClick, className = "" }: WalkFABProps) {
  const isTracking = useWalkStore((state) => state.isTracking);
  const [isPressed, setIsPressed] = useState(false);

  // 산책 중이면 FAB 숨김
  if (isTracking) return null;

  return (
    <button
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      className={`
        fixed bottom-24 right-4 z-40
        w-14 h-14 rounded-full
        bg-gradient-to-br from-green-500 to-emerald-600
        shadow-lg shadow-green-500/30
        flex items-center justify-center
        transition-all duration-200
        hover:shadow-xl hover:shadow-green-500/40
        hover:scale-105
        active:scale-95
        ${isPressed ? "scale-95" : ""}
        ${className}
      `}
      aria-label="산책 시작"
    >
      {/* Pulse Animation */}
      <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-30" />
      
      {/* Icon */}
      <Navigation 
        size={24} 
        className="text-white relative z-10" 
        fill="white"
        style={{ transform: "rotate(45deg)" }}
      />
      
      {/* Label (optional hover tooltip) */}
      <span className="
        absolute right-full mr-3 
        px-3 py-1.5 rounded-lg
        bg-slate-800 text-white text-sm font-medium
        whitespace-nowrap
        opacity-0 pointer-events-none
        transition-opacity duration-200
        group-hover:opacity-100
      ">
        산책 시작
      </span>
    </button>
  );
}

// ============================================
// Mini FAB variant (smaller size)
// ============================================
export function WalkFABMini({ onClick, className = "" }: WalkFABProps) {
  const isTracking = useWalkStore((state) => state.isTracking);

  if (isTracking) return null;

  return (
    <button
      onClick={onClick}
      className={`
        w-12 h-12 rounded-full
        bg-gradient-to-br from-green-500 to-emerald-600
        shadow-md shadow-green-500/20
        flex items-center justify-center
        transition-all duration-200
        hover:shadow-lg hover:scale-105
        active:scale-95
        ${className}
      `}
      aria-label="산책 시작"
    >
      <Navigation 
        size={20} 
        className="text-white" 
        fill="white"
        style={{ transform: "rotate(45deg)" }}
      />
    </button>
  );
}
