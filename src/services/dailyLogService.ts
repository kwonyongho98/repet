import { supabase } from '../lib/supabase';
import type { Tables, Insertable, Updatable } from '../types/database';

// Type exports
export type WalkLog = Tables<'walk_logs'>;
export type MealLog = Tables<'meal_logs'>;
export type BowelLog = Tables<'bowel_logs'>;
export type WeightLog = Tables<'weight_logs'>;
export type ExpenseLog = Tables<'expense_logs'>;

export interface DailyLogSummary {
  date: string;
  walks: WalkLog[];
  meals: MealLog[];
  bowels: BowelLog[];
  weights: WeightLog[];
  expenses: ExpenseLog[];
}

// ============================================
// Walk Logs
// ============================================

export const getWalkLogs = async (
  petId: string,
  options?: { startDate?: string; endDate?: string; limit?: number }
): Promise<WalkLog[]> => {
  let query = supabase
    .from('walk_logs')
    .select('*')
    .eq('pet_id', petId)
    .order('date', { ascending: false })
    .order('start_time', { ascending: false });

  if (options?.startDate) {
    query = query.gte('date', options.startDate);
  }
  if (options?.endDate) {
    query = query.lte('date', options.endDate);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

export const createWalkLog = async (
  log: Omit<Insertable<'walk_logs'>, 'id' | 'created_at'>
): Promise<WalkLog> => {
  const { data, error } = await supabase
    .from('walk_logs')
    .insert(log)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateWalkLog = async (
  id: string,
  updates: Updatable<'walk_logs'>
): Promise<WalkLog> => {
  const { data, error } = await supabase
    .from('walk_logs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteWalkLog = async (id: string): Promise<void> => {
  const { error } = await supabase.from('walk_logs').delete().eq('id', id);
  if (error) throw error;
};

// ============================================
// Meal Logs
// ============================================

export const getMealLogs = async (
  petId: string,
  options?: { startDate?: string; endDate?: string; limit?: number }
): Promise<MealLog[]> => {
  let query = supabase
    .from('meal_logs')
    .select('*')
    .eq('pet_id', petId)
    .order('date', { ascending: false })
    .order('time', { ascending: false });

  if (options?.startDate) {
    query = query.gte('date', options.startDate);
  }
  if (options?.endDate) {
    query = query.lte('date', options.endDate);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

export const createMealLog = async (
  log: Omit<Insertable<'meal_logs'>, 'id' | 'created_at'>
): Promise<MealLog> => {
  const { data, error } = await supabase
    .from('meal_logs')
    .insert(log)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateMealLog = async (
  id: string,
  updates: Updatable<'meal_logs'>
): Promise<MealLog> => {
  const { data, error } = await supabase
    .from('meal_logs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteMealLog = async (id: string): Promise<void> => {
  const { error } = await supabase.from('meal_logs').delete().eq('id', id);
  if (error) throw error;
};

// ============================================
// Bowel Logs
// ============================================

export const getBowelLogs = async (
  petId: string,
  options?: { startDate?: string; endDate?: string; limit?: number }
): Promise<BowelLog[]> => {
  let query = supabase
    .from('bowel_logs')
    .select('*')
    .eq('pet_id', petId)
    .order('date', { ascending: false })
    .order('time', { ascending: false });

  if (options?.startDate) {
    query = query.gte('date', options.startDate);
  }
  if (options?.endDate) {
    query = query.lte('date', options.endDate);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

export const createBowelLog = async (
  log: Omit<Insertable<'bowel_logs'>, 'id' | 'created_at'>
): Promise<BowelLog> => {
  const { data, error } = await supabase
    .from('bowel_logs')
    .insert(log)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateBowelLog = async (
  id: string,
  updates: Updatable<'bowel_logs'>
): Promise<BowelLog> => {
  const { data, error } = await supabase
    .from('bowel_logs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteBowelLog = async (id: string): Promise<void> => {
  const { error } = await supabase.from('bowel_logs').delete().eq('id', id);
  if (error) throw error;
};

// ============================================
// Weight Logs
// ============================================

export const getWeightLogs = async (
  petId: string,
  options?: { startDate?: string; endDate?: string; limit?: number }
): Promise<WeightLog[]> => {
  let query = supabase
    .from('weight_logs')
    .select('*')
    .eq('pet_id', petId)
    .order('date', { ascending: false });

  if (options?.startDate) {
    query = query.gte('date', options.startDate);
  }
  if (options?.endDate) {
    query = query.lte('date', options.endDate);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

export const createWeightLog = async (
  log: Omit<Insertable<'weight_logs'>, 'id' | 'created_at'>
): Promise<WeightLog> => {
  const { data, error } = await supabase
    .from('weight_logs')
    .insert(log)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateWeightLog = async (
  id: string,
  updates: Updatable<'weight_logs'>
): Promise<WeightLog> => {
  const { data, error } = await supabase
    .from('weight_logs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteWeightLog = async (id: string): Promise<void> => {
  const { error } = await supabase.from('weight_logs').delete().eq('id', id);
  if (error) throw error;
};

// ============================================
// Expense Logs
// ============================================

export const getExpenseLogs = async (
  petId: string,
  options?: { startDate?: string; endDate?: string; limit?: number; category?: string }
): Promise<ExpenseLog[]> => {
  let query = supabase
    .from('expense_logs')
    .select('*')
    .eq('pet_id', petId)
    .order('date', { ascending: false });

  if (options?.startDate) {
    query = query.gte('date', options.startDate);
  }
  if (options?.endDate) {
    query = query.lte('date', options.endDate);
  }
  if (options?.category) {
    query = query.eq('category', options.category);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

export const createExpenseLog = async (
  log: Omit<Insertable<'expense_logs'>, 'id' | 'created_at'>
): Promise<ExpenseLog> => {
  const { data, error } = await supabase
    .from('expense_logs')
    .insert(log)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateExpenseLog = async (
  id: string,
  updates: Updatable<'expense_logs'>
): Promise<ExpenseLog> => {
  const { data, error } = await supabase
    .from('expense_logs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteExpenseLog = async (id: string): Promise<void> => {
  const { error } = await supabase.from('expense_logs').delete().eq('id', id);
  if (error) throw error;
};

// ============================================
// Combined Queries
// ============================================

/**
 * Get all logs for a specific date
 */
export const getLogsByDate = async (
  petId: string,
  date: string
): Promise<DailyLogSummary> => {
  const [walks, meals, bowels, weights, expenses] = await Promise.all([
    supabase.from('walk_logs').select('*').eq('pet_id', petId).eq('date', date),
    supabase.from('meal_logs').select('*').eq('pet_id', petId).eq('date', date),
    supabase.from('bowel_logs').select('*').eq('pet_id', petId).eq('date', date),
    supabase.from('weight_logs').select('*').eq('pet_id', petId).eq('date', date),
    supabase.from('expense_logs').select('*').eq('pet_id', petId).eq('date', date),
  ]);

  return {
    date,
    walks: walks.data || [],
    meals: meals.data || [],
    bowels: bowels.data || [],
    weights: weights.data || [],
    expenses: expenses.data || [],
  };
};

/**
 * Get logs for a date range (for family - all pets)
 */
export const getLogsByDateRange = async (
  familyId: string,
  startDate: string,
  endDate: string
): Promise<{
  walks: WalkLog[];
  meals: MealLog[];
  bowels: BowelLog[];
  weights: WeightLog[];
  expenses: ExpenseLog[];
}> => {
  // First get all pet IDs for this family
  const { data: pets } = await supabase
    .from('pets')
    .select('id')
    .eq('family_id', familyId);

  const petIds = pets?.map(p => p.id) || [];

  if (petIds.length === 0) {
    return { walks: [], meals: [], bowels: [], weights: [], expenses: [] };
  }

  const [walks, meals, bowels, weights, expenses] = await Promise.all([
    supabase
      .from('walk_logs')
      .select('*')
      .in('pet_id', petIds)
      .gte('date', startDate)
      .lte('date', endDate),
    supabase
      .from('meal_logs')
      .select('*')
      .in('pet_id', petIds)
      .gte('date', startDate)
      .lte('date', endDate),
    supabase
      .from('bowel_logs')
      .select('*')
      .in('pet_id', petIds)
      .gte('date', startDate)
      .lte('date', endDate),
    supabase
      .from('weight_logs')
      .select('*')
      .in('pet_id', petIds)
      .gte('date', startDate)
      .lte('date', endDate),
    supabase
      .from('expense_logs')
      .select('*')
      .in('pet_id', petIds)
      .gte('date', startDate)
      .lte('date', endDate),
  ]);

  return {
    walks: walks.data || [],
    meals: meals.data || [],
    bowels: bowels.data || [],
    weights: weights.data || [],
    expenses: expenses.data || [],
  };
};

// ============================================
// Statistics
// ============================================

/**
 * Get total walk distance for a pet
 */
export const getTotalWalkDistance = async (
  petId: string,
  month?: string // YYYY-MM format
): Promise<number> => {
  let query = supabase
    .from('walk_logs')
    .select('distance, distance_unit')
    .eq('pet_id', petId)
    .not('distance', 'is', null);

  if (month) {
    query = query.like('date', `${month}%`);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data || []).reduce((total, walk) => {
    if (!walk.distance) return total;
    const distanceInKm = walk.distance_unit === 'm' 
      ? walk.distance / 1000 
      : walk.distance;
    return total + distanceInKm;
  }, 0);
};

/**
 * Get total expenses for a pet
 */
export const getTotalExpenses = async (
  petId: string,
  month?: string // YYYY-MM format
): Promise<number> => {
  let query = supabase
    .from('expense_logs')
    .select('amount')
    .eq('pet_id', petId);

  if (month) {
    query = query.like('date', `${month}%`);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data || []).reduce((total, expense) => total + expense.amount, 0);
};

/**
 * Get expense breakdown by category
 */
export const getExpensesByCategory = async (
  petId: string,
  month?: string
): Promise<Record<string, number>> => {
  let query = supabase
    .from('expense_logs')
    .select('category, amount')
    .eq('pet_id', petId);

  if (month) {
    query = query.like('date', `${month}%`);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data || []).reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);
};

/**
 * Get weight history for a pet
 */
export const getWeightHistory = async (petId: string): Promise<WeightLog[]> => {
  const { data, error } = await supabase
    .from('weight_logs')
    .select('*')
    .eq('pet_id', petId)
    .order('date', { ascending: true });

  if (error) throw error;
  return data || [];
};

/**
 * Create a weight log AND automatically add a calendar event
 * Used for calendar integration of weight tracking
 */
export const createWeightLogWithCalendar = async (
  log: Omit<Insertable<'weight_logs'>, 'id' | 'created_at'>,
  familyId: string,
  petName: string
): Promise<WeightLog> => {
  // Create weight log
  const { data, error } = await supabase
    .from('weight_logs')
    .insert(log)
    .select()
    .single();

  if (error) throw error;

  // Create calendar event for this weight entry
  try {
    const eventDate = new Date(`${data.date}T00:00:00`);
    await supabase.from('calendar_events').insert({
      family_id: familyId,
      pet_id: data.pet_id,
      title: `⚖️ ${petName} 체중 ${data.weight}kg`,
      start_time: eventDate.toISOString(),
      end_time: eventDate.toISOString(),
      event_type: 'health' as const,
      description: data.notes || `체중 기록: ${data.weight}kg`,
      related_log_id: data.id,
      related_log_type: null,
      created_by: log.user_id,
    });
  } catch (calendarError) {
    // Non-blocking: calendar event creation failure shouldn't fail the weight log
    console.error('Calendar event creation for weight failed:', calendarError);
  }

  return data;
};
