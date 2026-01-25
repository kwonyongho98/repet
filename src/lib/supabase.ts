import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = 'https://qckaojdksfqngprtgflv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFja2FvamRrc2ZxbmdwcnRnZmx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMjA4NDAsImV4cCI6MjA4NDg5Njg0MH0.4oEEsIv_rXZRUUCjB4H5X8epjvbM5MrvyJUE0L5_BSM';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: 'repet-auth-token',
  },
});

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  return user;
};

// Helper function to get the current session
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return session;
};

// Storage bucket names
export const STORAGE_BUCKETS = {
  PET_IMAGES: 'pet-images',
  WALK_PHOTOS: 'walk-photos',
  PROVIDER_IMAGES: 'provider-images',
  AVATARS: 'avatars',
} as const;

// Helper function to upload image to Supabase Storage
export const uploadImage = async (
  bucket: keyof typeof STORAGE_BUCKETS,
  file: File,
  path: string
): Promise<string | null> => {
  const bucketName = STORAGE_BUCKETS[bucket];
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Error uploading image:', error);
    return null;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return publicUrl;
};

// Helper function to delete image from Supabase Storage
export const deleteImage = async (
  bucket: keyof typeof STORAGE_BUCKETS,
  path: string
): Promise<boolean> => {
  const bucketName = STORAGE_BUCKETS[bucket];
  
  const { error } = await supabase.storage
    .from(bucketName)
    .remove([path]);

  if (error) {
    console.error('Error deleting image:', error);
    return false;
  }

  return true;
};
