import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, Calendar, MapPin, User, Bell, Menu, CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react";
import SideDrawer from "./SideDrawer";
import { useThemeStore } from "../../stores/useThemeStore";
import { useUIStore } from "../../stores/useUIStore";

export default function Layout() {
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Theme Store - 초기 상태 복원
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  
  // UI Store - Dynamic Tabs & Toast
  const getBottomTabs = useUIStore((state) => state.getBottomTabs);
  const toast = useUIStore((state) => state.toast);
  const hideToast = useUIStore((state) => state.hideToast);
  
  // Get dynamic tabs based on app mode
  const navItems = getBottomTabs();
  
  // 다크 모드 클래스 초기 적용
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Toast icon helper
  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={18} className="text-green-500" />;
      case 'error': return <XCircle size={18} className="text-red-500" />;
      case 'warning': return <AlertTriangle size={18} className="text-yellow-500" />;
      default: return <Info size={18} className="text-blue-500" />;
    }
  };

  const isActive = (path: string) => {
    if (path === "/home") {
      return location.pathname === "/home";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col transition-colors duration-300">
      {/* ============================================ */}
      {/* Top Header Bar */}
      {/* ============================================ */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-800 shadow-sm transition-colors duration-300">
        <div className="h-14 px-4 flex items-center justify-between">
          {/* Left: Menu + Logo */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 -ml-2 rounded-full hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Menu size={22} className="text-gray-600 dark:text-gray-300" />
            </button>
            <Link to="/home" className="flex items-center gap-2">
              <span className="text-2xl">🐕</span>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 dark:from-orange-400 dark:to-pink-400 bg-clip-text text-transparent">
                Repet
              </span>
            </Link>
          </div>

          {/* Right: Notification Bell */}
          <button
            className="p-2 rounded-full hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors relative"
            onClick={() => console.log("Notification clicked")}
          >
            <Bell size={24} className="text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800" />
          </button>
        </div>
      </header>

      {/* ============================================ */}
      {/* Main Content Area */}
      {/* ============================================ */}
      <main className="flex-1 pb-20 overflow-y-auto">
        <Outlet />
      </main>

      {/* ============================================ */}
      {/* Bottom Navigation Bar (Cute Version) */}
      {/* ============================================ */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 z-30 safe-area-bottom transition-colors duration-300">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {navItems.map((item) => {
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center flex-1 h-full py-1 transition-all"
              >
                <div
                  className={`text-2xl transition-transform duration-200 ${
                    active ? "scale-110" : "grayscale opacity-60"
                  }`}
                >
                  {item.emoji}
                </div>
                <span
                  className={`text-xs mt-0.5 font-medium transition-colors ${
                    active 
                      ? "text-orange-500 dark:text-orange-400" 
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {item.label}
                </span>
                {active && (
                  <div className="w-1 h-1 rounded-full bg-orange-500 dark:bg-orange-400 mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ============================================ */}
      {/* Side Drawer */}
      {/* ============================================ */}
      <SideDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />

      {/* ============================================ */}
      {/* Toast Notification */}
      {/* ============================================ */}
      {toast && (
        <div 
          className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down"
          onClick={hideToast}
        >
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg ${
            toast.type === 'success' ? 'bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-700' :
            toast.type === 'error' ? 'bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700' :
            toast.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-700' :
            'bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700'
          }`}>
            {getToastIcon(toast.type)}
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {toast.message}
            </span>
          </div>
        </div>
      )}

      {/* Safe area for iOS */}
      <style>{`
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
