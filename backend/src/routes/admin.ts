import { Router } from 'express';
import { asyncHandler } from '../middleware/error';
import { adminMiddleware } from '../middleware/auth';

const router = Router();

// Apply admin middleware to all routes
router.use(adminMiddleware);

// GET /api/admin/sessions - Get all sessions (admin only)
router.get('/sessions',
  asyncHandler(async (req, res) => {
    // TODO: Implement admin session listing
    res.json({
      success: true,
      data: {
        sessions: [],
        total: 0,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: res.locals.requestId,
      },
    });
  })
);

// GET /api/admin/metrics - Get system metrics
router.get('/metrics',
  asyncHandler(async (req, res) => {
    // TODO: Implement metrics collection
    res.json({
      success: true,
      data: {
        activeSessions: 0,
        totalSessions: 0,
        averageLatency: 0,
        errorRate: 0,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: res.locals.requestId,
      },
    });
  })
);

export default router;