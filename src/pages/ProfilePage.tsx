import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Settings,
  ChevronRight,
  Calendar,
  Ticket,
  PenLine,
  Coins,
  Heart,
  Clock,
  Headphones,
  Megaphone,
  HelpCircle,
  FileText,
  Shield,
  Bell,
  Moon,
  Globe,
  LogOut,
  Star,
  MapPin,
  Scissors,
  Stethoscope,
  Hotel,
  GraduationCap,
  X,
  Trash2,
  AlertTriangle,
  Loader2,
  UserX,
} from "lucide-react";
import { useAuthStore } from "../stores/useAuthStore";
import { useServiceStore } from "../stores/useServiceStore";
import { usePetStore } from "../stores/usePetStore";
import { useThemeStore } from "../stores/useThemeStore";
import { usePlaceStore, type RecentPlace } from "../stores/usePlaceStore";
import { Modal, Button } from "../components/common";
import type { ServiceType } from "../types/service";

// 서비스 타입별 배경색
const getPlaceholderBg = (type: ServiceType) => {
  switch (type) {
    case "grooming":
      return "bg-pink-100 dark:bg-pink-900/40";
    case "hospital":
      return "bg-red-100 dark:bg-red-900/40";
    case "hotel":
      return "bg-blue-100 dark:bg-blue-900/40";
    case "training":
      return "bg-green-100 dark:bg-green-900/40";
  }
};

