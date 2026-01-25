import { create } from 'zustand';
import type {
  PartnerConnection,
  PartnerInvite,
  CareNote,
  CareNoteFormData,
  Notification,
} from '../types/partner';
import * as partnerService from '../services/partnerService';

// ============================================
// Partner Store Interface
// ============================================

interface PartnerState {
  // Partner Connections
  connections: PartnerConnection[];
  connectionsLoading: boolean;
  
  // Partner Invites
  invites: PartnerInvite[];
  invitesLoading: boolean;
  
  // Care Notes
  careNotes: CareNote[];
  careNotesLoading: boolean;
  selectedCareNote: CareNote | null;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  
  // Accessible Pets (for Provider)
  accessiblePets: any[];
  todayBookings: any[];
  
  // Actions - Connections
  fetchConnections: (familyId: string) => Promise<void>;
  fetchProviderConnections: (providerId: string) => Promise<void>;
  createInvite: (familyId: string, userId: string) => Promise<PartnerInvite>;
  acceptInvite: (code: string, providerId: string) => Promise<void>;
  disconnectPartner: (connectionId: string) => Promise<void>;
  updatePermissions: (connectionId: string, permissions: Partial<PartnerConnection['permissions']>) => Promise<void>;
  
  // Actions - Care Notes
  fetchCareNotes: (familyId: string, options?: { petId?: string; startDate?: string; endDate?: string }) => Promise<void>;
  fetchProviderCareNotes: (providerId: string, date?: string) => Promise<void>;
  createCareNote: (
    bookingId: string,
    petId: string,
    providerId: string,
    familyId: string,
    date: string,
    formData: CareNoteFormData,
    createdBy: string
  ) => Promise<CareNote>;
  updateCareNote: (careNoteId: string, formData: Partial<CareNoteFormData>, providerId: string) => Promise<void>;
  deleteCareNote: (careNoteId: string) => Promise<void>;
  setSelectedCareNote: (careNote: CareNote | null) => void;
  
  // Actions - Notifications
  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  
  // Actions - Provider Specific
  fetchAccessiblePets: (providerId: string) => Promise<void>;
  fetchTodayBookings: (providerId: string) => Promise<void>;
}

// ============================================
// Partner Store Implementation
// ============================================

