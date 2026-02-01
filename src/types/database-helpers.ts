// ============================================
// Supabase Database Types - Helper Types
// ============================================

import type { Database } from './database';

// Table row types
export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'];

// Insertable types  
export type Insertable<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert'];

// Updatable types
export type Updatable<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update'];

// Enum types
export type Enums<T extends keyof Database['public']['Enums']> = 
  Database['public']['Enums'][T];

// ============================================
// Type Aliases
// ============================================

export type Profile = Tables<'profiles'>;
export type Family = Tables<'families'>;
export type FamilyMember = Tables<'family_members'>;
export type Pet = Tables<'pets'>;
export type WalkLog = Tables<'walk_logs'>;
export type MealLog = Tables<'meal_logs'>;
export type BowelLog = Tables<'bowel_logs'>;
export type WeightLog = Tables<'weight_logs'>;
export type ExpenseLog = Tables<'expense_logs'>;
export type ServiceProvider = Tables<'service_providers'>;
export type ServiceBooking = Tables<'service_bookings'>;
export type CalendarEvent = Tables<'calendar_events'>;
export type CareNote = Tables<'care_notes'>;
export type CareNoteComment = Tables<'care_note_comments'>;
export type Announcement = Tables<'announcements'>;
export type AnnouncementRead = Tables<'announcement_reads'>;
export type ProviderConnection = Tables<'provider_connections'>;
export type ProviderService = Tables<'provider_services'>;

// ============================================
// Insert Type Aliases
// ============================================

export type ProfileInsert = Insertable<'profiles'>;
export type FamilyInsert = Insertable<'families'>;
export type PetInsert = Insertable<'pets'>;
export type WalkLogInsert = Insertable<'walk_logs'>;
export type MealLogInsert = Insertable<'meal_logs'>;
export type ServiceBookingInsert = Insertable<'service_bookings'>;
export type CareNoteInsert = Insertable<'care_notes'>;
export type CareNoteCommentInsert = Insertable<'care_note_comments'>;
export type AnnouncementInsert = Insertable<'announcements'>;
export type AnnouncementReadInsert = Insertable<'announcement_reads'>;
export type ProviderConnectionInsert = Insertable<'provider_connections'>;

// ============================================
// Update Type Aliases
// ============================================

export type ProfileUpdate = Updatable<'profiles'>;
export type FamilyUpdate = Updatable<'families'>;
export type PetUpdate = Updatable<'pets'>;
export type ServiceBookingUpdate = Updatable<'service_bookings'>;
export type CareNoteUpdate = Updatable<'care_notes'>;
export type CareNoteCommentUpdate = Updatable<'care_note_comments'>;
export type AnnouncementUpdate = Updatable<'announcements'>;
export type ProviderConnectionUpdate = Updatable<'provider_connections'>;

// ============================================
// Join Query Result Types
// ============================================

export type ProfileWithFamily = Profile & {
  family?: Family | null;
};

export type BookingWithRelations = ServiceBooking & {
  provider?: Pick<ServiceProvider, 'id' | 'business_name' | 'service_type' | 'phone' | 'address'> | null;
  pet?: Pick<Pet, 'id' | 'name' | 'species' | 'breed'> | null;
  service?: Pick<ProviderService, 'id' | 'name' | 'base_price'> | null;
};

export type CareNoteWithRelations = CareNote & {
  provider?: Pick<ServiceProvider, 'id' | 'business_name' | 'service_type'> | null;
  pet?: Pick<Pet, 'id' | 'name' | 'species' | 'breed' | 'profile_image'> | null;
  comments?: CareNoteComment[];
};

export type ProviderConnectionWithRelations = ProviderConnection & {
  provider?: ServiceProvider | null;
  pet?: Pet | null;
  family?: Family | null;
};

// ============================================
// Utility Types
// ============================================

export type NullToUndefined<T> = {
  [K in keyof T]: T[K] extends null ? undefined : T[K];
};

export type SafeProfile = NullToUndefined<Profile>;
export type SafeServiceBooking = NullToUndefined<ServiceBooking>;
export type SafeCareNote = NullToUndefined<CareNote>;
