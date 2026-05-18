import { emitToCrawlRoom } from "@/lib/socket/emit-crawl";
import { SOCKET_EVENTS } from "@/types/socket-events";
import type { CrawlStartPayload } from "@/types/socket-events";
import {
  registerCrawlAbort,
  unregisterCrawl,
} from "@/lib/crawler/running-crawls";
import { runPuppeteerCrawl } from "@/lib/crawler/run-crawl";
import {
  DEFAULT_MAX_DEPTH,
  DEFAULT_MAX_PAGES,
} from "@/lib/crawler/constants";
import { connectMongo } from "@/lib/db/connect";
import { persistCrawlResult } from "@/lib/db/persist-crawl";
import {
  registerActiveCrawlSession,
  unregisterActiveCrawlSession,
} from "@/lib/crawler/active-crawl-sessions";

export type StartCrawlerInput = {
  crawlId: string;
  url: string;
  maxDepth?: number;
  maxPages?: number;
};

export async function startCrawler(input: StartCrawlerInput): Promise<void> {
  const { crawlId, url } = input;
  const maxDepth = Math.min(
    Math.max(0, input.maxDepth ?? DEFAULT_MAX_DEPTH),
    12,
  );
  const maxPages = Math.min(
    Math.max(1, input.maxPages ?? DEFAULT_MAX_PAGES),
    500,
  );

  void connectMongo().catch(() => undefined);

  const { signal } = registerCrawlAbort(crawlId);

  await new Promise((resolve) => setTimeout(resolve, 75));

  const startPayload: CrawlStartPayload = {
    crawlId,
    seedUrl: url,
    maxDepth,
    maxPages,
  };
  registerActiveCrawlSession(crawlId, startPayload);
  emitToCrawlRoom(crawlId, SOCKET_EVENTS.CRAWL_START, startPayload);

  try {
    const { stats, reason } = await runPuppeteerCrawl({
      crawlId,
      seedUrl: url,
      maxDepth,
      maxPages,
      signal,
    });
    await persistCrawlResult({ crawlId, seedUrl: url, stats, reason });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Crawl failed";
    emitToCrawlRoom(crawlId, SOCKET_EVENTS.ERROR, { crawlId, message });
  } finally {
    unregisterActiveCrawlSession(crawlId);
    unregisterCrawl(crawlId);
  }
}
