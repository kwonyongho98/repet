import { useEffect, useState } from "react";
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
  Building2,
  QrCode,
  Loader2,
  AlertCircle,
  Check,
  Copy,
} from "lucide-react";
import { usePetStore } from "../../stores/usePetStore";
import { useFamilyStore } from "../../stores/useFamilyStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { useThemeStore } from "../../stores/useThemeStore";
import { useUIStore } from "../../stores/useUIStore";
import { useProviderStore } from "../../stores/useProviderStore";
import { serviceTypeConfig } from "../../types/provider";
import { supabase } from "../../lib/supabase";

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
  const familyInviteCode = useFamilyStore((state) => state.inviteCode);
  const createFamilyInvite = useFamilyStore((state) => state.createInvite);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const toggleDarkMode = useThemeStore((state) => state.toggleDarkMode);
  
  // UI Store (Mode Switching)
  const viewMode = useUIStore((state) => state.viewMode);
  const setViewMode = useUIStore((state) => state.setViewMode);
  
  // Provider Store
  const myProvider = useProviderStore((state) => state.myProvider);
  const isProviderOwner = useProviderStore((state) => state.isProviderOwner);
  const myProviders = useProviderStore((state) => state.myProviders);
  const fetchMyProviders = useProviderStore((state) => state.fetchMyProviders);
  const acceptInviteCode = useProviderStore((state) => state.acceptInviteCode);

  // 🔥 가족 초대 코드 상태
  const [showFamilyInvite, setShowFamilyInvite] = useState(false);
  const [isGeneratingFamilyCode, setIsGeneratingFamilyCode] = useState(false);
  const [familyCodeCopied, setFamilyCodeCopied] = useState(false);

  // 🔥 업체 초대 코드 입력 상태
  const [showProviderInvite, setShowProviderInvite] = useState(false);
  const [providerInviteCode, setProviderInviteCode] = useState("");
  const [isVerifyingProvider, setIsVerifyingProvider] = useState(false);
  const [providerVerifyError, setProviderVerifyError] = useState<string | null>(null);
  const [verifiedProvider, setVerifiedProvider] = useState<any>(null);
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);
  const [isConnectingProvider, setIsConnectingProvider] = useState(false);

  // Fetch providers on mount
  useEffect(() => {
    if (user?.familyId) {
      fetchMyProviders(user.familyId);
    }
  }, [user?.familyId, fetchMyProviders]);

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

  // Reset state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setShowFamilyInvite(false);
      setFamilyCodeCopied(false);
      setShowProviderInvite(false);
      setProviderInviteCode("");
      setProviderVerifyError(null);
      setVerifiedProvider(null);
      setSelectedPetIds([]);
    }
  }, [isOpen]);

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

  // ============================================
  // 🔥 가족 초대 코드 생성 & 복사
  // ============================================
  const handleGenerateFamilyCode = async () => {
    setIsGeneratingFamilyCode(true);
    try {
      await createFamilyInvite(user?.id || '');
    } finally {
      setIsGeneratingFamilyCode(false);
    }
  };

  const handleCopyFamilyCode = () => {
    if (familyInviteCode) {
      navigator.clipboard.writeText(familyInviteCode);
      setFamilyCodeCopied(true);
      setTimeout(() => setFamilyCodeCopied(false), 2000);
    }
  };

  // ============================================
  // 🔥 업체 초대 코드 검증
  // ============================================
  const handleVerifyProviderCode = async () => {
    if (!providerInviteCode.trim() || providerInviteCode.length < 6) {
      setProviderVerifyError("6자리 코드를 입력해주세요.");
      return;
    }

    setIsVerifyingProvider(true);
    setProviderVerifyError(null);

    try {
      const { data: invite, error: inviteError } = await supabase
        .from("provider_invites")
        .select(`
          *,
          service_providers (id, business_name, service_type, phone, address)
        `)
        .eq("code", providerInviteCode.toUpperCase())
        .single();

      if (inviteError || !invite) {
        setProviderVerifyError("유효하지 않은 초대 코드입니다.");
        return;
      }

      if (new Date(invite.expires_at) < new Date()) {
        setProviderVerifyError("만료된 초대 코드입니다.");
        return;
      }

      if (invite.use_count >= invite.max_uses) {
        setProviderVerifyError("사용 횟수를 초과한 코드입니다.");
        return;
      }

      setVerifiedProvider(invite.service_providers);
    } catch {
      setProviderVerifyError("오류가 발생했습니다.");
    } finally {
      setIsVerifyingProvider(false);
    }
  };

  // 🔥 펫 선택 토글
  const togglePetSelection = (petId: string) => {
    setSelectedPetIds((prev) =>
      prev.includes(petId)
        ? prev.filter((id) => id !== petId)
        : [...prev, petId]
    );
  };

  // 🔥 업체 연결
  const handleConnectProvider = async () => {
    if (selectedPetIds.length === 0) {
      setProviderVerifyError("연결할 아이를 선택해주세요.");
      return;
    }

    setIsConnectingProvider(true);
    setProviderVerifyError(null);

    try {
      const success = await acceptInviteCode(providerInviteCode.toUpperCase(), selectedPetIds);
      if (success) {
        if (user?.familyId) {
          await fetchMyProviders(user.familyId);
        }
        // 성공 후 초기화
        setShowProviderInvite(false);
        setProviderInviteCode("");
        setVerifiedProvider(null);
        setSelectedPetIds([]);
      } else {
        setProviderVerifyError("연결에 실패했습니다.");
      }
    } catch {
      setProviderVerifyError("오류가 발생했습니다.");
    } finally {
      setIsConnectingProvider(false);
    }
  };

  if (!isOpen) return null;

  // 현재 사용자가 owner인지 확인
  const currentMember = members.find(m => m.id === user?.id);
  const isOwner = currentMember?.role === 'owner';

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={`
          absolute top-0 left-0 bottom-0 w-80 
          bg-white dark:bg-slate-900 
          border-r border-gray-100 dark:border-slate-800
          shadow-2xl
          transform transition-transform duration-300 ease-out
          flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-gray-100 dark:border-slate-800 flex-shrink-0">
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

        {/* Content - Scrollable */}
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

                    <div className="flex-1 text-left">
                      <p className="font-bold text-gray-900 dark:text-gray-100">{pet.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{pet.breed}</p>
                    </div>

                    {isSelected && (
                      <Heart size={18} className="text-orange-500 dark:text-orange-400 fill-orange-500 dark:fill-orange-400" />
                    )}
                  </button>
                );
              })}

              {/* Add Pet */}
              <Link
                to="/home/pets"
                onClick={onClose}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                  <Plus size={20} className="text-gray-400 dark:text-gray-500" />
                </div>
                <span className="font-medium text-gray-500 dark:text-gray-400">새 아이 등록하기</span>
              </Link>
            </div>
          </div>

          {/* ============================================ */}
          {/* Family Section - 🔥 초대 코드 생성 UI 추가 */}
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
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                    {member.name.charAt(0)}
                  </div>

                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{member.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{member.relationship}</p>
                  </div>

                  {member.role === "owner" && (
                    <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-300 text-xs font-medium rounded-full">
                      관리자
                    </span>
                  )}
                </div>
              ))}

              {/* 🔥 가족 초대하기 - 업체 추가와 통일된 UX */}
              {showFamilyInvite ? (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <UserPlus size={18} className="text-blue-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">가족 초대 코드</span>
                  </div>

                  {familyInviteCode ? (
                    // 코드가 있으면 표시
                    <>
                      <div className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-xl">
                        <code className="text-2xl font-mono font-bold tracking-widest text-blue-600 dark:text-blue-400">
                          {familyInviteCode}
                        </code>
                        <button
                          onClick={handleCopyFamilyCode}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          {familyCodeCopied ? (
                            <Check size={20} className="text-green-500" />
                          ) : (
                            <Copy size={20} className="text-gray-400" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        이 코드를 가족에게 공유하세요.
                        <br />
                        가입 시 "초대 코드로 합류"를 선택하면 됩니다.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowFamilyInvite(false)}
                          className="flex-1 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                          닫기
                        </button>
                        <button
                          onClick={handleGenerateFamilyCode}
                          disabled={isGeneratingFamilyCode}
                          className="flex-1 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-center gap-1"
                        >
                          {isGeneratingFamilyCode ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            "새 코드 생성"
                          )}
                        </button>
                      </div>
                    </>
                  ) : (
                    // 코드가 없으면 생성 버튼
                    <>
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        초대 코드를 생성하여 가족에게 공유하세요.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowFamilyInvite(false)}
                          className="flex-1 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                          취소
                        </button>
                        <button
                          onClick={handleGenerateFamilyCode}
                          disabled={isGeneratingFamilyCode}
                          className="flex-1 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center justify-center gap-1"
                        >
                          {isGeneratingFamilyCode ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            "코드 생성"
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                // 가족 초대하기 버튼
                <button
                  onClick={() => setShowFamilyInvite(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                    <UserPlus size={20} className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">가족 초대하기</span>
                </button>
              )}
            </div>
          </div>

          {/* ============================================ */}
          {/* 이용 중인 업체 섹션 */}
          {/* ============================================ */}
          <div className="p-4 border-b border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Building2 size={18} className="text-green-500 dark:text-green-400" />
                이용 중인 업체
              </h3>
              {myProviders.length > 0 && (
                <Link 
                  to="/home/provider-connect"
                  onClick={onClose}
                  className="text-xs text-green-500 dark:text-green-400 font-medium"
                >
                  관리
                </Link>
              )}
            </div>

            <div className="space-y-2">
              {/* 연결된 업체 목록 */}
              {myProviders.map((provider) => {
                const config = serviceTypeConfig[provider.serviceType as keyof typeof serviceTypeConfig];
                return (
                  <button
                    key={provider.id}
                    onClick={() => {
                      onClose();
                      navigate('/home/communication');
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all"
                  >
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{ backgroundColor: (config?.color || '#22c55e') + '20' }}
                    >
                      {config?.emoji || '🏢'}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{provider.businessName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{config?.label || provider.serviceType}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </button>
                );
              })}

              {/* 업체 초대 코드 입력 UI */}
              {showProviderInvite ? (
                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl space-y-3">
                  {!verifiedProvider ? (
                    // Step 1: 코드 입력
                    <>
                      <div className="flex items-center gap-2">
                        <QrCode size={18} className="text-green-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">업체 초대 코드 입력</span>
                      </div>
                      <input
                        type="text"
                        value={providerInviteCode}
                        onChange={(e) => setProviderInviteCode(e.target.value.toUpperCase())}
                        placeholder="ABCD12"
                        maxLength={6}
                        className="w-full px-3 py-2 text-center text-lg font-mono tracking-widest bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      {providerVerifyError && (
                        <div className="flex items-center gap-2 text-red-500 text-xs">
                          <AlertCircle size={14} />
                          {providerVerifyError}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowProviderInvite(false);
                            setProviderInviteCode("");
                            setProviderVerifyError(null);
                          }}
                          className="flex-1 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                        >
                          취소
                        </button>
                        <button
                          onClick={handleVerifyProviderCode}
                          disabled={isVerifyingProvider || providerInviteCode.length < 6}
                          className="flex-1 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center justify-center gap-1"
                        >
                          {isVerifyingProvider ? <Loader2 size={16} className="animate-spin" /> : "확인"}
                        </button>
                      </div>
                    </>
                  ) : (
                    // Step 2: 펫 선택
                    <>
                      <div className="text-center p-3 bg-white dark:bg-slate-700 rounded-xl">
                        <p className="font-bold text-gray-900 dark:text-white">{verifiedProvider.business_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {serviceTypeConfig[verifiedProvider.service_type as keyof typeof serviceTypeConfig]?.label || verifiedProvider.service_type}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 text-center">연결할 아이를 선택하세요</p>
                      <div className="space-y-1">
                        {pets.map((pet) => {
                          const isSelected = selectedPetIds.includes(pet.id);
                          return (
                            <button
                              key={pet.id}
                              onClick={() => togglePetSelection(pet.id)}
                              className={`w-full flex items-center gap-2 p-2 rounded-xl transition-all ${
                                isSelected 
                                  ? "bg-green-100 dark:bg-green-900/40 ring-1 ring-green-500" 
                                  : "bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600"
                              }`}
                            >
                              <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                style={{ backgroundColor: pet.color }}
                              >
                                {pet.profileImage ? (
                                  <img src={pet.profileImage} alt={pet.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  pet.name.charAt(0)
                                )}
                              </div>
                              <span className="flex-1 text-left text-sm font-medium text-gray-900 dark:text-white">{pet.name}</span>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? "bg-green-500 border-green-500" : "border-gray-300 dark:border-slate-500"
                              }`}>
                                {isSelected && <Check size={12} className="text-white" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {providerVerifyError && (
                        <div className="flex items-center gap-2 text-red-500 text-xs">
                          <AlertCircle size={14} />
                          {providerVerifyError}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setVerifiedProvider(null);
                            setSelectedPetIds([]);
                            setProviderVerifyError(null);
                          }}
                          className="flex-1 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                        >
                          이전
                        </button>
                        <button
                          onClick={handleConnectProvider}
                          disabled={isConnectingProvider || selectedPetIds.length === 0}
                          className="flex-1 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center justify-center gap-1"
                        >
                          {isConnectingProvider ? <Loader2 size={16} className="animate-spin" /> : "연결하기"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                // 업체 추가 버튼
                <button
                  onClick={() => setShowProviderInvite(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                    <Plus size={20} className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">업체 추가하기</span>
                </button>
              )}
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
              
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${viewMode === 'family' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  현재: {viewMode === 'family' ? '가족 모드' : 'Provider 모드'}
                </span>
              </div>

              {viewMode === 'family' ? (
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
        <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex-shrink-0">
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
