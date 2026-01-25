import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session, Provider } from '@supabase/supabase-js';
import type { User, UserRole, AuthState, SocialProvider } from '../types/auth';
import { supabase } from '../lib/supabase';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,
      lastLoginMethod: undefined,

      // Initialize auth state from Supabase session
      initialize: async () => {
        try {
          set({ isLoading: true });
          
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Session retrieval error:', error);
            set({ user: null, session: null, isAuthenticated: false, isLoading: false });
            return;
          }

          if (session?.user) {
            // Fetch user profile from profiles table
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profileError && profileError.code !== 'PGRST116') {
              console.error('Profile fetch error:', profileError);
            }

            const user: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: profile?.name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || '사용자',
              role: (profile?.role as UserRole) || 'family',
              providerId: profile?.provider_id || undefined,
              familyId: profile?.family_id || undefined,
              avatarUrl: profile?.avatar_url || session.user.user_metadata?.avatar_url || undefined,
            };

            set({ 
              user, 
              session, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } else {
            set({ user: null, session: null, isAuthenticated: false, isLoading: false });
          }
        } catch (error) {
          console.error('Initialize auth error:', error);
          set({ user: null, session: null, isAuthenticated: false, isLoading: false });
        }
      },

      // Set session (called from auth state change listener)
      setSession: (session: Session | null) => {
        if (session?.user) {
          get().initialize();
        } else {
          set({ user: null, session: null, isAuthenticated: false });
        }
      },

      // Set user directly
      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      // Login with email/password
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
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.session.user.id)
              .single();

            const user: User = {
              id: data.session.user.id,
              email: data.session.user.email || '',
              name: profile?.name || data.session.user.email?.split('@')[0] || '사용자',
              role: (profile?.role as UserRole) || 'family',
              providerId: profile?.provider_id || undefined,
              familyId: profile?.family_id || undefined,
              avatarUrl: profile?.avatar_url || undefined,
            };

            set({ 
              user, 
              session: data.session, 
              isAuthenticated: true, 
              isLoading: false,
              lastLoginMethod: 'email'
            });
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

      // Login with OAuth provider (Kakao, Google, Naver)
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
              // Naver requires custom OIDC setup in Supabase
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

      // Logout
      logout: async () => {
        try {
          const { error } = await supabase.auth.signOut();
          
          if (error) {
            console.error('Logout error:', error);
          }

          set({ 
            user: null, 
            session: null, 
            isAuthenticated: false 
          });
        } catch (error) {
          console.error('Logout error:', error);
          set({ 
            user: null, 
            session: null, 
            isAuthenticated: false 
          });
        }
      },

      // Legacy login function for backwards compatibility
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

// Auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session?.user?.email);
  
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    useAuthStore.getState().setSession(session);
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ 
      user: null, 
      session: null, 
      isAuthenticated: false 
    });
  }
});

// Initialize on app load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    useAuthStore.getState().initialize();
  }, 0);
}
