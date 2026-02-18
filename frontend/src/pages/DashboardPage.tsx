import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { levelsService } from '../services/levels.service';
import { authService } from '../services/auth.service';
import type { Level } from '../types';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [levels, setLevels] = useState<Level[]>([]); // ← DEĞİŞTİ
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const { data } = await levelsService.getAllLevels();
        setLevels(data);
      } catch (error) {
        console.error('Failed to fetch levels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLevels();
  }, []);

  const handleLogout = () => {
    logout();
    authService.logout();
  };

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          {/* Logo */}
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Lingoria
            </h1>
            <p className="text-xs text-gray-500">AI English Learning</p>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">XP: {user.totalXp}</p>
            </div>
            {user.avatarUrl && (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-10 h-10 rounded-full"
              />
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Choose Your Level
        </h2>
        <p className="text-gray-600 mb-8">
          Start your English learning journey with Lingoria
        </p>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {levels.map((level) => (
              <div
                key={level.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-blue-600">
                    {level.code}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {level.requiredXp} XP
                  </span>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {level.name}
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  {level.description}
                </p>
                <button
                  onClick={() => navigate(`/levels/${level.code}`)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Learning
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
