import type { TicketCategory, TicketPriority, TicketStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AiService } from "../ai/ai.service.js";
import { AppError } from "../middleware/errors.js";
import { emitRealtime } from "../realtime/socket.js";
import { TicketRepository } from "../repositories/ticket.repository.js";
import { AutomationService } from "./automation.service.js";

export class TicketService {
  private tickets = new TicketRepository();
  private ai = new AiService();
  private automation = new AutomationService();

  async create(authorId: string, data: { bookId?: string; subject: string; description: string; attachmentUrl?: string }) {
    const book = data.bookId ? await prisma.book.findFirst({ where: { id: data.bookId, authorId } }) : null;
    if (data.bookId && !book) throw new AppError(404, "Book not found", "BOOK_NOT_FOUND");

    const analysis = await this.ai.analyzeTicket({
      subject: data.subject,
      description: data.description,
      bookTitle: book?.title
    });

    const ticket = await this.tickets.create({
      author: { connect: { id: authorId } },
      book: book ? { connect: { id: book.id } } : undefined,
      subject: data.subject,
      description: data.description,
      attachmentUrl: data.attachmentUrl,
      status: "OPEN",
      priority: analysis.priority.priority,
      category: analysis.classification.category,
      escalated: analysis.escalation.escalationRequired,
      department: analysis.escalation.department,
      aiAnalysis: {
        create: {
          summary: analysis.summary,
          category: analysis.classification.category,
          categoryConfidence: analysis.classification.confidence,
          priority: analysis.priority.priority,
          priorityConfidence: analysis.priority.confidence,
          escalationRequired: analysis.escalation.escalationRequired,
          department: analysis.escalation.department,
          suggestedActions: analysis.suggestedActions,
          draftResponse: analysis.draftResponse,
          retrievedContext: analysis.retrievedContext,
          serviceAvailable: analysis.serviceAvailable,
          warning: analysis.warning
        }
      },
      statusHistory: { create: { to: "OPEN" } }
    });

    emitRealtime("ticket:new", ticket, ["admin", `user:${authorId}`]);
    await this.automation.dispatch({
      event: analysis.escalation.escalationRequired ? "ticket.escalated" : "ticket.created",
      entityId: ticket.id,
      data: {
        ticketId: ticket.id,
        authorId,
        category: ticket.category,
        priority: ticket.priority,
        department: ticket.department,
        summary: analysis.summary
      }
    });
    return ticket;
  }

  async listForAuthor(authorId: string, page = 1, limit = 20) {
    const [total, data] = await this.tickets.list({ where: { authorId }, page, limit });
    return { data, meta: { total, page, limit } };
  }

  async listAdmin(filters: Record<string, string | undefined>) {
    const page = Number(filters.page ?? 1);
    const limit = Number(filters.limit ?? 20);
    const createdAt: Prisma.DateTimeFilter | undefined = filters.dateFrom || filters.dateTo
      ? {
          gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
          lte: filters.dateTo ? endOfDay(filters.dateTo) : undefined
        }
      : undefined;
    const where: Prisma.TicketWhereInput = {
      status: filters.status as TicketStatus | undefined,
      category: filters.category as TicketCategory | undefined,
      priority: filters.priority as TicketPriority | undefined,
      escalated: filters.escalated ? filters.escalated === "true" : undefined,
      createdAt
    };
    if (filters.sort === "priority") {
      const data = await prisma.ticket.findMany({
        where,
        include: { author: true, book: true, aiAnalysis: true, responses: true }
      });
      const sorted = data.sort((a, b) => {
        const priorityDelta = priorityRank(a.priority) - priorityRank(b.priority);
        if (priorityDelta !== 0) return priorityDelta;
        const statusDelta = statusRank(a.status) - statusRank(b.status);
        if (statusDelta !== 0) return statusDelta;
        return a.createdAt.getTime() - b.createdAt.getTime();
      });
      return { data: sorted.slice((page - 1) * limit, page * limit), meta: { total: sorted.length, page, limit } };
    }
    const orderBy = filters.sort === "oldest" ? { createdAt: "asc" as const } : { createdAt: "desc" as const };
    const [total, data] = await this.tickets.list({ where, page, limit, orderBy });
    return { data, meta: { total, page, limit } };
  }

