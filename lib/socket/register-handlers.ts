import type { Server as SocketIOServer } from "socket.io";
import { crawlRoomName } from "@/lib/socket/rooms";
import { abortCrawl } from "@/lib/crawler/running-crawls";
import { getActiveCrawlSession } from "@/lib/crawler/active-crawl-sessions";
import { SOCKET_EVENTS } from "@/types/socket-events";

export function registerSocketHandlers(io: SocketIOServer) {
  io.on("connection", (socket) => {
    socket.on("join-crawl-room", (rawId: unknown) => {
      const crawlId = typeof rawId === "string" ? rawId.trim() : "";
      if (!crawlId) return;
      const room = crawlRoomName(crawlId);
      void Promise.resolve(socket.join(room)).then(() => {
        const snapshot = getActiveCrawlSession(crawlId);
        if (snapshot) {
          socket.emit(SOCKET_EVENTS.CRAWL_START, snapshot);
        }
      });
    });

    socket.on("leave-crawl-room", (rawId: unknown) => {
      const crawlId = typeof rawId === "string" ? rawId.trim() : "";
      if (!crawlId) return;
      void socket.leave(crawlRoomName(crawlId));
    });

    socket.on("crawl:stop", (rawId: unknown) => {
      const crawlId = typeof rawId === "string" ? rawId.trim() : "";
      if (!crawlId) return;
      abortCrawl(crawlId);
    });
  });
}
