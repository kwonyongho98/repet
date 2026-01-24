export type EventType = "health" | "grooming" | "training" | "hotel" | "other";

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
}

export interface Pet {
  id: string;
  name: string;
  color: string; // 캘린더에서 구분용 색상
}
