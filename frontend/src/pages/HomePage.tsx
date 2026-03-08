import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3001/api/v1/auth/google';
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <img
            src="/lingoria_text_logo.png"
            alt="Lingoria"
            className="h-8 md:h-10"
          />
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 text-white font-semibold border-2 border-white/30 hover:bg-white/10 hover:border-white/50 rounded-xl transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-2 bg-white text-purple-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 md:py-20">
        {/* Main CTA Box */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-4xl mx-auto mb-16">
          <div className="text-center mb-8">
            <img
              src="/lingoria_text_logo.png"
              alt="Lingoria"
              className="h-16 md:h-20 mx-auto mb-6"
            />
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Learn English from A1 to C2 with AI-powered lessons
            </p>
          </div>

          <div className="space-y-4 max-w-md mx-auto">
            {/* Google Login */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-xl px-6 py-4 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-semibold text-gray-700">
                Continue with Google
              </span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or</span>
              </div>
            </div>

            {/* Email Signup */}
            <button
              onClick={() => navigate('/register')}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              Sign Up with Email
            </button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="bg-transparent text-blue-600 font-semibold border-2 border-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-700 rounded-xl px-4 py-2 transition-all"
              >
                Sign In
              </button>
            </p>
          </div>

          {/* Features */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl mb-2">🎯</div>
                <p className="text-sm font-semibold text-gray-700">
                  6 CEFR Levels
                </p>
              </div>
              <div>
                <div className="text-3xl mb-2">🤖</div>
                <p className="text-sm font-semibold text-gray-700">
                  AI-Powered
                </p>
              </div>
              <div>
                <div className="text-3xl mb-2">🎮</div>
                <p className="text-sm font-semibold text-gray-700">Gamified</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto text-white">
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-2">Structured Learning</h3>
            <p className="text-white/80">
              Progress through A1 to C2 levels with comprehensive lessons,
              exercises, and exams.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold mb-2">AI Teacher</h3>
            <p className="text-white/80">
              Get instant explanations for your mistakes with our Groq-powered
              AI assistant.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Track Progress</h3>
            <p className="text-white/80">
              Monitor your improvement with detailed reports, XP tracking, and
              streak counters.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-white/60 text-sm">
          <p>
            By continuing, you agree to Lingoria's Terms of Service and Privacy
            Policy
          </p>
        </div>
      </main>
    </div>
  );
}
