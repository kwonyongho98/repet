import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import type { 
  Booking, 
  BookingStatus, 
  ProviderService,
  ProviderAvailability,
  ProviderBlackout,
  BookingReview,
  CreateBookingRequest,
  AvailabilityResponse,
  BookingFilter,
  PetInfoSnapshot,
} from '../types/booking';
import { format, eachDayOfInterval, parseISO } from 'date-fns';

// ============================================
// Type Aliases for Type-Safe Operations
// ============================================
type ServiceBookingInsert = Database['public']['Tables']['service_bookings']['Insert'];
type ServiceBookingUpdate = Database['public']['Tables']['service_bookings']['Update'];
type ProviderServiceInsert = Database['public']['Tables']['provider_services']['Insert'];
type ProviderServiceUpdate = Database['public']['Tables']['provider_services']['Update'];
type ProviderAvailabilityInsert = Database['public']['Tables']['provider_availability']['Insert'];
type ProviderBlackoutInsert = Database['public']['Tables']['provider_blackouts']['Insert'];
type BookingReviewInsert = Database['public']['Tables']['booking_reviews']['Insert'];

// ============================================
// State Interface
// ============================================
interface BookingState {
  bookings: Booking[];
  providerServices: ProviderService[];
  providerAvailability: ProviderAvailability[];
  providerBlackouts: ProviderBlackout[];
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  
  fetchMyBookings: (familyId: string, filter?: BookingFilter) => Promise<void>;
  fetchProviderBookings: (providerId: string, filter?: BookingFilter) => Promise<void>;
  fetchBookingById: (bookingId: string) => Promise<Booking | null>;
  createBooking: (data: CreateBookingRequest) => Promise<Booking | null>;
  cancelBooking: (bookingId: string, reason?: string) => Promise<boolean>;
  confirmBooking: (bookingId: string) => Promise<boolean>;
  completeBooking: (bookingId: string) => Promise<boolean>;
  rejectBooking: (bookingId: string, reason: string) => Promise<boolean>;
  fetchProviderServices: (providerId: string) => Promise<void>;
  fetchProviderAvailability: (providerId: string) => Promise<void>;
  fetchProviderBlackouts: (providerId: string) => Promise<void>;
  checkAvailability: (providerId: string, serviceId: string, startDate: string, endDate: string) => Promise<AvailabilityResponse[]>;
  createReview: (bookingId: string, rating: number, content?: string, images?: string[]) => Promise<BookingReview | null>;
  clearError: () => void;
  clearBookings: () => void;
}

