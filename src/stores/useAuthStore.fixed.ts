import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session, Provider } from '@supabase/supabase-js';
import type { User, UserRole, AuthState, SocialProvider } from '../types/auth';
import type { Database } from '../types/database';
import { supabase } from '../lib/supabase';

// ============================================
// Type Definitions for Supabase Queries
// ============================================

// Profile row type from database
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type FamilyRow = Database['public']['Tables']['families']['Row'];

// ============================================
// Helper Functions
// ============================================

// 초대 코드 생성 (6자리)
const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Convert DB null to undefined for frontend usage
const nullToUndefined = <T>(value: T | null): T | undefined => {
  return value === null ? undefined : value;
};

// ============================================
// Auth Store
// ============================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,
      isNewUser: false,
      lastLoginMethod: undefined,

      // ============================================
      // Initialize auth state from Supabase session
      // ============================================
      initialize: async () => {
        try {
          set({ isLoading: true });
          
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Session retrieval error:', error);
            set({ user: null, session: null, isAuthenticated: false, isLoading: false, isNewUser: false });
            return;
          }

          if (session?.user) {
            // Fetch user profile with explicit type
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single<ProfileRow>();

            if (profileError && profileError.code !== 'PGRST116') {
              console.error('Profile fetch error:', profileError);
            }

            // Type-safe access to profile properties
            const familyId = profile?.family_id;
            const providerId = profile?.provider_id;
            const avatarUrl = profile?.avatar_url;
            const profileName = profile?.name;
            const profileRole = profile?.role;

            // Check if user is new (no family_id means not onboarded)
            const isNewUser = !familyId;

            const user: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: profileName || session.user.user_metadata?.name || session.user.email?.split('@')[0] || '사용자',
              role: (profileRole as UserRole) || 'family',
              providerId: nullToUndefined(providerId),
              familyId: nullToUndefined(familyId),
              avatarUrl: nullToUndefined(avatarUrl) || session.user.user_metadata?.avatar_url,
              isNewUser,
            };

            set({ 
              user, 
              session, 
              isAuthenticated: true, 
              isLoading: false,
              isNewUser,
            });
          } else {
            set({ user: null, session: null, isAuthenticated: false, isLoading: false, isNewUser: false });
          }
        } catch (error) {
          console.error('Initialize auth error:', error);
          set({ user: null, session: null, isAuthenticated: false, isLoading: false, isNewUser: false });
        }
      },

      // ============================================
      // Check if current user is new (needs onboarding)
      // ============================================
      checkIsNewUser: async (): Promise<boolean> => {
        const { user } = get();
        if (!user) return false;

        const { data: profile } = await supabase
          .from('profiles')
          .select('family_id')
          .eq('id', user.id)
          .single<Pick<ProfileRow, 'family_id'>>();

        const isNew = !profile?.family_id;
        set({ isNewUser: isNew });
        return isNew;
      },

      // ============================================
      // Complete onboarding - create family and update profile
      // ============================================
      completeOnboarding: async (name: string, familyName?: string): Promise<boolean> => {
        const { user, session } = get();
        if (!user || !session) return false;

        try {
          // 1. 사용자 이름 업데이트
          const { error: profileUpdateError } = await supabase
            .from('profiles')
            .update({ name })
            .eq('id', user.id);

          if (profileUpdateError) {
            console.error('Profile update error:', profileUpdateError);
            return false;
          }

          // 2. 새 가족 생성
          const inviteCode = generateInviteCode();
          const { data: family, error: familyError } = await supabase
            .from('families')
            .insert({
              name: familyName || `${name}의 가족`,
              invite_code: inviteCode,
              owner_id: user.id,
            })
            .select()
            .single<FamilyRow>();

          if (familyError || !family) {
            console.error('Family creation error:', familyError);
            return false;
          }

          // 3. 프로필에 family_id 연결
          const { error: linkError } = await supabase
            .from('profiles')
            .update({ family_id: family.id })
            .eq('id', user.id);

          if (linkError) {
            console.error('Link family error:', linkError);
            return false;
          }

          // 4. family_members에 owner로 추가
          const { error: memberError } = await supabase
            .from('family_members')
            .insert({
              family_id: family.id,
              user_id: user.id,
              role: 'owner',
            });

          if (memberError) {
            console.error('Family member error:', memberError);
          }

          // 5. 상태 업데이트
          set({
            user: { ...user, name, familyId: family.id },
            isNewUser: false,
          });

          return true;
        } catch (error) {
          console.error('Complete onboarding error:', error);
          return false;
        }
      },

      // ============================================
      // Join existing family with invite code
      // ============================================
      joinFamily: async (inviteCode: string): Promise<boolean> => {
        const { user } = get();
        if (!user) return false;

        try {
          // 1. 초대 코드로 가족 찾기
          const { data: family, error: familyError } = await supabase
            .from('families')
            .select('*')
            .eq('invite_code', inviteCode.toUpperCase())
            .single<FamilyRow>();

          if (familyError || !family) {
            console.error('Family not found:', familyError);
            return false;
          }

          // 2. 이미 가족에 속해있는지 확인
          const { data: existingMember } = await supabase
            .from('family_members')
            .select('id')
            .eq('family_id', family.id)
            .eq('user_id', user.id)
            .maybeSingle();

          if (existingMember) {
            console.error('Already a member of this family');
            return false;
          }

          // 3. family_members에 추가
          const { error: memberError } = await supabase
            .from('family_members')
            .insert({
              family_id: family.id,
              user_id: user.id,
              role: 'member',
            });

          if (memberError) {
            console.error('Join family error:', memberError);
            return false;
          }

          // 4. 프로필에 family_id 연결
          const { error: linkError } = await supabase
            .from('profiles')
            .update({ family_id: family.id })
            .eq('id', user.id);

          if (linkError) {
            console.error('Link family error:', linkError);
            return false;
          }

          // 5. 상태 업데이트
          set({
            user: { ...user, familyId: family.id },
            isNewUser: false,
          });

          return true;
        } catch (error) {
          console.error('Join family error:', error);
          return false;
        }
      },

      // ============================================
      // Set session (called from auth state change listener)
      // ============================================
      setSession: (session: Session | null) => {
        if (session?.user) {
          get().initialize();
        } else {
          set({ user: null, session: null, isAuthenticated: false, isNewUser: false });
        }
      },

      // ============================================
      // Set user directly
      // ============================================
      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      // ============================================
      // Login with email/password
      // ============================================
      loginWithEmail: async (email: string, password: string): Promise<boolean> => {
        try {
          set({ isLoading: true });

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            console.error('Email login error:', error);
            set({ isLoading: false });
            return false;
          }

          if (data.session) {
            set({ lastLoginMethod: 'email' });
            await get().initialize();
            return true;
          }

          set({ isLoading: false });
          return false;
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      // ============================================
      // Login with OAuth provider (Kakao, Google, Naver)
      // ============================================
      loginWithProvider: async (provider: SocialProvider) => {
        try {
          set({ lastLoginMethod: provider });

          let supabaseProvider: Provider;
          
          switch (provider) {
            case 'kakao':
              supabaseProvider = 'kakao' as Provider;
              break;
            case 'google':
              supabaseProvider = 'google';
              break;
            case 'naver':
              console.warn('Naver login requires OIDC setup in Supabase Dashboard');
              throw new Error('Naver 로그인은 현재 준비 중입니다.');
            default:
              throw new Error('Unsupported provider');
          }

          const { error } = await supabase.auth.signInWithOAuth({
            provider: supabaseProvider,
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          });

          if (error) {
            console.error(`${provider} login error:`, error);
            throw error;
          }
        } catch (error) {
          console.error('Provider login error:', error);
          throw error;
        }
      },

      // ============================================
      // Logout
      // ============================================
      logout: async () => {
        try {
          const { error } = await supabase.auth.signOut();
          
          if (error) {
            console.error('Logout error:', error);
          }

          // Clear all localStorage data
          localStorage.removeItem('pet-storage');
          localStorage.removeItem('calendar-storage');
          localStorage.removeItem('daily-log-storage');
          localStorage.removeItem('family-storage');

          set({ 
            user: null, 
            session: null, 
            isAuthenticated: false,
            isNewUser: false,
          });
        } catch (error) {
          console.error('Logout error:', error);
          set({ 
            user: null, 
            session: null, 
            isAuthenticated: false,
            isNewUser: false,
          });
        }
      },

      // ============================================
      // Delete Account (회원 탈퇴)
      // ============================================
      deleteAccount: async (): Promise<boolean> => {
        const { session } = get();
        if (!session) return false;

        try {
          // Edge Function 호출
          const { data, error } = await supabase.functions.invoke('delete-user', {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });

          if (error) {
            console.error('Delete account error:', error);
            return false;
          }

          if (data?.success) {
            // Clear all localStorage data
            localStorage.removeItem('pet-storage');
            localStorage.removeItem('calendar-storage');
            localStorage.removeItem('daily-log-storage');
            localStorage.removeItem('family-storage');
            localStorage.removeItem('repet-auth-storage');

            // Sign out
            await supabase.auth.signOut();

            set({ 
              user: null, 
              session: null, 
              isAuthenticated: false,
              isNewUser: false,
            });

            return true;
          }

          return false;
        } catch (error) {
          console.error('Delete account error:', error);
          return false;
        }
      },

      // ============================================
      // Legacy login function for backwards compatibility
      // ============================================
      login: async (email: string, password: string, _role: UserRole): Promise<boolean> => {
        return await get().loginWithEmail(email, password);
      },
    }),
    {
      name: 'repet-auth-storage',
      partialize: (state) => ({
        lastLoginMethod: state.lastLoginMethod,
      }),
    }
  )
);

// ============================================
// Auth state change listener
// ============================================
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session?.user?.email);
  
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    useAuthStore.getState().setSession(session);
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ 
      user: null, 
      session: null, 
      isAuthenticated: false,
      isNewUser: false,
    });
  }
});

// Initialize on app load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    useAuthStore.getState().initialize();
  }, 0);
}
