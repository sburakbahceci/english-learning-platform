import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { podcastsService } from '../services/podcasts.service';
import { useAuthStore } from '../store/authStore';
import type {
  LevelPodcast,
  PodcastVocabulary,
  PodcastExercise,
} from '../types';

interface PodcastPlayerProps {
  levelId: string;
}

type PodcastPhase = 'loading' | 'video' | 'exercises' | 'complete';

export default function PodcastPlayer({ levelId }: PodcastPlayerProps) {
  const user = useAuthStore((state) => state.user);
  const [podcast, setPodcast] = useState<LevelPodcast | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<PodcastPhase>('loading');
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        const { data } = await podcastsService.getLevelPodcast(levelId);
        setPodcast(data);
        setPhase('video');
      } catch (error) {
        console.error('Failed to fetch podcast:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPodcast();
  }, [levelId]);

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered || !podcast) return;
    setSelectedAnswer(answer);
    setIsAnswered(true);

    const currentQ = podcast.exercises[currentExercise];
    if (answer === currentQ.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextExercise = () => {
    if (!podcast) return;

    if (currentExercise < podcast.exercises.length - 1) {
      setCurrentExercise((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      if (!podcast || !user) return;

      await podcastsService.completePodcastExercises(levelId, {
        score,
        totalQuestions: podcast.exercises.length,
      });

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

  if (!podcast || !podcast.level.podcastYoutubeId) {
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

  // VIDEO PHASE
  if (phase === 'video') {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="text-5xl">🎙️</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {podcast.level.podcastTitle}
              </h3>
              <p className="text-gray-600 mb-3">
                {podcast.level.podcastDescription}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>📊 {podcast.level.code} Level</span>
                <span>⏱️ {podcast.level.podcastDurationMinutes} minutes</span>
                <span>📝 {podcast.vocabularies.length} words</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="aspect-video bg-black">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${podcast.level.podcastYoutubeId}`}
              title={podcast.level.podcastTitle}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📚</span>
            Key Vocabulary ({podcast.vocabularies.length} words)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {podcast.vocabularies.map(
              (vocab: PodcastVocabulary, index: number) => (
                <motion.div
                  key={vocab.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-lg font-bold text-purple-600">
                      {vocab.word}
                    </h4>
                    {vocab.translation && (
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {vocab.translation}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {vocab.definition}
                  </p>
                  <p className="text-sm italic text-gray-500 mb-2">
                    &quot;{vocab.example}&quot;
                  </p>

                  {/* DÜZELTİLEN KISIM: a etiketi ve null kontrolü eklendi */}
                  {vocab.timestampSeconds !== null &&
                    vocab.timestampSeconds !== undefined && (
                      <a
                        href={`https://www.youtube.com/watch?v=${podcast.level.podcastYoutubeId}&t=${vocab.timestampSeconds}s`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-600 hover:underline flex items-center gap-1"
                      ></a>
                    )}
                </motion.div>
              )
            )}
          </div>
        </div>

        {podcast.exercises.length > 0 && (
          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPhase('exercises')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
            >
              Test Your Knowledge ({podcast.exercises.length} Questions) →
            </motion.button>
          </div>
        )}
      </div>
    );
  }

  // EXERCISES PHASE
  if (phase === 'exercises' && podcast) {
    const exercise: PodcastExercise = podcast.exercises[currentExercise];
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
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-500">
                Question {currentExercise + 1} / {podcast.exercises.length}
              </span>
              <span className="text-sm text-gray-500">
                Score: {score}/{currentExercise + (isAnswered ? 1 : 0)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{
                  width: `${((currentExercise + 1) / podcast.exercises.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {exercise.questionText}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {exercise.options.map((option: string, index: number) => {
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
                  {currentExercise < podcast.exercises.length - 1
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
  if (phase === 'complete' && podcast) {
    const percentage = Math.round((score / podcast.exercises.length) * 100);

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
              {score}/{podcast.exercises.length}
            </p>
            <p className="text-sm text-gray-500">Correct</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-3xl font-bold text-blue-600">
              {podcast.vocabularies.length}
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
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all"
        >
          Watch Podcast Again
        </motion.button>
      </motion.div>
    );
  }

  return null;
}
