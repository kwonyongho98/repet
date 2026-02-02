import { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  CalendarDays,
} from 'lucide-react';
import { useProviderStore } from '../../stores/useProviderStore';

export default function ProviderSchedulePage() {
  const connectedPets = useProviderStore((state) => state.connectedPets);
  const isLoading = useProviderStore((state) => state.isLoading);
  const fetchConnectedPets = useProviderStore((state) => state.fetchConnectedPets);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));

  useEffect(() => {
    fetchConnectedPets();
  }, [fetchConnectedPets]);

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handlePrevWeek = () => {
    setWeekStart(addDays(weekStart, -7));
  };

  const handleNextWeek = () => {
    setWeekStart(addDays(weekStart, 7));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  // Mock schedule data - in real app, this would come from bookings
  const todayPets = connectedPets || []; // 안전하게 빈 배열 처리

  return (
    <div className="min-h-full bg-gray-50 dark:bg-slate-900">
      {/* Calendar Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-blue-500" />
            일정 관리
          </h1>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {format(selectedDate, 'yyyy년 M월', { locale: ko })}
          </div>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handlePrevWeek}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {format(weekStart, 'M/d')} - {format(addDays(weekStart, 6), 'M/d')}
          </span>
          <button
            onClick={handleNextWeek}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Week Days */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day, index) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const dayOfWeek = format(day, 'EEE', { locale: ko });
            
            return (
              <button
                key={index}
                onClick={() => handleDateClick(day)}
                className={`
                  flex flex-col items-center py-2 rounded-xl transition-all
                  ${isSelected 
                    ? 'bg-blue-500 text-white' 
                    : isToday
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                  }
                `}
              >
                <span className={`text-xs ${isSelected ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                  {dayOfWeek}
                </span>
                <span className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {format(day, 'd')}
                </span>
                {/* Dot indicator for events */}
                <div className={`w-1 h-1 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Content */}
      <div className="p-4">
        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          {format(selectedDate, 'M월 d일 (EEEE)', { locale: ko })} 일정
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : todayPets.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl">
            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              이 날짜에 예정된 일정이 없습니다.
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              연결된 펫이 없거나 예약이 없습니다.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* All Day Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden">
              <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  오늘의 손님 ({todayPets.length}마리)
                </span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-slate-700">
                {todayPets.map((pet) => {
                  // 안전하게 이름 가져오기 (petName 또는 name)
                  const petName = pet.petName || pet.name || '이름없음';
                  const petBreed = pet.petBreed || pet.breed || '';
                  const familyName = pet.familyName || pet.family?.name || '';
                  const petImage = pet.petImage || pet.profileImage;
                  
                  return (
                    <div key={pet.connectionId || pet.petId || pet.id} className="p-4 flex items-center gap-4">
                      {/* Time */}
                      <div className="w-16 text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-400">
                          <Clock size={14} />
                          <span className="text-sm">종일</span>
                        </div>
                      </div>

                      {/* Pet Info */}
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                        style={{ backgroundColor: pet.color || '#6366f1' }}
                      >
                        {petImage ? (
                          <img
                            src={petImage}
                            alt={petName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          petName.charAt(0)
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {petName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {petBreed}{petBreed && familyName ? ' · ' : ''}{familyName}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        pet.hasTodayCareNote
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {pet.hasTodayCareNote ? '알림장 완료' : '알림장 미작성'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
