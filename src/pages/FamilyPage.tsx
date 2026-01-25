import { useState } from "react";
import {
  Card,
  Button,
  Modal,
  Input,
  Select,
  Badge,
} from "../components/common";
import { useFamilyStore } from "../stores/useFamilyStore";
import { PartnerManageSection } from "../components/partner";
import type { FamilyMember, FamilyRole } from "../types/family";
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Trash2,
  Copy,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

type BadgeVariantType = "primary" | "success" | "warning" | "danger" | "info";

const roleLabels: Record<FamilyRole, string> = {
  owner: "소유자",
  admin: "관리자",
  member: "멤버",
};

const roleColors: Record<FamilyRole, BadgeVariantType> = {
  owner: "primary",
  admin: "info",
  member: "success",
};

export default function FamilyPage() {
  const members = useFamilyStore((state) => state.members);
  const currentUserId = useFamilyStore((state) => state.currentUserId);
  const addMember = useFamilyStore((state) => state.addMember);
  const updateMember = useFamilyStore((state) => state.updateMember);
  const removeMember = useFamilyStore((state) => state.removeMember);
  const createInvite = useFamilyStore((state) => state.createInvite);
  const getActiveInvites = useFamilyStore((state) => state.getActiveInvites);
  const deleteInvite = useFamilyStore((state) => state.deleteInvite);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "member" as FamilyRole,
  });

  const currentUser = members.find((m) => m.id === currentUserId);
  const isOwner = currentUser?.role === "owner";
  const activeInvites = getActiveInvites();

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "member",
    });
  };

  // 멤버 추가
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    addMember(formData);
    setIsAddModalOpen(false);
    resetForm();
  };

  // 멤버 수정
  const handleEditMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    updateMember(editingMember.id, {
      name: formData.name,
      email: formData.email,
      role: formData.role,
    });

    setIsEditModalOpen(false);
    setEditingMember(null);
    resetForm();
  };

  // 멤버 삭제
  const handleDeleteMember = () => {
    if (!editingMember) return;
    removeMember(editingMember.id);
    setIsDeleteModalOpen(false);
    setEditingMember(null);
  };

  // 수정 모달 열기
  const openEditModal = (member: FamilyMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      role: member.role,
    });
    setIsEditModalOpen(true);
  };

  // 삭제 모달 열기
  const openDeleteModal = (member: FamilyMember) => {
    setEditingMember(member);
    setIsDeleteModalOpen(true);
  };

  // 초대 코드 생성
  const handleCreateInvite = () => {
    createInvite(currentUserId);
  };

  // 초대 코드 복사
  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--color-secondary-900)" }}
          >
            가족 관리
          </h1>
          <p style={{ color: "var(--color-text-secondary)" }} className="mt-2">
            가족 구성원을 관리하고 초대하세요
          </p>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsInviteModalOpen(true)}
            >
              <UserPlus size={18} className="mr-2" />
              초대하기
            </Button>
            <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
              <Users size={18} className="mr-2" />
              멤버 추가
            </Button>
          </div>
        )}
      </div>

      {/* 가족 구성원 목록 */}
      <Card title={`가족 구성원 (${members.length}명)`}>
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  {member.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p
                      className="font-medium"
                      style={{ color: "var(--color-secondary-900)" }}
                    >
                      {member.name}
                    </p>
                    {member.isCurrentUser && <Badge variant="info">나</Badge>}
                  </div>
                  <p
                    className="text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {member.email}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    가입:{" "}
                    {format(new Date(member.joinedAt), "yyyy년 M월 d일", {
                      locale: ko,
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant={roleColors[member.role]}>
                  <Shield size={14} className="mr-1" />
                  {roleLabels[member.role]}
                </Badge>

                {isOwner && !member.isCurrentUser && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(member)}
                    >
                      수정
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => openDeleteModal(member)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 활성 초대 코드 */}
      {isOwner && activeInvites.length > 0 && (
        <Card title="활성 초대 코드">
          <div className="space-y-3">
            {activeInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <code
                      className="text-lg font-bold px-3 py-1 rounded"
                      style={{
                        backgroundColor: "var(--color-primary-100)",
                        color: "var(--color-primary)",
                      }}
                    >
                      {invite.code}
                    </code>
                    <button
                      onClick={() => copyInviteCode(invite.code)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      {copiedCode === invite.code ? (
                        <Check
                          size={18}
                          style={{ color: "var(--color-primary)" }}
                        />
                      ) : (
                        <Copy
                          size={18}
                          style={{ color: "var(--color-text-secondary)" }}
                        />
                      )}
                    </button>
                  </div>
                  <p
                    className="text-sm mt-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    만료:{" "}
                    {format(
                      new Date(invite.expiresAt),
                      "yyyy년 M월 d일 HH:mm",
                      { locale: ko },
                    )}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => deleteInvite(invite.id)}
                >
                  삭제
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 멤버 추가 모달 */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title="가족 구성원 추가"
        maxWidth="lg"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <Input
            label="이름"
            placeholder="예: 홍길동"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="이메일"
            type="email"
            placeholder="예: hong@example.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />

          <Select
            label="역할"
            value={formData.role}
            onChange={(e) =>
              setFormData({ ...formData, role: e.target.value as FamilyRole })
            }
            options={[
              { value: "member", label: "멤버 - 조회 및 기록 추가" },
              { value: "admin", label: "관리자 - 멤버 + 설정 관리" },
              { value: "owner", label: "소유자 - 모든 권한" },
            ]}
            required
          />

          <div
            className="p-4 rounded-lg text-sm"
            style={{
              backgroundColor: "var(--color-primary-50)",
              color: "var(--color-text-secondary)",
            }}
          >
            <p className="font-medium mb-2">💡 역할 설명:</p>
            <ul className="space-y-1 text-xs">
              <li>
                • <strong>멤버</strong>: 반려견 정보 조회, 일정 추가
              </li>
              <li>
                • <strong>관리자</strong>: 멤버 권한 + 반려견 수정/삭제
              </li>
              <li>
                • <strong>소유자</strong>: 모든 권한 + 가족 관리
              </li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setIsAddModalOpen(false);
                resetForm();
              }}
            >
              취소
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              추가
            </Button>
          </div>
        </form>
      </Modal>

      {/* 초대 모달 */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="가족 초대"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="text-center py-6">
            <Mail
              className="w-16 h-16 mx-auto mb-4"
              style={{ color: "var(--color-primary)" }}
            />
            <h3
              className="text-lg font-bold mb-2"
              style={{ color: "var(--color-secondary-900)" }}
            >
              초대 코드를 생성하시겠습니까?
            </h3>
            <p style={{ color: "var(--color-text-secondary)" }}>
              생성된 코드는 7일간 유효하며, 가족 구성원이 가입 시 사용할 수
              있습니다.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsInviteModalOpen(false)}
            >
              취소
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => {
                handleCreateInvite();
                setIsInviteModalOpen(false);
              }}
            >
              생성하기
            </Button>
          </div>
        </div>
      </Modal>

      {/* 멤버 수정 모달 */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingMember(null);
          resetForm();
        }}
        title="구성원 정보 수정"
        maxWidth="lg"
      >
        <form onSubmit={handleEditMember} className="space-y-4">
          <Input
            label="이름"
            placeholder="예: 홍길동"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="이메일"
            type="email"
            placeholder="예: hong@example.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />

          <Select
            label="역할"
            value={formData.role}
            onChange={(e) =>
              setFormData({ ...formData, role: e.target.value as FamilyRole })
            }
            options={[
              { value: "member", label: "멤버" },
              { value: "admin", label: "관리자" },
              { value: "owner", label: "소유자" },
            ]}
            required
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingMember(null);
                resetForm();
              }}
            >
              취소
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              수정 완료
            </Button>
          </div>
        </form>
      </Modal>

      {/* 멤버 삭제 확인 모달 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setEditingMember(null);
        }}
        title="구성원 삭제"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p style={{ color: "var(--color-text)" }}>
            정말로 <strong>{editingMember?.name}</strong>님을 가족에서
            제거하시겠습니까?
          </p>
          <p className="text-sm text-red-600">
            제거 후에는 해당 구성원이 더 이상 반려견 정보에 접근할 수 없습니다.
          </p>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setEditingMember(null);
              }}
            >
              취소
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleDeleteMember}
            >
              삭제
            </Button>
          </div>
        </div>
      </Modal>

      {/* 파트너 관리 섹션 */}
      <div className="mt-8">
        <PartnerManageSection />
      </div>
    </div>
  );
}
