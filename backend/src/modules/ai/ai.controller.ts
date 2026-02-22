import { Request, Response } from 'express';
import { AIService } from './ai.service';

const aiService = new AIService(); // ✅ AIService

export class AiController {
  // POST /api/v1/ai/chat
  async sendMessage(req: Request, res: Response) {
    try {
      const { sessionId, message } = req.body;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      if (!message || !sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Message and sessionId are required',
        });
      }

      const result = await aiService.sendMessage(userId, sessionId, message);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('AI Chat Error:', error);
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to send message',
      });
    }
  }

  // POST /api/v1/ai/explain-answer
  async explainAnswer(req: Request, res: Response) {
    try {
      const { question, userAnswer, correctAnswer, context } = req.body;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      if (!question || !correctAnswer) {
        return res.status(400).json({
          success: false,
          message: 'Question and correct answer are required',
        });
      }

      const explanation = await aiService.explainWrongAnswer(
        question,
        userAnswer,
        correctAnswer,
        context
      );

      res.json({
        success: true,
        data: { explanation },
      });
    } catch (error) {
      console.error('AI explain error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate explanation',
      });
    }
  }

  // Diğer metodlar aynı kalır...
  async getUserSessions(req: Request, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const sessions = await aiService.getUserSessions(userId);

      res.json({
        success: true,
        data: sessions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sessions',
      });
    }
  }

  async getChatHistory(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const messages = await aiService.getChatHistory(userId, sessionId);

      res.json({
        success: true,
        data: messages,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch chat history',
      });
    }
  }

  async deleteSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      await aiService.deleteSession(userId, sessionId);

      res.json({
        success: true,
        message: 'Session deleted',
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }
  }

  async createNewSession(req: Request, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const session = await aiService.createNewSession(userId);

      res.json({
        success: true,
        data: session,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create session',
      });
    }
  }
}
