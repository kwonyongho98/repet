import { Card, Button, Badge } from "../../components/common";
import { useAuthStore } from "../../stores/useAuthStore";
import { useServiceStore } from "../../stores/useServiceStore";
import {
  Calendar,
  MessageSquare,
  Users,
  TrendingUp,
  LogOut,
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const bookings = useServiceStore((state) => state.bookings);

  // 내 업체의 예약만 필터링
  const myBookings = bookings.filter((b) => b.providerId === user?.providerId);
  const pendingBookings = myBookings.filter((b) => b.status === "pending");
  const todayBookings = myBookings.filter((b) => {
    const today = new Date().toDateString();
    return new Date(b.startDate).toDateString() === today;
  });

  const handleLogout = () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      logout();
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header
        className="bg-white shadow-sm border-b"
        style={{ borderColor: "var(--color-primary-200)" }}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              R
            </div>
            <span
              className="text-xl font-bold"
              style={{ color: "var(--color-primary)" }}
            >
              Repet
            </span>
            <span
              className="ml-2 text-sm px-2 py-1 rounded"
              style={{
                backgroundColor: "var(--color-secondary-900)",
                color: "white",
              }}
            >
              사장님
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut size={16} className="mr-2" />
            로그아웃
          </Button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* 인사말 */}
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--color-secondary-900)" }}
          >
            안녕하세요, {user?.name}님! 👋
          </h1>
          <p className="text-gray-600 mt-2">오늘도 좋은 하루 되세요!</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">대기중인 예약</p>
                <p
                  className="text-3xl font-bold mt-1"
                  style={{ color: "var(--color-primary)" }}
                >
                  {pendingBookings.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Calendar size={24} style={{ color: "var(--color-primary)" }} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">오늘 예약</p>
                <p
                  className="text-3xl font-bold mt-1"
                  style={{ color: "var(--color-secondary-900)" }}
                >
                  {todayBookings.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users
                  size={24}
                  style={{ color: "var(--color-secondary-900)" }}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">작성한 코멘트</p>
                <p className="text-3xl font-bold mt-1 text-green-600">0</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <MessageSquare size={24} className="text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">이번 달 매출</p>
                <p className="text-3xl font-bold mt-1 text-purple-600">₩0</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp size={24} className="text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* 대기중인 예약 */}
        <Card title="대기중인 예약">
          {pendingBookings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              대기중인 예약이 없습니다.
            </p>
          ) : (
            <div className="space-y-3">
              {pendingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p
                      className="font-bold"
                      style={{ color: "var(--color-secondary-900)" }}
                    >
                      {booking.petName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {booking.serviceName} ·{" "}
                      {format(new Date(booking.startDate), "M월 d일 (E)", {
                        locale: ko,
                      })}
                    </p>
                    {booking.notes && (
                      <p className="text-sm text-gray-500 mt-1">
                        요청사항: {booking.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="warning">대기중</Badge>
                    <Button size="sm" variant="primary">
                      확정
                    </Button>
                    <Button size="sm" variant="outline">
                      거절
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 오늘 일정 */}
        <Card title="오늘 일정">
          {todayBookings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              오늘 예약이 없습니다.
            </p>
          ) : (
            <div className="space-y-3">
              {todayBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-l-4 border-green-500"
                >
                  <div>
                    <p
                      className="font-bold"
                      style={{ color: "var(--color-secondary-900)" }}
                    >
                      {booking.petName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {booking.serviceName}
                    </p>
                  </div>
                  <Button size="sm" variant="primary">
                    코멘트 작성
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
