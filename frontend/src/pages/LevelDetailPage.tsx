import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { levelsService } from '../services/levels.service';
import { lessonsService } from '../services/lessons.service';
import { useAuthStore } from '../store/authStore';
import type { Level, Lesson, LessonCompletion } from '../types';

export default function LevelDetailPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [level, setLevel] = useState<Level | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completions, setCompletions] = useState<LessonCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!code) return;

        // Get level details
        const { data: levelData } = await levelsService.getLevelByCode(code);
        setLevel(levelData);

        // Get lessons
        const { data: lessonsData } = await lessonsService.getLessonsByLevel(
          levelData.id
        );
        setLessons(lessonsData);

        // Get completions (if authenticated)
        if (user) {
          try {
            const { data: completionsData } =
              await lessonsService.getUserCompletions(levelData.id);
            setCompletions(completionsData);
          } catch {
            // User might not have started this level yet
            console.log('No completions yet');
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [code, user]);

  const isLessonCompleted = (lessonId: string) => {
    return completions.some((c) => c.lessonId === lessonId);
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'grammar':
        return '📖';
      case 'vocabulary':
        return '📚';
      case 'practice':
        return '✍️';
      default:
        return '📝';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!level) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Level not found
          </h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {level.code} - {level.name}
              </h1>
              <p className="text-gray-600 mt-1">{level.description}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progress: {completions.length} / {lessons.length} lessons
            </span>
            <span className="text-sm text-gray-500">
              {lessons.length > 0
                ? Math.round((completions.length / lessons.length) * 100)
                : 0}
              %
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${lessons.length > 0 ? (completions.length / lessons.length) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Lessons</h2>

        {lessons.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">
              No lessons available yet for this level.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson, index) => {
              const completed = isLessonCompleted(lesson.id);
              return (
                <div
                  key={lesson.id}
                  className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all hover:shadow-lg ${
                    completed ? 'border-l-4 border-green-500' : ''
                  }`}
                  onClick={() => navigate(`/lessons/${lesson.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-4xl">
                        {getLessonIcon(lesson.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-500">
                            Lesson {index + 1}
                          </span>
                          {completed && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              ✓ Completed
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {lesson.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {lesson.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>⏱️ {lesson.estimatedMinutes} min</span>
                          <span>⭐ +{lesson.xpReward} XP</span>
                          <span className="capitalize">
                            {lesson.type === 'grammar' && '📖 Grammar'}
                            {lesson.type === 'vocabulary' && '📚 Vocabulary'}
                            {lesson.type === 'practice' && '✍️ Practice'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        {completed ? 'Review' : 'Start'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
