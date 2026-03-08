import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { writingService } from '../services/writing.service';

interface Submission {
  id: string;
  content: string;
  word_count: number;
  overall_score: number;
  submitted_at: string;
  ai_feedback: {
    grammar_score: number;
    vocabulary_score: number;
    coherence_score: number;
    overall_score: number;
    strengths: string[];
    improvements: string[];
    grammar_errors: Array<{
      error: string;
      correction: string;
      explanation: string;
    }>;
    vocabulary_suggestions: string[];
    general_feedback: string;
  };
  writing_prompts: {
    id: string;
    title: string;
    prompt_text: string;
  };
}

export default function WritingFeedbackPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmission();
  }, [submissionId]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const { data } = await writingService.getSubmissionById(submissionId!);
      setSubmission(data);
    } catch (error) {
      console.error('Failed to fetch submission:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-300';
    if (score >= 60) return 'bg-yellow-50 border-yellow-300';
    return 'bg-red-50 border-red-300';
  };

  const getEmoji = (score: number) => {
    if (score >= 90) return '🎉';
    if (score >= 80) return '⭐';
    if (score >= 70) return '👍';
    if (score >= 60) return '📝';
    return '💪';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">
            Analyzing your writing...
          </p>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Submission not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const feedback = submission.ai_feedback;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-7xl mb-4">
            {getEmoji(feedback.overall_score)}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Your Writing Feedback
          </h1>
          <p className="text-gray-600">{submission.writing_prompts.title}</p>
        </motion.div>

        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`bg-white rounded-2xl shadow-lg p-8 mb-6 border-4 ${getScoreBgColor(feedback.overall_score)}`}
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Overall Score
            </h2>
            <div
              className={`text-7xl font-bold ${getScoreColor(feedback.overall_score)}`}
            >
              {feedback.overall_score}
              <span className="text-4xl">/100</span>
            </div>
            <p className="text-gray-600 mt-2">
              Word Count: {submission.word_count}
            </p>
          </div>
        </motion.div>

        {/* Score Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-4xl mb-2">📝</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Grammar
            </h3>
            <div
              className={`text-4xl font-bold ${getScoreColor(feedback.grammar_score)}`}
            >
              {feedback.grammar_score}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${feedback.grammar_score}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-4xl mb-2">📚</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Vocabulary
            </h3>
            <div
              className={`text-4xl font-bold ${getScoreColor(feedback.vocabulary_score)}`}
            >
              {feedback.vocabulary_score}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${feedback.vocabulary_score}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-4xl mb-2">🔗</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Coherence
            </h3>
            <div
              className={`text-4xl font-bold ${getScoreColor(feedback.coherence_score)}`}
            >
              {feedback.coherence_score}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${feedback.coherence_score}%` }}
              />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Strengths */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">✅</span>
              <h3 className="text-xl font-bold text-green-700">
                What You Did Well
              </h3>
            </div>
            <ul className="space-y-3">
              {feedback.strengths.map((strength, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-2 text-gray-700"
                >
                  <span className="text-green-500 mt-1">•</span>
                  <span>{strength}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Areas for Improvement */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">📈</span>
              <h3 className="text-xl font-bold text-orange-700">
                Areas to Improve
              </h3>
            </div>
            <ul className="space-y-3">
              {feedback.improvements.map((improvement, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-2 text-gray-700"
                >
                  <span className="text-orange-500 mt-1">•</span>
                  <span>{improvement}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Grammar Errors */}
        {feedback.grammar_errors && feedback.grammar_errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">❌</span>
              <h3 className="text-xl font-bold text-red-700">
                Grammar Corrections
              </h3>
            </div>
            <div className="space-y-4">
              {feedback.grammar_errors.map((error, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="p-4 bg-red-50 border-l-4 border-red-400 rounded-lg"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-red-600 line-through">
                      {error.error}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="text-green-600 font-semibold">
                      {error.correction}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 italic">
                    {error.explanation}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Vocabulary Suggestions */}
        {feedback.vocabulary_suggestions &&
          feedback.vocabulary_suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">📚</span>
                <h3 className="text-xl font-bold text-blue-700">
                  Vocabulary Enhancements
                </h3>
              </div>
              <div className="space-y-2">
                {feedback.vocabulary_suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="p-3 bg-blue-50 rounded-lg"
                  >
                    <p className="text-gray-700">
                      <span className="text-blue-600">•</span> {suggestion}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

        {/* General Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl shadow-lg p-8 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">💬</span>
            <h3 className="text-xl font-bold text-gray-900">
              Teacher's Comments
            </h3>
          </div>
          <p className="text-gray-800 leading-relaxed text-lg">
            {feedback.general_feedback}
          </p>
        </motion.div>

        {/* Your Writing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">📝</span>
            <h3 className="text-xl font-bold text-gray-900">Your Writing</h3>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-semibold text-gray-600 mb-2">
              Prompt: {submission.writing_prompts.prompt_text}
            </p>
            <div className="border-t border-gray-300 pt-3 mt-3">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {submission.content}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex gap-4"
        >
          <button
            onClick={() =>
              navigate(`/writing/prompt/${submission.writing_prompts.id}`)
            }
            className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
          >
            Try Again 🔄
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 py-4 bg-white text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all shadow-lg border-2 border-gray-300"
          >
            Back to Dashboard
          </button>
        </motion.div>

        {/* Submitted Date */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Submitted on {new Date(submission.submitted_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
