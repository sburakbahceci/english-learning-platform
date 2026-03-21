import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { levelsService } from '../services/levels.service';
import { placementTestService } from '../services/placement-test.service';
import { authService } from '../services/auth.service';
import type { Level } from '../types';

interface LevelWithProgress extends Level {
  isLocked: boolean;
  progress?: number;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [levels, setLevels] = useState<LevelWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStartingLevel, setUserStartingLevel] = useState<string>('');

  useEffect(() => {
    checkPlacementTestAndFetchLevels();
  }, []);

  const checkPlacementTestAndFetchLevels = async () => {
    try {
      // Placement test yapılmış mı kontrol et
      const { data: statusData } = await placementTestService.getStatus();

      if (!statusData.completed) {
        navigate('/placement-test');
        return;
      }

      // User bilgisini al
      const token = localStorage.getItem('auth_token');
      if (!token) {
        navigate('/login');
        return;
      }

      // ✅ authService kullan (zaten var)
      const userData = await authService.getCurrentUser(token);
      const startingLevel = userData.data?.startingLevel || 'A1';

      setUserStartingLevel(startingLevel);

      // Seviyeleri getir
      const { data: levelsData } = await levelsService.getAllLevels();
      const sortedLevels = levelsData.sort((a, b) => a.order - b.order);

      // Starting level'ın index'ini bul
      const startingLevelIndex = sortedLevels.findIndex(
        (l) => l.code === startingLevel
      );

      if (startingLevelIndex === -1) {
        console.error('❌ Starting level not found:', startingLevel);
        // Fallback: A1'i unlock et
        const levelsWithLock = sortedLevels.map((level) => ({
          ...level,
          isLocked: level.code !== 'A1',
        }));
        setLevels(levelsWithLock);
        return;
      }

      // Lock/Unlock belirle
      const levelsWithLock = sortedLevels.map((level, index) => {
        const isLocked = index > startingLevelIndex;
        return {
          ...level,
          isLocked,
        };
      });

      setLevels(levelsWithLock);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLevelClick = (level: LevelWithProgress) => {
    if (level.isLocked) {
      alert(
        `This level is locked! Complete ${levels[levels.findIndex((l) => l.code === level.code) - 1]?.code || 'previous'} level to unlock.`
      );
      return;
    }
    navigate(`/levels/${level.code}`);
  };

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img
                src="/lingoria_text_logo.png"
                alt="Lingoria"
                className="h-6 md:h-8"
              />
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => navigate('/ai-chat')}
                className="flex items-center gap-1.5 px-2 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all text-xs md:text-sm font-medium"
              >
                <span className="text-base md:text-lg">🤖</span>
                <span className="hidden sm:inline">AI Assistant</span>
                <span className="sm:hidden">AI</span>
              </button>
              <div className="flex items-center gap-1 bg-yellow-50 px-2 md:px-3 py-1 md:py-1.5 rounded-lg">
                <span className="text-base md:text-lg">⭐</span>
                <span className="text-xs md:text-sm font-bold text-yellow-600">
                  {user?.totalXp || 0}
                  <span className="hidden md:inline"> XP</span>
                </span>
              </div>
              <div className="flex items-center gap-1 bg-blue-50 px-2 md:px-3 py-1 md:py-1.5 rounded-lg">
                <span className="text-xs md:text-sm font-bold text-blue-600">
                  {userStartingLevel || 'A1'}
                </span>
              </div>
              {user.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-gray-200"
                />
              )}
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <span>🚪</span>
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Your Learning Path
          </h2>
          <p className="text-gray-600">
            {userStartingLevel
              ? `Starting from ${userStartingLevel} level. Complete lessons to unlock higher levels!`
              : 'Choose a level to start learning'}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {levels.map((level) => (
              <div
                key={level.id}
                className={`bg-white rounded-lg shadow-md p-6 transition-all ${
                  level.isLocked
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-lg cursor-pointer'
                }`}
                onClick={() => handleLevelClick(level)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className={`text-2xl font-bold ${
                      level.isLocked ? 'text-gray-400' : 'text-blue-600'
                    }`}
                  >
                    {level.code}
                  </h3>
                  {!level.isLocked && (
                    <span className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                      ✓ Unlocked
                    </span>
                  )}
                </div>

                <h4
                  className={`text-xl font-semibold mb-2 ${
                    level.isLocked ? 'text-gray-400' : 'text-gray-900'
                  }`}
                >
                  {level.name}
                </h4>

                <p
                  className={`text-sm mb-4 ${
                    level.isLocked ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {level.description}
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLevelClick(level);
                  }}
                  disabled={level.isLocked}
                  className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                    level.isLocked
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {level.isLocked ? 'Locked 🔒' : 'Start Learning →'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* AI Assistant Card */}
        <div className="mt-8">
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-2xl shadow-lg p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-5xl">🤖</div>
                  <div>
                    <h3 className="text-2xl font-bold">
                      Lingoria AI English Assistant
                    </h3>
                    <p className="text-purple-100">
                      Your personal English learning companion
                    </p>
                  </div>
                </div>
                <p className="text-white/90 mb-4">
                  Get instant help with grammar, vocabulary, pronunciation, and
                  more. Available 24/7!
                </p>
                <ul className="space-y-2 text-sm text-white/80 mb-6">
                  <li>✓ Ask questions about English grammar</li>
                  <li>✓ Practice conversations</li>
                  <li>✓ Get vocabulary explanations</li>
                  <li>✓ Improve your writing skills</li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/ai-chat')}
                className="px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:bg-gray-50 transition-all shadow-lg ml-6"
              >
                Start Chatting →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
