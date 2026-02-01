// ============================================
// Provider Connection Types
// "Kids Note Style" Provider-Family Connection
// Synced with SQL Schema: 03_provider_connection.sql
// FIXED: All type mismatches resolved
// ============================================

import type { Pet } from './pet';

// ============================================
// JSON 호환 타입
// ============================================
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ============================================
// Connection Types - SQL ENUM 기준
// ============================================

export type ConnectionStatus = 'pending' | 'active' | 'paused' | 'ended';
export type ConnectionType = 'invite' | 'booking';
export type CareMood = 'happy' | 'good' | 'normal' | 'tired' | 'sick';
export type ServiceType = 'hotel' | 'training' | 'grooming' | 'hospital';

// ============================================
// Provider (업체)
// ============================================

export interface Provider {
  id: string;
  ownerId: string;
  name: string;                    // maps to business_name
  serviceType: ServiceType;        // maps to service_type
  description?: string | null;
  address: string;
  phone: string;
  businessHours?: Json | null;
  latitude?: number | null;
  longitude?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  createdAt: string;
  updatedAt: string;
}

// ✅ FIXED: Added all missing fields
export interface ProviderFormData {
  name: string;
  serviceType: ServiceType;
  description?: string | null;
  address: string;
  phone: string;
  businessHours?: Json | null;
  latitude?: number | null;
  longitude?: number | null;
}

// ============================================
// Provider Connection (펫별 연결)
// ============================================

export interface ProviderConnection {
  id: string;
  providerId: string;
  familyId: string;
  petId: string;
  status: ConnectionStatus;
  connectionType: ConnectionType;
  inviteCode?: string | null;
  bookingId?: string | null;
  permissions: ConnectionPermissions | Json | null;
  connectedAt?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Joined data
  provider?: Provider;
  pet?: Pet;
}

export interface ConnectionPermissions {
  view_pet_info: boolean;
  view_health_records: boolean;
  view_allergies: boolean;
  create_care_notes: boolean;
  view_past_logs: boolean;
  view_expenses: boolean;
}

// ============================================
// Provider Invite (초대 코드)
// ============================================

export interface ProviderInvite {
  id: string;
  providerId: string;
  code: string;
  createdBy: string;
  expiresAt: string;
  maxUses: number;
  useCount: number;
  createdAt: string;
  
  // Joined data
  provider?: Provider;
}

// ============================================
// Care Note (알림장)
// ============================================

export interface CareNote {
  id: string;
  providerId: string;
  petId: string;
  familyId: string;
  bookingId?: string | null;
  date: string;
  mood: CareMood;
  moodNote?: string | null;
  activities: Json | null;
  meals: Json | null;
  bowelLogs: Json | null;
  photos: string[];
  comment?: string | null;
  commentCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  
  // Joined data (optional)
  provider?: Provider;
  pet?: Pet;
  providerName?: string;
  petName?: string;
  petImage?: string | null;
  createdByName?: string;
}

export interface CareActivities {
  nap: boolean;
  snack: boolean;
  play: boolean;
  walk: boolean;
  grooming: boolean;
  training: boolean;
  socialization: boolean;
  [key: string]: boolean;  // Index signature for Json compatibility
}

export interface CareNoteMeal {
  time: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  amount?: number;
  ateWell: boolean;
  note?: string;
  [key: string]: string | number | boolean | undefined;  // Index signature
}

export interface CareNoteBowel {
  time: string;
  type: 'urine' | 'feces' | 'both';
  condition: 'good' | 'loose' | 'hard';
  note?: string;
  [key: string]: string | undefined;  // Index signature
}

// ✅ FIXED: photos as string[], added all missing fields
export interface CareNoteFormData {
  petId: string;
  familyId?: string;
  bookingId?: string | null;
  date: string;
  mood: CareMood;
  moodNote?: string | null;
  activities: CareActivities;
  meals: CareNoteMeal[];
  bowelLogs: CareNoteBowel[];
  photos: string[];  // ✅ Changed from File[] to string[]
  existingPhotos?: string[];
  comment?: string | null;
}

