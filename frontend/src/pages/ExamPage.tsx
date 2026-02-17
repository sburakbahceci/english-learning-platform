import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examsService } from '../services/exams.service';
import type { Question, ExamSubmitResponse } from '../types';

type ExamPhase =
  | 'loading'
  | 'ready'
  | 'exam'
  | 'submitting'
  | 'result'
  | 'error';

export default function ExamPage() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<ExamPhase>('loading');
  const [examId, setExamId] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [totalTime] = useState(60);
  const [result, setResult] = useState<ExamSubmitResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [tabWarnings, setTabWarnings] = useState(0);

  // ✅ 1. ÖNCE handleSubmit tanımla
  const handleSubmit = useCallback(
    async (autoSubmit = false) => {
      try {
        setPhase('submitting');
        const { data } = await examsService.submitExam(examId, answers);
        setResult(data);
        setPhase('result');
      } catch (error) {
        console.error('Submit failed:', error);
        if (!autoSubmit) {
          setPhase('error');
        }
      }
    },
    [examId, answers]
  );

  // ✅ 2. SONRA handleNextQuestion tanımla (handleSubmit'i kullanıyor)
  const handleNextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(60);
    } else {
      handleSubmit(false);
    }
  }, [currentIndex, questions.length, handleSubmit]);

  // ✅ 3. SONRA handleTimeUp tanımla (handleNextQuestion'ı kullanıyor)
  const handleTimeUp = useCallback(() => {
    const currentQuestion = questions[currentIndex];
    if (currentQuestion && !answers[currentQuestion.id]) {
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: '' }));
    }
    handleNextQuestion();
  }, [currentIndex, questions, answers, handleNextQuestion]);

  // Load exam
  useEffect(() => {
    const loadExam = async () => {
      try {
        if (!levelId) return;
        const { data } = await examsService.startExam(levelId);
        setExamId(data.exam.id);
        setQuestions(data.questions);
        setTimeLeft(60);
        setPhase('ready');
      } catch (error: unknown) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        }
        setPhase('error');
      }
    };

    loadExam();
  }, [levelId]);

  // Timer
  useEffect(() => {
    if (phase !== 'exam') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, currentIndex, handleTimeUp]);

  // Anti-cheat: Tab visibility
  useEffect(() => {
    if (phase !== 'exam') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabWarnings((prev) => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            handleSubmit(true);
          }
          return newCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [phase, handleSubmit]);

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    const currentQuestion = questions[currentIndex];
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));
  };

  const getTimerColor = () => {
    if (timeLeft > 30) return 'text-green-600';
    if (timeLeft > 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  // LOADING
  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Preparing your exam...</p>
        </div>
      </div>
    );
  }

  // ERROR
  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Cannot Start Exam
          </h2>
          <p className="text-gray-600 mb-6">
            {errorMessage === 'MAX_ATTEMPTS_REACHED'
              ? 'You have failed 3 times. Your level has been reset. Please complete lessons again.'
              : errorMessage === 'NOT_ENOUGH_QUESTIONS'
                ? 'This level does not have enough questions yet.'
                : 'Something went wrong. Please try again.'}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // READY
  if (phase === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Level Exam</h1>
          <p className="text-gray-600 mb-8">
            Are you ready to test your knowledge?
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left space-y-3">
            <h3 className="font-bold text-gray-900 mb-3">📋 Exam Rules:</h3>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <span>📊</span>
              <span>
                <strong>{questions.length} questions</strong> (Grammar +
                Vocabulary)
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <span>⏱️</span>
              <span>
                <strong>1 minute</strong> per question
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <span>🎯</span>
              <span>
                <strong>80%</strong> passing score required
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <span>⚠️</span>
              <span>
                <strong>3 failures</strong> = level reset
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <span>🚫</span>
              <span>Do not switch tabs (anti-cheat active)</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setPhase('exam')}
              className="w-full py-4 bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Start Exam 🚀
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SUBMITTING
  if (phase === 'submitting') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Calculating your score...</p>
        </div>
      </div>
    );
  }

  // RESULT
  if (phase === 'result' && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">
              {result.passed ? '🎉' : result.score >= 60 ? '😔' : '💪'}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {result.passed ? 'Congratulations!' : 'Keep Practicing!'}
            </h1>
            <p className="text-gray-600">
              {result.passed
                ? 'You passed the exam and unlocked the next level!'
                : `You need 80% to pass. You scored ${result.score}%.`}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div
              className={`rounded-xl p-4 text-center ${result.passed ? 'bg-green-50' : 'bg-red-50'}`}
            >
              <p
                className={`text-3xl font-bold ${result.passed ? 'text-green-600' : 'text-red-600'}`}
              >
                {result.score}%
              </p>
              <p className="text-sm text-gray-500 mt-1">Score</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">
                {result.correctAnswers}/{result.totalQuestions}
              </p>
              <p className="text-sm text-gray-500 mt-1">Correct</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-purple-600">
                {result.passed ? '+100' : '+0'}
              </p>
              <p className="text-sm text-gray-500 mt-1">XP Earned</p>
            </div>
          </div>

          <div className="mb-6 max-h-64 overflow-y-auto">
            <h3 className="font-bold text-gray-900 mb-3">Answer Review:</h3>
            <div className="space-y-2">
              {result.results.map((r, index) => (
                <div
                  key={r.questionId}
                  className={`p-3 rounded-lg text-sm ${
                    r.isCorrect
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span>{r.isCorrect ? '✅' : '❌'}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {index + 1}. {r.questionText}
                      </p>
                      {!r.isCorrect && (
                        <p className="text-red-600 text-xs mt-1">
                          Your answer: {r.userAnswer || 'No answer'} → Correct:{' '}
                          {r.correctAnswer}
                        </p>
                      )}
                      {r.explanation && (
                        <p className="text-gray-500 text-xs mt-1 italic">
                          {r.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {result.passed ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700"
              >
                Continue to Next Level 🚀
              </button>
            ) : (
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700"
              >
                Try Again
              </button>
            )}
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // EXAM
  const currentQuestion = questions[currentIndex];
  const options = Array.isArray(currentQuestion?.options)
    ? currentQuestion.options
    : [];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <div className={`text-2xl font-bold ${getTimerColor()}`}>
              ⏱️ {timeLeft}s
            </div>
            {tabWarnings > 0 && (
              <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded">
                ⚠️ Tab warning: {tabWarnings}/3
              </span>
            )}
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </div>

          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
            <div
              className={`h-1 rounded-full transition-all ${
                timeLeft > 30
                  ? 'bg-green-500'
                  : timeLeft > 10
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
              style={{ width: `${(timeLeft / totalTime) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                currentQuestion?.category === 'grammar'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-purple-100 text-purple-800'
              }`}
            >
              {currentQuestion?.category === 'grammar'
                ? '📖 Grammar'
                : '📚 Vocabulary'}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-relaxed">
            {currentQuestion?.questionText}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {options.map((option, index) => {
              let style =
                'border-2 border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50 cursor-pointer';

              if (selectedAnswer) {
                if (option === selectedAnswer) {
                  style = 'border-2 border-blue-500 bg-blue-50 text-blue-700';
                } else {
                  style =
                    'border-2 border-gray-200 text-gray-400 cursor-not-allowed opacity-60';
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={!!selectedAnswer}
                  className={`p-4 rounded-xl font-medium transition-all text-left text-lg ${style}`}
                >
                  <span className="font-bold text-gray-400 mr-2">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </button>
              );
            })}
          </div>

          {selectedAnswer && (
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleNextQuestion}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                {currentIndex < questions.length - 1
                  ? 'Next Question →'
                  : 'Submit Exam 🎉'}
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500 mb-2">
            Answered: {Object.keys(answers).length}/{questions.length}
          </p>
          <div className="flex flex-wrap gap-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === currentIndex
                    ? 'bg-blue-600 text-white'
                    : answers[questions[index].id] !== undefined
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
