import { authService } from '../services/auth.service';

export default function HomePage() {
  const handleLogin = async () => {
    try {
      const { url } = await authService.getGoogleAuthUrl();
      window.location.href = url;
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            English Learning Platform
          </h1>
          <p className="text-gray-600">
            Master English from A1 to C2 with gamified learning
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-lg px-6 py-3 hover:bg-gray-50 transition-colors"
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-5 h-5"
            />
            <span className="font-medium text-gray-700">
              Continue with Google
            </span>
          </button>
        </div>

        <div className="mt-8 text-center">
          <div className="flex justify-center gap-4 text-sm text-gray-600">
            <span>✓ 6 CEFR Levels</span>
            <span>✓ Gamified</span>
            <span>✓ Free</span>
          </div>
        </div>
      </div>
    </div>
  );
}