export const usePartnerStore = create<PartnerState>((set, get) => ({
  // Initial State
  connections: [],
  connectionsLoading: false,
  invites: [],
  invitesLoading: false,
  careNotes: [],
  careNotesLoading: false,
  selectedCareNote: null,
  notifications: [],
  unreadCount: 0,
  accessiblePets: [],
  todayBookings: [],

  // ============================================
  // Connection Actions
  // ============================================

  fetchConnections: async (familyId: string) => {
    set({ connectionsLoading: true });
    try {
      const connections = await partnerService.getPartnerConnections(familyId);
      set({ connections, connectionsLoading: false });
    } catch (error) {
      console.error('Error fetching connections:', error);
      set({ connectionsLoading: false });
    }
  },

  fetchProviderConnections: async (providerId: string) => {
    set({ connectionsLoading: true });
    try {
      const connections = await partnerService.getProviderConnections(providerId);
      set({ connections, connectionsLoading: false });
    } catch (error) {
      console.error('Error fetching provider connections:', error);
      set({ connectionsLoading: false });
    }
  },

  createInvite: async (familyId: string, userId: string) => {
    set({ invitesLoading: true });
    try {
      const invite = await partnerService.createPartnerInvite(familyId, userId);
      set((state) => ({
        invites: [invite, ...state.invites],
        invitesLoading: false,
      }));
      return invite;
    } catch (error) {
      console.error('Error creating invite:', error);
      set({ invitesLoading: false });
      throw error;
    }
  },

  acceptInvite: async (code: string, providerId: string) => {
    try {
      const connection = await partnerService.acceptPartnerInvite(code, providerId);
      set((state) => ({
        connections: [connection, ...state.connections],
      }));
    } catch (error) {
      console.error('Error accepting invite:', error);
      throw error;
    }
  },

  disconnectPartner: async (connectionId: string) => {
    try {
      await partnerService.disconnectPartner(connectionId);
      set((state) => ({
        connections: state.connections.filter((c) => c.id !== connectionId),
      }));
    } catch (error) {
      console.error('Error disconnecting partner:', error);
      throw error;
    }
  },

  updatePermissions: async (connectionId: string, permissions: Partial<PartnerConnection['permissions']>) => {
    try {
      await partnerService.updatePartnerPermissions(connectionId, permissions);
      set((state) => ({
        connections: state.connections.map((c) =>
          c.id === connectionId
            ? { ...c, permissions: { ...c.permissions, ...permissions } }
            : c
        ),
      }));
    } catch (error) {
      console.error('Error updating permissions:', error);
      throw error;
    }
  },

  // ============================================
  // Care Note Actions
  // ============================================

  fetchCareNotes: async (familyId: string, options) => {
    set({ careNotesLoading: true });
    try {
      const careNotes = await partnerService.getCareNotesByFamily(familyId, options);
      set({ careNotes, careNotesLoading: false });
    } catch (error) {
      console.error('Error fetching care notes:', error);
      set({ careNotesLoading: false });
    }
  },

  fetchProviderCareNotes: async (providerId: string, date?: string) => {
    set({ careNotesLoading: true });
    try {
      const careNotes = await partnerService.getCareNotesByProvider(providerId, { date });
      set({ careNotes, careNotesLoading: false });
    } catch (error) {
      console.error('Error fetching provider care notes:', error);
      set({ careNotesLoading: false });
    }
  },

  createCareNote: async (bookingId, petId, providerId, familyId, date, formData, createdBy) => {
    try {
      const careNote = await partnerService.createCareNote(
        bookingId,
        petId,
        providerId,
        familyId,
        date,
        formData,
        createdBy
      );
      set((state) => ({
        careNotes: [careNote, ...state.careNotes],
        todayBookings: state.todayBookings.map((b) =>
          b.id === bookingId ? { ...b, hasTodayCareNote: true } : b
        ),
      }));
      return careNote;
    } catch (error) {
      console.error('Error creating care note:', error);
      throw error;
    }
  },

  updateCareNote: async (careNoteId, formData, providerId) => {
    try {
      const updated = await partnerService.updateCareNote(careNoteId, formData, providerId);
      set((state) => ({
        careNotes: state.careNotes.map((cn) =>
          cn.id === careNoteId ? updated : cn
        ),
        selectedCareNote: state.selectedCareNote?.id === careNoteId ? updated : state.selectedCareNote,
      }));
    } catch (error) {
      console.error('Error updating care note:', error);
      throw error;
    }
  },

  deleteCareNote: async (careNoteId) => {
    try {
      await partnerService.deleteCareNote(careNoteId);
      set((state) => ({
        careNotes: state.careNotes.filter((cn) => cn.id !== careNoteId),
        selectedCareNote: state.selectedCareNote?.id === careNoteId ? null : state.selectedCareNote,
      }));
    } catch (error) {
      console.error('Error deleting care note:', error);
      throw error;
    }
  },

  setSelectedCareNote: (careNote) => {
    set({ selectedCareNote: careNote });
  },

  // ============================================
  // Notification Actions
  // ============================================

  fetchNotifications: async (userId: string) => {
    try {
      const notifications = await partnerService.getNotifications(userId);
      const unreadCount = notifications.filter((n) => !n.readAt).length;
      set({ notifications, unreadCount });
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      await partnerService.markNotificationAsRead(notificationId);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, readAt: new Date().toISOString() } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  // ============================================
  // Provider Specific Actions
  // ============================================

  fetchAccessiblePets: async (providerId: string) => {
    try {
      const accessiblePets = await partnerService.getAccessiblePets(providerId);
      set({ accessiblePets });
    } catch (error) {
      console.error('Error fetching accessible pets:', error);
    }
  },

  fetchTodayBookings: async (providerId: string) => {
    try {
      const todayBookings = await partnerService.getTodayBookingsForCareNote(providerId);
      set({ todayBookings });
    } catch (error) {
      console.error('Error fetching today bookings:', error);
    }
  },
}));
