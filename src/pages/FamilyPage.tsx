import { useState } from "react";
import { useFamilyStore } from "../stores/useFamilyStore";
import { useAuthStore } from "../stores/useAuthStore";
import type { FamilyMember, FamilyRole } from "../types/family";
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  Copy,
  Check,
  Loader2,
  Crown,
  User,
  LogOut,
  Link2,
  Home,
} from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

// 🔥 안전한 날짜 포맷 헬퍼 함수
const formatSafeDate = (dateString: string | undefined | null, formatStr: string): string => {
  if (!dateString) return "";
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (!isValid(date)) return "";
    return format(date, formatStr, { locale: ko });
  } catch {
    return "";
  }
};

const roleLabels: Record<FamilyRole, string> = {
  owner: "소유자",
  admin: "관리자",
  member: "멤버",
};

const roleIcons: Record<FamilyRole, React.ReactNode> = {
  owner: <Crown size={14} className="text-amber-500" />,
  admin: <Shield size={14} className="text-blue-500" />,
  member: <User size={14} className="text-gray-500" />,
};

export default function FamilyPage() {
  const members = useFamilyStore((state) => state.members);
  const currentUserId = useFamilyStore((state) => state.currentUserId);
  const inviteCode = useFamilyStore((state) => state.inviteCode);
  const familyName = useFamilyStore((state) => state.familyName);
  const familyId = useFamilyStore((state) => state.familyId);
  const updateMember = useFamilyStore((state) => state.updateMember);
  const removeMember = useFamilyStore((state) => state.removeMember);
  const createInvite = useFamilyStore((state) => state.createInvite);
  const leaveFamily = useFamilyStore((state) => state.leaveFamily);
  const clearFamily = useFamilyStore((state) => state.clearFamily);
  
  // Auth store에서 가져오기
  const user = useAuthStore((state) => state.user);
  const joinFamily = useAuthStore((state) => state.joinFamily);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const checkFamilyByInviteCode = useAuthStore((state) => state.checkFamilyByInviteCode);

  // 모달 상태
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isCreateFamilyModalOpen, setIsCreateFamilyModalOpen] = useState(false);
  
  // 폼 상태
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [editRole, setEditRole] = useState<FamilyRole>('member');
  
  // 초대 코드 입력 상태
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  
  // 가족 나가기 상태
  const [isLeaving, setIsLeaving] = useState(false);
  
  // 새 가족 만들기 상태
  const [newFamilyName, setNewFamilyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const currentUser = members.find((m) => m.id === currentUserId);
  const isOwner = currentUser?.role === "owner";
  const hasFamily = !!familyId;

  // 초대 코드 생성
  const handleGenerateCode = async () => {
    setIsGeneratingCode(true);
    try {
      await createInvite(currentUserId);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // 초대 코드 복사
  const copyInviteCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // 멤버 수정
  const handleEditMember = async () => {
    if (!editingMember) return;
    await updateMember(editingMember.id, { role: editRole });
    setIsEditModalOpen(false);
    setEditingMember(null);
  };

  // 멤버 삭제
  const handleDeleteMember = async () => {
    if (!editingMember) return;
    await removeMember(editingMember.id);
    setIsDeleteModalOpen(false);
    setEditingMember(null);
  };

  // 수정 모달 열기
  const openEditModal = (member: FamilyMember) => {
    setEditingMember(member);
    setEditRole(member.role);
    setIsEditModalOpen(true);
  };

  // 삭제 모달 열기
  const openDeleteModal = (member: FamilyMember) => {
    setEditingMember(member);
    setIsDeleteModalOpen(true);
  };

  // ============================================
  // 초대 코드로 가족 합류
  // ============================================
  const handleJoinFamily = async () => {
    if (!joinCode.trim()) {
      setJoinError('초대 코드를 입력해주세요');
      return;
    }

    if (joinCode.trim().length < 6) {
      setJoinError('초대 코드 6자리를 입력해주세요');
      return;
    }

    setIsJoining(true);
    setJoinError('');

    try {
      // 1️⃣ 먼저 초대 코드 유효성 확인 (DB 조회만, 합류 안 함)
      const checkResult = await checkFamilyByInviteCode(joinCode.trim());
      
      if (!checkResult.exists) {
        setJoinError('유효하지 않은 초대 코드입니다');
        setIsJoining(false);
        return; // 여기서 중단! 가족에서 나가지 않음
      }

      // 2️⃣ 기존 가족이 있으면 나가기 (Owner 포함 - 새 가족 합류 시)
      if (hasFamily && user?.id) {
        const leftSuccess = await leaveFamily(user.id);
        if (!leftSuccess) {
          setJoinError('기존 가족에서 나가는 데 실패했습니다');
          setIsJoining(false);
          return;
        }
        clearFamily();
      }

      // 3️⃣ 새 가족에 합류
      const success = await joinFamily(joinCode.trim());
      
      if (success) {
        setIsJoinModalOpen(false);
        setJoinCode('');
        // 페이지 새로고침하여 가족 정보 다시 로드
        window.location.reload();
      } else {
        setJoinError('가족 합류 중 오류가 발생했습니다');
      }
    } catch (error) {
      console.error('Join family error:', error);
      setJoinError('가족 합류 중 오류가 발생했습니다');
    } finally {
      setIsJoining(false);
    }
  };

  // ============================================
  // 가족 나가기
  // ============================================
  const handleLeaveFamily = async () => {
    if (!user?.id) return;

    setIsLeaving(true);

    try {
      const success = await leaveFamily(user.id);
      
      if (success) {
        clearFamily();
        setIsLeaveModalOpen(false);
        // 페이지 새로고침
        window.location.reload();
      }
    } catch (error) {
      console.error('Leave family error:', error);
    } finally {
      setIsLeaving(false);
    }
  };

  // ============================================
  // 새 가족 만들기
  // ============================================
  const handleCreateFamily = async () => {
    if (!newFamilyName.trim() || !user?.name) return;

    setIsCreating(true);

    try {
      const success = await completeOnboarding(user.name, newFamilyName.trim());
      
      if (success) {
        setIsCreateFamilyModalOpen(false);
        setNewFamilyName('');
        // 페이지 새로고침
        window.location.reload();
      }
    } catch (error) {
      console.error('Create family error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // ============================================
  // 가족이 없는 경우 UI
  // ============================================
  if (!hasFamily) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
          <div className="px-4 py-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              가족 관리
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              가족을 만들거나 합류하세요
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm p-8">
            {/* 아이콘 */}
            <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Users size={40} className="text-orange-500" />
            </div>

            {/* 안내 문구 */}
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                아직 가족이 없어요
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                가족을 만들어 반려동물을 함께 관리하거나,<br />
                초대 코드로 기존 가족에 합류하세요.
              </p>
            </div>

            {/* 버튼들 */}
            <div className="space-y-3">
              {/* 새 가족 만들기 */}
              <button
                onClick={() => setIsCreateFamilyModalOpen(true)}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-3 shadow-sm"
              >
                <Home size={20} />
                새 가족 만들기
              </button>

              {/* 구분선 */}
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
                <span className="text-sm text-gray-400 dark:text-gray-500">또는</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
              </div>

              {/* 초대 코드로 합류 */}
              <button
                onClick={() => setIsJoinModalOpen(true)}
                className="w-full py-4 bg-white dark:bg-slate-700 border-2 border-orange-200 dark:border-orange-900/50 hover:border-orange-400 text-orange-600 dark:text-orange-400 font-semibold rounded-2xl transition-colors flex items-center justify-center gap-3"
              >
                <Link2 size={20} />
                초대 코드로 합류
              </button>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* 초대 코드 입력 모달 */}
        {/* ============================================ */}
        {isJoinModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/50"
              onClick={() => {
                setIsJoinModalOpen(false);
                setJoinCode('');
                setJoinError('');
              }}
            />
            <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Link2 size={32} className="text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    가족에 합류하기
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    가족에게 받은 초대 코드를 입력하세요
                  </p>
                </div>

                {/* 코드 입력 필드 */}
                <div className="mb-4">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => {
                      setJoinCode(e.target.value.toUpperCase());
                      setJoinError('');
                    }}
                    placeholder="초대 코드 6자리"
                    maxLength={6}
                    className="w-full px-4 py-4 text-center text-2xl font-mono font-bold tracking-[0.3em] bg-gray-50 dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-2xl focus:border-orange-500 focus:ring-0 outline-none transition-colors text-gray-900 dark:text-white placeholder:text-gray-400"
                  />
                  {joinError && (
                    <p className="text-sm text-red-500 text-center mt-2">
                      {joinError}
                    </p>
                  )}
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl mb-6">
                  <p className="text-xs text-blue-600 dark:text-blue-400 text-center leading-relaxed">
                    가족 관리자가 생성한<br />
                    <strong>6자리 초대 코드</strong>를 입력하세요
                  </p>
                </div>

                {/* 기존 가족이 있을 때 경고 */}
                {hasFamily && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl mb-4 border border-amber-200 dark:border-amber-800">
                    <p className="text-xs text-amber-700 dark:text-amber-400 text-center leading-relaxed">
                      ⚠️ 현재 <strong>"{familyName}"</strong> 가족에 속해 있습니다.<br />
                      합류 시 기존 가족에서 <strong>자동으로 나가게</strong> 됩니다.
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsJoinModalOpen(false);
                      setJoinCode('');
                      setJoinError('');
                    }}
                    className="flex-1 py-3 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-slate-700 rounded-2xl transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleJoinFamily}
                    disabled={isJoining || joinCode.length < 6}
                    className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-2xl transition-colors flex items-center justify-center gap-2"
                  >
                    {isJoining ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      "합류하기"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* 새 가족 만들기 모달 */}
        {/* ============================================ */}
        {isCreateFamilyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/50"
              onClick={() => {
                setIsCreateFamilyModalOpen(false);
                setNewFamilyName('');
              }}
            />
            <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Home size={32} className="text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    새 가족 만들기
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    가족 이름을 입력하세요
                  </p>
                </div>

                {/* 가족 이름 입력 */}
                <div className="mb-6">
                  <input
                    type="text"
                    value={newFamilyName}
                    onChange={(e) => setNewFamilyName(e.target.value)}
                    placeholder={`${user?.name || '우리'}의 가족`}
                    maxLength={20}
                    className="w-full px-4 py-4 text-center text-lg font-medium bg-gray-50 dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-2xl focus:border-orange-500 focus:ring-0 outline-none transition-colors text-gray-900 dark:text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsCreateFamilyModalOpen(false);
                      setNewFamilyName('');
                    }}
                    className="flex-1 py-3 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-slate-700 rounded-2xl transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleCreateFamily}
                    disabled={isCreating}
                    className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-2xl transition-colors flex items-center justify-center gap-2"
                  >
                    {isCreating ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      "만들기"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================
  // 가족이 있는 경우 기존 UI
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                가족 관리
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {familyName || '우리 가족'}의 구성원
              </p>
            </div>
            {isOwner && (
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-2xl transition-colors shadow-sm"
              >
                <UserPlus size={18} />
                <span>초대하기</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* 가족 구성원 카드 */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users size={18} className="text-orange-500" />
              가족 구성원
              <span className="ml-1 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-full">
                {members.length}명
              </span>
            </h2>
          </div>

          <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
            {members.map((member) => (
              <div
                key={member.id}
                className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {member.name.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {member.name}
                    </p>
                    {member.isCurrentUser && (
                      <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-md">
                        나
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {member.email}
                  </p>
                  {formatSafeDate(member.joinedAt, "yyyy년 M월 d일") && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {formatSafeDate(member.joinedAt, "yyyy년 M월 d일")} 가입
                    </p>
                  )}
                </div>

                {/* Role Badge */}
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium ${
                    member.role === 'owner' 
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      : member.role === 'admin'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {roleIcons[member.role]}
                    {roleLabels[member.role]}
                  </span>

                  {/* Actions */}
                  {isOwner && !member.isCurrentUser && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(member)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                      >
                        <Shield size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(member)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 가족이 없을 때 안내 */}
        {members.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-orange-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              아직 가족 구성원이 없어요
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              초대하기 버튼을 눌러 가족을 초대해보세요
            </p>
          </div>
        )}

        {/* ============================================ */}
        {/* 가족 설정 카드 */}
        {/* ============================================ */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm p-4 space-y-2">
          {/* 다른 가족에 합류하기 버튼 (항상 표시) */}
          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="w-full py-3 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-medium rounded-2xl transition-colors flex items-center justify-center gap-2 border border-orange-200 dark:border-orange-900/50"
          >
            <Link2 size={18} />
            다른 가족에 합류하기
          </button>

          {/* 가족 나가기 버튼 (owner가 아닌 경우만) */}
          {!isOwner && (
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="w-full py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              가족 나가기
            </button>
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/* 초대 모달 - 코드 생성 + 표시 통합 */}
      {/* ============================================ */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsInviteModalOpen(false)}
          />
          <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UserPlus size={32} className="text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  가족 초대하기
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  초대 코드를 가족에게 공유하세요
                </p>
              </div>

              {inviteCode ? (
                // 코드가 있으면 표시
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-2xl">
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
                      초대 코드
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <code className="text-3xl font-mono font-bold tracking-[0.3em] text-orange-600 dark:text-orange-400">
                        {inviteCode}
                      </code>
                      <button
                        onClick={copyInviteCode}
                        className="p-2.5 bg-white dark:bg-slate-600 hover:bg-gray-100 dark:hover:bg-slate-500 rounded-xl transition-colors shadow-sm"
                      >
                        {copiedCode ? (
                          <Check size={20} className="text-green-500" />
                        ) : (
                          <Copy size={20} className="text-gray-500 dark:text-gray-400" />
                        )}
                      </button>
                    </div>
                    {copiedCode && (
                      <p className="text-xs text-green-500 text-center mt-2">
                        복사되었습니다!
                      </p>
                    )}
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                    <p className="text-xs text-blue-600 dark:text-blue-400 text-center leading-relaxed">
                      가족이 앱 가입 시<br />
                      <strong>"기존 가족에 합류"</strong>를 선택하고<br />
                      이 코드를 입력하면 됩니다
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsInviteModalOpen(false)}
                      className="flex-1 py-3 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-slate-700 rounded-2xl transition-colors"
                    >
                      닫기
                    </button>
                    <button
                      onClick={handleGenerateCode}
                      disabled={isGeneratingCode}
                      className="flex-1 py-3 text-orange-600 dark:text-orange-400 font-medium hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-2xl transition-colors flex items-center justify-center gap-2"
                    >
                      {isGeneratingCode ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        "새 코드 생성"
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                // 코드가 없으면 생성 버튼
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    아직 초대 코드가 없습니다.<br />
                    코드를 생성해서 가족에게 공유하세요.
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsInviteModalOpen(false)}
                      className="flex-1 py-3 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-slate-700 rounded-2xl transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleGenerateCode}
                      disabled={isGeneratingCode}
                      className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-2xl transition-colors flex items-center justify-center gap-2"
                    >
                      {isGeneratingCode ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        "코드 생성하기"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* 역할 수정 모달 */}
      {/* ============================================ */}
      {isEditModalOpen && editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsEditModalOpen(false)}
          />
          <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">
                역할 변경
              </h3>

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-2xl mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white font-bold">
                  {editingMember.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{editingMember.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{editingMember.email}</p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {(['member', 'admin'] as FamilyRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => setEditRole(role)}
                    className={`w-full p-3 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                      editRole === role
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-slate-600 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      role === 'admin' 
                        ? 'bg-blue-100 dark:bg-blue-900/30' 
                        : 'bg-gray-100 dark:bg-slate-700'
                    }`}>
                      {roleIcons[role]}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">{roleLabels[role]}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {role === 'admin' ? '멤버 관리 가능' : '기본 권한'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-slate-700 rounded-2xl transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleEditMember}
                  className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-2xl transition-colors"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* 삭제 확인 모달 */}
      {/* ============================================ */}
      {isDeleteModalOpen && editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsDeleteModalOpen(false)}
          />
          <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Trash2 size={28} className="text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  구성원 내보내기
                </h3>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-2xl mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white font-bold">
                  {editingMember.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{editingMember.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{editingMember.email}</p>
                </div>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
                이 구성원을 가족에서 내보내시겠습니까?<br />
                <span className="text-red-500">더 이상 반려동물 정보에 접근할 수 없습니다.</span>
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-3 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-slate-700 rounded-2xl transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleDeleteMember}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-2xl transition-colors"
                >
                  내보내기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* 가족 나가기 확인 모달 */}
      {/* ============================================ */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsLeaveModalOpen(false)}
          />
          <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <LogOut size={28} className="text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  가족 나가기
                </h3>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-2xl mb-4">
                <p className="text-center text-gray-900 dark:text-white font-medium">
                  {familyName || '우리 가족'}
                </p>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
                정말 이 가족에서 나가시겠습니까?<br />
                <span className="text-red-500">더 이상 가족의 반려동물 정보를 볼 수 없습니다.</span>
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="flex-1 py-3 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-slate-700 rounded-2xl transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleLeaveFamily}
                  disabled={isLeaving}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-2xl transition-colors flex items-center justify-center gap-2"
                >
                  {isLeaving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    "나가기"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* 다른 가족에 합류하기 모달 (기존 가족이 있는 경우) */}
      {/* ============================================ */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setIsJoinModalOpen(false);
              setJoinCode('');
              setJoinError('');
            }}
          />
          <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Link2 size={32} className="text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  다른 가족에 합류하기
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  가족에게 받은 초대 코드를 입력하세요
                </p>
              </div>

              {/* 코드 입력 필드 */}
              <div className="mb-4">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => {
                    setJoinCode(e.target.value.toUpperCase());
                    setJoinError('');
                  }}
                  placeholder="초대 코드 6자리"
                  maxLength={6}
                  className="w-full px-4 py-4 text-center text-2xl font-mono font-bold tracking-[0.3em] bg-gray-50 dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-2xl focus:border-orange-500 focus:ring-0 outline-none transition-colors text-gray-900 dark:text-white placeholder:text-gray-400"
                />
                {joinError && (
                  <p className="text-sm text-red-500 text-center mt-2">
                    {joinError}
                  </p>
                )}
              </div>

              {/* 기존 가족이 있을 때 경고 */}
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl mb-4 border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-400 text-center leading-relaxed">
                  ⚠️ 현재 <strong>"{familyName}"</strong> 가족에 속해 있습니다.<br />
                  합류 시 기존 가족에서 <strong>자동으로 나가게</strong> 됩니다.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsJoinModalOpen(false);
                    setJoinCode('');
                    setJoinError('');
                  }}
                  className="flex-1 py-3 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-slate-700 rounded-2xl transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleJoinFamily}
                  disabled={isJoining || joinCode.length < 6}
                  className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-2xl transition-colors flex items-center justify-center gap-2"
                >
                  {isJoining ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    "합류하기"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
