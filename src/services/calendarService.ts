import { supabase } from '../lib/supabase';
import type { Tables, Insertable, Updatable } from '../types/database';

export type CalendarEvent = Tables<'calendar_events'>;

// Extended type with pet info
export interface CalendarEventWithPet extends CalendarEvent {
  pet?: {
    id: string;
    name: string;
    color: string;
  };
}

// ============================================
// Calendar Events CRUD
// ============================================

/**
 * Get all events for a family
 */
export const getEventsByFamily = async (
  familyId: string,
  options?: { startDate?: string; endDate?: string }
): Promise<CalendarEventWithPet[]> => {
  let query = supabase
    .from('calendar_events')
    .select(`
      *,
      pet:pets(id, name, color)
    `)
    .eq('family_id', familyId)
    .order('start_time', { ascending: true });

  if (options?.startDate) {
    query = query.gte('start_time', options.startDate);
  }
  if (options?.endDate) {
    query = query.lte('end_time', options.endDate);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as CalendarEventWithPet[];
};

/**
 * Get events for a specific pet
 */
export const getEventsByPet = async (
  petId: string,
  options?: { startDate?: string; endDate?: string }
): Promise<CalendarEvent[]> => {
  let query = supabase
    .from('calendar_events')
    .select('*')
    .eq('pet_id', petId)
    .order('start_time', { ascending: true });

  if (options?.startDate) {
    query = query.gte('start_time', options.startDate);
  }
  if (options?.endDate) {
    query = query.lte('end_time', options.endDate);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

/**
 * Get events for a specific month
 */
export const getEventsByMonth = async (
  familyId: string,
  year: number,
  month: number
): Promise<CalendarEventWithPet[]> => {
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

  return getEventsByFamily(familyId, { startDate, endDate });
};

/**
 * Get a single event by ID
 */
export const getEventById = async (
  eventId: string
): Promise<CalendarEventWithPet | null> => {
  const { data, error } = await supabase
    .from('calendar_events')
    .select(`
      *,
      pet:pets(id, name, color)
    `)
    .eq('id', eventId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data as CalendarEventWithPet;
};

/**
 * Create a new event
 */
export const createEvent = async (
  event: Omit<Insertable<'calendar_events'>, 'id' | 'created_at' | 'updated_at'>
): Promise<CalendarEvent> => {
  const { data, error } = await supabase
    .from('calendar_events')
    .insert(event)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update an event
 */
export const updateEvent = async (
  eventId: string,
  updates: Updatable<'calendar_events'>
): Promise<CalendarEvent> => {
  const { data, error } = await supabase
    .from('calendar_events')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', eventId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete an event
 */
export const deleteEvent = async (eventId: string): Promise<void> => {
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', eventId);

  if (error) throw error;
};

// ============================================
// Upcoming Events
// ============================================

/**
 * Get upcoming events (next N days)
 */
export const getUpcomingEvents = async (
  familyId: string,
  daysAhead: number = 7
): Promise<CalendarEventWithPet[]> => {
  const now = new Date().toISOString();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  const { data, error } = await supabase
    .from('calendar_events')
    .select(`
      *,
      pet:pets(id, name, color)
    `)
    .eq('family_id', familyId)
    .gte('start_time', now)
    .lte('start_time', futureDate.toISOString())
    .order('start_time', { ascending: true });

  if (error) throw error;
  return data as CalendarEventWithPet[];
};

/**
 * Get today's events
 */
export const getTodayEvents = async (
  familyId: string
): Promise<CalendarEventWithPet[]> => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  return getEventsByFamily(familyId, {
    startDate: startOfDay,
    endDate: endOfDay,
  });
};

// ============================================
// Event Statistics
// ============================================

/**
 * Get event count by type for a month
 */
export const getEventCountByType = async (
  familyId: string,
  year: number,
  month: number
): Promise<Record<string, number>> => {
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

  const { data, error } = await supabase
    .from('calendar_events')
    .select('event_type')
    .eq('family_id', familyId)
    .gte('start_time', startDate)
    .lte('end_time', endDate);

  if (error) throw error;

  return (data || []).reduce((acc, event) => {
    acc[event.event_type] = (acc[event.event_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

/**
 * Get dates with events for a month (for calendar dots)
 */
export const getDatesWithEvents = async (
  familyId: string,
  year: number,
  month: number,
  petId?: string
): Promise<string[]> => {
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

  let query = supabase
    .from('calendar_events')
    .select('start_time')
    .eq('family_id', familyId)
    .gte('start_time', startDate)
    .lte('end_time', endDate);

  if (petId) {
    query = query.eq('pet_id', petId);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Extract unique dates
  const dates = new Set<string>();
  (data || []).forEach(event => {
    const date = event.start_time.split('T')[0];
    dates.add(date);
  });

  return Array.from(dates);
};
