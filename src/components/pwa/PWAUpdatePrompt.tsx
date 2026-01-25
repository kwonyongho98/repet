import { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export const PWAUpdatePrompt = () => {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      console.log('SW Registered:', registration);
      
      // Check for updates every hour
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('SW registration error:', error);
    },
    onNeedRefresh() {
      setShowUpdatePrompt(true);
    },
    onOfflineReady() {
      console.log('App ready to work offline');
    },
  });

  useEffect(() => {
    if (needRefresh) {
      setShowUpdatePrompt(true);
    }
  }, [needRefresh]);

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
    setNeedRefresh(false);
  };

  if (!showUpdatePrompt) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-slide-down">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-xl p-4 max-w-md mx-auto text-white">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 text-white/70 hover:text-white transition-colors"
          aria-label="닫기"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 bg-white/20 rounded-full p-3">
            <RefreshCw size={24} className="text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 pr-6">
            <h3 className="font-bold mb-1">
              새 버전이 있어요! 🎉
            </h3>
            <p className="text-sm text-white/90 mb-3">
              더 나은 레펫 경험을 위해 업데이트하세요.
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="flex-1 bg-white text-orange-600 font-medium py-2 px-4 rounded-xl hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                <span>업데이트</span>
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-white/80 hover:text-white transition-colors"
              >
                나중에
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PWAUpdatePrompt;
