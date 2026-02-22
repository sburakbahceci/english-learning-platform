import api from './api';
import type { AiChatMessage, AiChatSession } from '../types';

export const aiService = {
  async sendMessage(
    sessionId: string,
    message: string
  ): Promise<{
    success: boolean;
    data: { message: AiChatMessage; sessionId: string };
  }> {
    const response = await api.post('/ai/chat', { sessionId, message });
    return response.data;
  },

  // ← Bu metod var mı?
  async explainAnswer(data: {
    question: string;
    userAnswer: string | null;
    correctAnswer: string;
    context?: string;
  }): Promise<{ success: boolean; data: { explanation: string } }> {
    const response = await api.post('/ai/explain-answer', data);
    return response.data;
  },

  async getUserSessions(): Promise<{
    success: boolean;
    data: AiChatSession[];
  }> {
    const response = await api.get('/ai/sessions');
    return response.data;
  },

  async getChatHistory(
    sessionId: string
  ): Promise<{ success: boolean; data: AiChatMessage[] }> {
    const response = await api.get(`/ai/sessions/${sessionId}/history`);
    return response.data;
  },

  async deleteSession(
    sessionId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/ai/sessions/${sessionId}`);
    return response.data;
  },

  async createNewSession(): Promise<{ success: boolean; data: AiChatSession }> {
    const response = await api.post('/ai/sessions/new');
    return response.data;
  },
};
