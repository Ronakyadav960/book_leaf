import http from "http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { createSocketServer } from "./realtime/socket.js";

const app = createApp();
const server = http.createServer(app);

createSocketServer(server);

server.listen(env.PORT, () => {
  console.log(`BookLeaf API listening on http://localhost:${env.PORT}`);
  console.log(`Swagger docs available at http://localhost:${env.PORT}/api/docs`);
});
