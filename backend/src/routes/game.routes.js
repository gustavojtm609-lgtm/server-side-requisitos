import { Router } from 'express';
import * as gameController from '../controllers/game.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  answerSchema,
  sessionSchema,
  startGameSchema,
} from '../validators/game.validator.js';

const router = Router();

router.use(authenticate);
router.get('/options', asyncHandler(gameController.options));
router.get('/active', asyncHandler(gameController.active));
router.post('/sessions', validate(startGameSchema), asyncHandler(gameController.start));
router.post(
  '/sessions/:sessionId/answer',
  validate(answerSchema),
  asyncHandler(gameController.answer),
);
router.post(
  '/sessions/:sessionId/abandon',
  validate(sessionSchema),
  asyncHandler(gameController.abandon),
);
router.get(
  '/sessions/:sessionId/result',
  validate(sessionSchema),
  asyncHandler(gameController.result),
);

export default router;
