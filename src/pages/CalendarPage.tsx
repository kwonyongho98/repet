import { useState, useMemo, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ko } from "date-fns/locale";
import { Button, Modal, Input, Select, TextArea } from "../components/common";
import { FilterChips, filterEventsByType } from "../components/calendar";
import type { CalendarFilterType } from "../components/calendar";
import type { EventType, CalendarEvent } from "../types/calendar";
import { usePetStore } from "../stores/usePetStore";
import { useCalendarStore } from "../stores/useCalendarStore";
import { useDailyLogStore } from "../stores/useDailyLogStore";
import { useAuthStore } from "../stores/useAuthStore";
import type {
  WalkLog,
  MealLog,
  BowelLog,
  WeightLog,
  ExpenseLog,
} from "../types/dailyLog";
import {
  mealTypeLabels,
  foodTypeLabels,
  bowelTypeLabels,
  bowelConditionLabels,
  expenseCategoryLabels,
  satisfactionLabels,
  cuteMealTypeLabels,
  cuteBowelTypeLabels,
  cuteBowelConditionLabels,
  cuteSatisfactionLabels,
} from "../types/dailyLog";
import {
  PawPrint,
  Utensils,
  Circle,
  Scale,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Scissors,
  Stethoscope,
  GraduationCap,
  Hotel,
  Calendar,
  MoreHorizontal,
  Trash2,
  Edit3,
  Clock,
} from "lucide-react";

// ============================================
// Types
// ============================================
type CombinedEventType =
  | "walk"
  | "meal"
  | "bowel"
  | "weight"
  | "expense"
  | "health"
  | "grooming"
  | "training"
  | "hotel"
  | "hospital"
  | "other";

interface CombinedDailyItem {
  id: string;
  type: CombinedEventType;
  time: string; // HH:mm for sorting
  title: string;
  subtitle?: string;
  petName: string;
  color: string;
  originalData:
    | WalkLog
    | MealLog
    | BowelLog
    | WeightLog
    | ExpenseLog
    | CalendarEvent;
}

// ============================================
// Constants
// ============================================
const monthNames = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
];
const baseYear = new Date().getFullYear();
const yearRange = Array.from({ length: 11 }, (_, i) => baseYear - 5 + i);

const eventTypeLabels: Record<string, string> = {
  health: "병원",
  grooming: "미용",
  training: "훈련",
  hotel: "호텔",
  hospital: "동물병원",
  other: "기타",
};

const getEventColor = (type: CombinedEventType): string => {
  switch (type) {
    case "walk":
      return "#22c55e";
    case "meal":
      return "#f97316";
    case "bowel":
      return "#eab308";
    case "weight":
      return "#3b82f6";
    case "expense":
      return "#a855f7";
    case "health":
      return "#ec4899";
    case "grooming":
      return "#06b6d4";
    case "training":
      return "#8b5cf6";
    case "hotel":
      return "#f59e0b";
    case "hospital":
      return "#ef4444";
    default:
      return "#6b7280";
  }
};

const getEventIcon = (type: CombinedEventType) => {
  switch (type) {
    case "walk":
      return <PawPrint size={18} />;
    case "meal":
      return <Utensils size={18} />;
    case "bowel":
      return <Circle size={18} />;
    case "weight":
      return <Scale size={18} />;
    case "expense":
      return <Wallet size={18} />;
    case "grooming":
      return <Scissors size={18} />;
    case "health":
    case "hospital":
      return <Stethoscope size={18} />;
    case "training":
      return <GraduationCap size={18} />;
    case "hotel":
      return <Hotel size={18} />;
    default:
      return <Calendar size={18} />;
  }
};

const getEventEmoji = (type: CombinedEventType): string => {
  switch (type) {
    case "walk":
      return "🐕";
    case "meal":
      return "🍚";
    case "bowel":
      return "💩";
    case "weight":
      return "⚖️";
    case "expense":
      return "💰";
    case "grooming":
      return "✂️";
    case "health":
    case "hospital":
      return "🏥";
    case "training":
      return "🎓";
    case "hotel":
      return "🏨";
    default:
      return "📅";
  }
};

