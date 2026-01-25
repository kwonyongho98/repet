import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  WalkLog,
  MealLog,
  BowelLog,
  WeightLog,
  ExpenseLog,
  DailyLogSummary,
} from "../types/dailyLog";

interface DailyLogState {
  // 데이터
  walks: WalkLog[];
  meals: MealLog[];
  bowels: BowelLog[];
  weights: WeightLog[];
  expenses: ExpenseLog[];

  // 산책 관련
  addWalkLog: (log: Omit<WalkLog, "id" | "createdAt">) => void;
  updateWalkLog: (id: string, log: Partial<WalkLog>) => void;
  deleteWalkLog: (id: string) => void;

  // 식사 관련
  addMealLog: (log: Omit<MealLog, "id" | "createdAt">) => void;
  updateMealLog: (id: string, log: Partial<MealLog>) => void;
  deleteMealLog: (id: string) => void;

  // 배변 관련
  addBowelLog: (log: Omit<BowelLog, "id" | "createdAt">) => void;
  updateBowelLog: (id: string, log: Partial<BowelLog>) => void;
  deleteBowelLog: (id: string) => void;

  // 체중 관련
  addWeightLog: (log: Omit<WeightLog, "id" | "createdAt">) => void;
  updateWeightLog: (id: string, log: Partial<WeightLog>) => void;
  deleteWeightLog: (id: string) => void;

  // 지출 관련
  addExpenseLog: (log: Omit<ExpenseLog, "id" | "createdAt">) => void;
  updateExpenseLog: (id: string, log: Partial<ExpenseLog>) => void;
  deleteExpenseLog: (id: string) => void;

  // 조회 함수
  getLogsByDate: (date: string) => DailyLogSummary;
  getLogsByPetAndDate: (petId: string, date: string) => DailyLogSummary;
  getLogsByPet: (petId: string) => DailyLogSummary;
  getRecentLogs: (days: number) => DailyLogSummary;
  
  // 통계 함수
  getTotalWalkDistance: (petId: string, month?: string) => number;
  getTotalExpense: (petId: string, month?: string) => number;
  getWeightHistory: (petId: string) => WeightLog[];
}

