import { Router } from "express";
import { listBooks } from "../controllers/book.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const bookRouter = Router();

bookRouter.use(requireAuth);

/**
 * @openapi
 * /books:
 *   get:
 *     summary: List all books for the authenticated author
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of author's books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Unauthorized
 */
bookRouter.get("/", requireRole("AUTHOR"), listBooks);
