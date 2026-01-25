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
    case "grooming": return <Scissors size={14} />;
    case "hospital": return <Stethoscope size={14} />;
    case "hotel": return <Hotel size={14} />;
    case "training": return <GraduationCap size={14} />;
  }
};

// 서비스 타입별 라벨
const serviceTypeLabels: Record<ServiceType, string> = {
  hotel: "애견 호텔",
  training: "훈련소",
  grooming: "미용실",
  hospital: "동물병원",
};

// 더미 리뷰 데이터
const dummyReviews = [
  { avatar: "👩", text: "선생님이 정말 친절하세요. 우리 아이가 너무 좋아해요!" },
  { avatar: "👨", text: "시설이 깨끗하고 아이들을 잘 돌봐주세요." },
  { avatar: "👩‍🦰", text: "예약이 쉽고 서비스가 훌륭합니다." },
  { avatar: "🧑", text: "가격 대비 만족스러운 서비스였어요." },
  { avatar: "👴", text: "우리 강아지가 항상 즐거워해요!" },
];

// 더미 이미지 (실제로는 서비스 이미지 사용)
const getPlaceholderImage = (type: ServiceType, index: number) => {
  const colors = {
    grooming: ["#fce7f3", "#fbcfe8", "#f9a8d4"],
    hospital: ["#fee2e2", "#fecaca", "#fca5a5"],
    hotel: ["#dbeafe", "#bfdbfe", "#93c5fd"],
    training: ["#dcfce7", "#bbf7d0", "#86efac"],
  };
  return colors[type][index % 3];
};

export default function ServiceCard({ provider, onClick, distance = "1.2km" }: ServiceCardProps) {
  // Place Store 연동
  const toggleSave = usePlaceStore((state) => state.toggleSave);
  const isSaved = usePlaceStore((state) => state.isSaved);
  const addRecent = usePlaceStore((state) => state.addRecent);

  const isProviderSaved = isSaved(provider.id);
  
  // 랜덤 리뷰 선택 (컴포넌트 마운트 시 고정)
  const reviewIndex = parseInt(provider.id) % dummyReviews.length || 0;
  const review = dummyReviews[reviewIndex];
  
  // 해시태그 생성
  const hashtags = [
    serviceTypeLabels[provider.type],
    provider.services[0] || "전문케어",
    "친절한",
  ];

  // 카드 클릭 핸들러 (최근 본 장소에 추가)
  const handleCardClick = () => {
    addRecent(provider); // 최근 본 장소에 추가
    onClick?.(); // 원래 onClick 실행
  };

  // 저장 버튼 클릭 핸들러
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSave(provider.id);
  };

  return (
    <div 
      className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700 cursor-pointer hover:shadow-md transition-all duration-200"
      onClick={handleCardClick}
    >
      {/* Hero Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {/* Placeholder Image */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: getPlaceholderImage(provider.type, 0) }}
        >
          <div className="text-6xl opacity-30">
            {provider.type === "grooming" && "✂️"}
            {provider.type === "hospital" && "🏥"}
            {provider.type === "hotel" && "🏨"}
            {provider.type === "training" && "🎓"}
          </div>
        </div>
        
        {/* Favorite Button */}
        <button
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            isProviderSaved 
              ? "bg-white dark:bg-slate-800" 
              : "bg-black/20 backdrop-blur-sm"
          }`}
          onClick={handleFavoriteClick}
        >
          <Heart 
            size={20} 
            className={
              isProviderSaved 
                ? "text-red-500 fill-red-500" 
                : "text-white"
            } 
          />
        </button>

        {/* Category Badge */}
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-1 px-2.5 py-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 dark:text-gray-200">
            {getServiceIcon(provider.type)}
            <span>{serviceTypeLabels[provider.type]}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title & Rating */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-tight">
              {provider.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-0.5">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {provider.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                리뷰 {provider.reviewCount}개
              </span>
              <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
              <div className="flex items-center gap-0.5 text-xs text-gray-500 dark:text-gray-400">
                <MapPin size={12} />
                {distance}
              </div>
            </div>
          </div>
        </div>

        {/* Review Snippet */}
        <div className="bg-gray-50 dark:bg-slate-700 rounded-2xl p-3 mb-3">
          <div className="flex items-start gap-2">
            <span className="text-lg flex-shrink-0">{review.avatar}</span>
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
              "{review.text}"
            </p>
          </div>
        </div>

        {/* Hashtags */}
        <div className="flex flex-wrap gap-1.5">
          {hashtags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 rounded-full text-xs font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
