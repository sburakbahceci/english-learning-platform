import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lessonsService } from '../services/lessons.service';
import type { LessonDetail, Exercise } from '../types';

export default function LessonDetailPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<'learn' | 'exercise' | 'complete'>('learn');
  const [startTime] = useState(Date.now());

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
    if (isAnswered) return;
    setSelectedAnswer(answer);
    setIsAnswered(true);

    if (lesson && answer === lesson.content.exercises[currentExercise].answer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextExercise = () => {
    if (!lesson) return;

    if (currentExercise < lesson.content.exercises.length - 1) {
      setCurrentExercise((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setPhase('complete');
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      if (!lessonId || !lesson) return;

      const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
      const finalScore = Math.round(
        (score / lesson.content.exercises.length) * 100
      );

      await lessonsService.completeLesson(lessonId, {
        score: finalScore,
        timeSpentSeconds,
      });
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
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <div>
              <p className="text-sm text-gray-500">{lesson.level.code} · {lesson.level.name}</p>
              <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
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

          {/* Rules (Grammar) */}
          {lesson.content.rules && lesson.content.rules.length > 0 && (
            <div className="bg-blue-50 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                📋 Rules
              </h2>
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
                    <span className="italic">"{example}"</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Vocabulary Words */}
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
                      "{word.example}"
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
              className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
            >
              Start Exercises →
            </button>
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
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">{lesson.title}</h1>
              <span className="text-gray-500">
                {currentExercise + 1} / {lesson.content.exercises.length}
              </span>
            </div>

            {/* Exercise Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{
                  width: `${((currentExercise + 1) / lesson.content.exercises.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Score */}
            <div className="flex justify-end mb-6">
              <span className="text-sm font-medium text-gray-500">
                Score: {score}/{currentExercise + (isAnswered ? 1 : 0)}
              </span>
            </div>

            {/* Question */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {exercise.question}
              </h2>
            </div>

            {/* Options */}
            {exercise.options && (
              <div className="grid grid-cols-2 gap-4 mb-8">
                {exercise.options.map((option, index) => {
                  let buttonStyle =
                    'border-2 border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50';

                  if (isAnswered) {
                    if (option === exercise.answer) {
                      buttonStyle = 'border-2 border-green-500 bg-green-50 text-green-700';
                    } else if (option === selectedAnswer && option !== exercise.answer) {
                      buttonStyle = 'border-2 border-red-500 bg-red-50 text-red-700';
                    }
                  } else if (selectedAnswer === option) {
                    buttonStyle = 'border-2 border-blue-500 bg-blue-50 text-blue-700';
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      className={`p-4 rounded-lg font-medium transition-all text-lg ${buttonStyle}`}
                      disabled={isAnswered}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Feedback */}
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

            {/* Next Button */}
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
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">
            {finalScore >= 80 ? '🎉' : finalScore >= 60 ? '👍' : '💪'}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Lesson Complete!
          </h1>
          <p className="text-gray-600 mb-6">{lesson.title}</p>

          {/* Stats */}
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

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate(-1)}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
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