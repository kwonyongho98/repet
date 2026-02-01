import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Users,
  PawPrint,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Link2,
  Home,
  Plus,
} from 'lucide-react';
import { Button, Input, Select } from '../components/common';
import { useAuthStore } from '../stores/useAuthStore';
import { usePetStore } from '../stores/usePetStore';
import { format } from 'date-fns';

type Step = 'welcome' | 'family-choice' | 'join-family' | 'user-info' | 'pet-info' | 'complete';

interface PetForm {
  name: string;
  species: string;
  breed: string;
  birthDate: string;
  gender: 'male' | 'female';
  weight: string;
  microchipId: string;
}

const defaultPetForm: PetForm = {
  name: '',
  species: 'dog',
  breed: '',
  birthDate: '',
  gender: 'male',
  weight: '',
  microchipId: '',
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const joinFamily = useAuthStore((state) => state.joinFamily);
  const addPet = usePetStore((state) => state.addPet);

  const [step, setStep] = useState<Step>('welcome');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [nickname, setNickname] = useState(user?.name || '');
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [petForm, setPetForm] = useState<PetForm>(defaultPetForm);
  const [skipPet, setSkipPet] = useState(false);

  // ============================================
  // Step handlers
  // ============================================
  
  const handleWelcomeNext = () => {
    setStep('family-choice');
  };

  const handleFamilyChoice = (choice: 'new' | 'join') => {
    if (choice === 'new') {
      setStep('user-info');
    } else {
      setStep('join-family');
    }
  };

  const handleJoinFamily = async () => {
    if (!inviteCode.trim()) {
      setError('초대 코드를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await joinFamily(inviteCode.trim());
      if (success) {
        setStep('pet-info');
      } else {
        setError('유효하지 않은 초대 코드입니다.');
      }
    } catch (err) {
      setError('가족 합류에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserInfoNext = async () => {
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await completeOnboarding(nickname.trim(), familyName || undefined);
      if (success) {
        setStep('pet-info');
      } else {
        setError('프로필 저장에 실패했습니다.');
      }
    } catch (err) {
      setError('오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePetRegister = async () => {
    if (!skipPet) {
      if (!petForm.name.trim()) {
        setError('반려동물 이름을 입력해주세요.');
        return;
      }
      if (!petForm.breed.trim()) {
        setError('품종을 입력해주세요.');
        return;
      }
      if (!petForm.birthDate) {
        setError('생년월일을 입력해주세요.');
        return;
      }
      if (!petForm.weight) {
        setError('체중을 입력해주세요.');
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!skipPet) {
        await addPet({
          name: petForm.name,
          species: petForm.species,
          breed: petForm.breed,
          birthDate: petForm.birthDate,
          gender: petForm.gender,
          weight: parseFloat(petForm.weight) || 0,
          color: '#3B82F6',
          microchipId: petForm.microchipId || undefined,
        });
      }
      
      setStep('complete');
    } catch (err) {
      setError('반려동물 등록에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    navigate('/home');
  };

  // ============================================
  // Render steps
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        {step !== 'welcome' && step !== 'complete' && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {['family-choice', 'user-info', 'pet-info'].map((s, idx) => {
              const stepOrder = ['welcome', 'family-choice', 'join-family', 'user-info', 'pet-info'];
              const currentIdx = stepOrder.indexOf(step);
              const dotIdx = idx + 1;
              const isActive = (step === 'join-family' && idx === 0) || 
                              (step === 'user-info' && idx === 1) || 
                              (step === 'pet-info' && idx === 2) ||
                              (step === 'family-choice' && idx === 0);
              const isPast = (step === 'user-info' && idx < 1) ||
                            (step === 'pet-info' && idx < 2) ||
                            (step === 'join-family' && idx < 0);
              
              return (
                <div
                  key={s}
                  className={`w-3 h-3 rounded-full transition-all ${
                    isActive
                      ? 'bg-orange-500 scale-110'
                      : isPast
                      ? 'bg-orange-300'
                      : 'bg-gray-300 dark:bg-slate-600'
                  }`}
                />
              );
            })}
          </div>
        )}

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">
          {/* Welcome Step */}
          {step === 'welcome' && (
            <div className="text-center">
              <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">🐾</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Repet에 오신 것을 환영합니다!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                반려동물과 함께하는 행복한 일상을
                <br />
                기록하고 관리해보세요
              </p>
              
              <div className="space-y-3 text-left mb-8">
                {[
                  { emoji: '📝', text: '산책, 식사, 건강 기록을 한 곳에서' },
                  { emoji: '👨‍👩‍👧‍👦', text: '가족과 함께 공유하고 관리' },
                  { emoji: '🏨', text: '펫호텔, 유치원 알림장 연동' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="text-gray-700 dark:text-gray-300">{item.text}</span>
                  </div>
                ))}
              </div>

              <Button variant="primary" className="w-full" onClick={handleWelcomeNext}>
                시작하기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {/* Family Choice Step */}
          {step === 'family-choice' && (
            <div>
              <button
                onClick={() => setStep('welcome')}
                className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                뒤로
              </button>

              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-blue-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  가족 설정
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  기존 가족에 합류하거나
                  <br />
                  새로운 가족을 만들어보세요
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleFamilyChoice('new')}
                  className="w-full p-4 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-2xl hover:border-orange-400 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center">
                      <Plus className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        새 가족 만들기
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        처음 시작하시는 분
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleFamilyChoice('join')}
                  className="w-full p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl hover:border-blue-400 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                      <Link2 className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        기존 가족에 합류
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        초대 코드가 있으신 분
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Join Family Step */}
          {step === 'join-family' && (
            <div>
              <button
                onClick={() => setStep('family-choice')}
                className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                뒤로
              </button>

              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Link2 className="w-10 h-10 text-blue-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  가족에 합류하기
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  가족에게 받은 초대 코드를 입력해주세요
                </p>
              </div>

              <div className="space-y-4">
                <Input
                  label="초대 코드"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="예: ABC123"
                  className="text-center text-xl tracking-widest uppercase"
                  maxLength={10}
                />

                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleJoinFamily}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    '합류하기'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* User Info Step */}
          {step === 'user-info' && (
            <div>
              <button
                onClick={() => setStep('family-choice')}
                className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                뒤로
              </button>

              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  프로필 설정
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  앱에서 사용할 이름을 알려주세요
                </p>
              </div>

              <div className="space-y-4">
                <Input
                  label="닉네임"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="예: 코코맘"
                />

                <Input
                  label="가족 이름 (선택)"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="예: 코코네 가족"
                  helperText="비워두면 '닉네임의 가족'으로 설정됩니다"
                />

                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleUserInfoNext}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      다음
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Pet Info Step */}
          {step === 'pet-info' && (
            <div>
              <button
                onClick={() => setStep('user-info')}
                className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                뒤로
              </button>

              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PawPrint className="w-10 h-10 text-purple-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  반려동물 등록
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  함께 사는 반려동물을 등록해주세요
                </p>
              </div>

              {!skipPet ? (
                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                  <Input
                    label="이름"
                    value={petForm.name}
                    onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
                    placeholder="예: 코코"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      label="종류"
                      value={petForm.species}
                      onChange={(e) => setPetForm({ ...petForm, species: e.target.value })}
                      options={[
                        { value: 'dog', label: '🐕 강아지' },
                        { value: 'cat', label: '🐱 고양이' },
                        { value: 'other', label: '🐾 기타' },
                      ]}
                    />

                    <Select
                      label="성별"
                      value={petForm.gender}
                      onChange={(e) => setPetForm({ ...petForm, gender: e.target.value as 'male' | 'female' })}
                      options={[
                        { value: 'male', label: '♂️ 남아' },
                        { value: 'female', label: '♀️ 여아' },
                      ]}
                    />
                  </div>

                  <Input
                    label="품종"
                    value={petForm.breed}
                    onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })}
                    placeholder="예: 골든 리트리버"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="생년월일"
                      type="date"
                      value={petForm.birthDate}
                      onChange={(e) => setPetForm({ ...petForm, birthDate: e.target.value })}
                      max={format(new Date(), 'yyyy-MM-dd')}
                    />

                    <Input
                      label="체중 (kg)"
                      type="number"
                      value={petForm.weight}
                      onChange={(e) => setPetForm({ ...petForm, weight: e.target.value })}
                      placeholder="예: 5.5"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <Input
                    label="등록번호 (선택)"
                    value={petForm.microchipId}
                    onChange={(e) => setPetForm({ ...petForm, microchipId: e.target.value })}
                    placeholder="15자리 동물등록번호"
                    helperText="나중에 등록하셔도 됩니다"
                  />
                </div>
              ) : (
                <div className="p-6 bg-gray-50 dark:bg-slate-700 rounded-2xl text-center">
                  <span className="text-4xl mb-3 block">🐾</span>
                  <p className="text-gray-600 dark:text-gray-300">
                    나중에 [펫 관리] 메뉴에서
                    <br />
                    반려동물을 등록할 수 있어요
                  </p>
                </div>
              )}

              {error && (
                <p className="text-red-500 text-sm text-center mt-4">{error}</p>
              )}

              <div className="flex flex-col gap-3 mt-6">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handlePetRegister}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : skipPet ? (
                    '시작하기'
                  ) : (
                    '등록 완료'
                  )}
                </Button>

                {!skipPet && (
                  <button
                    onClick={() => setSkipPet(true)}
                    className="text-gray-500 dark:text-gray-400 text-sm hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    나중에 등록하기
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Complete Step */}
          {step === 'complete' && (
            <div className="text-center">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                준비 완료! 🎉
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                이제 Repet과 함께
                <br />
                반려동물의 일상을 기록해보세요
              </p>

              <Button variant="primary" className="w-full" onClick={handleComplete}>
                <Home className="w-5 h-5 mr-2" />
                홈으로 이동
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
          계속 진행하면 서비스 이용약관 및 개인정보 처리방침에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}
