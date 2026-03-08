import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  placementTestService,
  type PlacementTestQuestion, // ✅ type ekle
} from '../services/placement-test.service';

export default function PlacementTestPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  // const [testId, setTestId] = useState<string>(''); // ✅ Kaldır - kullanılmıyor
  const [questions, setQuestions] = useState<PlacementTestQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    startTest();
  }, []);

  const startTest = async () => {
    try {
      setLoading(true);
      const { data } = await placementTestService.startTest();
      // setTestId(data.testId); // ✅ Kaldır - kullanılmıyor
      setQuestions(data.questions);
    } catch (error) {
      console.error('Failed to start test:', error);
      alert('Failed to start placement test. Please try again.');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
  };

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer) return;

    try {
      setSubmitting(true);
      await placementTestService.submitAnswer(
        questions[currentQuestion].id,
        selectedAnswer
      );
      setIsAnswered(true);
    } catch (error) {
      console.error('Failed to submit answer:', error);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer('');
      setIsAnswered(false);
    } else {
      completeTest();
    }
  };

  const completeTest = async () => {
    try {
      setSubmitting(true);
      await placementTestService.completeTest();
      navigate('/placement-test/results');
    } catch (error) {
      console.error('Failed to complete test:', error);
      alert('Failed to complete test. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl font-semibold">
            Preparing your placement test...
          </p>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <img src="/lingoria_text_logo.png" alt="Lingoria" className="h-8" />
            <span className="text-white font-semibold">
              Question {currentQuestion + 1} / {questions.length}
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              className="bg-white h-2 rounded-full"
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
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl shadow-2xl p-8"
          >
            {/* Level Badge */}
            <div className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
              Level: {question.levelCode}
            </div>

            {/* Question */}
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              {question.questionText}
            </h2>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === option;

                let buttonClass =
                  'bg-white border-2 border-gray-300 text-gray-800 hover:border-blue-400 hover:bg-blue-50 cursor-pointer';

                if (!isAnswered && isSelected) {
                  buttonClass =
                    'bg-blue-100 border-2 border-blue-500 text-blue-900 cursor-pointer ring-2 ring-blue-300';
                }

                if (isAnswered && isSelected) {
                  buttonClass =
                    'bg-blue-100 border-2 border-blue-500 text-blue-900 cursor-default';
                }

                if (isAnswered && !isSelected) {
                  buttonClass =
                    'bg-gray-50 border-2 border-gray-200 text-gray-400 cursor-default';
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={isAnswered}
                    className={`p-4 rounded-xl font-medium transition-all text-lg ${buttonClass}`}
                  >
                    <span className="font-bold text-gray-400 mr-2">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>

            {/* Submit Button */}
            {!isAnswered && selectedAnswer && (
              <button
                onClick={handleAnswerSubmit}
                disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg mb-4 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Answer</span>
                    <span className="text-xl">✓</span>
                  </>
                )}
              </button>
            )}

            {/* Next Button */}
            {isAnswered && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleNext}
                disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50"
              >
                {currentQuestion < questions.length - 1 ? (
                  'Next Question →'
                ) : submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent inline-block mr-2"></div>
                    Completing Test...
                  </>
                ) : (
                  'Complete Test 🎉'
                )}
              </motion.button>
            )}

            {/* Info */}
            {!isAnswered && (
              <p className="text-center text-gray-500 text-sm mt-6">
                Select an answer and submit to continue
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Instructions */}
        {currentQuestion === 0 && !isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mt-6 text-white"
          >
            <h3 className="font-bold text-lg mb-2">📋 Instructions</h3>
            <ul className="space-y-2 text-sm">
              <li>• This test has {questions.length} questions</li>
              <li>• Answer all questions to determine your English level</li>
              <li>• You cannot go back once you submit an answer</li>
              <li>• Take your time and choose the best answer</li>
            </ul>
          </motion.div>
        )}
      </main>
    </div>
  );
}
