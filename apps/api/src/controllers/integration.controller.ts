import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "../middleware/errors.js";
import { AutomationService, type AutomationEvent } from "../services/automation.service.js";

const automation = new AutomationService();

export async function integrationHealth(_req: Request, res: Response) {
  res.json({
    status: "ok",
    integrations: automation.health()
  });
}

export async function receivePaymentWebhook(req: Request, res: Response) {
  assertWebhookSecret(req);
  await recordOperationalEvent("payment.royalty_paid", req.body);
  res.status(202).json({ accepted: true, workflow: "payment.royalty_paid" });
}

export async function receivePrintWebhook(req: Request, res: Response) {
  assertWebhookSecret(req);
  await recordOperationalEvent("print.status_updated", req.body);
  res.status(202).json({ accepted: true, workflow: "print.status_updated" });
}

export async function receiveDistributionWebhook(req: Request, res: Response) {
  assertWebhookSecret(req);
  await recordOperationalEvent("distribution.status_updated", req.body);
  res.status(202).json({ accepted: true, workflow: "distribution.status_updated" });
}

async function recordOperationalEvent(event: AutomationEvent, body: { ticketId?: string; bookId?: string; status: string; externalId: string; provider?: string; raw?: Record<string, unknown> }) {
  if (body.ticketId) {
    await prisma.internalNote.create({
      data: {
        ticketId: body.ticketId,
        authorId: await getSystemAdminId(),
        note: `Integration event ${event}: ${body.status} (${body.provider ?? body.externalId})`
      }
    });
  }

  await automation.dispatch({
    event,
    entityId: body.ticketId ?? body.bookId ?? body.externalId,
    data: body
  });
}

async function getSystemAdminId() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" }, select: { id: true } });
  if (!admin) throw new AppError(500, "No admin user available for operational notes", "SYSTEM_ADMIN_MISSING");
  return admin.id;
}

function assertWebhookSecret(req: Request) {
  if (!env.WEBHOOK_SHARED_SECRET) return;
  if (req.headers["x-bookleaf-secret"] !== env.WEBHOOK_SHARED_SECRET) {
    throw new AppError(401, "Invalid webhook secret", "INVALID_WEBHOOK_SECRET");
  }
}
