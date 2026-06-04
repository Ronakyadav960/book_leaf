import { Router } from "express";
import { integrationHealth, receiveDistributionWebhook, receivePaymentWebhook, receivePrintWebhook } from "../controllers/integration.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { integrationWebhookSchema } from "../validators/integration.validator.js";

export const integrationRouter = Router();

integrationRouter.get("/health", requireAuth, requireRole("ADMIN"), integrationHealth);
integrationRouter.post("/webhooks/payment", validate(integrationWebhookSchema), receivePaymentWebhook);
integrationRouter.post("/webhooks/print", validate(integrationWebhookSchema), receivePrintWebhook);
integrationRouter.post("/webhooks/distribution", validate(integrationWebhookSchema), receiveDistributionWebhook);
