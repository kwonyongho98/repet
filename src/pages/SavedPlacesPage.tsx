import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Heart,
  Star,
  MapPin,
  Scissors,
  Stethoscope,
  Hotel,
  GraduationCap,
  Trash2,
} from "lucide-react";
import { usePlaceStore } from "../stores/usePlaceStore";
import { useServiceStore } from "../stores/useServiceStore";
import type { ServiceType } from "../types/service";

// 서비스 타입별 아이콘
const getServiceIcon = (type: ServiceType) => {
  switch (type) {
    case "grooming":
      return <Scissors size={14} />;
    case "hospital":
      return <Stethoscope size={14} />;
    case "hotel":
      return <Hotel size={14} />;
    case "training":
      return <GraduationCap size={14} />;
  }
};

// 서비스 타입별 라벨
const serviceTypeLabels: Record<ServiceType, string> = {
  hotel: "애견 호텔",
  training: "훈련소",
  grooming: "미용실",
  hospital: "동물병원",
};

// 서비스 타입별 배경색
const getPlaceholderBg = (type: ServiceType) => {
  switch (type) {
    case "grooming":
      return "bg-pink-100 dark:bg-pink-900/30";
    case "hospital":
      return "bg-red-100 dark:bg-red-900/30";
    case "hotel":
      return "bg-blue-100 dark:bg-blue-900/30";
    case "training":
      return "bg-green-100 dark:bg-green-900/30";
  }
};

const getEmoji = (type: ServiceType) => {
  switch (type) {
    case "grooming":
      return "✂️";
    case "hospital":
      return "🏥";
    case "hotel":
      return "🏨";
    case "training":
      return "🎓";
  }
};

export default function SavedPlacesPage() {
  const navigate = useNavigate();
  const savedPlaceIds = usePlaceStore((state) => state.savedPlaceIds);
  const toggleSave = usePlaceStore((state) => state.toggleSave);
  const clearSavedPlaces = usePlaceStore((state) => state.clearSavedPlaces);
  const providers = useServiceStore((state) => state.providers);

  // 저장된 장소 목록 가져오기
  const savedPlaces = useMemo(() => {
    return providers.filter((provider) => savedPlaceIds.includes(provider.id));
  }, [providers, savedPlaceIds]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 px-4 py-3 flex items-center gap-3 border-b border-gray-100 dark:border-slate-700 sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft size={22} className="text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex-1">
          ❤️ 저장한 장소
        </h1>
        {savedPlaces.length > 0 && (
          <button
            onClick={clearSavedPlaces}
            className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
          >
            <Trash2 size={20} className="text-red-500" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {savedPlaces.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4">💔</div>
            <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-2">
              저장한 장소가 없어요
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
              마음에 드는 서비스를 발견하면
              <br />
              하트를 눌러 저장해보세요!
            </p>
            <Link
              to="/home/service"
              className="px-6 py-3 bg-orange-500 dark:bg-orange-400 text-white rounded-2xl font-medium hover:bg-orange-600 dark:hover:bg-orange-500 transition-colors"
            >
              서비스 둘러보기
            </Link>
          </div>
        ) : (
          /* Places Grid */
          <div className="space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              총 {savedPlaces.length}개의 장소를 저장했어요
            </p>
            {savedPlaces.map((provider) => (
              <div
                key={provider.id}
                className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700"
              >
                <div className="flex">
                  {/* Image Placeholder */}
                  <div
                    className={`w-28 h-28 flex-shrink-0 flex items-center justify-center ${getPlaceholderBg(
                      provider.type
                    )}`}
                  >
                    <span className="text-4xl opacity-50">
                      {getEmoji(provider.type)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-3 flex flex-col justify-between">
                    <div>
                      {/* Badge */}
                      <div className="flex items-center gap-1 mb-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            provider.type === "grooming"
                              ? "bg-pink-100 text-pink-600 dark:bg-pink-900/50 dark:text-pink-300"
                              : provider.type === "hospital"
                              ? "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300"
                              : provider.type === "hotel"
                              ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300"
                              : "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300"
                          }`}
                        >
                          {getServiceIcon(provider.type)}
                          <span className="ml-1">
                            {serviceTypeLabels[provider.type]}
                          </span>
                        </span>
                      </div>

                      {/* Name */}
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base leading-tight mb-1">
                        {provider.name}
                      </h3>

                      {/* Rating & Address */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-0.5">
                          <Star
                            size={12}
                            className="text-yellow-400 fill-yellow-400"
                          />
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {provider.rating.toFixed(1)}
                          </span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-0.5 truncate">
                          <MapPin size={12} />
                          <span className="truncate">{provider.address}</span>
                        </div>
                      </div>
                    </div>

                    {/* Heart Button */}
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSave(provider.id);
                        }}
                        className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <Heart
                          size={20}
                          className="text-red-500 fill-red-500"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
