import type { ReactNode } from "react";
import { X, ArrowLeft } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  fullScreen?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "md",
  fullScreen = false,
}: ModalProps) {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  // 전체화면 모달
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900">
        {/* 헤더 */}
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          {title && (
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex-1">
              {title}
            </h2>
          )}
        </div>

        {/* 바디 */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    );
  }

  // 기본 중앙 모달
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* 모달 컨텐츠 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full ${maxWidthClasses[maxWidth]} transform transition-all`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          {title && (
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <X size={24} />
              </button>
            </div>
          )}

          {/* 바디 */}
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