const getEmoji = (type: ServiceType) => {
  switch (type) {
    case "grooming":
      return "✂️";
    case "hospital":
      return "🏥";
    case "hotel":
      return "🏨";
    case "training":
      return "🎓";
  }
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);
  const bookings = useServiceStore((state) => state.bookings);
  const pets = usePetStore((state) => state.pets);
  const selectedPetId = usePetStore((state) => state.selectedPetId);
  const selectedPet = pets.find((p) => p.id === selectedPetId);

  // Theme Store
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const toggleDarkMode = useThemeStore((state) => state.toggleDarkMode);

  // Place Store
  const savedPlaceIds = usePlaceStore((state) => state.savedPlaceIds);
  const recentPlaces = usePlaceStore((state) => state.recentPlaces);
  const clearRecentPlaces = usePlaceStore((state) => state.clearRecentPlaces);

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // 예약 수 계산
  const upcomingBookings = bookings.filter((b) => b.status === "confirmed");

  // 더미 데이터
  const points = 2500;
  const coupons = 3;
  const reviews = 5;

  // Dashboard Grid 아이템
  const dashboardItems = [
    {
      icon: Calendar,
      label: "예약내역",
      value: upcomingBookings.length.toString(),
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/30",
      link: "/home/service",
    },
    {
      icon: Ticket,
      label: "쿠폰",
      value: coupons.toString(),
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/30",
      link: "#",
    },
    {
      icon: PenLine,
      label: "내 리뷰",
      value: reviews.toString(),
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/30",
      link: "#",
    },
    {
      icon: Coins,
      label: "포인트",
      value: `${points.toLocaleString()} P`,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/30",
      link: "#",
    },
  ];

  // Menu List 아이템
  const menuItems = [
    {
      icon: Heart,
      label: "저장한 장소",
      emoji: "❤️",
      link: "/home/profile/saved-places",
      badge: savedPlaceIds.length > 0 ? savedPlaceIds.length : undefined,
    },
    {
      icon: Clock,
      label: "최근 본 장소",
      emoji: "🕒",
      link: "#",
      badge: recentPlaces.length > 0 ? recentPlaces.length : undefined,
    },
    {
      icon: Headphones,
      label: "고객센터",
      emoji: "📞",
      link: "#",
    },
    {
      icon: Megaphone,
      label: "공지사항",
      emoji: "📢",
      link: "#",
    },
  ];

  // Settings 아이템 (다크모드 제외 - 별도 처리)
  const settingsItems = [
    { icon: Bell, label: "알림 설정", link: "#" },
    { icon: Globe, label: "언어 설정", value: "한국어", link: "#" },
    { icon: Shield, label: "개인정보 처리방침", link: "#" },
    { icon: FileText, label: "이용약관", link: "#" },
    { icon: HelpCircle, label: "앱 정보", value: "v1.0.0", link: "#" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const success = await deleteAccount();
      if (success) {
        navigate("/login", { replace: true });
      } else {
        setDeleteError("회원 탈퇴에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("Delete account error:", error);
      setDeleteError("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="pb-8 bg-gray-50 dark:bg-slate-900 min-h-full">
      {/* ============================================ */}
      {/* Header */}
      {/* ============================================ */}
      <div className="bg-white dark:bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-gray-100 dark:border-slate-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          MY
        </h1>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
          <Settings size={22} className="text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* ============================================ */}
      {/* Profile Card */}
      {/* ============================================ */}
      <div className="bg-white dark:bg-slate-800 px-4 py-5 border-b border-gray-100 dark:border-slate-700">
        <button
          onClick={() => {
            /* TODO: Profile Edit */
          }}
          className="w-full flex items-center gap-4"
        >
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {user?.name?.charAt(0) || "U"}
          </div>

          {/* Info */}
          <div className="flex-1 text-left">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {user?.name || "사용자"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user?.email || "user@example.com"}
            </p>
            {selectedPet && (
              <div className="flex items-center gap-1 mt-1">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedPet.color }}
                />
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {selectedPet.name}의 집사
                </span>
              </div>
            )}
          </div>

          {/* Arrow */}
          <ChevronRight
            size={20}
            className="text-gray-300 dark:text-gray-600"
          />
        </button>
      </div>

      {/* ============================================ */}
      {/* Dashboard Grid */}
      {/* ============================================ */}
      <div className="bg-white dark:bg-slate-800 px-4 py-5 border-b border-gray-100 dark:border-slate-700">
        <div className="grid grid-cols-4 gap-3">
          {dashboardItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                to={item.link}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div
                  className={`w-12 h-12 rounded-2xl ${item.bgColor} flex items-center justify-center`}
                >
                  <Icon size={24} className={item.color} />
                </div>
                <span className={`text-sm font-bold ${item.color}`}>
                  {item.value}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ============================================ */}
      {/* Recently Viewed Section */}
      {/* ============================================ */}
      {recentPlaces.length > 0 && (
        <div className="bg-white dark:bg-slate-800 mt-3 border-b border-gray-100 dark:border-slate-700">
          {/* Section Header */}
          <div className="px-4 py-3 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span>👀</span>
              <span>최근 본 장소</span>
            </h3>
            <button
              onClick={clearRecentPlaces}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <Trash2 size={14} />
              전체 삭제
            </button>
          </div>

          {/* Horizontal Scroll */}
          <div className="px-4 pb-4 overflow-x-auto scrollbar-hide">
            <div className="flex gap-3" style={{ minWidth: "max-content" }}>
              {recentPlaces.slice(0, 10).map((place) => (
                <RecentPlaceCard key={place.id} place={place} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* Menu List */}
      {/* ============================================ */}
      <div className="bg-white dark:bg-slate-800 mt-3">
        {menuItems.map((item, idx) => {
          return (
            <Link
              key={idx}
              to={item.link}
              className={`flex items-center justify-between px-4 py-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${
                idx !== menuItems.length - 1
                  ? "border-b border-gray-50 dark:border-slate-700"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.emoji}</span>
                <span className="text-gray-700 dark:text-gray-200 font-medium">
                  {item.label}
                </span>
                {item.badge && (
                  <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-300 text-xs font-bold rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <ChevronRight
                size={18}
                className="text-gray-300 dark:text-gray-600"
              />
            </Link>
          );
        })}
      </div>

      {/* ============================================ */}
      {/* Settings Section */}
      {/* ============================================ */}
      <div className="mt-3">
        <div className="px-4 py-3 bg-gray-50 dark:bg-slate-900">
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            설정
          </h3>
        </div>
        <div className="bg-white dark:bg-slate-800">
          {/* Night Walk Mode Toggle - Special Item */}
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border-b border-gray-50 dark:border-slate-700"
          >
            <div className="flex items-center gap-3">
              <Moon
                size={20}
                className={`${
                  isDarkMode ? "text-orange-400" : "text-gray-400"
                }`}
              />
              <span className="text-gray-700 dark:text-gray-200">
                야간 산책 모드 🌙
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Toggle Switch */}
              <div
                className={`w-11 h-6 rounded-full relative transition-colors ${
                  isDarkMode ? "bg-orange-500 dark:bg-orange-400" : "bg-gray-200 dark:bg-slate-600"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                    isDarkMode ? "left-6" : "left-1"
                  }`}
                />
              </div>
            </div>
          </button>

          {/* Other Settings */}
          {settingsItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                className={`w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${
                  idx !== settingsItems.length - 1
                    ? "border-b border-gray-50 dark:border-slate-700"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className="text-gray-400 dark:text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-200">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {item.value && (
                    <span className="text-sm text-gray-400 dark:text-gray-500">
                      {item.value}
                    </span>
                  )}
                  <ChevronRight
                    size={18}
                    className="text-gray-300 dark:text-gray-600"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================ */}
      {/* Logout Button */}
      {/* ============================================ */}
      <div className="px-4 mt-6 space-y-3">
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-red-500 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors font-medium"
        >
          <LogOut size={20} />
          로그아웃
        </button>

        {/* Delete Account Button */}
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors text-sm"
        >
          <UserX size={16} />
          회원 탈퇴
        </button>
      </div>

      {/* ============================================ */}
      {/* Footer */}
      {/* ============================================ */}
      <div className="px-4 py-8 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          © 2024 Repet Inc. All rights reserved.
        </p>
        <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">
          버전 1.0.0
        </p>
      </div>

      {/* ============================================ */}
      {/* Logout Confirmation Modal */}
      {/* ============================================ */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="로그아웃"
      >
        <div className="text-center py-4">
          <div className="text-5xl mb-4">👋</div>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            정말 로그아웃 하시겠어요?
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1 rounded-xl"
              onClick={() => setIsLogoutModalOpen(false)}
            >
              취소
            </Button>
            <Button
              variant="danger"
              className="flex-1 rounded-xl"
              onClick={handleLogout}
            >
              로그아웃
            </Button>
          </div>
        </div>
      </Modal>

      {/* ============================================ */}
      {/* Delete Account Confirmation Modal */}
      {/* ============================================ */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteError(null);
        }}
        title="회원 탈퇴"
      >
        <div className="py-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">
            정말 탈퇴하시겠어요?
          </h3>
          
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-600 dark:text-red-400 mb-2 font-medium">
              ⚠️ 탈퇴 시 모든 데이터가 삭제됩니다:
            </p>
            <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
              <li>• 등록된 반려동물 정보</li>
              <li>• 산책, 식사 등 모든 기록</li>
              <li>• 캘린더 일정</li>
              <li>• 가족 정보</li>
            </ul>
          </div>

          <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-6">
            이 작업은 되돌릴 수 없습니다.
          </p>

          {deleteError && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl mb-4 text-center">
              {deleteError}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1 rounded-xl"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeleteError(null);
              }}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="danger"
              className="flex-1 rounded-xl"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "탈퇴하기"
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// ============================================
// Recent Place Card Component
// ============================================
function RecentPlaceCard({ place }: { place: RecentPlace }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/home/service")}
      className="flex-shrink-0 w-32 bg-gray-50 dark:bg-slate-700 rounded-2xl overflow-hidden hover:shadow-md transition-all"
    >
      {/* Image */}
      <div
        className={`h-20 flex items-center justify-center ${getPlaceholderBg(
          place.type
        )}`}
      >
        <span className="text-3xl opacity-50">{getEmoji(place.type)}</span>
      </div>

      {/* Info */}
      <div className="p-2">
        <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate leading-tight">
          {place.name}
        </h4>
        <div className="flex items-center gap-1 mt-1">
          <Star size={10} className="text-yellow-400 fill-yellow-400" />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {place.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </button>
  );
}
