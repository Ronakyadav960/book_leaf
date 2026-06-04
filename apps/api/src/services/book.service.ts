import { prisma } from "../config/prisma.js";

export class BookService {
  listForAuthor(authorId: string) {
    return prisma.book.findMany({ where: { authorId }, orderBy: { createdAt: "desc" } });
  }
}
