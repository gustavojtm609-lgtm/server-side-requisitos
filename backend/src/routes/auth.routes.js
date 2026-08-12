import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authRateLimiter } from '../middlewares/rateLimit.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  loginSchema,
  optionalRefreshSchema,
  registerSchema,
} from '../validators/auth.validator.js';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  asyncHandler(authController.register),
);
router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  asyncHandler(authController.login),
);
router.post(
  '/refresh',
  authRateLimiter,
  validate(optionalRefreshSchema),
  asyncHandler(authController.refresh),
);
router.post(
  '/logout',
  validate(optionalRefreshSchema),
  asyncHandler(authController.logout),
);
router.get('/me', authenticate, asyncHandler(authController.me));

export default router;
