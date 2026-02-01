import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  ArrowLeft,
  Loader2,
  Phone,
  MapPin,
  FileText,
} from 'lucide-react';
import { Button, Input, TextArea } from '../../components/common';
import { useProviderStore } from '../../stores/useProviderStore';
import { useUIStore } from '../../stores/useUIStore';
import type { ServiceType, ProviderFormData } from '../../types/provider';

// Service Type Options
const serviceTypes: { value: ServiceType; label: string; emoji: string; description: string }[] = [
  { value: 'hotel', label: '펫호텔', emoji: '🏨', description: '숙박 및 돌봄 서비스' },
  { value: 'salon', label: '미용실', emoji: '✂️', description: '그루밍 및 미용 서비스' },
  { value: 'kindergarten', label: '유치원', emoji: '🎒', description: '주간 보육 서비스' },
  { value: 'hospital', label: '동물병원', emoji: '🏥', description: '의료 및 건강 서비스' },
  { value: 'training', label: '훈련소', emoji: '🎓', description: '훈련 및 교육 서비스' },
];

export default function ProviderRegisterPage() {
  const navigate = useNavigate();
  const registerProvider = useProviderStore((state) => state.registerProvider);
  const setViewMode = useUIStore((state) => state.setViewMode);

  const [step, setStep] = useState<'type' | 'info' | 'complete'>('type');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProviderFormData>({
    name: '',
    serviceType: 'hotel',
    description: '',
    address: '',
    phone: '',
    businessNumber: '',
  });

  const handleSelectType = (type: ServiceType) => {
    setFormData({ ...formData, serviceType: type });
    setStep('info');
  };

  const handleBack = () => {
    if (step === 'info') setStep('type');
    else navigate(-1);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('업체명을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const provider = await registerProvider(formData);
      if (provider) {
        setStep('complete');
      } else {
        setError('업체 등록에 실패했습니다.');
      }
    } catch (err) {
      setError('오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToProviderMode = () => {
    setViewMode('provider');
    navigate('/provider/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-gray-100 dark:border-slate-700">
        <div className="h-14 px-4 flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            업체 등록
          </h1>
        </div>
      </header>

      <div className="p-6 max-w-lg mx-auto">
        {/* Step: Select Type */}
        {step === 'type' && (
          <div>
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-10 h-10 text-blue-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                어떤 서비스를 운영하시나요?
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                운영하시는 업체 유형을 선택해주세요
              </p>
            </div>

            <div className="space-y-3">
              {serviceTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleSelectType(type.value)}
                  className="w-full p-4 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-600 rounded-2xl hover:border-blue-400 dark:hover:border-blue-500 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {type.emoji}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {type.label}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Business Info */}
        {step === 'info' && (
          <div>
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">
                  {serviceTypes.find(t => t.value === formData.serviceType)?.emoji}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                업체 정보 입력
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                기본 정보를 입력해주세요
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="업체명 *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="예: 해피펫호텔"
              />

              <Input
                label="연락처"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="010-1234-5678"
              />

              <Input
                label="주소"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="서울시 강남구..."
              />

              <Input
                label="사업자등록번호"
                value={formData.businessNumber}
                onChange={(e) => setFormData({ ...formData, businessNumber: e.target.value })}
                placeholder="123-45-67890"
              />

              <TextArea
                label="업체 소개"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="업체를 소개해주세요..."
                rows={3}
              />

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setStep('type')}
                >
                  이전
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : '등록하기'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step: Complete */}
        {step === 'complete' && (
          <div className="text-center py-8">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">🎉</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              등록 완료!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              업체 등록이 완료되었습니다.
              <br />
              이제 Provider 모드에서 고객을 관리할 수 있어요.
            </p>

            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={handleGoToProviderMode}
              >
                Provider 모드로 이동
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => navigate('/home')}
              >
                홈으로 돌아가기
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
