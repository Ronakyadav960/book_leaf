import { z } from "zod";

export const createTicketSchema = z.object({
  body: z.object({
    bookId: z.string().optional(),
    subject: z.string().min(4).max(160),
    description: z.string().min(20).max(8000),
    attachmentUrl: z.string().url().optional()
  })
});

export const updateTicketSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    status: z.enum(["OPEN", "IN_PROGRESS", "WAITING_ON_AUTHOR", "ESCALATED", "RESOLVED", "CLOSED"]).optional(),
    priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional(),
    category: z.enum([
      "ROYALTY_PAYMENTS",
      "ISBN_METADATA",
      "PRINTING_QUALITY",
      "DISTRIBUTION_AVAILABILITY",
      "BOOK_STATUS_PRODUCTION",
      "GENERAL_INQUIRY"
    ]).optional(),
    assigneeId: z.string().optional(),
    internalNote: z.string().min(2).optional()
  })
});

export const responseSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({ message: z.string().min(2).max(4000) })
});
