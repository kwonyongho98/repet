import { create } from 'zustand';
import type {
  WalkLog,
  MealLog,
  BowelLog,
  WeightLog,
  ExpenseLog,
  DailyLogSummary,
} from '../types/dailyLog';
import type { Database } from '../types/database';
import { supabase } from '../lib/supabase';

// Type aliases for type-safe inserts/updates
type WalkLogInsert = Database['public']['Tables']['walk_logs']['Insert'];
type WalkLogUpdate = Database['public']['Tables']['walk_logs']['Update'];
type MealLogInsert = Database['public']['Tables']['meal_logs']['Insert'];
type MealLogUpdate = Database['public']['Tables']['meal_logs']['Update'];
type BowelLogInsert = Database['public']['Tables']['bowel_logs']['Insert'];
type BowelLogUpdate = Database['public']['Tables']['bowel_logs']['Update'];
type WeightLogInsert = Database['public']['Tables']['weight_logs']['Insert'];
type WeightLogUpdate = Database['public']['Tables']['weight_logs']['Update'];
type ExpenseLogInsert = Database['public']['Tables']['expense_logs']['Insert'];
type ExpenseLogUpdate = Database['public']['Tables']['expense_logs']['Update'];

// Helper functions for fetching logs
const fetchWalkLogs = async (petIds: string[], date?: string): Promise<WalkLog[]> => {
  let query = supabase.from('walk_logs').select('*').in('pet_id', petIds).order('date', { ascending: false });
  if (date) query = query.eq('date', date);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((w: any) => ({
    id: w.id, petId: w.pet_id, petName: '', date: w.date, startTime: w.start_time, endTime: w.end_time,
    duration: w.duration, distance: w.distance, distanceUnit: w.distance_unit, satisfaction: w.satisfaction,
    photoUrl: w.photo_url, pathData: w.path_data, poopLocations: w.poop_locations, notes: w.notes, createdAt: w.created_at,
  }));
};

const fetchMealLogs = async (petIds: string[], date?: string): Promise<MealLog[]> => {
  let query = supabase.from('meal_logs').select('*').in('pet_id', petIds).order('date', { ascending: false });
  if (date) query = query.eq('date', date);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((m: any) => ({
    id: m.id, petId: m.pet_id, petName: '', date: m.date, time: m.time, mealType: m.meal_type,
    foodType: m.food_type, foodName: m.food_name, amount: m.amount, medsTaken: m.meds_taken,
    medsName: m.meds_name, notes: m.notes, createdAt: m.created_at,
  }));
};

const fetchBowelLogs = async (petIds: string[], date?: string): Promise<BowelLog[]> => {
  let query = supabase.from('bowel_logs').select('*').in('pet_id', petIds).order('date', { ascending: false });
  if (date) query = query.eq('date', date);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((b: any) => ({
    id: b.id, petId: b.pet_id, petName: '', date: b.date, time: b.time,
    bowelType: b.bowel_type, condition: b.condition, notes: b.notes, createdAt: b.created_at,
  }));
};

const fetchWeightLogs = async (petIds: string[], date?: string): Promise<WeightLog[]> => {
  let query = supabase.from('weight_logs').select('*').in('pet_id', petIds).order('date', { ascending: false });
  if (date) query = query.eq('date', date);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((w: any) => ({
    id: w.id, petId: w.pet_id, petName: '', date: w.date, weight: w.weight, notes: w.notes, createdAt: w.created_at,
  }));
};

const fetchExpenseLogs = async (petIds: string[], date?: string): Promise<ExpenseLog[]> => {
  let query = supabase.from('expense_logs').select('*').in('pet_id', petIds).order('date', { ascending: false });
  if (date) query = query.eq('date', date);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((e: any) => ({
    id: e.id, petId: e.pet_id, petName: '', date: e.date, amount: e.amount,
    category: e.category, description: e.description, notes: e.notes, createdAt: e.created_at,
  }));
};

