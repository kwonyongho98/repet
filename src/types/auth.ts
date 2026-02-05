import type { Session } from '@supabase/supabase-js';

// ============================================
// UserRole - SQL ENUM 기준 ('partner' 없음)
// ============================================
export type UserRole = 'family' | 'provider';
export type SocialProvider = 'kakao' | 'google' | 'naver' | 'email';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  providerId?: string;
  familyId?: string;
  avatarUrl?: string;
  isNewUser?: boolean;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isNewUser: boolean;
  lastLoginMethod?: SocialProvider;
  
  // Actions
  initialize: () => Promise<void>;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  loginWithProvider: (provider: SocialProvider) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<boolean>;
  
  // Onboarding
  checkIsNewUser: () => Promise<boolean>;
  completeOnboarding: (name: string, familyName?: string) => Promise<boolean>;
  
  // Family
  checkFamilyByInviteCode: (inviteCode: string) => Promise<{ exists: boolean; familyId?: string; familyName?: string }>;
  joinFamily: (inviteCode: string) => Promise<boolean>;
  leaveFamily: () => Promise<boolean>;
  
  // Legacy compatibility
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
}
