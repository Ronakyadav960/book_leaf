import { Router } from "express";
import { getTicket, listAdminTickets, updateAdminTicket, regenerateAiAnalysis } from "../controllers/ticket.controller.js";
import { listAdmins } from "../controllers/auth.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { updateTicketSchema } from "../validators/ticket.validator.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole("ADMIN"));

/**
 * @openapi
 * /admin/tickets:
 *   get:
 *     summary: List all tickets for admin with filters
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [priority, oldest, newest]
 *     responses:
 *       200:
 *         description: Paginated list of all tickets
 */
adminRouter.get("/tickets", listAdminTickets);

/**
 * @openapi
 * /admin/tickets/{id}:
 *   get:
 *     summary: Get a specific ticket by ID (Admin view)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Full ticket details including internal notes
 */
adminRouter.get("/tickets/:id", getTicket);

/**
 * @openapi
 * /admin/tickets/{id}:
 *   patch:
 *     summary: Update ticket status, priority, category, or assignment
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               priority:
 *                 type: string
 *               category:
 *                 type: string
 *               assigneeId:
 *                 type: string
 *               internalNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 */
adminRouter.patch("/tickets/:id", validate(updateTicketSchema), updateAdminTicket);

/**
 * @openapi
 * /admin/admins:
 *   get:
 *     summary: List all admin users (for assignment dropdowns)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of admin users
 */
adminRouter.get("/admins", listAdmins);

/**
 * @openapi
 * /admin/tickets/{id}/regenerate-ai:
 *   post:
 *     summary: Force regenerate the AI analysis for a ticket
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: New AI analysis generated
 */
adminRouter.post("/tickets/:id/regenerate-ai", regenerateAiAnalysis);
