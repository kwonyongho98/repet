import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Provider } from "../../types/provider";
import { serviceTypeConfig } from "../../types/provider";

// ============================================
// ProviderSection - 업체별 기능 섹션
// ============================================

interface ProviderSectionProps {
  providers: Provider[];
}

interface ProviderWidget {
  id: string;
  icon: string;
  label: string;
  path: string;
  bgColor: string;
  darkBgColor: string;
}

const providerWidgets: ProviderWidget[] = [
  {
    id: "care-note",
    icon: "📋",
    label: "케어 노트",
    path: "/home/communication",
    bgColor: "bg-purple-100",
    darkBgColor: "dark:bg-purple-900/40",
  },
  {
    id: "announcement",
    icon: "📢",
    label: "공지사항",
    path: "/home/communication", // 같은 페이지, 탭 전환 가능
    bgColor: "bg-orange-100",
    darkBgColor: "dark:bg-orange-900/40",
  },
  {
    id: "schedule",
    icon: "📆",
    label: "일정표",
    path: "/home/calendar",
    bgColor: "bg-cyan-100",
    darkBgColor: "dark:bg-cyan-900/40",
  },
  {
    id: "care-request",
    icon: "✍️",
    label: "케어 요청서",
    path: "/home/communication", // TODO: 별도 페이지 구현 시 변경
    bgColor: "bg-rose-100",
    darkBgColor: "dark:bg-rose-900/40",
  },
];

export default function ProviderSection({ providers }: ProviderSectionProps) {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedProvider = providers[selectedIndex];

  const goToPrevProvider = () => {
    setSelectedIndex((prev) =>
      prev > 0 ? prev - 1 : providers.length - 1
    );
  };

  const goToNextProvider = () => {
    setSelectedIndex((prev) =>
      prev < providers.length - 1 ? prev + 1 : 0
    );
  };

  const getProviderEmoji = (serviceType: string) => {
    switch (serviceType) {
      case "daycare":
        return "🏫";
      case "hotel":
        return "🏨";
      case "grooming":
        return "✂️";
      case "training":
        return "🎓";
      case "hospital":
        return "🏥";
      default:
        return "🏢";
    }
  };

  if (providers.length === 0) return null;

  return (
    <div className="px-4 mb-4">
      {/* 업체 선택 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">
            {getProviderEmoji(selectedProvider?.serviceType || "")}
          </span>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {selectedProvider?.businessName || "업체"}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {serviceTypeConfig[selectedProvider?.serviceType]?.label || ""}
            </p>
          </div>
        </div>

        {/* 업체 전환 (여러 개일 때) */}
        {providers.length > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrevProvider}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft size={18} className="text-gray-400" />
            </button>
            <span className="text-xs text-gray-400 px-1">
              {selectedIndex + 1}/{providers.length}
            </span>
            <button
              onClick={goToNextProvider}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          </div>
        )}
      </div>

      {/* 업체 위젯 4개 */}
      <div className="grid grid-cols-4 gap-2">
        {providerWidgets.map((widget) => (
          <button
            key={widget.id}
            onClick={() => navigate(widget.path)}
            className={`
              ${widget.bgColor} ${widget.darkBgColor}
              rounded-xl p-3
              flex flex-col items-center justify-center
              min-h-[80px]
              shadow-sm border border-gray-100 dark:border-slate-700
              hover:scale-[1.02] active:scale-[0.98]
              transition-all duration-200
            `}
          >
            <span className="text-2xl mb-1">{widget.icon}</span>
            <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
              {widget.label}
            </span>
          </button>
        ))}
      </div>

      {/* 업체 인디케이터 (여러 개일 때) */}
      {providers.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {providers.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === selectedIndex
                  ? "bg-orange-500 w-4"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
