import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "../config/env.js";

let io: Server | undefined;

export function createSocketServer(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (process.env.NODE_ENV !== "production") return callback(null, true);
        if (origin === env.FRONTEND_URL) return callback(null, true);
        return callback(new Error(`Socket CORS blocked origin: ${origin}`));
      },
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    socket.on("join:user", (userId: string) => socket.join(`user:${userId}`));
    socket.on("join:ticket", (ticketId: string) => socket.join(`ticket:${ticketId}`));
    socket.on("join:admin", () => socket.join("admin"));
  });

  return io;
}

export function emitRealtime(event: string, payload: unknown, rooms: string[] = ["admin"]) {
  if (!io) return;
  for (const room of rooms) io.to(room).emit(event, payload);
}
