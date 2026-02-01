// ============================================
// Supabase Database Types (Corrected Version)
// Generated from actual schema files
// ============================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'family' | 'provider';
          family_id: string | null;
          provider_id: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: 'family' | 'provider';
          family_id?: string | null;
          provider_id?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          email?: string;
          name?: string;
          role?: 'family' | 'provider';
          family_id?: string | null;
          provider_id?: string | null;
          avatar_url?: string | null;
        };
      };
      families: {
        Row: {
          id: string;
          name: string;
          invite_code: string;
          owner_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          invite_code?: string;
          owner_id: string;
        };
        Update: {
          name?: string;
          invite_code?: string;
        };
      };
      family_members: {
        Row: {
          id: string;
          family_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'member';
          joined_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          user_id: string;
          role?: 'owner' | 'admin' | 'member';
        };
        Update: {
          role?: 'owner' | 'admin' | 'member';
        };
      };
      pets: {
        Row: {
          id: string;
          family_id: string;
          name: string;
          species: string;
          breed: string;
          birth_date: string;
          gender: 'male' | 'female';
          weight: number;
          color: string;
          profile_image: string | null;
          microchip_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          name: string;
          species: string;
          breed: string;
          birth_date: string;
          gender: 'male' | 'female';
          weight: number;
          color?: string;
          profile_image?: string | null;
          microchip_id?: string | null;
          notes?: string | null;
        };
        Update: {
          name?: string;
          species?: string;
          breed?: string;
          birth_date?: string;
          gender?: 'male' | 'female';
          weight?: number;
          color?: string;
          profile_image?: string | null;
          microchip_id?: string | null;
          notes?: string | null;
        };
      };
      pet_allergies: {
        Row: {
          id: string;
          pet_id: string;
          allergy_name: string;
          severity: 'mild' | 'moderate' | 'severe';
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          pet_id: string;
          allergy_name: string;
          severity: 'mild' | 'moderate' | 'severe';
          notes?: string | null;
        };
        Update: {
          allergy_name?: string;
          severity?: 'mild' | 'moderate' | 'severe';
          notes?: string | null;
        };
      };
      vaccination_records: {
        Row: {
          id: string;
          pet_id: string;
          vaccine_name: string;
          date: string;
          next_due_date: string | null;
          veterinarian: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          pet_id: string;
          vaccine_name: string;
          date: string;
          next_due_date?: string | null;
          veterinarian?: string | null;
          notes?: string | null;
        };
        Update: {
          vaccine_name?: string;
          date?: string;
          next_due_date?: string | null;
          veterinarian?: string | null;
          notes?: string | null;
        };
      };
      walk_logs: {
        Row: {
          id: string;
          pet_id: string;
          user_id: string;
          date: string;
          start_time: string;
          end_time: string;
          duration: number;
          distance: number | null;
          distance_unit: 'km' | 'm';
          satisfaction: 'good' | 'normal' | 'bad';
          photo_url: string | null;
          path_data: Json | null;
          poop_locations: Json | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          pet_id: string;
          user_id: string;
          date: string;
          start_time: string;
          end_time: string;
          duration: number;
          distance?: number | null;
          distance_unit?: 'km' | 'm';
          satisfaction?: 'good' | 'normal' | 'bad';
          photo_url?: string | null;
          path_data?: Json | null;
          poop_locations?: Json | null;
          notes?: string | null;
        };
        Update: {
          date?: string;
          start_time?: string;
          end_time?: string;
          duration?: number;
          distance?: number | null;
          satisfaction?: 'good' | 'normal' | 'bad';
          photo_url?: string | null;
          path_data?: Json | null;
          poop_locations?: Json | null;
          notes?: string | null;
        };
      };
      meal_logs: {
        Row: {
          id: string;
          pet_id: string;
          user_id: string;
          date: string;
          time: string;
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          food_type: 'dry' | 'wet' | 'cooked' | 'treat' | 'other';
          food_name: string | null;
          amount: number;
          meds_taken: boolean;
          meds_name: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          pet_id: string;
          user_id: string;
          date: string;
          time: string;
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          food_type: 'dry' | 'wet' | 'cooked' | 'treat' | 'other';
          food_name?: string | null;
          amount: number;
          meds_taken?: boolean;
          meds_name?: string | null;
          notes?: string | null;
        };
        Update: {
          date?: string;
          time?: string;
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          food_type?: 'dry' | 'wet' | 'cooked' | 'treat' | 'other';
          food_name?: string | null;
          amount?: number;
          meds_taken?: boolean;
          meds_name?: string | null;
          notes?: string | null;
        };
      };
      bowel_logs: {
        Row: {
          id: string;
          pet_id: string;
          user_id: string;
          date: string;
          time: string;
          bowel_type: 'urine' | 'feces' | 'both';
          condition: 'good' | 'loose' | 'hard';
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          pet_id: string;
          user_id: string;
          date: string;
          time: string;
          bowel_type: 'urine' | 'feces' | 'both';
          condition: 'good' | 'loose' | 'hard';
          notes?: string | null;
        };
        Update: {
          date?: string;
          time?: string;
          bowel_type?: 'urine' | 'feces' | 'both';
          condition?: 'good' | 'loose' | 'hard';
          notes?: string | null;
        };
      };
      weight_logs: {
        Row: {
          id: string;
          pet_id: string;
          user_id: string;
          date: string;
          weight: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          pet_id: string;
          user_id: string;
          date: string;
          weight: number;
          notes?: string | null;
        };
        Update: {
          date?: string;
          weight?: number;
          notes?: string | null;
        };
      };
      expense_logs: {
        Row: {
          id: string;
          pet_id: string;
          user_id: string;
          date: string;
          amount: number;
          category: 'food' | 'medical' | 'grooming' | 'supplies' | 'training' | 'hotel' | 'other';
          description: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          pet_id: string;
          user_id: string;
          date: string;
          amount: number;
          category: 'food' | 'medical' | 'grooming' | 'supplies' | 'training' | 'hotel' | 'other';
          description: string;
          notes?: string | null;
        };
        Update: {
          date?: string;
          amount?: number;
          category?: 'food' | 'medical' | 'grooming' | 'supplies' | 'training' | 'hotel' | 'other';
          description?: string;
          notes?: string | null;
        };
      };
      calendar_events: {
        Row: {
          id: string;
          family_id: string;
          pet_id: string;
          title: string;
          start_time: string;
          end_time: string;
          event_type: 'health' | 'grooming' | 'training' | 'hotel' | 'hospital' | 'walk' | 'other';
          description: string | null;
          location: string | null;
          service_provider: string | null;
          booking_id: string | null;
          related_log_id: string | null;
          related_log_type: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          pet_id: string;
          title: string;
          start_time: string;
          end_time: string;
          event_type: 'health' | 'grooming' | 'training' | 'hotel' | 'hospital' | 'walk' | 'other';
          description?: string | null;
          location?: string | null;
          service_provider?: string | null;
          booking_id?: string | null;
          related_log_id?: string | null;
          related_log_type?: string | null;
          created_by: string;
        };
        Update: {
          title?: string;
          start_time?: string;
          end_time?: string;
          event_type?: 'health' | 'grooming' | 'training' | 'hotel' | 'hospital' | 'walk' | 'other';
          description?: string | null;
          location?: string | null;
          service_provider?: string | null;
          booking_id?: string | null;
          related_log_id?: string | null;
          related_log_type?: string | null;
        };
      };
      // ============================================
      // SERVICE PROVIDERS (CORRECTED)
      // ============================================
      service_providers: {
        Row: {
          id: string;
          owner_id: string;
          business_name: string;  // ✅ CORRECTED: was 'name'
          service_type: 'hotel' | 'training' | 'grooming' | 'hospital';  // ✅ CORRECTED: was 'type'
          address: string;
          phone: string;
          description: string | null;
          business_hours: Json | null;  // ✅ CORRECTED: was 'hours: string'
          latitude: number | null;
          longitude: number | null;
          rating: number;
          review_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          business_name: string;  // ✅ CORRECTED
          service_type: 'hotel' | 'training' | 'grooming' | 'hospital';  // ✅ CORRECTED
          address: string;
          phone: string;
          description?: string | null;
          business_hours?: Json | null;  // ✅ CORRECTED
          latitude?: number | null;
          longitude?: number | null;
          rating?: number;
          review_count?: number;
        };
        Update: {
          business_name?: string;  // ✅ CORRECTED
          service_type?: 'hotel' | 'training' | 'grooming' | 'hospital';  // ✅ CORRECTED
          address?: string;
          phone?: string;
          description?: string | null;
          business_hours?: Json | null;  // ✅ CORRECTED
          latitude?: number | null;
          longitude?: number | null;
          rating?: number;
          review_count?: number;
        };
      };
      // ============================================
      // PROVIDER CONNECTIONS (from 03_provider_connection.sql)
      // ============================================
      provider_connections: {
        Row: {
          id: string;
          provider_id: string;
          family_id: string;
          pet_id: string;
          status: 'pending' | 'active' | 'inactive';
          connection_type: string;
          invite_code: string | null;
          booking_id: string | null;
          permissions: Json;
          connected_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          family_id: string;
          pet_id: string;
          status?: 'pending' | 'active' | 'inactive';
          connection_type?: string;
          invite_code?: string | null;
          booking_id?: string | null;
          permissions?: Json;
          connected_at?: string | null;
          created_by?: string | null;
        };
        Update: {
          status?: 'pending' | 'active' | 'inactive';
          permissions?: Json;
          connected_at?: string | null;
        };
      };
      provider_invites: {
        Row: {
          id: string;
          provider_id: string;
          code: string;
          max_uses: number;
          use_count: number;
          expires_at: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          code: string;
          max_uses?: number;
          use_count?: number;
          expires_at?: string | null;
          created_by: string;
        };
        Update: {
          use_count?: number;
          expires_at?: string | null;
        };
      };
      care_notes: {
        Row: {
          id: string;
          provider_id: string;
          pet_id: string;
          date: string;
          booking_id: string | null;
          mood: 'very_happy' | 'happy' | 'normal' | 'tired' | 'sick';
          activities: Json | null;
          meals: Json | null;
          bowel_logs: Json | null;
          photos: string[];
          special_notes: string | null;
          comment_count: number;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          pet_id: string;
          date: string;
          booking_id?: string | null;
          mood: 'very_happy' | 'happy' | 'normal' | 'tired' | 'sick';
          activities?: Json | null;
          meals?: Json | null;
          bowel_logs?: Json | null;
          photos?: string[];
          special_notes?: string | null;
          comment_count?: number;
          created_by: string;
        };
        Update: {
          mood?: 'very_happy' | 'happy' | 'normal' | 'tired' | 'sick';
          activities?: Json | null;
          meals?: Json | null;
          bowel_logs?: Json | null;
          photos?: string[];
          special_notes?: string | null;
          comment_count?: number;
        };
      };
      care_note_comments: {
        Row: {
          id: string;
          care_note_id: string;
          author_id: string;
          author_type: 'family' | 'provider';
          comment: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          care_note_id: string;
          author_id: string;
          author_type: 'family' | 'provider';
          comment: string;
        };
        Update: {
          comment?: string;
        };
      };
      announcements: {
        Row: {
          id: string;
          provider_id: string;
          title: string;
          content: string;
          is_pinned: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          title: string;
          content: string;
          is_pinned?: boolean;
          created_by: string;
        };
        Update: {
          title?: string;
          content?: string;
          is_pinned?: boolean;
        };
      };
      announcement_reads: {
        Row: {
          id: string;
          announcement_id: string;
          user_id: string;
          read_at: string;
        };
        Insert: {
          id?: string;
          announcement_id: string;
          user_id: string;
        };
        Update: never;
      };
    };
    Enums: {
      user_role: 'family' | 'provider';
      family_role: 'owner' | 'admin' | 'member';
      pet_gender: 'male' | 'female';
      service_type: 'hotel' | 'training' | 'grooming' | 'hospital';
      booking_status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'cancelled_by_provider' | 'cancelled_by_customer' | 'no_show';
      connection_status: 'pending' | 'active' | 'inactive';
      care_mood: 'very_happy' | 'happy' | 'normal' | 'tired' | 'sick';
    };
  };
}

      // ============================================
      // BOOKING SYSTEM
      // ============================================
      service_bookings: {
        Row: {
          id: string;
          provider_id: string;
          family_id: string;
          pet_id: string;
          start_date: string;
          end_date: string | null;
          start_time: string | null;
          end_time: string | null;
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'cancelled_by_provider' | 'cancelled_by_customer' | 'no_show';
          total_price: number | null;
          special_requests: string | null;
          cancellation_reason: string | null;
          service_id: string | null;
          created_by: string | null;
          confirmed_at: string | null;
          cancelled_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          family_id: string;
          pet_id: string;
          start_date: string;
          end_date?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'cancelled_by_provider' | 'cancelled_by_customer' | 'no_show';
          total_price?: number | null;
          special_requests?: string | null;
          cancellation_reason?: string | null;
          service_id?: string | null;
          created_by?: string | null;
          confirmed_at?: string | null;
          cancelled_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          start_date?: string;
          end_date?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'cancelled_by_provider' | 'cancelled_by_customer' | 'no_show';
          total_price?: number | null;
          special_requests?: string | null;
          cancellation_reason?: string | null;
          service_id?: string | null;
          confirmed_at?: string | null;
          cancelled_at?: string | null;
          completed_at?: string | null;
        };
      };
      provider_services: {
        Row: {
          id: string;
          provider_id: string;
          name: string;
          description: string | null;
          service_category: 'hotel' | 'training' | 'grooming' | 'hospital';
          base_price: number;
          duration_minutes: number | null;
          pet_size_allowed: string[];
          pet_species_allowed: string[];
          max_daily_bookings: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          name: string;
          description?: string | null;
          service_category: 'hotel' | 'training' | 'grooming' | 'hospital';
          base_price: number;
          duration_minutes?: number | null;
          pet_size_allowed?: string[];
          pet_species_allowed?: string[];
          max_daily_bookings?: number;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          description?: string | null;
          service_category?: 'hotel' | 'training' | 'grooming' | 'hospital';
          base_price?: number;
          duration_minutes?: number | null;
          pet_size_allowed?: string[];
          pet_species_allowed?: string[];
          max_daily_bookings?: number;
          is_active?: boolean;
        };
      };
      provider_availability: {
        Row: {
          id: string;
          provider_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_available?: boolean;
        };
        Update: {
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          is_available?: boolean;
        };
      };
      provider_blackouts: {
        Row: {
          id: string;
          provider_id: string;
          start_date: string;
          end_date: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          start_date: string;
          end_date: string;
          reason?: string | null;
        };
        Update: {
          start_date?: string;
          end_date?: string;
          reason?: string | null;
        };
      };
      booking_reviews: {
        Row: {
          id: string;
          booking_id: string;
          provider_id: string;
          family_id: string;
          rating: number;
          content: string | null;
          images: string[];
          reply: string | null;
          replied_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          provider_id: string;
          family_id: string;
          rating: number;
          content?: string | null;
          images?: string[];
          reply?: string | null;
          replied_at?: string | null;
        };
        Update: {
          rating?: number;
          content?: string | null;
          images?: string[];
          reply?: string | null;
          replied_at?: string | null;
        };
      };
    };
    Enums: {
      user_role: 'family' | 'provider';
      family_role: 'owner' | 'admin' | 'member';
      pet_gender: 'male' | 'female';
      service_type: 'hotel' | 'training' | 'grooming' | 'hospital';
      booking_status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'cancelled_by_provider' | 'cancelled_by_customer' | 'no_show';
      connection_status: 'pending' | 'active' | 'inactive';
      care_mood: 'very_happy' | 'happy' | 'normal' | 'tired' | 'sick';
    };
  };
}
