import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CalendarEvent } from "../types/calendar";

interface CalendarState {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, "id">) => void;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  getEventById: (id: string) => CalendarEvent | undefined;
  getEventsByPetId: (petId: string) => CalendarEvent[];
}

// localStorage에 저장된 이벤트 타입 (날짜가 문자열)
interface StoredEvent {
  id: string;
  title: string;
  start: string | Date;
  end: string | Date;
  type: string;
  petId: string;
  petName: string;
  description?: string;
  location?: string;
  serviceProvider?: string;
}

// 날짜를 Date 객체로 변환하는 헬퍼 함수
const parseEvent = (event: StoredEvent): CalendarEvent => ({
  ...event,
  start: new Date(event.start),
  end: new Date(event.end),
  type: event.type as CalendarEvent["type"],
});

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      events: [
        {
          id: "1",
          title: "멍멍이 건강검진",
          start: new Date(2026, 0, 25, 10, 0),
          end: new Date(2026, 0, 25, 11, 0),
          type: "health",
          petId: "1",
          petName: "멍멍이",
          description: "정기 건강검진",
          location: "행복 동물병원",
          serviceProvider: "김수의 원장님",
        },
        {
          id: "2",
          title: "뭉치 미용",
          start: new Date(2026, 0, 27, 14, 0),
          end: new Date(2026, 0, 27, 16, 0),
          type: "grooming",
          petId: "2",
          petName: "뭉치",
          description: "전체 미용 + 목욕",
          location: "러블리 펫 미용실",
        },
        {
          id: "3",
          title: "멍멍이 훈련",
          start: new Date(2026, 0, 30, 15, 0),
          end: new Date(2026, 0, 30, 16, 0),
          type: "training",
          petId: "1",
          petName: "멍멍이",
          description: "복종 훈련 3회차",
          location: "프로 도그 트레이닝",
        },
      ],

      addEvent: (eventData) => {
        const newEvent: CalendarEvent = {
          ...eventData,
          id: Date.now().toString(),
        };
        set((state) => ({ events: [...state.events, newEvent] }));
      },

      updateEvent: (id, eventData) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id ? { ...event, ...eventData } : event,
          ),
        }));
      },

      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
        }));
      },

      getEventById: (id) => {
        return get().events.find((event) => event.id === id);
      },

      getEventsByPetId: (petId) => {
        return get().events.filter((event) => event.petId === petId);
      },
    }),
    {
      name: "calendar-storage",
      partialize: (state) => ({ events: state.events }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.events = state.events.map(parseEvent);
        }
      },
    },
  ),
);
