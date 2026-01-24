// 업체 타입
export type ServiceType = "hotel" | "training" | "grooming" | "hospital";

// 예약 상태
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

// 업체 정보
export interface ServiceProvider {
  id: string;
  name: string;
  type: ServiceType;
  description: string;
  address: string;
  phone: string;
  hours: string;
  rating: number;
  reviewCount: number;
  images: string[];
  services: string[]; // ['1박 2일', '장기 위탁', '실내 놀이터']
  priceRange: string; // '₩30,000 ~ ₩50,000'
  createdAt: string;
}

// 서비스 예약
export interface ServiceBooking {
  id: string;
  providerId: string;
  providerName: string;
  serviceType: ServiceType;
  petId: string;
  petName: string;
  serviceName: string; // '1박 2일', '장기 위탁' 등
  startDate: string;
  endDate: string;
  status: BookingStatus;
  price: number;
  notes?: string;
  createdAt: string;
  calendarEventId?: string; // CalendarEvent 연동용
}

// 업체 코멘트 / 데일리 리포트 (핵심 기능!)
export interface ProviderComment {
  id: string;
  providerId: string;
  providerName: string;
  serviceType: ServiceType; // 서비스 타입 추가
  bookingId: string;
  petId: string;
  petName: string;
  comment: string; // 리포트 내용
  imageUrl?: string; // 단일 이미지 (Base64 또는 URL)
  createdBy: string; // 업체 사장님 이름
  createdAt: string;
}
