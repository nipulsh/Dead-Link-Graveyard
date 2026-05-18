import puppeteer from "puppeteer";
import { emitToCrawlRoom } from "@/lib/socket/emit-crawl";
import { SOCKET_EVENTS } from "@/types/socket-events";
import type {
  CrawlCompletePayload,
  CrawlPageCrawledPayload,
  CrawlPageFoundPayload,
  CrawlResourceType,
  CrawlStatsSnapshot,
  NodeStatusCategory,
} from "@/types/socket-events";
import {
  MAX_DISCOVERED_URLS,
  PAGE_NAVIGATION_TIMEOUT_MS,
  RESOURCE_FETCH_CONCURRENCY,
} from "@/lib/crawler/constants";
import { extractResourcesFromPage } from "@/lib/crawler/extract-resources";
import { urlToNodeId } from "@/lib/crawler/node-id";
import {
  checkResourceStatus,
  mapWithConcurrency,
} from "@/lib/crawler/resource-status";
import { normalizeUrl } from "@/lib/crawler/url-utils";

type QueueItem = { url: string; depth: number; parentUrl: string | null };

export type RunCrawlArgs = {
  crawlId: string;
  seedUrl: string;
  maxDepth: number;
  maxPages: number;
  signal: AbortSignal;
};

function emptyStats(): CrawlStatsSnapshot {
  return {
    totalFound: 0,
    totalPagesCrawled: 0,
    ok2xx: 0,
    notFound404: 0,
    serverError5xx: 0,
    redirects3xx: 0,
  };
}

function bumpStats(stats: CrawlStatsSnapshot, status: number) {
  if (status >= 200 && status < 300) stats.ok2xx += 1;
  else if (status === 404) stats.notFound404 += 1;
  else if (status >= 500) stats.serverError5xx += 1;
  else if (status >= 300 && status < 400) stats.redirects3xx += 1;
}

