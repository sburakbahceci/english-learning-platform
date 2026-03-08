import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { podcastsService } from '../services/podcasts.service';
import { useAuthStore } from '../store/authStore';

interface Vocabulary {
  id: string;
  word: string;
  definition: string;
  exampleSentence?: string;
}

interface Exercise {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

interface Podcast {
  id: string;
  title: string;
  description?: string;
  audioUrl: string;
  duration?: number;
  transcript?: string;
  vocabularies: Vocabulary[];
  exercises: Exercise[];
}

interface PodcastPlayerProps {
  levelCode: string; // ✅ levelId → levelCode
}

type PodcastPhase = 'loading' | 'video' | 'exercises' | 'complete';

export default function PodcastPlayer({ levelCode }: PodcastPlayerProps) {
  const user = useAuthStore((state) => state.user);
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<PodcastPhase>('loading');
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        const { data } = await podcastsService.getPodcastsByLevel(levelCode);

        if (data && data.length > 0) {
          setCurrentPodcast(data[0]);
          setPhase('video');
        }
      } catch (error) {
        console.error('Failed to fetch podcasts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPodcasts();
  }, [levelCode]);

  // YouTube video ID'sini çıkar
  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : null;
  };

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered || !currentPodcast) return;
    setSelectedAnswer(answer);
    setIsAnswered(true);

    const currentQ = currentPodcast.exercises[currentExercise];
    if (answer === currentQ.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextExercise = () => {
    if (!currentPodcast) return;

    if (currentExercise < currentPodcast.exercises.length - 1) {
      setCurrentExercise((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      if (!currentPodcast || !user) return;

      await podcastsService.completePodcast(
        currentPodcast.id,
        score,
        300 // timeSpent (5 dakika örnek)
      );

      setPhase('complete');
    } catch (error) {
      console.error('Failed to complete podcast:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!currentPodcast) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-6xl mb-4">🎙️</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Podcast Coming Soon
        </h3>
        <p className="text-gray-600">
          We're working on creating an amazing podcast experience for this
          level!
        </p>
      </div>
    );
  }

  const videoId = getYouTubeVideoId(currentPodcast.audioUrl);

  // VIDEO PHASE
  if (phase === 'video') {
    return (
      <div className="space-y-6">
        {/* Podcast Header */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="text-5xl">🎙️</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {currentPodcast.title}
              </h3>
              {currentPodcast.description && (
                <p className="text-gray-600 mb-3">
                  {currentPodcast.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>📊 {levelCode} Level</span>
                {currentPodcast.duration && (
                  <span>
                    ⏱️ {Math.floor(currentPodcast.duration / 60)} minutes
                  </span>
                )}
                <span>📝 {currentPodcast.vocabularies.length} words</span>
              </div>
            </div>
          </div>
        </div>

        {/* YouTube Video */}
        {videoId && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="aspect-video bg-black">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}`}
                title={currentPodcast.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        )}

        {/* Transcript */}
        {currentPodcast.transcript && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📝</span>
              Transcript
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {currentPodcast.transcript}
            </p>
          </div>
        )}

        {/* Vocabulary */}
        {currentPodcast.vocabularies &&
          currentPodcast.vocabularies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📚</span> Key Vocabulary (
                {currentPodcast.vocabularies.length} words)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentPodcast.vocabularies.map((vocab, index) => (
                  <motion.div
                    key={vocab.id || index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-blue-600">
                        {vocab.word}
                      </h3>
                    </div>

                    <p className="text-sm text-gray-600 mb-2 font-medium">
                      {vocab.definition}
                    </p>

                    {/* Podcast verisinde exampleSentence olarak geçiyor */}
                    {vocab.exampleSentence && (
                      <p className="text-sm italic text-gray-400 border-l-2 border-gray-100 pl-3">
                        &quot;{vocab.exampleSentence}&quot;
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

        {/* Start Exercises Button */}
        {currentPodcast.exercises.length > 0 && (
          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPhase('exercises')}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
            >
              Test Your Knowledge ({currentPodcast.exercises.length} Questions)
              →
            </motion.button>
          </div>
        )}
      </div>
    );
  }

  // EXERCISES PHASE
  if (phase === 'exercises' && currentPodcast) {
    const exercise = currentPodcast.exercises[currentExercise];
    const isCorrect = selectedAnswer === exercise.correctAnswer;

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={`exercise-${currentExercise}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-lg shadow p-8"
        >
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-500">
                Question {currentExercise + 1} /{' '}
                {currentPodcast.exercises.length}
              </span>
              <span className="text-sm text-gray-500">
                Score: {score}/{currentExercise + (isAnswered ? 1 : 0)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{
                  width: `${((currentExercise + 1) / currentPodcast.exercises.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question */}
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {exercise.question}
          </h3>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {exercise.options.map((option, index) => {
              let buttonStyle =
                'bg-white border-2 border-gray-300 text-gray-800 hover:border-purple-400 hover:bg-purple-50 cursor-pointer';

              if (isAnswered) {
                if (option === exercise.correctAnswer) {
                  buttonStyle =
                    'bg-green-50 border-2 border-green-500 text-green-700';
                } else if (option === selectedAnswer) {
                  buttonStyle =
                    'bg-red-50 border-2 border-red-500 text-red-700';
                } else {
                  buttonStyle =
                    'bg-gray-50 border-2 border-gray-200 text-gray-400';
                }
              }

              return (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={!isAnswered ? { scale: 1.02 } : {}}
                  whileTap={!isAnswered ? { scale: 0.98 } : {}}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={isAnswered}
                  className={`p-4 rounded-lg font-medium transition-all text-lg ${buttonStyle}`}
                >
                  <span className="font-bold text-gray-400 mr-2">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </motion.button>
              );
            })}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-4 rounded-lg mb-6 text-center overflow-hidden ${
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
                    Correct answer: <strong>{exercise.correctAnswer}</strong>
                  </p>
                )}
                {exercise.explanation && (
                  <p className="text-sm mt-2 italic">{exercise.explanation}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next Button */}
          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNextExercise}
                  className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors shadow-lg"
                >
                  {currentExercise < currentPodcast.exercises.length - 1
                    ? 'Next Question →'
                    : 'See Results 🎉'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    );
  }

  // COMPLETE PHASE
  if (phase === 'complete' && currentPodcast) {
    const percentage = Math.round(
      (score / currentPodcast.exercises.length) * 100
    );

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow p-8 text-center"
      >
        <div className="text-6xl mb-4">
          {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪'}
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Podcast Complete!
        </h2>
        <p className="text-gray-600 mb-6">
          You finished the vocabulary exercises
        </p>

        <div className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-3xl font-bold text-purple-600">{percentage}%</p>
            <p className="text-sm text-gray-500">Score</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-3xl font-bold text-green-600">
              {score}/{currentPodcast.exercises.length}
            </p>
            <p className="text-sm text-gray-500">Correct</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-3xl font-bold text-blue-600">
              {currentPodcast.vocabularies.length}
            </p>
            <p className="text-sm text-gray-500">Words</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setPhase('video');
            setCurrentExercise(0);
            setScore(0);
            setIsAnswered(false);
          }}
          className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all"
        >
          Watch Podcast Again
        </motion.button>
      </motion.div>
    );
  }

  return null;
}
