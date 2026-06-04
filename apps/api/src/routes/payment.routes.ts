import { Router } from "express";
import { createCheckoutSession, stripeWebhook } from "../controllers/payment.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import express from "express";

export const paymentRouter = Router();

// Webhook must be raw body, so we skip the global JSON parser for this route
// We will handle raw body in the main app.ts but for modularity we usually configure it there.
// For now, assume app.ts is configured to pass raw body to /api/payments/webhook
paymentRouter.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

// Protected routes
paymentRouter.use(requireAuth);
paymentRouter.post("/checkout", requireRole("AUTHOR"), createCheckoutSession);