export const useDailyLogStore = create<DailyLogState>()(
  persist(
    (set, get) => ({
      // 초기 데이터 (샘플)
      walks: [
        {
          id: "walk-1",
          petId: "1",
          petName: "멍멍이",
          date: new Date().toISOString().split("T")[0],
          startTime: "08:00",
          endTime: "08:30",
          duration: 30,
          distance: 1.5,
          distanceUnit: "km",
          satisfaction: "good",
          notes: "아침 산책, 컨디션 좋음",
          createdAt: new Date().toISOString(),
        },
      ],
      meals: [
        {
          id: "meal-1",
          petId: "1",
          petName: "멍멍이",
          date: new Date().toISOString().split("T")[0],
          time: "07:30",
          mealType: "breakfast",
          foodType: "dry",
          foodName: "로얄캐닌",
          amount: 150,
          medsTaken: false,
          createdAt: new Date().toISOString(),
        },
      ],
      bowels: [
        {
          id: "bowel-1",
          petId: "1",
          petName: "멍멍이",
          date: new Date().toISOString().split("T")[0],
          time: "08:15",
          bowelType: "both",
          condition: "good",
          createdAt: new Date().toISOString(),
        },
      ],
      weights: [
        {
          id: "weight-1",
          petId: "1",
          petName: "멍멍이",
          date: new Date().toISOString().split("T")[0],
          weight: 30,
          createdAt: new Date().toISOString(),
        },
      ],
      expenses: [
        {
          id: "expense-1",
          petId: "1",
          petName: "멍멍이",
          date: new Date().toISOString().split("T")[0],
          amount: 45000,
          category: "food",
          description: "로얄캐닌 사료 3kg",
          createdAt: new Date().toISOString(),
        },
      ],

      // ============================================
      // 산책 관련 함수
      // ============================================
      addWalkLog: (log) => {
        const newLog: WalkLog = {
          ...log,
          id: `walk-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ walks: [...state.walks, newLog] }));
      },

      updateWalkLog: (id, log) => {
        set((state) => ({
          walks: state.walks.map((w) =>
            w.id === id ? { ...w, ...log } : w
          ),
        }));
      },

      deleteWalkLog: (id) => {
        set((state) => ({
          walks: state.walks.filter((w) => w.id !== id),
        }));
      },

      // ============================================
      // 식사 관련 함수
      // ============================================
      addMealLog: (log) => {
        const newLog: MealLog = {
          ...log,
          id: `meal-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ meals: [...state.meals, newLog] }));
      },

      updateMealLog: (id, log) => {
        set((state) => ({
          meals: state.meals.map((m) =>
            m.id === id ? { ...m, ...log } : m
          ),
        }));
      },

      deleteMealLog: (id) => {
        set((state) => ({
          meals: state.meals.filter((m) => m.id !== id),
        }));
      },

      // ============================================
      // 배변 관련 함수
      // ============================================
      addBowelLog: (log) => {
        const newLog: BowelLog = {
          ...log,
          id: `bowel-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ bowels: [...state.bowels, newLog] }));
      },

      updateBowelLog: (id, log) => {
        set((state) => ({
          bowels: state.bowels.map((b) =>
            b.id === id ? { ...b, ...log } : b
          ),
        }));
      },

      deleteBowelLog: (id) => {
        set((state) => ({
          bowels: state.bowels.filter((b) => b.id !== id),
        }));
      },

      // ============================================
      // 체중 관련 함수
      // ============================================
      addWeightLog: (log) => {
        const newLog: WeightLog = {
          ...log,
          id: `weight-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ weights: [...state.weights, newLog] }));
      },

      updateWeightLog: (id, log) => {
        set((state) => ({
          weights: state.weights.map((w) =>
            w.id === id ? { ...w, ...log } : w
          ),
        }));
      },

      deleteWeightLog: (id) => {
        set((state) => ({
          weights: state.weights.filter((w) => w.id !== id),
        }));
      },

      // ============================================
      // 지출 관련 함수
      // ============================================
      addExpenseLog: (log) => {
        const newLog: ExpenseLog = {
          ...log,
          id: `expense-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ expenses: [...state.expenses, newLog] }));
      },

      updateExpenseLog: (id, log) => {
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...log } : e
          ),
        }));
      },

      deleteExpenseLog: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        }));
      },

      // ============================================
      // 조회 함수
      // ============================================
      getLogsByDate: (date) => {
        const state = get();
        return {
          date,
          walks: state.walks.filter((w) => w.date === date),
          meals: state.meals.filter((m) => m.date === date),
          bowels: state.bowels.filter((b) => b.date === date),
          weights: state.weights.filter((w) => w.date === date),
          expenses: state.expenses.filter((e) => e.date === date),
        };
      },

      getLogsByPetAndDate: (petId, date) => {
        const state = get();
        return {
          date,
          walks: state.walks.filter((w) => w.petId === petId && w.date === date),
          meals: state.meals.filter((m) => m.petId === petId && m.date === date),
          bowels: state.bowels.filter((b) => b.petId === petId && b.date === date),
          weights: state.weights.filter((w) => w.petId === petId && w.date === date),
          expenses: state.expenses.filter((e) => e.petId === petId && e.date === date),
        };
      },

      getLogsByPet: (petId) => {
        const state = get();
        return {
          date: "all",
          walks: state.walks.filter((w) => w.petId === petId),
          meals: state.meals.filter((m) => m.petId === petId),
          bowels: state.bowels.filter((b) => b.petId === petId),
          weights: state.weights.filter((w) => w.petId === petId),
          expenses: state.expenses.filter((e) => e.petId === petId),
        };
      },

      getRecentLogs: (days) => {
        const state = get();
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - days);

        const isInRange = (dateStr: string) => {
          const date = new Date(dateStr);
          return date >= startDate && date <= today;
        };

        return {
          date: `last-${days}-days`,
          walks: state.walks.filter((w) => isInRange(w.date)),
          meals: state.meals.filter((m) => isInRange(m.date)),
          bowels: state.bowels.filter((b) => isInRange(b.date)),
          weights: state.weights.filter((w) => isInRange(w.date)),
          expenses: state.expenses.filter((e) => isInRange(e.date)),
        };
      },

      // ============================================
      // 통계 함수
      // ============================================
      getTotalWalkDistance: (petId, month) => {
        const state = get();
        let walks = state.walks.filter((w) => w.petId === petId);
        
        if (month) {
          walks = walks.filter((w) => w.date.startsWith(month));
        }

        return walks.reduce((total, walk) => {
          if (!walk.distance) return total;
          // km로 통일
          const distanceInKm = walk.distanceUnit === "m" 
            ? walk.distance / 1000 
            : walk.distance;
          return total + distanceInKm;
        }, 0);
      },

      getTotalExpense: (petId, month) => {
        const state = get();
        let expenses = state.expenses.filter((e) => e.petId === petId);
        
        if (month) {
          expenses = expenses.filter((e) => e.date.startsWith(month));
        }

        return expenses.reduce((total, expense) => total + expense.amount, 0);
      },

      getWeightHistory: (petId) => {
        const state = get();
        return state.weights
          .filter((w) => w.petId === petId)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      },
    }),
    {
      name: "daily-log-storage",
    }
  )
);
