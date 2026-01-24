import { X, Users, PawPrint, LogOut, Plus, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { usePetStore } from "../../stores/usePetStore";
import { useFamilyStore } from "../../stores/useFamilyStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { Button, Avatar } from "../common";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPetModal?: () => void;
  onOpenFamilyModal?: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  onOpenPetModal,
  onOpenFamilyModal,
}: SidebarProps) {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const pets = usePetStore((state) => state.pets);
  const members = useFamilyStore((state) => state.members);
  const currentUserId = useFamilyStore((state) => state.currentUserId);

  const currentUser = members.find((m) => m.id === currentUserId);

  const handleLogout = () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      logout();
      navigate("/login");
    }
  };

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 z-40 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* 사이드바 */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* 상단: 사용자 정보 & 닫기 버튼 */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <h2
                className="text-xl font-bold"
                style={{ color: "var(--color-secondary-900)" }}
              >
                메뉴
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} style={{ color: "var(--color-text-secondary)" }} />
              </button>
            </div>

            {/* 사용자 정보 */}
            {currentUser && (
              <div
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ backgroundColor: "var(--color-primary-50)" }}
              >
                <Avatar name={currentUser.name} size="md" />
                <div>
                  <p
                    className="font-bold"
                    style={{ color: "var(--color-secondary-900)" }}
                  >
                    {currentUser.name}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {currentUser.email}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 중간: 메뉴 콘텐츠 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 반려견 관리 섹션 */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3
                  className="font-bold flex items-center gap-2"
                  style={{ color: "var(--color-secondary-900)" }}
                >
                  <PawPrint
                    size={20}
                    style={{ color: "var(--color-primary)" }}
                  />
                  내 반려견
                </h3>
                <Link to="/home/pets" onClick={onClose}>
                  <Button size="sm" variant="primary" onClick={onOpenPetModal}>
                    <Plus size={16} className="mr-1" />
                    추가
                  </Button>
                </Link>
              </div>

              {pets.length === 0 ? (
                <p
                  className="text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  등록된 반려견이 없습니다.
                </p>
              ) : (
                <div className="space-y-2">
                  {pets.slice(0, 3).map((pet) => {
                    // 나이 계산
                    const birthDate = new Date(pet.birthDate);
                    const today = new Date();
                    const age = today.getFullYear() - birthDate.getFullYear();

                    return (
                      <Link
                        key={pet.id}
                        to="/home/pets"
                        onClick={onClose}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Avatar name={pet.name} size="sm" />
                        <div>
                          <p
                            className="font-medium text-sm"
                            style={{ color: "var(--color-secondary-900)" }}
                          >
                            {pet.name}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: "var(--color-text-secondary)" }}
                          >
                            {pet.breed} · {age}살
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                  {pets.length > 3 && (
                    <Link
                      to="/home/pets"
                      onClick={onClose}
                      className="block text-sm text-center py-2"
                      style={{ color: "var(--color-primary)" }}
                    >
                      +{pets.length - 3}마리 더보기
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* 구분선 */}
            <div className="border-t border-gray-100" />

            {/* 가족 관리 섹션 */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3
                  className="font-bold flex items-center gap-2"
                  style={{ color: "var(--color-secondary-900)" }}
                >
                  <Users size={20} style={{ color: "var(--color-primary)" }} />
                  가족 구성원
                </h3>
                <Link to="/home/family" onClick={onClose}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onOpenFamilyModal}
                  >
                    <UserPlus size={16} className="mr-1" />
                    초대
                  </Button>
                </Link>
              </div>

              {members.length === 0 ? (
                <p
                  className="text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  가족 구성원이 없습니다.
                </p>
              ) : (
                <div className="space-y-2">
                  {members.slice(0, 4).map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 rounded-lg"
                    >
                      <Avatar name={member.name} size="sm" />
                      <div className="flex-1">
                        <p
                          className="font-medium text-sm"
                          style={{ color: "var(--color-secondary-900)" }}
                        >
                          {member.name}
                          {member.isCurrentUser && (
                            <span
                              className="ml-2 text-xs"
                              style={{ color: "var(--color-primary)" }}
                            >
                              (나)
                            </span>
                          )}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          {member.role === "owner"
                            ? "소유자"
                            : member.role === "admin"
                              ? "관리자"
                              : "멤버"}
                        </p>
                      </div>
                    </div>
                  ))}
                  {members.length > 4 && (
                    <Link
                      to="/home/family"
                      onClick={onClose}
                      className="block text-sm text-center py-2"
                      style={{ color: "var(--color-primary)" }}
                    >
                      +{members.length - 4}명 더보기
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 하단: 로그아웃 */}
          <div className="p-6 border-t border-gray-100">
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut size={18} className="mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
