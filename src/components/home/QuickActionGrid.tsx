// ============================================
// Types
// ============================================
export type QuickActionType = "meal" | "bowel" | "weight" | "board" | "expense";

interface QuickAction {
  type: QuickActionType;
  emoji: string;
  label: string;
  bgColorLight: string;
  bgColorDark: string;
  navigateTo?: string; // 풀스크린 페이지로 이동할 경로
}

interface QuickActionGridProps {
  onActionClick: (type: QuickActionType) => void;
  onNavigate?: (path: string) => void;
}

// ============================================
// Quick Actions Definition
// ============================================
const quickActions: QuickAction[] = [
  {
    type: "meal",
    emoji: "🍽️",
    label: "밥",
    bgColorLight: "#fef3c7",
    bgColorDark: "#78350f40",
    navigateTo: "/home/family-board",
  },
  {
    type: "bowel",
    emoji: "💩",
    label: "응가",
    bgColorLight: "#fce7f3",
    bgColorDark: "#83184940",
    navigateTo: "/home/family-board",
  },
  {
    type: "weight",
    emoji: "⚖️",
    label: "몸무게",
    bgColorLight: "#dbeafe",
    bgColorDark: "#1e3a8a40",
  },
  {
    type: "board",
    emoji: "👨‍👩‍👧",
    label: "가족",
    bgColorLight: "#dcfce7",
    bgColorDark: "#14532d40",
    navigateTo: "/home/family-board",
  },
  {
    type: "expense",
    emoji: "💰",
    label: "지출",
    bgColorLight: "#f3e8ff",
    bgColorDark: "#581c8740",
  },
];

// ============================================
// Component (legacy - keep for compatibility)
// ============================================
export default function QuickActionGrid({ onActionClick }: QuickActionGridProps) {
  return (
    <div className="px-4 mb-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex justify-around">
          {quickActions.map((action) => (
            <button
              key={action.type}
              onClick={() => onActionClick(action.type)}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className={`
                  w-14 h-14 rounded-[18px] flex items-center justify-center text-2xl
                  transition-all duration-200 group-hover:scale-110 group-active:scale-95 shadow-sm
                  ${action.type === "meal" ? "bg-amber-100 dark:bg-amber-900/40" : ""}
                  ${action.type === "bowel" ? "bg-pink-100 dark:bg-pink-900/40" : ""}
                  ${action.type === "weight" ? "bg-blue-100 dark:bg-blue-900/40" : ""}
                  ${action.type === "board" ? "bg-green-100 dark:bg-green-900/40" : ""}
                  ${action.type === "expense" ? "bg-purple-100 dark:bg-purple-900/40" : ""}
                `}
              >
                {action.emoji}
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Simplified version with navigation support
// ============================================
export function QuickActionGridSimple({ onActionClick, onNavigate }: QuickActionGridProps) {
  return (
    <div className="px-4 mb-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex justify-around">
          {quickActions.map((action) => (
            <button
              key={action.type}
              onClick={() => {
                if (action.navigateTo && onNavigate) {
                  onNavigate(action.navigateTo);
                } else {
                  onActionClick(action.type);
                }
              }}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className={`
                  w-14 h-14 rounded-[18px] flex items-center justify-center text-2xl 
                  transition-all duration-200 group-hover:scale-110 group-active:scale-95 shadow-sm
                  ${action.type === "meal" ? "bg-amber-100 dark:bg-amber-900/40" : ""}
                  ${action.type === "bowel" ? "bg-pink-100 dark:bg-pink-900/40" : ""}
                  ${action.type === "weight" ? "bg-blue-100 dark:bg-blue-900/40" : ""}
                  ${action.type === "board" ? "bg-green-100 dark:bg-green-900/40" : ""}
                  ${action.type === "expense" ? "bg-purple-100 dark:bg-purple-900/40" : ""}
                `}
              >
                {action.emoji}
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
