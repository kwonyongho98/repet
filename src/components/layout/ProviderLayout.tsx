import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Calendar, MessageSquare, Settings, Bell, Menu } from "lucide-react";
import SideDrawer from "./SideDrawer";
import { useThemeStore } from "../../stores/useThemeStore";
import { useProviderStore } from "../../stores/useProviderStore";

export default function ProviderLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const myProvider = useProviderStore((state) => state.myProvider);
  const fetchMyProvider = useProviderStore((state) => state.fetchMyProvider);
  
  // Fetch provider info on mount
  useEffect(() => {
    fetchMyProvider();
  }, [fetchMyProvider]);
  
  // Dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Provider Mode Navigation
  const navItems = [
    { path: "/provider/dashboard", icon: LayoutDashboard, label: "대시보드", emoji: "📊" },
    { path: "/provider/schedule", icon: Calendar, label: "일정", emoji: "📅" },
    { path: "/provider/notes", icon: MessageSquare, label: "알림장", emoji: "📝" },
    { path: "/provider/settings", icon: Settings, label: "설정", emoji: "⚙️" },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col transition-colors duration-300">
      {/* ============================================ */}
      {/* Top Header Bar - Provider Theme (Blue) */}
      {/* ============================================ */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 shadow-lg transition-colors duration-300">
        <div className="h-14 px-4 flex items-center justify-between">
          {/* Left: Menu + Provider Name */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <Menu size={22} className="text-white" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏪</span>
              <div>
                <span className="text-lg font-bold text-white">
                  {myProvider?.name || 'Provider'}
                </span>
                <span className="ml-2 px-2 py-0.5 bg-white/20 text-white text-xs rounded-full">
                  Provider
                </span>
              </div>
            </div>
          </div>

          {/* Right: Notification Bell */}
          <button
            className="p-2 rounded-full hover:bg-white/10 transition-colors relative"
            onClick={() => console.log("Notification clicked")}
          >
            <Bell size={24} className="text-white" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-blue-600" />
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
      {/* Bottom Navigation Bar (Provider Theme) */}
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
                      ? "text-blue-500 dark:text-blue-400" 
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {item.label}
                </span>
                {active && (
                  <div className="w-1 h-1 rounded-full bg-blue-500 dark:bg-blue-400 mt-0.5" />
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
