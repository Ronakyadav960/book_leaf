import { Router } from "express";
import { adminAnalytics, authorAnalytics } from "../controllers/analytics.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth);

/**
 * @openapi
 * /analytics/author:
 *   get:
 *     summary: Get author dashboard analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Author dashboard statistics and recent tickets
 *       401:
 *         description: Unauthorized
 */
analyticsRouter.get("/author", requireRole("AUTHOR"), authorAnalytics);

/**
 * @openapi
 * /analytics/admin:
 *   get:
 *     summary: Get admin dashboard analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin system-wide statistics and AI insights
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
analyticsRouter.get("/admin", requireRole("ADMIN"), adminAnalytics);
