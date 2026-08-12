import { Router } from 'express';
import adminRoutes from './admin.routes.js';
import authRoutes from './auth.routes.js';
import gameRoutes from './game.routes.js';
import rankingRoutes from './ranking.routes.js';

const router = Router();

router.get('/health', (_request, response) => {
  response.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  });
});

router.use('/auth', authRoutes);
router.use('/game', gameRoutes);
router.use('/rankings', rankingRoutes);
router.use('/admin', adminRoutes);

export default router;
