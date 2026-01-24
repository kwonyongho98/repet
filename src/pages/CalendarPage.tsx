import { useState, useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import type { View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Card,
  Button,
  Badge,
  Modal,
  Input,
  Select,
  TextArea,
} from "../components/common";
import type { EventType } from "../types/calendar";
import { usePetStore } from "../stores/usePetStore";
import { useCalendarStore } from "../stores/useCalendarStore";
import "react-big-calendar/lib/css/react-big-calendar.css";
import type { CalendarEvent } from "../types/calendar";

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
  other: "기타",
};

export default function CalendarPage() {
  // Store에서 데이터 가져오기
  const pets = usePetStore((state) => state.pets);
  const events = useCalendarStore((state) => state.events);
  const addEvent = useCalendarStore((state) => state.addEvent);
  const updateEvent = useCalendarStore((state) => state.updateEvent);
  const deleteEvent = useCalendarStore((state) => state.deleteEvent);

  const [selectedPet, setSelectedPet] = useState<string | "all">("all");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  ); // 수정
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null); // 수정
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>("month");
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

  // 이벤트 스타일
  const eventStyleGetter = (event: CalendarEvent) => {
    // 수정
    const pet = pets.find((p) => p.id === event.petId);
    return {
      style: {
        backgroundColor: pet?.color || "#3B82F6",
        borderRadius: "5px",
        opacity: 0.8,
        color: "white",
        border: "none",
        display: "block",
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
    // 수정
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
    // 수정
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

  // 날짜 선택 시 (캘린더 클릭)
  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    // 수정
    const selectedDate = format(slotInfo.start, "yyyy-MM-dd");
    const selectedStartTime = format(slotInfo.start, "HH:mm");
    const selectedEndTime = format(slotInfo.end, "HH:mm");

    setNewEvent({
      ...newEvent,
      date: selectedDate,
      startTime: selectedStartTime,
      endTime: selectedEndTime,
    });
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--color-secondary-900)" }}
          >
            캘린더
          </h1>
          <p style={{ color: "var(--color-text-secondary)" }} className="mt-2">
            반려견 일정을 한눈에 관리하세요
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
          + 일정 추가
        </Button>
      </div>

      {/* 필터 */}
      <Card>
        <div className="flex items-center gap-4">
          <span className="font-medium text-gray-700">반려견 필터:</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={selectedPet === "all" ? "primary" : "outline"}
              onClick={() => setSelectedPet("all")}
            >
              전체
            </Button>
            {pets.map((pet) => (
              <Button
                key={pet.id}
                size="sm"
                variant={selectedPet === pet.id ? "primary" : "outline"}
                onClick={() => setSelectedPet(pet.id)}
              >
                <span
                  className="w-3 h-3 rounded-full mr-2 inline-block"
                  style={{ backgroundColor: pet.color }}
                />
                {pet.name}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* 캘린더 - 하나만! */}
      <Card>
        <div style={{ height: "600px" }}>
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
            view={currentView}
            onView={(view) => setCurrentView(view)}
            views={["month", "week", "day", "agenda"]}
            messages={{
              next: "다음",
              previous: "이전",
              today: "오늘",
              month: "월",
              week: "주",
              day: "일",
              agenda: "일정",
              date: "날짜",
              time: "시간",
              event: "이벤트",
              noEventsInRange: "일정이 없습니다.",
              showMore: (total) => `+${total} 더보기`,
            }}
          />
        </div>
      </Card>

      {/* 이벤트 상세 (선택 시) */}
      {selectedEvent && (
        <Card title="일정 상세">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-xl font-bold">{selectedEvent.title}</h3>
                <Badge variant="primary">
                  {eventTypeLabels[selectedEvent.type]}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">반려견</p>
                <p className="font-medium">{selectedEvent.petName}</p>
              </div>
              <div>
                <p className="text-gray-600">날짜</p>
                <p className="font-medium">
                  {format(selectedEvent.start, "yyyy년 M월 d일 HH:mm", {
                    locale: ko,
                  })}
                </p>
              </div>
              {selectedEvent.location && (
                <div>
                  <p className="text-gray-600">장소</p>
                  <p className="font-medium">{selectedEvent.location}</p>
                </div>
              )}
              {selectedEvent.serviceProvider && (
                <div>
                  <p className="text-gray-600">담당자</p>
                  <p className="font-medium">{selectedEvent.serviceProvider}</p>
                </div>
              )}
            </div>

            {selectedEvent.description && (
              <div>
                <p className="text-gray-600 text-sm">메모</p>
                <p className="mt-1">{selectedEvent.description}</p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                닫기
              </Button>
              <Button
                variant="primary"
                onClick={() => openEditModal(selectedEvent)}
              >
                수정
              </Button>
              <Button
                variant="danger"
                onClick={() => openDeleteModal(selectedEvent)}
              >
                삭제
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 다가오는 일정 */}
      <Card title="다가오는 일정">
        <div className="space-y-3">
          {filteredEvents
            .filter((event) => event.start >= new Date())
            .sort((a, b) => a.start.getTime() - b.start.getTime())
            .slice(0, 5)
            .map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-1 h-12 rounded"
                    style={{
                      backgroundColor: pets.find((p) => p.id === event.petId)
                        ?.color,
                    }}
                  />
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-gray-600">
                      {format(event.start, "M월 d일 HH:mm", { locale: ko })} ·{" "}
                      {event.petName}
                    </p>
                  </div>
                </div>
                <Badge variant="info">{eventTypeLabels[event.type]}</Badge>
              </div>
            ))}
        </div>
      </Card>

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
            rows={4}
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
            rows={4}
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
