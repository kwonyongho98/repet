import { supabase } from '../lib/supabase';
import type { Tables, Insertable, Updatable } from '../types/database';

export type ServiceProvider = Tables<'service_providers'>;
export type ServiceBooking = Tables<'service_bookings'>;
export type ProviderComment = Tables<'provider_comments'>;

// Extended booking type with relations
export interface BookingWithDetails extends ServiceBooking {
  provider?: Pick<ServiceProvider, 'id' | 'name' | 'type'>;
  pet?: { id: string; name: string };
}

// ============================================
// Service Providers
// ============================================

/**
 * Get all service providers
 */
export const getAllProviders = async (
  type?: ServiceProvider['type']
): Promise<ServiceProvider[]> => {
  let query = supabase
    .from('service_providers')
    .select('*')
    .order('rating', { ascending: false });

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

/**
 * Get provider by ID
 */
export const getProviderById = async (
  providerId: string
): Promise<ServiceProvider | null> => {
  const { data, error } = await supabase
    .from('service_providers')
    .select('*')
    .eq('id', providerId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
};

/**
 * Search providers
 */
export const searchProviders = async (
  searchTerm: string,
  type?: ServiceProvider['type']
): Promise<ServiceProvider[]> => {
  let query = supabase
    .from('service_providers')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`);

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

/**
 * Get providers by owner (for provider dashboard)
 */
export const getProvidersByOwner = async (
  ownerId: string
): Promise<ServiceProvider[]> => {
  const { data, error } = await supabase
    .from('service_providers')
    .select('*')
    .eq('owner_id', ownerId);

  if (error) throw error;
  return data;
};

/**
 * Create provider (for provider users)
 */
export const createProvider = async (
  provider: Omit<Insertable<'service_providers'>, 'id' | 'created_at' | 'updated_at'>
): Promise<ServiceProvider> => {
  const { data, error } = await supabase
    .from('service_providers')
    .insert(provider)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update provider
 */
export const updateProvider = async (
  providerId: string,
  updates: Updatable<'service_providers'>
): Promise<ServiceProvider> => {
  const { data, error } = await supabase
    .from('service_providers')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', providerId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// Service Bookings
// ============================================

/**
 * Get bookings for a family
 */
export const getBookingsByFamily = async (
  familyId: string,
  status?: ServiceBooking['status']
): Promise<BookingWithDetails[]> => {
  let query = supabase
    .from('service_bookings')
    .select(`
      *,
      provider:service_providers(id, name, type),
      pet:pets(id, name)
    `)
    .eq('family_id', familyId)
    .order('start_date', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as BookingWithDetails[];
};

/**
 * Get bookings for a provider
 */
export const getBookingsByProvider = async (
  providerId: string,
  status?: ServiceBooking['status']
): Promise<BookingWithDetails[]> => {
  let query = supabase
    .from('service_bookings')
    .select(`
      *,
      pet:pets(id, name)
    `)
    .eq('provider_id', providerId)
    .order('start_date', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as BookingWithDetails[];
};

/**
 * Get booking by ID
 */
export const getBookingById = async (
  bookingId: string
): Promise<BookingWithDetails | null> => {
  const { data, error } = await supabase
    .from('service_bookings')
    .select(`
      *,
      provider:service_providers(id, name, type),
      pet:pets(id, name)
    `)
    .eq('id', bookingId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data as BookingWithDetails;
};

/**
 * Create booking
 */
export const createBooking = async (
  booking: Omit<Insertable<'service_bookings'>, 'id' | 'created_at' | 'updated_at'>
): Promise<ServiceBooking> => {
  const { data, error } = await supabase
    .from('service_bookings')
    .insert(booking)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (
  bookingId: string,
  status: ServiceBooking['status']
): Promise<ServiceBooking> => {
  const { data, error } = await supabase
    .from('service_bookings')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update booking
 */
export const updateBooking = async (
  bookingId: string,
  updates: Updatable<'service_bookings'>
): Promise<ServiceBooking> => {
  const { data, error } = await supabase
    .from('service_bookings')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Cancel booking
 */
export const cancelBooking = async (bookingId: string): Promise<void> => {
  await updateBookingStatus(bookingId, 'cancelled');
};

// ============================================
// Provider Comments (Daily Reports)
// ============================================

/**
 * Get comments for a booking
 */
export const getCommentsByBooking = async (
  bookingId: string
): Promise<ProviderComment[]> => {
  const { data, error } = await supabase
    .from('provider_comments')
    .select('*')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Get comments for a pet
 */
export const getCommentsByPet = async (
  petId: string,
  limit?: number
): Promise<ProviderComment[]> => {
  let query = supabase
    .from('provider_comments')
    .select('*')
    .eq('pet_id', petId)
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

/**
 * Create comment
 */
export const createComment = async (
  comment: Omit<Insertable<'provider_comments'>, 'id' | 'created_at'>
): Promise<ProviderComment> => {
  const { data, error } = await supabase
    .from('provider_comments')
    .insert(comment)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update comment
 */
export const updateComment = async (
  commentId: string,
  updates: Updatable<'provider_comments'>
): Promise<ProviderComment> => {
  const { data, error } = await supabase
    .from('provider_comments')
    .update(updates)
    .eq('id', commentId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete comment
 */
export const deleteComment = async (commentId: string): Promise<void> => {
  const { error } = await supabase
    .from('provider_comments')
    .delete()
    .eq('id', commentId);

  if (error) throw error;
};

// ============================================
// Saved Places
// ============================================

/**
 * Get saved places for a user
 */
export const getSavedPlaces = async (
  userId: string
): Promise<ServiceProvider[]> => {
  const { data, error } = await supabase
    .from('saved_places')
    .select(`
      provider:service_providers(*)
    `)
    .eq('user_id', userId);

  if (error) throw error;
  return (data || []).map(sp => sp.provider as ServiceProvider);
};

/**
 * Save a place
 */
export const savePlace = async (
  userId: string,
  providerId: string
): Promise<void> => {
  const { error } = await supabase
    .from('saved_places')
    .insert({
      user_id: userId,
      provider_id: providerId,
    });

  if (error) {
    // Ignore duplicate error
    if (error.code !== '23505') {
      throw error;
    }
  }
};

/**
 * Unsave a place
 */
export const unsavePlace = async (
  userId: string,
  providerId: string
): Promise<void> => {
  const { error } = await supabase
    .from('saved_places')
    .delete()
    .eq('user_id', userId)
    .eq('provider_id', providerId);

  if (error) throw error;
};

/**
 * Check if a place is saved
 */
export const isPlaceSaved = async (
  userId: string,
  providerId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from('saved_places')
    .select('id')
    .eq('user_id', userId)
    .eq('provider_id', providerId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return false;
    }
    throw error;
  }

  return !!data;
};

// ============================================
// Recent Places
// ============================================

/**
 * Get recent places for a user
 */
export const getRecentPlaces = async (
  userId: string,
  limit: number = 15
): Promise<ServiceProvider[]> => {
  const { data, error } = await supabase
    .from('recent_places')
    .select(`
      provider:service_providers(*)
    `)
    .eq('user_id', userId)
    .order('viewed_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []).map(rp => rp.provider as ServiceProvider);
};

/**
 * Add to recent places
 */
export const addToRecentPlaces = async (
  userId: string,
  providerId: string
): Promise<void> => {
  // Upsert - update viewed_at if exists, insert if not
  const { error } = await supabase
    .from('recent_places')
    .upsert(
      {
        user_id: userId,
        provider_id: providerId,
        viewed_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,provider_id',
      }
    );

  if (error) throw error;
};

/**
 * Clear recent places
 */
export const clearRecentPlaces = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('recent_places')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
};
