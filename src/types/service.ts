import type { Pet } from "./pet";

// ============================================
// 업체 타입 - SQL ENUM 기준
// ============================================
export type ServiceType = "hotel" | "training" | "grooming" | "hospital";

// 예약 상태
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

// ============================================
// 업체 정보 - SQL 스키마 기준
// ============================================
export interface ServiceProvider {
  id: string;
  ownerId: string;
  name: string;                    // maps to business_name
  type: ServiceType;               // maps to service_type
  description?: string;
  address: string;
  phone: string;
  businessHours?: Record<string, { open: string; close: string }>;
  latitude?: number;
  longitude?: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt?: string;
}

// 펫 정보 스냅샷 (예약 시점의 정보 저장용)
export interface PetInfoSnapshot {
  id: string;
  name: string;
  species: string;
  breed: string;
  age?: number;
  gender: "male" | "female";
  weight: number;
  allergies?: string[];
  vaccinationHistory?: Pet["vaccinationHistory"];
  notes?: string;
}

// ============================================
// 서비스 예약 - SQL 스키마 기준
// ============================================
export interface ServiceBooking {
  id: string;
  providerId: string;
  providerName?: string;           // join data
  serviceType?: ServiceType;       // join data
  familyId: string;
  petId: string;
  petName?: string;                // join data
  serviceId?: string;
  serviceName?: string;            // join data
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  status: BookingStatus;
  totalPrice?: number;
  specialRequests?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  confirmedAt?: string;
  completedAt?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
  calendarEventId?: string;
  petInfo?: PetInfoSnapshot;
}

// 업체 코멘트 / 데일리 리포트
export interface ProviderComment {
  id: string;
  providerId: string;
  providerName: string;
  serviceType: ServiceType;
  bookingId: string;
  petId: string;
  petName: string;
  date: string;
  comment: string;
  photos?: string[];
  createdAt: string;
}
