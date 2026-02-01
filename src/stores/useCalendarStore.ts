import { create } from 'zustand';
import type { CalendarEvent } from '../types/calendar';
import type { Database } from '../types/database';
import { supabase } from '../lib/supabase';

// Type aliases for type-safe inserts/updates
type CalendarEventInsert = Database['public']['Tables']['calendar_events']['Insert'];
type CalendarEventUpdate = Database['public']['Tables']['calendar_events']['Update'];

// ============================================
// Walk Event Data (산책 자동 연동용)
// ============================================

// 케어노트 제목에서 기분 이모지 추출하는 헬퍼
function extractMoodFromTitle(title: string): string | undefined {
  const moodEmojis = ['😄', '😊', '😐', '😴', '🤒', '📝'];
  for (const emoji of moodEmojis) {
    if (title.includes(emoji)) return emoji;
  }
  return undefined;
}

export interface WalkEventData {
  petId: string;
  petName: string;
  startTime: Date;
  endTime: Date;
  distance: number;
  duration: number; // minutes
  walkLogId?: string;
}

interface CalendarState {
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  
  // Fetch from Supabase
  fetchEvents: (familyId: string, month?: string) => Promise<void>;
  
  // CRUD
  addEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<CalendarEvent | null>;
  addWalkEvent: (walkData: WalkEventData) => Promise<CalendarEvent | null>;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  
  // Getters
  getEventById: (id: string) => CalendarEvent | undefined;
  getEventsByPetId: (petId: string) => CalendarEvent[];
  getEventsByDate: (date: Date) => CalendarEvent[];
  
  // Clear
  clearEvents: () => void;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  // 초기 상태: 빈 배열 (더미 데이터 없음)
  events: [],
  isLoading: false,
  error: null,

  // ============================================
  // Fetch events from Supabase
  // ============================================
  fetchEvents: async (familyId: string, month?: string) => {
    if (!familyId) {
      set({ events: [], isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      let query = supabase
        .from('calendar_events')
        .select(`
          *,
          pets (id, name, color)
        `)
        .eq('family_id', familyId)
        .order('start_time', { ascending: true });

      // 월별 필터링
      if (month) {
        const startOfMonth = `${month}-01T00:00:00`;
        const endOfMonth = new Date(
          parseInt(month.split('-')[0]),
          parseInt(month.split('-')[1]),
          0,
          23, 59, 59
        ).toISOString();
        
        query = query
          .gte('start_time', startOfMonth)
          .lte('start_time', endOfMonth);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Fetch events error:', error);
        set({ error: error.message, isLoading: false });
        return;
      }

      const events: CalendarEvent[] = (data || []).map((event: any) => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        type: event.event_type,
        petId: event.pet_id,
        petName: event.pets?.name || '',
        description: event.description,
        location: event.location,
        serviceProvider: event.service_provider,
        relatedLogId: event.related_log_id,
        relatedLogType: event.related_log_type,
        // 케어노트 전용 필드
        careNoteMood: event.event_type === 'care_note' ? extractMoodFromTitle(event.title) : undefined,
        careNoteProviderName: event.event_type === 'care_note' ? event.service_provider : undefined,
      }));

      set({ events, isLoading: false });
    } catch (error) {
      console.error('Fetch events error:', error);
      set({ error: 'Failed to fetch events', isLoading: false });
    }
  },

  // ============================================
  // Add event
  // ============================================
  addEvent: async (eventData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('family_id')
      .eq('id', user.id)
      .single();

    if (!profile?.family_id) return null;

    try {
      const eventInsert: CalendarEventInsert = {
        family_id: profile.family_id,
        pet_id: eventData.petId,
        title: eventData.title,
        start_time: eventData.start.toISOString(),
        end_time: eventData.end.toISOString(),
        event_type: eventData.type,
        description: eventData.description || null,
        location: eventData.location || null,
        service_provider: eventData.serviceProvider || null,
        related_log_id: eventData.relatedLogId || null,
        related_log_type: eventData.relatedLogType || null,
        created_by: user.id,
      };

      const { data, error } = await supabase
        .from('calendar_events')
        .insert(eventInsert)
        .select(`
          *,
          pets (id, name, color)
        `)
        .single();

      if (error) {
        console.error('Add event error:', error);
        return null;
      }

      const newEvent: CalendarEvent = {
        id: data.id,
        title: data.title,
        start: new Date(data.start_time),
        end: new Date(data.end_time),
        type: data.event_type,
        petId: data.pet_id,
        petName: data.pets?.name || eventData.petName || '',
        description: data.description,
        location: data.location,
        serviceProvider: data.service_provider,
        relatedLogId: data.related_log_id,
        relatedLogType: data.related_log_type,
      };

      set((state) => ({ events: [...state.events, newEvent] }));
      return newEvent;
    } catch (error) {
      console.error('Add event error:', error);
      return null;
    }
  },

