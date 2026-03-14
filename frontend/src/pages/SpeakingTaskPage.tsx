/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { speakingService } from '../services/speaking.service';

interface SpeakingTask {
  id: string;
  title: string;
  description: string;
  task_type: string;
  prompt_text: string;
  image_url?: string;
  duration_seconds: number;
  difficulty: number;
  sample_answer?: string;
  levels: {
    code: string;
    name: string;
  };
}

interface AIFeedback {
  pronunciation_score: number;
  fluency_score: number;
  grammar_score: number;
  vocabulary_score: number;
  overall_score: number;
  feedback_text: string;
  strengths: string[];
  improvements: string[];
}

// ✅ Speech Recognition Types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
}

// ✅ Window interface extension
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

type Phase = 'instruction' | 'recording' | 'processing' | 'feedback';

export default function SpeakingTaskPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  const [task, setTask] = useState<SpeakingTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>('instruction');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [feedback, setFeedback] = useState<AIFeedback | null>(null);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null); // ✅ number (window.setInterval returns number)
  const recognitionRef = useRef<SpeechRecognition | null>(null); // ✅ Typed

  useEffect(() => {
    fetchTask();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopRecording();
    };
  }, [taskId]);

  const fetchTask = async () => {
    try {
      if (!taskId) return;
      const { data } = await speakingService.getTaskById(taskId);
      setTask(data);
    } catch (error) {
      console.error('Failed to fetch task:', error);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // MediaRecorder setup
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        // ✅ Audio blob oluşturuldu ama şimdilik kullanılmıyor
        // İleride cloud storage'a upload için kullanılabilir
        const _audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        });
        // TODO: Upload to cloud storage if needed
      };

      // Web Speech API setup (Speech Recognition)
      const SpeechRecognitionConstructor =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      // ✅ Undefined check
      if (SpeechRecognitionConstructor) {
        const recognition = new SpeechRecognitionConstructor();
        recognitionRef.current = recognition;

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let finalTranscript = '';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          setTranscription(finalTranscript + interimTranscript);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
        };

        recognition.start();
      } else {
        // ✅ Speech Recognition desteklenmiyor
        console.warn(
          'Speech Recognition API is not supported in this browser.'
        );
        // Manuel transcription için alert göster (opsiyonel)
        // alert('Speech recognition is not supported. You can still record audio.');
      }

      mediaRecorder.start();
      setIsRecording(true);
      setPhase('recording');
      setRecordingTime(0);

      // Timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          // Auto-stop at max duration
          if (task && newTime >= task.duration_seconds) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setIsRecording(false);
  };

  const handleSubmit = async () => {
    if (!transcription.trim() || !taskId) {
      alert('No speech detected. Please try again.');
      return;
    }

    setPhase('processing');

    try {
      const { data } = await speakingService.submitAttempt(
        taskId,
        transcription,
        recordingTime
      );

      setFeedback(data.feedback);
      setPhase('feedback');
    } catch (error) {
      console.error('Failed to submit attempt:', error);
      alert('Failed to process your recording. Please try again.');
      setPhase('instruction');
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'describe_image':
        return '🖼️';
      case 'answer_question':
        return '❓';
      case 'free_speech':
        return '💬';
      case 'role_play':
        return '🎭';
      default:
        return '🎤';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Task not found
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <span>←</span> Back
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {task.levels.code} · {task.levels.name}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* INSTRUCTION PHASE */}
          {phase === 'instruction' && (
            <motion.div
              key="instruction"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              {/* Task Header */}
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">
                  {getTaskTypeIcon(task.task_type)}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {task.title}
                </h1>
                <p className="text-gray-600">{task.description}</p>
              </div>

              {/* Task Prompt */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-6">
                <h3 className="font-bold text-blue-900 mb-2">Your Task:</h3>
                <p className="text-gray-800 leading-relaxed">
                  {task.prompt_text}
                </p>
              </div>

              {/* Image (if available) */}
              {task.image_url && (
                <div className="mb-6">
                  <img
                    src={task.image_url}
                    alt="Task visual"
                    className="w-full max-h-96 object-contain rounded-lg"
                  />
                </div>
              )}

              {/* Instructions */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-bold text-gray-900 mb-3">
                  📝 Instructions:
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Click "Start Recording" when you're ready</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Speak clearly and naturally in English</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>You have up to {task.duration_seconds} seconds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Click "Stop & Submit" when finished</span>
                  </li>
                </ul>
              </div>

              {/* Sample Answer Toggle */}
              {task.sample_answer && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowSampleAnswer(!showSampleAnswer)}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    {showSampleAnswer ? '🔽 Hide' : '▶️ Show'} Sample Answer
                  </button>
                  {showSampleAnswer && (
                    <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-gray-700 italic">
                        {task.sample_answer}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Start Button */}
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startRecording}
                  className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-lg font-bold rounded-xl shadow-lg hover:from-red-600 hover:to-pink-600 transition-all flex items-center gap-3"
                >
                  <span className="text-2xl">🎤</span>
                  Start Recording
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* RECORDING PHASE */}
          {phase === 'recording' && (
            <motion.div
              key="recording"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              {/* Recording Indicator */}
              <div className="text-center mb-8">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="inline-flex items-center gap-3 bg-red-50 border-2 border-red-500 rounded-full px-6 py-3"
                >
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-700 font-bold">RECORDING</span>
                </motion.div>
              </div>

              {/* Timer */}
              <div className="text-center mb-8">
                <div className="text-6xl font-bold text-gray-900 mb-2">
                  {formatTime(recordingTime)}
                </div>
                <div className="text-sm text-gray-500">
                  / {formatTime(task.duration_seconds)}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4 max-w-md mx-auto">
                  <div
                    className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(recordingTime / task.duration_seconds) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Prompt Reminder */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6 max-w-2xl mx-auto">
                <p className="text-gray-800 text-center">{task.prompt_text}</p>
              </div>

              {/* Live Transcription */}
              {transcription && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6 max-w-2xl mx-auto">
                  <p className="text-xs text-gray-500 mb-2">
                    Live Transcription:
                  </p>
                  <p className="text-gray-700">{transcription}</p>
                </div>
              )}

              {/* Stop Button */}
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    stopRecording();
                    handleSubmit();
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold rounded-xl shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Stop & Submit ✓
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* PROCESSING PHASE */}
          {phase === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-lg p-12 text-center"
            >
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Analyzing Your Speech...
              </h2>
              <p className="text-gray-600">
                AI is evaluating your pronunciation, fluency, and grammar
              </p>
            </motion.div>
          )}

          {/* FEEDBACK PHASE */}
          {phase === 'feedback' && feedback && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">
                  {feedback.overall_score >= 80
                    ? '🎉'
                    : feedback.overall_score >= 60
                      ? '👍'
                      : '💪'}
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  Speaking Feedback
                </h1>
                <p className="text-gray-600">{task.title}</p>
              </div>

              {/* Overall Score */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-8 text-center">
                <p className="text-gray-600 mb-2">Overall Score</p>
                <p className="text-5xl font-bold text-purple-600">
                  {feedback.overall_score}%
                </p>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {feedback.pronunciation_score}%
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Pronunciation</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {feedback.fluency_score}%
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Fluency</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {feedback.grammar_score}%
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Grammar</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {feedback.vocabulary_score}%
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Vocabulary</p>
                </div>
              </div>

              {/* AI Feedback */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <p className="text-gray-800 leading-relaxed">
                  {feedback.feedback_text}
                </p>
              </div>

              {/* Strengths */}
              {feedback.strengths.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                    <span>✅</span> Strengths:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {feedback.strengths.map((strength, index) => (
                      <span
                        key={index}
                        className="bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full text-sm"
                      >
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Improvements */}
              {feedback.improvements.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-bold text-orange-700 mb-3 flex items-center gap-2">
                    <span>📌</span> Areas to Improve:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {feedback.improvements.map((improvement, index) => (
                      <span
                        key={index}
                        className="bg-orange-50 border border-orange-200 text-orange-700 px-3 py-1 rounded-full text-sm"
                      >
                        {improvement}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Your Transcription */}
              {transcription && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-8">
                  <h3 className="font-bold text-blue-900 mb-2">
                    Your Speech (Transcribed):
                  </h3>
                  <p className="text-gray-700 italic">
                    &quot;{transcription}&quot;
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setPhase('instruction');
                    setTranscription('');
                    setFeedback(null);
                    setRecordingTime(0);
                  }}
                  className="py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
                >
                  Back to Tasks
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
