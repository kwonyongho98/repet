import { RefreshCw, WifiOff, AlertCircle, FileQuestion } from "lucide-react";
import Button from "./Button";

// ============================================
// Error State Components
// ============================================

interface ErrorStateProps {
  type?: "network" | "notFound" | "generic";
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  type = "generic",
  title,
  message,
  onRetry,
  retryLabel = "다시 시도",
}: ErrorStateProps) {
  const configs = {
    network: {
      icon: <WifiOff size={48} className="text-gray-400" />,
      defaultTitle: "인터넷 연결을 확인해주세요",
      defaultMessage:
        "네트워크에 연결되어 있지 않아요.\n연결 상태를 확인하고 다시 시도해주세요.",
    },
    notFound: {
      icon: <FileQuestion size={48} className="text-gray-400" />,
      defaultTitle: "찾을 수 없어요",
      defaultMessage:
        "요청하신 내용을 찾을 수 없어요.\n삭제되었거나 주소가 잘못되었을 수 있어요.",
    },
    generic: {
      icon: <AlertCircle size={48} className="text-gray-400" />,
      defaultTitle: "문제가 발생했어요",
      defaultMessage: "일시적인 오류가 발생했어요.\n잠시 후 다시 시도해주세요.",
    },
  };

  const config = configs[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
        {config.icon}
      </div>

      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2 text-center">
        {title || config.defaultTitle}
      </h3>

      <p className="text-sm text-gray-500 dark:text-gray-400 text-center whitespace-pre-line mb-6">
        {message || config.defaultMessage}
      </p>

      {onRetry && (
        <Button
          variant="secondary"
          onClick={onRetry}
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

// ============================================
// Empty State Component
// ============================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  emoji?: string;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon,
  emoji,
  title,
  message,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {emoji ? (
        <div className="text-6xl mb-4">{emoji}</div>
      ) : icon ? (
        <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          {icon}
        </div>
      ) : null}

      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2 text-center">
        {title}
      </h3>

      {message && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center whitespace-pre-line mb-6">
          {message}
        </p>
      )}

      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

// ============================================
// Inline Error Component
// ============================================

interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
}

export function InlineError({ message, onRetry }: InlineErrorProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
      <div className="flex items-center gap-2">
        <AlertCircle size={16} className="text-red-500" />
        <span className="text-sm text-red-600 dark:text-red-400">
          {message}
        </span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-red-500 font-medium hover:underline flex items-center gap-1"
        >
          <RefreshCw size={14} />
          재시도
        </button>
      )}
    </div>
  );
}

// ============================================
// Loading Overlay
// ============================================

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({
  message = "로딩 중...",
}: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 flex flex-col items-center">
        <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
}
