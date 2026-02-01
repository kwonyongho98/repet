// ServiceType과 매핑: hotel, training, grooming, hospital
// + walk: 산책 자동 연동용
// + care_note: 업체 케어노트 캘린더 연동용
export type EventType =
  | "health"
  | "grooming"
  | "training"
  | "hotel"
  | "hospital"
  | "walk"
  | "care_note"
  | "other";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: EventType;
  petId: string;
  petName: string;
  description?: string;
  location?: string;
  serviceProvider?: string; // 업체명
  bookingId?: string; // ServiceBooking 연동용
  relatedLogId?: string; // 산책/식사 등 로그 연결용
  relatedLogType?: 'walk' | 'meal' | 'bowel' | 'care_note'; // 연결된 로그 타입
  // 케어노트 전용 필드
  careNoteMood?: string; // 기분 이모지 (😄😊😐😴🤒)
  careNoteProviderName?: string; // 업체명 (별도 표시용)
}

export interface Pet {
  id: string;
  name: string;
  color: string; // 캘린더에서 구분용 색상
}
