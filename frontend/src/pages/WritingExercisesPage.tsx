import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { writingService } from '../services/writing.service';

interface Exercise {
  id: string;
  exercise_type: string;
  sentence: string;
  hint?: string;
  difficulty: number;
}

interface FeedbackData {
  is_correct: boolean;
  correct_answer: string;
  explanation?: string;
}

export default function WritingExercisesPage() {
  const { levelCode } = useParams<{ levelCode: string }>();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (levelCode) {
      fetchExercises();
    }
  }, [levelCode]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const { data } = await writingService.getExercisesByLevel(levelCode!);
      setExercises(data || []);
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = async () => {
    if (!userAnswer.trim() || !exercises[currentIndex]) {
      alert('Please enter an answer');
      return;
    }

    try {
      setIsChecking(true);
      const { data } = await writingService.checkExerciseAnswer(
        exercises[currentIndex].id,
        userAnswer
      );

      setFeedback(data);

      if (data.is_correct) {
        setScore((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Failed to check answer:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setUserAnswer('');
      setFeedback(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">
            No exercises available for this level
          </p>
        </div>
      </div>
    );
  }

  const currentExercise = exercises[currentIndex];
  const progress = ((currentIndex + 1) / exercises.length) * 100;

  // Sentence'i parse et (_____ yerine input koy)
  const renderSentence = () => {
    const parts = currentExercise.sentence.split('_____');

    if (parts.length === 1) {
      return (
        <div className="text-2xl font-medium text-gray-900 mb-8 flex items-center gap-2 flex-wrap">
          <span>{currentExercise.sentence}</span>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={feedback !== null}
            className="border-b-2 border-blue-500 outline-none px-2 py-1 min-w-[150px] text-center bg-blue-50 disabled:bg-gray-100"
            placeholder="?"
            autoFocus
          />
        </div>
      );
    }

    return (
      <div className="text-2xl font-medium text-gray-900 mb-8 flex items-center gap-2 flex-wrap">
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 && (
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={feedback !== null}
                className="border-b-2 border-blue-500 outline-none px-2 py-1 min-w-[150px] text-center bg-blue-50 disabled:bg-gray-100 mx-1"
                placeholder="?"
                autoFocus
              />
            )}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Writing Exercises
            </h1>
            <span className="text-sm font-medium text-gray-600">
              Question {currentIndex + 1} / {exercises.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            {/* Exercise Type Badge */}
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
              {currentExercise.exercise_type === 'grammar'
                ? '📝 Grammar'
                : '📚 Vocabulary'}
            </div>

            {/* Hint */}
            {currentExercise.hint && (
              <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Hint:</strong> {currentExercise.hint}
                </p>
              </div>
            )}

            {/* Sentence with Blank */}
            {renderSentence()}

            {/* Feedback */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mb-6 p-6 rounded-xl ${
                    feedback.is_correct
                      ? 'bg-green-50 border-2 border-green-300'
                      : 'bg-red-50 border-2 border-red-300'
                  }`}
                >
                  <p
                    className={`text-xl font-bold mb-2 ${
                      feedback.is_correct ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {feedback.is_correct ? '✅ Correct!' : '❌ Incorrect'}
                  </p>

                  {!feedback.is_correct && (
                    <p className="text-gray-700 mb-2">
                      <strong>Correct answer:</strong> {feedback.correct_answer}
                    </p>
                  )}

                  {feedback.explanation && (
                    <p className="text-gray-600 text-sm italic mt-3">
                      {feedback.explanation}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buttons */}
            <div className="flex gap-4">
              {!feedback ? (
                <button
                  onClick={handleCheck}
                  disabled={isChecking || !userAnswer.trim()}
                  className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isChecking ? 'Checking...' : 'Check Answer'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
                >
                  {currentIndex < exercises.length - 1
                    ? 'Next Exercise →'
                    : 'Complete ✓'}
                </button>
              )}
            </div>

            {/* Score */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Score: <strong className="text-blue-600">{score}</strong> /{' '}
                {currentIndex + (feedback ? 1 : 0)}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
