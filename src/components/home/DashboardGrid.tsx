import { useNavigate } from "react-router-dom";
import { usePetStore } from "../../stores/usePetStore";

// ============================================
// DashboardGrid - 에당이의 하루 (4개 위젯 그리드)
// ============================================

interface WidgetItem {
  id: string;
  icon: string;
  label: string;
  sublabel?: string;
  path: string;
  bgColor: string;
  darkBgColor: string;
}

const widgets: WidgetItem[] = [
  {
    id: "connect",
    icon: "🔗",
    label: "가족/업체",
    sublabel: "연동",
    path: "/home/provider-connect",
    bgColor: "bg-emerald-100",
    darkBgColor: "dark:bg-emerald-900/40",
  },
  {
    id: "calendar",
    icon: "📅",
    label: "캘린더",
    sublabel: "(몸무게)",
    path: "/home/calendar",
    bgColor: "bg-blue-100",
    darkBgColor: "dark:bg-blue-900/40",
  },
  {
    id: "memo",
    icon: "📝",
    label: "가족 공유",
    sublabel: "메모장",
    path: "/home/family-board",
    bgColor: "bg-amber-100",
    darkBgColor: "dark:bg-amber-900/40",
  },
  {
    id: "album",
    icon: "📷",
    label: "가족/업체",
    sublabel: "공유 앨범",
    path: "/home/album",
    bgColor: "bg-pink-100",
    darkBgColor: "dark:bg-pink-900/40",
  },
];

export default function DashboardGrid() {
  const navigate = useNavigate();
  const selectedPet = usePetStore((state) => {
    const pets = state.pets;
    const selectedPetId = state.selectedPetId;
    return pets.find((p) => p.id === selectedPetId);
  });

  return (
    <div className="px-4 mb-4">
      {/* 섹션 타이틀 */}
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        🐾 {selectedPet?.name || "반려견"}의 하루
      </h2>

      {/* 4개 위젯 그리드 */}
      <div className="grid grid-cols-2 gap-3">
        {widgets.map((widget) => (
          <button
            key={widget.id}
            onClick={() => navigate(widget.path)}
            className={`
              ${widget.bgColor} ${widget.darkBgColor}
              rounded-2xl p-4 
              flex flex-col items-center justify-center
              min-h-[100px]
              shadow-sm border border-gray-100 dark:border-slate-700
              hover:scale-[1.02] active:scale-[0.98]
              transition-all duration-200
            `}
          >
            <span className="text-3xl mb-2">{widget.icon}</span>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {widget.label}
            </span>
            {widget.sublabel && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {widget.sublabel}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
