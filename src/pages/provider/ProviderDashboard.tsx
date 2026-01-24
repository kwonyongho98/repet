import { useState } from "react";
import { Card, Button, Badge, Modal, TextArea } from "../../components/common";
import { useAuthStore } from "../../stores/useAuthStore";
import { useServiceStore } from "../../stores/useServiceStore";
import type { ServiceBooking } from "../../types/service";
import {
  Calendar,
  MessageSquare,
  Users,
  TrendingUp,
  LogOut,
  Camera,
  X,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // Service Store
  const bookings = useServiceStore((state) => state.bookings);
  const updateBooking = useServiceStore((state) => state.updateBooking);
  const completeBooking = useServiceStore((state) => state.completeBooking);
  const addComment = useServiceStore((state) => state.addComment);
  const getCommentsByProvider = useServiceStore(
    (state) => state.getCommentsByProvider,
  );
  const getCommentsByBooking = useServiceStore(
    (state) => state.getCommentsByBooking,
  );

  // 코멘트 작성 모달 상태
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<ServiceBooking | null>(
    null,
  );
  const [commentForm, setCommentForm] = useState({
    comment: "",
    imageUrl: "",
  });

  // 내 업체의 예약만 필터링
  const myBookings = bookings.filter((b) => b.providerId === user?.providerId);
  const pendingBookings = myBookings.filter((b) => b.status === "pending");
  const confirmedBookings = myBookings.filter((b) => b.status === "confirmed");
  const todayBookings = myBookings.filter((b) => {
    const today = new Date().toDateString();
    return new Date(b.startDate).toDateString() === today;
  });

  // 내 업체의 코멘트 수
  const myComments = user?.providerId
    ? getCommentsByProvider(user.providerId)
    : [];

  const handleLogout = () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      logout();
      navigate("/login");
    }
  };

  // 예약 확정
  const handleConfirmBooking = (bookingId: string) => {
    updateBooking(bookingId, { status: "confirmed" });
  };

  // 예약 거절
  const handleRejectBooking = (bookingId: string) => {
    if (confirm("정말 예약을 거절하시겠습니까?")) {
      updateBooking(bookingId, { status: "cancelled" });
    }
  };

  // 코멘트 모달 열기
  const openCommentModal = (booking: ServiceBooking) => {
    setSelectedBooking(booking);
    setCommentForm({ comment: "", imageUrl: "" });
    setIsCommentModalOpen(true);
  };

  // 이미지 업로드 핸들러 (Base64 변환)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert("이미지 크기는 5MB 이하로 업로드해주세요.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setCommentForm((prev) => ({
          ...prev,
          imageUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 이미지 제거
  const handleRemoveImage = () => {
    setCommentForm((prev) => ({ ...prev, imageUrl: "" }));
  };

  // 코멘트 제출
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBooking || !commentForm.comment.trim()) {
      alert("리포트 내용을 입력해주세요.");
      return;
    }

    // 이미 코멘트가 있는지 확인
    const existingComment = getCommentsByBooking(selectedBooking.id);
    if (existingComment) {
      alert("이미 이 예약에 대한 리포트가 작성되었습니다.");
      setIsCommentModalOpen(false);
      return;
    }

    // 코멘트 추가
    addComment({
      providerId: selectedBooking.providerId,
      providerName: selectedBooking.providerName,
      serviceType: selectedBooking.serviceType,
      bookingId: selectedBooking.id,
      petId: selectedBooking.petId,
      petName: selectedBooking.petName,
      comment: commentForm.comment,
      imageUrl: commentForm.imageUrl || undefined,
      createdBy: user?.name || "업체",
    });

    // 예약 완료 처리
    completeBooking(selectedBooking.id);

    // 모달 닫기
    setIsCommentModalOpen(false);
    setSelectedBooking(null);
    setCommentForm({ comment: "", imageUrl: "" });

    alert("데일리 리포트가 전송되었습니다! 🎉");
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
                <p className="text-sm text-gray-600">작성한 리포트</p>
                <p className="text-3xl font-bold mt-1 text-green-600">
                  {myComments.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <MessageSquare size={24} className="text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">확정된 예약</p>
                <p className="text-3xl font-bold mt-1 text-purple-600">
                  {confirmedBookings.length}
                </p>
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
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleConfirmBooking(booking.id)}
                    >
                      확정
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectBooking(booking.id)}
                    >
                      거절
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 확정된 예약 - 리포트 작성 가능 */}
        <Card title="확정된 예약 (리포트 작성)">
          {confirmedBookings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              확정된 예약이 없습니다.
            </p>
          ) : (
            <div className="space-y-3">
              {confirmedBookings.map((booking) => {
                const hasComment = getCommentsByBooking(booking.id);
                return (
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
                        {booking.serviceName} ·{" "}
                        {format(new Date(booking.startDate), "M월 d일 (E)", {
                          locale: ko,
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="success">확정</Badge>
                      {hasComment ? (
                        <Button size="sm" variant="outline" disabled>
                          <Check size={16} className="mr-1" />
                          작성완료
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => openCommentModal(booking)}
                        >
                          <MessageSquare size={16} className="mr-1" />
                          리포트 작성
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
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
              {todayBookings.map((booking) => {
                const hasComment = getCommentsByBooking(booking.id);
                return (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500"
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
                    <div className="flex items-center gap-2">
                      <Badge variant="info">
                        {booking.status === "pending"
                          ? "대기"
                          : booking.status === "confirmed"
                            ? "확정"
                            : booking.status === "completed"
                              ? "완료"
                              : "취소"}
                      </Badge>
                      {booking.status === "confirmed" && !hasComment && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => openCommentModal(booking)}
                        >
                          리포트 작성
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* 코멘트 작성 모달 */}
      <Modal
        isOpen={isCommentModalOpen}
        onClose={() => {
          setIsCommentModalOpen(false);
          setSelectedBooking(null);
          setCommentForm({ comment: "", imageUrl: "" });
        }}
        title="📝 데일리 리포트 작성"
        maxWidth="lg"
      >
        {selectedBooking && (
          <form onSubmit={handleSubmitComment} className="space-y-4">
            {/* 예약 정보 */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="font-bold text-blue-900">
                {selectedBooking.petName}
              </p>
              <p className="text-sm text-gray-600">
                {selectedBooking.serviceName} ·{" "}
                {format(new Date(selectedBooking.startDate), "yyyy년 M월 d일", {
                  locale: ko,
                })}
              </p>
            </div>

            {/* 리포트 내용 */}
            <TextArea
              label="오늘의 리포트"
              placeholder="오늘 반려견과 함께한 활동, 상태, 특이사항 등을 작성해주세요. 보호자분께 전달됩니다! 🐕"
              rows={5}
              value={commentForm.comment}
              onChange={(e) =>
                setCommentForm({ ...commentForm, comment: e.target.value })
              }
              required
            />

            {/* 이미지 업로드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사진 첨부 (선택)
              </label>

              {commentForm.imageUrl ? (
                <div className="relative inline-block">
                  <img
                    src={commentForm.imageUrl}
                    alt="업로드된 이미지"
                    className="w-40 h-40 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors">
                  <Camera size={32} className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">사진 추가</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
              <p className="text-xs text-gray-400 mt-1">
                최대 5MB, JPG/PNG 형식
              </p>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsCommentModalOpen(false);
                  setSelectedBooking(null);
                  setCommentForm({ comment: "", imageUrl: "" });
                }}
              >
                취소
              </Button>
              <Button type="submit" variant="primary" className="flex-1">
                리포트 전송
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
