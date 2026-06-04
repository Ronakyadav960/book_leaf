import { Router } from "express";
import { createTicket, getTicket, listMyTickets, respond } from "../controllers/ticket.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createTicketSchema, responseSchema } from "../validators/ticket.validator.js";

export const ticketRouter = Router();

ticketRouter.use(requireAuth);

/**
 * @openapi
 * /tickets:
 *   get:
 *     summary: List all tickets for the authenticated author
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated list of tickets
 * 
 *   post:
 *     summary: Create a new support ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - description
 *             properties:
 *               bookId:
 *                 type: string
 *               subject:
 *                 type: string
 *               description:
 *                 type: string
 *               attachmentUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ticket created successfully and AI analysis queued
 */
ticketRouter.get("/", requireRole("AUTHOR"), listMyTickets);
ticketRouter.post("/", requireRole("AUTHOR"), validate(createTicketSchema), createTicket);

/**
 * @openapi
 * /tickets/{id}:
 *   get:
 *     summary: Get a specific ticket by ID
 *     tags: [Tickets]
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
 *         description: Ticket details including responses and AI analysis
 *       404:
 *         description: Ticket not found
 */
ticketRouter.get("/:id", getTicket);

/**
 * @openapi
 * /tickets/{id}/responses:
 *   post:
 *     summary: Add a response to a ticket
 *     tags: [Tickets]
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
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Response added successfully
 */
ticketRouter.post("/:id/responses", validate(responseSchema), respond);
