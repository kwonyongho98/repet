import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, Calendar, Store, User, Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function Layout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { path: "/home", icon: Home, label: "홈" },
    { path: "/home/calendar", icon: Calendar, label: "캘린더" },
    { path: "/home/service", icon: Store, label: "서비스" },
    { path: "/home/profile", icon: User, label: "프로필" },
  ];

  const isActive = (path: string) => {
    if (path === "/home") {
      return location.pathname === "/home";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* 헤더 */}
      <header
        className="sticky top-0 z-30 bg-white shadow-sm"
        style={{ borderBottom: "1px solid var(--color-primary-200)" }}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* 좌측: 햄버거 메뉴 + 로고 */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="메뉴 열기"
            >
              <Menu size={24} style={{ color: "var(--color-secondary-900)" }} />
            </button>

            <Link to="/home" className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                R
              </div>
              <span
                className="text-xl font-bold"
                style={{ color: "var(--color-primary)" }}
              >
                Repet
              </span>
            </Link>
          </div>

          {/* 우측: 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{
                    color: active
                      ? "var(--color-primary)"
                      : "var(--color-secondary-900)",
                    backgroundColor: active
                      ? "var(--color-primary-50)"
                      : "transparent",
                  }}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* 모바일 하단 네비게이션 */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-30"
        style={{ borderTop: "1px solid var(--color-primary-200)" }}
      >
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center flex-1 h-full"
              >
                <Icon
                  size={24}
                  style={{
                    color: active
                      ? "var(--color-primary)"
                      : "var(--color-text-secondary)",
                  }}
                />
                <span
                  className="text-xs mt-1 font-medium"
                  style={{
                    color: active
                      ? "var(--color-primary)"
                      : "var(--color-text-secondary)",
                  }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 사이드바 */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenPetModal={() => {
          setIsSidebarOpen(false);
        }}
        onOpenFamilyModal={() => {
          setIsSidebarOpen(false);
        }}
      />
    </div>
  );
}
