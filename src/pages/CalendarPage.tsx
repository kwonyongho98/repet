import { useState, useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Button,
  Badge,
  Modal,
  Input,
  Select,
  TextArea,
  BottomSheet,
} from "../components/common";
import type { EventType } from "../types/calendar";
import { usePetStore } from "../stores/usePetStore";
import { useCalendarStore } from "../stores/useCalendarStore";
import { useDailyLogStore } from "../stores/useDailyLogStore";
import "react-big-calendar/lib/css/react-big-calendar.css";
import type { CalendarEvent } from "../types/calendar";
import {
  PawPrint,
  Utensils,
  Circle,
  Pill,
  AlertCircle,
  Scale,
  Wallet,
} from "lucide-react";
import {
  satisfactionLabels,
  mealTypeLabels,
  foodTypeLabels,
  bowelTypeLabels,
  bowelConditionLabels,
  expenseCategoryLabels,
} from "../types/dailyLog";

const locales = {
  ko: ko,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const eventTypeLabels: Record<string, string> = {
  health: "병원",
  grooming: "미용",
  training: "훈련",
  hotel: "호텔",
  hospital: "동물병원",
  other: "기타",
};

export default function CalendarPage() {
  // Store에서 데이터 가져오기
  const pets = usePetStore((state) => state.pets);
  const events = useCalendarStore((state) => state.events);
  const addEvent = useCalendarStore((state) => state.addEvent);
  const updateEvent = useCalendarStore((state) => state.updateEvent);
  const deleteEvent = useCalendarStore((state) => state.deleteEvent);

  // Daily Log Store
  const walks = useDailyLogStore((state) => state.walks);
  const meals = useDailyLogStore((state) => state.meals);
  const bowels = useDailyLogStore((state) => state.bowels);
  const weights = useDailyLogStore((state) => state.weights);
  const expenses = useDailyLogStore((state) => state.expenses);
  const getLogsByDate = useDailyLogStore((state) => state.getLogsByDate);

  const [selectedPet, setSelectedPet] = useState<string | "all">("all");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLogDetailOpen, setIsLogDetailOpen] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: "",
    petId: "",
    type: "health" as EventType,
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    serviceProvider: "",
    description: "",
  });

  // 필터링된 이벤트
  const filteredEvents = useMemo(() => {
    if (selectedPet === "all") return events;
    return events.filter((event) => event.petId === selectedPet);
  }, [events, selectedPet]);

  // 날짜별 로그 요약 데이터 생성
  const logsByDate = useMemo(() => {
    const logsMap: Record<
      string,
      {
        hasWalk: boolean;
        hasMeal: boolean;
        hasMeds: boolean;
        hasBowel: boolean;
        hasBadBowel: boolean;
        hasWeight: boolean;
        hasExpense: boolean;
      }
    > = {};

    // 산책 로그
    walks.forEach((w) => {
      if (selectedPet !== "all" && w.petId !== selectedPet) return;
      if (!logsMap[w.date]) {
        logsMap[w.date] = {
          hasWalk: false,
          hasMeal: false,
          hasMeds: false,
          hasBowel: false,
          hasBadBowel: false,
          hasWeight: false,
          hasExpense: false,
        };
      }
      logsMap[w.date].hasWalk = true;
    });

    // 식사 로그
    meals.forEach((m) => {
      if (selectedPet !== "all" && m.petId !== selectedPet) return;
      if (!logsMap[m.date]) {
        logsMap[m.date] = {
          hasWalk: false,
          hasMeal: false,
          hasMeds: false,
          hasBowel: false,
          hasBadBowel: false,
          hasWeight: false,
          hasExpense: false,
        };
      }
      logsMap[m.date].hasMeal = true;
      if (m.medsTaken) logsMap[m.date].hasMeds = true;
    });

    // 배변 로그
    bowels.forEach((b) => {
      if (selectedPet !== "all" && b.petId !== selectedPet) return;
      if (!logsMap[b.date]) {
        logsMap[b.date] = {
          hasWalk: false,
          hasMeal: false,
          hasMeds: false,
          hasBowel: false,
          hasBadBowel: false,
          hasWeight: false,
          hasExpense: false,
        };
      }
      logsMap[b.date].hasBowel = true;
      if (b.condition !== "good") logsMap[b.date].hasBadBowel = true;
    });

    // 체중 로그
    weights.forEach((w) => {
      if (selectedPet !== "all" && w.petId !== selectedPet) return;
      if (!logsMap[w.date]) {
        logsMap[w.date] = {
          hasWalk: false,
          hasMeal: false,
          hasMeds: false,
          hasBowel: false,
          hasBadBowel: false,
          hasWeight: false,
          hasExpense: false,
        };
      }
      logsMap[w.date].hasWeight = true;
    });

    // 지출 로그
    expenses.forEach((e) => {
      if (selectedPet !== "all" && e.petId !== selectedPet) return;
      if (!logsMap[e.date]) {
        logsMap[e.date] = {
          hasWalk: false,
          hasMeal: false,
          hasMeds: false,
          hasBowel: false,
          hasBadBowel: false,
          hasWeight: false,
          hasExpense: false,
        };
      }
      logsMap[e.date].hasExpense = true;
    });

    return logsMap;
  }, [walks, meals, bowels, weights, expenses, selectedPet]);

  // 이벤트 스타일
  const eventStyleGetter = (event: CalendarEvent) => {
    const pet = pets.find((p) => p.id === event.petId);
    return {
      style: {
        backgroundColor: pet?.color || "#3B82F6",
        borderRadius: "4px",
        opacity: 0.9,
        color: "white",
        border: "none",
        display: "block",
        fontSize: "11px",
        padding: "2px 4px",
      },
    };
  };

  // 일정 추가 핸들러
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();

    const startDateTime = new Date(`${newEvent.date}T${newEvent.startTime}`);
    const endDateTime = new Date(`${newEvent.date}T${newEvent.endTime}`);

    const pet = pets.find((p) => p.id === newEvent.petId);

    addEvent({
      title: newEvent.title,
      start: startDateTime,
      end: endDateTime,
      type: newEvent.type,
      petId: newEvent.petId,
      petName: pet?.name || "",
      description: newEvent.description,
      location: newEvent.location,
      serviceProvider: newEvent.serviceProvider,
    });

    setIsAddModalOpen(false);
    resetForm();
  };

  // 일정 수정 핸들러
  const handleEditEvent = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingEvent) return;

    const startDateTime = new Date(`${newEvent.date}T${newEvent.startTime}`);
    const endDateTime = new Date(`${newEvent.date}T${newEvent.endTime}`);

    const pet = pets.find((p) => p.id === newEvent.petId);

    updateEvent(editingEvent.id, {
      title: newEvent.title,
      start: startDateTime,
      end: endDateTime,
      type: newEvent.type,
      petId: newEvent.petId,
      petName: pet?.name || "",
      description: newEvent.description,
      location: newEvent.location,
      serviceProvider: newEvent.serviceProvider,
    });

    setIsEditModalOpen(false);
    setEditingEvent(null);
    setSelectedEvent(null);
    resetForm();
  };

  // 일정 삭제 핸들러
  const handleDeleteEvent = () => {
    if (!editingEvent) return;

    deleteEvent(editingEvent.id);
    setIsDeleteModalOpen(false);
    setEditingEvent(null);
    setSelectedEvent(null);
  };

  // 수정 모달 열기
  const openEditModal = (event: CalendarEvent) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      petId: event.petId,
      type: event.type,
      date: format(event.start, "yyyy-MM-dd"),
      startTime: format(event.start, "HH:mm"),
      endTime: format(event.end, "HH:mm"),
      location: event.location || "",
      serviceProvider: event.serviceProvider || "",
      description: event.description || "",
    });
    setIsEditModalOpen(true);
  };

  // 삭제 모달 열기
  const openDeleteModal = (event: CalendarEvent) => {
    setEditingEvent(event);
    setIsDeleteModalOpen(true);
  };

  // 폼 초기화
  const resetForm = () => {
    setNewEvent({
      title: "",
      petId: "",
      type: "health",
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      serviceProvider: "",
      description: "",
    });
  };

  // 날짜 선택 시 (캘린더 클릭) - 일정 추가 모달 열기
  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    const clickedDate = format(slotInfo.start, "yyyy-MM-dd");

    // 해당 날짜에 로그가 있으면 로그 상세 보기
    if (logsByDate[clickedDate]) {
      setSelectedDate(clickedDate);
      setIsLogDetailOpen(true);
    } else {
      // 로그가 없으면 일정 추가 모달
      setNewEvent({
        ...newEvent,
        date: clickedDate,
        startTime: "10:00",
        endTime: "11:00",
        petId: pets[0]?.id || "",
      });
      setIsAddModalOpen(true);
    }
  };

  // 커스텀 날짜 셀 컴포넌트
  const CustomDateCellWrapper = ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: Date;
  }) => {
    const dateStr = format(value, "yyyy-MM-dd");
    const logs = logsByDate[dateStr];

    return (
      <div className="rbc-day-bg relative">
        {children}
        {logs && (
          <div className="absolute bottom-1 left-1 flex gap-0.5 flex-wrap">
            {logs.hasWalk && (
              <div
                className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"
                title="산책"
              >
                <PawPrint size={10} className="text-white" />
              </div>
            )}
            {logs.hasMeal && (
              <div
                className="relative"
                title={logs.hasMeds ? "식사 + 약 복용" : "식사"}
              >
                <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
                  <Utensils size={10} className="text-white" />
                </div>
                {logs.hasMeds && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-blue-500 flex items-center justify-center">
                    <Pill size={6} className="text-white" />
                  </div>
                )}
              </div>
            )}
            {logs.hasBowel && (
              <div
                className="relative"
                title={logs.hasBadBowel ? "배변 (상태 이상)" : "배변"}
              >
                <div className="w-4 h-4 rounded-full bg-amber-600 flex items-center justify-center">
                  <Circle size={10} className="text-white fill-white" />
                </div>
                {logs.hasBadBowel && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 flex items-center justify-center">
                    <AlertCircle size={6} className="text-white" />
                  </div>
                )}
              </div>
            )}
            {logs.hasWeight && (
              <div
                className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center"
                title="체중"
              >
                <Scale size={10} className="text-white" />
              </div>
            )}
            {logs.hasExpense && (
              <div
                className="w-4 h-4 rounded-full bg-pink-500 flex items-center justify-center"
                title="지출"
              >
                <Wallet size={10} className="text-white" />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // 선택된 날짜의 로그 데이터
  const selectedDateLogs = selectedDate ? getLogsByDate(selectedDate) : null;

  return (
    <div className="h-full flex flex-col">
      {/* 헤더: 제목 + 펫 필터 (한 줄로 배치) */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-6">
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--color-secondary-900)" }}
          >
            일정 관리
          </h1>

          {/* 펫 필터 - 제목 바로 옆 */}
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedPet === "all"
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setSelectedPet("all")}
            >
              전체
            </button>
            {pets.map((pet) => (
              <button
                key={pet.id}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                  selectedPet === pet.id
                    ? "bg-orange-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                onClick={() => setSelectedPet(pet.id)}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      selectedPet === pet.id ? "white" : pet.color,
                  }}
                />
                {pet.name}
              </button>
            ))}
          </div>
        </div>

        {/* 범례 */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>산책</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>식사</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-amber-600" />
            <span>배변</span>
          </div>
        </div>
      </div>

      {/* Full-height 캘린더 */}
      <div
        className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-4"
        style={{ minHeight: "calc(100vh - 180px)" }}
      >
        <style>{`
          .rbc-calendar {
            height: 100% !important;
          }
          .rbc-month-view {
            border: none !important;
            height: 100% !important;
          }
          .rbc-month-row {
            min-height: 100px !important;
            flex: 1 !important;
          }
          .rbc-header {
            padding: 12px 8px !important;
            font-weight: 600 !important;
            color: #1e3a5f !important;
            background: #f8fafc !important;
            border-bottom: 2px solid #e2e8f0 !important;
          }
          .rbc-date-cell {
            padding: 8px !important;
            text-align: right !important;
          }
          .rbc-date-cell > a {
            font-weight: 500 !important;
            color: #374151 !important;
          }
          .rbc-today {
            background-color: #fff7ed !important;
          }
          .rbc-today .rbc-date-cell > a {
            color: #ea580c !important;
            font-weight: 700 !important;
          }
          .rbc-off-range-bg {
            background-color: #f9fafb !important;
          }
          .rbc-event {
            padding: 2px 6px !important;
            margin: 1px 2px !important;
            font-size: 11px !important;
            border-radius: 4px !important;
          }
          .rbc-event-content {
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
          .rbc-show-more {
            color: #f97316 !important;
            font-weight: 600 !important;
            font-size: 11px !important;
            margin-top: 2px !important;
          }
          .rbc-toolbar {
            margin-bottom: 16px !important;
            padding-bottom: 16px !important;
            border-bottom: 1px solid #e5e7eb !important;
          }
          .rbc-toolbar button {
            color: #374151 !important;
            border: 1px solid #d1d5db !important;
            padding: 8px 16px !important;
            border-radius: 8px !important;
            font-weight: 500 !important;
          }
          .rbc-toolbar button:hover {
            background-color: #f3f4f6 !important;
          }
          .rbc-toolbar button.rbc-active {
            background-color: #f97316 !important;
            color: white !important;
            border-color: #f97316 !important;
          }
          .rbc-toolbar-label {
            font-size: 1.25rem !important;
            font-weight: 700 !important;
            color: #1e3a5f !important;
          }
          .rbc-row-segment {
            padding: 0 2px !important;
          }
          .rbc-day-bg {
            position: relative !important;
          }
        `}</style>

        <Calendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={(event) => setSelectedEvent(event)}
          selectable
          onSelectSlot={handleSelectSlot}
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          view="month"
          views={["month"]}
          messages={{
            next: "다음",
            previous: "이전",
            today: "오늘",
            month: "월",
            noEventsInRange: "일정이 없습니다.",
            showMore: (total) => `+${total}개 더보기`,
          }}
          popup
          popupOffset={{ x: 0, y: 0 }}
          components={{
            dateCellWrapper: CustomDateCellWrapper,
          }}
        />
      </div>

      {/* 날짜별 로그 상세 Bottom Sheet */}
      <BottomSheet
        isOpen={isLogDetailOpen}
        onClose={() => {
          setIsLogDetailOpen(false);
          setSelectedDate(null);
        }}
        title={
          selectedDate
            ? `📅 ${format(new Date(selectedDate), "M월 d일 (E)", { locale: ko })} 기록`
            : "기록"
        }
      >
        {selectedDateLogs && (
          <div className="space-y-4">
            {/* 산책 기록 */}
            {selectedDateLogs.walks.length > 0 && (
              <div>
                <h3 className="font-bold text-green-700 flex items-center gap-2 mb-2">
                  <PawPrint size={18} /> 산책 ({selectedDateLogs.walks.length}
                  회)
                </h3>
                <div className="space-y-2">
                  {selectedDateLogs.walks.map((walk) => (
                    <div key={walk.id} className="p-3 bg-green-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{walk.petName}</p>
                          <p className="text-sm text-gray-600">
                            {walk.startTime} ~ {walk.endTime} ({walk.duration}
                            분)
                          </p>
                          {walk.distance && (
                            <p className="text-sm text-gray-600">
                              거리: {walk.distance}
                              {walk.distanceUnit}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant={
                            walk.satisfaction === "good"
                              ? "success"
                              : walk.satisfaction === "normal"
                                ? "warning"
                                : "danger"
                          }
                        >
                          {satisfactionLabels[walk.satisfaction]}
                        </Badge>
                      </div>
                      {walk.notes && (
                        <p className="text-sm text-gray-500 mt-2">
                          {walk.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 식사 기록 */}
            {selectedDateLogs.meals.length > 0 && (
              <div>
                <h3 className="font-bold text-orange-700 flex items-center gap-2 mb-2">
                  <Utensils size={18} /> 식사 ({selectedDateLogs.meals.length}
                  회)
                </h3>
                <div className="space-y-2">
                  {selectedDateLogs.meals.map((meal) => (
                    <div key={meal.id} className="p-3 bg-orange-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{meal.petName}</p>
                          <p className="text-sm text-gray-600">
                            {meal.time} · {mealTypeLabels[meal.mealType]} ·{" "}
                            {foodTypeLabels[meal.foodType]}
                          </p>
                          <p className="text-sm text-gray-600">
                            {meal.amount}g{" "}
                            {meal.foodName && `(${meal.foodName})`}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Badge variant="info">
                            {mealTypeLabels[meal.mealType]}
                          </Badge>
                          {meal.medsTaken && (
                            <Badge variant="primary">💊 약</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 배변 기록 */}
            {selectedDateLogs.bowels.length > 0 && (
              <div>
                <h3 className="font-bold text-amber-700 flex items-center gap-2 mb-2">
                  <Circle size={18} className="fill-amber-700" /> 배변 (
                  {selectedDateLogs.bowels.length}회)
                </h3>
                <div className="space-y-2">
                  {selectedDateLogs.bowels.map((bowel) => (
                    <div key={bowel.id} className="p-3 bg-amber-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{bowel.petName}</p>
                          <p className="text-sm text-gray-600">
                            {bowel.time} · {bowelTypeLabels[bowel.bowelType]}
                          </p>
                        </div>
                        <Badge
                          variant={
                            bowel.condition === "good" ? "success" : "danger"
                          }
                        >
                          {bowelConditionLabels[bowel.condition]}
                          {bowel.condition !== "good" && " ⚠️"}
                        </Badge>
                      </div>
                      {bowel.notes && (
                        <p className="text-sm text-gray-500 mt-2">
                          {bowel.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 체중 기록 */}
            {selectedDateLogs.weights.length > 0 && (
              <div>
                <h3 className="font-bold text-purple-700 flex items-center gap-2 mb-2">
                  <Scale size={18} /> 체중
                </h3>
                <div className="space-y-2">
                  {selectedDateLogs.weights.map((weight) => (
                    <div
                      key={weight.id}
                      className="p-3 bg-purple-50 rounded-lg"
                    >
                      <div className="flex justify-between items-center">
                        <p className="font-medium">{weight.petName}</p>
                        <p className="text-xl font-bold text-purple-700">
                          {weight.weight}kg
                        </p>
                      </div>
                      {weight.notes && (
                        <p className="text-sm text-gray-500 mt-1">
                          {weight.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 지출 기록 */}
            {selectedDateLogs.expenses.length > 0 && (
              <div>
                <h3 className="font-bold text-pink-700 flex items-center gap-2 mb-2">
                  <Wallet size={18} /> 지출
                </h3>
                <div className="space-y-2">
                  {selectedDateLogs.expenses.map((expense) => (
                    <div key={expense.id} className="p-3 bg-pink-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{expense.description}</p>
                          <p className="text-sm text-gray-600">
                            {expense.petName} ·{" "}
                            {expenseCategoryLabels[expense.category]}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-pink-700">
                          ₩{expense.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="p-2 bg-pink-100 rounded-lg text-right">
                    <span className="text-sm text-gray-600">총 지출: </span>
                    <span className="font-bold text-pink-700">
                      ₩
                      {selectedDateLogs.expenses
                        .reduce((sum, e) => sum + e.amount, 0)
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 일정 추가 버튼 */}
            <Button
              variant="primary"
              className="w-full"
              onClick={() => {
                setIsLogDetailOpen(false);
                setNewEvent({
                  ...newEvent,
                  date: selectedDate || "",
                  startTime: "10:00",
                  endTime: "11:00",
                  petId: pets[0]?.id || "",
                });
                setIsAddModalOpen(true);
              }}
            >
              + 이 날짜에 일정 추가
            </Button>
          </div>
        )}
      </BottomSheet>

      {/* 이벤트 상세 모달 (선택 시) */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title="일정 상세"
        maxWidth="md"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-12 rounded"
                style={{
                  backgroundColor:
                    pets.find((p) => p.id === selectedEvent.petId)?.color ||
                    "#3B82F6",
                }}
              />
              <div>
                <h3 className="text-xl font-bold">{selectedEvent.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="primary">
                    {eventTypeLabels[selectedEvent.type]}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {selectedEvent.petName}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500 w-16">날짜</span>
                <span className="font-medium">
                  {format(selectedEvent.start, "yyyy년 M월 d일 (E)", {
                    locale: ko,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500 w-16">시간</span>
                <span className="font-medium">
                  {format(selectedEvent.start, "HH:mm")} -{" "}
                  {format(selectedEvent.end, "HH:mm")}
                </span>
              </div>
              {selectedEvent.location && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 w-16">장소</span>
                  <span className="font-medium">{selectedEvent.location}</span>
                </div>
              )}
              {selectedEvent.serviceProvider && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 w-16">담당</span>
                  <span className="font-medium">
                    {selectedEvent.serviceProvider}
                  </span>
                </div>
              )}
            </div>

            {selectedEvent.description && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">메모</p>
                <p className="text-gray-700">{selectedEvent.description}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedEvent(null)}
              >
                닫기
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  setSelectedEvent(null);
                  openEditModal(selectedEvent);
                }}
              >
                수정
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setSelectedEvent(null);
                  openDeleteModal(selectedEvent);
                }}
              >
                삭제
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 일정 추가 모달 */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title="새 일정 추가"
        maxWidth="lg"
      >
        <form onSubmit={handleAddEvent} className="space-y-4">
          <Input
            label="일정 제목"
            placeholder="예: 멍멍이 건강검진"
            value={newEvent.title}
            onChange={(e) =>
              setNewEvent({ ...newEvent, title: e.target.value })
            }
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="반려견"
              value={newEvent.petId}
              onChange={(e) =>
                setNewEvent({ ...newEvent, petId: e.target.value })
              }
              options={[
                { value: "", label: "선택하세요" },
                ...pets.map((pet) => ({ value: pet.id, label: pet.name })),
              ]}
              required
            />

            <Select
              label="일정 타입"
              value={newEvent.type}
              onChange={(e) =>
                setNewEvent({ ...newEvent, type: e.target.value as EventType })
              }
              options={[
                { value: "health", label: "병원" },
                { value: "grooming", label: "미용" },
                { value: "training", label: "훈련" },
                { value: "hotel", label: "호텔" },
                { value: "hospital", label: "동물병원" },
                { value: "other", label: "기타" },
              ]}
              required
            />
          </div>

          <Input
            label="날짜"
            type="date"
            value={newEvent.date}
            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="시작 시간"
              type="time"
              value={newEvent.startTime}
              onChange={(e) =>
                setNewEvent({ ...newEvent, startTime: e.target.value })
              }
              required
            />

            <Input
              label="종료 시간"
              type="time"
              value={newEvent.endTime}
              onChange={(e) =>
                setNewEvent({ ...newEvent, endTime: e.target.value })
              }
              required
            />
          </div>

          <Input
            label="장소"
            placeholder="예: 행복 동물병원"
            value={newEvent.location}
            onChange={(e) =>
              setNewEvent({ ...newEvent, location: e.target.value })
            }
          />

          <Input
            label="담당자/업체명"
            placeholder="예: 김수의 원장님"
            value={newEvent.serviceProvider}
            onChange={(e) =>
              setNewEvent({ ...newEvent, serviceProvider: e.target.value })
            }
          />

          <TextArea
            label="메모"
            placeholder="추가 메모사항을 입력하세요"
            rows={3}
            value={newEvent.description}
            onChange={(e) =>
              setNewEvent({ ...newEvent, description: e.target.value })
            }
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setIsAddModalOpen(false);
                resetForm();
              }}
            >
              취소
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              일정 추가
            </Button>
          </div>
        </form>
      </Modal>

      {/* 일정 수정 모달 */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingEvent(null);
          resetForm();
        }}
        title="일정 수정"
        maxWidth="lg"
      >
        <form onSubmit={handleEditEvent} className="space-y-4">
          <Input
            label="일정 제목"
            placeholder="예: 멍멍이 건강검진"
            value={newEvent.title}
            onChange={(e) =>
              setNewEvent({ ...newEvent, title: e.target.value })
            }
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="반려견"
              value={newEvent.petId}
              onChange={(e) =>
                setNewEvent({ ...newEvent, petId: e.target.value })
              }
              options={[
                { value: "", label: "선택하세요" },
                ...pets.map((pet) => ({ value: pet.id, label: pet.name })),
              ]}
              required
            />

            <Select
              label="일정 타입"
              value={newEvent.type}
              onChange={(e) =>
                setNewEvent({ ...newEvent, type: e.target.value as EventType })
              }
              options={[
                { value: "health", label: "병원" },
                { value: "grooming", label: "미용" },
                { value: "training", label: "훈련" },
                { value: "hotel", label: "호텔" },
                { value: "hospital", label: "동물병원" },
                { value: "other", label: "기타" },
              ]}
              required
            />
          </div>

          <Input
            label="날짜"
            type="date"
            value={newEvent.date}
            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="시작 시간"
              type="time"
              value={newEvent.startTime}
              onChange={(e) =>
                setNewEvent({ ...newEvent, startTime: e.target.value })
              }
              required
            />

            <Input
              label="종료 시간"
              type="time"
              value={newEvent.endTime}
              onChange={(e) =>
                setNewEvent({ ...newEvent, endTime: e.target.value })
              }
              required
            />
          </div>

          <Input
            label="장소"
            placeholder="예: 행복 동물병원"
            value={newEvent.location}
            onChange={(e) =>
              setNewEvent({ ...newEvent, location: e.target.value })
            }
          />

          <Input
            label="담당자/업체명"
            placeholder="예: 김수의 원장님"
            value={newEvent.serviceProvider}
            onChange={(e) =>
              setNewEvent({ ...newEvent, serviceProvider: e.target.value })
            }
          />

          <TextArea
            label="메모"
            placeholder="추가 메모사항을 입력하세요"
            rows={3}
            value={newEvent.description}
            onChange={(e) =>
              setNewEvent({ ...newEvent, description: e.target.value })
            }
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingEvent(null);
                resetForm();
              }}
            >
              취소
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              수정 완료
            </Button>
          </div>
        </form>
      </Modal>

      {/* 일정 삭제 확인 모달 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setEditingEvent(null);
        }}
        title="일정 삭제"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            정말로 <strong>"{editingEvent?.title}"</strong> 일정을
            삭제하시겠습니까?
          </p>
          <p className="text-sm text-red-600">
            삭제된 일정은 복구할 수 없습니다.
          </p>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setEditingEvent(null);
              }}
            >
              취소
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleDeleteEvent}
            >
              삭제
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
