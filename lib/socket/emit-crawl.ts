import type { SocketEventName } from "@/types/socket-events";
import { tryGetSocketIOServer } from "@/lib/socket-server";
import { crawlRoomName } from "@/lib/socket/rooms";

export function emitToCrawlRoom<TPayload>(
  crawlId: string,
  event: SocketEventName,
  payload: TPayload,
): void {
  const io = tryGetSocketIOServer();
  if (!io) {
    console.warn("[socket] emit skipped — IO not initialized", event);
    return;
  }
  io.to(crawlRoomName(crawlId)).emit(event, payload);
}
