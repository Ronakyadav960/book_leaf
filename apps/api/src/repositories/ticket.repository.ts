import type { Prisma, TicketStatus } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export class TicketRepository {
  create(data: Prisma.TicketCreateInput) {
    return prisma.ticket.create({
      data,
      include: { book: true, author: true, aiAnalysis: true }
    });
  }

  findById(id: string) {
    return prisma.ticket.findUnique({
      where: { id },
      include: {
        author: true,
        book: true,
        aiAnalysis: true,
        responses: { include: { author: true }, orderBy: { createdAt: "asc" } },
        notes: { include: { author: true }, orderBy: { createdAt: "asc" } },
        assignments: { include: { admin: true }, orderBy: { createdAt: "desc" } },
        statusHistory: { orderBy: { createdAt: "asc" } }
      }
    });
  }

  list(args: {
    where?: Prisma.TicketWhereInput;
    page?: number;
    limit?: number;
    orderBy?: Prisma.TicketOrderByWithRelationInput;
  }) {
    const page = args.page ?? 1;
    const limit = args.limit ?? 20;
    return prisma.$transaction([
      prisma.ticket.count({ where: args.where }),
      prisma.ticket.findMany({
        where: args.where,
        include: { author: true, book: true, aiAnalysis: true, responses: true },
        orderBy: args.orderBy ?? { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit
      })
    ]);
  }

  async updateStatus(id: string, from: TicketStatus | undefined, to: TicketStatus) {
    return prisma.$transaction(async (tx) => {
      await tx.statusHistory.create({ data: { ticketId: id, from, to } });
      return tx.ticket.update({
        where: { id },
        data: { status: to, resolvedAt: to === "RESOLVED" ? new Date() : undefined },
        include: { author: true, book: true, aiAnalysis: true }
      });
    });
  }
}
