import { Request, Response } from 'express';
import { PlacementTestService } from './placement-test.service';

const placementTestService = new PlacementTestService();

export class PlacementTestController {
  // GET /api/v1/placement-test/status
  async getStatus(req: Request, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const completed = await placementTestService.hasUserCompletedTest(userId);

      res.json({
        success: true,
        data: { completed },
      });
    } catch (error) {
      console.error('Get placement test status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get placement test status',
      });
    }
  }

  // POST /api/v1/placement-test/start
  async startTest(req: Request, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const result = await placementTestService.startPlacementTest(userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'PLACEMENT_TEST_ALREADY_COMPLETED'
      ) {
        return res.status(400).json({
          success: false,
          message: 'You have already completed the placement test',
        });
      }

      console.error('Start placement test error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start placement test',
      });
    }
  }

  // POST /api/v1/placement-test/answer
  async submitAnswer(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const { questionId, userAnswer } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      if (!questionId || !userAnswer) {
        return res.status(400).json({
          success: false,
          message: 'Question ID and answer are required',
        });
      }

      const result = await placementTestService.submitAnswer(
        userId,
        questionId,
        userAnswer
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Submit answer error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit answer',
      });
    }
  }

  // POST /api/v1/placement-test/complete
  async completeTest(req: Request, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const result = await placementTestService.completePlacementTest(userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Complete placement test error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to complete placement test',
      });
    }
  }

  // GET /api/v1/placement-test/results
  async getResults(req: Request, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const results = await placementTestService.getTestResults(userId);

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.error('Get results error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get results',
      });
    }
  }
}
