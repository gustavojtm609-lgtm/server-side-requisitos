import { Router } from 'express';
import * as rankingController from '../controllers/ranking.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  historySchema,
  leaderboardSchema,
} from '../validators/ranking.validator.js';

const router = Router();

router.use(authenticate);
router.get(
  '/',
  validate(leaderboardSchema),
  asyncHandler(rankingController.leaderboard),
);
router.get(
  '/me/history',
  validate(historySchema),
  asyncHandler(rankingController.history),
);
router.get('/me/summary', asyncHandler(rankingController.summary));

export default router;