interface DailyLogState {
  walkLogs: WalkLog[]; mealLogs: MealLog[]; bowelLogs: BowelLog[];
  weightLogs: WeightLog[]; expenseLogs: ExpenseLog[];
  isLoading: boolean; error: string | null;
  fetchAllLogs: (petIds: string[], date?: string) => Promise<void>;
  addWalkLog: (log: Omit<WalkLog, 'id' | 'createdAt'>) => Promise<WalkLog | null>;
  updateWalkLog: (id: string, log: Partial<WalkLog>) => Promise<void>;
  deleteWalkLog: (id: string) => Promise<void>;
  getWalkLogsByPetId: (petId: string) => WalkLog[];
  getWalkLogsByDate: (date: string) => WalkLog[];
  addMealLog: (log: Omit<MealLog, 'id' | 'createdAt'>) => Promise<void>;
  updateMealLog: (id: string, log: Partial<MealLog>) => Promise<void>;
  deleteMealLog: (id: string) => Promise<void>;
  getMealLogsByPetId: (petId: string) => MealLog[];
  getMealLogsByDate: (date: string) => MealLog[];
  addBowelLog: (log: Omit<BowelLog, 'id' | 'createdAt'>) => Promise<void>;
  updateBowelLog: (id: string, log: Partial<BowelLog>) => Promise<void>;
  deleteBowelLog: (id: string) => Promise<void>;
  getBowelLogsByPetId: (petId: string) => BowelLog[];
  getBowelLogsByDate: (date: string) => BowelLog[];
  addWeightLog: (log: Omit<WeightLog, 'id' | 'createdAt'>) => Promise<void>;
  updateWeightLog: (id: string, log: Partial<WeightLog>) => Promise<void>;
  deleteWeightLog: (id: string) => Promise<void>;
  getWeightLogsByPetId: (petId: string) => WeightLog[];
  addExpenseLog: (log: Omit<ExpenseLog, 'id' | 'createdAt'>) => Promise<void>;
  updateExpenseLog: (id: string, log: Partial<ExpenseLog>) => Promise<void>;
  deleteExpenseLog: (id: string) => Promise<void>;
  getExpenseLogsByPetId: (petId: string) => ExpenseLog[];
  getExpenseLogsByDate: (date: string) => ExpenseLog[];
  getDailySummary: (petId: string, date: string) => DailyLogSummary;
  clearLogs: () => void;
}