export async function runPuppeteerCrawl(
  args: RunCrawlArgs,
): Promise<{
  stats: CrawlStatsSnapshot;
  reason: CrawlCompletePayload["reason"];
}> {
  const { crawlId, seedUrl, maxDepth, maxPages, signal } = args;
  const stats = emptyStats();

  const graphUrls = new Set<string>();
  const resolvedStatus = new Set<string>();
  const queuedOrScheduledPages = new Set<string>();
  const processedPages = new Set<string>();

  const queue: QueueItem[] = [];

  const seedNorm = normalizeUrl(seedUrl);
  if (!seedNorm) {
    emitToCrawlRoom(crawlId, SOCKET_EVENTS.ERROR, {
      crawlId,
      message: "Invalid seed URL after normalization",
    });
    const reason = emitComplete(crawlId, stats, "finished", signal);
    return { stats: { ...stats }, reason };
  }

  const seedOrigin = new URL(seedNorm).origin;

  function announce(
    url: string,
    parentUrl: string | null,
    depth: number,
    resourceType: CrawlResourceType,
  ) {
    if (graphUrls.size >= MAX_DISCOVERED_URLS && !graphUrls.has(url)) {
      return false;
    }
    const isNew = !graphUrls.has(url);
    if (isNew) {
      graphUrls.add(url);
      stats.totalFound += 1;
    }

    const nodeId = urlToNodeId(url);
    const parentNodeId = parentUrl ? urlToNodeId(parentUrl) : null;
    const edgeId =
      parentNodeId === null
        ? `root-${nodeId}`
        : `${parentNodeId}->${nodeId}`;

    const payload: CrawlPageFoundPayload = {
      crawlId,
      parentUrl,
      url,
      nodeId,
      parentNodeId,
      resourceType,
      depth,
      edgeId,
      isNewNode: isNew,
    };
    emitToCrawlRoom(crawlId, SOCKET_EVENTS.PAGE_FOUND, payload);
    return true;
  }

  function emitResolved(
    url: string,
    discoveredOn: string,
    resourceType: CrawlResourceType,
    status: number,
    category: NodeStatusCategory,
    finalUrl?: string,
  ) {
    if (resolvedStatus.has(url)) return;
    resolvedStatus.add(url);

    const payload: CrawlPageCrawledPayload = {
      crawlId,
      url,
      nodeId: urlToNodeId(url),
      status,
      category,
      finalUrl,
      discoveredOn,
      resourceType,
    };
    emitToCrawlRoom(crawlId, SOCKET_EVENTS.PAGE_CRAWLED, payload);
    bumpStats(stats, status);
  }

  function enqueuePage(url: string, depth: number, parentUrl: string | null) {
    if (signal.aborted) return;
    if (depth > maxDepth) return;
    if (processedPages.has(url) || queuedOrScheduledPages.has(url)) return;
    try {
      if (new URL(url).origin !== seedOrigin) return;
    } catch {
      return;
    }

    queuedOrScheduledPages.add(url);
    queue.push({ url, depth, parentUrl });
  }

  announce(seedNorm, null, 0, "document");
  enqueuePage(seedNorm, 0, null);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to launch browser";
    emitToCrawlRoom(crawlId, SOCKET_EVENTS.ERROR, { crawlId, message });
    const reason = emitComplete(crawlId, stats, "finished", signal);
    return { stats: { ...stats }, reason };
  }

  let completeReason: CrawlCompletePayload["reason"] = "finished";

  try {
    while (queue.length > 0 && !signal.aborted) {
      if (processedPages.size >= maxPages) {
        completeReason = "limit_pages";
        break;
      }
      if (graphUrls.size >= MAX_DISCOVERED_URLS) {
        completeReason = "limit_discovered";
        break;
      }

      const item = queue.shift()!;
      const { url: pageUrl, depth, parentUrl } = item;

      if (processedPages.has(pageUrl)) continue;
      processedPages.add(pageUrl);
      stats.totalPagesCrawled += 1;

      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(PAGE_NAVIGATION_TIMEOUT_MS);

      let documentStatus = 0;
      let documentCategory: NodeStatusCategory = "unknown";

      try {
        const response = await page.goto(pageUrl, {
          waitUntil: "domcontentloaded",
          timeout: PAGE_NAVIGATION_TIMEOUT_MS,
        });
        documentStatus = response?.status() ?? 0;
        documentCategory = categorize(documentStatus);

        emitResolved(
          pageUrl,
          pageUrl,
          "document",
          documentStatus,
          documentCategory,
          response?.url(),
        );
      } catch {
        emitResolved(pageUrl, pageUrl, "document", 0, "unknown");
      }

      let extracted;
      try {
        extracted = await extractResourcesFromPage(page, pageUrl);
      } catch {
        extracted = {
          anchors: [],
          images: [],
          scripts: [],
          stylesheets: [],
        };
      } finally {
        await page.close().catch(() => undefined);
      }

      type Tagged = { url: string; type: CrawlResourceType };
      const tagged: Tagged[] = [
        ...extracted.anchors.map((u) => ({ url: u, type: "anchor" as const })),
        ...extracted.images.map((u) => ({ url: u, type: "image" as const })),
        ...extracted.scripts.map((u) => ({ url: u, type: "script" as const })),
        ...extracted.stylesheets.map((u) => ({
          url: u,
          type: "stylesheet" as const,
        })),
      ];

      const uniqueByUrl = new Map<string, CrawlResourceType>();
      for (const t of tagged) {
        if (!uniqueByUrl.has(t.url)) uniqueByUrl.set(t.url, t.type);
      }

      const urlsNeedingFetch: { url: string; type: CrawlResourceType }[] = [];

      for (const [u, type] of uniqueByUrl) {
        if (u === pageUrl) continue;

        let sameOriginAnchor = false;
        try {
          sameOriginAnchor =
            type === "anchor" && new URL(u).origin === seedOrigin;
        } catch {
          sameOriginAnchor = false;
        }

        const willVisitWithPuppeteer =
          sameOriginAnchor &&
          depth + 1 <= maxDepth &&
          processedPages.size < maxPages &&
          !processedPages.has(u);

        announce(u, pageUrl, depth + 1, type);

        if (willVisitWithPuppeteer) {
          enqueuePage(u, depth + 1, pageUrl);
          continue;
        }

        if (!resolvedStatus.has(u)) {
          urlsNeedingFetch.push({ url: u, type });
        }
      }

      if (urlsNeedingFetch.length > 0) {
        await mapWithConcurrency(
          urlsNeedingFetch,
          RESOURCE_FETCH_CONCURRENCY,
          async ({ url: u, type }) => {
            if (signal.aborted) return;
            if (resolvedStatus.has(u)) return;
            const { status, category, finalUrl } = await checkResourceStatus(
              u,
              signal,
            );
            emitResolved(u, pageUrl, type, status, category, finalUrl);
          },
          signal,
        );
      }
    }

    if (signal.aborted) completeReason = "aborted";
  } catch (e) {
    const message = e instanceof Error ? e.message : "Crawl failed";
    emitToCrawlRoom(crawlId, SOCKET_EVENTS.ERROR, {
      crawlId,
      message,
    });
  } finally {
    await browser.close().catch(() => undefined);
  }

  const finalReason = emitComplete(crawlId, stats, completeReason, signal);
  return { stats: { ...stats }, reason: finalReason };
}

function categorize(status: number): NodeStatusCategory {
  if (status === 0) return "unknown";
  if (status >= 200 && status < 300) return "success";
  if (status >= 300 && status < 400) return "redirect";
  if (status === 404) return "not_found";
  if (status >= 500) return "server_error";
  if (status >= 400) return "client_error";
  return "unknown";
}

function emitComplete(
  crawlId: string,
  stats: CrawlStatsSnapshot,
  reason: CrawlCompletePayload["reason"],
  signal: AbortSignal,
): CrawlCompletePayload["reason"] {
  const finalReason =
    signal.aborted && reason === "finished" ? "aborted" : reason;
  emitToCrawlRoom(crawlId, SOCKET_EVENTS.COMPLETE, {
    crawlId,
    reason: finalReason,
    stats: { ...stats },
  });
  return finalReason;
}
