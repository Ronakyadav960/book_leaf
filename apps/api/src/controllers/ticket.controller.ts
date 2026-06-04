import type { Request, Response } from "express";
import { TicketService } from "../services/ticket.service.js";

const service = new TicketService();

export async function createTicket(req: Request, res: Response) {
  res.status(201).json(await service.create(req.user!.id, req.body));
}

export async function listMyTickets(req: Request, res: Response) {
  res.json(await service.listForAuthor(req.user!.id, Number(req.query.page ?? 1), Number(req.query.limit ?? 20)));
}

export async function listAdminTickets(req: Request, res: Response) {
  res.json(await service.listAdmin(req.query as Record<string, string | undefined>));
}

export async function getTicket(req: Request, res: Response) {
  res.json(await service.getVisible(String(req.params.id), req.user!));
}

export async function respond(req: Request, res: Response) {
  res.status(201).json(await service.respond(String(req.params.id), req.user!, req.body.message));
}

export async function updateAdminTicket(req: Request, res: Response) {
  res.json(await service.updateAdmin(String(req.params.id), req.user!.id, req.body));
}

export async function regenerateAiAnalysis(req: Request, res: Response) {
  res.json(await service.regenerateAiAnalysis(String(req.params.id)));
}

