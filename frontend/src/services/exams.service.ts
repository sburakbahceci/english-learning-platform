import api from './api';
import type { Exam, Question, ExamSubmitResponse, ExamAttempt } from '../types';

interface StartExamResponse {
  exam: Exam;
  questions: Question[];
}

export const examsService = {
  async startExam(
    levelId: string
  ): Promise<{ success: boolean; data: StartExamResponse }> {
    const response = await api.post<{
      success: boolean;
      data: StartExamResponse;
    }>(`/exams/levels/${levelId}/start`);
    return response.data;
  },

  async submitExam(
    examId: string,
    answers: Record<string, string>
  ): Promise<{ success: boolean; data: ExamSubmitResponse }> {
    const response = await api.post<{
      success: boolean;
      data: ExamSubmitResponse;
    }>(`/exams/${examId}/submit`, { answers });
    return response.data;
  },

  async getResults(examId: string): Promise<{ success: boolean; data: Exam }> {
    const response = await api.get<{ success: boolean; data: Exam }>(
      `/exams/${examId}/results`
    );
    return response.data;
  },

  async getAttempts(
    levelId: string
  ): Promise<{ success: boolean; data: ExamAttempt[] }> {
    const response = await api.get<{ success: boolean; data: ExamAttempt[] }>(
      `/exams/levels/${levelId}/attempts`
    );
    return response.data;
  },
};
