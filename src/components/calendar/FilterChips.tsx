import { useState } from "react";
import {
  PawPrint,
  Utensils,
  Stethoscope,
  Scissors,
  GraduationCap,
  Hotel,
  Scale,
  Wallet,
  Circle,
  LayoutGrid,
  ClipboardList,
} from "lucide-react";

// ============================================
// Filter Types
// ============================================
export type CalendarFilterType = 
  | "all" 
  | "walk" 
  | "health" 
  | "care" 
  | "care_note"
  | "weight"
  | "schedule"
  | "expense";

interface FilterConfig {
  id: CalendarFilterType;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  types: string[]; // 포함되는 이벤트 타입들
}

// ============================================
// Filter Configuration
// ============================================
export const FILTER_CONFIG: FilterConfig[] = [
  {
    id: "all",
    label: "전체",
    icon: <LayoutGrid size={16} />,
    color: "text-gray-600 dark:text-gray-300",
    bgColor: "bg-gray-100 dark:bg-slate-700",
    types: [], // 빈 배열 = 모든 타입
  },
  {
    id: "walk",
    label: "산책",
    icon: <PawPrint size={16} />,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    types: ["walk"],
  },
  {
    id: "health",
    label: "건강",
    icon: <Stethoscope size={16} />,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    types: ["health", "hospital"],
  },
  {
    id: "care",
    label: "케어",
    icon: <Utensils size={16} />,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    types: ["meal", "bowel", "grooming"],
  },
  {
    id: "care_note",
    label: "알림장",
    icon: <ClipboardList size={16} />,
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-100 dark:bg-teal-900/30",
    types: ["care_note"],
  },
  {
    id: "weight",
    label: "몸무게",
    icon: <Scale size={16} />,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    types: ["weight"],
  },
  {
    id: "schedule",
    label: "일정",
    icon: <Hotel size={16} />,
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-100 dark:bg-violet-900/30",
    types: ["hotel", "training", "other"],
  },
  {
    id: "expense",
    label: "지출",
    icon: <Wallet size={16} />,
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-100 dark:bg-pink-900/30",
    types: ["expense"],
  },
];

// ============================================
// FilterChips Component
// ============================================
interface FilterChipsProps {
  activeFilter: CalendarFilterType;
  onFilterChange: (filter: CalendarFilterType) => void;
  className?: string;
}

export default function FilterChips({
  activeFilter,
  onFilterChange,
  className = "",
}: FilterChipsProps) {
  return (
    <div className={`flex gap-2 overflow-x-auto scrollbar-hide py-2 ${className}`}>
      {FILTER_CONFIG.map((filter) => {
        const isActive = activeFilter === filter.id;
        
        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full
              text-sm font-medium whitespace-nowrap
              transition-all duration-200
              ${isActive 
                ? `${filter.bgColor} ${filter.color} ring-2 ring-offset-1 ring-current` 
                : "bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
              }
            `}
          >
            {filter.icon}
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

// ============================================
// Helper: Filter events by type
// ============================================
export function filterEventsByType<T extends { type: string }>(
  items: T[],
  filter: CalendarFilterType
): T[] {
  if (filter === "all") return items;
  
  const config = FILTER_CONFIG.find(f => f.id === filter);
  if (!config || config.types.length === 0) return items;
  
  return items.filter(item => config.types.includes(item.type));
}

// ============================================
// Filter Summary Badge
// ============================================
interface FilterSummaryProps {
  filter: CalendarFilterType;
  count: number;
}

export function FilterSummaryBadge({ filter, count }: FilterSummaryProps) {
  const config = FILTER_CONFIG.find(f => f.id === filter);
  if (!config) return null;

  return (
    <div className={`
      inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
      ${config.bgColor} ${config.color}
    `}>
      {config.icon}
      <span>{count}건</span>
    </div>
  );
}
