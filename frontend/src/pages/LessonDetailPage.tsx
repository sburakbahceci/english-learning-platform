import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { lessonsService } from '../services/lessons.service';
import { useAuthStore } from '../store/authStore';
import { aiService } from '../services/ai.service';
import type {
  LessonDetail,
  Exercise,
  ExerciseAttempt,
  LessonReport,
  CompleteLessonResult,
  ApiResponse,
} from '../types';

export default function LessonDetailPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { user, setAuth } = useAuthStore();
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<
    'learn' | 'exercise' | 'retry' | 'report' | 'complete'
  >('learn');
  const [startTime] = useState(Date.now());
  const [wrongAnswers, setWrongAnswers] = useState<number[]>([]);
  const [allAttempts, setAllAttempts] = useState<ExerciseAttempt[]>([]);
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAlreadyCompleted, setIsAlreadyCompleted] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        if (!lessonId) return;

        // Lesson bilgisini al
        const { data } = await lessonsService.getLessonById(lessonId);
        setLesson(data);

        // Eğer kullanıcı login ise, completion'ı kontrol et
        if (user && data.level?.id) {
          try {
            const { data: completions } =
              await lessonsService.getUserCompletions(data.level.id);
            const alreadyCompleted = completions.some(
              (c) => c.lessonId === lessonId
            );
            setIsAlreadyCompleted(alreadyCompleted);
            console.log('🔍 Lesson already completed:', alreadyCompleted);
          } catch (error) {
            console.log('No completions found or error:', error);
          }
        }
      } catch (error) {
        console.error('Failed to fetch lesson:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId, user]);

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered || !lesson) return;
    setSelectedAnswer(answer);
    setIsAnswered(true);

    const currentQ =
      lesson.content.exercises[
        phase === 'retry' ? wrongAnswers[currentExercise] : currentExercise
      ];
    const isCorrect = answer === currentQ.answer;

    // Kaydet attempt
    const attempt: ExerciseAttempt = {
      questionIndex:
        phase === 'retry' ? wrongAnswers[currentExercise] : currentExercise,
      question: currentQ.question,
      userAnswer: answer,
      correctAnswer: currentQ.answer,
      isCorrect,
      attemptNumber: phase === 'retry' ? 2 : 1,
    };
    setAllAttempts((prev) => [...prev, attempt]);

    if (isCorrect) {
      setScore((prev) => prev + 1);
    } else {
      if (!wrongAnswers.includes(currentExercise)) {
        setWrongAnswers((prev) => [...prev, currentExercise]);
      }
    }
  };
  const handleNextExercise = () => {
    if (!lesson) return;
    const totalQuestions = lesson.content.exercises.length;

    if (phase === 'exercise') {
      if (currentExercise < totalQuestions - 1) {
        setCurrentExercise((prev) => prev + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      } else {
        if (wrongAnswers.length > 0) {
          setPhase('retry');
          setCurrentExercise(0);
          setSelectedAnswer(null);
          setIsAnswered(false);
        } else {
          setPhase('report');
        }
      }
    } else if (phase === 'retry') {
      const actualIndex = wrongAnswers[currentExercise];
      const isCorrect =
        selectedAnswer === lesson.content.exercises[actualIndex].answer;

      if (isCorrect) {
        const updatedWrongAnswers = wrongAnswers.filter(
          (_, index) => index !== currentExercise
        );
        setWrongAnswers(updatedWrongAnswers);

        if (updatedWrongAnswers.length === 0) {
          setPhase('report');
        } else {
          const nextIdx =
            currentExercise >= updatedWrongAnswers.length ? 0 : currentExercise;
          setCurrentExercise(nextIdx);
          setSelectedAnswer(null);
          setIsAnswered(false);
        }
      } else {
        const nextIdx = (currentExercise + 1) % wrongAnswers.length;
        setCurrentExercise(nextIdx);
        setSelectedAnswer(null);
        setIsAnswered(false);
      }
    }
  };

  const handleExplainWithAI = async (
    question: string,
    userAnswer: string | null,
    correctAnswer: string
  ) => {
    console.log('🤖 AI Explain clicked:', {
      question,
      userAnswer,
      correctAnswer,
    });

    try {
      setLoadingExplanation(true);
      setAiExplanation(null);

      console.log('📤 Sending request to AI...');

      const { data } = await aiService.explainAnswer({
        question,
        userAnswer,
        correctAnswer,
        context: lesson?.title,
      });

      console.log('📥 AI Response:', data);

      setAiExplanation(data.explanation);
    } catch (error) {
      console.error('❌ Failed to get AI explanation:', error);
      alert('Failed to get explanation. Please try again.');
    } finally {
      setLoadingExplanation(false);
    }
  };

  const generateReport = (): LessonReport => {
    if (!lesson) {
      return {
        totalQuestions: 0,
        correctFirstTry: 0,
        correctAfterRetry: 0,
        stillWrong: 0,
        accuracy: 0,
        weakAreas: [],
        attempts: [],
      };
    }

    const totalQuestions = lesson.content.exercises.length;
    const firstTryAttempts = allAttempts.filter((a) => a.attemptNumber === 1);
    const retryAttempts = allAttempts.filter((a) => a.attemptNumber === 2);

    const correctFirstTry = firstTryAttempts.filter((a) => a.isCorrect).length;
    const correctAfterRetry = retryAttempts.filter((a) => a.isCorrect).length;

    const wrongInFirstTry = firstTryAttempts
      .filter((a) => !a.isCorrect)
      .map((a) => a.questionIndex);
    const stillWrongIndexes = wrongInFirstTry.filter(
      (idx) =>
        !retryAttempts.find((r) => r.questionIndex === idx && r.isCorrect)
    );
    const stillWrong = stillWrongIndexes.length;

    const accuracy =
      totalQuestions > 0
        ? Math.round((correctFirstTry / totalQuestions) * 100)
        : 0;

    const weakAreas: string[] = [];
    if (accuracy < 70) weakAreas.push('Overall Understanding');
    if (wrongInFirstTry.length > totalQuestions / 2)
      weakAreas.push('Practice Needed');
    if (stillWrong > 0) weakAreas.push('Review Required');

    return {
      totalQuestions,
      correctFirstTry,
      correctAfterRetry,
      stillWrong,
      accuracy,
      weakAreas,
      attempts: allAttempts,
    };
  };

  const handleCompleteFromReport = async () => {
    try {
      if (!lessonId || !lesson) return;

      if (isAlreadyCompleted) {
        navigate(`/levels/${lesson.level.code}`);
        return;
      }

      const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
      const reportData = generateReport();

      const response = await lessonsService.completeLesson(lessonId, {
        score: reportData.accuracy,
        timeSpentSeconds,
        report: reportData,
      } as unknown as { score: number; timeSpentSeconds: number });

      const result = response as unknown as ApiResponse<CompleteLessonResult>;

      if (!result.data.alreadyCompleted) {
        // İlk kez tamamlandığında XP ver
        const newTotalXp = (user?.totalXp || 0) + result.data.xpEarned;
        setAuth(
          { ...user!, totalXp: newTotalXp },
          useAuthStore.getState().token || ''
        );
      }

      setIsAlreadyCompleted(true);
      navigate(`/levels/${lesson.level.code}`);
    } catch (err) {
      console.error('Rapor kaydetme hatası:', err);
    }
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Lesson not found
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:underline"
          >
            Go back
          </button>
        </motion.div>
      </div>
    );
  }

  // LEARN PHASE
  if (phase === 'learn') {
    return (
      <motion.div
        key="learn"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className="min-h-screen bg-gray-100"
      >
        <header className="bg-white shadow">
          <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-white-900 hover:text-white"
            >
              ← Back
            </button>
            <img
              src="/lingoria_text_logo.png"
              alt="Lingoria"
              className="h-7 w-auto"
            />
            <div>
              <p className="text-xs text-gray-500">
                {lesson.level.code} · {lesson.level.name}
              </p>
              <h1 className="text-xl font-bold text-gray-900">
                {lesson.title}
              </h1>
            </div>
            <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
              <span>⏱️ {lesson.estimatedMinutes} min</span>
              <span>⭐ +{lesson.xpReward} XP</span>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              📖 Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {lesson.content.introduction}
            </p>
          </motion.div>

          {/* Rules */}
          {lesson.content.rules && lesson.content.rules.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-blue-50 rounded-lg shadow p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-3">📋 Rules</h2>
              <ul className="space-y-2">
                {lesson.content.rules.map((rule, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-blue-600 font-bold mt-0.5">
                      {index + 1}.
                    </span>
                    <span className="text-gray-700">{rule}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Examples */}
          {lesson.content.examples && lesson.content.examples.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-green-50 rounded-lg shadow p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                💡 Examples
              </h2>
              <ul className="space-y-2">
                {lesson.content.examples.map((example, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="flex items-start gap-2 text-gray-700"
                  >
                    <span className="text-green-600">→</span>
                    <span className="italic">&quot;{example}&quot;</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Vocabulary */}
          {lesson.content.words && lesson.content.words.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                📚 Vocabulary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lesson.content.words.map((word, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-blue-600">
                        {word.word}
                      </h3>
                      {word.translation && (
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {word.translation}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {word.definition}
                    </p>
                    <p className="text-sm italic text-gray-500">
                      &quot;{word.example}&quot;
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Start Exercises Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center pb-8"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPhase('exercise')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
            >
              Start Exercises →
            </motion.button>
          </motion.div>
        </main>
      </motion.div>
    );
  }

  // RETRY PHASE
  if (phase === 'retry') {
    const wrongQuestionIndex = wrongAnswers[currentExercise];
    const exercise: Exercise = lesson.content.exercises[wrongQuestionIndex];
    const isCorrect = selectedAnswer === exercise.answer;

    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔄</span>
                <h1 className="text-xl font-bold text-orange-600">
                  Review Wrong Answers
                </h1>
              </div>
              <span className="text-gray-500">
                {currentExercise + 1} / {wrongAnswers.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                style={{
                  width: `${((currentExercise + 1) / wrongAnswers.length) * 100}%`,
                }}
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              />
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {exercise.question}
              </h2>
            </div>

            {exercise.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {exercise.options.map((option, index) => {
                  let buttonStyle =
                    'bg-white border-2 border-gray-300 text-gray-800 hover:border-orange-400 hover:bg-orange-50 cursor-pointer';

                  if (isAnswered) {
                    if (option === exercise.answer) {
                      buttonStyle =
                        'bg-green-50 border-2 border-green-500 text-green-700';
                    } else if (
                      option === selectedAnswer &&
                      option !== exercise.answer
                    ) {
                      buttonStyle =
                        'bg-red-50 border-2 border-red-500 text-red-700';
                    } else {
                      buttonStyle =
                        'bg-gray-50 border-2 border-gray-200 text-gray-400';
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={isAnswered}
                      className={`p-4 rounded-lg font-medium transition-all text-lg ${buttonStyle}`}
                    >
                      <span className="font-bold text-gray-400 mr-2">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

            {isAnswered && (
              <div
                className={`rounded-xl p-6 mb-6 border-2 ${
                  isCorrect
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl">{isCorrect ? '✅' : '❌'}</div>
                  <div className="flex-1">
                    <p className="text-xl font-bold mb-2">
                      {isCorrect ? 'Correct!' : 'Wrong Answer'}
                    </p>
                    {!isCorrect && (
                      <>
                        <p className="text-sm mb-1">
                          <strong>Your answer:</strong> {selectedAnswer}
                        </p>
                        <p className="text-sm mb-2">
                          <strong>Correct answer:</strong> {exercise.answer}
                        </p>
                      </>
                    )}
                    {exercise.explanation && (
                      <p className="text-sm italic mt-2">
                        💡 {exercise.explanation}
                      </p>
                    )}
                  </div>
                </div>

                {/* AI Explain Button - Sadece yanlış cevaplarda */}
                {!isCorrect && (
                  <div className="mt-4 border-t border-red-200 pt-4">
                    <button
                      onClick={() =>
                        handleExplainWithAI(
                          exercise.question,
                          selectedAnswer,
                          exercise.answer
                        )
                      }
                      disabled={loadingExplanation}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      <span className="text-xl">🤖</span>
                      {loadingExplanation ? (
                        <>
                          <span className="animate-pulse">
                            Getting AI explanation...
                          </span>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        </>
                      ) : (
                        'Explain with AI Teacher'
                      )}
                    </button>

                    {/* AI Explanation */}
                    {aiExplanation && (
                      <div className="mt-4 p-5 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl shadow-sm">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">🤖</span>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-purple-900 mb-2 flex items-center gap-2">
                              <span>AI Teacher Explains:</span>
                              <span className="px-2 py-0.5 bg-purple-200 text-purple-800 text-xs rounded-full">
                                Powered by Lingoria AI
                              </span>
                            </p>
                            <p className="text-sm text-purple-900 whitespace-pre-wrap leading-relaxed">
                              {aiExplanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {isAnswered && (
              <div className="flex justify-center">
                <button
                  onClick={handleNextExercise}
                  className="px-8 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors shadow-lg"
                >
                  {currentExercise < wrongAnswers.length - 1
                    ? 'Next Question →'
                    : 'View Report 📊'}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // EXERCISE PHASE
  if (phase === 'exercise') {
    const exercise: Exercise = lesson.content.exercises[currentExercise];
    const isCorrect = selectedAnswer === exercise.answer;

    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-bold text-gray-900">
                {lesson.title}
              </h1>
              <span className="text-gray-500">
                {currentExercise + 1} / {lesson.content.exercises.length}
              </span>
            </div>
            {/* Progress Bar - Sadece genişlik geçişi için standart CSS transition bırakıldı */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                style={{
                  width: `${((currentExercise + 1) / lesson.content.exercises.length) * 100}%`,
                }}
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              />
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-end mb-6">
              <span className="text-sm font-medium text-gray-500">
                Score: {score}/{currentExercise + (isAnswered ? 1 : 0)}
              </span>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {exercise.question}
              </h2>
            </div>

            {exercise.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {exercise.options.map((option, index) => {
                  let buttonStyle =
                    'bg-white border-2 border-gray-300 text-gray-800 hover:border-blue-400 hover:bg-blue-50 cursor-pointer';

                  if (isAnswered) {
                    if (option === exercise.answer) {
                      buttonStyle =
                        'bg-green-50 border-2 border-green-500 text-green-700';
                    } else if (
                      option === selectedAnswer &&
                      option !== exercise.answer
                    ) {
                      buttonStyle =
                        'bg-red-50 border-2 border-red-500 text-red-700';
                    } else {
                      buttonStyle =
                        'bg-gray-50 border-2 border-gray-200 text-gray-400';
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={isAnswered}
                      className={`p-4 rounded-lg font-medium transition-all text-lg ${buttonStyle}`}
                    >
                      <span className="font-bold text-gray-400 mr-2">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Yanıt geri bildirimi - Efektsiz */}
            {isAnswered && (
              <div
                className={`p-4 rounded-lg mb-6 text-center ${
                  isCorrect
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                <p className="text-xl font-bold mb-1">
                  {isCorrect ? '🎉 Correct!' : '❌ Wrong!'}
                </p>
                {!isCorrect && (
                  <p>
                    Correct answer: <strong>{exercise.answer}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Sonraki soru butonu - Efektsiz */}
            {isAnswered && (
              <div className="flex justify-center">
                <button
                  onClick={handleNextExercise}
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                >
                  {currentExercise < lesson.content.exercises.length - 1
                    ? 'Next Question →'
                    : 'Finish 🎉'}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // REPORT PHASE
  if (phase === 'report') {
    const report = generateReport();

    return (
      <motion.div
        key="report"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full"
        >
          {/* Header with Logo */}
          <div className="text-center mb-6">
            <motion.img
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              src="/lingoria_text_logo.png"
              alt="Lingoria"
              className="h-14 w-auto mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Performance Report
            </h1>
            <p className="text-gray-600">{lesson.title}</p>
          </div>

          {/* Score Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-100">
              <p className="text-3xl font-bold text-blue-600">
                {report.accuracy}%
              </p>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">
                Accuracy
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center border border-green-100">
              <p className="text-3xl font-bold text-green-600">
                +{lesson.xpReward}
              </p>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">
                XP Reward
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-100">
              <p className="text-3xl font-bold text-purple-600">
                {report.correctFirstTry}/{report.totalQuestions}
              </p>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">
                Correct
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center border border-yellow-100">
              <p className="text-3xl font-bold text-yellow-600">
                {report.correctAfterRetry}
              </p>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">
                Retried
              </p>
            </div>
          </div>

          {/* Weak Areas */}
          {report.weakAreas.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6"
            >
              <h3 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                <span>📌</span> Areas to Focus On:
              </h3>
              <div className="flex flex-wrap gap-2">
                {report.weakAreas.map((area, index) => (
                  <span
                    key={index}
                    className="bg-white border border-orange-200 text-orange-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Detailed Question List */}
          <div className="mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>📋</span> Detailed Review:
            </h3>
            <div className="space-y-3">
              {report.attempts
                .filter((a) => a.attemptNumber === 1)
                .map((attempt, index) => {
                  const retryAttempt = report.attempts.find(
                    (r) =>
                      r.questionIndex === attempt.questionIndex &&
                      r.attemptNumber > 1 &&
                      r.isCorrect
                  );

                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border transition-colors ${
                        attempt.isCorrect
                          ? 'bg-green-50 border-green-200'
                          : retryAttempt
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl">
                          {attempt.isCorrect
                            ? '✅'
                            : retryAttempt
                              ? '🔄'
                              : '❌'}
                        </span>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">
                            {index + 1}. {attempt.question}
                          </p>
                          {!attempt.isCorrect && (
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              <p className="text-red-600">
                                <span className="font-bold">Your answer:</span>{' '}
                                {attempt.userAnswer}
                              </p>
                              <p className="text-green-600">
                                <span className="font-bold">Correct:</span>{' '}
                                {attempt.correctAnswer}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {isAlreadyCompleted ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/levels/${lesson.level.code}`)}
                  className="py-4 bg-gray-800 text-white text-lg font-bold rounded-xl hover:bg-gray-900 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <span>←</span> Back to Lessons
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/dashboard')}
                  className="py-4 border-2 border-gray-800 text-gray-800 text-lg font-bold rounded-xl hover:bg-gray-50 transition-all shadow-md"
                >
                  Go to Dashboard
                </motion.button>
              </motion.div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCompleteFromReport}
                className="w-full py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xl font-extrabold rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-2xl flex items-center justify-center gap-3 group"
              >
                <span>Complete & Earn XP</span>
                <span className="group-hover:translate-x-1 group-hover:scale-125 transition-transform">
                  🎉
                </span>
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // COMPLETE PHASE
  if (phase === 'complete') {
    const report = generateReport();

    return (
      <motion.div
        key="complete"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="text-6xl mb-4"
          >
            {report.accuracy >= 80 ? '🎉' : report.accuracy >= 60 ? '👍' : '💪'}
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Lesson Complete!
          </h1>
          <p className="text-gray-600 mb-6">{lesson.title}</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-blue-600">
                {report.accuracy}%
              </p>
              <p className="text-sm text-gray-500">Score</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-green-600">
                +{lesson.xpReward}
              </p>
              <p className="text-sm text-gray-500">XP Earned</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-purple-600">
                {report.correctFirstTry}/{report.totalQuestions}
              </p>
              <p className="text-sm text-gray-500">Correct</p>
            </div>
          </div>

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(-1)}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              Back to Lessons
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Go to Dashboard
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return null;
}
