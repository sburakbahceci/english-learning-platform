import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { userService } from '../services/user.service';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get token from URL
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (!token) {
          throw new Error('No token provided');
        }

        // ✅ Consistent key - underscore
        localStorage.setItem('auth_token', token);

        // Get user profile
        const { data: user } = await userService.getProfile();

        // Save to store
        setAuth(user, token);

        // Redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Auth callback error:', error);
        setError('Authentication failed');

        // Redirect to login after 2 seconds
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    handleCallback();
  }, [navigate, setAuth]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-4xl mb-4">✕</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Authentication Failed
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Signing you in...
        </h2>
        <p className="text-gray-600">Completing authentication</p>
      </div>
    </div>
  );
}
