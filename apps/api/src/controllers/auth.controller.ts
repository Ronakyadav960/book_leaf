import type { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";
import { prisma } from "../config/prisma.js";

const service = new AuthService();

export async function login(req: Request, res: Response) {
  res.json(await service.login(req.body.email, req.body.password));
}

export async function listAdmins(req: Request, res: Response) {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true, name: true, email: true }
  });
  res.json(admins);
}

