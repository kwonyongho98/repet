import { supabase } from '../lib/supabase';
import type { Provider } from '@supabase/supabase-js';
import type { Tables, Insertable } from '../types/database';

export type UserProfile = Tables<'profiles'>;

// ============================================
// Authentication Functions
// ============================================

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  name: string,
  role: 'family' | 'provider' = 'family'
) => {
  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
      },
    },
  });

  if (authError) {
    throw authError;
  }

  if (!authData.user) {
    throw new Error('User creation failed');
  }

  // 2. Create profile (this might be handled by a trigger in production)
  const profile: Insertable<'profiles'> = {
    id: authData.user.id,
    email,
    name,
    role,
  };

  const { error: profileError } = await supabase
    .from('profiles')
    .insert(profile);

  if (profileError) {
    console.error('Profile creation error:', profileError);
    // Don't throw here - the trigger might have already created it
  }

  return authData;
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Sign in with OAuth provider (Google, Kakao, Naver)
 */
export const signInWithProvider = async (provider: Provider) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: provider === 'kakao' ? {
        // Kakao specific options
      } : undefined,
    },
  });

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = () => signInWithProvider('google');

/**
 * Sign in with Kakao
 */
export const signInWithKakao = () => signInWithProvider('kakao' as Provider);

/**
 * Sign in with Naver
 */
export const signInWithNaver = () => {
  // Naver is not directly supported by Supabase
  // You'll need to use a custom OAuth flow or OIDC
  console.warn('Naver login requires custom implementation');
  throw new Error('Naver login not yet implemented');
};

/**
 * Sign out
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw error;
  }
};

/**
 * Get current user's profile
 */
export const getCurrentProfile = async (): Promise<UserProfile | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return profile;
};

/**
 * Update user's profile
 */
export const updateProfile = async (
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'email' | 'created_at'>>
) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) {
    throw error;
  }
};

/**
 * Update password
 */
export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw error;
  }
};

// ============================================
// Auth State Listener
// ============================================

export const onAuthStateChange = (
  callback: (event: string, session: any) => void
) => {
  return supabase.auth.onAuthStateChange(callback);
};

// ============================================
// Family Management
// ============================================

/**
 * Create a new family
 */
export const createFamily = async (name: string, ownerId: string) => {
  // Generate invite code
  const inviteCode = generateInviteCode();

  const { data: family, error: familyError } = await supabase
    .from('families')
    .insert({
      name,
      owner_id: ownerId,
      invite_code: inviteCode,
    })
    .select()
    .single();

  if (familyError) {
    throw familyError;
  }

  // Add owner as family member
  const { error: memberError } = await supabase
    .from('family_members')
    .insert({
      family_id: family.id,
      user_id: ownerId,
      role: 'owner',
    });

  if (memberError) {
    throw memberError;
  }

  // Update user's profile with family_id
  await supabase
    .from('profiles')
    .update({ family_id: family.id })
    .eq('id', ownerId);

  return family;
};

/**
 * Join a family with invite code
 */
export const joinFamily = async (inviteCode: string, userId: string) => {
  // Find family by invite code
  const { data: family, error: findError } = await supabase
    .from('families')
    .select('*')
    .eq('invite_code', inviteCode.toUpperCase())
    .single();

  if (findError || !family) {
    throw new Error('Invalid invite code');
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from('family_members')
    .select('id')
    .eq('family_id', family.id)
    .eq('user_id', userId)
    .single();

  if (existing) {
    throw new Error('Already a member of this family');
  }

  // Add as member
  const { error: memberError } = await supabase
    .from('family_members')
    .insert({
      family_id: family.id,
      user_id: userId,
      role: 'member',
    });

  if (memberError) {
    throw memberError;
  }

  // Update user's profile
  await supabase
    .from('profiles')
    .update({ family_id: family.id })
    .eq('id', userId);

  return family;
};

/**
 * Get family members
 */
export const getFamilyMembers = async (familyId: string) => {
  const { data, error } = await supabase
    .from('family_members')
    .select(`
      *,
      profiles:user_id (
        id,
        name,
        email,
        avatar_url
      )
    `)
    .eq('family_id', familyId);

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Generate a random invite code
 */
const generateInviteCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};