// ============================================
// Main Component
// ============================================
export default function CalendarPage() {
  const user = useAuthStore((state) => state.user);

  // Stores
  const pets = usePetStore((state) => state.pets);
  const selectedPetId = usePetStore((state) => state.selectedPetId); // Global filter
  const events = useCalendarStore((state) => state.events);
  const addEvent = useCalendarStore((state) => state.addEvent);
  const fetchEvents = useCalendarStore((state) => state.fetchEvents);
  const updateEvent = useCalendarStore((state) => state.updateEvent);
  const deleteEvent = useCalendarStore((state) => state.deleteEvent);

  // ✅ 수정: walks → walkLogs, meals → mealLogs 등
  const walks = useDailyLogStore((state) => state.walkLogs);
  const meals = useDailyLogStore((state) => state.mealLogs);
  const bowels = useDailyLogStore((state) => state.bowelLogs);
  const weights = useDailyLogStore((state) => state.weightLogs);
  const expenses = useDailyLogStore((state) => state.expenseLogs);
  const deleteWalkLog = useDailyLogStore((state) => state.deleteWalkLog);
  const deleteMealLog = useDailyLogStore((state) => state.deleteMealLog);
  const deleteBowelLog = useDailyLogStore((state) => state.deleteBowelLog);
  const deleteWeightLog = useDailyLogStore((state) => state.deleteWeightLog);
  const deleteExpenseLog = useDailyLogStore((state) => state.deleteExpenseLog);

  // Selected pet info
  const selectedPet = pets.find((p) => p.id === selectedPetId);

  // States
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);
  const [isYearMonthPickerOpen, setIsYearMonthPickerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CombinedDailyItem | null>(
    null,
  );
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Filter State
  const [activeFilter, setActiveFilter] = useState<CalendarFilterType>("all");

  // Fetch events when month changes or on mount
  useEffect(() => {
    if (user?.familyId) {
      const month = format(currentDate, "yyyy-MM");
      fetchEvents(user.familyId, month);
    }
  }, [user?.familyId, currentDate, fetchEvents]);

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

  // ============================================
  // Helper: Get Combined Daily Events
  // ============================================
  const getCombinedDailyItems = (dateStr: string): CombinedDailyItem[] => {
    const items: CombinedDailyItem[] = [];
    const petFilter = (petId: string) => petId === selectedPetId;

    // Walks
    (walks || [])
      .filter((w) => w.date === dateStr && petFilter(w.petId))
      .forEach((walk) => {
        items.push({
          id: walk.id,
          type: "walk",
          time: walk.startTime,
          title: `산책 ${walk.duration}분`,
          subtitle: walk.distance
            ? `${walk.distance}${walk.distanceUnit}`
            : undefined,
          petName: walk.petName,
          color: getEventColor("walk"),
          originalData: walk,
        });
      });

    // Meals
    (meals || [])
      .filter((m) => m.date === dateStr && petFilter(m.petId))
      .forEach((meal) => {
        items.push({
          id: meal.id,
          type: "meal",
          time: meal.time,
          title: `${mealTypeLabels[meal.mealType]} ${meal.amount}g`,
          subtitle: meal.foodName || foodTypeLabels[meal.foodType],
          petName: meal.petName,
          color: getEventColor("meal"),
          originalData: meal,
        });
      });

    // Bowels
    (bowels || [])
      .filter((b) => b.date === dateStr && petFilter(b.petId))
      .forEach((bowel) => {
        items.push({
          id: bowel.id,
          type: "bowel",
          time: bowel.time,
          title: bowelTypeLabels[bowel.bowelType],
          subtitle: bowelConditionLabels[bowel.condition],
          petName: bowel.petName,
          color: getEventColor("bowel"),
          originalData: bowel,
        });
      });

    // Weights
    (weights || [])
      .filter((w) => w.date === dateStr && petFilter(w.petId))
      .forEach((weight) => {
        items.push({
          id: weight.id,
          type: "weight",
          time: "00:00",
          title: `체중 ${weight.weight}kg`,
          petName: weight.petName,
          color: getEventColor("weight"),
          originalData: weight,
        });
      });

    // Expenses
    (expenses || [])
      .filter((e) => e.date === dateStr && petFilter(e.petId))
      .forEach((expense) => {
        items.push({
          id: expense.id,
          type: "expense",
          time: "00:00",
          title: expense.description,
          subtitle: `${expense.amount.toLocaleString()}원`,
          petName: expense.petName,
          color: getEventColor("expense"),
          originalData: expense,
        });
      });

    // Calendar Events
    (events || [])
      .filter((e) => {
        const eventDate = format(e.start, "yyyy-MM-dd");
        return eventDate === dateStr && petFilter(e.petId);
      })
      .forEach((event) => {
        items.push({
          id: event.id,
          type: event.type as CombinedEventType,
          time: format(event.start, "HH:mm"),
          title: event.title,
          subtitle: event.location,
          petName: event.petName,
          color:
            pets.find((p) => p.id === event.petId)?.color ||
            getEventColor(event.type as CombinedEventType),
          originalData: event,
        });
      });

    // Sort by time
    const sortedItems = items.sort((a, b) => a.time.localeCompare(b.time));

    // Apply filter
    return filterEventsByType(sortedItems, activeFilter);
  };

  // Filtered events for calendar display (using global filter)
  const filteredEvents = useMemo(() => {
    return (events || []).filter((event) => event.petId === selectedPetId);
  }, [events, selectedPetId]);

  // Events by date for calendar display
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    filteredEvents.forEach((event) => {
      const dateStr = format(event.start, "yyyy-MM-dd");
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(event);
    });
    return map;
  }, [filteredEvents]);

  // Logs summary for calendar (with counts for stamp display)
  const logsByDate = useMemo(() => {
    const logsMap: Record<
      string,
      {
        walkCount: number;
        mealCount: number;
        bowelCount: number;
        weightCount: number;
        expenseCount: number;
      }
    > = {};
    const petFilter = (petId: string) => petId === selectedPetId;

    (walks || [])
      .filter((w) => petFilter(w.petId))
      .forEach((w) => {
        if (!logsMap[w.date])
          logsMap[w.date] = {
            walkCount: 0,
            mealCount: 0,
            bowelCount: 0,
            weightCount: 0,
            expenseCount: 0,
          };
        logsMap[w.date].walkCount++;
      });

    (meals || [])
      .filter((m) => petFilter(m.petId))
      .forEach((m) => {
        if (!logsMap[m.date])
          logsMap[m.date] = {
            walkCount: 0,
            mealCount: 0,
            bowelCount: 0,
            weightCount: 0,
            expenseCount: 0,
          };
        logsMap[m.date].mealCount++;
      });

    (bowels || [])
      .filter((b) => petFilter(b.petId))
      .forEach((b) => {
        if (!logsMap[b.date])
          logsMap[b.date] = {
            walkCount: 0,
            mealCount: 0,
            bowelCount: 0,
            weightCount: 0,
            expenseCount: 0,
          };
        logsMap[b.date].bowelCount++;
      });

    (weights || [])
      .filter((w) => petFilter(w.petId))
      .forEach((w) => {
        if (!logsMap[w.date])
          logsMap[w.date] = {
            walkCount: 0,
            mealCount: 0,
            bowelCount: 0,
            weightCount: 0,
            expenseCount: 0,
          };
        logsMap[w.date].weightCount++;
      });

    (expenses || [])
      .filter((e) => petFilter(e.petId))
      .forEach((e) => {
        if (!logsMap[e.date])
          logsMap[e.date] = {
            walkCount: 0,
            mealCount: 0,
            bowelCount: 0,
            weightCount: 0,
            expenseCount: 0,
          };
        logsMap[e.date].expenseCount++;
      });

    return logsMap;
  }, [walks, meals, bowels, weights, expenses, selectedPetId]);

  // Calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });

    const firstDayOfWeek = start.getDay();
    const prevMonthDays: Date[] = [];
    if (firstDayOfWeek > 0) {
      const prevMonth = subMonths(start, 1);
      const prevMonthEnd = endOfMonth(prevMonth);
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const d = new Date(prevMonthEnd);
        d.setDate(prevMonthEnd.getDate() - i);
        prevMonthDays.push(d);
      }
    }

    const totalDays = prevMonthDays.length + days.length;
    const nextMonthDays: Date[] = [];
    const remainingDays = 42 - totalDays;
    if (remainingDays > 0) {
      const nextMonth = addMonths(start, 1);
      for (let i = 0; i < remainingDays; i++) {
        const d = new Date(nextMonth);
        d.setDate(i + 1);
        nextMonthDays.push(d);
      }
    }

    return [...prevMonthDays, ...days, ...nextMonthDays];
  }, [currentDate]);

  // Navigation
  const goToPrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Date click handler - single click selects, double click opens detail
  const handleDateClick = (date: Date) => {
    if (isSameDay(date, selectedDate)) {
      // Double click effect - open day detail
      setIsDayDetailOpen(true);
    } else {
      setSelectedDate(date);
    }
  };

  // Event bar click - just select the date and open detail
  const handleEventBarClick = (e: React.MouseEvent, date: Date) => {
    e.stopPropagation();
    setSelectedDate(date);
    setIsDayDetailOpen(true);
  };

  // Open add modal for selected date (pre-select the global pet)
  const openAddModalForDate = (date: Date) => {
    setNewEvent({
      ...newEvent,
      date: format(date, "yyyy-MM-dd"),
      startTime: "10:00",
      endTime: "11:00",
      petId: selectedPetId || pets[0]?.id || "",
    });
    setIsAddModalOpen(true);
  };

  // Handle item click in day detail
  const handleItemClick = (item: CombinedDailyItem) => {
    setSelectedItem(item);
  };

  // Delete item
  const handleDeleteItem = () => {
    if (!selectedItem) return;

    switch (selectedItem.type) {
      case "walk":
        deleteWalkLog(selectedItem.id);
        break;
      case "meal":
        deleteMealLog(selectedItem.id);
        break;
      case "bowel":
        deleteBowelLog(selectedItem.id);
        break;
      case "weight":
        deleteWeightLog(selectedItem.id);
        break;
      case "expense":
        deleteExpenseLog(selectedItem.id);
        break;
      default:
        // Calendar event
        deleteEvent(selectedItem.id);
    }

    setSelectedItem(null);
    setIsDeleteModalOpen(false);
  };

  // Edit calendar event
  const handleEditCalendarEvent = () => {
    if (!selectedItem) return;

    const event = selectedItem.originalData as CalendarEvent;
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
    setSelectedItem(null);
    setIsEditModalOpen(true);
  };

  // Add event
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

  // Edit event
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
    resetForm();
  };

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

  // Get event color from pet
  const getPetEventColor = (event: CalendarEvent) => {
    const pet = pets.find((p) => p.id === event.petId);
    return pet?.color || "#f97316";
  };

  // Selected date items
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const selectedDateItems = getCombinedDailyItems(selectedDateStr);

  // Check if item is calendar event
  const isCalendarEvent = (type: CombinedEventType) => {
    return [
      "health",
      "grooming",
      "training",
      "hotel",
      "hospital",
      "other",
    ].includes(type);
  };

  return (
    <div
      className="h-full flex flex-col"
      style={{ height: "calc(100vh - 64px)" }}
    >
      {/* ============================================ */}
      {/* Header */}
      {/* ============================================ */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsYearMonthPickerOpen(true)}
            className="flex items-center gap-1 text-2xl font-bold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            {format(currentDate, "yyyy년 M월")}
            <ChevronRight size={24} className="text-gray-400" />
          </button>

          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={goToPrevMonth}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <ChevronLeft
                size={20}
                className="text-gray-600 dark:text-gray-300"
              />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <ChevronRight
                size={20}
                className="text-gray-600 dark:text-gray-300"
              />
            </button>
            <button
              onClick={goToToday}
              className="ml-2 px-3 py-1 text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/50"
            >
              오늘
            </button>
          </div>
        </div>

        {/* Selected Pet Indicator (Global Filter) */}
        {selectedPet && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/30 rounded-full">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: selectedPet.color }}
            >
              {selectedPet.name.charAt(0)}
            </div>
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
              {selectedPet.name}
            </span>
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* Filter Chips */}
      {/* ============================================ */}
      <div className="px-4 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
        <FilterChips
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      </div>

      {/* ============================================ */}
      {/* Calendar Grid */}
      {/* ============================================ */}
      <div className="flex-1 bg-white dark:bg-slate-800 overflow-hidden flex flex-col">
        {/* Weekday Header */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-slate-700">
          {["일", "월", "화", "수", "목", "금", "토"].map((day, idx) => (
            <div
              key={day}
              className={`py-3 text-center text-sm font-semibold ${
                idx === 0
                  ? "text-red-500"
                  : idx === 6
                    ? "text-blue-500"
                    : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-6">
          {calendarDays.map((date, idx) => {
            const dateStr = format(date, "yyyy-MM-dd");
            const isCurrentMonth = isSameMonth(date, currentDate);
            const isToday = isSameDay(date, new Date());
            const isSelected = isSameDay(date, selectedDate);
            const dayOfWeek = date.getDay();
            const logs = logsByDate[dateStr];
            const dayEvents = eventsByDate[dateStr] || [];

            return (
              <div
                key={idx}
                onClick={() => handleDateClick(date)}
                className={`
                  relative border-b border-r border-gray-100 p-1 cursor-pointer
                  transition-all min-h-0 flex flex-col
                  ${isCurrentMonth ? "bg-white" : "bg-gray-50"}
                  ${isSelected ? "ring-2 ring-orange-500 ring-inset z-10" : ""}
                  hover:bg-orange-50
                `}
              >
                {/* Date Number */}
                <div className="flex justify-end mb-1">
                  <span
                    className={`
                      text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full
                      ${
                        !isCurrentMonth
                          ? "text-gray-300"
                          : dayOfWeek === 0
                            ? "text-red-500"
                            : dayOfWeek === 6
                              ? "text-blue-500"
                              : "text-gray-700"
                      }
                      ${isToday ? "bg-orange-500 text-white" : ""}
                    `}
                  >
                    {format(date, "d")}
                  </span>
                </div>

                {/* Events (Bar Style) - Click opens day detail */}
                <div className="flex-1 overflow-hidden space-y-0.5">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className="text-xs text-white px-1.5 py-0.5 truncate cursor-pointer hover:opacity-80"
                      style={{
                        backgroundColor: getPetEventColor(event),
                        borderRadius: "4px",
                        margin: "0 2px",
                      }}
                      onClick={(e) => handleEventBarClick(e, date)}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-orange-600 font-medium px-1.5">
                      +{dayEvents.length - 2}
                    </div>
                  )}
                </div>

                {/* Daily Log Stamps (Grouped by Type) */}
                {logs && isCurrentMonth && (
                  <div className="flex gap-1 justify-center items-center mt-auto pt-0.5 flex-wrap">
                    {/* 킁킁 탐험 (산책) - 횟수 표시 */}
                    {logs.walkCount > 0 && (
                      <div className="flex items-center">
                        <span className="text-xs">👃</span>
                        {logs.walkCount > 1 && (
                          <span
                            className="text-[9px] text-green-600 font-medium"
                            style={{ fontFamily: "Comic Sans MS, cursive" }}
                          >
                            x{logs.walkCount}
                          </span>
                        )}
                      </div>
                    )}

                    {/* 냠냠 (식사) - 횟수 표시 */}
                    {logs.mealCount > 0 && (
                      <div className="flex items-center">
                        <span className="text-xs">😋</span>
                        {logs.mealCount > 1 && (
                          <span
                            className="text-[9px] text-orange-600 font-medium"
                            style={{ fontFamily: "Comic Sans MS, cursive" }}
                          >
                            x{logs.mealCount}
                          </span>
                        )}
                      </div>
                    )}

                    {/* 응가 (배변) - 이모지 반복 또는 +N */}
                    {logs.bowelCount > 0 && (
                      <div className="flex items-center">
                        {logs.bowelCount === 1 && (
                          <span className="text-xs">💩</span>
                        )}
                        {logs.bowelCount === 2 && (
                          <span className="text-xs">💩💩</span>
                        )}
                        {logs.bowelCount >= 3 && (
                          <>
                            <span className="text-xs">💩</span>
                            <span
                              className="text-[9px] text-amber-600 font-medium"
                              style={{ fontFamily: "Comic Sans MS, cursive" }}
                            >
                              x{logs.bowelCount}
                            </span>
                          </>
                        )}
                      </div>
                    )}

                    {/* 몸무게 */}
                    {logs.weightCount > 0 && (
                      <span className="text-xs">⚖️</span>
                    )}

                    {/* 품위유지비 (지출) */}
                    {logs.expenseCount > 0 && (
                      <div className="flex items-center">
                        <span className="text-xs">🐷</span>
                        {logs.expenseCount > 1 && (
                          <span
                            className="text-[9px] text-pink-600 font-medium"
                            style={{ fontFamily: "Comic Sans MS, cursive" }}
                          >
                            x{logs.expenseCount}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================ */}
      {/* Floating Action Button */}
      {/* ============================================ */}
      <button
        onClick={() => openAddModalForDate(selectedDate)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 w-14 h-14 bg-orange-500 rounded-full shadow-lg flex items-center justify-center hover:bg-orange-600 hover:scale-110 transition-all z-40"
        style={{ boxShadow: "0 4px 20px rgba(249, 115, 22, 0.4)" }}
      >
        <Plus size={28} className="text-white" />
      </button>

      {/* ============================================ */}
      {/* Day Detail Bottom Sheet (TimeTree Style) */}
      {/* ============================================ */}
      {isDayDetailOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Light Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsDayDetailOpen(false)}
          />

          {/* Sheet */}
          <div
            className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col"
            style={{ animation: "slideUp 0.3s ease-out" }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Header - TimeTree Style */}
            <div className="px-6 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {format(selectedDate, "M월 d일 EEEE", { locale: ko })}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    음력 {format(selectedDate, "M/d")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <MoreHorizontal size={22} className="text-gray-500" />
                  </button>
                  <button
                    onClick={() => {
                      setIsDayDetailOpen(false);
                      openAddModalForDate(selectedDate);
                    }}
                    className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-800"
                  >
                    <Plus size={22} className="text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content - Unified List */}
            <div className="flex-1 overflow-y-auto px-4 pb-8">
              {selectedDateItems.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Calendar size={48} className="mx-auto mb-3 opacity-50" />
                  <p>이 날에는 일정이 없습니다</p>
                  <button
                    onClick={() => {
                      setIsDayDetailOpen(false);
                      openAddModalForDate(selectedDate);
                    }}
                    className="mt-4 text-orange-500 font-medium hover:text-orange-600"
                  >
                    + 새 일정 추가
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  {selectedDateItems.map((item) => (
                    <div
                      key={`${item.type}-${item.id}`}
                      onClick={() => handleItemClick(item)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      {/* Time */}
                      <div className="w-16 text-right">
                        <p className="text-sm text-gray-500">
                          {item.time !== "00:00" ? (
                            <>
                              {parseInt(item.time.split(":")[0]) < 12
                                ? "오전"
                                : "오후"}{" "}
                              {item.time}
                            </>
                          ) : (
                            "종일"
                          )}
                        </p>
                      </div>

                      {/* Color Bar */}
                      <div
                        className="w-1 h-12 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span style={{ color: item.color }}>
                            {getEventIcon(item.type)}
                          </span>
                          <p className="font-medium text-gray-900 truncate">
                            {item.title}
                          </p>
                        </div>
                        {item.subtitle && (
                          <p className="text-sm text-gray-500 truncate mt-0.5">
                            {item.subtitle}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.petName}
                        </p>
                      </div>

                      {/* Pet Avatar Placeholder */}
                      <div
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold"
                        style={{ color: item.color }}
                      >
                        {item.petName.charAt(0)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <style>{`
            @keyframes slideUp {
              from { transform: translateY(100%); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {/* ============================================ */}
      {/* Item Detail Modal (When clicking an item in day detail) */}
      {/* ============================================ */}
      {selectedItem && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setSelectedItem(null)}
          />

          <div
            className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl"
            style={{ animation: "slideUp 0.2s ease-out" }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: `${selectedItem.color}20`,
                    color: selectedItem.color,
                  }}
                >
                  {getEventIcon(selectedItem.type)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedItem.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedItem.petName}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="px-6 py-4 space-y-3">
              <div className="flex items-center gap-3 text-gray-600">
                <Clock size={18} />
                <span>
                  {selectedItem.time !== "00:00"
                    ? `${parseInt(selectedItem.time.split(":")[0]) < 12 ? "오전" : "오후"} ${selectedItem.time}`
                    : "종일"}
                </span>
              </div>

              {selectedItem.subtitle && (
                <div className="flex items-center gap-3 text-gray-600">
                  <MoreHorizontal size={18} />
                  <span>{selectedItem.subtitle}</span>
                </div>
              )}

              {/* Type-specific details */}
              {selectedItem.type === "walk" && (
                <div className="p-3 bg-green-50 rounded-xl">
                  <p className="text-sm text-green-700">
                    {
                      satisfactionLabels[
                        (selectedItem.originalData as WalkLog).satisfaction
                      ]
                    }
                  </p>
                  {(selectedItem.originalData as WalkLog).notes && (
                    <p className="text-sm text-gray-600 mt-1">
                      {(selectedItem.originalData as WalkLog).notes}
                    </p>
                  )}
                </div>
              )}

              {selectedItem.type === "meal" &&
                (selectedItem.originalData as MealLog).medsTaken && (
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <p className="text-sm text-blue-700">💊 약 복용 완료</p>
                    {(selectedItem.originalData as MealLog).medsName && (
                      <p className="text-sm text-gray-600">
                        {(selectedItem.originalData as MealLog).medsName}
                      </p>
                    )}
                  </div>
                )}

              {isCalendarEvent(selectedItem.type) && (
                <>
                  {(selectedItem.originalData as CalendarEvent)
                    .serviceProvider && (
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500">담당자</p>
                      <p className="text-sm text-gray-700">
                        {
                          (selectedItem.originalData as CalendarEvent)
                            .serviceProvider
                        }
                      </p>
                    </div>
                  )}
                  {(selectedItem.originalData as CalendarEvent).description && (
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500">메모</p>
                      <p className="text-sm text-gray-700">
                        {
                          (selectedItem.originalData as CalendarEvent)
                            .description
                        }
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              {isCalendarEvent(selectedItem.type) && (
                <Button
                  variant="outline"
                  className="flex-1 flex items-center justify-center gap-2"
                  onClick={handleEditCalendarEvent}
                >
                  <Edit3 size={18} />
                  수정
                </Button>
              )}
              <Button
                variant="danger"
                className="flex-1 flex items-center justify-center gap-2"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <Trash2 size={18} />
                삭제
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* Year/Month Picker Modal */}
      {/* ============================================ */}
      <Modal
        isOpen={isYearMonthPickerOpen}
        onClose={() => setIsYearMonthPickerOpen(false)}
        title="날짜 선택"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              연도
            </label>
            <div className="grid grid-cols-4 gap-2">
              {yearRange.map((year) => (
                <button
                  key={year}
                  onClick={() =>
                    setCurrentDate(new Date(year, currentDate.getMonth(), 1))
                  }
                  className={`py-2 px-3 rounded-lg text-sm font-medium ${
                    year === currentDate.getFullYear()
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              월
            </label>
            <div className="grid grid-cols-4 gap-2">
              {monthNames.map((name, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentDate(new Date(currentDate.getFullYear(), idx, 1));
                    setIsYearMonthPickerOpen(false);
                  }}
                  className={`py-2 px-3 rounded-lg text-sm font-medium ${
                    idx === currentDate.getMonth()
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* ============================================ */}
      {/* Add Event Modal */}
      {/* ============================================ */}
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

      {/* ============================================ */}
      {/* Edit Event Modal */}
      {/* ============================================ */}
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

      {/* ============================================ */}
      {/* Delete Confirmation Modal */}
      {/* ============================================ */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="삭제 확인"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            정말로 <strong>"{selectedItem?.title}"</strong>을(를)
            삭제하시겠습니까?
          </p>
          <p className="text-sm text-red-600">
            삭제된 항목은 복구할 수 없습니다.
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              취소
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleDeleteItem}
            >
              삭제
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
