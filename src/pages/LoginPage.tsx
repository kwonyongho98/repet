import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { Mail, Loader2, ChevronRight } from 'lucide-react';
import type { SocialProvider } from '../types/auth';

// Kakao Icon SVG Component
const KakaoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 4C7.029 4 3 7.13 3 10.988c0 2.476 1.644 4.648 4.112 5.875l-.858 3.175a.375.375 0 00.57.407l3.777-2.493c.465.045.94.068 1.399.068 4.971 0 9-3.13 9-6.988C21 7.13 16.971 4 12 4z"
      fill="#000000"
    />
  </svg>
);

// Naver Icon SVG Component
const NaverIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M14.035 12.546L9.67 6H6v12h3.965v-6.546L14.33 18H18V6h-3.965v6.546z"
      fill="#FFFFFF"
    />
  </svg>
);

// Google Icon SVG Component
const GoogleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// Paw Icon for Logo
const PawIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="4" r="2"/>
    <circle cx="18" cy="8" r="2"/>
    <circle cx="4" cy="8" r="2"/>
    <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-7 0V15a5 5 0 0 1 5-5"/>
    <path d="M8 14a5 5 0 0 0-5 5v.5a3.5 3.5 0 0 0 7 0V19a5 5 0 0 0-5-5"/>
  </svg>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, lastLoginMethod, loginWithProvider, isLoading } = useAuthStore();
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'provider') {
        navigate('/provider/dashboard', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSocialLogin = async (provider: SocialProvider) => {
    try {
      setLoadingProvider(provider);
      setError(null);
      await loginWithProvider(provider);
    } catch (err) {
      console.error(`${provider} login failed:`, err);
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
      setLoadingProvider(null);
    }
  };

  const handleEmailSignup = () => {
    navigate('/signup');
  };

  const getProviderLabel = (method: SocialProvider | undefined) => {
    switch (method) {
      case 'kakao': return '카카오';
      case 'naver': return '네이버';
      case 'google': return 'Google';
      case 'email': return '이메일';
      default: return null;
    }
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col">
      {/* Brand Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        {/* Logo */}
        <div 
          className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-lg mb-6"
          style={{ backgroundColor: '#F97316' }}
        >
          <PawIcon />
        </div>
        
        {/* Brand Name */}
        <h1 className="text-4xl font-bold mb-3" style={{ color: '#1E3A5F' }}>
          Repet
        </h1>
        
        {/* Slogan */}
        <p className="text-gray-500 text-center text-lg leading-relaxed">
          가족과 함께하는<br />스마트한 반려동물 케어
        </p>
      </div>

      {/* Login Buttons */}
      <div className="px-6 pb-8 space-y-3">
        {/* Recently logged in tooltip */}
        {lastLoginMethod && (
          <div className="flex justify-center mb-4">
            <div className="bg-gray-800/90 text-white text-sm px-4 py-2 rounded-full flex items-center gap-2">
              <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-xs">✓</span>
              <span>최근 {getProviderLabel(lastLoginMethod)}로 로그인함</span>
            </div>
          </div>
        )}

        {/* Kakao Login - Main Button */}
        <button
          onClick={() => handleSocialLogin('kakao')}
          disabled={loadingProvider !== null}
          className="relative w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-semibold text-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          style={{ backgroundColor: '#FEE500', color: '#000000' }}
        >
          {loadingProvider === 'kakao' ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <KakaoIcon />
          )}
          <span>카카오로 시작하기</span>
          {lastLoginMethod === 'kakao' && (
            <span className="absolute right-4 text-xs bg-black/10 px-2 py-1 rounded-full">최근</span>
          )}
        </button>

        {/* Naver Login - Main Button */}
        <button
          onClick={() => handleSocialLogin('naver')}
          disabled={loadingProvider !== null}
          className="relative w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-semibold text-lg text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          style={{ backgroundColor: '#03C75A' }}
        >
          {loadingProvider === 'naver' ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <NaverIcon />
          )}
          <span>네이버로 시작하기</span>
          {lastLoginMethod === 'naver' && (
            <span className="absolute right-4 text-xs bg-white/20 px-2 py-1 rounded-full">최근</span>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 py-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm">또는</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Sub-action Buttons */}
        <div className="flex gap-6 justify-center">
          {/* Google Login */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={loadingProvider !== null}
              className="relative w-14 h-14 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center transition-all hover:border-gray-300 hover:shadow-md active:scale-95 disabled:opacity-50"
            >
              {loadingProvider === 'google' ? (
                <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
              ) : (
                <GoogleIcon />
              )}
              {lastLoginMethod === 'google' && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span>
              )}
            </button>
            <span className="text-xs text-gray-500">Google</span>
          </div>

          {/* Email Signup */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleEmailSignup}
              disabled={loadingProvider !== null}
              className="relative w-14 h-14 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center transition-all hover:border-gray-300 hover:shadow-md active:scale-95 disabled:opacity-50"
            >
              <Mail className="w-6 h-6 text-gray-600" />
              {lastLoginMethod === 'email' && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span>
              )}
            </button>
            <span className="text-xs text-gray-500">이메일</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 pb-8">
        <p className="text-center text-xs text-gray-400 leading-relaxed">
          로그인 시{' '}
          <a href="/terms" className="underline hover:text-gray-600">이용약관</a>
          {' '}및{' '}
          <a href="/privacy" className="underline hover:text-gray-600">개인정보처리방침</a>
          에 동의합니다.
        </p>

        {/* Provider Login Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/provider/login')}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <span>사업자이신가요?</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
