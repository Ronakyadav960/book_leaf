import type { Request, Response } from "express";
import { AnalyticsService } from "../services/analytics.service.js";

const service = new AnalyticsService();

export async function adminAnalytics(_req: Request, res: Response) {
  res.json(await service.adminDashboard());
}

export async function authorAnalytics(req: Request, res: Response) {
  res.json(await service.authorDashboard(req.user!.id));
}
