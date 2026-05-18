import type { Server as SocketIOServer } from "socket.io";

declare global {
  // eslint-disable-next-line no-var -- intentional global for custom server bridge
  var __deadLinkGraveyardIO: SocketIOServer | undefined;
}

export function setSocketIOServer(io: SocketIOServer) {
  globalThis.__deadLinkGraveyardIO = io;
}

export function clearSocketIOServer() {
  globalThis.__deadLinkGraveyardIO = undefined;
}

export function getSocketIOServer(): SocketIOServer {
  const io = globalThis.__deadLinkGraveyardIO;
  if (!io) {
    throw new Error(
      "Socket.IO server is not running. Start the app with `npm run dev` or `npm start` (custom server).",
    );
  }
  return io;
}

export function tryGetSocketIOServer(): SocketIOServer | undefined {
  return globalThis.__deadLinkGraveyardIO;
}
