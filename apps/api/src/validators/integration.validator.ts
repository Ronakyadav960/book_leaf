import { z } from "zod";

export const integrationWebhookSchema = z.object({
  body: z.object({
    externalId: z.string().min(1),
    bookId: z.string().optional(),
    ticketId: z.string().optional(),
    status: z.string().min(1),
    amount: z.number().optional(),
    provider: z.string().optional(),
    raw: z.record(z.unknown()).optional()
  })
});
