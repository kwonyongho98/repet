import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { PawPrint } from "lucide-react";

export default function SplashScreen() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated && user) {
        if (user.role === "family") {
          navigate("/home");
        } else {
          navigate("/provider/dashboard");
        }
      } else {
        navigate("/login");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, navigate]);

  // 테스트용 강제 로그아웃
  const handleForceLogout = () => {
    logout();
    localStorage.clear(); // 모든 localStorage 삭제
    window.location.reload();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundColor: "var(--color-primary)",
        background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
      }}
    >
      {/* 테스트용 로그아웃 버튼 (나중에 제거) */}
      <button
        onClick={handleForceLogout}
        className="absolute top-4 right-4 px-4 py-2 bg-white text-orange-600 rounded-lg text-sm font-bold"
      >
        강제 로그아웃
      </button>

      <div className="text-center animate-pulse">
        {/* 로고 */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-white opacity-20 rounded-full animate-ping" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-white opacity-30 rounded-full animate-pulse" />
          </div>

          <div className="relative flex items-center justify-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl">
              <span
                className="text-5xl font-bold"
                style={{ color: "var(--color-primary)" }}
              >
                R
              </span>
            </div>
          </div>
        </div>

        <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
          Repet
        </h1>
        <p className="text-xl text-white opacity-90">가족 공유 펫 기록 관리</p>

        <div className="mt-12 flex justify-center gap-3">
          <PawPrint
            className="text-white opacity-60 animate-bounce"
            size={24}
            style={{ animationDelay: "0s" }}
          />
          <PawPrint
            className="text-white opacity-60 animate-bounce"
            size={24}
            style={{ animationDelay: "0.2s" }}
          />
          <PawPrint
            className="text-white opacity-60 animate-bounce"
            size={24}
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      </div>
    </div>
  );
}
