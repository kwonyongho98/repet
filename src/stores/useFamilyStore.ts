import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FamilyMember, FamilyInvite } from "../types/family";

interface FamilyState {
  members: FamilyMember[];
  invites: FamilyInvite[];
  currentUserId: string;

  // 멤버 관리
  addMember: (member: Omit<FamilyMember, "id" | "joinedAt">) => void;
  updateMember: (id: string, member: Partial<FamilyMember>) => void;
  removeMember: (id: string) => void;
  getMemberById: (id: string) => FamilyMember | undefined;

  // 초대 관리
  createInvite: (createdBy: string) => FamilyInvite;
  getActiveInvites: () => FamilyInvite[];
  useInvite: (code: string, userId: string) => boolean;
  deleteInvite: (id: string) => void;
}

// 초대 코드 생성 (6자리 랜덤)
const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      members: [
        {
          id: "user-1",
          name: "나",
          email: "me@example.com",
          role: "owner",
          joinedAt: new Date().toISOString(),
          isCurrentUser: true,
        },
      ],
      invites: [],
      currentUserId: "user-1",

      // 멤버 추가
      addMember: (memberData) => {
        const newMember: FamilyMember = {
          ...memberData,
          id: `user-${Date.now()}`,
          joinedAt: new Date().toISOString(),
        };
        set((state) => ({ members: [...state.members, newMember] }));
      },

      // 멤버 수정
      updateMember: (id, memberData) => {
        set((state) => ({
          members: state.members.map((member) =>
            member.id === id ? { ...member, ...memberData } : member,
          ),
        }));
      },

      // 멤버 삭제
      removeMember: (id) => {
        set((state) => ({
          members: state.members.filter((member) => member.id !== id),
        }));
      },

      // 멤버 조회
      getMemberById: (id) => {
        return get().members.find((member) => member.id === id);
      },

      // 초대 코드 생성
      createInvite: (createdBy) => {
        const invite: FamilyInvite = {
          id: `invite-${Date.now()}`,
          code: generateInviteCode(),
          createdBy,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(), // 7일 후
        };
        set((state) => ({ invites: [...state.invites, invite] }));
        return invite;
      },

      // 활성 초대 목록
      getActiveInvites: () => {
        const now = new Date();
        return get().invites.filter(
          (invite) => !invite.usedBy && new Date(invite.expiresAt) > now,
        );
      },

      // 초대 코드 사용
      useInvite: (code, userId) => {
        const invite = get().invites.find(
          (inv) =>
            inv.code === code &&
            !inv.usedBy &&
            new Date(inv.expiresAt) > new Date(),
        );

        if (!invite) return false;

        set((state) => ({
          invites: state.invites.map((inv) =>
            inv.id === invite.id
              ? { ...inv, usedBy: userId, usedAt: new Date().toISOString() }
              : inv,
          ),
        }));

        return true;
      },

      // 초대 삭제
      deleteInvite: (id) => {
        set((state) => ({
          invites: state.invites.filter((invite) => invite.id !== id),
        }));
      },
    }),
    {
      name: "family-storage",
    },
  ),
);
