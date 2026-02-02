import { Link } from "react-router-dom";
import { Store, ChevronRight, Sparkles, Search } from "lucide-react";

// ============================================
// Provider Connect Banner
// 업체 연결 유도 배너 (Pure Diary Mode에서 표시)
// ============================================

interface ProviderConnectBannerProps {
  variant?: 'default' | 'compact' | 'hero';
}

export default function ProviderConnectBanner({ variant = 'default' }: ProviderConnectBannerProps) {
  if (variant === 'hero') {
    return (
      <div className="mx-4 mb-4 space-y-3">
        <Link
          to="/home/provider-connect"
          className="block"
        >
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={20} />
                <span className="text-sm font-medium opacity-90">새로운 기능</span>
              </div>
              
              <h3 className="text-xl font-bold mb-2">
                펫 서비스와 연결해보세요! 🐾
              </h3>
              
              <p className="text-sm opacity-90 mb-4 leading-relaxed">
                유치원, 호텔, 미용실 선생님이 보내주는<br />
                오늘의 케어노트를 받아보세요
              </p>
              
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span>업체 연결하기</span>
                <ChevronRight size={18} />
              </div>
            </div>
          </div>
        </Link>
        
        {/* 업체 찾아보기 버튼 */}
        <Link
          to="/home/service"
          className="flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          <Search size={18} className="text-orange-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            주변 업체 찾아보기
          </span>
          <ChevronRight size={16} className="text-gray-400" />
        </Link>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="mx-4 mb-4 space-y-2">
        <Link
          to="/home/provider-connect"
          className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 rounded-2xl border border-orange-100 dark:border-orange-800/30"
        >
          <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
            <Store size={20} className="text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              펫 서비스 연결하기
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              케어노트를 받아보세요
            </p>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </Link>
        
        {/* 업체 찾아보기 버튼 */}
        <Link
          to="/home/service"
          className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          <div className="w-8 h-8 bg-orange-50 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
            <Search size={16} className="text-orange-500" />
          </div>
          <span className="flex-1 text-sm text-gray-600 dark:text-gray-400">
            주변 업체 찾아보기
          </span>
          <ChevronRight size={16} className="text-gray-400" />
        </Link>
      </div>
    );
  }

  // Default variant
  return (
    <div className="mx-4 mb-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700">
        <Link
          to="/home/provider-connect"
          className="block hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <div className="relative">
            {/* Gradient header */}
            <div className="h-20 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center">
              <div className="text-4xl">🪺✨👩‍🏫</div>
            </div>
            
            {/* Content */}
            <div className="p-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                펫 서비스와 연결하면
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                선생님이 보내주는 케어노트를 받아볼 수 있어요!<br />
                유치원, 호텔, 미용실 어디든 연결 가능 🎉
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-sm">🎒</div>
                  <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center text-sm">✂️</div>
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-sm">🏨</div>
                </div>
                <span className="text-orange-500 dark:text-orange-400 text-sm font-semibold flex items-center gap-1">
                  업체 연결하기
                  <ChevronRight size={16} />
                </span>
              </div>
            </div>
          </div>
        </Link>
        
        {/* 구분선 */}
        <div className="border-t border-gray-100 dark:border-slate-700" />
        
        {/* 업체 찾아보기 버튼 */}
        <Link
          to="/home/service"
          className="flex items-center justify-center gap-2 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <Search size={18} className="text-orange-500" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            주변 업체 찾아보기
          </span>
          <ChevronRight size={16} className="text-gray-400" />
        </Link>
      </div>
    </div>
  );
}
