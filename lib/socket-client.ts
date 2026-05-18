"use client";

import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";
    socket = io(origin, {
      path: "/api/socket",
      autoConnect: false,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 8,
      reconnectionDelay: 500,
    });
  }
  return socket;
}
