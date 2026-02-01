import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
  Store,
  Calendar,
  Image as ImageIcon,
  RefreshCw,
  Download,
} from "lucide-react";
import {
  format,
  parseISO,
  isSameMonth,
  startOfMonth,
  subMonths,
  addMonths,
} from "date-fns";
import { ko } from "date-fns/locale";

import { useAuthStore } from "../stores/useAuthStore";
import { usePetStore } from "../stores/usePetStore";
import { useProviderStore } from "../stores/useProviderStore";
import { useDailyLogStore } from "../stores/useDailyLogStore";
import {
  SkeletonPhotoGrid,
  ErrorState,
  EmptyState,
} from "../components/common";

// ============================================
// Types
// ============================================

type PhotoSource = "all" | "home" | "provider";

interface PhotoItem {
  id: string;
  url: string;
  date: string;
  source: "home" | "provider";
  sourceLabel: string;
  sourceType?: "walk" | "care_note";
  petId?: string;
  petName?: string;
}

// ============================================
// Album Page
// ============================================

export default function AlbumPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const pets = usePetStore((state) => state.pets);
  const selectedPetId = usePetStore((state) => state.selectedPetId);

  // Provider Store
  const careNotes = useProviderStore((state) => state.careNotes);
  const fetchCareNotes = useProviderStore((state) => state.fetchCareNotes);
  const providerLoading = useProviderStore((state) => state.isLoading);

  // Daily Log Store - ✅ 수정: walks → walkLogs, fetchLogs → fetchAllLogs
  const walks = useDailyLogStore((state) => state.walkLogs);
  const fetchAllLogs = useDailyLogStore((state) => state.fetchAllLogs);
  const logsLoading = useDailyLogStore((state) => state.isLoading);

  // State
  const [sourceFilter, setSourceFilter] = useState<PhotoSource>("all");
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [showViewer, setShowViewer] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Combined loading state
  const isLoading = providerLoading || logsLoading;

  // Fetch data - ✅ 수정: fetchLogs → fetchAllLogs with petIds
  const fetchData = useCallback(async () => {
    if (!user?.familyId) return;

    setError(null);
    try {
      // pets에서 petIds 추출
      const petIds = pets.map((p) => p.id);

      await Promise.all([
        fetchCareNotes({ familyId: user.familyId }),
        petIds.length > 0 ? fetchAllLogs(petIds) : Promise.resolve(),
      ]);
    } catch (err) {
      setError("데이터를 불러오는데 실패했습니다");
    } finally {
      setIsInitialLoad(false);
    }
  }, [user?.familyId, pets, fetchCareNotes, fetchAllLogs]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Combine all photos from different sources
  const allPhotos: PhotoItem[] = useMemo(() => {
    const photos: PhotoItem[] = [];

    // 1. Photos from care notes (provider) - ✅ 안전장치 추가
    (careNotes || []).forEach((note) => {
      if (note.photos && note.photos.length > 0) {
        note.photos.forEach((url, idx) => {
          photos.push({
            id: `care-${note.id}-${idx}`,
            url,
            date: note.date,
            source: "provider",
            sourceLabel: note.provider?.name || "업체",
            sourceType: "care_note",
            petId: note.petId,
            petName: note.pet?.name,
          });
        });
      }
    });

    // 2. Photos from walk logs (home) - ✅ 안전장치 추가
    (walks || []).forEach((walk) => {
      if (walk.photoUrl) {
        // Find pet name
        const pet = pets.find((p) => p.id === walk.petId);
        photos.push({
          id: `walk-${walk.id}`,
          url: walk.photoUrl,
          date: walk.date,
          source: "home",
          sourceLabel: "산책",
          sourceType: "walk",
          petId: walk.petId,
          petName: pet?.name || walk.petName,
        });
      }
    });

    // Sort by date (newest first)
    photos.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    return photos;
  }, [careNotes, walks, pets]);

  // Filter photos
  const filteredPhotos = useMemo(() => {
    let result = allPhotos;

    // Filter by source
    if (sourceFilter !== "all") {
      result = result.filter((p) => p.source === sourceFilter);
    }

    // Filter by pet
    if (selectedPetId) {
      result = result.filter((p) => p.petId === selectedPetId);
    }

    // Filter by month
    result = result.filter((p) => {
      const photoDate = parseISO(p.date);
      return isSameMonth(photoDate, selectedMonth);
    });

    return result;
  }, [allPhotos, sourceFilter, selectedPetId, selectedMonth]);

  // Group by date
  const groupedPhotos = useMemo(() => {
    const groups: Record<string, PhotoItem[]> = {};

    filteredPhotos.forEach((photo) => {
      const dateKey = format(parseISO(photo.date), "M월 d일 (EEE)", {
        locale: ko,
      });
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(photo);
    });

    return groups;
  }, [filteredPhotos]);

  // Stats
  const stats = useMemo(() => {
    const monthPhotos = allPhotos.filter((p) =>
      isSameMonth(parseISO(p.date), selectedMonth),
    );
    return {
      total: monthPhotos.length,
      home: monthPhotos.filter((p) => p.source === "home").length,
      provider: monthPhotos.filter((p) => p.source === "provider").length,
    };
  }, [allPhotos, selectedMonth]);

  // Month navigation
  const handlePrevMonth = () => {
    setSelectedMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(selectedMonth, 1);
    if (nextMonth <= new Date()) {
      setSelectedMonth(nextMonth);
    }
  };

  const isNextMonthDisabled = addMonths(selectedMonth, 1) > new Date();

  // Open photo viewer
  const openViewer = (photoId: string) => {
    const index = filteredPhotos.findIndex((p) => p.id === photoId);
    if (index !== -1) {
      setViewerIndex(index);
      setShowViewer(true);
    }
  };

  // Retry handler
  const handleRetry = () => {
    setIsInitialLoad(true);
    fetchData();
  };

  // Error state
  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <AlbumHeader
          selectedMonth={selectedMonth}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          isNextMonthDisabled={isNextMonthDisabled}
        />
        <ErrorState type="network" message={error} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-4">
      {/* Header */}
      <AlbumHeader
        selectedMonth={selectedMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        isNextMonthDisabled={isNextMonthDisabled}
      />

      {/* Stats Bar */}
      <div className="px-4 py-3 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              전체{" "}
              <span className="font-bold text-gray-900 dark:text-white">
                {stats.total}
              </span>
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              🏠 <span className="font-medium">{stats.home}</span>
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              🏪 <span className="font-medium">{stats.provider}</span>
            </span>
          </div>
          {isLoading && !isInitialLoad && (
            <RefreshCw size={16} className="text-gray-400 animate-spin" />
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
        <FilterButton
          active={sourceFilter === "all"}
          onClick={() => setSourceFilter("all")}
          icon={<ImageIcon size={14} />}
          label="전체"
          count={stats.total}
        />
        <FilterButton
          active={sourceFilter === "home"}
          onClick={() => setSourceFilter("home")}
          icon={<Home size={14} />}
          label="우리집"
          count={stats.home}
        />
        <FilterButton
          active={sourceFilter === "provider"}
          onClick={() => setSourceFilter("provider")}
          icon={<Store size={14} />}
          label="업체"
          count={stats.provider}
        />
      </div>

      {/* Photo Grid */}
      <div className="px-4">
        {isLoading && isInitialLoad ? (
          <SkeletonPhotoGrid count={9} />
        ) : filteredPhotos.length === 0 ? (
          <EmptyState
            type="photos"
            message={`${format(selectedMonth, "M월", { locale: ko })}에는 사진이 없어요`}
            description="산책하면서 사진을 찍어보세요!"
          />
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedPhotos).map(([dateKey, photos]) => (
              <div key={dateKey}>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {dateKey}
                </h3>
                <div className="grid grid-cols-3 gap-1.5">
                  {photos.map((photo) => (
                    <PhotoThumbnail
                      key={photo.id}
                      photo={photo}
                      onClick={() => openViewer(photo.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photo Viewer Modal */}
      {showViewer && (
        <PhotoViewer
          photos={filteredPhotos}
          currentIndex={viewerIndex}
          onClose={() => setShowViewer(false)}
          onPrev={() => setViewerIndex((prev) => Math.max(0, prev - 1))}
          onNext={() =>
            setViewerIndex((prev) =>
              Math.min(filteredPhotos.length - 1, prev + 1),
            )
          }
        />
      )}

      {/* Scrollbar hide style */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// ============================================
// Album Header
// ============================================

interface AlbumHeaderProps {
  selectedMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  isNextMonthDisabled: boolean;
}

function AlbumHeader({
  selectedMonth,
  onPrevMonth,
  onNextMonth,
  isNextMonthDisabled,
}: AlbumHeaderProps) {
  return (
    <div className="px-4 py-3 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        📸 앨범
      </h1>

      {/* Month Selector */}
      <div className="flex items-center justify-between">
        <button
          onClick={onPrevMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-orange-500" />
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {format(selectedMonth, "yyyy년 M월", { locale: ko })}
          </span>
        </div>
        <button
          onClick={onNextMonth}
          disabled={isNextMonthDisabled}
          className={`p-2 rounded-lg transition-colors ${
            isNextMonthDisabled
              ? "opacity-30 cursor-not-allowed"
              : "hover:bg-gray-100 dark:hover:bg-slate-700"
          }`}
        >
          <ChevronRight
            size={20}
            className="text-gray-600 dark:text-gray-400"
          />
        </button>
      </div>
    </div>
  );
}

// ============================================
// Filter Button
// ============================================

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}

function FilterButton({
  active,
  onClick,
  icon,
  label,
  count,
}: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
        active
          ? "bg-orange-500 text-white"
          : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700"
      }`}
    >
      {icon}
      {label}
      {count !== undefined && count > 0 && (
        <span
          className={`text-xs ${active ? "text-orange-100" : "text-gray-400"}`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ============================================
// Photo Thumbnail
// ============================================

interface PhotoThumbnailProps {
  photo: PhotoItem;
  onClick: () => void;
}

function PhotoThumbnail({ photo, onClick }: PhotoThumbnailProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <button
      onClick={onClick}
      className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700 group"
    >
      {/* Loading placeholder */}
      {!loaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-slate-600" />
      )}

      {/* Error placeholder */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon size={24} className="text-gray-400" />
        </div>
      )}

      {/* Image */}
      <img
        src={photo.url}
        alt={photo.petName || ""}
        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />

      {/* Source indicator */}
      <div
        className={`absolute bottom-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm ${
          photo.source === "home"
            ? "bg-orange-500 text-white"
            : "bg-blue-500 text-white"
        }`}
      >
        {photo.source === "home" ? "🏠" : "🏪"}
      </div>

      {/* Pet name badge (on hover) */}
      {photo.petName && (
        <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/50 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
          {photo.petName}
        </div>
      )}
    </button>
  );
}

// ============================================
// Photo Viewer
// ============================================

interface PhotoViewerProps {
  photos: PhotoItem[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function PhotoViewer({
  photos,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: PhotoViewerProps) {
  const currentPhoto = photos[currentIndex];
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset loaded state when photo changes
  useEffect(() => {
    setImageLoaded(false);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        onPrev();
      } else if (e.key === "ArrowRight" && currentIndex < photos.length - 1) {
        onNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, photos.length, onPrev, onNext, onClose]);

  if (!currentPhoto) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
        <span className="text-sm font-medium">
          {currentIndex + 1} / {photos.length}
        </span>
        <button
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          onClick={() => {
            // Download image
            const link = document.createElement("a");
            link.href = currentPhoto.url;
            link.download = `photo-${currentPhoto.id}.jpg`;
            link.click();
          }}
        >
          <Download size={24} />
        </button>
      </div>

      {/* Image Container */}
      <div className="flex-1 flex items-center justify-center px-4 relative">
        {/* Loading indicator */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-3 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Previous button */}
        {currentIndex > 0 && (
          <button
            onClick={onPrev}
            className="absolute left-2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          >
            <ChevronLeft size={28} />
          </button>
        )}

        {/* Image */}
        <img
          src={currentPhoto.url}
          alt=""
          className={`max-w-full max-h-full object-contain transition-opacity duration-200 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Next button */}
        {currentIndex < photos.length - 1 && (
          <button
            onClick={onNext}
            className="absolute right-2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          >
            <ChevronRight size={28} />
          </button>
        )}
      </div>

      {/* Info Footer */}
      <div className="p-4 text-white bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              currentPhoto.source === "home" ? "bg-orange-500" : "bg-blue-500"
            }`}
          >
            {currentPhoto.source === "home" ? "🏠 " : "🏪 "}
            {currentPhoto.sourceLabel}
          </span>
          {currentPhoto.petName && (
            <span className="px-2.5 py-1 bg-white/20 rounded-full text-xs">
              {currentPhoto.petName}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-300">
          {format(parseISO(currentPhoto.date), "yyyy년 M월 d일 (EEEE)", {
            locale: ko,
          })}
        </p>
      </div>
    </div>
  );
}
