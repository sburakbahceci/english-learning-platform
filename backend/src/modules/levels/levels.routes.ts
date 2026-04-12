import { Router } from 'express';
import { LevelsController } from './levels.controller';
import { authenticate } from '../../middleware/auth'; // ✅ Import

const router = Router();
const levelsController = new LevelsController();

// ✅ authenticate middleware eklendi
router.get(
  '/',
  authenticate,
  levelsController.getAllLevels.bind(levelsController)
);
router.get(
  '/:code',
  authenticate,
  levelsController.getLevelByCode.bind(levelsController)
);

export default router;
