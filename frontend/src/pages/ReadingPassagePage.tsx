import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { readingService } from '../services/reading.service';

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  question_order: number;
}

interface Passage {
  id: string;
  title: string;
  content: string;
  word_count: number;
  estimated_time: number;
  topic?: string;
  reading_questions: Question[];
  levels: {
    code: string;
    name: string;
  };
}

export default function ReadingPassagePage() {
  const { passageId } = useParams<{ passageId: string }>();
  const navigate = useNavigate();
  const [passage, setPassage] = useState<Passage | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<'reading' | 'questions'>('reading');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(
    new Set()
  );
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [startTime] = useState(Date.now());

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

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;

    setAnsweredQuestions((prev) => new Set(prev).add(currentQuestion));
    setUserAnswers((prev) => ({ ...prev, [currentQuestion]: selectedAnswer }));
  };

  const handleNext = () => {
    if (currentQuestion < passage!.reading_questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(userAnswers[currentQuestion + 1] || '');
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
      setSelectedAnswer(userAnswers[currentQuestion - 1] || '');
    }
  };

  const handleComplete = async () => {
    if (!passage) return;

    // Calculate score
    let correctCount = 0;
    passage.reading_questions.forEach((question, index) => {
      if (userAnswers[index] === question.correct_answer) {
        correctCount++;
      }
    });

    const score = Math.round(
      (correctCount / passage.reading_questions.length) * 100
    );
    const timeSpent = Math.round((Date.now() - startTime) / 1000); // seconds

    try {
      await readingService.completeReading(passage.id, score, timeSpent);

      // Navigate to results page with data
      navigate(`/reading/results/${passage.id}`, {
        state: {
          score,
          correctCount,
          totalQuestions: passage.reading_questions.length,
          timeSpent,
          userAnswers,
        },
      });
    } catch (error) {
      console.error('Failed to complete reading:', error);
      alert('Failed to save results. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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

  // READING PHASE
  if (phase === 'reading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            {/* Header */}
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-3">
                {passage.levels.code} - {passage.topic || 'Reading'}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {passage.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>📊 {passage.word_count} words</span>
                <span>⏱️ ~{passage.estimated_time} minutes</span>
              </div>
            </div>

            {/* Passage Content */}
            <div className="prose max-w-none mb-8">
              <div className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-lg">
                  {passage.content}
                </p>
              </div>
            </div>

            {/* Start Questions Button */}
            <button
              onClick={() => setPhase('questions')}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white text-lg font-bold rounded-xl hover:from-green-700 hover:to-blue-700 transition-all shadow-lg"
            >
              Answer Questions ({passage.reading_questions.length} questions) →
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // QUESTIONS PHASE
  const question = passage.reading_questions[currentQuestion];
  const isAnswered = answeredQuestions.has(currentQuestion);
  const allAnswered =
    answeredQuestions.size === passage.reading_questions.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header with Progress */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setPhase('reading')}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
            >
              ← Back to Passage
            </button>
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestion + 1} /{' '}
              {passage.reading_questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-green-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentQuestion + 1) / passage.reading_questions.length) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            {/* Question */}
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              {question.question_text}
            </h2>

            {/* Options */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isUserAnswer = userAnswers[currentQuestion] === option;

                let buttonClass =
                  'bg-white border-2 border-gray-300 text-gray-800 hover:border-blue-400 hover:bg-blue-50';

                if (isAnswered) {
                  if (isUserAnswer) {
                    buttonClass =
                      'bg-blue-100 border-2 border-blue-500 text-blue-900';
                  } else {
                    buttonClass =
                      'bg-gray-50 border-2 border-gray-200 text-gray-400';
                  }
                } else if (isSelected) {
                  buttonClass =
                    'bg-blue-100 border-2 border-blue-500 text-blue-900 ring-2 ring-blue-300';
                }

                return (
                  <button
                    key={index}
                    onClick={() => !isAnswered && handleAnswerSelect(option)}
                    disabled={isAnswered}
                    className={`p-4 rounded-xl font-medium transition-all text-left text-lg ${buttonClass}`}
                  >
                    <span className="font-bold text-gray-400 mr-3">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>

            {/* Submit Answer Button */}
            {!isAnswered && selectedAnswer && (
              <button
                onClick={handleSubmitAnswer}
                className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors mb-4"
              >
                Submit Answer ✓
              </button>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
              >
                ← Previous
              </button>

              {currentQuestion < passage.reading_questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={!allAnswered}
                  className="flex-1 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Complete{' '}
                  {allAnswered
                    ? '✓'
                    : `(${answeredQuestions.size}/${passage.reading_questions.length})`}
                </button>
              )}
            </div>

            {/* Answer Status */}
            <div className="mt-6 text-center text-sm text-gray-600">
              Answered: {answeredQuestions.size} /{' '}
              {passage.reading_questions.length}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