export const useDailyLogStore = create<DailyLogState>((set, get) => ({
  walkLogs: [], mealLogs: [], bowelLogs: [], weightLogs: [], expenseLogs: [],
  isLoading: false, error: null,

  fetchAllLogs: async (petIds, date?) => {
    if (petIds.length === 0) { set({ walkLogs: [], mealLogs: [], bowelLogs: [], weightLogs: [], expenseLogs: [], isLoading: false }); return; }
    set({ isLoading: true, error: null });
    try {
      const [walks, meals, bowels, weights, expenses] = await Promise.all([
        fetchWalkLogs(petIds, date), fetchMealLogs(petIds, date), fetchBowelLogs(petIds, date),
        fetchWeightLogs(petIds, date), fetchExpenseLogs(petIds, date),
      ]);
      set({ walkLogs: walks, mealLogs: meals, bowelLogs: bowels, weightLogs: weights, expenseLogs: expenses, isLoading: false });
    } catch (error) { console.error('Fetch logs error:', error); set({ error: 'Failed to fetch logs', isLoading: false }); }
  },

  addWalkLog: async (logData) => {
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return null;
    try {
      const walkInsert: WalkLogInsert = {
        pet_id: logData.petId, user_id: user.id, date: logData.date, start_time: logData.startTime,
        end_time: logData.endTime, duration: logData.duration, distance: logData.distance ?? null,
        distance_unit: logData.distanceUnit || 'km', satisfaction: logData.satisfaction || 'normal',
        photo_url: logData.photoUrl || null, path_data: logData.pathData || null,
        poop_locations: logData.poopLocations || null, notes: logData.notes || null,
      };
      const { data, error } = await supabase.from('walk_logs').insert(walkInsert).select().single();
      if (error) { console.error('Add walk log error:', error); return null; }
      const newLog: WalkLog = {
        id: data.id, petId: data.pet_id, petName: logData.petName || '', date: data.date,
        startTime: data.start_time, endTime: data.end_time, duration: data.duration, distance: data.distance,
        distanceUnit: data.distance_unit, satisfaction: data.satisfaction, photoUrl: data.photo_url,
        pathData: data.path_data, poopLocations: data.poop_locations, notes: data.notes, createdAt: data.created_at,
      };
      set((state) => ({ walkLogs: [newLog, ...state.walkLogs] }));
      return newLog;
    } catch (error) { console.error('Add walk log error:', error); return null; }
  },

  updateWalkLog: async (id, logData) => {
    try {
      const walkUpdate: WalkLogUpdate = {};
      if (logData.date !== undefined) walkUpdate.date = logData.date;
      if (logData.startTime !== undefined) walkUpdate.start_time = logData.startTime;
      if (logData.endTime !== undefined) walkUpdate.end_time = logData.endTime;
      if (logData.duration !== undefined) walkUpdate.duration = logData.duration;
      if (logData.distance !== undefined) walkUpdate.distance = logData.distance ?? null;
      if (logData.satisfaction !== undefined) walkUpdate.satisfaction = logData.satisfaction;
      if (logData.photoUrl !== undefined) walkUpdate.photo_url = logData.photoUrl || null;
      if (logData.pathData !== undefined) walkUpdate.path_data = logData.pathData || null;
      if (logData.poopLocations !== undefined) walkUpdate.poop_locations = logData.poopLocations || null;
      if (logData.notes !== undefined) walkUpdate.notes = logData.notes || null;
      const { error } = await supabase.from('walk_logs').update(walkUpdate).eq('id', id);
      if (error) { console.error('Update walk log error:', error); return; }
      set((state) => ({ walkLogs: state.walkLogs.map((log) => log.id === id ? { ...log, ...logData } : log) }));
    } catch (error) { console.error('Update walk log error:', error); }
  },

  deleteWalkLog: async (id) => {
    try {
      const { error } = await supabase.from('walk_logs').delete().eq('id', id);
      if (error) { console.error('Delete walk log error:', error); return; }
      set((state) => ({ walkLogs: state.walkLogs.filter((log) => log.id !== id) }));
    } catch (error) { console.error('Delete walk log error:', error); }
  },

  getWalkLogsByPetId: (petId) => get().walkLogs.filter((log) => log.petId === petId),
  getWalkLogsByDate: (date) => get().walkLogs.filter((log) => log.date === date),

  addMealLog: async (logData) => {
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
    try {
      const mealInsert: MealLogInsert = {
        pet_id: logData.petId, user_id: user.id, date: logData.date, time: logData.time,
        meal_type: logData.mealType, food_type: logData.foodType, food_name: logData.foodName || null,
        amount: logData.amount, meds_taken: logData.medsTaken || false,
        meds_name: logData.medsName || null, notes: logData.notes || null,
      };
      const { data, error } = await supabase.from('meal_logs').insert(mealInsert).select().single();
      if (error) { console.error('Add meal log error:', error); return; }
      const newLog: MealLog = {
        id: data.id, petId: data.pet_id, petName: logData.petName || '', date: data.date, time: data.time,
        mealType: data.meal_type, foodType: data.food_type, foodName: data.food_name, amount: data.amount,
        medsTaken: data.meds_taken, medsName: data.meds_name, notes: data.notes, createdAt: data.created_at,
      };
      set((state) => ({ mealLogs: [newLog, ...state.mealLogs] }));
    } catch (error) { console.error('Add meal log error:', error); }
  },

  updateMealLog: async (id, logData) => {
    try {
      const mealUpdate: MealLogUpdate = {};
      if (logData.date !== undefined) mealUpdate.date = logData.date;
      if (logData.time !== undefined) mealUpdate.time = logData.time;
      if (logData.mealType !== undefined) mealUpdate.meal_type = logData.mealType;
      if (logData.foodType !== undefined) mealUpdate.food_type = logData.foodType;
      if (logData.foodName !== undefined) mealUpdate.food_name = logData.foodName || null;
      if (logData.amount !== undefined) mealUpdate.amount = logData.amount;
      if (logData.medsTaken !== undefined) mealUpdate.meds_taken = logData.medsTaken;
      if (logData.medsName !== undefined) mealUpdate.meds_name = logData.medsName || null;
      if (logData.notes !== undefined) mealUpdate.notes = logData.notes || null;
      const { error } = await supabase.from('meal_logs').update(mealUpdate).eq('id', id);
      if (error) { console.error('Update meal log error:', error); return; }
      set((state) => ({ mealLogs: state.mealLogs.map((log) => log.id === id ? { ...log, ...logData } : log) }));
    } catch (error) { console.error('Update meal log error:', error); }
  },

  deleteMealLog: async (id) => {
    try {
      const { error } = await supabase.from('meal_logs').delete().eq('id', id);
      if (error) { console.error('Delete meal log error:', error); return; }
      set((state) => ({ mealLogs: state.mealLogs.filter((log) => log.id !== id) }));
    } catch (error) { console.error('Delete meal log error:', error); }
  },

  getMealLogsByPetId: (petId) => get().mealLogs.filter((log) => log.petId === petId),
  getMealLogsByDate: (date) => get().mealLogs.filter((log) => log.date === date),

  addBowelLog: async (logData) => {
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
    try {
      const bowelInsert: BowelLogInsert = {
        pet_id: logData.petId, user_id: user.id, date: logData.date, time: logData.time,
        bowel_type: logData.bowelType, condition: logData.condition, notes: logData.notes || null,
      };
      const { data, error } = await supabase.from('bowel_logs').insert(bowelInsert).select().single();
      if (error) { console.error('Add bowel log error:', error); return; }
      const newLog: BowelLog = {
        id: data.id, petId: data.pet_id, petName: logData.petName || '', date: data.date, time: data.time,
        bowelType: data.bowel_type, condition: data.condition, notes: data.notes, createdAt: data.created_at,
      };
      set((state) => ({ bowelLogs: [newLog, ...state.bowelLogs] }));
    } catch (error) { console.error('Add bowel log error:', error); }
  },

  updateBowelLog: async (id, logData) => {
    try {
      const bowelUpdate: BowelLogUpdate = {};
      if (logData.date !== undefined) bowelUpdate.date = logData.date;
      if (logData.time !== undefined) bowelUpdate.time = logData.time;
      if (logData.bowelType !== undefined) bowelUpdate.bowel_type = logData.bowelType;
      if (logData.condition !== undefined) bowelUpdate.condition = logData.condition;
      if (logData.notes !== undefined) bowelUpdate.notes = logData.notes || null;
      const { error } = await supabase.from('bowel_logs').update(bowelUpdate).eq('id', id);
      if (error) { console.error('Update bowel log error:', error); return; }
      set((state) => ({ bowelLogs: state.bowelLogs.map((log) => log.id === id ? { ...log, ...logData } : log) }));
    } catch (error) { console.error('Update bowel log error:', error); }
  },

  deleteBowelLog: async (id) => {
    try {
      const { error } = await supabase.from('bowel_logs').delete().eq('id', id);
      if (error) { console.error('Delete bowel log error:', error); return; }
      set((state) => ({ bowelLogs: state.bowelLogs.filter((log) => log.id !== id) }));
    } catch (error) { console.error('Delete bowel log error:', error); }
  },

  getBowelLogsByPetId: (petId) => get().bowelLogs.filter((log) => log.petId === petId),
  getBowelLogsByDate: (date) => get().bowelLogs.filter((log) => log.date === date),

  addWeightLog: async (logData) => {
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
    try {
      const weightInsert: WeightLogInsert = {
        pet_id: logData.petId, user_id: user.id, date: logData.date,
        weight: logData.weight, notes: logData.notes || null,
      };
      const { data, error } = await supabase.from('weight_logs').insert(weightInsert).select().single();
      if (error) { console.error('Add weight log error:', error); return; }
      const newLog: WeightLog = {
        id: data.id, petId: data.pet_id, petName: logData.petName || '',
        date: data.date, weight: data.weight, notes: data.notes, createdAt: data.created_at,
      };
      set((state) => ({ weightLogs: [newLog, ...state.weightLogs] }));

      // 캘린더에 몸무게 이벤트 자동 생성
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('family_id')
          .eq('id', user.id)
          .single();

        if (profile?.family_id) {
          const eventDate = new Date(`${logData.date}T00:00:00`);
          await supabase.from('calendar_events').insert({
            family_id: profile.family_id,
            pet_id: logData.petId,
            title: `⚖️ 체중 ${logData.weight}kg`,
            start_time: eventDate.toISOString(),
            end_time: eventDate.toISOString(),
            event_type: 'health',
            description: logData.notes || `체중 기록: ${logData.weight}kg`,
            related_log_id: data.id,
            related_log_type: null,
            created_by: user.id,
          });
        }
      } catch (calError) {
        console.error('Weight calendar event creation error (non-blocking):', calError);
      }
    } catch (error) { console.error('Add weight log error:', error); }
  },

  updateWeightLog: async (id, logData) => {
    try {
      const weightUpdate: WeightLogUpdate = {};
      if (logData.date !== undefined) weightUpdate.date = logData.date;
      if (logData.weight !== undefined) weightUpdate.weight = logData.weight;
      if (logData.notes !== undefined) weightUpdate.notes = logData.notes || null;
      const { error } = await supabase.from('weight_logs').update(weightUpdate).eq('id', id);
      if (error) { console.error('Update weight log error:', error); return; }
      set((state) => ({ weightLogs: state.weightLogs.map((log) => log.id === id ? { ...log, ...logData } : log) }));
    } catch (error) { console.error('Update weight log error:', error); }
  },

  deleteWeightLog: async (id) => {
    try {
      const { error } = await supabase.from('weight_logs').delete().eq('id', id);
      if (error) { console.error('Delete weight log error:', error); return; }
      set((state) => ({ weightLogs: state.weightLogs.filter((log) => log.id !== id) }));
    } catch (error) { console.error('Delete weight log error:', error); }
  },

  getWeightLogsByPetId: (petId) => get().weightLogs.filter((log) => log.petId === petId),

  addExpenseLog: async (logData) => {
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
    try {
      const expenseInsert: ExpenseLogInsert = {
        pet_id: logData.petId, user_id: user.id, date: logData.date, amount: logData.amount,
        category: logData.category, description: logData.description, notes: logData.notes || null,
      };
      const { data, error } = await supabase.from('expense_logs').insert(expenseInsert).select().single();
      if (error) { console.error('Add expense log error:', error); return; }
      const newLog: ExpenseLog = {
        id: data.id, petId: data.pet_id, petName: logData.petName || '', date: data.date,
        amount: data.amount, category: data.category, description: data.description,
        notes: data.notes, createdAt: data.created_at,
      };
      set((state) => ({ expenseLogs: [newLog, ...state.expenseLogs] }));
    } catch (error) { console.error('Add expense log error:', error); }
  },

  updateExpenseLog: async (id, logData) => {
    try {
      const expenseUpdate: ExpenseLogUpdate = {};
      if (logData.date !== undefined) expenseUpdate.date = logData.date;
      if (logData.amount !== undefined) expenseUpdate.amount = logData.amount;
      if (logData.category !== undefined) expenseUpdate.category = logData.category;
      if (logData.description !== undefined) expenseUpdate.description = logData.description;
      if (logData.notes !== undefined) expenseUpdate.notes = logData.notes || null;
      const { error } = await supabase.from('expense_logs').update(expenseUpdate).eq('id', id);
      if (error) { console.error('Update expense log error:', error); return; }
      set((state) => ({ expenseLogs: state.expenseLogs.map((log) => log.id === id ? { ...log, ...logData } : log) }));
    } catch (error) { console.error('Update expense log error:', error); }
  },

  deleteExpenseLog: async (id) => {
    try {
      const { error } = await supabase.from('expense_logs').delete().eq('id', id);
      if (error) { console.error('Delete expense log error:', error); return; }
      set((state) => ({ expenseLogs: state.expenseLogs.filter((log) => log.id !== id) }));
    } catch (error) { console.error('Delete expense log error:', error); }
  },

  getExpenseLogsByPetId: (petId) => get().expenseLogs.filter((log) => log.petId === petId),
  getExpenseLogsByDate: (date) => get().expenseLogs.filter((log) => log.date === date),

  getDailySummary: (petId, date) => {
    const state = get();
    return {
      date,
      walks: state.walkLogs.filter(l => l.petId === petId && l.date === date),
      meals: state.mealLogs.filter(l => l.petId === petId && l.date === date),
      bowels: state.bowelLogs.filter(l => l.petId === petId && l.date === date),
      weights: state.weightLogs.filter(l => l.petId === petId && l.date === date),
      expenses: state.expenseLogs.filter(l => l.petId === petId && l.date === date),
    };
  },

  clearLogs: () => set({ walkLogs: [], mealLogs: [], bowelLogs: [], weightLogs: [], expenseLogs: [], isLoading: false, error: null }),
}));
