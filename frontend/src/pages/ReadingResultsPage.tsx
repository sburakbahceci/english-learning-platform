import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { readingService } from '../services/reading.service';

interface Passage {
  id: string;
  title: string;
  content: string;
  reading_questions: Array<{
    id: string;
    question_text: string;
    options: string[];
    correct_answer: string;
    question_order: number;
  }>;
}

export default function ReadingResultsPage() {
  const { passageId } = useParams<{ passageId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [passage, setPassage] = useState<Passage | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    score = 0,
    correctCount = 0,
    totalQuestions = 0,
    timeSpent = 0,
    userAnswers = {},
  } = location.state || {};

  useEffect(() => {
    fetchPassage();
  }, [passageId]);

  const fetchPassage = async () => {
    try {
      setLoading(true);
      const { data } = await readingService.getPassageById(passageId!);
      setPassage(data);
    } catch (error) {
      console.error('Failed to fetch passage:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEmoji = (score: number) => {
    if (score >= 90) return '🎉';
    if (score >= 80) return '⭐';
    if (score >= 70) return '👍';
    if (score >= 60) return '📖';
    return '💪';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!passage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Passage not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-7xl mb-4">{getEmoji(score)}</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Reading Complete!</h1>
          <p className="text-gray-600">{passage.title}</p>
        </motion.div>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-6"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Score</h2>
            <div className={`text-7xl font-bold ${getScoreColor(score)} mb-2`}>
              {score}
              <span className="text-4xl">/100</span>
            </div>
            <div className="flex justify-center gap-8 mt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{correctCount}</p>
                <p className="text-sm text-gray-600">Correct</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{totalQuestions}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{formatTime(timeSpent)}</p>
                <p className="text-sm text-gray-600">Time</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mt-6">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ delay: 0.3, duration: 1 }}
                className={`h-3 rounded-full ${
                  score >= 80 ? 'bg-green-600' : score >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                }`}
              />
            </div>
          </div>
        </motion.div>

        {/* Detailed Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Question Review</h3>
          <div className="space-y-4">
            {passage.reading_questions.map((question, index) => {
              const userAnswer = userAnswers[index];
              const isCorrect = userAnswer === question.correct_answer;

              return (
                <div
                  key={question.id}
                  className={`p-4 rounded-lg border-2 ${
                    isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">
                      {isCorrect ? '✅' : '❌'}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-2">
                        {index + 1}. {question.question_text}
                      </p>
                      <div className="space-y-1">
                        <p className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                          <strong>Your answer:</strong> {userAnswer || 'Not answered'}
                        </p>
                        {!isCorrect && (
                          <p className="text-green-700">
                            <strong>Correct answer:</strong> {question.correct_answer}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-4"
        >
          <button
            onClick={() => navigate(`/reading/${passage.id}`)}
            className="flex-1 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-blue-700 transition-all shadow-lg"
          >
            Read Again 🔄
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 py-4 bg-white text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all shadow-lg border-2 border-gray-300"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    </div>
  );
}