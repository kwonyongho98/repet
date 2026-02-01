import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Check,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { usePetStore } from '../../stores/usePetStore';
import { useBookingStore } from '../../stores/useBookingStore';
import { useServiceStore } from '../../stores/useServiceStore';
import { useUIStore } from '../../stores/useUIStore';
import {
  ServiceSelector,
  BookingDatePicker,
} from '../../components/booking';
import { Button, TextArea, Modal } from '../../components/common';
import { serviceTypeConfig } from '../../types/provider';

// ============================================
// Booking Steps
// ============================================
type BookingStep = 'service' | 'date' | 'pet' | 'confirm';

const STEPS: { id: BookingStep; label: string }[] = [
  { id: 'service', label: '서비스 선택' },
  { id: 'date', label: '날짜 선택' },
  { id: 'pet', label: '반려동물 선택' },
  { id: 'confirm', label: '예약 확인' },
];

// ============================================
// CreateBookingPage Component
// ============================================

export default function CreateBookingPage() {
  const navigate = useNavigate();
  const { providerId } = useParams<{ providerId: string }>();
  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get('serviceId');
  
  // Stores
  const user = useAuthStore((state) => state.user);
  const pets = usePetStore((state) => state.pets);
  const { providers } = useServiceStore();
  const {
    providerServices,
    isCreating,
    fetchProviderServices,
    fetchProviderAvailability,
    fetchProviderBlackouts,
    checkAvailability,
    createBooking,
  } = useBookingStore();
  const showToast = useUIStore((state) => state.showToast);
  
  // Local State
  const [currentStep, setCurrentStep] = useState<BookingStep>('service');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(preselectedServiceId);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [specialRequests, setSpecialRequests] = useState('');
  const [availability, setAvailability] = useState<any[]>([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // 업체 정보
  const provider = providers.find((p) => p.id === providerId);
  const selectedService = providerServices.find((s) => s.id === selectedServiceId);
  const selectedPet = pets.find((p) => p.id === selectedPetId);

  // 데이터 로드
  useEffect(() => {
    if (providerId) {
      fetchProviderServices(providerId);
      fetchProviderAvailability(providerId);
      fetchProviderBlackouts(providerId);
    }
  }, [providerId]);

  // 서비스 선택 시 가용성 체크
  useEffect(() => {
    if (providerId && selectedServiceId) {
      setIsCheckingAvailability(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      const twoMonthsLater = format(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
      
      checkAvailability(providerId, selectedServiceId, today, twoMonthsLater)
        .then((result) => setAvailability(result))
        .finally(() => setIsCheckingAvailability(false));
    }
  }, [providerId, selectedServiceId]);

  // Step Navigation
  const goToNextStep = () => {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].id);
    }
  };

  const goToPrevStep = () => {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id);
    } else {
      navigate(-1);
    }
  };

  // Can proceed to next step?
  const canProceed = () => {
    switch (currentStep) {
      case 'service': return !!selectedServiceId;
      case 'date': return !!selectedDate;
      case 'pet': return !!selectedPetId;
      case 'confirm': return true;
      default: return false;
    }
  };

  // Handle booking creation
  const handleCreateBooking = async () => {
    if (!providerId || !selectedServiceId || !selectedDate || !selectedPetId) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    const booking = await createBooking({
      providerId,
      serviceId: selectedServiceId,
      petId: selectedPetId,
      startDate: dateStr,
      endDate: dateStr,
      specialRequests: specialRequests || undefined,
    });

    if (booking) {
      setShowSuccessModal(true);
    } else {
      showToast('예약에 실패했습니다. 다시 시도해 주세요.', 'error');
    }
  };

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  if (!providerId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">업체를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={goToPrevStep} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
            <ChevronLeft size={24} className="text-gray-600 dark:text-gray-300" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">예약하기</h1>
            {provider && <p className="text-sm text-gray-500 dark:text-gray-400">{provider.name}</p>}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex-1 h-1 rounded-full transition-colors"
                style={{ backgroundColor: idx <= currentStepIndex ? '#f97316' : '#e5e7eb' }} />
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-500">{currentStepIndex + 1}/{STEPS.length} · {STEPS[currentStepIndex].label}</p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-4">
        {/* Step: Service Selection */}
        {currentStep === 'service' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">서비스를 선택해 주세요</h2>
            <ServiceSelector
              services={providerServices}
              selectedServiceId={selectedServiceId}
              onSelect={setSelectedServiceId}
            />
          </div>
        )}

        {/* Step: Date Selection */}
        {currentStep === 'date' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">날짜를 선택해 주세요</h2>
            {isCheckingAvailability ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-orange-500" size={32} />
              </div>
            ) : (
              <BookingDatePicker
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                availability={availability}
              />
            )}
          </div>
        )}

        {/* Step: Pet Selection */}
        {currentStep === 'pet' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">반려동물을 선택해 주세요</h2>
            <div className="space-y-2">
              {pets.map((pet) => {
                const isSelected = selectedPetId === pet.id;
                return (
                  <button
                    key={pet.id}
                    onClick={() => setSelectedPetId(pet.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4
                      ${isSelected ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
                      style={{ backgroundColor: pet.color || '#3B82F6' }}>
                      {pet.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${isSelected ? 'text-orange-600' : 'text-gray-900 dark:text-white'}`}>{pet.name}</h4>
                      <p className="text-sm text-gray-500">{pet.species} · {pet.breed} · {pet.weight}kg</p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            {pets.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-gray-500 mb-4">등록된 반려동물이 없습니다.</p>
                <Button variant="outline" onClick={() => navigate('/pets')}>반려동물 등록하기</Button>
              </div>
            )}
          </div>
        )}

        {/* Step: Confirmation */}
        {currentStep === 'confirm' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">예약 정보를 확인해 주세요</h2>
            
            {/* Summary Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 space-y-4">
              {provider && (
                <div className="pb-4 border-b border-gray-100 dark:border-slate-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{provider.name}</h3>
                  <p className="text-sm text-gray-500">{provider.address}</p>
                </div>
              )}
              
              {selectedService && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">서비스</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedService.name}</span>
                </div>
              )}
              
              {selectedDate && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">날짜</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {format(selectedDate, 'yyyy년 M월 d일 (EEE)', { locale: ko })}
                  </span>
                </div>
              )}
              
              {selectedPet && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">반려동물</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedPet.name}</span>
                </div>
              )}
              
              {selectedService && (
                <div className="flex justify-between py-2 pt-4 border-t border-gray-100 dark:border-slate-700">
                  <span className="font-semibold text-gray-900 dark:text-white">예상 금액</span>
                  <span className="text-xl font-bold text-orange-500">{selectedService.basePrice.toLocaleString()}원</span>
                </div>
              )}
            </div>
            
            {/* Special Requests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">요청 사항 (선택)</label>
              <TextArea
                placeholder="특별히 요청하실 내용이 있으시면 입력해 주세요."
                rows={3}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
              />
            </div>
            
            {/* Notice */}
            <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
              <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                예약 확정 후 취소 시 위약금이 발생할 수 있습니다. 업체의 취소 정책을 확인해 주세요.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 p-4 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
        {currentStep === 'confirm' ? (
          <Button variant="primary" className="w-full" onClick={handleCreateBooking} disabled={isCreating}>
            {isCreating ? <><Loader2 className="animate-spin mr-2" size={18} />예약 중...</> : '예약하기'}
          </Button>
        ) : (
          <Button variant="primary" className="w-full" onClick={goToNextStep} disabled={!canProceed()}>
            다음 <ChevronRight size={18} className="ml-1" />
          </Button>
        )}
      </div>

      {/* Success Modal */}
      <Modal isOpen={showSuccessModal} onClose={() => { setShowSuccessModal(false); navigate('/bookings'); }} title="예약 완료">
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <Check size={32} className="text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">예약이 완료되었습니다!</h3>
          <p className="text-gray-500 mb-6">업체의 확정을 기다려 주세요.<br />확정되면 알림을 보내드립니다.</p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => { setShowSuccessModal(false); navigate('/bookings'); }}>내 예약 보기</Button>
            <Button variant="primary" className="flex-1" onClick={() => { setShowSuccessModal(false); navigate('/'); }}>홈으로</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
