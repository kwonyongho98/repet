import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/useAuthStore';
import { Loader2 } from 'lucide-react';

export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const { initialize } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          setError(error.message);
          return;
        }

        if (data.session) {
          // Check if user has a profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Profile fetch error:', profileError);
          }

          // If no profile exists, create one
          if (!profile) {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: data.session.user.id,
                email: data.session.user.email || '',
                name: data.session.user.user_metadata?.name || 
                      data.session.user.user_metadata?.full_name ||
                      data.session.user.email?.split('@')[0] || 
                      '사용자',
                role: 'family',
              });

            if (insertError) {
              console.error('Profile creation error:', insertError);
            }
          }

          // Initialize the auth store with the new session
          await initialize();

          // Check if user needs onboarding (no family_id)
          const { data: updatedProfile } = await supabase
            .from('profiles')
            .select('family_id')
            .eq('id', data.session.user.id)
            .single();

          if (!updatedProfile?.family_id) {
            // New user - redirect to onboarding
            navigate('/onboarding', { replace: true });
          } else {
            // Existing user - redirect to home
            navigate('/home', { replace: true });
          }
        } else {
          // No session, redirect to login
          navigate('/login', { replace: true });
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('인증 처리 중 오류가 발생했습니다.');
      }
    };

    handleAuthCallback();
  }, [navigate, initialize]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            로그인 오류
          </h1>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
          >
            다시 로그인하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">로그인 처리 중...</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
