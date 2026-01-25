import { useState, useMemo, useEffect } from "react";
import {
  Search,
  X,
  List,
  Map as MapIcon,
  RefreshCw,
  Scissors,
  Stethoscope,
  Hotel,
  GraduationCap,
  MapPin,
  Star,
  Navigation,
  ChevronLeft,
  Heart,
  Phone,
  Clock,
  Calendar,
} from "lucide-react";
import { useServiceStore } from "../stores/useServiceStore";
import { useCalendarStore } from "../stores/useCalendarStore";
import { usePetStore } from "../stores/usePetStore";
import { usePlaceStore } from "../stores/usePlaceStore";
import type { ServiceProvider, ServiceType } from "../types/service";
import ServiceCard from "../components/service/ServiceCard";
import { Button, Modal, Input, Select, Badge } from "../components/common";
import { format } from "date-fns";

// ============================================
// Types & Constants
// ============================================
type ViewMode = "map" | "list";
type CategoryFilter = "all" | ServiceType;

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  type: ServiceType;
  provider: ServiceProvider;
}

const categories: { id: CategoryFilter; label: string; icon: React.ReactNode; emoji: string }[] = [
  { id: "all", label: "전체", icon: <MapIcon size={16} />, emoji: "🗺️" },
  { id: "hospital", label: "병원", icon: <Stethoscope size={16} />, emoji: "🏥" },
  { id: "grooming", label: "미용", icon: <Scissors size={16} />, emoji: "✂️" },
  { id: "hotel", label: "호텔", icon: <Hotel size={16} />, emoji: "🏨" },
  { id: "training", label: "훈련", icon: <GraduationCap size={16} />, emoji: "🎓" },
];

const serviceTypeLabels: Record<ServiceType, string> = {
  hotel: "애견 호텔",
  training: "훈련소",
  grooming: "미용실",
  hospital: "동물병원",
};

// 더미 좌표 (서울 중심)
const SEOUL_CENTER = { lat: 37.5665, lng: 126.978 };

const generateDummyCoordinates = (index: number) => ({
  lat: SEOUL_CENTER.lat + (Math.random() - 0.5) * 0.05,
  lng: SEOUL_CENTER.lng + (Math.random() - 0.5) * 0.05,
});

// ============================================
// Map Marker Component (Custom Pin)
// ============================================
const MapMarkerPin = ({ 
  type, 
  isSelected, 
  onClick 
}: { 
  type: ServiceType; 
  isSelected: boolean;
  onClick: () => void;
}) => {
  const getMarkerStyle = () => {
    const baseStyle = `
      w-10 h-10 rounded-2xl flex items-center justify-center 
      shadow-lg cursor-pointer transition-all duration-200
      ${isSelected ? "scale-125 ring-2 ring-orange-500 ring-offset-2" : "hover:scale-110"}
    `;
    
    switch (type) {
      case "grooming": return `${baseStyle} bg-pink-500 text-white`;
      case "hospital": return `${baseStyle} bg-red-500 text-white`;
      case "hotel": return `${baseStyle} bg-blue-500 text-white`;
      case "training": return `${baseStyle} bg-green-500 text-white`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case "grooming": return <Scissors size={18} />;
      case "hospital": return <Stethoscope size={18} />;
      case "hotel": return <Hotel size={18} />;
      case "training": return <GraduationCap size={18} />;
    }
  };

  return (
    <button className={getMarkerStyle()} onClick={onClick}>
      {getIcon()}
    </button>
  );
};

