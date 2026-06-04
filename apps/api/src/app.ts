import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import { adminRouter } from "./routes/admin.routes.js";
import { analyticsRouter } from "./routes/analytics.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { bookRouter } from "./routes/book.routes.js";
import { notificationRouter } from "./routes/notification.routes.js";
import { integrationRouter } from "./routes/integration.routes.js";
import { ticketRouter } from "./routes/ticket.routes.js";
import { swaggerSpec } from "./docs/swagger.js";
import { paymentRouter } from "./routes/payment.routes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      if (origin === env.FRONTEND_URL) return callback(null, true);
      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true
  }));

  // Mount payment router before express.json() so webhook can use raw body
  app.use("/api/payments", paymentRouter);

  app.use(express.json({ limit: "2mb" }));
  app.use(morgan("dev"));
  app.use(rateLimit({ windowMs: 60_000, limit: 200 }));

  app.get("/health", (_req, res) => res.json({ ok: true, service: "bookleaf-api" }));
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use("/api/auth", authRouter);
  app.use("/api/books", bookRouter);
  app.use("/api/tickets", ticketRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/analytics", analyticsRouter);
  app.use("/api/notifications", notificationRouter);
  app.use("/api/integrations", integrationRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
