import type { ReactNode } from "react";

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
}

interface QuickActionGridProps {
  onActionClick: (type: QuickActionType) => void;
}

// ============================================
// Quick Actions Definition
// ============================================
const quickActions: QuickAction[] = [
  {
    type: "meal",
    emoji: "🍽️",
    label: "밥",
    bgColorLight: "#fef3c7", // amber-100
    bgColorDark: "#78350f40", // amber-900/25
  },
  {
    type: "bowel",
    emoji: "💩",
    label: "응가",
    bgColorLight: "#fce7f3", // pink-100
    bgColorDark: "#83184940", // pink-900/25
  },
  {
    type: "weight",
    emoji: "⚖️",
    label: "몸무게",
    bgColorLight: "#dbeafe", // blue-100
    bgColorDark: "#1e3a8a40", // blue-900/25
  },
  {
    type: "board",
    emoji: "👨‍👩‍👧",
    label: "가족",
    bgColorLight: "#dcfce7", // green-100
    bgColorDark: "#14532d40", // green-900/25
  },
  {
    type: "expense",
    emoji: "💰",
    label: "지출",
    bgColorLight: "#f3e8ff", // purple-100
    bgColorDark: "#581c8740", // purple-900/25
  },
];

// ============================================
// Component
// ============================================
export default function QuickActionGrid({ onActionClick }: QuickActionGridProps) {
  return (
    <div className="px-4 mb-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex justify-around">
          {quickActions.map((action) => (
            <QuickActionButton
              key={action.type}
              action={action}
              onClick={() => onActionClick(action.type)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Quick Action Button Component
// ============================================
interface QuickActionButtonProps {
  action: QuickAction;
  onClick: () => void;
}

function QuickActionButton({ action, onClick }: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 group"
    >
      <div
        className="w-14 h-14 rounded-[18px] flex items-center justify-center text-2xl transition-all duration-200 group-hover:scale-110 group-active:scale-95 shadow-sm"
        style={{
          backgroundColor: `var(--action-bg)`,
        }}
      >
        <style>
          {`
            @media (prefers-color-scheme: light) {
              .action-btn-${action.type} { --action-bg: ${action.bgColorLight}; }
            }
            @media (prefers-color-scheme: dark) {
              .action-btn-${action.type} { --action-bg: ${action.bgColorDark}; }
            }
            .dark .action-btn-${action.type} { --action-bg: ${action.bgColorDark}; }
            :not(.dark) .action-btn-${action.type} { --action-bg: ${action.bgColorLight}; }
          `}
        </style>
        <span className={`action-btn-${action.type}`} style={{ display: 'contents' }}>
          <div
            className="w-14 h-14 rounded-[18px] flex items-center justify-center text-2xl"
            style={{
              backgroundColor: action.bgColorLight,
            }}
          >
            <span className="dark:hidden">{action.emoji}</span>
          </div>
          <div
            className="w-14 h-14 rounded-[18px] items-center justify-center text-2xl hidden dark:flex"
            style={{
              backgroundColor: action.bgColorDark,
            }}
          >
            {action.emoji}
          </div>
        </span>
      </div>
      <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
        {action.label}
      </span>
    </button>
  );
}

// Simplified version that works better
export function QuickActionGridSimple({ onActionClick }: QuickActionGridProps) {
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
