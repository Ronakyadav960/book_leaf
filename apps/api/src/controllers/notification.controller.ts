import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export async function listNotifications(req: Request, res: Response) {
  res.json(await prisma.notification.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: "desc" }, take: 50 }));
}

export async function markNotificationRead(req: Request, res: Response) {
  res.json(await prisma.notification.update({ where: { id: String(req.params.id) }, data: { read: true } }));
}
