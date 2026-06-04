import { prisma } from "../config/prisma.js";

export class AnalyticsService {
  async adminDashboard() {
    const [totalTickets, openTickets, resolvedTickets, criticalTickets, escalatedTickets, byCategory, byPriority] = await Promise.all([
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
      prisma.ticket.count({ where: { status: "RESOLVED" } }),
      prisma.ticket.count({ where: { priority: "CRITICAL" } }),
      prisma.ticket.count({ where: { escalated: true } }),
      prisma.ticket.groupBy({ by: ["category"], _count: true }),
      prisma.ticket.groupBy({ by: ["priority"], _count: true })
    ]);

    const avgResolution = await prisma.ticket.findMany({ where: { resolvedAt: { not: null } }, select: { createdAt: true, resolvedAt: true } });
    const averageResolutionHours = avgResolution.length
      ? avgResolution.reduce((sum, ticket) => sum + ((ticket.resolvedAt!.getTime() - ticket.createdAt.getTime()) / 36e5), 0) / avgResolution.length
      : 0;

    return {
      totals: { totalTickets, openTickets, resolvedTickets, criticalTickets, escalatedTickets },
      charts: { byCategory, byPriority },
      aiInsights: {
        mostCommonIssues: byCategory.sort((a, b) => b._count - a._count).slice(0, 3),
        averageResolutionHours: Number(averageResolutionHours.toFixed(1)),
        recommendations: [
          "Review high-volume categories weekly and publish clarifying author guidance.",
          "Route finance escalations directly to the royalty operations owner.",
          "Audit tickets with low AI confidence for knowledge base gaps."
        ]
      }
    };
  }

  async authorDashboard(authorId: string) {
    const [books, openTickets, recentTickets] = await Promise.all([
      prisma.book.findMany({ where: { authorId } }),
      prisma.ticket.count({ where: { authorId, status: { in: ["OPEN", "IN_PROGRESS", "ESCALATED"] } } }),
      prisma.ticket.findMany({ where: { authorId }, include: { book: true, aiAnalysis: true }, orderBy: { createdAt: "desc" }, take: 5 })
    ]);

    return {
      totalBooks: books.length,
      openTickets,
      pendingRoyalty: books.reduce((sum, book) => sum + Number(book.royaltyPending), 0),
      totalRoyaltyEarned: books.reduce((sum, book) => sum + Number(book.royaltyEarned), 0),
      recentTickets
    };
  }
}
