import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ServiceProvider,
  ServiceBooking,
  ProviderComment,
  ServiceType,
  BookingStatus,
} from "../types/service";

interface ServiceState {
  // 업체 관리
  providers: ServiceProvider[];
  addProvider: (provider: Omit<ServiceProvider, "id" | "createdAt">) => void;
  updateProvider: (id: string, provider: Partial<ServiceProvider>) => void;
  deleteProvider: (id: string) => void;
  getProviderById: (id: string) => ServiceProvider | undefined;
  getProvidersByType: (type: ServiceType) => ServiceProvider[];

  // 예약 관리
  bookings: ServiceBooking[];
  createBooking: (
    booking: Omit<ServiceBooking, "id" | "createdAt">,
  ) => ServiceBooking;
  updateBooking: (id: string, booking: Partial<ServiceBooking>) => void;
  cancelBooking: (id: string) => void;
  completeBooking: (id: string) => void; // 예약 완료 처리
  getBookingById: (id: string) => ServiceBooking | undefined;
  getBookingsByPet: (petId: string) => ServiceBooking[];
  getBookingsByProvider: (providerId: string) => ServiceBooking[]; // 업체별 예약 조회
  getUpcomingBookings: () => ServiceBooking[];
  getCompletedBookings: (providerId: string) => ServiceBooking[]; // 완료된 예약 조회

  // 코멘트 관리
  comments: ProviderComment[];
  addComment: (comment: Omit<ProviderComment, "id" | "createdAt">) => void;
  getCommentsByPet: (petId: string) => ProviderComment[];
  getCommentsByProvider: (providerId: string) => ProviderComment[];
  getCommentsByBooking: (bookingId: string) => ProviderComment | undefined; // 예약별 코멘트
  getRecentComments: (limit?: number) => ProviderComment[];
}

