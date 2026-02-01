export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      announcement_reads: {
        Row: {
          announcement_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          announcement_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          announcement_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          content: string
          created_at: string | null
          created_by: string
          id: string
          is_pinned: boolean | null
          provider_id: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by: string
          id?: string
          is_pinned?: boolean | null
          provider_id: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string
          id?: string
          is_pinned?: boolean | null
          provider_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_reviews: {
        Row: {
          booking_id: string
          content: string | null
          created_at: string | null
          family_id: string
          id: string
          images: string[] | null
          provider_id: string
          rating: number
          replied_at: string | null
          reply: string | null
          updated_at: string | null
        }
        Insert: {
          booking_id: string
          content?: string | null
          created_at?: string | null
          family_id: string
          id?: string
          images?: string[] | null
          provider_id: string
          rating: number
          replied_at?: string | null
          reply?: string | null
          updated_at?: string | null
        }
        Update: {
          booking_id?: string
          content?: string | null
          created_at?: string | null
          family_id?: string
          id?: string
          images?: string[] | null
          provider_id?: string
          rating?: number
          replied_at?: string | null
          reply?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "service_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_reviews_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_reviews_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      bowel_logs: {
        Row: {
          bowel_type: Database["public"]["Enums"]["bowel_type"]
          condition: Database["public"]["Enums"]["bowel_condition"]
          created_at: string | null
          date: string
          id: string
          notes: string | null
          pet_id: string
          time: string
          user_id: string
        }
        Insert: {
          bowel_type: Database["public"]["Enums"]["bowel_type"]
          condition: Database["public"]["Enums"]["bowel_condition"]
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          pet_id: string
          time: string
          user_id: string
        }
        Update: {
          bowel_type?: Database["public"]["Enums"]["bowel_type"]
          condition?: Database["public"]["Enums"]["bowel_condition"]
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          pet_id?: string
          time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bowel_logs_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bowel_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          booking_id: string | null
          created_at: string | null
          created_by: string
          description: string | null
          end_time: string
          event_type: Database["public"]["Enums"]["event_type"]
          family_id: string
          id: string
          location: string | null
          pet_id: string
          related_log_id: string | null
          related_log_type: string | null
          service_provider: string | null
          start_time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          end_time: string
          event_type: Database["public"]["Enums"]["event_type"]
          family_id: string
          id?: string
          location?: string | null
          pet_id: string
          related_log_id?: string | null
          related_log_type?: string | null
          service_provider?: string | null
          start_time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          end_time?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          family_id?: string
          id?: string
          location?: string | null
          pet_id?: string
          related_log_id?: string | null
          related_log_type?: string | null
          service_provider?: string | null
          start_time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      care_note_comments: {
        Row: {
          author_id: string
          author_type: string
          care_note_id: string
          content: string
          created_at: string | null
          id: string
        }
        Insert: {
          author_id: string
          author_type: string
          care_note_id: string
          content: string
          created_at?: string | null
          id?: string
        }
        Update: {
          author_id?: string
          author_type?: string
          care_note_id?: string
          content?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_note_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_note_comments_care_note_id_fkey"
            columns: ["care_note_id"]
            isOneToOne: false
            referencedRelation: "care_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      care_notes: {
        Row: {
          activities: Json | null
          booking_id: string
          bowel_logs: Json | null
          comment: string | null
          comment_count: number | null
          created_at: string | null
          created_by: string
          date: string
          family_id: string
          id: string
          meals: Json | null
          mood: Database["public"]["Enums"]["care_mood"]
          mood_note: string | null
          pet_id: string
          photos: string[] | null
          provider_id: string
          updated_at: string | null
        }
        Insert: {
          activities?: Json | null
          booking_id: string
          bowel_logs?: Json | null
          comment?: string | null
          comment_count?: number | null
          created_at?: string | null
          created_by: string
          date: string
          family_id: string
          id?: string
          meals?: Json | null
          mood?: Database["public"]["Enums"]["care_mood"]
          mood_note?: string | null
          pet_id: string
          photos?: string[] | null
          provider_id: string
          updated_at?: string | null
        }
        Update: {
          activities?: Json | null
          booking_id?: string
          bowel_logs?: Json | null
          comment?: string | null
          comment_count?: number | null
          created_at?: string | null
          created_by?: string
          date?: string
          family_id?: string
          id?: string
          meals?: Json | null
          mood?: Database["public"]["Enums"]["care_mood"]
          mood_note?: string | null
          pet_id?: string
          photos?: string[] | null
          provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_notes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "service_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_notes_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_notes_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_notes_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_logs: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string | null
          date: string
          description: string
          id: string
          notes: string | null
          pet_id: string
          user_id: string
        }
        Insert: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at?: string | null
          date: string
          description: string
          id?: string
          notes?: string | null
          pet_id: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          notes?: string | null
          pet_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_logs_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          created_at: string | null
          id: string
          invite_code: string
          name: string
          owner_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          invite_code: string
          name: string
          owner_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          invite_code?: string
          name?: string
          owner_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "families_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          family_id: string
          id: string
          joined_at: string | null
          role: Database["public"]["Enums"]["family_role"] | null
          user_id: string
        }
        Insert: {
          family_id: string
          id?: string
          joined_at?: string | null
          role?: Database["public"]["Enums"]["family_role"] | null
          user_id: string
        }
        Update: {
          family_id?: string
          id?: string
          joined_at?: string | null
          role?: Database["public"]["Enums"]["family_role"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      family_notes: {
        Row: {
          color: string | null
          content: string
          created_at: string | null
          created_by: string
          family_id: string
          id: string
          is_pinned: boolean | null
          pet_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          content: string
          created_at?: string | null
          created_by: string
          family_id: string
          id?: string
          is_pinned?: boolean | null
          pet_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          content?: string
          created_at?: string | null
          created_by?: string
          family_id?: string
          id?: string
          is_pinned?: boolean | null
          pet_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_notes_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_notes_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      family_todos: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          created_by: string
          due_date: string | null
          family_id: string
          id: string
          is_completed: boolean | null
          pet_id: string | null
          text: string
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by: string
          due_date?: string | null
          family_id: string
          id?: string
          is_completed?: boolean | null
          pet_id?: string | null
          text: string
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by?: string
          due_date?: string | null
          family_id?: string
          id?: string
          is_completed?: boolean | null
          pet_id?: string | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_todos_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_todos_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_logs: {
        Row: {
          amount: number
          created_at: string | null
          date: string
          food_name: string | null
          food_type: Database["public"]["Enums"]["food_type"]
          id: string
          meal_type: Database["public"]["Enums"]["meal_type"]
          meds_name: string | null
          meds_taken: boolean | null
          notes: string | null
          pet_id: string
          time: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          date: string
          food_name?: string | null
          food_type: Database["public"]["Enums"]["food_type"]
          id?: string
          meal_type: Database["public"]["Enums"]["meal_type"]
          meds_name?: string | null
          meds_taken?: boolean | null
          notes?: string | null
          pet_id: string
          time: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          date?: string
          food_name?: string | null
          food_type?: Database["public"]["Enums"]["food_type"]
          id?: string
          meal_type?: Database["public"]["Enums"]["meal_type"]
          meds_name?: string | null
          meds_taken?: boolean | null
          notes?: string | null
          pet_id?: string
          time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_logs_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          data: Json | null
          id: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          data?: Json | null
          id?: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_allergies: {
        Row: {
          allergy_name: string
          created_at: string | null
          id: string
          notes: string | null
          pet_id: string
          severity: Database["public"]["Enums"]["allergy_severity"] | null
        }
        Insert: {
          allergy_name: string
          created_at?: string | null
          id?: string
          notes?: string | null
          pet_id: string
          severity?: Database["public"]["Enums"]["allergy_severity"] | null
        }
        Update: {
          allergy_name?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          pet_id?: string
          severity?: Database["public"]["Enums"]["allergy_severity"] | null
        }
        Relationships: [
          {
            foreignKeyName: "pet_allergies_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          birth_date: string
          breed: string
          color: string | null
          created_at: string | null
          family_id: string
          gender: Database["public"]["Enums"]["pet_gender"]
          id: string
          microchip_id: string | null
          name: string
          notes: string | null
          profile_image: string | null
          species: string
          updated_at: string | null
          weight: number
        }
        Insert: {
          birth_date: string
          breed: string
          color?: string | null
          created_at?: string | null
          family_id: string
          gender: Database["public"]["Enums"]["pet_gender"]
          id?: string
          microchip_id?: string | null
          name: string
          notes?: string | null
          profile_image?: string | null
          species: string
          updated_at?: string | null
          weight: number
        }
        Update: {
          birth_date?: string
          breed?: string
          color?: string | null
          created_at?: string | null
          family_id?: string
          gender?: Database["public"]["Enums"]["pet_gender"]
          id?: string
          microchip_id?: string | null
          name?: string
          notes?: string | null
          profile_image?: string | null
          species?: string
          updated_at?: string | null
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "pets_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          family_id: string | null
          id: string
          name: string
          provider_id: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          family_id?: string | null
          id: string
          name: string
          provider_id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          family_id?: string | null
          id?: string
          name?: string
          provider_id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_family"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_profiles_provider"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_availability: {
        Row: {
          close_time: string
          day_of_week: number
          id: string
          is_closed: boolean | null
          open_time: string
          provider_id: string
        }
        Insert: {
          close_time: string
          day_of_week: number
          id?: string
          is_closed?: boolean | null
          open_time: string
          provider_id: string
        }
        Update: {
          close_time?: string
          day_of_week?: number
          id?: string
          is_closed?: boolean | null
          open_time?: string
          provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_availability_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_blackouts: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          provider_id: string
          reason: string | null
          start_date: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          provider_id: string
          reason?: string | null
          start_date: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          provider_id?: string
          reason?: string | null
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_blackouts_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_comments: {
        Row: {
          booking_id: string
          comment: string
          created_at: string | null
          created_by: string
          id: string
          image_url: string | null
          pet_id: string
          provider_id: string
        }
        Insert: {
          booking_id: string
          comment: string
          created_at?: string | null
          created_by: string
          id?: string
          image_url?: string | null
          pet_id: string
          provider_id: string
        }
        Update: {
          booking_id?: string
          comment?: string
          created_at?: string | null
          created_by?: string
          id?: string
          image_url?: string | null
          pet_id?: string
          provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_comments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "service_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_comments_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_comments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_connections: {
        Row: {
          booking_id: string | null
          connected_at: string | null
          connection_type: string | null
          created_at: string | null
          created_by: string | null
          family_id: string
          id: string
          invite_code: string | null
          permissions: Json | null
          pet_id: string
          provider_id: string
          status: Database["public"]["Enums"]["connection_status"] | null
          updated_at: string | null
        }
        Insert: {
          booking_id?: string | null
          connected_at?: string | null
          connection_type?: string | null
          created_at?: string | null
          created_by?: string | null
          family_id: string
          id?: string
          invite_code?: string | null
          permissions?: Json | null
          pet_id: string
          provider_id: string
          status?: Database["public"]["Enums"]["connection_status"] | null
          updated_at?: string | null
        }
        Update: {
          booking_id?: string | null
          connected_at?: string | null
          connection_type?: string | null
          created_at?: string | null
          created_by?: string | null
          family_id?: string
          id?: string
          invite_code?: string | null
          permissions?: Json | null
          pet_id?: string
          provider_id?: string
          status?: Database["public"]["Enums"]["connection_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_connections_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "service_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_connections_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_connections_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_connections_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_connections_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_invites: {
        Row: {
          code: string
          created_at: string | null
          created_by: string
          expires_at: string
          id: string
          max_uses: number | null
          provider_id: string
          use_count: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by: string
          expires_at: string
          id?: string
          max_uses?: number | null
          provider_id: string
          use_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string
          expires_at?: string
          id?: string
          max_uses?: number | null
          provider_id?: string
          use_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_invites_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_invites_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_services: {
        Row: {
          base_price: number
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          max_daily_bookings: number | null
          name: string
          pet_size_allowed: string[] | null
          pet_species_allowed: string[] | null
          provider_id: string
          service_category: Database["public"]["Enums"]["service_type"]
          updated_at: string | null
        }
        Insert: {
          base_price: number
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          max_daily_bookings?: number | null
          name: string
          pet_size_allowed?: string[] | null
          pet_species_allowed?: string[] | null
          provider_id: string
          service_category: Database["public"]["Enums"]["service_type"]
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          max_daily_bookings?: number | null
          name?: string
          pet_size_allowed?: string[] | null
          pet_species_allowed?: string[] | null
          provider_id?: string
          service_category?: Database["public"]["Enums"]["service_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          keys: Json
          user_id: string
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          keys: Json
          user_id: string
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          keys?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recent_places: {
        Row: {
          id: string
          provider_id: string
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          id?: string
          provider_id: string
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          id?: string
          provider_id?: string
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recent_places_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recent_places_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_places: {
        Row: {
          id: string
          provider_id: string
          saved_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          provider_id: string
          saved_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          provider_id?: string
          saved_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_places_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_places_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_bookings: {
        Row: {
          calendar_event_id: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string | null
          created_by: string | null
          end_date: string
          end_time: string | null
          family_id: string
          id: string
          notes: string | null
          pet_id: string
          pet_info_snapshot: Json | null
          price: number
          provider_id: string
          service_id: string | null
          service_name: string
          special_requests: string | null
          start_date: string
          start_time: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          updated_at: string | null
        }
        Insert: {
          calendar_event_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          end_date: string
          end_time?: string | null
          family_id: string
          id?: string
          notes?: string | null
          pet_id: string
          pet_info_snapshot?: Json | null
          price: number
          provider_id: string
          service_id?: string | null
          service_name: string
          special_requests?: string | null
          start_date: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          updated_at?: string | null
        }
        Update: {
          calendar_event_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string
          end_time?: string | null
          family_id?: string
          id?: string
          notes?: string | null
          pet_id?: string
          pet_info_snapshot?: Json | null
          price?: number
          provider_id?: string
          service_id?: string | null
          service_name?: string
          special_requests?: string | null
          start_date?: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_bookings_calendar_event_id_fkey"
            columns: ["calendar_event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "provider_services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_providers: {
        Row: {
          address: string
          business_hours: Json | null
          created_at: string | null
          description: string
          hours: string
          id: string
          images: string[] | null
          latitude: number | null
          longitude: number | null
          name: string
          owner_id: string | null
          phone: string
          price_range: string
          rating: number | null
          review_count: number | null
          services: string[] | null
          type: Database["public"]["Enums"]["service_type"]
          updated_at: string | null
        }
        Insert: {
          address: string
          business_hours?: Json | null
          created_at?: string | null
          description: string
          hours: string
          id?: string
          images?: string[] | null
          latitude?: number | null
          longitude?: number | null
          name: string
          owner_id?: string | null
          phone: string
          price_range: string
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          type: Database["public"]["Enums"]["service_type"]
          updated_at?: string | null
        }
        Update: {
          address?: string
          business_hours?: Json | null
          created_at?: string | null
          description?: string
          hours?: string
          id?: string
          images?: string[] | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          owner_id?: string | null
          phone?: string
          price_range?: string
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          type?: Database["public"]["Enums"]["service_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_providers_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vaccination_records: {
        Row: {
          created_at: string | null
          date: string
          id: string
          next_due_date: string | null
          notes: string | null
          pet_id: string
          vaccine_name: string
          veterinarian: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          next_due_date?: string | null
          notes?: string | null
          pet_id: string
          vaccine_name: string
          veterinarian?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          next_due_date?: string | null
          notes?: string | null
          pet_id?: string
          vaccine_name?: string
          veterinarian?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vaccination_records_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      walk_logs: {
        Row: {
          created_at: string | null
          date: string
          distance: number | null
          distance_unit: Database["public"]["Enums"]["distance_unit"] | null
          duration: number
          end_time: string
          id: string
          notes: string | null
          path_data: Json | null
          pet_id: string
          photo_url: string | null
          poop_locations: Json | null
          satisfaction: Database["public"]["Enums"]["satisfaction_level"] | null
          start_time: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          distance?: number | null
          distance_unit?: Database["public"]["Enums"]["distance_unit"] | null
          duration: number
          end_time: string
          id?: string
          notes?: string | null
          path_data?: Json | null
          pet_id: string
          photo_url?: string | null
          poop_locations?: Json | null
          satisfaction?:
            | Database["public"]["Enums"]["satisfaction_level"]
            | null
          start_time: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          distance?: number | null
          distance_unit?: Database["public"]["Enums"]["distance_unit"] | null
          duration?: number
          end_time?: string
          id?: string
          notes?: string | null
          path_data?: Json | null
          pet_id?: string
          photo_url?: string | null
          poop_locations?: Json | null
          satisfaction?:
            | Database["public"]["Enums"]["satisfaction_level"]
            | null
          start_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "walk_logs_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "walk_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weight_logs: {
        Row: {
          created_at: string | null
          date: string
          id: string
          notes: string | null
          pet_id: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          pet_id: string
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          pet_id?: string
          user_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "weight_logs_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weight_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_partner_access_pet: {
        Args: { p_pet_id: string; p_provider_id: string }
        Returns: boolean
      }
      check_booking_availability: {
        Args: { p_date: string; p_provider_id: string; p_service_id: string }
        Returns: boolean
      }
      get_my_family_id: { Args: never; Returns: string }
      get_my_pet_ids: { Args: never; Returns: string[] }
      get_user_provider_id: { Args: never; Returns: string }
      is_connected_to_pet: {
        Args: { p_pet_id: string; p_provider_id: string }
        Returns: boolean
      }
      is_family_member: { Args: { check_family_id: string }; Returns: boolean }
      is_partner_user: { Args: never; Returns: boolean }
    }
    Enums: {
      allergy_severity: "mild" | "moderate" | "severe"
      booking_status:
        | "pending"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "cancelled_by_provider"
        | "cancelled_by_customer"
        | "no_show"
      bowel_condition: "good" | "loose" | "hard"
      bowel_type: "urine" | "feces" | "both"
      care_mood: "happy" | "good" | "normal" | "tired" | "sick"
      connection_status: "pending" | "active" | "paused" | "ended"
      distance_unit: "km" | "m"
      event_type:
        | "health"
        | "grooming"
        | "training"
        | "hotel"
        | "hospital"
        | "other"
        | "walk"
        | "care_note"
      expense_category:
        | "food"
        | "medical"
        | "grooming"
        | "supplies"
        | "training"
        | "hotel"
        | "other"
      family_role: "owner" | "admin" | "member"
      food_type: "dry" | "wet" | "cooked" | "treat" | "other"
      meal_type: "breakfast" | "lunch" | "dinner" | "snack"
      pet_gender: "male" | "female"
      satisfaction_level: "good" | "normal" | "bad"
      service_type: "hotel" | "training" | "grooming" | "hospital"
      user_role: "family" | "provider"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      allergy_severity: ["mild", "moderate", "severe"],
      booking_status: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "cancelled_by_provider",
        "cancelled_by_customer",
        "no_show",
      ],
      bowel_condition: ["good", "loose", "hard"],
      bowel_type: ["urine", "feces", "both"],
      care_mood: ["happy", "good", "normal", "tired", "sick"],
      connection_status: ["pending", "active", "paused", "ended"],
      distance_unit: ["km", "m"],
      event_type: [
        "health",
        "grooming",
        "training",
        "hotel",
        "hospital",
        "other",
        "walk",
        "care_note",
      ],
      expense_category: [
        "food",
        "medical",
        "grooming",
        "supplies",
        "training",
        "hotel",
        "other",
      ],
      family_role: ["owner", "admin", "member"],
      food_type: ["dry", "wet", "cooked", "treat", "other"],
      meal_type: ["breakfast", "lunch", "dinner", "snack"],
      pet_gender: ["male", "female"],
      satisfaction_level: ["good", "normal", "bad"],
      service_type: ["hotel", "training", "grooming", "hospital"],
      user_role: ["family", "provider"],
    },
  },
} as const