  // ============================================
  // Add Walk Event (산책 자동 연동)
  // ============================================
  addWalkEvent: async (walkData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('family_id')
      .eq('id', user.id)
      .single();

    if (!profile?.family_id) return null;

    // 거리 포맷팅
    const distanceStr = walkData.distance < 1 
      ? `${Math.round(walkData.distance * 1000)}m` 
      : `${walkData.distance.toFixed(2)}km`;

    // 시간 포맷팅
    const durationStr = walkData.duration >= 60 
      ? `${Math.floor(walkData.duration / 60)}시간 ${walkData.duration % 60}분`
      : `${walkData.duration}분`;

    try {
      const eventInsert: CalendarEventInsert = {
        family_id: profile.family_id,
        pet_id: walkData.petId,
        title: `산책 🐕 ${distanceStr}`,
        start_time: walkData.startTime.toISOString(),
        end_time: walkData.endTime.toISOString(),
        event_type: 'walk',
        description: `거리: ${distanceStr} | 시간: ${durationStr}`,
        related_log_id: walkData.walkLogId || null,
        related_log_type: 'walk',
        created_by: user.id,
      };

      const { data, error } = await supabase
        .from('calendar_events')
        .insert(eventInsert)
        .select(`
          *,
          pets (id, name, color)
        `)
        .single();

      if (error) {
        // event_type이 'walk'를 지원하지 않으면 'other'로 대체
        if (error.message.includes('event_type')) {
          console.warn('walk event_type not supported, using other');
          
          const fallbackInsert: CalendarEventInsert = {
            ...eventInsert,
            event_type: 'other',
            description: `[산책] 거리: ${distanceStr} | 시간: ${durationStr}`,
          };
          
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('calendar_events')
            .insert(fallbackInsert)
            .select(`
              *,
              pets (id, name, color)
            `)
            .single();

          if (fallbackError) {
            console.error('Add walk event fallback error:', fallbackError);
            return null;
          }

          const newEvent: CalendarEvent = {
            id: fallbackData.id,
            title: fallbackData.title,
            start: new Date(fallbackData.start_time),
            end: new Date(fallbackData.end_time),
            type: 'walk', // UI에서는 walk로 표시
            petId: fallbackData.pet_id,
            petName: fallbackData.pets?.name || walkData.petName,
            description: fallbackData.description,
            relatedLogId: fallbackData.related_log_id,
            relatedLogType: 'walk',
          };

          set((state) => ({ events: [...state.events, newEvent] }));
          return newEvent;
        }
        
        console.error('Add walk event error:', error);
        return null;
      }

      const newEvent: CalendarEvent = {
        id: data.id,
        title: data.title,
        start: new Date(data.start_time),
        end: new Date(data.end_time),
        type: data.event_type,
        petId: data.pet_id,
        petName: data.pets?.name || walkData.petName,
        description: data.description,
        relatedLogId: data.related_log_id,
        relatedLogType: 'walk',
      };

      set((state) => ({ events: [...state.events, newEvent] }));
      return newEvent;
    } catch (error) {
      console.error('Add walk event error:', error);
      return null;
    }
  },

  // ============================================
  // Update event
  // ============================================
  updateEvent: async (id, eventData) => {
    try {
      const eventUpdate: CalendarEventUpdate = {};
      
      if (eventData.title !== undefined) eventUpdate.title = eventData.title;
      if (eventData.start !== undefined) eventUpdate.start_time = eventData.start.toISOString();
      if (eventData.end !== undefined) eventUpdate.end_time = eventData.end.toISOString();
      if (eventData.type !== undefined) eventUpdate.event_type = eventData.type;
      if (eventData.description !== undefined) eventUpdate.description = eventData.description || null;
      if (eventData.location !== undefined) eventUpdate.location = eventData.location || null;
      if (eventData.serviceProvider !== undefined) eventUpdate.service_provider = eventData.serviceProvider || null;

      const { error } = await supabase
        .from('calendar_events')
        .update(eventUpdate)
        .eq('id', id);

      if (error) {
        console.error('Update event error:', error);
        return;
      }

      set((state) => ({
        events: state.events.map((event) =>
          event.id === id ? { ...event, ...eventData } : event
        ),
      }));
    } catch (error) {
      console.error('Update event error:', error);
    }
  },

  // ============================================
  // Delete event
  // ============================================
  deleteEvent: async (id) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete event error:', error);
        return;
      }

      set((state) => ({
        events: state.events.filter((event) => event.id !== id),
      }));
    } catch (error) {
      console.error('Delete event error:', error);
    }
  },

  // ============================================
  // Getters
  // ============================================
  getEventById: (id) => {
    return get().events.find((event) => event.id === id);
  },

  getEventsByPetId: (petId) => {
    return get().events.filter((event) => event.petId === petId);
  },

  getEventsByDate: (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return get().events.filter((event) => {
      const eventDateStr = event.start.toISOString().split('T')[0];
      return eventDateStr === dateStr;
    });
  },

  clearEvents: () => {
    set({ events: [], isLoading: false, error: null });
  },
}));
