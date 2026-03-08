import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { writingService } from '../services/writing.service';

interface Prompt {
  id: string;
  title: string;
  prompt_text: string;
  prompt_type: string;
  min_words?: number;
  max_words?: number;
  estimated_time?: number;
}

export default function WritingPromptPage() {
  const { promptId } = useParams<{ promptId: string }>();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrompt();
  }, [promptId]);

  const fetchPrompt = async () => {
    try {
      setLoading(true);
      const { data } = await writingService.getPromptById(promptId!);
      setPrompt(data);
    } catch (error) {
      console.error('Failed to fetch prompt:', error);
    } finally {
      setLoading(false);
    }
  };

  const wordCount = content
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  const handleSubmit = async () => {
    if (!prompt) return;

    if (prompt.min_words && wordCount < prompt.min_words) {
      alert(
        `Minimum ${prompt.min_words} words required. Current: ${wordCount}`
      );
      return;
    }

    if (prompt.max_words && wordCount > prompt.max_words) {
      alert(`Maximum ${prompt.max_words} words allowed. Current: ${wordCount}`);
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await writingService.submitWriting(prompt.id, content);

      // Feedback sayfasına yönlendir
      navigate(`/writing/feedback/${data.id}`);
    } catch (error) {
      console.error('Failed to submit writing:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Prompt not found</p>
        </div>
      </div>
    );
  }

  const wordLimitColor =
    prompt.min_words && wordCount < prompt.min_words
      ? 'text-red-600'
      : prompt.max_words && wordCount > prompt.max_words
        ? 'text-red-600'
        : 'text-green-600';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          {/* Header */}
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-3">
              {prompt.prompt_type}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {prompt.title}
            </h1>
            <p className="text-gray-600">{prompt.prompt_text}</p>
          </div>

          {/* Word Limit Info */}
          {(prompt.min_words || prompt.max_words) && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                {prompt.min_words && prompt.max_words && (
                  <>
                    Word limit: {prompt.min_words} - {prompt.max_words} words
                  </>
                )}
                {prompt.min_words && !prompt.max_words && (
                  <>Minimum: {prompt.min_words} words</>
                )}
                {!prompt.min_words && prompt.max_words && (
                  <>Maximum: {prompt.max_words} words</>
                )}
              </p>
            </div>
          )}

          {/* Text Editor */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing here..."
            className="w-full min-h-[400px] p-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none resize-none text-lg"
          />

          {/* Word Count */}
          <div className="mt-4 flex items-center justify-between">
            <p className={`text-sm font-semibold ${wordLimitColor}`}>
              Word count: {wordCount}
              {prompt.min_words && wordCount < prompt.min_words && (
                <span className="ml-2 text-red-600">
                  ({prompt.min_words - wordCount} more needed)
                </span>
              )}
              {prompt.max_words && wordCount > prompt.max_words && (
                <span className="ml-2 text-red-600">
                  ({wordCount - prompt.max_words} over limit)
                </span>
              )}
            </p>

            {prompt.estimated_time && (
              <p className="text-sm text-gray-500">
                ⏱️ Estimated time: {prompt.estimated_time} minutes
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting || wordCount === 0}
            className="w-full mt-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit & Get AI Feedback 🤖'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
