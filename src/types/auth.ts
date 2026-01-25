import type { Session } from '@supabase/supabase-js';

export type UserRole = 'family' | 'provider' | 'partner';
export type SocialProvider = 'kakao' | 'google' | 'naver' | 'email';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  providerId?: string; // 사장님인 경우 업체 ID
  familyId?: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastLoginMethod?: SocialProvider;
  
  // Actions
  initialize: () => Promise<void>;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  loginWithProvider: (provider: SocialProvider) => Promise<void>;
  logout: () => Promise<void>;
  
  // Legacy compatibility
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
}
