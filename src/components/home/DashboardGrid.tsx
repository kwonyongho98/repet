import { useNavigate } from "react-router-dom";
import { usePetStore } from "../../stores/usePetStore";

// ============================================
// DashboardGrid v4 - 주황 테두리 포인트
// ============================================

interface WidgetItem {
  id: string;
  icon: string;
  label: string;
  path: string;
  iconBg: string;
  darkIconBg: string;
}

const widgets: WidgetItem[] = [
  { id: "connect", icon: "🔗", label: "가족연동", path: "/home/provider-connect", iconBg: "bg-green-100", darkIconBg: "dark:bg-green-900/40" },
  { id: "memo", icon: "📝", label: "공유메모장", path: "/home/family-board", iconBg: "bg-amber-100", darkIconBg: "dark:bg-amber-900/40" },
  { id: "album", icon: "📷", label: "앨범", path: "/home/album", iconBg: "bg-blue-100", darkIconBg: "dark:bg-blue-900/40" },
  { id: "calendar", icon: "📅", label: "캘린더", path: "/home/calendar", iconBg: "bg-purple-100", darkIconBg: "dark:bg-purple-900/40" },
];

export default function DashboardGrid() {
  const navigate = useNavigate();
  const selectedPet = usePetStore((state) => {
    return state.pets.find((p) => p.id === state.selectedPetId);
  });

  return (
    <div className="px-4 mb-3">
      <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 pt-4 pb-3 shadow-sm border border-orange-200 dark:border-orange-800/50">
        <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">
          🐾 {selectedPet?.name || "반려견"}의 하루
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {widgets.map((w) => (
            <button
              key={w.id}
              onClick={() => navigate(w.path)}
              className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform duration-150"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${w.iconBg} ${w.darkIconBg}`}>
                <span className="text-2xl">{w.icon}</span>
              </div>
              <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400 text-center leading-tight">
                {w.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