  async getVisible(ticketId: string, user: { id: string; role: string }) {
    const ticket = await this.tickets.findById(ticketId);
    if (!ticket) throw new AppError(404, "Ticket not found", "TICKET_NOT_FOUND");
    if (user.role === "AUTHOR" && ticket.authorId !== user.id) throw new AppError(403, "Forbidden", "FORBIDDEN");
    return ticket;
  }

  async respond(ticketId: string, user: { id: string; role: string }, message: string) {
    const ticket = await this.getVisible(ticketId, user);
    const response = await prisma.ticketResponse.create({
      data: { ticketId, authorId: user.id, message },
      include: { author: true, ticket: true }
    });
    emitRealtime("ticket:response", response, ["admin", `ticket:${ticketId}`, `user:${ticket.authorId}`]);
    return response;
  }

  async updateAdmin(ticketId: string, adminId: string, data: { status?: TicketStatus; priority?: TicketPriority; category?: TicketCategory; assigneeId?: string; internalNote?: string }) {
    const existing = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!existing) throw new AppError(404, "Ticket not found", "TICKET_NOT_FOUND");

    if (data.status && data.status !== existing.status) {
      await this.tickets.updateStatus(ticketId, existing.status, data.status);
      emitRealtime("ticket:status", { ticketId, status: data.status }, ["admin", `ticket:${ticketId}`, `user:${existing.authorId}`]);
      if (data.status === "ESCALATED") {
        await this.automation.dispatch({
          event: "ticket.escalated",
          entityId: ticketId,
          data: { ticketId, authorId: existing.authorId, previousStatus: existing.status, status: data.status }
        });
      }
    }

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        priority: data.priority,
        category: data.category,
        assignments: data.assigneeId ? { create: { adminId: data.assigneeId } } : undefined,
        notes: data.internalNote ? { create: { authorId: adminId, note: data.internalNote } } : undefined
      },
      include: { author: true, book: true, aiAnalysis: true, assignments: true, notes: true }
    });

    if (data.assigneeId) emitRealtime("ticket:assignment", updated, ["admin", `ticket:${ticketId}`]);
    return updated;
  }

  async regenerateAiAnalysis(ticketId: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { book: true, aiAnalysis: true }
    });
    if (!ticket) throw new AppError(404, "Ticket not found", "TICKET_NOT_FOUND");

    const analysis = await this.ai.analyzeTicket({
      subject: ticket.subject,
      description: ticket.description,
      bookTitle: ticket.book?.title
    });

    if (ticket.aiAnalysis) {
      await prisma.aiAnalysis.delete({ where: { ticketId } });
    }

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        priority: analysis.priority.priority,
        category: analysis.classification.category,
        escalated: analysis.escalation.escalationRequired,
        department: analysis.escalation.department,
        aiAnalysis: {
          create: {
            summary: analysis.summary,
            category: analysis.classification.category,
            categoryConfidence: analysis.classification.confidence,
            priority: analysis.priority.priority,
            priorityConfidence: analysis.priority.confidence,
            escalationRequired: analysis.escalation.escalationRequired,
            department: analysis.escalation.department,
            suggestedActions: analysis.suggestedActions,
            draftResponse: analysis.draftResponse,
            retrievedContext: analysis.retrievedContext,
            serviceAvailable: analysis.serviceAvailable,
            warning: analysis.warning
          }
        }
      },
      include: { author: true, book: true, aiAnalysis: true, assignments: true, notes: true }
    });

    emitRealtime("ticket:assignment", updated, ["admin", `ticket:${ticketId}`]);
    return updated;
  }
}

function endOfDay(date: string) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

function priorityRank(priority: TicketPriority) {
  return { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }[priority];
}

function statusRank(status: TicketStatus) {
  return status === "RESOLVED" || status === "CLOSED" ? 1 : 0;
}
