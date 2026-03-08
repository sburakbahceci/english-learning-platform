import { Router } from 'express';
import { PlacementTestController } from './placement-test.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
const placementTestController = new PlacementTestController();

// Tüm route'lar authenticate gerektirir
router.use(authenticate);

// GET /api/v1/placement-test/status - Test yapılmış mı?
router.get(
  '/status',
  placementTestController.getStatus.bind(placementTestController)
);

// POST /api/v1/placement-test/start - Test başlat
router.post(
  '/start',
  placementTestController.startTest.bind(placementTestController)
);

// POST /api/v1/placement-test/answer - Cevap gönder
router.post(
  '/answer',
  placementTestController.submitAnswer.bind(placementTestController)
);

// POST /api/v1/placement-test/complete - Test'i bitir
router.post(
  '/complete',
  placementTestController.completeTest.bind(placementTestController)
);

// GET /api/v1/placement-test/results - Sonuçları getir
router.get(
  '/results',
  placementTestController.getResults.bind(placementTestController)
);

export default router;
