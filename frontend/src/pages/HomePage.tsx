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
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="mb-6">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Lingoria
            </h1>
            <p className="text-sm text-gray-500 mt-1">Learn English with AI</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome to Lingoria
          </h2>
          <p className="text-gray-600">
            Master English from A1 to C2 with gamified learning powered by AI
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
          <div className="flex justify-center gap-4 text-sm text-gray-600 mb-4">
            <span>✓ 6 CEFR Levels</span>
            <span>✓ AI-Powered</span>
            <span>✓ Gamified</span>
          </div>
          <p className="text-xs text-gray-400">
            By continuing, you agree to Lingoria's Terms of Service and Privacy
            Policy
          </p>
        </div>
      </div>
    </div>
  );
}
