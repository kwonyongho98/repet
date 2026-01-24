import { useState, useMemo } from "react";
import {
  Card,
  Button,
  Badge,
  Modal,
  Input,
  Select,
} from "../components/common";
import { useServiceStore } from "../stores/useServiceStore";
import { usePetStore } from "../stores/usePetStore";
import type { ServiceProvider, ServiceType } from "../types/service";
import {
  Hotel,
  GraduationCap,
  Scissors,
  Stethoscope,
  Search,
  Calendar,
  MapPin,
  Phone,
  Clock,
  Star,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

const serviceTypeLabels: Record<ServiceType, string> = {
  hotel: "애견 호텔",
  training: "훈련소",
  grooming: "미용실",
  hospital: "동물병원",
};

const serviceTypeIcons: Record<ServiceType, React.ReactNode> = {
  hotel: <Hotel size={20} />,
  training: <GraduationCap size={20} />,
  grooming: <Scissors size={20} />,
  hospital: <Stethoscope size={20} />,
};

export default function ServicePage() {
  const getProvidersByType = useServiceStore(
    (state) => state.getProvidersByType,
  );
  const createBooking = useServiceStore((state) => state.createBooking);
  const cancelBooking = useServiceStore((state) => state.cancelBooking);
  const getUpcomingBookings = useServiceStore(
    (state) => state.getUpcomingBookings,
  );

  const pets = usePetStore((state) => state.pets);

  const [selectedType, setSelectedType] = useState<ServiceType>("hotel");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] =
    useState<ServiceProvider | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [showMyBookings, setShowMyBookings] = useState(false);

  // 예약 폼 상태
  const [bookingForm, setBookingForm] = useState({
    petId: "",
    serviceName: "",
    startDate: "",
    endDate: "",
    notes: "",
  });

  // 필터링된 업체 목록
  const filteredProviders = useMemo(() => {
    let result = getProvidersByType(selectedType);
    if (searchQuery) {
      result = result.filter(
        (provider) =>
          provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          provider.address.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return result;
  }, [selectedType, searchQuery, getProvidersByType]);

  const upcomingBookings = getUpcomingBookings();

  // 함수들
  const openProviderDetail = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setIsDetailModalOpen(true);
  };

  const openBookingModal = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setBookingForm({
      petId: pets[0]?.id || "",
      serviceName: provider.services[0] || "",
      startDate: "",
      endDate: "",
      notes: "",
    });
    setIsBookingModalOpen(true);
  };

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("1. 예약 시작");
    console.log("2. selectedProvider:", selectedProvider);
    console.log("3. bookingForm:", bookingForm);

    if (!selectedProvider || !bookingForm.petId) {
      console.log("4. 검증 실패");
      alert("업체 또는 반려견을 선택해주세요.");
      return;
    }

    const pet = pets.find((p) => p.id === bookingForm.petId);
    console.log("5. 찾은 pet:", pet);

    if (!pet) {
      alert("반려견 정보를 찾을 수 없습니다.");
      return;
    }

    const bookingData = {
      providerId: selectedProvider.id,
      providerName: selectedProvider.name,
      serviceType: selectedProvider.type,
      petId: bookingForm.petId,
      petName: pet.name,
      serviceName: bookingForm.serviceName,
      startDate: bookingForm.startDate,
      endDate: bookingForm.endDate,
      status: "pending" as const,
      price: 0,
      notes: bookingForm.notes,
    };

    console.log("6. 예약 데이터:", bookingData);

    createBooking(bookingData);

    console.log("7. 예약 완료");
    console.log("8. 전체 예약 목록:", getUpcomingBookings());

    setIsBookingModalOpen(false);
    setSelectedProvider(null);
    setBookingForm({
      petId: "",
      serviceName: "",
      startDate: "",
      endDate: "",
      notes: "",
    });
    setShowMyBookings(true);
    alert("예약이 신청되었습니다!");
  };

  const handleCancelBooking = (bookingId: string) => {
    if (confirm("정말 예약을 취소하시겠습니까?")) {
      cancelBooking(bookingId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 1. 상단 히어로 섹션 (배경색 적용) */}
      <div className="bg-orange-50 px-4 pt-8 pb-12 rounded-b-3xl mb-6 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-blue-900 mb-2">
                어떤 서비스가
                <br />
                필요하신가요? 🐕
              </h1>
              <p className="text-gray-600 text-sm">
                내 주변 검증된 전문가들을 찾아보세요.
              </p>
            </div>
            {/* 내 예약 버튼 */}
            <button
              onClick={() => setShowMyBookings(!showMyBookings)}
              className="flex flex-col items-center justify-center bg-white p-3 rounded-xl shadow-sm border border-orange-100 hover:bg-orange-50 transition-colors"
            >
              <Calendar size={24} className="text-orange-500 mb-1" />
              <span className="text-xs font-bold text-blue-900">내 예약</span>
              {upcomingBookings.length > 0 && (
                <span className="absolute top-6 right-4 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
          </div>

          {/* 검색창 */}
          <div className="relative shadow-lg rounded-2xl">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="업체명, 지역(예: 강남구) 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-none focus:ring-2 focus:ring-orange-400 bg-white text-gray-700"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* 2. 내 예약 목록 (토글됨) */}
        {showMyBookings && (
          <div className="animate-fade-in-down mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-blue-900">내 예약 현황</h2>
              <button
                onClick={() => setShowMyBookings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            {upcomingBookings.length === 0 ? (
              <Card className="text-center py-8 bg-white border-dashed border-2 border-gray-200">
                <p className="text-gray-500">아직 예약된 내역이 없습니다.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-orange-500 flex justify-between items-center"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="primary">
                          {serviceTypeLabels[booking.serviceType]}
                        </Badge>
                        <span className="font-bold text-gray-800">
                          {booking.providerName}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {format(new Date(booking.startDate), "M월 d일", {
                          locale: ko,
                        })}{" "}
                        · {booking.petName}
                      </p>
                      <span className="text-xs text-orange-600 font-medium">
                        예약 대기중
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      취소
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. 카테고리 필터 (주황색으로 변경) */}
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(serviceTypeLabels) as ServiceType[]).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 border ${
                selectedType === type
                  ? "bg-orange-500 border-orange-500 text-white shadow-md transform scale-105"
                  : "bg-white border-gray-100 text-gray-500 hover:bg-gray-50"
              }`}
            >
              <div
                className={`mb-1 ${selectedType === type ? "text-white" : "text-gray-400"}`}
              >
                {serviceTypeIcons[type]}
              </div>
              <span className="text-xs font-bold">
                {serviceTypeLabels[type]}
              </span>
            </button>
          ))}
        </div>

        {/* 4. 업체 목록 (이미지 중심 카드) */}
        <h2 className="text-xl font-bold text-blue-900 mt-2">
          추천 {serviceTypeLabels[selectedType]}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProviders.map((provider) => (
            <div
              key={provider.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow"
            >
              {/* 이미지 영역 (상단 꽉 채움) */}
              <div
                className="h-48 bg-gray-200 relative cursor-pointer"
                onClick={() => openProviderDetail(provider)}
              >
                {provider.images.length > 0 ? (
                  <img
                    src={provider.images[0]}
                    alt={provider.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-400">
                    <span className="text-4xl font-bold">
                      {provider.name[0]}
                    </span>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-blue-900 flex items-center gap-1">
                  <Star size={12} className="fill-yellow-400 text-yellow-400" />
                  {provider.rating}
                </div>
              </div>

              {/* 정보 영역 */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    {provider.name}
                  </h3>
                  <span className="text-orange-600 font-bold text-sm">
                    {provider.priceRange}
                  </span>
                </div>

                <p className="text-gray-500 text-sm flex items-center gap-1 mb-4">
                  <MapPin size={14} /> {provider.address}
                </p>

                {/* 버튼 영역 */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openProviderDetail(provider)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
                  >
                    상세보기
                  </button>
                  <button
                    onClick={() => openBookingModal(provider)}
                    className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors shadow-md"
                  >
                    예약하기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 모달들 */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        title="예약하기"
      >
        <form onSubmit={handleCreateBooking} className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-bold text-blue-900">
              {selectedProvider?.name}
            </h3>
            <p className="text-sm text-gray-500">{selectedProvider?.address}</p>
          </div>

          <Select
            label="반려견 선택"
            value={bookingForm.petId}
            onChange={(e) =>
              setBookingForm({ ...bookingForm, petId: e.target.value })
            }
            options={[
              { value: "", label: "선택해주세요" },
              ...pets.map((p) => ({ value: p.id, label: p.name })),
            ]}
            required
          />
          <Select
            label="서비스 선택"
            value={bookingForm.serviceName}
            onChange={(e) =>
              setBookingForm({ ...bookingForm, serviceName: e.target.value })
            }
            options={[
              { value: "", label: "선택해주세요" },
              ...(selectedProvider?.services.map((s) => ({
                value: s,
                label: s,
              })) || []),
            ]}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              label="시작일"
              value={bookingForm.startDate}
              onChange={(e) =>
                setBookingForm({ ...bookingForm, startDate: e.target.value })
              }
              required
            />
            <Input
              type="date"
              label="종료일"
              value={bookingForm.endDate}
              onChange={(e) =>
                setBookingForm({ ...bookingForm, endDate: e.target.value })
              }
            />
          </div>
          <Input
            label="요청사항"
            placeholder="특이사항을 입력해주세요"
            value={bookingForm.notes}
            onChange={(e) =>
              setBookingForm({ ...bookingForm, notes: e.target.value })
            }
          />

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsBookingModalOpen(false)}
            >
              취소
            </Button>
            <button
              type="submit"
              className="flex-1 bg-orange-500 text-white font-bold py-2 rounded-lg hover:bg-orange-600"
            >
              예약 확정
            </button>
          </div>
        </form>
      </Modal>

      {/* 상세 모달 */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="업체 상세"
      >
        {selectedProvider && (
          <div className="space-y-4">
            <img
              src={selectedProvider.images[0]}
              alt={selectedProvider.name}
              className="w-full h-56 object-cover rounded-xl bg-gray-100"
            />
            <div>
              <h2 className="text-xl font-bold text-blue-900">
                {selectedProvider.name}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {selectedProvider.description}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm">
              <div className="flex gap-2">
                <MapPin size={16} /> {selectedProvider.address}
              </div>
              <div className="flex gap-2">
                <Phone size={16} /> {selectedProvider.phone}
              </div>
              <div className="flex gap-2">
                <Clock size={16} /> {selectedProvider.hours}
              </div>
            </div>
            <div className="pt-2">
              <h4 className="font-bold mb-2">제공 서비스</h4>
              <div className="flex flex-wrap gap-2">
                {selectedProvider.services.map((s) => (
                  <Badge key={s} variant="info">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => setIsDetailModalOpen(false)}
              >
                닫기
              </Button>
              <button
                className="flex-1 bg-orange-500 text-white font-bold rounded-lg"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  openBookingModal(selectedProvider);
                }}
              >
                예약하기
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
