import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isInStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    
    setIsStandalone(isInStandaloneMode);

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check if user has dismissed the prompt before
    const hasDeclined = localStorage.getItem('pwa-install-declined');
    const declinedTime = hasDeclined ? parseInt(hasDeclined, 10) : 0;
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Show prompt if not declined recently
      if (!hasDeclined || Date.now() - declinedTime > oneWeek) {
        // Delay showing the prompt for better UX
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show iOS prompt if applicable
    if (isIOSDevice && !isInStandaloneMode && (!hasDeclined || Date.now() - declinedTime > oneWeek)) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
        localStorage.setItem('pwa-install-declined', Date.now().toString());
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-declined', Date.now().toString());
  };

  // Don't render if already installed or prompt shouldn't be shown
  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 max-w-md mx-auto">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="닫기"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-4">
          {/* App Icon */}
          <div className="flex-shrink-0">
            <img
              src="/icon-96x96.png"
              alt="레펫 아이콘"
              className="w-14 h-14 rounded-xl shadow-md"
            />
          </div>

          {/* Content */}
          <div className="flex-1 pr-6">
            <h3 className="font-bold text-gray-900 mb-1">
              레펫 앱 설치하기
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              홈 화면에 추가하면 더 빠르게 접근할 수 있어요!
            </p>

            {isIOS ? (
              // iOS Instructions
              <div className="bg-orange-50 rounded-lg p-3 text-sm">
                <div className="flex items-center gap-2 text-orange-800 font-medium mb-2">
                  <Smartphone size={16} />
                  <span>iOS 설치 방법</span>
                </div>
                <ol className="text-orange-700 space-y-1 text-xs">
                  <li>1. Safari 하단의 <span className="inline-flex items-center"><Download size={12} className="mx-1" /></span> 공유 버튼 탭</li>
                  <li>2. "홈 화면에 추가" 선택</li>
                  <li>3. "추가" 버튼 탭</li>
                </ol>
              </div>
            ) : (
              // Android / Desktop Install Button
              <button
                onClick={handleInstall}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Download size={18} />
                <span>앱 설치하기</span>
              </button>
            )}
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-around text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="text-green-500">✓</span> 오프라인 사용
            </span>
            <span className="flex items-center gap-1">
              <span className="text-green-500">✓</span> 빠른 실행
            </span>
            <span className="flex items-center gap-1">
              <span className="text-green-500">✓</span> 푸시 알림
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PWAInstallPrompt;