// ============================================
// UI Config
// ============================================

export const moodConfig: Record<CareMood, { emoji: string; label: string; color: string }> = {
  happy: { emoji: '😄', label: '아주 좋아요', color: '#22c55e' },
  good: { emoji: '😊', label: '좋아요', color: '#84cc16' },
  normal: { emoji: '😐', label: '보통이에요', color: '#eab308' },
  tired: { emoji: '😔', label: '피곤해요', color: '#f97316' },
  sick: { emoji: '🤒', label: '아파요', color: '#ef4444' },
};

export const activityConfig = {
  nap: { emoji: '😴', label: '낮잠' },
  snack: { emoji: '🍪', label: '간식' },
  play: { emoji: '🎾', label: '놀이' },
  walk: { emoji: '🚶', label: '산책' },
  grooming: { emoji: '✨', label: '미용' },
  training: { emoji: '🎓', label: '훈련' },
  socialization: { emoji: '🐕', label: '친구놀이' },
};

export const serviceTypeConfig: Record<ServiceType, { emoji: string; label: string; color: string }> = {
  hotel: { emoji: '🏨', label: '펫호텔', color: '#3b82f6' },
  grooming: { emoji: '✂️', label: '미용실', color: '#ec4899' },
  hospital: { emoji: '🏥', label: '동물병원', color: '#ef4444' },
  training: { emoji: '🎓', label: '훈련소', color: '#8b5cf6' },
};

// ============================================
// Connected Pet (Provider가 보는 펫 정보)
// ✅ FIXED: Simplified structure to match actual usage
// ============================================

export interface ConnectedPet {
  id: string;
  connectionId: string;
  petId: string;
  petName: string;
  petSpecies?: string;
  petBreed?: string;
  petImage?: string | null;
  familyId: string;
  familyName?: string;
  permissions?: Json | null;
  connectedAt?: string | null;
  
  // Extended fields (optional)
  name?: string;
  species?: string;
  breed?: string;
  birthDate?: string;
  gender?: 'male' | 'female';
  weight?: number;
  profileImage?: string | null;
  color?: string;
  allergies?: string[];
  
  connection?: {
    id: string;
    status: ConnectionStatus;
    connectedAt?: string | null;
    permissions: ConnectionPermissions;
  };
  
  family?: {
    id: string;
    name: string;
  };
  
  hasTodayCareNote?: boolean;
}

// ============================================
// My Provider (Family가 보는 연결된 Provider)
// ✅ FIXED: Made recentCareNotes and totalCareNotes optional
// ============================================

export interface MyProvider {
  id: string;
  name: string;
  serviceType: ServiceType;
  profileImage?: string | null;
  phone?: string | null;
  address?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  connectionId?: string;
  connectedAt?: string | null;
  
  connectedPets: {
    id: string;
    name: string;
    profileImage?: string | null;
  }[];
  
  recentCareNotes?: CareNote[];
  totalCareNotes?: number;
}

// ============================================
// Care Note Comment (댓글)
// ✅ FIXED: Use 'content' as primary, 'comment' as alias
// ============================================

export interface CareNoteComment {
  id: string;
  careNoteId: string;
  authorId: string;
  authorType: 'family' | 'provider' | string;
  authorName?: string;
  authorAvatar?: string | null;
  content: string;
  createdAt: string;
}

export interface CareNoteCommentFormData {
  careNoteId: string;
  authorId?: string;
  authorType: 'family' | 'provider' | string;
  content: string;
}

// ============================================
// Announcement (공지사항)
// ============================================

export interface Announcement {
  id: string;
  providerId: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt?: string | null;
  
  // Joined data
  provider?: Provider;
  providerName?: string;
  createdByName?: string;
  isRead?: boolean;
}

export interface AnnouncementFormData {
  title: string;
  content: string;
  isPinned?: boolean;
}
