import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { Database } from "../types/database";
import type {
  Provider,
  ProviderFormData,
  ProviderConnection,
  ProviderInvite,
  CareNote,
  CareNoteFormData,
  CareNoteComment,
  CareNoteCommentFormData,
  ConnectedPet,
  MyProvider,
  ServiceType,
  Announcement,
  AnnouncementFormData,
} from "../types/provider";

// ============================================
// Type Aliases (CORRECTED for actual schema)
// ============================================
type ServiceProviderInsert =
  Database["public"]["Tables"]["service_providers"]["Insert"];
type ServiceProviderUpdate =
  Database["public"]["Tables"]["service_providers"]["Update"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
type ProviderConnectionInsert =
  Database["public"]["Tables"]["provider_connections"]["Insert"];
type ProviderConnectionUpdate =
  Database["public"]["Tables"]["provider_connections"]["Update"];
type ProviderInviteInsert =
  Database["public"]["Tables"]["provider_invites"]["Insert"];
type ProviderInviteUpdate =
  Database["public"]["Tables"]["provider_invites"]["Update"];
type CareNoteInsert = Database["public"]["Tables"]["care_notes"]["Insert"];
type CareNoteUpdate = Database["public"]["Tables"]["care_notes"]["Update"];
type CareNoteCommentInsert =
  Database["public"]["Tables"]["care_note_comments"]["Insert"];
type AnnouncementInsert =
  Database["public"]["Tables"]["announcements"]["Insert"];
type AnnouncementUpdate =
  Database["public"]["Tables"]["announcements"]["Update"];

// ============================================
// Provider Store Interface
// ============================================
interface ProviderState {
  myProvider: Provider | null;
  isProviderOwner: boolean;
  connectedPets: ConnectedPet[];
  myProviders: MyProvider[];
  careNotes: CareNote[];
  careNoteComments: CareNoteComment[];
  announcements: Announcement[];
  invites: ProviderInvite[];
  isLoading: boolean;
  error: string | null;

  registerProvider: (data: ProviderFormData) => Promise<Provider | null>;
  updateProvider: (
    id: string,
    data: Partial<ProviderFormData>,
  ) => Promise<boolean>;
  fetchMyProvider: () => Promise<void>;

  createInviteCode: (expiresInDays?: number) => Promise<ProviderInvite | null>;
  acceptInviteCode: (code: string, petIds: string[]) => Promise<boolean>;
  disconnectPet: (connectionId: string) => Promise<boolean>;
  fetchConnectedPets: () => Promise<void>;
  fetchMyProviders: (familyId: string) => Promise<void>;

  fetchCareNotes: (options: {
    petId?: string;
    providerId?: string;
    familyId?: string;
    date?: string;
  }) => Promise<void>;
  createCareNote: (data: CareNoteFormData) => Promise<CareNote | null>;
  updateCareNote: (
    id: string,
    data: Partial<CareNoteFormData>,
  ) => Promise<boolean>;
  deleteCareNote: (id: string) => Promise<boolean>;

  fetchCareNoteComments: (careNoteId: string) => Promise<void>;
  addCareNoteComment: (
    data: CareNoteCommentFormData,
  ) => Promise<CareNoteComment | null>;
  deleteCareNoteComment: (commentId: string) => Promise<boolean>;

  fetchAnnouncements: (providerId?: string) => Promise<void>;
  createAnnouncement: (
    data: AnnouncementFormData,
  ) => Promise<Announcement | null>;
  deleteAnnouncement: (announcementId: string) => Promise<boolean>;
  markAnnouncementRead: (announcementId: string) => Promise<void>;

  clearProviderData: () => void;
}

// ============================================
// Store Implementation
// ============================================
export const useProviderStore = create<ProviderState>((set, get) => ({
  myProvider: null,
  isProviderOwner: false,
  connectedPets: [],
  myProviders: [],
  careNotes: [],
  careNoteComments: [],
  announcements: [],
  invites: [],
  isLoading: false,
  error: null,

  // ============================================
  // Provider Registration (FIXED)
  // ============================================
  registerProvider: async (data) => {
    set({ isLoading: true, error: null });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // CORRECTED: Use actual schema field names
      const providerInsert: ServiceProviderInsert = {
        owner_id: user.id,
        business_name: data.name, // ✅ business_name (DB 컬럼) = data.name (폼 필드)
        service_type: data.serviceType, // ✅ service_type (DB 컬럼)
        description: data.description || null,
        address: data.address,
        phone: data.phone,
        business_hours: data.businessHours || null, // ✅ FIXED: data.ek → data.businessHours
        latitude: data.latitude || null,
        longitude: data.longitude || null,
      };

      const { data: provider, error: providerError } = await supabase
        .from("service_providers")
        .insert(providerInsert)
        .select()
        .single();

      if (providerError) throw providerError;

      // Update user's profile with provider_id
      const profileUpdate: ProfileUpdate = { provider_id: provider.id };

      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", user.id);

      if (profileError) throw profileError;

      const newProvider: Provider = {
        id: provider.id,
        ownerId: provider.owner_id,
        name: provider.business_name, // ✅ Map business_name to name
        serviceType: provider.service_type, // ✅ Map service_type to serviceType
        description: provider.description,
        address: provider.address,
        phone: provider.phone,
        businessHours: provider.business_hours, // ✅ business_hours
        latitude: provider.latitude,
        longitude: provider.longitude,
        rating: provider.rating,
        reviewCount: provider.review_count,
        createdAt: provider.created_at,
        updatedAt: provider.updated_at,
      };

      set({ myProvider: newProvider, isProviderOwner: true, isLoading: false });
      return newProvider;
    } catch (error: any) {
      console.error("Register provider error:", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  // ============================================
  // Update Provider (FIXED)
  // ============================================
  updateProvider: async (id, data) => {
    try {
      const providerUpdate: ServiceProviderUpdate = {};

      if (data.name !== undefined) providerUpdate.business_name = data.name; // ✅
      if (data.serviceType !== undefined)
        providerUpdate.service_type = data.serviceType; // ✅
      if (data.description !== undefined)
        providerUpdate.description = data.description || null;
      if (data.address !== undefined) providerUpdate.address = data.address;
      if (data.phone !== undefined) providerUpdate.phone = data.phone;
      if (data.businessHours !== undefined)
        providerUpdate.business_hours = data.businessHours || null; // ✅
      if (data.latitude !== undefined)
        providerUpdate.latitude = data.latitude || null;
      if (data.longitude !== undefined)
        providerUpdate.longitude = data.longitude || null;

      const { error } = await supabase
        .from("service_providers")
        .update(providerUpdate)
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        myProvider: state.myProvider ? { ...state.myProvider, ...data } : null,
      }));

      return true;
    } catch (error) {
      console.error("Update provider error:", error);
      return false;
    }
  },

  // ============================================
  // Fetch My Provider (FIXED)
  // ============================================
  fetchMyProvider: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("provider_id")
        .eq("id", user.id)
        .single();

      if (!profile?.provider_id) {
        set({ myProvider: null, isProviderOwner: false });
        return;
      }

      const { data: provider, error } = await supabase
        .from("service_providers")
        .select("*")
        .eq("id", profile.provider_id)
        .single();

      if (error) throw error;

      const myProvider: Provider = {
        id: provider.id,
        ownerId: provider.owner_id,
        name: provider.business_name, // ✅
        serviceType: provider.service_type, // ✅
        description: provider.description,
        address: provider.address,
        phone: provider.phone,
        businessHours: provider.business_hours, // ✅
        latitude: provider.latitude,
        longitude: provider.longitude,
        rating: provider.rating,
        reviewCount: provider.review_count,
        createdAt: provider.created_at,
        updatedAt: provider.updated_at,
      };

      set({ myProvider, isProviderOwner: true });
    } catch (error) {
      console.error("Fetch my provider error:", error);
      set({ myProvider: null, isProviderOwner: false });
    }
  },

  // ============================================
  // Create Invite Code (FIXED)
  // ============================================
  createInviteCode: async (expiresInDays = 30) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { myProvider } = get();
      if (!myProvider) return null;

      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      const inviteInsert: ProviderInviteInsert = {
        provider_id: myProvider.id,
        code,
        max_uses: 10,
        use_count: 0,
        expires_at: expiresAt.toISOString(),
        created_by: user.id,
      };

      const { data: invite, error } = await supabase
        .from("provider_invites")
        .insert(inviteInsert)
        .select()
        .single();

      if (error) throw error;

      const newInvite: ProviderInvite = {
        id: invite.id,
        providerId: invite.provider_id,
        code: invite.code,
        maxUses: invite.max_uses,
        useCount: invite.use_count,
        expiresAt: invite.expires_at,
        createdBy: invite.created_by,
        createdAt: invite.created_at,
      };

      set((state) => ({ invites: [...state.invites, newInvite] }));
      return newInvite;
    } catch (error) {
      console.error("Create invite code error:", error);
      return null;
    }
  },

  // ============================================
  // Accept Invite Code (FIXED)
  // ============================================
  acceptInviteCode: async (code, petIds) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: profile } = await supabase
        .from("profiles")
        .select("family_id")
        .eq("id", user.id)
        .single();

      if (!profile?.family_id) return false;

      const { data: invite, error: inviteError } = await supabase
        .from("provider_invites")
        .select("*, service_providers(*)")
        .eq("code", code.toUpperCase())
        .single();

      if (inviteError || !invite) return false;

      if (invite.use_count >= invite.max_uses) return false;
      if (invite.expires_at && new Date(invite.expires_at) < new Date())
        return false;

      const connections: ProviderConnectionInsert[] = petIds.map((petId) => ({
        provider_id: invite.provider_id,
        family_id: profile.family_id!,
        pet_id: petId,
        status: "active",
        connection_type: "invite",
        invite_code: code,
        created_by: user.id,
        connected_at: new Date().toISOString(),
      }));

      const { error: connectionError } = await supabase
        .from("provider_connections")
        .insert(connections);

      if (connectionError) throw connectionError;

      const inviteUpdate: ProviderInviteUpdate = {
        use_count: invite.use_count + 1,
      };

      await supabase
        .from("provider_invites")
        .update(inviteUpdate)
        .eq("id", invite.id);

      return true;
    } catch (error) {
      console.error("Accept invite code error:", error);
      return false;
    }
  },

  // ============================================
  // Disconnect Pet (FIXED)
  // ============================================
  disconnectPet: async (connectionId) => {
    try {
      const connectionUpdate: ProviderConnectionUpdate = { status: "inactive" };

      const { error } = await supabase
        .from("provider_connections")
        .update(connectionUpdate)
        .eq("id", connectionId);

      if (error) throw error;

      set((state) => ({
        connectedPets: state.connectedPets.filter(
          (pet) => pet.connectionId !== connectionId,
        ),
      }));

      return true;
    } catch (error) {
      console.error("Disconnect pet error:", error);
      return false;
    }
  },

  // ============================================
  // Fetch Connected Pets (FIXED)
  // ============================================
  fetchConnectedPets: async () => {
    try {
      const { myProvider } = get();
      if (!myProvider) return;

      const { data, error } = await supabase
        .from("provider_connections")
        .select(
          `
          *,
          pets (id, name, species, breed, profile_image),
          families (id, name)
        `,
        )
        .eq("provider_id", myProvider.id)
        .eq("status", "active");

      if (error) throw error;

      const connectedPets: ConnectedPet[] = (data || []).map((conn: any) => ({
        connectionId: conn.id,
        petId: conn.pet_id,
        petName: conn.pets?.name || "",
        petSpecies: conn.pets?.species || "",
        petBreed: conn.pets?.breed || "",
        petImage: conn.pets?.profile_image,
        familyId: conn.family_id,
        familyName: conn.families?.name || "",
        permissions: conn.permissions,
        connectedAt: conn.connected_at,
      }));

      set({ connectedPets });
    } catch (error) {
      console.error("Fetch connected pets error:", error);
    }
  },

  // ============================================
  // Fetch My Providers (FIXED)
  // ============================================
  fetchMyProviders: async (familyId) => {
    try {
      const { data, error } = await supabase
        .from("provider_connections")
        .select(
          `
          *,
          service_providers (
            id, 
            business_name, 
            service_type, 
            address, 
            phone, 
            rating, 
            review_count
          ),
          pets (id, name)
        `,
        )
        .eq("family_id", familyId)
        .eq("status", "active");

      if (error) throw error;

      const providersMap = new Map<string, MyProvider>();

      (data || []).forEach((conn: any) => {
        const providerId = conn.provider_id;

        if (!providersMap.has(providerId)) {
          providersMap.set(providerId, {
            id: conn.service_providers.id,
            name: conn.service_providers.business_name, // ✅
            serviceType: conn.service_providers.service_type, // ✅
            address: conn.service_providers.address,
            phone: conn.service_providers.phone,
            rating: conn.service_providers.rating,
            reviewCount: conn.service_providers.review_count,
            connectedPets: [],
            connectionId: conn.id,
            connectedAt: conn.connected_at,
          });
        }

        const provider = providersMap.get(providerId)!;
        provider.connectedPets.push({
          id: conn.pets.id,
          name: conn.pets.name,
        });
      });

      set({ myProviders: Array.from(providersMap.values()) });
    } catch (error) {
      console.error("Fetch my providers error:", error);
    }
  },

  // ============================================
  // Care Notes (FIXED)
  // ============================================
  fetchCareNotes: async (options) => {
    try {
      let query = supabase
        .from("care_notes")
        .select(
          `
          *,
          pets (id, name, profile_image),
          service_providers (id, business_name),
          profiles (id, name)
        `,
        )
        .order("date", { ascending: false });

      if (options.petId) query = query.eq("pet_id", options.petId);
      if (options.providerId)
        query = query.eq("provider_id", options.providerId);
      if (options.date) query = query.eq("date", options.date);

      const { data, error } = await query;
      if (error) throw error;

      const careNotes: CareNote[] = (data || []).map((note: any) => ({
        id: note.id,
        providerId: note.provider_id,
        providerName: note.service_providers?.business_name || "", // ✅
        petId: note.pet_id,
        petName: note.pets?.name || "",
        petImage: note.pets?.profile_image,
        date: note.date,
        bookingId: note.booking_id,
        mood: note.mood,
        activities: note.activities,
        meals: note.meals,
        bowelLogs: note.bowel_logs,
        photos: note.photos || [],
        specialNotes: note.special_notes,
        commentCount: note.comment_count,
        createdBy: note.created_by,
        createdByName: note.profiles?.name || "",
        createdAt: note.created_at,
        updatedAt: note.updated_at,
      }));

      set({ careNotes });
    } catch (error) {
      console.error("Fetch care notes error:", error);
    }
  },

  createCareNote: async (data) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { myProvider } = get();
      if (!myProvider) return null;

      const careNoteInsert: CareNoteInsert = {
        provider_id: myProvider.id,
        pet_id: data.petId,
        date: data.date,
        booking_id: data.bookingId || null,
        mood: data.mood,
        activities: data.activities || null,
        meals: data.meals || null,
        bowel_logs: data.bowelLogs || null,
        photos: data.photos || [],
        special_notes: data.specialNotes || null,
        created_by: user.id,
      };

      const { data: note, error } = await supabase
        .from("care_notes")
        .insert(careNoteInsert)
        .select(
          `
          *,
          pets (id, name, profile_image),
          service_providers (id, business_name),
          profiles (id, name)
        `,
        )
        .single();

      if (error) throw error;

      const newNote: CareNote = {
        id: note.id,
        providerId: note.provider_id,
        providerName: note.service_providers?.business_name || "", // ✅
        petId: note.pet_id,
        petName: note.pets?.name || "",
        petImage: note.pets?.profile_image,
        date: note.date,
        bookingId: note.booking_id,
        mood: note.mood,
        activities: note.activities,
        meals: note.meals,
        bowelLogs: note.bowel_logs,
        photos: note.photos || [],
        specialNotes: note.special_notes,
        commentCount: note.comment_count,
        createdBy: note.created_by,
        createdByName: note.profiles?.name || "",
        createdAt: note.created_at,
        updatedAt: note.updated_at,
      };

      set((state) => ({ careNotes: [newNote, ...state.careNotes] }));
      return newNote;
    } catch (error) {
      console.error("Create care note error:", error);
      return null;
    }
  },

  updateCareNote: async (id, data) => {
    try {
      const careNoteUpdate: CareNoteUpdate = {};

      if (data.mood !== undefined) careNoteUpdate.mood = data.mood;
      if (data.activities !== undefined)
        careNoteUpdate.activities = data.activities || null;
      if (data.meals !== undefined) careNoteUpdate.meals = data.meals || null;
      if (data.bowelLogs !== undefined)
        careNoteUpdate.bowel_logs = data.bowelLogs || null;
      if (data.photos !== undefined) careNoteUpdate.photos = data.photos || [];
      if (data.specialNotes !== undefined)
        careNoteUpdate.special_notes = data.specialNotes || null;

      const { error } = await supabase
        .from("care_notes")
        .update(careNoteUpdate)
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        careNotes: state.careNotes.map((note) =>
          note.id === id ? { ...note, ...data } : note,
        ),
      }));

      return true;
    } catch (error) {
      console.error("Update care note error:", error);
      return false;
    }
  },

  deleteCareNote: async (id) => {
    try {
      const { error } = await supabase.from("care_notes").delete().eq("id", id);

      if (error) throw error;

      set((state) => ({
        careNotes: state.careNotes.filter((note) => note.id !== id),
      }));

      return true;
    } catch (error) {
      console.error("Delete care note error:", error);
      return false;
    }
  },

  // ============================================
  // Care Note Comments (FIXED)
  // ============================================
  fetchCareNoteComments: async (careNoteId) => {
    try {
      const { data, error } = await supabase
        .from("care_note_comments")
        .select(
          `
          *,
          profiles (id, name, avatar_url)
        `,
        )
        .eq("care_note_id", careNoteId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const comments: CareNoteComment[] = (data || []).map((c: any) => ({
        id: c.id,
        careNoteId: c.care_note_id,
        authorId: c.author_id,
        authorName: c.profiles?.name || "",
        authorAvatar: c.profiles?.avatar_url,
        authorType: c.author_type,
        comment: c.comment,
        createdAt: c.created_at,
      }));

      set({ careNoteComments: comments });
    } catch (error) {
      console.error("Fetch care note comments error:", error);
    }
  },

  addCareNoteComment: async (data) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const commentInsert: CareNoteCommentInsert = {
        care_note_id: data.careNoteId,
        author_id: user.id,
        author_type: data.authorType,
        comment: data.comment,
      };

      const { data: comment, error } = await supabase
        .from("care_note_comments")
        .insert(commentInsert)
        .select(
          `
          *,
          profiles (id, name, avatar_url)
        `,
        )
        .single();

      if (error) throw error;

      const newComment: CareNoteComment = {
        id: comment.id,
        careNoteId: comment.care_note_id,
        authorId: comment.author_id,
        authorName: comment.profiles?.name || "",
        authorAvatar: comment.profiles?.avatar_url,
        authorType: comment.author_type,
        comment: comment.comment,
        createdAt: comment.created_at,
      };

      set((state) => ({
        careNoteComments: [...state.careNoteComments, newComment],
      }));

      return newComment;
    } catch (error) {
      console.error("Add care note comment error:", error);
      return null;
    }
  },

  deleteCareNoteComment: async (commentId) => {
    try {
      const { error } = await supabase
        .from("care_note_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      set((state) => ({
        careNoteComments: state.careNoteComments.filter(
          (c) => c.id !== commentId,
        ),
      }));

      return true;
    } catch (error) {
      console.error("Delete care note comment error:", error);
      return false;
    }
  },

  // ============================================
  // Announcements (FIXED)
  // ============================================
  fetchAnnouncements: async (providerId) => {
    try {
      let query = supabase
        .from("announcements")
        .select(
          `
          *,
          service_providers (id, business_name),
          profiles (id, name)
        `,
        )
        .order("created_at", { ascending: false });

      if (providerId) query = query.eq("provider_id", providerId);

      const { data, error } = await query;
      if (error) throw error;

      const announcements: Announcement[] = (data || []).map((a: any) => ({
        id: a.id,
        providerId: a.provider_id,
        providerName: a.service_providers?.business_name || "", // ✅
        title: a.title,
        content: a.content,
        isPinned: a.is_pinned,
        createdBy: a.created_by,
        createdByName: a.profiles?.name || "",
        createdAt: a.created_at,
        updatedAt: a.updated_at,
      }));

      set({ announcements });
    } catch (error) {
      console.error("Fetch announcements error:", error);
    }
  },

  createAnnouncement: async (data) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { myProvider } = get();
      if (!myProvider) return null;

      const announcementInsert: AnnouncementInsert = {
        provider_id: myProvider.id,
        title: data.title,
        content: data.content,
        is_pinned: data.isPinned || false,
        created_by: user.id,
      };

      const { data: announcement, error } = await supabase
        .from("announcements")
        .insert(announcementInsert)
        .select(
          `
          *,
          service_providers (id, business_name),
          profiles (id, name)
        `,
        )
        .single();

      if (error) throw error;

      const newAnnouncement: Announcement = {
        id: announcement.id,
        providerId: announcement.provider_id,
        providerName: announcement.service_providers?.business_name || "", // ✅
        title: announcement.title,
        content: announcement.content,
        isPinned: announcement.is_pinned,
        createdBy: announcement.created_by,
        createdByName: announcement.profiles?.name || "",
        createdAt: announcement.created_at,
        updatedAt: announcement.updated_at,
      };

      set((state) => ({
        announcements: [newAnnouncement, ...state.announcements],
      }));
      return newAnnouncement;
    } catch (error) {
      console.error("Create announcement error:", error);
      return null;
    }
  },

  deleteAnnouncement: async (announcementId) => {
    try {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", announcementId);

      if (error) throw error;

      set((state) => ({
        announcements: state.announcements.filter(
          (a) => a.id !== announcementId,
        ),
      }));

      return true;
    } catch (error) {
      console.error("Delete announcement error:", error);
      return false;
    }
  },

  markAnnouncementRead: async (announcementId) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("announcement_reads").insert({
        announcement_id: announcementId,
        user_id: user.id,
      });
    } catch (error) {
      console.error("Mark announcement read error:", error);
    }
  },

  // ============================================
  // Clear
  // ============================================
  clearProviderData: () => {
    set({
      myProvider: null,
      isProviderOwner: false,
      connectedPets: [],
      myProviders: [],
      careNotes: [],
      careNoteComments: [],
      announcements: [],
      invites: [],
      isLoading: false,
      error: null,
    });
  },
}));
