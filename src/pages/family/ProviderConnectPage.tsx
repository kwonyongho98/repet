import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  QrCode,
  Loader2,
  Check,
  AlertCircle,
  PawPrint,
} from 'lucide-react';
import { Button, Input } from '../../components/common';
import { useProviderStore } from '../../stores/useProviderStore';
import { usePetStore } from '../../stores/usePetStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { serviceTypeConfig } from '../../types/provider';
import { supabase } from '../../lib/supabase';

export default function ProviderConnectPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const pets = usePetStore((state) => state.pets);
  const fetchPets = usePetStore((state) => state.fetchPets);
  const acceptInviteCode = useProviderStore((state) => state.acceptInviteCode);
  const fetchMyProviders = useProviderStore((state) => state.fetchMyProviders);

  const [step, setStep] = useState<'code' | 'select' | 'complete'>('code');
  const [inviteCode, setInviteCode] = useState('');
  const [providerInfo, setProviderInfo] = useState<any>(null);
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch pets on mount
  useEffect(() => {
    if (user?.familyId) {
      fetchPets(user.familyId);
    }
  }, [user?.familyId, fetchPets]);

  // Verify invite code
  const handleVerifyCode = async () => {
    if (!inviteCode.trim()) {
      setError('초대 코드를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Find invite by code
      const { data: invite, error: inviteError } = await supabase
        .from('provider_invites')
        .select(`
          *,
          service_providers (id, name, service_type, profile_image, phone, address)
        `)
        .eq('code', inviteCode.toUpperCase())
        .single();

      if (inviteError || !invite) {
        setError('유효하지 않은 초대 코드입니다.');
        setIsLoading(false);
        return;
      }

      // Check if expired
      if (new Date(invite.expires_at) < new Date()) {
        setError('만료된 초대 코드입니다.');
        setIsLoading(false);
        return;
      }

      // Check max uses
      if (invite.use_count >= invite.max_uses) {
        setError('사용 횟수를 초과한 초대 코드입니다.');
        setIsLoading(false);
        return;
      }

      setProviderInfo(invite.service_providers);
      setStep('select');
    } catch (err) {
      setError('오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle pet selection
  const togglePetSelection = (petId: string) => {
    setSelectedPetIds(prev =>
      prev.includes(petId)
        ? prev.filter(id => id !== petId)
        : [...prev, petId]
    );
  };

  // Connect to provider
  const handleConnect = async () => {
    if (selectedPetIds.length === 0) {
      setError('연결할 아이를 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await acceptInviteCode(inviteCode.toUpperCase(), selectedPetIds);
      if (success) {
        // Refresh my providers list
        if (user?.familyId) {
          fetchMyProviders(user.familyId);
        }
        setStep('complete');
      } else {
        setError('연결에 실패했습니다.');
      }
    } catch (err) {
      setError('오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const serviceConfig = providerInfo ? serviceTypeConfig[providerInfo.service_type as keyof typeof serviceTypeConfig] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-gray-100 dark:border-slate-700">
        <div className="h-14 px-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            선생님 연결하기
          </h1>
        </div>
      </header>

      <div className="p-6 max-w-lg mx-auto">
        {/* Step: Enter Code */}
        {step === 'code' && (
          <div>
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                초대 코드 입력
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                선생님께 받은 6자리 코드를 입력해주세요
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="초대 코드"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="ABCD12"
                maxLength={6}
                className="text-center text-2xl font-mono tracking-widest"
              />

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <Button
                variant="primary"
                className="w-full"
                onClick={handleVerifyCode}
                disabled={isLoading || inviteCode.length < 6}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : '확인'}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Select Pets */}
        {step === 'select' && providerInfo && (
          <div>
            {/* Provider Info */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 text-center">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4"
                style={{ backgroundColor: (serviceConfig?.color || '#6366f1') + '20' }}
              >
                {serviceConfig?.emoji || '🏪'}
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {providerInfo.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {serviceConfig?.label || providerInfo.service_type}
              </p>
              {providerInfo.address && (
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  📍 {providerInfo.address}
                </p>
              )}
            </div>

            {/* Pet Selection */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                연결할 아이 선택
              </h3>
              <div className="space-y-2">
                {pets.map((pet) => {
                  const isSelected = selectedPetIds.includes(pet.id);
                  return (
                    <button
                      key={pet.id}
                      onClick={() => togglePetSelection(pet.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                        isSelected
                          ? 'bg-green-50 dark:bg-green-900/30 ring-2 ring-green-500'
                          : 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: pet.color || '#6366f1' }}
                      >
                        {pet.profileImage ? (
                          <img
                            src={pet.profileImage}
                            alt={pet.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          pet.name.charAt(0)
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {pet.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {pet.breed}
                        </p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 dark:border-slate-600'
                        }`}
                      >
                        {isSelected && <Check size={14} className="text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl mb-4">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setStep('code')}
              >
                이전
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleConnect}
                disabled={isLoading || selectedPetIds.length === 0}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : '연결하기'}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Complete */}
        {step === 'complete' && (
          <div className="text-center py-8">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              연결 완료!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              <span className="font-bold">{providerInfo?.name}</span>과
              <br />
              연결되었습니다.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              이제 선생님이 작성한 알림장을
              <br />
              확인할 수 있어요 📝
            </p>

            <Button
              variant="primary"
              className="w-full"
              onClick={() => navigate('/home')}
            >
              홈으로 돌아가기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
