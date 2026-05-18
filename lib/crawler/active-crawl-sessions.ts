import type { CrawlStartPayload } from "@/types/socket-events";

const sessions = new Map<string, CrawlStartPayload>();

export function registerActiveCrawlSession(
  crawlId: string,
  payload: CrawlStartPayload,
): void {
  sessions.set(crawlId, payload);
}

export function unregisterActiveCrawlSession(crawlId: string): void {
  sessions.delete(crawlId);
}

export function getActiveCrawlSession(
  crawlId: string,
): CrawlStartPayload | undefined {
  return sessions.get(crawlId);
}
