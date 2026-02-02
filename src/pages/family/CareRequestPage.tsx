import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

// Stores
import { usePetStore } from "../../stores/usePetStore";
import { useProviderStore } from "../../stores/useProviderStore";
import { useAuthStore } from "../../stores/useAuthStore";

// Components
import { Button, Input, TextArea, BottomSheet, Badge } from "../../components/common";

// Types
interface CareRequest {
  id: string;
  petId: string;
  petName: string;
  providerId: string;
  providerName: string;
  requestType: "pickup" | "dropoff" | "medication" | "special_care" | "schedule_change" | "other";
  title: string;
  description: string;
  requestedDate?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  responseMessage?: string;
}

const requestTypeLabels: Record<string, { label: string; emoji: string }> = {
  pickup: { label: "픽업 요청", emoji: "🚗" },
  dropoff: { label: "드롭오프 요청", emoji: "🏠" },
  medication: { label: "투약 요청", emoji: "💊" },
  special_care: { label: "특별 케어", emoji: "⭐" },
  schedule_change: { label: "일정 변경", emoji: "📅" },
  other: { label: "기타 요청", emoji: "📝" },
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "대기중", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: <Clock size={14} /> },
  approved: { label: "승인됨", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: <CheckCircle size={14} /> },
  rejected: { label: "거절됨", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: <XCircle size={14} /> },
};

export default function CareRequestPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // Stores
  const pets = usePetStore((state) => state.pets);
  const selectedPetId = usePetStore((state) => state.selectedPetId);
  const selectedPet = useMemo(
    () => pets.find((p) => p.id === selectedPetId),
    [pets, selectedPetId]
  );
  const myProviders = useProviderStore((state) => state.myProviders);

  // States
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [requests, setRequests] = useState<CareRequest[]>([
    // Demo data
    {
      id: "1",
      petId: selectedPetId || "",
      petName: selectedPet?.name || "반려견",
      providerId: myProviders[0]?.id || "",
      providerName: myProviders[0]?.businessName || "업체",
      requestType: "medication",
      title: "심장약 투약 요청",
      description: "오전 10시에 심장약 1알 투약 부탁드립니다. 사료와 함께 주시면 됩니다.",
      requestedDate: format(new Date(), "yyyy-MM-dd"),
      status: "approved",
      createdAt: new Date(Date.now() - 86400000),
      responseMessage: "네, 확인했습니다. 오전 10시에 투약하겠습니다!",
    },
    {
      id: "2",
      petId: selectedPetId || "",
      petName: selectedPet?.name || "반려견",
      providerId: myProviders[0]?.id || "",
      providerName: myProviders[0]?.businessName || "업체",
      requestType: "pickup",
      title: "픽업 시간 변경",
      description: "오늘 픽업 시간을 6시에서 7시로 변경 부탁드립니다.",
      status: "pending",
      createdAt: new Date(),
    },
  ]);

  // Form state
  const [form, setForm] = useState({
    requestType: "other" as keyof typeof requestTypeLabels,
    title: "",
    description: "",
    requestedDate: format(new Date(), "yyyy-MM-dd"),
  });

  // Handlers
  const handleSubmit = () => {
    if (!form.title || !form.description || !selectedProviderId) return;

    const selectedProvider = myProviders.find((p) => p.id === selectedProviderId);

    const newRequest: CareRequest = {
      id: Date.now().toString(),
      petId: selectedPetId || "",
      petName: selectedPet?.name || "반려견",
      providerId: selectedProviderId,
      providerName: selectedProvider?.businessName || "업체",
      requestType: form.requestType,
      title: form.title,
      description: form.description,
      requestedDate: form.requestedDate,
      status: "pending",
      createdAt: new Date(),
    };

    setRequests([newRequest, ...requests]);
    setIsCreateSheetOpen(false);
    setForm({
      requestType: "other",
      title: "",
      description: "",
      requestedDate: format(new Date(), "yyyy-MM-dd"),
    });
  };

  // Filter requests by selected provider
  const filteredRequests = selectedProviderId
    ? requests.filter((r) => r.providerId === selectedProviderId)
    : requests;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={22} className="text-gray-700 dark:text-gray-200" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              ✍️ 케어 요청서
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {selectedPet?.name || "반려견"}의 케어 요청
            </p>
          </div>
          <button
            onClick={() => setIsCreateSheetOpen(true)}
            className="p-2 bg-orange-500 rounded-xl text-white hover:bg-orange-600 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Provider Filter */}
        {myProviders.length > 0 && (
          <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedProviderId("")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                !selectedProviderId
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400"
              }`}
            >
              전체
            </button>
            {myProviders.map((provider) => (
              <button
                key={provider.id}
                onClick={() => setSelectedProviderId(provider.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedProviderId === provider.id
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400"
                }`}
              >
                {provider.businessName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-16">
            <FileText size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              아직 케어 요청이 없어요
            </p>
            <Button
              variant="primary"
              onClick={() => setIsCreateSheetOpen(true)}
            >
              <Plus size={18} className="mr-1" />
              새 요청 작성
            </Button>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {requestTypeLabels[request.requestType]?.emoji}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {request.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {request.providerName} · {format(request.createdAt, "M월 d일", { locale: ko })}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[request.status].color}`}>
                  {statusConfig[request.status].icon}
                  {statusConfig[request.status].label}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {request.description}
              </p>

              {/* Requested Date */}
              {request.requestedDate && (
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <Calendar size={12} />
                  요청일: {format(new Date(request.requestedDate), "M월 d일 (EEEE)", { locale: ko })}
                </div>
              )}

              {/* Response */}
              {request.responseMessage && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 mt-2">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                    💬 업체 답변
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {request.responseMessage}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Request Bottom Sheet */}
      <BottomSheet
        isOpen={isCreateSheetOpen}
        onClose={() => setIsCreateSheetOpen(false)}
        title="✍️ 새 케어 요청"
      >
        <div className="space-y-4">
          {/* Provider Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              업체 선택
            </label>
            <div className="grid grid-cols-2 gap-2">
              {myProviders.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProviderId(provider.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    selectedProviderId === provider.id
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : "border-gray-200 dark:border-slate-600"
                  }`}
                >
                  <p className="font-medium text-sm text-gray-900 dark:text-white">
                    {provider.businessName}
                  </p>
                </button>
              ))}
            </div>
            {myProviders.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                연결된 업체가 없습니다
              </p>
            )}
          </div>

          {/* Request Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              요청 유형
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(requestTypeLabels).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setForm({ ...form, requestType: key as keyof typeof requestTypeLabels })}
                  className={`p-2 rounded-xl border-2 text-center transition-all ${
                    form.requestType === key
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : "border-gray-200 dark:border-slate-600"
                  }`}
                >
                  <span className="text-xl block mb-1">{value.emoji}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {value.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <Input
            label="요청 제목"
            placeholder="예: 오전 투약 요청"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          {/* Description */}
          <TextArea
            label="상세 내용"
            placeholder="요청 내용을 자세히 적어주세요..."
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          {/* Date */}
          <Input
            label="요청 날짜"
            type="date"
            value={form.requestedDate}
            onChange={(e) => setForm({ ...form, requestedDate: e.target.value })}
          />

          {/* Submit */}
          <Button
            variant="primary"
            className="w-full"
            onClick={handleSubmit}
            disabled={!form.title || !form.description || !selectedProviderId}
          >
            <Send size={18} className="mr-2" />
            요청 보내기
          </Button>
        </div>
      </BottomSheet>

      {/* Scrollbar hide */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