// ============================================
// Store Implementation
// ============================================
export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  providerServices: [],
  providerAvailability: [],
  providerBlackouts: [],
  isLoading: false,
  isCreating: false,
  error: null,

  // ============================================
  // Fetch My Bookings (고객용) - FIXED
  // ============================================
  fetchMyBookings: async (familyId, filter) => {
    set({ isLoading: true, error: null });
    
    try {
      let query = supabase
        .from('service_bookings')
        .select(`
          *,
          provider:service_providers (
            id, business_name, service_type, phone, address
          ),
          pet:pets (
            id, name, species, breed
          ),
          service:provider_services (
            id, name, base_price, duration_minutes, service_category
          ),
          review:booking_reviews (*)
        `)
        .eq('family_id', familyId)
        .order('start_date', { ascending: false });
      
      if (filter?.status && filter.status.length > 0) {
        query = query.in('status', filter.status);
      }
      if (filter?.startDate) {
        query = query.gte('start_date', filter.startDate);
      }
      if (filter?.endDate) {
        query = query.lte('end_date', filter.endDate);
      }
      if (filter?.providerId) {
        query = query.eq('provider_id', filter.providerId);
      }
      if (filter?.petId) {
        query = query.eq('pet_id', filter.petId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const bookings: Booking[] = (data || []).map(mapBookingFromDB);
      set({ bookings, isLoading: false });
      
    } catch (error: any) {
      console.error('Fetch bookings error:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // ============================================
  // Fetch Provider Bookings (업체용) - FIXED
  // ============================================
  fetchProviderBookings: async (providerId, filter) => {
    set({ isLoading: true, error: null });
    
    try {
      let query = supabase
        .from('service_bookings')
        .select(`
          *,
          pet:pets (
            id, name, species, breed
          ),
          service:provider_services (
            id, name, base_price, duration_minutes
          )
        `)
        .eq('provider_id', providerId)
        .order('start_date', { ascending: true });
      
      if (filter?.status && filter.status.length > 0) {
        query = query.in('status', filter.status);
      }
      if (filter?.startDate) {
        query = query.gte('start_date', filter.startDate);
      }
      if (filter?.endDate) {
        query = query.lte('end_date', filter.endDate);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const bookings: Booking[] = (data || []).map(mapBookingFromDB);
      set({ bookings, isLoading: false });
      
    } catch (error: any) {
      console.error('Fetch provider bookings error:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // ============================================
  // Fetch Booking By ID - FIXED
  // ============================================
  fetchBookingById: async (bookingId) => {
    try {
      const { data, error } = await supabase
        .from('service_bookings')
        .select(`
          *,
          provider:service_providers (
            id, business_name, service_type, phone, address
          ),
          pet:pets (
            id, name, species, breed
          ),
          service:provider_services (*),
          review:booking_reviews (*)
        `)
        .eq('id', bookingId)
        .single();
      
      if (error) throw error;
      
      return mapBookingFromDB(data);
      
    } catch (error: any) {
      console.error('Fetch booking by id error:', error);
      return null;
    }
  },

  // ============================================
  // Create Booking - FIXED
  // ============================================
  createBooking: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    set({ isCreating: true, error: null });
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('family_id')
        .eq('id', user.id)
        .single();
      
      if (!profile?.family_id) throw new Error('Family not found');
      
      const { data: service } = await supabase
        .from('provider_services')
        .select('*')
        .eq('id', data.serviceId)
        .single();
      
      if (!service) throw new Error('Service not found');
      
      const { data: pet } = await supabase
        .from('pets')
        .select('name, species, breed, weight')
        .eq('id', data.petId)
        .single();
      
      const bookingInsert: ServiceBookingInsert = {
        provider_id: data.providerId,
        family_id: profile.family_id,
        pet_id: data.petId,
        service_id: data.serviceId,
        start_date: data.startDate,
        end_date: data.endDate || null,
        start_time: data.startTime || null,
        end_time: data.endTime || null,
        total_price: service.base_price,
        special_requests: data.specialRequests || null,
        status: 'pending',
        created_by: user.id,
      };

      const { data: booking, error } = await supabase
        .from('service_bookings')
        .insert(bookingInsert)
        .select(`
          *,
          provider:service_providers (
            id, business_name, service_type, phone, address
          ),
          pet:pets (
            id, name, species, breed
          ),
          service:provider_services (*)
        `)
        .single();
      
      if (error) throw error;
      
      const newBooking = mapBookingFromDB(booking);
      
      set((state) => ({
        bookings: [newBooking, ...state.bookings],
        isCreating: false,
      }));
      
      return newBooking;
      
    } catch (error: any) {
      console.error('Create booking error:', error);
      set({ error: error.message, isCreating: false });
      return null;
    }
  },

  // ============================================
  // Cancel Booking (고객) - FIXED
  // ============================================
  cancelBooking: async (bookingId, reason) => {
    try {
      const bookingUpdate: ServiceBookingUpdate = {
        status: 'cancelled_by_customer',
        cancellation_reason: reason || null,
        cancelled_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('service_bookings')
        .update(bookingUpdate)
        .eq('id', bookingId);
      
      if (error) throw error;
      
      set((state) => ({
        bookings: state.bookings.map((b) =>
          b.id === bookingId
            ? { ...b, status: 'cancelled_by_customer' as BookingStatus, cancellationReason: reason }
            : b
        ),
      }));
      
      return true;
      
    } catch (error: any) {
      console.error('Cancel booking error:', error);
      set({ error: error.message });
      return false;
    }
  },

  // ============================================
  // Confirm Booking (업체) - FIXED
  // ============================================
  confirmBooking: async (bookingId) => {
    try {
      const bookingUpdate: ServiceBookingUpdate = {
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('service_bookings')
        .update(bookingUpdate)
        .eq('id', bookingId);
      
      if (error) throw error;
      
      set((state) => ({
        bookings: state.bookings.map((b) =>
          b.id === bookingId ? { ...b, status: 'confirmed' as BookingStatus } : b
        ),
      }));
      
      return true;
      
    } catch (error: any) {
      console.error('Confirm booking error:', error);
      set({ error: error.message });
      return false;
    }
  },

  // ============================================
  // Complete Booking (업체) - FIXED
  // ============================================
  completeBooking: async (bookingId) => {
    try {
      const bookingUpdate: ServiceBookingUpdate = {
        status: 'completed',
        completed_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('service_bookings')
        .update(bookingUpdate)
        .eq('id', bookingId);
      
      if (error) throw error;
      
      set((state) => ({
        bookings: state.bookings.map((b) =>
          b.id === bookingId ? { ...b, status: 'completed' as BookingStatus } : b
        ),
      }));
      
      return true;
      
    } catch (error: any) {
      console.error('Complete booking error:', error);
      set({ error: error.message });
      return false;
    }
  },

  // ============================================
  // Reject Booking (업체) - FIXED
  // ============================================
  rejectBooking: async (bookingId, reason) => {
    try {
      const bookingUpdate: ServiceBookingUpdate = {
        status: 'cancelled_by_provider',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('service_bookings')
        .update(bookingUpdate)
        .eq('id', bookingId);
      
      if (error) throw error;
      
      set((state) => ({
        bookings: state.bookings.map((b) =>
          b.id === bookingId
            ? { ...b, status: 'cancelled_by_provider' as BookingStatus, cancellationReason: reason }
            : b
        ),
      }));
      
      return true;
      
    } catch (error: any) {
      console.error('Reject booking error:', error);
      set({ error: error.message });
      return false;
    }
  },

  // ============================================
  // Fetch Provider Services - FIXED
  // ============================================
  fetchProviderServices: async (providerId) => {
    try {
      const { data, error } = await supabase
        .from('provider_services')
        .select('*')
        .eq('provider_id', providerId)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      
      const services: ProviderService[] = (data || []).map((s: any) => ({
        id: s.id,
        providerId: s.provider_id,
        name: s.name,
        description: s.description,
        serviceCategory: s.service_category,
        basePrice: s.base_price,
        durationMinutes: s.duration_minutes,
        petSizeAllowed: s.pet_size_allowed,
        petSpeciesAllowed: s.pet_species_allowed,
        maxDailyBookings: s.max_daily_bookings,
        isActive: s.is_active,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
      }));
      
      set({ providerServices: services });
      
    } catch (error: any) {
      console.error('Fetch provider services error:', error);
      set({ error: error.message });
    }
  },

  // ============================================
  // Fetch Provider Availability - FIXED
  // ============================================
  fetchProviderAvailability: async (providerId) => {
    try {
      const { data, error } = await supabase
        .from('provider_availability')
        .select('*')
        .eq('provider_id', providerId)
        .order('day_of_week');
      
      if (error) throw error;
      
      const availability: ProviderAvailability[] = (data || []).map((a: any) => ({
        id: a.id,
        providerId: a.provider_id,
        dayOfWeek: a.day_of_week,
        startTime: a.start_time,
        endTime: a.end_time,
        isAvailable: a.is_available,
        createdAt: a.created_at,
        updatedAt: a.updated_at,
      }));
      
      set({ providerAvailability: availability });
      
    } catch (error: any) {
      console.error('Fetch provider availability error:', error);
      set({ error: error.message });
    }
  },

  // ============================================
  // Fetch Provider Blackouts - FIXED
  // ============================================
  fetchProviderBlackouts: async (providerId) => {
    try {
      const { data, error } = await supabase
        .from('provider_blackouts')
        .select('*')
        .eq('provider_id', providerId)
        .order('start_date');
      
      if (error) throw error;
      
      const blackouts: ProviderBlackout[] = (data || []).map((b: any) => ({
        id: b.id,
        providerId: b.provider_id,
        startDate: b.start_date,
        endDate: b.end_date,
        reason: b.reason,
        createdAt: b.created_at,
      }));
      
      set({ providerBlackouts: blackouts });
      
    } catch (error: any) {
      console.error('Fetch provider blackouts error:', error);
      set({ error: error.message });
    }
  },

  // ============================================
  // Check Availability - FIXED
  // ============================================
  checkAvailability: async (providerId, serviceId, startDate, endDate) => {
    try {
      const { data: service } = await supabase
        .from('provider_services')
        .select('max_daily_bookings')
        .eq('id', serviceId)
        .single();
      
      if (!service) return [];
      
      const maxBookings = service.max_daily_bookings;
      const dates = eachDayOfInterval({
        start: parseISO(startDate),
        end: parseISO(endDate),
      });
      
      const { data: blackouts } = await supabase
        .from('provider_blackouts')
        .select('*')
        .eq('provider_id', providerId)
        .lte('start_date', endDate)
        .gte('end_date', startDate);
      
      const { data: bookings } = await supabase
        .from('service_bookings')
        .select('start_date, end_date')
        .eq('provider_id', providerId)
        .eq('service_id', serviceId)
        .in('status', ['pending', 'confirmed'])
        .lte('start_date', endDate)
        .gte('end_date', startDate);
      
      const availability: AvailabilityResponse[] = dates.map((date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayOfWeek = date.getDay();
        
        const isBlackout = (blackouts || []).some((b: any) =>
          dateStr >= b.start_date && dateStr <= b.end_date
        );
        
        const bookingCount = (bookings || []).filter((b: any) =>
          dateStr >= b.start_date && dateStr <= (b.end_date || b.start_date)
        ).length;
        
        return {
          date: dateStr,
          available: !isBlackout && bookingCount < maxBookings,
          reason: isBlackout ? 'blackout' : bookingCount >= maxBookings ? 'fully_booked' : undefined,
        };
      });
      
      return availability;
      
    } catch (error: any) {
      console.error('Check availability error:', error);
      return [];
    }
  },

  // ============================================
  // Create Review - FIXED
  // ============================================
  createReview: async (bookingId, rating, content, images) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data: booking } = await supabase
        .from('service_bookings')
        .select('provider_id, family_id')
        .eq('id', bookingId)
        .single();
      
      if (!booking) return null;
      
      const reviewInsert: BookingReviewInsert = {
        booking_id: bookingId,
        provider_id: booking.provider_id,
        family_id: booking.family_id,
        rating,
        content: content || null,
        images: images || [],
      };

      const { data, error } = await supabase
        .from('booking_reviews')
        .insert(reviewInsert)
        .select()
        .single();
      
      if (error) throw error;
      
      const review: BookingReview = {
        id: data.id,
        bookingId: data.booking_id,
        providerId: data.provider_id,
        familyId: data.family_id,
        rating: data.rating,
        content: data.content,
        images: data.images || [],
        reply: data.reply,
        repliedAt: data.replied_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
      
      set((state) => ({
        bookings: state.bookings.map((b) =>
          b.id === bookingId ? { ...b, review } : b
        ),
      }));
      
      return review;
      
    } catch (error: any) {
      console.error('Create review error:', error);
      set({ error: error.message });
      return null;
    }
  },

  // ============================================
  // Utils
  // ============================================
  clearError: () => set({ error: null }),
  clearBookings: () => set({ bookings: [], isLoading: false, error: null }),
}));

// ============================================
// Helper: Map DB to Booking (FIXED)
// ============================================
function mapBookingFromDB(data: any): Booking {
  return {
    id: data.id,
    providerId: data.provider_id,
    familyId: data.family_id,
    petId: data.pet_id,
    serviceId: data.service_id,
    startDate: data.start_date,
    endDate: data.end_date,
    startTime: data.start_time,
    endTime: data.end_time,
    serviceName: data.service?.name,
    price: data.total_price,
    status: data.status,
    specialRequests: data.special_requests,
    cancellationReason: data.cancellation_reason,
    cancelledAt: data.cancelled_at,
    confirmedAt: data.confirmed_at,
    completedAt: data.completed_at,
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    provider: data.provider ? {
      id: data.provider.id,
      name: data.provider.business_name,  // ✅ FIXED
      type: data.provider.service_type,   // ✅ FIXED
      phone: data.provider.phone,
      address: data.provider.address,
    } : undefined,
    pet: data.pet ? {
      id: data.pet.id,
      name: data.pet.name,
      species: data.pet.species,
      breed: data.pet.breed,
    } : undefined,
    service: data.service ? {
      id: data.service.id,
      providerId: data.service.provider_id,
      name: data.service.name,
      description: data.service.description,
      serviceCategory: data.service.service_category,
      basePrice: data.service.base_price,
      durationMinutes: data.service.duration_minutes,
      petSizeAllowed: data.service.pet_size_allowed,
      petSpeciesAllowed: data.service.pet_species_allowed,
      maxDailyBookings: data.service.max_daily_bookings,
      isActive: data.service.is_active,
      createdAt: data.service.created_at,
      updatedAt: data.service.updated_at,
    } : undefined,
    review: data.review?.[0] ? {
      id: data.review[0].id,
      bookingId: data.review[0].booking_id,
      providerId: data.review[0].provider_id,
      familyId: data.review[0].family_id,
      rating: data.review[0].rating,
      content: data.review[0].content,
      images: data.review[0].images,
      reply: data.review[0].reply,
      repliedAt: data.review[0].replied_at,
      createdAt: data.review[0].created_at,
      updatedAt: data.review[0].updated_at,
    } : undefined,
  };
}
