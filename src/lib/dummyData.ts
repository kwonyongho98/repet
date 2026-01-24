import type { CalendarEvent, Pet } from "../types/calendar";

export const dummyPets: Pet[] = [
  { id: "1", name: "멍멍이", color: "#3B82F6" }, // 파란색
  { id: "2", name: "뭉치", color: "#10B981" }, // 초록색
];

export const dummyEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "멍멍이 건강검진",
    start: new Date(2026, 0, 25, 10, 0), // 2026년 1월 25일 10시
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
    start: new Date(2026, 0, 27, 14, 0), // 2026년 1월 27일 14시
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
];
