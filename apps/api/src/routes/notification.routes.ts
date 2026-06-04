import { Router } from "express";
import { listNotifications, markNotificationRead } from "../controllers/notification.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const notificationRouter = Router();

notificationRouter.use(requireAuth);
notificationRouter.get("/", listNotifications);
notificationRouter.patch("/:id/read", markNotificationRead);
