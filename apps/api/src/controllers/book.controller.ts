import type { Request, Response } from "express";
import { BookService } from "../services/book.service.js";

const service = new BookService();

export async function listBooks(req: Request, res: Response) {
  res.json(await service.listForAuthor(req.user!.id));
}
