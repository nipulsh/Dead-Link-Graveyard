/** Marks a crawl id we just started from the home page (sessionStorage) for optimistic UI. */
export const PENDING_CRAWL_SESSION_KEY = "dlg_pending_crawl";

export function markPendingCrawl(crawlId: string): void {
  try {
    sessionStorage.setItem(PENDING_CRAWL_SESSION_KEY, crawlId);
  } catch {
    /* private mode / SSR */
  }
}

export function clearPendingCrawl(): void {
  try {
    sessionStorage.removeItem(PENDING_CRAWL_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function isPendingCrawl(crawlId: string): boolean {
  try {
    return sessionStorage.getItem(PENDING_CRAWL_SESSION_KEY) === crawlId;
  } catch {
    return false;
  }
}
