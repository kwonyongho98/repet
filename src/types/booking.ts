// ============================================
// Booking System Types
// Synced with SQL Schema: 02_booking_system_mvp.sql
// ============================================

import type { ServiceType } from './service';

// ============================================
// Enums - SQL ENUM 기준
// ============================================

export type BookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'cancelled_by_provider'
  | 'cancelled_by_customer'
  | 'no_show';

export type PetSize = 'small' | 'medium' | 'large';
export type PetSpecies = 'dog' | 'cat' | 'bird' | 'other';

// ============================================
// Provider Service (업체별 서비스)
// ============================================

export interface ProviderService {
  id: string;
  providerId: string;
  name: string;
  description?: string;
  serviceCategory: ServiceType;
  basePrice: number;
  durationMinutes?: number;
  petSizeAllowed: PetSize[];
  petSpeciesAllowed: PetSpecies[];
  maxDailyBookings: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Provider Availability (운영 시간)
// ============================================

export interface ProviderAvailability {
  id: string;
  providerId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export const DAY_OF_WEEK_LABELS: Record<number, string> = {
  0: '일요일',
  1: '월요일',
  2: '화요일',
  3: '수요일',
  4: '목요일',
  5: '금요일',
  6: '토요일',
};

export const DAY_OF_WEEK_SHORT: Record<number, string> = {
  0: '일',
  1: '월',
  2: '화',
  3: '수',
  4: '목',
  5: '금',
  6: '토',
};

// ============================================
// Provider Blackout (휴무일)
// ============================================

export interface ProviderBlackout {
  id: string;
  providerId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  createdAt: string;
}

// ============================================
// Booking (예약) - SQL 스키마 기준
// ============================================

export interface Booking {
  id: string;
  providerId: string;
  familyId: string;
  petId: string;
  serviceId?: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  serviceName?: string;
  totalPrice?: number;
  status: BookingStatus;
  specialRequests?: string;
  petInfoSnapshot?: PetInfoSnapshot;
  cancellationReason?: string;
  cancelledAt?: string;
  confirmedAt?: string;
  completedAt?: string;
  calendarEventId?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  
  provider?: {
    id: string;
    name: string;
    type: ServiceType;
    phone?: string;
    address?: string;
  };
  pet?: {
    id: string;
    name: string;
    species: string;
    breed: string;
  };
  service?: ProviderService;
  review?: BookingReview;
}

export interface PetInfoSnapshot {
  name: string;
  species: string;
  breed: string;
  age?: number;
  weight?: number;
  allergies?: string[];
  notes?: string;
}

// ============================================
// Booking Review (리뷰)
// ============================================

export interface BookingReview {
  id: string;
  bookingId: string;
  providerId: string;
  familyId: string;
  rating: number;
  content?: string;
  images: string[];
  reply?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// API Types
// ============================================

export interface CreateBookingRequest {
  providerId: string;
  serviceId: string;
  petId: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  specialRequests?: string;
}

export interface AvailabilityResponse {
  date: string;
  isAvailable: boolean;
  remainingSlots: number;
  reason?: string;
}

export interface BookingFilter {
  status?: BookingStatus[];
  startDate?: string;
  endDate?: string;
  providerId?: string;
  petId?: string;
}

// ============================================
// Status Labels & Colors
// ============================================

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: '대기 중',
  confirmed: '예약 확정',
  completed: '이용 완료',
  cancelled: '취소됨',
  cancelled_by_provider: '업체 취소',
  cancelled_by_customer: '고객 취소',
  no_show: '노쇼',
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, { bg: string; text: string }> = {
  pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300' },
  confirmed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
  cancelled: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-300' },
  cancelled_by_provider: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
  cancelled_by_customer: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300' },
  no_show: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
};

// ============================================
// Helper Functions
// ============================================

export function isBookingCancellable(booking: Booking): boolean {
  return ['pending', 'confirmed'].includes(booking.status);
}

export function isBookingCompletable(booking: Booking): boolean {
  return booking.status === 'confirmed';
}

export function canWriteReview(booking: Booking): boolean {
  return booking.status === 'completed' && !booking.review;
}

export function formatBookingDateRange(booking: Booking): string {
  if (!booking.endDate || booking.startDate === booking.endDate) {
    return booking.startDate;
  }
  return `${booking.startDate} ~ ${booking.endDate}`;
}

export function formatBookingTimeRange(booking: Booking): string {
  if (booking.startTime && booking.endTime) {
    return `${booking.startTime} - ${booking.endTime}`;
  }
  if (booking.startTime) {
    return booking.startTime;
  }
  return '시간 미정';
}
