import { useState, useRef } from 'react';
import { Camera, X, Plus } from 'lucide-react';

interface PhotoUploadProps {
  photos: File[];
  existingPhotos: string[];
  onPhotosChange: (photos: File[]) => void;
  onExistingPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  required?: boolean;
}

export default function PhotoUpload({
  photos,
  existingPhotos,
  onPhotosChange,
  onExistingPhotosChange,
  maxPhotos = 5,
  required = false,
}: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  const totalPhotos = existingPhotos.length + photos.length;
  const canAddMore = totalPhotos < maxPhotos;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = maxPhotos - totalPhotos;
    const filesToAdd = files.slice(0, remainingSlots);

    if (filesToAdd.length === 0) return;

    // 파일 크기 체크 (5MB)
    const validFiles = filesToAdd.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name}은(는) 5MB를 초과합니다.`);
        return false;
      }
      return true;
    });

    // 미리보기 생성
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    onPhotosChange([...photos, ...validFiles]);

    // Input 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveNew = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    onPhotosChange(newPhotos);

    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const handleRemoveExisting = (index: number) => {
    const newExisting = [...existingPhotos];
    newExisting.splice(index, 1);
    onExistingPhotosChange(newExisting);
  };

  return (
    <div className="space-y-3">
      {/* 라벨 */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          📸 오늘의 사진
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <span className="text-xs text-gray-500">
          {totalPhotos}/{maxPhotos}
        </span>
      </div>

      {/* 사진 그리드 */}
      <div className="grid grid-cols-4 gap-2">
        {/* 기존 사진 */}
        {existingPhotos.map((url, index) => (
          <div
            key={`existing-${index}`}
            className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-700"
          >
            <img
              src={url}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemoveExisting(index)}
              className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ))}

        {/* 새 사진 미리보기 */}
        {previews.map((preview, index) => (
          <div
            key={`new-${index}`}
            className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-700"
          >
            <img
              src={preview}
              alt={`New photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemoveNew(index)}
              className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            {/* 새 사진 표시 */}
            <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-orange-500 rounded-full">
              <span className="text-xs text-white font-medium">NEW</span>
            </div>
          </div>
        ))}

        {/* 추가 버튼 */}
        {canAddMore && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-600 flex flex-col items-center justify-center gap-1 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
          >
            <Plus className="w-6 h-6 text-gray-400" />
            <span className="text-xs text-gray-400">추가</span>
          </button>
        )}
      </div>

      {/* 필수 경고 */}
      {required && totalPhotos === 0 && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <Camera className="w-3 h-3" />
          최소 1장의 사진이 필요합니다
        </p>
      )}

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
