import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import {
  clearSocketIOServer,
  setSocketIOServer,
} from "@/lib/socket-server";
import { registerSocketHandlers } from "@/lib/socket/register-handlers";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME ?? "localhost";
const port = Number.parseInt(process.env.PORT ?? "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

void app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url ?? "", true);
    void handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: { origin: dev ? true : false },
  });

  setSocketIOServer(io);
  registerSocketHandlers(io);

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });

  httpServer.on("close", () => {
    clearSocketIOServer();
  });
});
