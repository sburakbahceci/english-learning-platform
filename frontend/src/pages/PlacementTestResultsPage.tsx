import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { placementTestService, type PlacementTestResult } from '../services/placement-test.service';

export default function PlacementTestResultsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<PlacementTestResult | null>(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const { data } = await placementTestService.completeTest();
      setResults(data);
    } catch (error) {
      console.error('Failed to load results:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Calculating your results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      A1: 'from-green-400 to-emerald-500',
      A2: 'from-blue-400 to-cyan-500',
      B1: 'from-yellow-400 to-orange-500',
      B2: 'from-purple-400 to-pink-500',
      C1: 'from-red-400 to-rose-500',
      C2: 'from-indigo-500 to-purple-600',
    };
    return colors[level] || 'from-gray-400 to-gray-500';
  };

  const getLevelName = (level: string) => {
    const names: Record<string, string> = {
      A1: 'Beginner',
      A2: 'Elementary',
      B1: 'Intermediate',
      B2: 'Upper Intermediate',
      C1: 'Advanced',
      C2: 'Proficiency',
    };
    return names[level] || level;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full"
      >
        {/* Congrats Icon */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-8xl mb-4"
          >
            🎉
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Congratulations!
          </h1>
          <p className="text-gray-600">You've completed the placement test</p>
        </div>

        {/* Level Badge */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <p className="text-gray-600 mb-3">Your English Level:</p>
          <div
            className={`inline-block px-12 py-6 bg-gradient-to-r ${getLevelColor(
              results.determinedLevel
            )} rounded-2xl shadow-lg`}
          >
            <div className="text-5xl font-bold text-white mb-2">
              {results.determinedLevel}
            </div>
            <div className="text-xl text-white/90">
              {getLevelName(results.determinedLevel)}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">
              {results.correctAnswers}
            </div>
            <div className="text-sm text-gray-600 mt-1">Correct</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">
              {results.totalQuestions}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-600">
              {results.percentage}%
            </div>
            <div className="text-sm text-gray-600 mt-1">Score</div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${results.percentage}%` }}
              transition={{ delay: 0.5, duration: 1 }}
              className={`bg-gradient-to-r ${getLevelColor(
                results.determinedLevel
              )} h-3 rounded-full`}
            />
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="font-bold text-blue-900 mb-2">What's Next?</h3>
          <p className="text-blue-800 text-sm leading-relaxed">
            Based on your results, we've unlocked all lessons up to{' '}
            <strong>{results.determinedLevel}</strong> level. You can start
            learning immediately! Complete lessons to unlock higher levels.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
        >
          Start Learning 🚀
        </button>
      </motion.div>
    </div>
  );
}
