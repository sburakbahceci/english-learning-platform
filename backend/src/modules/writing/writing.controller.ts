import { Request, Response } from 'express';
import { WritingService } from './writing.service';

const writingService = new WritingService();

export class WritingController {
  // GET /api/v1/writing/level/:levelCode
  async getPromptsByLevel(req: Request, res: Response) {
    try {
      const { levelCode } = req.params;
      const prompts = await writingService.getPromptsByLevel(levelCode);

      res.json({
        success: true,
        data: prompts,
      });
    } catch (error) {
      console.error('Get prompts by level error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get writing prompts',
      });
    }
  }

  // GET /api/v1/writing/prompt/:id
  async getPromptById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const prompt = await writingService.getPromptById(id);

      res.json({
        success: true,
        data: prompt,
      });
    } catch (error) {
      console.error('Get prompt by id error:', error);
      res.status(404).json({
        success: false,
        message: 'Prompt not found',
      });
    }
  }

  // POST /api/v1/writing/submit
  async submitWriting(req: Request, res: Response) {
    try {
      const { promptId, content } = req.body;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Content is required',
        });
      }

      const submission = await writingService.submitWriting(
        userId,
        promptId,
        content
      );

      res.json({
        success: true,
        data: submission,
      });
    } catch (error) {
      console.error('Submit writing error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit writing',
      });
    }
  }

  // GET /api/v1/writing/user/submissions
  async getUserSubmissions(req: Request, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const submissions = await writingService.getUserSubmissions(userId);

      res.json({
        success: true,
        data: submissions,
      });
    } catch (error) {
      console.error('Get user submissions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get submissions',
      });
    }
  }

  // GET /api/v1/writing/submission/:id
  async getSubmissionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const submission = await writingService.getSubmissionById(id, userId);

      res.json({
        success: true,
        data: submission,
      });
    } catch (error) {
      console.error('Get submission by id error:', error);
      res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }
  }
}
