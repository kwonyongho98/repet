import { create } from 'zustand';
import type { FamilyMember, FamilyInvite } from '../types/family';
import type { Database } from '../types/database';
import { supabase } from '../lib/supabase';

// Type aliases for type-safe updates
type FamilyUpdate = Database['public']['Tables']['families']['Update'];
type FamilyMemberUpdate = Database['public']['Tables']['family_members']['Update'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

interface FamilyState {
  members: FamilyMember[];
  invites: FamilyInvite[];
  currentUserId: string;
  familyName: string;
  familyId: string;
  inviteCode: string;
  isLoading: boolean;
  error: string | null;

  // Fetch from Supabase
  fetchFamily: (familyId: string) => Promise<void>;
  
  // 멤버 관리
  addMember: (member: Omit<FamilyMember, 'id' | 'joinedAt'>) => void;
  updateMember: (id: string, member: Partial<FamilyMember>) => Promise<void>;
  removeMember: (id: string) => Promise<void>;
  getMemberById: (id: string) => FamilyMember | undefined;

  // 초대 관리
  createInvite: (createdBy: string) => Promise<FamilyInvite | null>;
  getActiveInvites: () => FamilyInvite[];
  useInvite: (code: string, userId: string) => boolean;
  deleteInvite: (id: string) => Promise<void>;
  
  // Clear
  clearFamily: () => void;
}

// 초대 코드 생성 (6자리 랜덤)
const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const useFamilyStore = create<FamilyState>((set, get) => ({
  members: [],
  invites: [],
  currentUserId: '',
  familyName: '',
  familyId: '',
  inviteCode: '',
  isLoading: false,
  error: null,

  // ============================================
  // Fetch family from Supabase
  // ============================================
  fetchFamily: async (familyId: string) => {
    if (!familyId) {
      set({ members: [], familyName: '', familyId: '', inviteCode: '', isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // 가족 정보 가져오기
      const { data: family, error: familyError } = await supabase
        .from('families')
        .select('*')
        .eq('id', familyId)
        .single();

      if (familyError) throw familyError;

      // 가족 멤버 가져오기
      const { data: membersData, error: membersError } = await supabase
        .from('family_members')
        .select(`
          *,
          profiles (id, name, email, avatar_url)
        `)
        .eq('family_id', familyId);

      if (membersError) throw membersError;

      // 현재 유저 ID 가져오기
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id || '';

      const members: FamilyMember[] = (membersData || []).map((m: any) => ({
        id: m.user_id,
        name: m.profiles?.name || '멤버',
        email: m.profiles?.email || '',
        role: m.role,
        joinedAt: m.joined_at,
        avatarUrl: m.profiles?.avatar_url,
        isCurrentUser: m.user_id === currentUserId,
      }));

      set({
        members,
        familyName: family.name,
        familyId: family.id,
        inviteCode: family.invite_code,
        currentUserId,
        isLoading: false,
      });
    } catch (error) {
      console.error('Fetch family error:', error);
      set({ error: 'Failed to fetch family', isLoading: false });
    }
  },

  // 멤버 추가 (로컬용 - 실제로는 초대 코드로 가입)
  addMember: (memberData) => {
    const newMember: FamilyMember = {
      ...memberData,
      id: `user-${Date.now()}`,
      joinedAt: new Date().toISOString(),
    };
    set((state) => ({ members: [...state.members, newMember] }));
  },

  // 멤버 역할 수정
  updateMember: async (id, memberData) => {
    try {
      const { familyId } = get();
      if (!familyId) return;

      if (memberData.role) {
        const memberUpdate: FamilyMemberUpdate = { 
          role: memberData.role as 'owner' | 'admin' | 'member'
        };
        
        const { error } = await supabase
          .from('family_members')
          .update(memberUpdate)
          .eq('family_id', familyId)
          .eq('user_id', id);

        if (error) throw error;
      }

      set((state) => ({
        members: state.members.map((member) =>
          member.id === id ? { ...member, ...memberData } : member
        ),
      }));
    } catch (error) {
      console.error('Update member error:', error);
    }
  },

  // 멤버 삭제
  removeMember: async (id) => {
    try {
      const { familyId } = get();
      if (!familyId) return;

      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('family_id', familyId)
        .eq('user_id', id);

      if (error) throw error;

      // 프로필에서 family_id 제거
      const profileUpdate: ProfileUpdate = { family_id: null };
      
      await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', id);

      set((state) => ({
        members: state.members.filter((member) => member.id !== id),
      }));
    } catch (error) {
      console.error('Remove member error:', error);
    }
  },

  // 멤버 조회
  getMemberById: (id) => {
    return get().members.find((member) => member.id === id);
  },

  // 초대 코드 재생성
  createInvite: async (createdBy) => {
    try {
      const { familyId } = get();
      if (!familyId) return null;

      const newCode = generateInviteCode();
      
      const familyUpdate: FamilyUpdate = { invite_code: newCode };
      
      const { error } = await supabase
        .from('families')
        .update(familyUpdate)
        .eq('id', familyId);

      if (error) throw error;

      set({ inviteCode: newCode });

      const invite: FamilyInvite = {
        id: `invite-${Date.now()}`,
        code: newCode,
        createdBy,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      set((state) => ({ invites: [...state.invites, invite] }));
      return invite;
    } catch (error) {
      console.error('Create invite error:', error);
      return null;
    }
  },

  // 활성 초대 목록 (현재 코드)
  getActiveInvites: () => {
    const { inviteCode } = get();
    if (!inviteCode) return [];
    
    return [{
      id: 'current',
      code: inviteCode,
      createdBy: '',
      createdAt: '',
      expiresAt: '',
    }];
  },

  // 초대 코드 사용 (로컬용)
  useInvite: (code, userId) => {
    const invite = get().invites.find(
      (inv) =>
        inv.code === code &&
        !inv.usedBy &&
        new Date(inv.expiresAt) > new Date()
    );

    if (!invite) return false;

    set((state) => ({
      invites: state.invites.map((inv) =>
        inv.id === invite.id
          ? { ...inv, usedBy: userId, usedAt: new Date().toISOString() }
          : inv
      ),
    }));

    return true;
  },

  // 초대 삭제
  deleteInvite: async (id) => {
    set((state) => ({
      invites: state.invites.filter((invite) => invite.id !== id),
    }));
  },

  clearFamily: () => {
    set({
      members: [],
      invites: [],
      familyName: '',
      familyId: '',
      inviteCode: '',
      currentUserId: '',
      isLoading: false,
      error: null,
    });
  },
}));
