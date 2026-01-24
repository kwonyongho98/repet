import { Card, Button, Badge } from "../components/common";
import { Dog, Calendar, Users, Store } from "lucide-react";
import { usePetStore } from "../stores/usePetStore";
import { useCalendarStore } from "../stores/useCalendarStore";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

const eventTypeLabels: Record<string, string> = {
  health: "병원",
  grooming: "미용",
  training: "훈련",
  hotel: "호텔",
  other: "기타",
};

export default function HomePage() {
  const navigate = useNavigate();
  const pets = usePetStore((state) => state.pets);
  const events = useCalendarStore((state) => state.events);

  // 통계 계산
  const totalPets = pets.length;

  // 이번 달 일정 개수
  const thisMonthEvents = events.filter((event) => {
    const eventDate = new Date(event.start);
    const now = new Date();
    return (
      eventDate.getMonth() === now.getMonth() &&
      eventDate.getFullYear() === now.getFullYear()
    );
  }).length;

  // 다가오는 일정 (7일 이내)
  const upcomingEvents = events
    .filter((event) => {
      const eventDate = new Date(event.start);
      const now = new Date();
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(now.getDate() + 7);
      return eventDate >= now && eventDate <= sevenDaysLater;
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 5);

  // 최근 활동 (최근 일정 순서대로)
  const recentActivities = [...events]
    .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl font-bold"
          style={{ color: "var(--color-secondary-900)" }}
        >
          대시보드
        </h1>
        <p style={{ color: "var(--color-text-secondary)" }} className="mt-2">
          반려견의 모든 것을 한눈에
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate("/pets")}
        >
          <div className="flex items-center gap-4">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: "var(--color-primary-100)" }}
            >
              <Dog
                className="w-6 h-6"
                style={{ color: "var(--color-primary)" }}
              />
            </div>
            <div>
              <p
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                반려견
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: "var(--color-secondary-900)" }}
              >
                {totalPets}마리
              </p>
            </div>
          </div>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate("/calendar")}
        >
          <div className="flex items-center gap-4">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: "var(--color-primary-100)" }}
            >
              <Calendar
                className="w-6 h-6"
                style={{ color: "var(--color-primary)" }}
              />
            </div>
            <div>
              <p
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                이번 달 일정
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: "var(--color-secondary-900)" }}
              >
                {thisMonthEvents}개
              </p>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center gap-4">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: "var(--color-secondary-100)" }}
            >
              <Users
                className="w-6 h-6"
                style={{ color: "var(--color-secondary)" }}
              />
            </div>
            <div>
              <p
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                가족 구성원
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: "var(--color-secondary-900)" }}
              >
                1명
              </p>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center gap-4">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: "var(--color-primary-100)" }}
            >
              <Store
                className="w-6 h-6"
                style={{ color: "var(--color-primary)" }}
              />
            </div>
            <div>
              <p
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                다가오는 일정
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: "var(--color-secondary-900)" }}
              >
                {upcomingEvents.length}개
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 반려견 목록 */}
      {pets.length > 0 && (
        <Card title="우리 반려견">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pets.map((pet) => (
              <div
                key={pet.id}
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate("/pets")}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-2"
                  style={{ backgroundColor: pet.color }}
                >
                  {pet.name.charAt(0)}
                </div>
                <p className="font-medium text-center">{pet.name}</p>
                <p className="text-sm text-gray-600">{pet.breed}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 다가오는 일정 */}
      {upcomingEvents.length > 0 && (
        <Card title="다가오는 일정 (7일 이내)">
          <div className="space-y-3">
            {upcomingEvents.map((event) => {
              const pet = pets.find((p) => p.id === event.petId);
              return (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => navigate("/calendar")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-1 h-12 rounded"
                      style={{ backgroundColor: pet?.color }}
                    />
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(event.start), "M월 d일 (E) HH:mm", {
                          locale: ko,
                        })}{" "}
                        · {event.petName}
                      </p>
                    </div>
                  </div>
                  <Badge variant="info">{eventTypeLabels[event.type]}</Badge>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={() => navigate("/calendar")}>
              전체 일정 보기
            </Button>
          </div>
        </Card>
      )}

      {/* 최근 활동 */}
      {recentActivities.length > 0 && (
        <Card title="최근 활동">
          <div className="space-y-3">
            {recentActivities.map((event) => {
              const eventDate = new Date(event.start);
              const now = new Date();
              const isPast = eventDate < now;
              const pet = pets.find((p) => p.id === event.petId);

              return (
                <div
                  key={event.id}
                  className="flex items-center justify-between py-2 border-b last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-1 h-12 rounded"
                      style={{ backgroundColor: pet?.color }}
                    />
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-gray-600">
                        {format(eventDate, "M월 d일 HH:mm", { locale: ko })} ·{" "}
                        {event.petName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isPast ? "success" : "primary"}>
                      {eventTypeLabels[event.type]}
                    </Badge>
                    {isPast && <Badge variant="success">완료</Badge>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 반려견이 없을 때 */}
      {pets.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Dog
              className="w-16 h-16 mx-auto mb-4"
              style={{ color: "var(--color-primary-200)" }}
            />
            <h3
              className="text-xl font-bold mb-2"
              style={{ color: "var(--color-secondary-900)" }}
            >
              아직 등록된 반려견이 없습니다
            </h3>
            <p
              style={{ color: "var(--color-text-secondary)" }}
              className="mb-6"
            >
              첫 반려견을 등록하고 Repet을 시작해보세요!
            </p>
            <Button variant="primary" onClick={() => navigate("/pets")}>
              반려견 등록하기
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
