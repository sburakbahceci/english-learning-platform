import { Router } from 'express';
import { LevelsController } from './levels.controller';

const router = Router();
const levelsController = new LevelsController();

// GET /api/v1/levels
router.get('/', (req, res) => levelsController.getAllLevels(req, res));

// GET /api/v1/levels/:code
router.get('/:code', (req, res) => levelsController.getLevelByCode(req, res));

export default router;
