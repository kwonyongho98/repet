import { Heart, Star, MapPin, Scissors, Stethoscope, Hotel, GraduationCap } from "lucide-react";
import type { ServiceProvider, ServiceType } from "../../types/service";
import { usePlaceStore } from "../../stores/usePlaceStore";

interface ServiceCardProps {
  provider: ServiceProvider;
  onClick?: () => void;
  distance?: string;
}

// 서비스 타입별 아이콘
const getServiceIcon = (type: ServiceType) => {
  switch (type) {
    case "grooming": return <Scissors size={12} />;
    case "hospital": return <Stethoscope size={12} />;
    case "hotel": return <Hotel size={12} />;
    case "training": return <GraduationCap size={12} />;
  }
};

// 서비스 타입별 라벨
const serviceTypeLabels: Record<ServiceType, string> = {
  hotel: "애견 호텔",
  training: "훈련소",
  grooming: "미용실",
  hospital: "동물병원",
};

// 더미 이미지 (실제로는 서비스 이미지 사용)
const getPlaceholderImage = (type: ServiceType) => {
  const colors = {
    grooming: "#fce7f3",
    hospital: "#fee2e2",
    hotel: "#dbeafe",
    training: "#dcfce7",
  };
  return colors[type];
};

// 더미 이미지 이모지
const getPlaceholderEmoji = (type: ServiceType) => {
  switch (type) {
    case "grooming": return "✂️";
    case "hospital": return "🏥";
    case "hotel": return "🏨";
    case "training": return "🎓";
  }
};

export default function ServiceCard({ provider, onClick, distance = "1.2km" }: ServiceCardProps) {
  // Place Store 연동
  const toggleSave = usePlaceStore((state) => state.toggleSave);
  const isSaved = usePlaceStore((state) => state.isSaved);
  const addRecent = usePlaceStore((state) => state.addRecent);

  const isProviderSaved = isSaved(provider.id);

  // 카드 클릭 핸들러 (최근 본 장소에 추가)
  const handleCardClick = () => {
    addRecent(provider);
    onClick?.();
  };

  // 저장 버튼 클릭 핸들러
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSave(provider.id);
  };

  return (
    <div 
      className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700 cursor-pointer hover:shadow-md transition-all duration-200"
      onClick={handleCardClick}
    >
      <div className="flex">
        {/* 좌측 썸네일 이미지 */}
        <div className="relative w-28 h-28 flex-shrink-0">
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: getPlaceholderImage(provider.type) }}
          >
            <span className="text-3xl opacity-40">
              {getPlaceholderEmoji(provider.type)}
            </span>
          </div>
          
          {/* 카테고리 뱃지 */}
          <div className="absolute bottom-1.5 left-1.5">
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded text-[10px] font-medium text-gray-600 dark:text-gray-300">
              {getServiceIcon(provider.type)}
              <span>{serviceTypeLabels[provider.type]}</span>
            </div>
          </div>
        </div>

        {/* 우측 정보 영역 */}
        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          {/* 상단: 이름 + 찜버튼 */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight line-clamp-1">
              {provider.name}
            </h3>
            <button
              className="flex-shrink-0 p-1 -m-1"
              onClick={handleFavoriteClick}
            >
              <Heart 
                size={18} 
                className={
                  isProviderSaved 
                    ? "text-red-500 fill-red-500" 
                    : "text-gray-300 dark:text-gray-600"
                } 
              />
            </button>
          </div>

          {/* 중간: 평점 + 리뷰수 + 거리 */}
          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex items-center gap-0.5">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                {provider.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              리뷰 {provider.reviewCount}개
            </span>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <div className="flex items-center gap-0.5 text-[10px] text-gray-500 dark:text-gray-400">
              <MapPin size={10} />
              {distance}
            </div>
          </div>

          {/* 하단: 서비스 태그 */}
          <div className="flex flex-wrap gap-1 mt-2">
            {provider.services.slice(0, 3).map((service, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 rounded text-[10px]"
              >
                {service}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