export const useServiceStore = create<ServiceState>()(
  persist(
    (set, get) => ({
      // 초기 업체 데이터
      providers: [
        {
          id: "1",
          name: "행복 애견 호텔",
          type: "hotel",
          description:
            "24시간 CCTV 모니터링, 넓은 실내외 놀이터가 있는 프리미엄 애견 호텔입니다. 경력 10년 이상의 전문 관리사가 상주하며 안전하고 쾌적한 환경을 제공합니다.",
          address: "서울시 강남구 테헤란로 123",
          phone: "02-1234-5678",
          hours: "24시간 운영",
          rating: 4.8,
          reviewCount: 128,
          images: [
            "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop",
          ], // 실제 이미지
          services: [
            "1박 2일",
            "장기 위탁",
            "실내 놀이터",
            "목욕 서비스",
            "CCTV 실시간 확인",
          ],
          priceRange: "₩30,000 ~ ₩50,000",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "프로 도그 트레이닝",
          type: "training",
          description:
            "반려견 행동 교정 및 복종 훈련 전문 센터입니다. 1:1 맞춤 훈련으로 문제 행동을 개선하고 기본 예절을 가르칩니다.",
          address: "서울시 송파구 올림픽로 456",
          phone: "02-2345-6789",
          hours: "월-금 09:00-18:00",
          rating: 4.9,
          reviewCount: 95,
          images: [
            "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop",
          ],
          services: [
            "기본 복종 훈련",
            "문제 행동 교정",
            "사회성 훈련",
            "1:1 개인 레슨",
          ],
          priceRange: "₩50,000 ~ ₩100,000",
          createdAt: new Date().toISOString(),
        },
        {
          id: "3",
          name: "러블리 펫 미용실",
          type: "grooming",
          description:
            "프리미엄 펫 미용 전문점입니다. 품종별 맞춤 스타일링과 피부 케어를 제공하며, 100% 천연 샴푸를 사용합니다.",
          address: "서울시 마포구 월드컵로 789",
          phone: "02-3456-7890",
          hours: "월-토 10:00-20:00",
          rating: 4.7,
          reviewCount: 203,
          images: [
            "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400&h=300&fit=crop",
          ],
          services: [
            "전체 미용",
            "부분 미용",
            "목욕+드라이",
            "스파 케어",
            "발톱 관리",
          ],
          priceRange: "₩25,000 ~ ₩80,000",
          createdAt: new Date().toISOString(),
        },
        {
          id: "4",
          name: "사랑 동물병원",
          type: "hospital",
          description:
            "24시간 응급 진료 가능한 종합 동물병원입니다. 최신 의료 장비와 경험 많은 수의사가 여러분의 반려동물을 돌봅니다.",
          address: "서울시 서초구 반포대로 321",
          phone: "02-4567-8901",
          hours: "24시간 응급 진료",
          rating: 4.9,
          reviewCount: 156,
          images: [
            "https://images.unsplash.com/photo-1530041539828-114de669390e?w=400&h=300&fit=crop",
          ],
          services: ["건강검진", "예방접종", "수술", "응급진료", "입원 치료"],
          priceRange: "₩20,000 ~ ₩500,000",
          createdAt: new Date().toISOString(),
        },
      ],

      // 업체 추가
      addProvider: (providerData) => {
        const newProvider: ServiceProvider = {
          ...providerData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ providers: [...state.providers, newProvider] }));
      },

      // 업체 수정
      updateProvider: (id, providerData) => {
        set((state) => ({
          providers: state.providers.map((provider) =>
            provider.id === id ? { ...provider, ...providerData } : provider,
          ),
        }));
      },

      // 업체 삭제
      deleteProvider: (id) => {
        set((state) => ({
          providers: state.providers.filter((provider) => provider.id !== id),
        }));
      },

      // 업체 조회
      getProviderById: (id) => {
        return get().providers.find((provider) => provider.id === id);
      },

      // 타입별 업체 조회
      getProvidersByType: (type) => {
        return get().providers.filter((provider) => provider.type === type);
      },

      // 예약 관리
      bookings: [],

      // 예약 생성 (생성된 booking 반환 - Calendar 연동용)
      createBooking: (bookingData) => {
        const newBooking: ServiceBooking = {
          ...bookingData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ bookings: [...state.bookings, newBooking] }));
        return newBooking;
      },

      // 예약 수정
      updateBooking: (id, bookingData) => {
        set((state) => ({
          bookings: state.bookings.map((booking) =>
            booking.id === id ? { ...booking, ...bookingData } : booking,
          ),
        }));
      },

      // 예약 취소
      cancelBooking: (id) => {
        set((state) => ({
          bookings: state.bookings.map((booking) =>
            booking.id === id
              ? { ...booking, status: "cancelled" as BookingStatus }
              : booking,
          ),
        }));
      },

      // 예약 완료 처리
      completeBooking: (id) => {
        set((state) => ({
          bookings: state.bookings.map((booking) =>
            booking.id === id
              ? { ...booking, status: "completed" as BookingStatus }
              : booking,
          ),
        }));
      },

      // 예약 ID로 조회
      getBookingById: (id) => {
        return get().bookings.find((booking) => booking.id === id);
      },

      // 반려견별 예약 조회
      getBookingsByPet: (petId) => {
        return get().bookings.filter((booking) => booking.petId === petId);
      },

      // 업체별 예약 조회
      getBookingsByProvider: (providerId) => {
        return get().bookings.filter(
          (booking) => booking.providerId === providerId,
        );
      },

      // 다가오는 예약 조회
      getUpcomingBookings: () => {
        const now = new Date();
        return get()
          .bookings.filter(
            (booking) =>
              new Date(booking.startDate) >= now &&
              booking.status !== "cancelled" &&
              booking.status !== "completed",
          )
          .sort(
            (a, b) =>
              new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
          );
      },

      // 완료된 예약 조회 (업체별)
      getCompletedBookings: (providerId) => {
        return get()
          .bookings.filter(
            (booking) =>
              booking.providerId === providerId &&
              booking.status === "completed",
          )
          .sort(
            (a, b) =>
              new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
          );
      },

      // 코멘트 관리
      comments: [],

      // 코멘트 추가
      addComment: (commentData) => {
        const newComment: ProviderComment = {
          ...commentData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ comments: [...state.comments, newComment] }));
      },

      // 반려견별 코멘트 조회
      getCommentsByPet: (petId) => {
        return get()
          .comments.filter((comment) => comment.petId === petId)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
      },

      // 업체별 코멘트 조회
      getCommentsByProvider: (providerId) => {
        return get()
          .comments.filter((comment) => comment.providerId === providerId)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
      },

      // 예약별 코멘트 조회 (하나의 예약에 하나의 코멘트)
      getCommentsByBooking: (bookingId) => {
        return get().comments.find(
          (comment) => comment.bookingId === bookingId,
        );
      },

      // 최근 코멘트 조회
      getRecentComments: (limit = 5) => {
        return get()
          .comments.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .slice(0, limit);
      },
    }),
    {
      name: "service-storage",
    },
  ),
);
