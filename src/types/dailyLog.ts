// ============================================
// Daily Log Types - 반려견 일상 기록
// ============================================

// 만족도 타입
export type Satisfaction = "good" | "normal" | "bad";

// 배변 상태
export type BowelCondition = "good" | "loose" | "hard";

// 배변 종류
export type BowelType = "urine" | "feces" | "both";

// 식사 타입
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

// 사료 종류
export type FoodType = "dry" | "wet" | "cooked" | "treat" | "other";

// 지출 카테고리
export type ExpenseCategory = 
  | "food"      // 사료/간식
  | "medical"   // 병원/의료
  | "grooming"  // 미용
  | "supplies"  // 용품
  | "training"  // 훈련
  | "hotel"     // 호텔/위탁
  | "other";    // 기타

// ============================================
// 산책 기록
// ============================================
export interface WalkLog {
  id: string;
  petId: string;
  petName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  duration: number; // 분 단위
  distance?: number; // km
  distanceUnit: "km" | "m";
  satisfaction: Satisfaction;
  photoUrl?: string; // Base64 또는 URL
  notes?: string;
  createdAt: string;
}

// ============================================
// 식사 기록
// ============================================
export interface MealLog {
  id: string;
  petId: string;
  petName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  mealType: MealType;
  foodType: FoodType;
  foodName?: string; // 사료 이름
  amount: number; // g 단위
  medsTaken: boolean; // 약 복용 여부
  medsName?: string; // 약 이름
  notes?: string;
  createdAt: string;
}

// ============================================
// 배변 기록
// ============================================
export interface BowelLog {
  id: string;
  petId: string;
  petName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  bowelType: BowelType;
  condition: BowelCondition;
  notes?: string;
  createdAt: string;
}

// ============================================
// 체중 기록
// ============================================
export interface WeightLog {
  id: string;
  petId: string;
  petName: string;
  date: string; // YYYY-MM-DD
  weight: number; // kg
  notes?: string;
  createdAt: string;
}

// ============================================
// 지출 기록
// ============================================
export interface ExpenseLog {
  id: string;
  petId: string;
  petName: string;
  date: string; // YYYY-MM-DD
  amount: number; // 원
  category: ExpenseCategory;
  description: string;
  notes?: string;
  createdAt: string;
}

// ============================================
// 통합 Daily Log 타입
// ============================================
export type DailyLogType = "walk" | "meal" | "bowel" | "weight" | "expense";

export interface DailyLogSummary {
  date: string;
  walks: WalkLog[];
  meals: MealLog[];
  bowels: BowelLog[];
  weights: WeightLog[];
  expenses: ExpenseLog[];
}

// ============================================
// 라벨 매핑
// ============================================
export const satisfactionLabels: Record<Satisfaction, string> = {
  good: "좋음 😊",
  normal: "보통 😐",
  bad: "나쁨 😟",
};

// 귀여운 만족도 라벨
export const cuteSatisfactionLabels: Record<Satisfaction, string> = {
  good: "신났어요! 🐕",
  normal: "그냥저냥~ 😶",
  bad: "별로였어요 😢",
};

export const bowelConditionLabels: Record<BowelCondition, string> = {
  good: "양호",
  loose: "묽음",
  hard: "딱딱함",
};

// 귀여운 배변 상태 라벨
export const cuteBowelConditionLabels: Record<BowelCondition, string> = {
  good: "완벽해요! 💩✨",
  loose: "물렁물렁 💧",
  hard: "단단해요 🪨",
};

export const bowelTypeLabels: Record<BowelType, string> = {
  urine: "소변",
  feces: "대변",
  both: "소변+대변",
};

// 귀여운 배변 타입 라벨
export const cuteBowelTypeLabels: Record<BowelType, string> = {
  urine: "쉬야 💦",
  feces: "응가 💩",
  both: "쉬야+응가 🎉",
};

export const mealTypeLabels: Record<MealType, string> = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
  snack: "간식",
};

// 귀여운 식사 타입 라벨
export const cuteMealTypeLabels: Record<MealType, string> = {
  breakfast: "아침 냠냠 🌅",
  lunch: "점심 냠냠 ☀️",
  dinner: "저녁 냠냠 🌙",
  snack: "간식 타임 🍪",
};

export const foodTypeLabels: Record<FoodType, string> = {
  dry: "건식사료",
  wet: "습식사료",
  cooked: "화식",
  treat: "간식",
  other: "기타",
};

// 귀여운 사료 타입 라벨
export const cuteFoodTypeLabels: Record<FoodType, string> = {
  dry: "바삭바삭 사료 🥣",
  wet: "촉촉한 사료 🥫",
  cooked: "정성 가득 화식 🍳",
  treat: "맛있는 간식 🦴",
  other: "기타 음식 🍽️",
};

export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  food: "사료/간식",
  medical: "병원/의료",
  grooming: "미용",
  supplies: "용품",
  training: "훈련",
  hotel: "호텔/위탁",
  other: "기타",
};

// 귀여운 지출 카테고리 라벨
export const cuteExpenseCategoryLabels: Record<ExpenseCategory, string> = {
  food: "간식 방어 🍖",
  medical: "병원행 🏥",
  grooming: "미용실 ✂️",
  supplies: "쇼핑 타임 🛍️",
  training: "교육비 📚",
  hotel: "호캉스 🏨",
  other: "기타 📦",
};

export const expenseCategoryIcons: Record<ExpenseCategory, string> = {
  food: "🍖",
  medical: "🏥",
  grooming: "✂️",
  supplies: "🛒",
  training: "🎓",
  hotel: "🏨",
  other: "📦",
};
