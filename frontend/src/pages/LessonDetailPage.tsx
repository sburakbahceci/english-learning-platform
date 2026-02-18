import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lessonsService } from '../services/lessons.service';
import { useAuthStore } from '../store/authStore';
import type { LessonDetail, Exercise } from '../types';

export default function LessonDetailPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { user, setAuth } = useAuthStore();

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<
    'learn' | 'exercise' | 'retry' | 'complete'
  >('learn');
  const [startTime] = useState(Date.now());
  const [wrongAnswers, setWrongAnswers] = useState<number[]>([]);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        if (!lessonId) return;
        const { data } = await lessonsService.getLessonById(lessonId);
        setLesson(data);
      } catch (error) {
        console.error('Failed to fetch lesson:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered || !lesson) return;
    setSelectedAnswer(answer);
    setIsAnswered(true);

    const actualIndex =
      phase === 'retry' ? wrongAnswers[currentExercise] : currentExercise;
    const currentQ = lesson.content.exercises[actualIndex];

    if (answer === currentQ.answer) {
      if (phase === 'exercise') {
        setScore((prev) => prev + 1);
      }
    } else {
      if (phase === 'exercise' && !wrongAnswers.includes(actualIndex)) {
        setWrongAnswers((prev) => [...prev, actualIndex]);
      }
    }
  };
  const handleNextExercise = () => {
    if (!lesson) return;

    if (phase === 'exercise') {
      // ANA AŞAMA MANTIĞI
      if (currentExercise < lesson.content.exercises.length - 1) {
        setCurrentExercise((prev) => prev + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      } else {
        // Tüm sorular bitti, yanlış var mı kontrol et
        if (wrongAnswers.length > 0) {
          setPhase('retry');
          setCurrentExercise(0);
          setSelectedAnswer(null);
          setIsAnswered(false);
        } else {
          setPhase('complete');
          handleComplete();
        }
      }
    } else if (phase === 'retry') {
      // TEKRAR AŞAMASI MANTIĞI (Döngü burada kuruluyor)
      const actualIndex = wrongAnswers[currentExercise];
      const isCorrect =
        selectedAnswer === lesson.content.exercises[actualIndex].answer;

      if (isCorrect) {
        const updatedWrongAnswers = wrongAnswers.filter(
          (_, index) => index !== currentExercise
        );
        setWrongAnswers(updatedWrongAnswers);

        if (updatedWrongAnswers.length === 0) {
          setPhase('complete');
          handleComplete();
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

  const handleComplete = async () => {
    try {
      if (!lessonId || !lesson) return;

      const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
      const totalQuestions = lesson.content.exercises.length;
      const finalScore = Math.round((score / totalQuestions) * 100);

      const result = await lessonsService.completeLesson(lessonId, {
        score: finalScore,
        timeSpentSeconds,
      });

      if (user && result.data.xpEarned) {
        setAuth(
          {
            ...user,
            totalXp: user.totalXp + result.data.xpEarned,
          },
          useAuthStore.getState().token || ''
        );
      }
    } catch (error) {
      console.error('Failed to complete lesson:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Lesson not found
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  // LEARN PHASE
  if (phase === 'learn') {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-white-600 hover:text-white"
            >
              ← Back
            </button>
            <div>
              <p className="text-xs text-purple-600 font-semibold">LINGORIA</p>
              <p className="text-sm text-gray-500">
                {lesson.level.code} · {lesson.level.name}
              </p>
              <h1 className="text-2xl font-bold text-gray-900">
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
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              📖 Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {lesson.content.introduction}
            </p>
          </div>

          {/* Rules */}
          {lesson.content.rules && lesson.content.rules.length > 0 && (
            <div className="bg-blue-50 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">📋 Rules</h2>
              <ul className="space-y-2">
                {lesson.content.rules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">
                      {index + 1}.
                    </span>
                    <span className="text-gray-700">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Examples */}
          {lesson.content.examples && lesson.content.examples.length > 0 && (
            <div className="bg-green-50 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                💡 Examples
              </h2>
              <ul className="space-y-2">
                {lesson.content.examples.map((example, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-gray-700"
                  >
                    <span className="text-green-600">→</span>
                    <span className="italic">&quot;{example}&quot;</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Vocabulary */}
          {lesson.content.words && lesson.content.words.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                📚 Vocabulary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lesson.content.words.map((word, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Start Exercises Button */}
          <div className="flex justify-center pb-8">
            <button
              onClick={() => setPhase('exercise')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
            >
              Start Exercises →
            </button>
          </div>
        </main>
      </div>
    );
  }

  // RETRY PHASE (Yanlış yapılan sorular)
  if (phase === 'retry') {
    const wrongQuestionIndex = wrongAnswers[currentExercise];
    const exercise: Exercise = lesson.content.exercises[wrongQuestionIndex];
    const isCorrect = selectedAnswer === exercise.answer;

    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-orange-600">
                📝 Review Wrong Answers
              </h1>
              <span className="text-gray-500">
                {currentExercise + 1} / {wrongAnswers.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all"
                style={{
                  width: `${((currentExercise + 1) / wrongAnswers.length) * 100}%`,
                }}
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
                    }
                  } else if (selectedAnswer === option) {
                    buttonStyle =
                      'bg-blue-50 border-2 border-blue-500 text-blue-700';
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
                {exercise.explanation && (
                  <p className="text-sm mt-2 italic">{exercise.explanation}</p>
                )}
              </div>
            )}

            {isAnswered && (
              <div className="flex justify-center">
                <button
                  onClick={handleNextExercise}
                  className="px-8 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
                >
                  {currentExercise < wrongAnswers.length - 1
                    ? 'Next Question →'
                    : 'Finish Review 🎉'}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // EXERCISE PHASE (Normal sorular)
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
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{
                  width: `${((currentExercise + 1) / lesson.content.exercises.length) * 100}%`,
                }}
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
                  } else if (selectedAnswer === option) {
                    buttonStyle =
                      'bg-blue-50 border-2 border-blue-500 text-blue-700';
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

            {isAnswered && (
              <div className="flex justify-center">
                <button
                  onClick={handleNextExercise}
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  {currentExercise < lesson.content.exercises.length - 1
                    ? 'Next Question →'
                    : 'Finish Lesson 🎉'}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // COMPLETE PHASE
  if (phase === 'complete') {
    const finalScore = Math.round(
      (score / lesson.content.exercises.length) * 100
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">
            {finalScore >= 80 ? '🎉' : finalScore >= 60 ? '👍' : '💪'}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Lesson Complete!
          </h1>
          <p className="text-gray-600 mb-6">{lesson.title}</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-blue-600">{finalScore}%</p>
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
                {score}/{lesson.content.exercises.length}
              </p>
              <p className="text-sm text-gray-500">Correct</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate(-1)}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              Back to Lessons
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
