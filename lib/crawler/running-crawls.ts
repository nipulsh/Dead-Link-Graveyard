const controllers = new Map<string, AbortController>();

export function registerCrawlAbort(crawlId: string): AbortController {
  const next = new AbortController();
  controllers.set(crawlId, next);
  return next;
}

export function abortCrawl(crawlId: string): void {
  controllers.get(crawlId)?.abort();
}

export function unregisterCrawl(crawlId: string): void {
  controllers.delete(crawlId);
}
