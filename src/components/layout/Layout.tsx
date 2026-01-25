import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, Calendar, MapPin, User, Bell, Menu } from "lucide-react";
import SideDrawer from "./SideDrawer";
import { useThemeStore } from "../../stores/useThemeStore";

export default function Layout() {
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Theme Store - 초기 상태 복원
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  
  // 다크 모드 클래스 초기 적용
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const navItems = [
    { path: "/home", icon: Home, label: "홈", emoji: "🏠" },
    { path: "/home/calendar", icon: Calendar, label: "일기장", emoji: "📖" },
    { path: "/home/service", icon: MapPin, label: "서비스", emoji: "🏥" },
    { path: "/home/profile", icon: User, label: "마이", emoji: "👤" },
  ];

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

      {/* Safe area for iOS */}
      <style>{`
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
      `}</style>
    </div>
  );
}
