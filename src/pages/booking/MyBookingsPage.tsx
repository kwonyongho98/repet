import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronDown, Inbox } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useBookingStore } from '../../stores/useBookingStore';
import { BookingCard, BookingCardSkeleton } from '../../components/booking';
import { Button } from '../../components/common';
import type { BookingStatus } from '../../types/booking';
import { BOOKING_STATUS_LABELS } from '../../types/booking';

// ============================================
// Filter Tabs
// ============================================
type FilterTab = 'all' | 'upcoming' | 'completed' | 'cancelled';

const FILTER_TABS: { id: FilterTab; label: string; statuses: BookingStatus[] }[] = [
  { id: 'all', label: '전체', statuses: [] },
  { id: 'upcoming', label: '예정', statuses: ['pending', 'confirmed'] },
  { id: 'completed', label: '완료', statuses: ['completed'] },
  { id: 'cancelled', label: '취소', statuses: ['cancelled', 'cancelled_by_provider', 'cancelled_by_customer', 'no_show'] },
];

// ============================================
// MyBookingsPage Component
// ============================================

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { bookings, isLoading, fetchMyBookings } = useBookingStore();
  
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  // 예약 목록 조회
  useEffect(() => {
    if (user?.familyId) {
      const filter = FILTER_TABS.find((t) => t.id === activeTab);
      fetchMyBookings(user.familyId, {
        status: filter?.statuses.length ? filter.statuses : undefined,
      });
    }
  }, [user?.familyId, activeTab, fetchMyBookings]);

  // 예약 상세로 이동
  const handleBookingClick = (bookingId: string) => {
    navigate(`/bookings/${bookingId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            내 예약
          </h1>
        </div>
        
        {/* Filter Tabs */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Loading State */}
        {isLoading && (
          <>
            <BookingCardSkeleton />
            <BookingCardSkeleton />
            <BookingCardSkeleton />
          </>
        )}

        {/* Empty State */}
        {!isLoading && bookings.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
              <Inbox size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
              예약 내역이 없습니다
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              반려동물 서비스를 예약해 보세요!
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/services')}
            >
              서비스 찾아보기
            </Button>
          </div>
        )}

        {/* Booking List */}
        {!isLoading && bookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onClick={() => handleBookingClick(booking.id)}
            showProvider={true}
            showPet={true}
          />
        ))}
      </div>
    </div>
  );
}
