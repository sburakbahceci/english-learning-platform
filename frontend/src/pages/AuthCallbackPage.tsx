import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { userService } from '../services/user.service';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get token from URL
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (!token) {
          throw new Error('No token provided');
        }

        // Store token temporarily
        localStorage.setItem('auth-token', token);

        // Get user profile
        const { data: user } = await userService.getProfile();

        // Save to store
        setAuth(user, token);

        // Redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Authenticating...</p>
      </div>
    </div>
  );
}