// ============================================
// Main Component
// ============================================
export default function ServicePage() {
  // Stores
  const providers = useServiceStore((state) => state.providers);
  const createBooking = useServiceStore((state) => state.createBooking);
  const addCalendarEvent = useCalendarStore((state) => state.addEvent);
  const pets = usePetStore((state) => state.pets);
  const selectedPetId = usePetStore((state) => state.selectedPetId);
  const selectedPet = pets.find(p => p.id === selectedPetId);

  // State
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState(SEOUL_CENTER);

  // Booking Form
  const [bookingForm, setBookingForm] = useState({
    petId: selectedPetId || "",
    serviceName: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    startTime: "10:00",
    notes: "",
  });

  // Filter providers
  const filteredProviders = useMemo(() => {
    let result = providers;
    
    if (activeCategory !== "all") {
      result = result.filter(p => p.type === activeCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.address.toLowerCase().includes(query) ||
        p.services.some(s => s.toLowerCase().includes(query))
      );
    }
    
    return result;
  }, [providers, activeCategory, searchQuery]);

  // Generate markers with coordinates
  const markers: MapMarker[] = useMemo(() => {
    return filteredProviders.map((provider, idx) => ({
      id: provider.id,
      ...generateDummyCoordinates(idx),
      type: provider.type,
      provider,
    }));
  }, [filteredProviders]);

  // Handle booking
  const handleBooking = () => {
    if (!selectedProvider || !bookingForm.petId || !bookingForm.serviceName) return;

    const pet = pets.find(p => p.id === bookingForm.petId);
    if (!pet) return;

    const startDateTime = new Date(`${bookingForm.startDate}T${bookingForm.startTime}`);
    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(endDateTime.getHours() + 1);

    // Create booking
    createBooking({
      providerId: selectedProvider.id,
      providerName: selectedProvider.name,
      petId: pet.id,
      petName: pet.name,
      petInfo: {
        id: pet.id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed || "",
        age: pet.birthDate ? Math.floor((Date.now() - new Date(pet.birthDate).getTime()) / 31536000000) : 0,
        gender: pet.gender,
        weight: pet.weight || 0,
        allergies: pet.allergies || [],
      },
      serviceType: selectedProvider.type,
      serviceName: bookingForm.serviceName,
      startDate: bookingForm.startDate,
      endDate: bookingForm.startDate,
      status: "confirmed",
      totalPrice: 50000,
      notes: bookingForm.notes,
    });

    // Add to calendar
    addCalendarEvent({
      title: `${selectedProvider.name} - ${bookingForm.serviceName}`,
      start: startDateTime,
      end: endDateTime,
      type: selectedProvider.type === "hospital" ? "health" : selectedProvider.type,
      petId: pet.id,
      petName: pet.name,
      location: selectedProvider.address,
      serviceProvider: selectedProvider.name,
    });

    setIsBookingOpen(false);
    setIsDetailOpen(false);
    setBookingForm({
      petId: selectedPetId || "",
      serviceName: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
      startTime: "10:00",
      notes: "",
    });
  };

  // Place Store
  const addRecent = usePlaceStore((state) => state.addRecent);
  const toggleSave = usePlaceStore((state) => state.toggleSave);
  const isSaved = usePlaceStore((state) => state.isSaved);

  // Open detail (최근 본 장소에 추가)
  const handleMarkerClick = (provider: ServiceProvider) => {
    addRecent(provider); // 최근 본 장소에 추가
    setSelectedProvider(provider);
    setIsDetailOpen(true);
  };

  return (
    <div className="h-full flex flex-col relative" style={{ height: "calc(100vh - 64px - 64px)" }}>
      {/* ============================================ */}
      {/* Floating Search Header */}
      {/* ============================================ */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-4">
        {/* Search Bar */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 flex items-center px-4 py-3 gap-3">
          <Search size={20} className="text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="장소, 서비스 검색..."
            className="flex-1 outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")}>
              <X size={18} className="text-gray-400 dark:text-gray-500" />
            </button>
          )}
        </div>

        {/* Category Chips */}
        <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
                whitespace-nowrap transition-all border
                ${activeCategory === cat.id 
                  ? "bg-orange-500 dark:bg-orange-400 text-white border-orange-500 dark:border-orange-400 shadow-md" 
                  : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-slate-600 hover:border-orange-300 dark:hover:border-orange-400"
                }
              `}
            >
              <span className="text-base">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================ */}
      {/* Map View */}
      {/* ============================================ */}
      {viewMode === "map" && (
        <div className="flex-1 bg-gray-100 relative">
          {/* Mock Map Background */}
          <div 
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(90deg, #e5e5e5 1px, transparent 1px),
                linear-gradient(180deg, #e5e5e5 1px, transparent 1px),
                linear-gradient(90deg, #f0f0f0 1px, transparent 1px),
                linear-gradient(180deg, #f0f0f0 1px, transparent 1px)
              `,
              backgroundSize: "100px 100px, 100px 100px, 20px 20px, 20px 20px",
              backgroundColor: "#f8f8f8",
            }}
          />

          {/* Map Markers */}
          <div className="absolute inset-0 pt-32">
            {markers.map((marker, idx) => {
              const top = 20 + (idx % 4) * 25;
              const left = 10 + (idx % 5) * 18;
              
              return (
                <div
                  key={marker.id}
                  className="absolute transition-all duration-300"
                  style={{ 
                    top: `${top}%`, 
                    left: `${left}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <MapMarkerPin
                    type={marker.type}
                    isSelected={selectedProvider?.id === marker.id}
                    onClick={() => handleMarkerClick(marker.provider)}
                  />
                </div>
              );
            })}
          </div>

          {/* Re-search Button */}
          <button className="absolute top-36 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
            <RefreshCw size={16} />
            이 지역 재검색
          </button>

          {/* Current Location Button */}
          <button className="absolute bottom-28 right-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all">
            <Navigation size={20} className="text-gray-700" />
          </button>
        </div>
      )}

      {/* ============================================ */}
      {/* List View */}
      {/* ============================================ */}
      {viewMode === "list" && (
        <div className="flex-1 bg-gray-50 pt-32 overflow-y-auto">
          <div className="px-4 pb-24 space-y-4">
            {/* Results Count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                검색 결과 <span className="font-bold text-gray-900">{filteredProviders.length}</span>개
              </p>
              <button className="text-sm text-orange-500 font-medium">
                거리순
              </button>
            </div>

            {/* Service Cards */}
            {filteredProviders.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-gray-500">검색 결과가 없어요</p>
                <p className="text-sm text-gray-400 mt-1">다른 검색어로 시도해보세요</p>
              </div>
            ) : (
              filteredProviders.map((provider, idx) => (
                <ServiceCard
                  key={provider.id}
                  provider={provider}
                  distance={`${(0.5 + idx * 0.3).toFixed(1)}km`}
                  onClick={() => handleMarkerClick(provider)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* View Toggle Button */}
      {/* ============================================ */}
      <button
        onClick={() => setViewMode(viewMode === "map" ? "list" : "map")}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-6 py-3 bg-orange-500 dark:bg-orange-400 text-white rounded-full shadow-lg font-medium hover:bg-orange-600 dark:hover:bg-orange-500 transition-all"
      >
        {viewMode === "map" ? (
          <>
            <List size={18} />
            목록보기
          </>
        ) : (
          <>
            <MapIcon size={18} />
            지도보기
          </>
        )}
      </button>

      {/* ============================================ */}
      {/* Provider Detail Bottom Sheet */}
      {/* ============================================ */}
      {isDetailOpen && selectedProvider && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsDetailOpen(false)}
          />
          
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-800 rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slide-up">
            {/* Handle */}
            <div className="sticky top-0 bg-white dark:bg-slate-800 pt-3 pb-2 z-10">
              <div className="w-10 h-1 bg-gray-300 dark:bg-slate-600 rounded-full mx-auto" />
            </div>

            {/* Hero Section */}
            <div className="relative h-48 overflow-hidden">
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{ 
                  backgroundColor: selectedProvider.type === "grooming" ? "#fce7f3" :
                                   selectedProvider.type === "hospital" ? "#fee2e2" :
                                   selectedProvider.type === "hotel" ? "#dbeafe" : "#dcfce7"
                }}
              >
                <span className="text-7xl opacity-30">
                  {selectedProvider.type === "grooming" && "✂️"}
                  {selectedProvider.type === "hospital" && "🏥"}
                  {selectedProvider.type === "hotel" && "🏨"}
                  {selectedProvider.type === "training" && "🎓"}
                </span>
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => setIsDetailOpen(false)}
                className="absolute top-4 left-4 w-9 h-9 bg-white/90 dark:bg-slate-800/90 rounded-full flex items-center justify-center shadow"
              >
                <ChevronLeft size={20} className="text-gray-700 dark:text-gray-200" />
              </button>
              
              {/* Favorite Button */}
              <button 
                onClick={() => toggleSave(selectedProvider.id)}
                className="absolute top-4 right-4 w-9 h-9 bg-white/90 dark:bg-slate-800/90 rounded-full flex items-center justify-center shadow"
              >
                <Heart 
                  size={20} 
                  className={isSaved(selectedProvider.id) 
                    ? "text-red-500 fill-red-500" 
                    : "text-gray-600 dark:text-gray-300"
                  } 
                />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 py-4">
              {/* Title */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Badge variant="primary" className="mb-2">
                    {serviceTypeLabels[selectedProvider.type]}
                  </Badge>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {selectedProvider.name}
                  </h2>
                </div>
                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-gray-900">{selectedProvider.rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-500">({selectedProvider.reviewCount})</span>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin size={18} className="text-gray-400" />
                  <span className="text-sm">{selectedProvider.address}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone size={18} className="text-gray-400" />
                  <span className="text-sm">{selectedProvider.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Clock size={18} className="text-gray-400" />
                  <span className="text-sm">{selectedProvider.hours}</span>
                </div>
              </div>

              {/* Services */}
              <div className="mb-5">
                <h3 className="font-bold text-gray-900 mb-2">제공 서비스</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProvider.services.map((service, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              {selectedProvider.description && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-2">소개</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {selectedProvider.description}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pb-6">
                <button className="flex-1 py-3 border-2 border-orange-500 text-orange-500 rounded-2xl font-bold hover:bg-orange-50 transition-all">
                  <Phone size={18} className="inline mr-2" />
                  전화하기
                </button>
                <button 
                  onClick={() => {
                    setBookingForm({ ...bookingForm, serviceName: selectedProvider.services[0] || "" });
                    setIsBookingOpen(true);
                  }}
                  className="flex-1 py-3 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all"
                >
                  <Calendar size={18} className="inline mr-2" />
                  예약하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* Booking Modal */}
      {/* ============================================ */}
      <Modal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        title={`📅 ${selectedProvider?.name} 예약`}
      >
        <div className="space-y-4">
          <Select
            label="반려견 선택"
            value={bookingForm.petId}
            onChange={(e) => setBookingForm({ ...bookingForm, petId: e.target.value })}
            options={pets.map(p => ({ value: p.id, label: p.name }))}
          />
          
          <Select
            label="서비스 선택"
            value={bookingForm.serviceName}
            onChange={(e) => setBookingForm({ ...bookingForm, serviceName: e.target.value })}
            options={selectedProvider?.services.map(s => ({ value: s, label: s })) || []}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="날짜"
              type="date"
              value={bookingForm.startDate}
              onChange={(e) => setBookingForm({ ...bookingForm, startDate: e.target.value })}
            />
            <Input
              label="시간"
              type="time"
              value={bookingForm.startTime}
              onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
            />
          </div>

          <Input
            label="요청사항"
            placeholder="특별 요청사항을 입력해주세요"
            value={bookingForm.notes}
            onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
          />

          <Button variant="primary" className="w-full rounded-2xl py-3" onClick={handleBooking}>
            예약 확정하기
          </Button>
        </div>
      </Modal>

      {/* Styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
