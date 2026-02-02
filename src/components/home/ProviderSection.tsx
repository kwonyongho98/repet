import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Provider } from "../../types/provider";
import { serviceTypeConfig } from "../../types/provider";

// ============================================
// ProviderSection v4 - 주황 테두리 포인트
// ============================================

interface ProviderWidget {
  id: string;
  icon: string;
  label: string;
  path: string;
  iconBg: string;
  darkIconBg: string;
}

const providerWidgets: ProviderWidget[] = [
  { id: "care-note", icon: "📋", label: "케어노트", path: "/home/communication", iconBg: "bg-orange-100", darkIconBg: "dark:bg-orange-900/40" },
  { id: "announcement", icon: "📢", label: "공지사항", path: "/home/announcements", iconBg: "bg-teal-100", darkIconBg: "dark:bg-teal-900/40" },
  { id: "schedule", icon: "📆", label: "일정표", path: "/home/calendar", iconBg: "bg-sky-100", darkIconBg: "dark:bg-sky-900/40" },
  { id: "care-request", icon: "✍️", label: "케어요청서", path: "/home/care-request", iconBg: "bg-rose-100", darkIconBg: "dark:bg-rose-900/40" },
];

interface ProviderSectionProps {
  providers: Provider[];
}

export default function ProviderSection({ providers }: ProviderSectionProps) {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedProvider = providers[selectedIndex];

  const goToPrev = () => setSelectedIndex((i) => (i > 0 ? i - 1 : providers.length - 1));
  const goToNext = () => setSelectedIndex((i) => (i < providers.length - 1 ? i + 1 : 0));

  if (providers.length === 0) return null;

  return (
    <div className="px-4 mb-3">
      <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 pt-4 pb-3 shadow-sm border border-orange-200 dark:border-orange-800/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-orange-600 dark:text-orange-400 truncate">
              {selectedProvider?.businessName || "업체"}
            </h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              {serviceTypeConfig[selectedProvider?.serviceType]?.label || ""}
            </p>
          </div>
          {providers.length > 1 ? (
            <div className="flex items-center gap-0.5">
              <button onClick={goToPrev} className="p-1.5 rounded-full hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors">
                <ChevronLeft size={16} className="text-orange-400" />
              </button>
              <span className="text-[11px] text-gray-400 tabular-nums min-w-[24px] text-center">
                {selectedIndex + 1}/{providers.length}
              </span>
              <button onClick={goToNext} className="p-1.5 rounded-full hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors">
                <ChevronRight size={16} className="text-orange-400" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/home/provider-connect")}
              className="text-[11px] text-orange-400 px-2 py-1 rounded-lg hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors"
            >
              편집
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-3">
          {providerWidgets.map((w) => (
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

        {providers.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {providers.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`rounded-full transition-all duration-300 ${
                  idx === selectedIndex ? "bg-orange-500 w-4 h-1.5" : "bg-gray-300 dark:bg-gray-600 w-1.5 h-1.5"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
