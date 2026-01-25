// ============================================
// Partner System Types
// ============================================

export type PartnerStatus = 'pending' | 'active' | 'suspended' | 'removed';
export type CareMood = 'happy' | 'good' | 'normal' | 'tired' | 'sick';

// ============================================
// Partner Connection
// ============================================

export interface PartnerPermissions {
  view_pet_info: boolean;
  view_health_records: boolean;
  view_allergies: boolean;
  create_care_notes: boolean;
  view_past_logs: boolean;
  view_expenses: boolean;
}

export interface PartnerConnection {
  id: string;
  familyId: string;
  providerId: string;
  providerName?: string;
  providerType?: string;
  status: PartnerStatus;
  inviteCode?: string;
  permissions: PartnerPermissions;
  connectedAt?: string;
  connectedBy?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerInvite {
  id: string;
  familyId: string;
  code: string;
  createdBy: string;
  expiresAt: string;
  usedAt?: string;
  usedBy?: string;
  createdAt: string;
}

// ============================================
// Care Note (알림장)
// ============================================

export interface CareNoteActivity {
  nap: boolean;
  snack: boolean;
  play: boolean;
  walk: boolean;
  grooming: boolean;
  training: boolean;
  socialization: boolean;
}

export interface CareNoteMeal {
  time: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  amount: number;
  ateWell: boolean;
  note?: string;
}

export interface CareNoteBowel {
  time: string;
  type: 'urine' | 'feces' | 'both';
  condition: 'good' | 'loose' | 'hard';
  note?: string;
}

export interface CareNote {
  id: string;
  bookingId: string;
  petId: string;
  providerId: string;
  familyId: string;
  date: string;
  
  // 기분/컨디션
  mood: CareMood;
  moodNote?: string;
  
  // 활동
  activities: CareNoteActivity;
  
  // 식사/배변
  meals: CareNoteMeal[];
  bowelLogs: CareNoteBowel[];
  
  // 사진/코멘트
  photos: string[];
  comment?: string;
  
  // 메타
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  
  // Joined data
  petName?: string;
  petImage?: string;
  providerName?: string;
}

// ============================================
// Form Types
// ============================================

export interface CareNoteFormData {
  mood: CareMood;
  moodNote: string;
  activities: CareNoteActivity;
  meals: CareNoteMeal[];
  bowelLogs: CareNoteBowel[];
  photos: File[];
  existingPhotos: string[];
  comment: string;
}

export const defaultCareNoteForm: CareNoteFormData = {
  mood: 'normal',
  moodNote: '',
  activities: {
    nap: false,
    snack: false,
    play: false,
    walk: false,
    grooming: false,
    training: false,
    socialization: false,
  },
  meals: [],
  bowelLogs: [],
  photos: [],
  existingPhotos: [],
  comment: '',
};

// ============================================
// Mood Config
// ============================================

export const moodConfig: Record<CareMood, { emoji: string; label: string; color: string }> = {
  happy: { emoji: '😊', label: '아주 좋아요', color: '#22c55e' },
  good: { emoji: '😃', label: '좋아요', color: '#84cc16' },
  normal: { emoji: '😐', label: '보통이에요', color: '#eab308' },
  tired: { emoji: '😴', label: '피곤해요', color: '#f97316' },
  sick: { emoji: '🤢', label: '아파요', color: '#ef4444' },
};

export const activityConfig: Record<keyof CareNoteActivity, { emoji: string; label: string }> = {
  nap: { emoji: '😴', label: '낮잠' },
  snack: { emoji: '🍪', label: '간식' },
  play: { emoji: '🎾', label: '놀이' },
  walk: { emoji: '🚶', label: '산책' },
  grooming: { emoji: '✨', label: '미용' },
  training: { emoji: '🎓', label: '훈련' },
  socialization: { emoji: '🐕', label: '사회화' },
};

// ============================================
// Notification Types
// ============================================

export interface PushSubscription {
  id: string;
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'care_note' | 'booking' | 'reminder' | 'partner_invite';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  readAt?: string;
  createdAt: string;
}
