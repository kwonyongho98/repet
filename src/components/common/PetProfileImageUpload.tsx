import { useRef, useState } from 'react';

// ============================================
// PetProfileImageUpload - 프로필 사진 업로드 컴포넌트
// ============================================

interface PetProfileImageUploadProps {
  /** 현재 이미지 URL (기존 사진 또는 새로 선택한 미리보기) */
  currentImage?: string;
  /** 펫 이름 (fallback 이니셜 표시용) */
  petName?: string;
  /** 펫 색상 (fallback 배경색) */
  petColor?: string;
  /** 파일 선택 시 콜백 (File 객체 전달) */
  onFileSelect: (file: File) => void;
  /** 사진 삭제 시 콜백 */
  onRemove?: () => void;
  /** 업로드 중 여부 */
  isUploading?: boolean;
  /** 크기 variant */
  size?: 'sm' | 'md' | 'lg';
}

export default function PetProfileImageUpload({
  currentImage,
  petName = '',
  petColor = '#F97316',
  onFileSelect,
  onRemove,
  isUploading = false,
  size = 'md',
}: PetProfileImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const sizeClasses = {
    sm: 'w-16 h-16 text-xl',
    md: 'w-24 h-24 text-3xl',
    lg: 'w-32 h-32 text-4xl',
  };

  const displayImage = previewUrl || currentImage;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 5MB 제한 체크
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 크기는 5MB 이하여야 합니다.');
      return;
    }

    // 미리보기 URL 생성
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // 부모에게 파일 전달
    onFileSelect(file);

    // input 초기화 (같은 파일 재선택 허용)
    e.target.value = '';
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onRemove?.();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 프로필 이미지 / 플레이스홀더 */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-bold relative overflow-hidden group transition-all duration-200 ring-3 ring-orange-200 dark:ring-orange-800/50 shadow-md ${
          isUploading ? 'opacity-60 cursor-wait' : 'cursor-pointer hover:ring-orange-400'
        }`}
        style={{ backgroundColor: displayImage ? 'transparent' : petColor }}
      >
        {displayImage ? (
          <img
            src={displayImage}
            alt={petName}
            className="w-full h-full object-cover"
          />
        ) : (
          petName.charAt(0) || '🐾'
        )}

        {/* 호버 오버레이 */}
        {!isUploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
        )}

        {/* 로딩 스피너 */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </button>

      {/* 히든 파일 인풋 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 버튼 영역 */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors disabled:opacity-50"
        >
          {displayImage ? '사진 변경' : '사진 추가'}
        </button>
        {displayImage && onRemove && (
          <>
            <span className="text-gray-300 text-xs">|</span>
            <button
              type="button"
              onClick={handleRemove}
              disabled={isUploading}
              className="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors disabled:opacity-50"
            >
              삭제
            </button>
          </>
        )}
      </div>
    </div>
  );
}
