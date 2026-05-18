"use client";

import { io, type Socket } from "socket.io-client";
import { getPublicSocketUrl } from "@/lib/public-runtime";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const origin = getPublicSocketUrl();
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
