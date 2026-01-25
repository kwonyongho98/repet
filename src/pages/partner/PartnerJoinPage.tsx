import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Link2, Check, Loader2, AlertCircle } from 'lucide-react';
import { Button, Input } from '../../components/common';
import { usePartnerStore } from '../../stores/usePartnerStore';
import { useAuthStore } from '../../stores/useAuthStore';

export default function PartnerJoinPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const { acceptInvite } = usePartnerStore();

  const [code, setCode] = useState(searchParams.get('code') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Provider가 아니면 리다이렉트
  useEffect(() => {
    if (user && user.role !== 'provider') {
      alert('업체 계정으로만 파트너 초대를 수락할 수 있습니다.');
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      setError('초대 코드를 입력해주세요.');
      return;
    }

    if (!user?.providerId) {
      setError('업체 정보를 찾을 수 없습니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await acceptInvite(code.trim().toUpperCase(), user.providerId);
      setSuccess(true);
    } catch (err) {
      console.error('Error accepting invite:', err);
      setError(
        err instanceof Error ? err.message : '초대 수락에 실패했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            연결 완료!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            가족과 파트너 연결이 완료되었습니다.
            <br />
            이제 예약된 펫에 대한 알림장을 작성할 수 있습니다.
          </p>
          <Button
            variant="primary"
            className="w-full"
            onClick={() => navigate('/provider/dashboard')}
          >
            대시보드로 이동
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 max-w-md w-full">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Link2 className="w-10 h-10 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            파트너 초대
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            고객으로부터 받은 초대 코드를 입력하세요
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              초대 코드
            </label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="예: ABC123"
              className="text-center text-xl font-mono tracking-wider uppercase"
              maxLength={10}
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* 안내 */}
          <div className="p-4 bg-blue-50 dark:bg-slate-700 rounded-xl">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              연결 시 접근 가능한 정보
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>✓ 예약된 펫의 기본 정보</li>
              <li>✓ 알러지 및 건강 정보</li>
              <li>✓ 알림장(Care Note) 작성</li>
            </ul>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isLoading || !code.trim()}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              '파트너 연결하기'
            )}
          </Button>
        </form>

        {/* 하단 링크 */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ← 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
