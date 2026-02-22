import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../services/ai.service';
import { useAuthStore } from '../store/authStore';
import type { AiChatMessage, AiChatSession } from '../types';

export default function AiChatPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [sessions, setSessions] = useState<AiChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load user sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSessions = async () => {
    try {
      const { data } = await aiService.getUserSessions();
      setSessions(data);

      // If no current session and sessions exist, load the first one
      if (!currentSessionId && data.length > 0) {
        loadChatHistory(data[0].sessionId);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const loadChatHistory = async (sessionId: string) => {
    try {
      setLoadingHistory(true);
      setCurrentSessionId(sessionId);
      const { data } = await aiService.getChatHistory(sessionId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCreateNewSession = async () => {
    try {
      const { data } = await aiService.createNewSession();
      setSessions((prev) => [data, ...prev]);
      setCurrentSessionId(data.sessionId);
      setMessages([]);
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to create new chat session');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim() || loading) return;

    // If no session, create one
    if (!currentSessionId) {
      await handleCreateNewSession();
      return;
    }

    const userMessageContent = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    // Optimistic update - add user message
    const tempUserMessage: AiChatMessage = {
      id: `temp-${Date.now()}`,
      sessionId: currentSessionId,
      userId: user?.id || '',
      role: 'user',
      content: userMessageContent,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const { data } = await aiService.sendMessage(
        currentSessionId,
        userMessageContent
      );

      // Replace temp message with real one and add AI response
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempUserMessage.id);
        return [
          ...withoutTemp,
          {
            ...tempUserMessage,
            id: data.message.id,
          },
          data.message,
        ];
      });

      // Refresh sessions to update lastMessageAt
      loadSessions();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    try {
      await aiService.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));

      // If deleted session was active, clear messages
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      alert('Failed to delete session');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="w-80 bg-white border-r border-gray-200 flex flex-col"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <img
                    src="/lingoria_white_small.ico"
                    alt="Lingoria"
                    className="h-8 w-auto"
                  />
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <button
                onClick={handleCreateNewSession}
                className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                + New Chat
              </button>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {sessions.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-8">
                  <p>No conversations yet</p>
                  <p className="text-xs mt-1">Start a new chat to begin!</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg cursor-pointer transition-all group relative ${
                      currentSessionId === session.sessionId
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => loadChatHistory(session.sessionId)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {session.messages && session.messages.length > 0
                            ? session.messages[0].content.slice(0, 40) + '...'
                            : 'New conversation'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimestamp(session.lastMessageAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(session.sessionId);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 ml-2"
                      >
                        🗑️
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* User Info */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                {user?.avatarUrl && (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500">XP: {user?.totalXp}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="text-gray-500 hover:text-gray-700 lg:hidden"
            >
              ☰
            </button>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Lingoria AI English Assistant
              </h1>
              <p className="text-sm text-gray-500">
                Ask me anything about English learning! 🤖
              </p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loadingHistory ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="text-6xl mb-4">🤖</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome to Lingoria AI English Assistant
                </h2>
                <p className="text-gray-600 mb-6">
                  I'm here to help you learn English! Ask me about grammar,
                  vocabulary, pronunciation, or any English learning topic.
                </p>
                <div className="grid grid-cols-1 gap-3 text-left">
                  <button
                    onClick={() =>
                      setInputMessage(
                        'Explain the difference between Present Simple and Present Continuous'
                      )
                    }
                    className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                  >
                    💡 Explain grammar rules
                  </button>
                  <button
                    onClick={() =>
                      setInputMessage(
                        'Give me 10 common phrasal verbs with examples'
                      )
                    }
                    className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                  >
                    📚 Learn new vocabulary
                  </button>
                  <button
                    onClick={() =>
                      setInputMessage('Help me improve my writing skills')
                    }
                    className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                  >
                    ✍️ Practice writing
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3xl rounded-2xl px-6 py-4 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">
                        {message.role === 'user' ? '👤' : '🤖'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">
                          {message.role === 'user' ? 'You' : 'Lingoria AI Assistant'}
                        </p>
                        <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="max-w-3xl rounded-2xl px-6 py-4 bg-white border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🤖</div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything about English learning..."
                className="flex-1 px-6 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || loading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send 🚀
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              AI can make mistakes. This assistant focuses only on English
              learning topics.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
