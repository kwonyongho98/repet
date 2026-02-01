import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  X,
  Plus,
  UserPlus,
  LogOut,
  ChevronRight,
  Settings,
  PawPrint,
  Users,
  Heart,
  Moon,
  Sun,
  Store,
  ArrowLeftRight,
  Home,
} from "lucide-react";
import { usePetStore } from "../../stores/usePetStore";
import { useFamilyStore } from "../../stores/useFamilyStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { useThemeStore } from "../../stores/useThemeStore";
import { useUIStore } from "../../stores/useUIStore";
import { useProviderStore } from "../../stores/useProviderStore";

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SideDrawer({ isOpen, onClose }: SideDrawerProps) {
  const navigate = useNavigate();
  
  // Stores
  const pets = usePetStore((state) => state.pets);
  const selectedPetId = usePetStore((state) => state.selectedPetId);
  const setSelectedPetId = usePetStore((state) => state.setSelectedPetId);
  const members = useFamilyStore((state) => state.members);
  const logout = useAuthStore((state) => state.logout);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const toggleDarkMode = useThemeStore((state) => state.toggleDarkMode);
  
  // UI Store (Mode Switching)
  const viewMode = useUIStore((state) => state.viewMode);
  const setViewMode = useUIStore((state) => state.setViewMode);
  
  // Provider Store
  const myProvider = useProviderStore((state) => state.myProvider);
  const isProviderOwner = useProviderStore((state) => state.isProviderOwner);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/login");
  };

  const handlePetClick = (petId: string) => {
    setSelectedPetId(petId);
    onClose();
    navigate("/home");
  };

  // Mode Switching
  const handleSwitchToProvider = () => {
    setViewMode('provider');
    onClose();
    navigate('/provider/dashboard');
  };

  const handleSwitchToFamily = () => {
    setViewMode('family');
    onClose();
    navigate('/home');
  };

  const handleRegisterProvider = () => {
    onClose();
    navigate('/provider/register');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Drawer - Dark Mode Fixed */}
      <div 
        className={`
          absolute top-0 left-0 bottom-0 w-80 
          bg-white dark:bg-slate-900 
          border-r border-gray-100 dark:border-slate-800
          shadow-2xl
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐕</span>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 dark:from-orange-400 dark:to-pink-400 bg-clip-text text-transparent">
              Repet
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* ============================================ */}
          {/* Pet Section */}
          {/* ============================================ */}
          <div className="p-4 border-b border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <PawPrint size={18} className="text-orange-500 dark:text-orange-400" />
                우리 아이들
              </h3>
              <Link 
                to="/home/pets"
                onClick={onClose}
                className="text-xs text-orange-500 dark:text-orange-400 font-medium"
              >
                관리
              </Link>
            </div>

            <div className="space-y-2">
              {pets.map((pet) => {
                const isSelected = pet.id === selectedPetId;
                return (
                  <button
                    key={pet.id}
                    onClick={() => handlePetClick(pet.id)}
                    className={`
                      w-full flex items-center gap-3 p-3 rounded-2xl transition-all
                      ${isSelected 
                        ? "bg-orange-50 dark:bg-orange-900/30 ring-2 ring-orange-500 dark:ring-orange-400" 
                        : "bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700"
                      }
                    `}
                  >
                    {/* Avatar */}
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                      style={{ backgroundColor: pet.color }}
                    >
                      {pet.profileImage ? (
                        <img 
                          src={pet.profileImage} 
                          alt={pet.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        pet.name.charAt(0)
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-left">
                      <p className="font-bold text-gray-900 dark:text-gray-100">{pet.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{pet.breed}</p>
                    </div>

                    {/* Selected Indicator */}
                    {isSelected && (
                      <Heart size={18} className="text-orange-500 dark:text-orange-400 fill-orange-500 dark:fill-orange-400" />
                    )}
                  </button>
                );
              })}

              {/* Add Pet Button */}
              <Link
                to="/home/pets"
                onClick={onClose}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                  <Plus size={24} className="text-gray-400 dark:text-gray-500" />
                </div>
                <span className="font-medium text-gray-500 dark:text-gray-400">새 아이 등록하기</span>
              </Link>
            </div>
          </div>

          {/* ============================================ */}
          {/* Family Section */}
          {/* ============================================ */}
          <div className="p-4 border-b border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Users size={18} className="text-blue-500 dark:text-blue-400" />
                우리 가족
              </h3>
              <Link 
                to="/home/family"
                onClick={onClose}
                className="text-xs text-blue-500 dark:text-blue-400 font-medium"
              >
                관리
              </Link>
            </div>

            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-slate-800"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                    {member.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{member.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{member.relationship}</p>
                  </div>

                  {/* Role Badge */}
                  {member.role === "admin" && (
                    <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-300 text-xs font-medium rounded-full">
                      관리자
                    </span>
                  )}
                </div>
              ))}

              {/* Invite Family Button */}
              <button
                className="w-full flex items-center gap-3 p-3 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                  <UserPlus size={20} className="text-gray-400 dark:text-gray-500" />
                </div>
                <span className="font-medium text-gray-500 dark:text-gray-400">가족 초대하기</span>
              </button>
            </div>
          </div>

          {/* ============================================ */}
          {/* Quick Links */}
          {/* ============================================ */}
          <div className="p-4">
            {/* Mode Switcher Section */}
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl">
              <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
                모드 전환
              </h4>
              
              {/* Current Mode Indicator */}
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${viewMode === 'family' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  현재: {viewMode === 'family' ? '가족 모드' : 'Provider 모드'}
                </span>
              </div>

              {/* Mode Switch Buttons */}
              {viewMode === 'family' ? (
                // In Family Mode - Show options to go to Provider
                isProviderOwner && myProvider ? (
                  <button
                    onClick={handleSwitchToProvider}
                    className="w-full flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors border border-blue-200 dark:border-blue-800"
                  >
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                      <Store size={20} className="text-blue-500" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {myProvider.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Provider 모드로 전환
                      </p>
                    </div>
                    <ArrowLeftRight size={18} className="text-blue-500" />
                  </button>
                ) : (
                  <button
                    onClick={handleRegisterProvider}
                    className="w-full flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors border border-green-200 dark:border-green-800"
                  >
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
                      <Plus size={20} className="text-green-500" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        업체 등록하기
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        펫호텔, 미용실 등 운영 시
                      </p>
                    </div>
                    <ChevronRight size={18} className="text-green-500" />
                  </button>
                )
              ) : (
                // In Provider Mode - Show option to go back to Family
                <button
                  onClick={handleSwitchToFamily}
                  className="w-full flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors border border-orange-200 dark:border-orange-800"
                >
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center">
                    <Home size={20} className="text-orange-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      가족 모드로 돌아가기
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      내 반려동물 관리
                    </p>
                  </div>
                  <ArrowLeftRight size={18} className="text-orange-500" />
                </button>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors mb-2"
            >
              <div className="flex items-center gap-3">
                {isDarkMode ? (
                  <Moon size={20} className="text-orange-400" />
                ) : (
                  <Sun size={20} className="text-gray-400" />
                )}
                <span className="text-gray-700 dark:text-gray-200">
                  {isDarkMode ? "야간 모드 켜짐" : "야간 모드 꺼짐"}
                </span>
              </div>
              <div
                className={`w-11 h-6 rounded-full relative transition-colors ${
                  isDarkMode ? "bg-orange-500" : "bg-gray-200 dark:bg-slate-600"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                    isDarkMode ? "left-6" : "left-1"
                  }`}
                />
              </div>
            </button>

            <Link
              to="/home/profile"
              onClick={onClose}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings size={20} className="text-gray-400 dark:text-gray-500" />
                <span className="text-gray-700 dark:text-gray-200">설정</span>
              </div>
              <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">로그아웃</span>
          </button>
          
          <p className="text-xs text-gray-400 dark:text-gray-600 text-center mt-4">
            Repet v1.0.0 • © 2024 Repet Inc.
          </p>
        </div>
      </div>
    </div>
  );
}
