import { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  isBefore,
  startOfDay,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { AvailabilityResponse } from '../../types/booking';

// ============================================
// BookingDatePicker Component
// ============================================

interface BookingDatePickerProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  availability?: AvailabilityResponse[];
  minDate?: Date;
  maxDate?: Date;
  isLoading?: boolean;
}

export default function BookingDatePicker({
  selectedDate,
  onSelectDate,
  availability = [],
  minDate = new Date(),
  maxDate,
  isLoading = false,
}: BookingDatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 캘린더 날짜 배열 생성
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    // 시작일 앞에 빈 칸 추가 (일요일 기준)
    const startDay = start.getDay();
    const paddingBefore = Array(startDay).fill(null);

    return [...paddingBefore, ...days];
  }, [currentMonth]);

  // 날짜별 예약 가능 여부 매핑
  const availabilityMap = useMemo(() => {
    const map: Record<string, AvailabilityResponse> = {};
    availability.forEach((a) => {
      map[a.date] = a;
    });
    return map;
  }, [availability]);

  const goToPrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const isDateSelectable = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const today = startOfDay(new Date());
    
    // 과거 날짜 불가
    if (isBefore(date, today)) return false;
    
    // 최소/최대 날짜 체크
    if (minDate && isBefore(date, startOfDay(minDate))) return false;
    if (maxDate && isBefore(startOfDay(maxDate), date)) return false;
    
    // 가용성 데이터가 있으면 확인
    const avail = availabilityMap[dateStr];
    if (avail && !avail.isAvailable) return false;
    
    return true;
  };

  const getDateStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const avail = availabilityMap[dateStr];
    
    if (avail) {
      if (!avail.isAvailable) return 'unavailable';
      if (avail.remainingSlots <= 2) return 'limited';
    }
    
    return 'available';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {format(currentMonth, 'yyyy년 M월', { locale: ko })}
        </h3>
        
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Weekday Header */}
      <div className="grid grid-cols-7 mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
          <div
            key={day}
            className={`py-2 text-center text-xs font-medium ${
              idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="aspect-square" />;
          }

          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const selectable = isDateSelectable(day);
          const status = getDateStatus(day);
          const dayOfWeek = day.getDay();

          return (
            <button
              key={day.toISOString()}
              onClick={() => selectable && onSelectDate(day)}
              disabled={!selectable || isLoading}
              className={`
                aspect-square rounded-xl flex flex-col items-center justify-center
                text-sm font-medium transition-all duration-200
                ${!isCurrentMonth ? 'opacity-30' : ''}
                ${isSelected 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                  : selectable
                    ? 'hover:bg-gray-100 dark:hover:bg-slate-700'
                    : 'opacity-40 cursor-not-allowed'
                }
                ${!isSelected && isToday(day) ? 'ring-2 ring-orange-300 dark:ring-orange-600' : ''}
                ${!isSelected && dayOfWeek === 0 ? 'text-red-500' : ''}
                ${!isSelected && dayOfWeek === 6 ? 'text-blue-500' : ''}
                ${!isSelected && dayOfWeek !== 0 && dayOfWeek !== 6 ? 'text-gray-700 dark:text-gray-200' : ''}
              `}
            >
              <span>{format(day, 'd')}</span>
              
              {/* Availability Indicator */}
              {selectable && status !== 'unavailable' && !isSelected && (
                <span className={`
                  w-1.5 h-1.5 rounded-full mt-0.5
                  ${status === 'limited' ? 'bg-orange-400' : 'bg-green-400'}
                `} />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span>예약 가능</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-400" />
          <span>잔여 적음</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
          <span>마감</span>
        </div>
      </div>
    </div>
  );
}
