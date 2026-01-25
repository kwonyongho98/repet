// ============================================
// Supabase Database Types
// Auto-generated types for type safety
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
      // ============================================
      // Users & Families
      // ============================================
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
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'family' | 'provider';
          family_id?: string | null;
          provider_id?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
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
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          invite_code?: string;
          updated_at?: string;
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
          joined_at?: string;
        };
        Update: {
          role?: 'owner' | 'admin' | 'member';
        };
      };

      // ============================================
      // Pets
      // ============================================
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
          created_at?: string;
          updated_at?: string;
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
          updated_at?: string;
        };
      };

      // Allergies (separate table)
      pet_allergies: {
        Row: {
          id: string;
          pet_id: string;
          allergy_name: string;
          severity: 'mild' | 'moderate' | 'severe' | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          pet_id: string;
          allergy_name: string;
          severity?: 'mild' | 'moderate' | 'severe' | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          allergy_name?: string;
          severity?: 'mild' | 'moderate' | 'severe' | null;
          notes?: string | null;
        };
      };

      // Vaccination Records (separate table)
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
          created_at?: string;
        };
        Update: {
          vaccine_name?: string;
          date?: string;
          next_due_date?: string | null;
          veterinarian?: string | null;
          notes?: string | null;
        };
      };

      // ============================================
      // Daily Logs
      // ============================================
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
          created_at?: string;
        };
        Update: {
          date?: string;
          start_time?: string;
          end_time?: string;
          duration?: number;
          distance?: number | null;
          distance_unit?: 'km' | 'm';
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
          created_at?: string;
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
          created_at?: string;
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
          created_at?: string;
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
          created_at?: string;
        };
        Update: {
          date?: string;
          amount?: number;
          category?: 'food' | 'medical' | 'grooming' | 'supplies' | 'training' | 'hotel' | 'other';
          description?: string;
          notes?: string | null;
        };
      };

      // ============================================
      // Calendar & Events
      // ============================================
      calendar_events: {
        Row: {
          id: string;
          family_id: string;
          pet_id: string;
          title: string;
          start_time: string;
          end_time: string;
          event_type: 'health' | 'grooming' | 'training' | 'hotel' | 'hospital' | 'other';
          description: string | null;
          location: string | null;
          service_provider: string | null;
          booking_id: string | null;
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
          event_type: 'health' | 'grooming' | 'training' | 'hotel' | 'hospital' | 'other';
          description?: string | null;
          location?: string | null;
          service_provider?: string | null;
          booking_id?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          start_time?: string;
          end_time?: string;
          event_type?: 'health' | 'grooming' | 'training' | 'hotel' | 'hospital' | 'other';
          description?: string | null;
          location?: string | null;
          service_provider?: string | null;
          booking_id?: string | null;
          updated_at?: string;
        };
      };

      // ============================================
      // Service Providers & Bookings
      // ============================================
      service_providers: {
        Row: {
          id: string;
          owner_id: string | null;
          name: string;
          type: 'hotel' | 'training' | 'grooming' | 'hospital';
          description: string;
          address: string;
          phone: string;
          hours: string;
          rating: number;
          review_count: number;
          images: string[];
          services: string[];
          price_range: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id?: string | null;
          name: string;
          type: 'hotel' | 'training' | 'grooming' | 'hospital';
          description: string;
          address: string;
          phone: string;
          hours: string;
          rating?: number;
          review_count?: number;
          images?: string[];
          services?: string[];
          price_range: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          type?: 'hotel' | 'training' | 'grooming' | 'hospital';
          description?: string;
          address?: string;
          phone?: string;
          hours?: string;
          rating?: number;
          review_count?: number;
          images?: string[];
          services?: string[];
          price_range?: string;
          updated_at?: string;
        };
      };

      service_bookings: {
        Row: {
          id: string;
          provider_id: string;
          family_id: string;
          pet_id: string;
          service_name: string;
          start_date: string;
          end_date: string;
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          price: number;
          notes: string | null;
          pet_info_snapshot: Json | null;
          calendar_event_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          family_id: string;
          pet_id: string;
          service_name: string;
          start_date: string;
          end_date: string;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          price: number;
          notes?: string | null;
          pet_info_snapshot?: Json | null;
          calendar_event_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          service_name?: string;
          start_date?: string;
          end_date?: string;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          price?: number;
          notes?: string | null;
          pet_info_snapshot?: Json | null;
          calendar_event_id?: string | null;
          updated_at?: string;
        };
      };

      provider_comments: {
        Row: {
          id: string;
          provider_id: string;
          booking_id: string;
          pet_id: string;
          comment: string;
          image_url: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          booking_id: string;
          pet_id: string;
          comment: string;
          image_url?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          comment?: string;
          image_url?: string | null;
        };
      };

      // ============================================
      // Saved Places
      // ============================================
      saved_places: {
        Row: {
          id: string;
          user_id: string;
          provider_id: string;
          saved_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider_id: string;
          saved_at?: string;
        };
        Update: never;
      };

      recent_places: {
        Row: {
          id: string;
          user_id: string;
          provider_id: string;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider_id: string;
          viewed_at?: string;
        };
        Update: {
          viewed_at?: string;
        };
      };

      // ============================================
      // Family Board
      // ============================================
      family_todos: {
        Row: {
          id: string;
          family_id: string;
          text: string;
          is_completed: boolean;
          completed_by: string | null;
          completed_at: string | null;
          created_by: string;
          due_date: string | null;
          pet_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          text: string;
          is_completed?: boolean;
          completed_by?: string | null;
          completed_at?: string | null;
          created_by: string;
          due_date?: string | null;
          pet_id?: string | null;
          created_at?: string;
        };
        Update: {
          text?: string;
          is_completed?: boolean;
          completed_by?: string | null;
          completed_at?: string | null;
          due_date?: string | null;
          pet_id?: string | null;
        };
      };

      family_notes: {
        Row: {
          id: string;
          family_id: string;
          title: string;
          content: string;
          color: string;
          is_pinned: boolean;
          pet_id: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          title: string;
          content: string;
          color?: string;
          is_pinned?: boolean;
          pet_id?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          content?: string;
          color?: string;
          is_pinned?: boolean;
          pet_id?: string | null;
          updated_at?: string;
        };
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      [_ in never]: never;
    };

    Enums: {
      user_role: 'family' | 'provider';
      family_role: 'owner' | 'admin' | 'member';
      pet_gender: 'male' | 'female';
      allergy_severity: 'mild' | 'moderate' | 'severe';
      satisfaction_level: 'good' | 'normal' | 'bad';
      bowel_type: 'urine' | 'feces' | 'both';
      bowel_condition: 'good' | 'loose' | 'hard';
      meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      food_type: 'dry' | 'wet' | 'cooked' | 'treat' | 'other';
      expense_category: 'food' | 'medical' | 'grooming' | 'supplies' | 'training' | 'hotel' | 'other';
      event_type: 'health' | 'grooming' | 'training' | 'hotel' | 'hospital' | 'other';
      service_type: 'hotel' | 'training' | 'grooming' | 'hospital';
      booking_status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
      distance_unit: 'km' | 'm';
    };
  };
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
