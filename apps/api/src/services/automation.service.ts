import { env } from "../config/env.js";

export type AutomationEvent =
  | "ticket.created"
  | "ticket.escalated"
  | "payment.royalty_paid"
  | "print.status_updated"
  | "distribution.status_updated";

type AutomationPayload = {
  event: AutomationEvent;
  entityId: string;
  data: Record<string, unknown>;
};

export class AutomationService {
  async dispatch(payload: AutomationPayload) {
    if (!env.N8N_WEBHOOK_URL) {
      return { delivered: false, reason: "N8N_WEBHOOK_URL is not configured" };
    }

    try {
      const response = await fetch(env.N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(env.WEBHOOK_SHARED_SECRET ? { "x-bookleaf-secret": env.WEBHOOK_SHARED_SECRET } : {})
        },
        body: JSON.stringify({
          ...payload,
          emittedAt: new Date().toISOString(),
          source: "bookleaf-api"
        }),
        signal: AbortSignal.timeout(8000)
      });

      return { delivered: response.ok, status: response.status };
    } catch (error) {
      console.warn("Automation dispatch failed", error);
      return { delivered: false, reason: "Automation endpoint unavailable" };
    }
  }

  health() {
    return {
      n8n: Boolean(env.N8N_WEBHOOK_URL),
      payments: Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET),
      printApi: Boolean(env.PRINT_API_BASE_URL),
      distributionApi: Boolean(env.DISTRIBUTION_API_BASE_URL),
      webhookSecret: Boolean(env.WEBHOOK_SHARED_SECRET)
    };
  }
}
