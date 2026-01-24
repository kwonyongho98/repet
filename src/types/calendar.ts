// ServiceType과 매핑: hotel, training, grooming, hospital
export type EventType =
  | "health"
  | "grooming"
  | "training"
  | "hotel"
  | "hospital"
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
}

export interface Pet {
  id: string;
  name: string;
  color: string; // 캘린더에서 구분용 색상
}
